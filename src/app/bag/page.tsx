import type { Metadata } from "next";
import Link from "next/link";
import { BagLine } from "@/components/bag/bag-line";
import { BagSummary } from "@/components/bag/bag-summary";
import { getProductsByIds } from "@/db/queries/catalog";
import { readBag } from "@/lib/bag-cookie";
import { buildBag } from "@/lib/cart";

// Prices and stock must be current, and nothing may query the database at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your bag | Luxury Store",
  robots: { index: false },
};

export default async function BagPage() {
  const entries = await readBag();
  const products = await getProductsByIds(entries.map((entry) => entry.productId));
  // Quantities are clamped to current stock for display; the cookie itself is
  // corrected by the next bag action (server components can't set cookies).
  const bag = buildBag(entries, products);

  return (
    <main className="container-page pt-4 pb-section lg:pt-6">
      <nav aria-label="Breadcrumb" className="type-caption mb-8 text-muted lg:mb-10">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="link-subtle">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            Bag
          </li>
        </ol>
      </nav>

      {bag.lines.length === 0 ? (
        <div className="mx-auto flex max-w-prose flex-col items-center py-12 text-center lg:py-20">
          <h1 className="type-title-l mb-4">Your bag is empty</h1>
          <p className="type-body mb-8 text-muted">
            Pieces you add to your bag will appear here.
          </p>
          <Link href="/collections/new-in" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <h1 className="type-title-l mb-6 lg:mb-10">
            Your bag <span className="text-muted">({bag.lines.length})</span>
          </h1>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
            <ul className="border-t border-divider">
              {bag.lines.map((line) => (
                <BagLine key={line.product.id} line={line} />
              ))}
            </ul>
            <div>
              <BagSummary bag={bag} />
              <Link href="/collections/new-in" className="type-cta link-underline mt-6 inline-block">
                Continue shopping
              </Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
