import { formatPrice } from "@/lib/catalog";
import type { Bag } from "@/lib/cart";

export function BagSummary({ bag }: { bag: Bag }) {
  return (
    <section aria-labelledby="summary-heading" className="bg-canvas p-6 lg:sticky lg:top-36">
      <h2 id="summary-heading" className="type-title-s mb-6">
        Summary
      </h2>
      <dl className="type-body flex flex-col gap-3">
        <div className="flex justify-between gap-4">
          <dt>
            Subtotal ({bag.itemCount} {bag.itemCount === 1 ? "item" : "items"})
          </dt>
          <dd className="tabular-nums">{formatPrice(bag.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Shipping</dt>
          <dd>Complimentary</dd>
        </div>
      </dl>
      <p className="type-body mt-3 text-muted">Taxes are calculated at checkout.</p>

      {bag.hasUnavailable && (
        <p className="type-body mt-6 border-l-2 border-error pl-3 text-error">
          Sold-out pieces aren’t included in your subtotal.
        </p>
      )}

      <button type="button" disabled className="btn btn-primary mt-6 w-full">
        Checkout coming soon
      </button>
    </section>
  );
}
