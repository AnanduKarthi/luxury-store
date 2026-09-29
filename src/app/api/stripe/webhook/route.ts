import { fulfillOrder, isEventProcessed, markEventProcessed, releaseOrder } from "@/db/queries/orders";
import { getStripe, type CheckoutSession, type StripeEvent } from "@/lib/stripe";

// Stripe → us. The only inputs trusted here are events whose signature checks
// out. Subscribe the endpoint to exactly the four checkout.session.* events
// handled below.
//
// Deliveries can repeat, overlap and arrive out of order. Processed event ids
// are recorded to skip replays, and every order update is a conditional
// transition, so even two copies processed at once change nothing twice.
// The id is recorded only after processing succeeds: an error returns 500 and
// Stripe retries.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Webhook not configured", { status: 500 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  // The raw body, byte for byte: parsing it first would break the signature.
  const payload = await request.text();
  let event: StripeEvent;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (await isEventProcessed(event.id)) return Response.json({ received: true, duplicate: true });
    await handle(event);
    await markEventProcessed(event.id, event.type);
  } catch (error) {
    console.error(`[stripe webhook] failed to process ${event.type} ${event.id}`, error);
    return new Response("Processing failed", { status: 500 });
  }
  return Response.json({ received: true });
}

// Our sessions carry the order id in both metadata and client_reference_id.
function orderIdOf(session: CheckoutSession) {
  const id = session.metadata?.order_id;
  return id && UUID.test(id) && session.client_reference_id === id ? id : undefined;
}

async function handle(event: StripeEvent) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      if (!orderIdOf(event.data.object)) return;
      // Re-read the session so we act on its current state, not a snapshot
      // from whenever this delivery was queued.
      const session = await getStripe().checkout.sessions.retrieve(event.data.object.id);
      const result = await fulfillOrder(session);
      if (result === "unknown-order") {
        console.warn(`[stripe webhook] ${event.type}: no matching order for session ${session.id}`);
      }
      return;
    }
    case "checkout.session.async_payment_failed": {
      const orderId = orderIdOf(event.data.object);
      if (orderId) await releaseOrder(orderId, "failed");
      return;
    }
    case "checkout.session.expired": {
      const orderId = orderIdOf(event.data.object);
      if (orderId) await releaseOrder(orderId, "expired");
      return;
    }
    default:
      // Not subscribed to anything else; ignore rather than fail.
      return;
  }
}
