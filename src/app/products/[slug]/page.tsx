import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBagButton } from "@/components/bag/add-to-bag-button";
import { HeartIcon } from "@/components/icons";
import { SectionHeading } from "@/components/home/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductRail } from "@/components/product/product-rail";
import { StockStatus } from "@/components/product/stock-status";
import { Disclosure } from "@/components/ui/disclosure";
import { getProductBySlug, getRelatedProducts } from "@/db/queries/catalog";
import { formatPrice } from "@/lib/catalog";

// Stock must be current, and nothing may query the database at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} | Luxury Store`,
    description: product.description,
    openGraph: { images: [product.images[0]] },
  };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const soldOut = product.stock <= 0;
  const related = await getRelatedProducts(product);

  return (
    <main>
      <div className="container-page pt-4 lg:pt-6">
        <nav aria-label="Breadcrumb" className="type-caption mb-4 text-muted lg:mb-6">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="link-subtle">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/collections/${product.category.slug}`} className="link-subtle">
                {product.category.name}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {product.productType}
            </li>
          </ol>
        </nav>

        <div className="grid-page gap-y-8">
          <div className="col-span-4 md:col-span-12 lg:col-span-7">
            <ProductGallery images={product.images} alt={product.name} />
          </div>

          <div className="col-span-4 md:col-span-8 md:col-start-3 lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-36">
              <p className="type-caption mb-3 text-muted">{product.productType}</p>
              <h1 className="type-title-m mb-4">{product.name}</h1>
              <p className="type-body-l mb-6">{formatPrice(product.priceCents)}</p>

              <dl className="mb-6 border-t border-divider pt-6">
                <div className="flex gap-2">
                  <dt className="text-muted">Colour:</dt>
                  <dd>{product.colour}</dd>
                </div>
              </dl>

              <div className="mb-8">
                <StockStatus stock={product.stock} />
              </div>

              <div className="flex flex-wrap gap-x-2 gap-y-3">
                {soldOut ? (
                  <button type="button" className="btn btn-primary flex-1" disabled>
                    Sold out
                  </button>
                ) : (
                  <AddToBagButton productId={product.id} />
                )}
                <button
                  type="button"
                  aria-label={`Save ${product.name}`}
                  className="btn btn-secondary px-4"
                >
                  <HeartIcon />
                </button>
              </div>
              {soldOut && (
                <p className="mt-3 text-muted">
                  This piece is currently unavailable. Contact a client advisor
                  to ask about availability in boutique.
                </p>
              )}

              <p className="mt-6 text-muted">
                Complimentary express shipping and returns.
              </p>

              <div className="mt-8 border-t border-divider">
                <Disclosure title="Description" defaultOpen>
                  <p>{product.description}</p>
                </Disclosure>
                <Disclosure title="Details & Care">
                  <ul className="list-disc space-y-1 pl-4">
                    {product.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </Disclosure>
                <Disclosure title="Delivery & Returns">
                  <p>
                    Complimentary express delivery in 2–4 business days. Returns
                    and exchanges are free within 30 days of delivery, in
                    original condition with tags attached.
                  </p>
                </Disclosure>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="container-page section-y overflow-hidden">
        <SectionHeading
          eyebrow="Recommended"
          title="You May Also Like"
          href={`/collections/${product.category.slug}`}
          linkLabel={`Shop ${product.category.name}`}
        />
        <ProductRail label="You may also like">
          {related.map((item) => (
            <li key={item.id}>
              <ProductCard
                product={item}
                sizes="(min-width: 64rem) 25vw, (min-width: 48rem) 33vw, 70vw"
              />
            </li>
          ))}
        </ProductRail>
      </section>
    </main>
  );
}
