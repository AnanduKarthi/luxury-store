"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProductsByIds } from "@/db/queries/catalog";
import {
  attachCheckoutSession,
  createPendingOrder,
  getPendingOrdersForUser,
  releaseOrder,
  SoldOutError,
} from "@/db/queries/orders";
import { readBag } from "@/lib/bag-cookie";
import { buildBag } from "@/lib/cart";
import { cancelCheckout } from "@/lib/checkout";
import { RESERVATION_MINUTES } from "@/lib/orders";
import { requireSession } from "@/lib/session";
import { getStripe, siteUrl } from "@/lib/stripe";

export type CheckoutState = { error?: string };

const UNAVAILABLE = "We couldn’t start checkout. Nothing has been charged. Please try again in a moment.";

// Tags these sessions in the Stripe Dashboard.
const INTEGRATION_IDENTIFIER = "luxury-store-checkout-qvtmhxra";

// Server actions are public endpoints: everything here is re-derived on the
// server. The client sends nothing but the click; the bag cookie supplies
// product ids and quantities, and prices and stock come from the database.
export async function startCheckout(): Promise<CheckoutState> {
  const { user } = await requireSession("/bag");
  // Any failure becomes a message for the bag page rather than an uncaught
  // error in the browser. redirect() stays outside, as it works by throwing.
  const result = await createCheckout(user).catch((error: unknown) => {
    console.error("[checkout] could not start checkout", error);
    return { error: UNAVAILABLE };
  });
  if ("url" in result) redirect(result.url);
  return result;
}

async function createCheckout(user: {
  id: string;
  email: string;
}): Promise<CheckoutState | { url: string }> {
  // One checkout at a time per customer: end any earlier one so its stock
  // isn't held twice. Orders still without a session may be mid-creation in
  // another tab; the sweeper releases those if they're abandoned.
  const previous = await getPendingOrdersForUser(user.id);
  for (const order of previous) {
    if (!order.stripeCheckoutSessionId) continue;
    try {
      await cancelCheckout(order);
    } catch (error) {
      console.error(`[checkout] could not cancel order ${order.id}`, error);
    }
  }

  const entries = await readBag();
  const bag = buildBag(entries, await getProductsByIds(entries.map((entry) => entry.productId)));
  if (bag.lines.length === 0) return { error: "Your bag is empty." };
  // Lines over stock are already shown at the reduced quantity, which is what
  // gets ordered; sold-out lines must be removed first.
  if (bag.hasUnavailable) {
    revalidatePath("/bag");
    return { error: "A piece in your bag has sold out. Remove it to check out." };
  }

  const reservedUntil = new Date(Date.now() + RESERVATION_MINUTES * 60_000);
  let order;
  try {
    order = await createPendingOrder({
      userId: user.id,
      email: user.email,
      reservedUntil,
      lines: bag.lines.map((line) => ({
        productId: line.product.id,
        productName: line.product.name,
        productSlug: line.product.slug,
        unitPricePaise: line.product.pricePaise,
        quantity: line.quantity,
      })),
    });
  } catch (error) {
    if (error instanceof SoldOutError) {
      revalidatePath("/bag");
      return { error: "A piece in your bag has just sold out. Please review your bag." };
    }
    throw error;
  }

  let sessionId: string | undefined;
  try {
    const origin = siteUrl();
    const session = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        // No payment_method_types: methods are managed in the Dashboard.
        line_items: bag.lines.map((line) => ({
          quantity: line.quantity,
          price_data: {
            currency: "inr",
            unit_amount: line.product.pricePaise,
            product_data: {
              name: line.product.name,
              images: line.product.images.slice(0, 1),
              metadata: { product_id: line.product.id },
            },
          },
        })),
        client_reference_id: order.id,
        metadata: { order_id: order.id },
        payment_intent_data: { metadata: { order_id: order.id } },
        customer_email: user.email,
        shipping_address_collection: { allowed_countries: ["IN"] },
        phone_number_collection: { enabled: true },
        expires_at: Math.floor(reservedUntil.getTime() / 1000),
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
        integration_identifier: INTEGRATION_IDENTIFIER,
      },
      { idempotencyKey: `checkout:${order.id}` },
    );
    sessionId = session.id;
    if (!session.url) throw new Error(`Checkout Session ${session.id} has no URL`);
    await attachCheckoutSession(order.id, session.id);
    return { url: session.url };
  } catch (error) {
    console.error(`[checkout] could not start checkout for order ${order.id}`, error);
    // No session was handed to the customer, so the stock can go straight
    // back once any session that was created can no longer be paid.
    if (sessionId) await getStripe().checkout.sessions.expire(sessionId).catch(() => {});
    await releaseOrder(order.id, "expired");
    return { error: UNAVAILABLE };
  }
}
