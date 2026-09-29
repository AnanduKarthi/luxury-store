import { and, desc, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, stock, stripeEvents } from "@/db/schema";
import type { OrderShipping } from "@/lib/orders";
import type { CheckoutSession } from "@/lib/stripe";

// Order state lives here. Every transition out of "pending" is a conditional
// update, so replayed webhooks, the success page and the sweeper can all call
// these concurrently without paying twice or restocking twice.

export type NewOrderLine = {
  productId: string;
  productName: string;
  productSlug: string;
  unitPricePaise: number;
  quantity: number;
};

export class SoldOutError extends Error {
  constructor() {
    super("A piece in the bag sold out during checkout.");
  }
}

// Postgres error code, whether drizzle wrapped the driver error or not.
function pgCode(error: unknown): string | undefined {
  for (let e = error; e && typeof e === "object"; e = (e as { cause?: unknown }).cause) {
    const code = (e as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return undefined;
}

// Creates a pending order and reserves its stock in one transaction.
//
// Missing stock rows (sold out) are first created at 0, then every line is
// decremented in one statement. If any line would go below zero,
// stock_quantity_non_negative rejects it and the whole batch rolls back, so
// concurrent checkouts for the last piece can't both succeed.
export async function createPendingOrder(input: {
  userId: string;
  email: string;
  lines: NewOrderLine[];
  reservedUntil: Date;
}) {
  const id = crypto.randomUUID();
  const subtotalPaise = input.lines.reduce(
    (sum, line) => sum + line.unitPricePaise * line.quantity,
    0,
  );
  try {
    const wanted = sql.join(
      input.lines.map((line) => sql`(${line.productId}::uuid, ${line.quantity}::int)`),
      sql`, `,
    );
    const [, , [order]] = await db.batch([
      db
        .insert(stock)
        .values(input.lines.map((line) => ({ productId: line.productId, quantity: 0 })))
        .onConflictDoNothing(),
      db.execute(sql`
        update ${stock} set quantity = ${stock}.quantity - wanted.quantity, updated_at = now()
        from (values ${wanted}) as wanted(product_id, quantity)
        where ${stock}.product_id = wanted.product_id
      `),
      db
        .insert(orders)
        .values({
          id,
          userId: input.userId,
          email: input.email,
          subtotalPaise,
          reservedUntil: input.reservedUntil,
        })
        .returning({ id: orders.id, number: orders.number }),
      db.insert(orderItems).values(input.lines.map((line) => ({ orderId: id, ...line }))),
    ]);
    return { ...order, subtotalPaise };
  } catch (error) {
    // 23514: stock would go negative. 23503: the product was deleted.
    const code = pgCode(error);
    if (code === "23514" || code === "23503") throw new SoldOutError();
    throw error;
  }
}

export async function attachCheckoutSession(orderId: string, sessionId: string) {
  await db
    .update(orders)
    .set({ stripeCheckoutSessionId: sessionId })
    .where(and(eq(orders.id, orderId), isNull(orders.stripeCheckoutSessionId)));
}

// pending → expired | failed, returning its stock. A single statement, so the
// status change and the restock commit together; returns false if the order
// wasn't pending (already released, paid, or unknown).
export async function releaseOrder(orderId: string, status: "expired" | "failed") {
  const result = await db.execute<{ released: number }>(sql`
    with released as (
      update ${orders} set status = ${status}, updated_at = now()
      where id = ${orderId} and status = 'pending'
      returning id
    ), restocked as (
      update ${stock} set quantity = ${stock}.quantity + oi.quantity, updated_at = now()
      from ${orderItems} oi join released on released.id = oi.order_id
      where ${stock}.product_id = oi.product_id
      returning 1
    )
    select (select count(*) from released)::int as released, (select count(*) from restocked)::int as restocked
  `);
  return Number(result.rows[0]?.released ?? 0) > 0;
}

function shippingFrom(session: CheckoutSession): OrderShipping {
  const details = session.collected_information?.shipping_details;
  const address = details?.address;
  return {
    name: details?.name ?? session.customer_details?.name ?? null,
    phone: session.customer_details?.phone ?? null,
    address: address
      ? {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postal_code,
          country: address.country,
        }
      : null,
  };
}

export type FulfillResult = "paid" | "unpaid" | "needs_review" | "unknown-order";

// Marks the order paid from a Checkout Session fetched from Stripe (or a
// signature-verified webhook). Never pass anything built from client input.
export async function fulfillOrder(session: CheckoutSession): Promise<FulfillResult> {
  const orderId = session.metadata?.order_id;
  if (!orderId || session.client_reference_id !== orderId) return "unknown-order";

  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  // The session id may be missing if we crashed right after creating the
  // session; the signed metadata still ties the two together.
  if (
    !order ||
    (order.stripeCheckoutSessionId !== null && order.stripeCheckoutSessionId !== session.id)
  ) {
    return "unknown-order";
  }
  if (session.payment_status !== "paid") return "unpaid";

  const sessionMatches = or(
    isNull(orders.stripeCheckoutSessionId),
    eq(orders.stripeCheckoutSessionId, session.id),
  );
  const amountMatches =
    session.currency === order.currency && session.amount_subtotal === order.subtotalPaise;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  if (amountMatches) {
    const updated = await db
      .update(orders)
      .set({
        status: "paid",
        paidAt: sql`now()`,
        amountTotalPaise: session.amount_total,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        shipping: shippingFrom(session),
      })
      .where(and(eq(orders.id, orderId), eq(orders.status, "pending"), sessionMatches))
      .returning({ id: orders.id });
    if (updated.length > 0) return "paid";
  }

  // Already paid by an earlier delivery: nothing to do.
  const [current] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.id, orderId));
  if (current?.status === "paid") return "paid";

  // Paid, but for the wrong amount, or after its stock was released. A human
  // has to decide (fulfil, restock or refund); stock is left as it is.
  console.error(
    `[orders] order ${orderId} needs review: session ${session.id}, status ${current?.status}, ` +
      `charged ${session.amount_subtotal} ${session.currency}, expected ${order.subtotalPaise} ${order.currency}`,
  );
  await db
    .update(orders)
    .set({
      status: "needs_review",
      amountTotalPaise: session.amount_total,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      shipping: shippingFrom(session),
    })
    .where(and(eq(orders.id, orderId), sql`${orders.status} <> 'paid'`));
  return "needs_review";
}

export async function getOrderForUser(orderId: string, userId: string) {
  return db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
    with: { items: true },
  });
}

export async function getOrderBySessionForUser(sessionId: string, userId: string) {
  return db.query.orders.findFirst({
    where: and(eq(orders.stripeCheckoutSessionId, sessionId), eq(orders.userId, userId)),
    with: { items: true },
  });
}

// Orders the customer went on to pay for or that are still in progress;
// abandoned checkouts are hidden.
export async function listOrdersForUser(userId: string) {
  return db.query.orders.findMany({
    where: and(
      eq(orders.userId, userId),
      inArray(orders.status, ["pending", "paid", "failed", "needs_review"]),
    ),
    with: { items: true },
    orderBy: desc(orders.createdAt),
    limit: 50,
  });
}

export async function getPendingOrdersForUser(userId: string) {
  return db
    .select({ id: orders.id, stripeCheckoutSessionId: orders.stripeCheckoutSessionId })
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.status, "pending")));
}

// Pending orders whose reservation ran out before `before`.
export async function getStaleOrders(before: Date, limit = 50) {
  return db
    .select({ id: orders.id, stripeCheckoutSessionId: orders.stripeCheckoutSessionId })
    .from(orders)
    .where(and(eq(orders.status, "pending"), lt(orders.reservedUntil, before)))
    .orderBy(orders.reservedUntil)
    .limit(limit);
}

export async function isEventProcessed(eventId: string) {
  const [row] = await db
    .select({ id: stripeEvents.id })
    .from(stripeEvents)
    .where(eq(stripeEvents.id, eventId))
    .limit(1);
  return Boolean(row);
}

export async function markEventProcessed(eventId: string, type: string) {
  await db.insert(stripeEvents).values({ id: eventId, type }).onConflictDoNothing();
}
