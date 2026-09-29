import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import type { Bag } from "@/lib/cart";
import { RESERVATION_MINUTES } from "@/lib/orders";
import { CheckoutButton } from "./checkout-button";

export type CheckoutNotice = "cancelled";

type BagSummaryProps = {
  bag: Bag;
  signedIn: boolean;
  notice?: CheckoutNotice;
};

export function BagSummary({ bag, signedIn, notice }: BagSummaryProps) {
  const canCheckout = !bag.hasUnavailable && bag.itemCount > 0;

  return (
    <section aria-labelledby="summary-heading" className="bg-canvas p-6 lg:sticky lg:top-36">
      <h2 id="summary-heading" className="type-title-s mb-6">
        Summary
      </h2>

      {notice === "cancelled" && (
        <p role="status" className="type-body mb-6 border-l-2 border-warning pl-3 text-warning">
          Checkout was cancelled and you haven’t been charged. Your pieces are still in your bag.
        </p>
      )}

      <dl className="type-body flex flex-col gap-3">
        <div className="flex justify-between gap-4">
          <dt>
            Subtotal ({bag.itemCount} {bag.itemCount === 1 ? "item" : "items"})
          </dt>
          <dd className="tabular-nums">{formatPrice(bag.subtotalPaise)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Shipping within India</dt>
          <dd>Complimentary</dd>
        </div>
        <div className="type-body-strong flex justify-between gap-4 border-t border-divider pt-4">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(bag.subtotalPaise)}</dd>
        </div>
      </dl>

      {bag.hasUnavailable && (
        <p className="type-body mt-6 border-l-2 border-error pl-3 text-error">
          Sold-out pieces aren’t included in your total. Remove them to check out.
        </p>
      )}

      {signedIn ? (
        <CheckoutButton disabled={!canCheckout} />
      ) : (
        <div className="mt-6">
          <Link href="/sign-in?next=%2Fbag" className="btn btn-primary w-full">
            Sign in to check out
          </Link>
          <p className="type-body mt-3 text-muted">
            New here?{" "}
            <Link href="/sign-up?next=%2Fbag" className="link-underline">
              Create an account
            </Link>
            . Your bag will be kept.
          </p>
        </div>
      )}

      <ul className="type-caption mt-6 flex flex-col gap-2 text-muted">
        <li>Secure payment by card, handled by Stripe.</li>
        <li>Pieces are held for {RESERVATION_MINUTES} minutes while you pay.</li>
      </ul>
    </section>
  );
}
