import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import { formatOrderNumber, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders";

type OrderSummaryProps = {
  order: {
    number: number;
    status: OrderStatus;
    createdAt: Date;
    subtotalPaise: number;
    amountTotalPaise: number | null;
    items: { productId: string; productName: string; productSlug: string; unitPricePaise: number; quantity: number }[];
  };
  headingLevel?: "h2" | "h3";
};

export const orderDate = new Intl.DateTimeFormat("en-IN", { dateStyle: "long" });

// An order's pieces and total, from the snapshots taken at checkout.
export function OrderSummary({ order, headingLevel: Heading = "h2" }: OrderSummaryProps) {
  return (
    <section className="border-t border-divider">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
        <Heading className="type-body-strong">Order {formatOrderNumber(order.number)}</Heading>
        <p className="type-caption text-muted">
          {orderDate.format(order.createdAt)} · {ORDER_STATUS_LABELS[order.status]}
        </p>
      </div>
      <ul className="divide-y divide-divider border-y border-divider">
        {order.items.map((item) => (
          <li key={item.productId} className="type-body flex justify-between gap-4 py-3">
            <span className="min-w-0">
              <Link href={`/products/${item.productSlug}`} className="link-subtle">
                {item.productName}
              </Link>
              {item.quantity > 1 && <span className="text-muted"> × {item.quantity}</span>}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatPrice(item.unitPricePaise * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="type-body-strong flex justify-between gap-4 py-4">
        <span>Total</span>
        <span className="tabular-nums">
          {formatPrice(order.amountTotalPaise ?? order.subtotalPaise)}
        </span>
      </div>
    </section>
  );
}
