import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusSync } from "@/components/orders/order-status-sync";
import { OrderSummary } from "@/components/orders/order-summary";
import { Spinner } from "@/components/ui/spinner";
import { fulfillOrder, getOrderBySessionForUser } from "@/db/queries/orders";
import { formatOrderNumber } from "@/lib/orders";
import { requireSession } from "@/lib/session";
import { getStripe } from "@/lib/stripe";

// Order status must be current, and nothing may query the database at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmation | Luxury Store",
  robots: { index: false },
};

// Stripe's success_url. Arriving here proves nothing: the session id only
// picks the order (which must be the signed-in customer's), and payment is
// confirmed by asking Stripe, never from the URL.
export default async function CheckoutSuccessPage(props: PageProps<"/checkout/success">) {
  const { session_id: sessionId } = await props.searchParams;
  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) notFound();

  const { user } = await requireSession(
    `/checkout/success?session_id=${encodeURIComponent(sessionId)}`,
  );
  let order = await getOrderBySessionForUser(sessionId, user.id);
  if (!order) notFound();

  // The webhook may not have arrived yet; confirm with Stripe directly. Same
  // idempotent path as the webhook, so whichever comes second is a no-op.
  if (order.status === "pending") {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.status === "complete" && (await fulfillOrder(session)) !== "unpaid") {
        order = (await getOrderBySessionForUser(sessionId, user.id)) ?? order;
      }
    } catch (error) {
      console.error(`[checkout] could not confirm session ${sessionId}`, error);
    }
  }

  const number = formatOrderNumber(order.number);
  const copy =
    order.status === "paid"
      ? {
          title: "Thank you for your order",
          body: `Order ${number} is confirmed. A receipt is on its way to ${order.email}.`,
        }
      : order.status === "pending"
        ? {
            title: "Confirming your payment",
            body: "This usually takes a few seconds. This page will update on its own.",
          }
        : order.status === "needs_review"
          ? {
              title: "We’re reviewing your order",
              body: `Your payment for order ${number} was received, and our team will be in touch shortly.`,
            }
          : {
              title: order.status === "failed" ? "Your payment didn’t go through" : "Checkout was not completed",
              body: "You haven’t been charged. Your pieces are still in your bag if you’d like to try again.",
            };

  const unpaid = order.status === "expired" || order.status === "failed";

  return (
    <main className="container-page section-y flex-1">
      <div className="mx-auto max-w-prose">
        <OrderStatusSync orderId={order.id} status={order.status} />
        <p className="type-caption mb-2 text-muted">Order {number}</p>
        <h1 className="type-title-l mb-4 flex items-center gap-3">
          {order.status === "pending" && <Spinner />}
          {copy.title}
        </h1>
        <p role="status" className="type-body mb-10 text-muted">
          {copy.body}
        </p>
        <OrderSummary order={order} />
        <div className="mt-8 flex flex-wrap gap-4">
          {unpaid ? (
            <Link href="/bag" className="btn btn-primary">
              Return to your bag
            </Link>
          ) : (
            <Link href="/account/orders" className="btn btn-primary">
              View your orders
            </Link>
          )}
          <Link href="/collections/new-in" className="btn btn-secondary">
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
