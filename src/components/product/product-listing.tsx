import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import type { Product } from "@/lib/catalog";

// Full-page product listing used by the collection pages: breadcrumb,
// heading with item count, and the product grid (or an empty state).
export function ProductListing({
  eyebrow,
  title,
  products,
}: {
  eyebrow?: string;
  title: string;
  products: Product[];
}) {
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
            {title}
          </li>
        </ol>
      </nav>

      <header className="mb-8 flex items-end justify-between gap-6 lg:mb-10">
        <div>
          {eyebrow && <p className="type-caption mb-2 text-muted">{eyebrow}</p>}
          <h1 className="type-title-l">{title}</h1>
        </div>
        <p className="type-caption shrink-0 text-muted">
          {products.length} {products.length === 1 ? "item" : "items"}
        </p>
      </header>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="mb-8 max-w-prose text-muted">
            New pieces are on their way. Check back soon.
          </p>
          <Link href="/" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      )}
    </main>
  );
}
