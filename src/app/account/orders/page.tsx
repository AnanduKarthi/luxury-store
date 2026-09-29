import type { Metadata } from "next";
import Link from "next/link";
import { OrderSummary } from "@/components/orders/order-summary";
import { listOrdersForUser } from "@/db/queries/orders";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders | Luxury Store",
  robots: { index: false },
};

export default async function OrdersPage() {
  const { user } = await requireSession("/account/orders");
  const orders = await listOrdersForUser(user.id);

  return (
    <section aria-labelledby="orders-heading">
      <h2 id="orders-heading" className="type-title-s mb-4">
        Orders
      </h2>
      {orders.length === 0 ? (
        <div className="border-t border-divider pt-4">
          <p className="type-body mb-6 text-muted">You haven’t placed any orders yet.</p>
          <Link href="/collections/new-in" className="btn btn-primary">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {orders.map((order) => (
            <OrderSummary key={order.id} order={order} headingLevel="h3" />
          ))}
        </div>
      )}
    </section>
  );
}
