import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@/components/icons";
import { formatPrice, getStockStatus, type Product } from "@/lib/catalog";

export function ProductCard({
  product,
  sizes = "(min-width: 64rem) 25vw, (min-width: 48rem) 33vw, 50vw",
}: {
  product: Product;
  sizes?: string;
}) {
  const badge = getStockStatus(product.stock) === "sold-out" ? "Sold out" : product.badge;
  return (
    <article className="group relative">
      <div className="media-frame aspect-product">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes={sizes}
          className="transition-transform duration-(--animate-duration-slow) group-hover:scale-[1.03]"
        />
        {badge && (
          <span className="type-caption absolute top-3 left-3 bg-background/90 px-2 py-1">
            {badge}
          </span>
        )}
      </div>
      <button
        type="button"
        aria-label={`Save ${product.name}`}
        className="btn-icon absolute top-2 right-2 z-10 size-9 bg-background/80 backdrop-blur-sm"
      >
        <HeartIcon />
      </button>
      <div className="flex flex-col gap-1 px-1 pt-3 md:px-0">
        <h3 className="type-body">
          <Link
            href={`/products/${product.slug}`}
            className="after:absolute after:inset-0"
          >
            {product.name}
          </Link>
        </h3>
        <p className="type-body text-muted">{formatPrice(product.priceCents)}</p>
      </div>
    </article>
  );
}
