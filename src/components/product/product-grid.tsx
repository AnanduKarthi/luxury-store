import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/catalog";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid-products">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
