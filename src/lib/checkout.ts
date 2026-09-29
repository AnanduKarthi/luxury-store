import { fulfillOrder, releaseOrder } from "@/db/queries/orders";
import { getStripe } from "@/lib/stripe";

// Server-only glue between Stripe and the order queries, shared by the
// checkout action, the cancel route and the stale-order sweeper.

// Ends a pending order's checkout and returns its stock. The Stripe session is
// expired first, so it can't be paid after the stock is released. A session
// that already completed is fulfilled instead (or, if an async payment is
// still in flight, left holding its stock until the webhook settles it).
//
// An order without a session id must only be passed here once its
// reservation time has passed: any session created for it has expired by then.
export async function cancelCheckout(order: { id: string; stripeCheckoutSessionId: string | null }) {
  if (order.stripeCheckoutSessionId) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);
    if (session.status === "complete") {
      await fulfillOrder(session);
      return;
    }
    if (session.status === "open") {
      await stripe.checkout.sessions.expire(session.id);
    }
  }
  await releaseOrder(order.id, "expired");
}
