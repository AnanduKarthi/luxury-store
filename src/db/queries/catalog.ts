import { desc, eq, ne, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { categories, products, stock } from "@/db/schema";
import type { Product } from "@/lib/catalog";

const productColumns = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  productType: products.productType,
  categorySlug: categories.slug,
  categoryName: categories.name,
  priceCents: products.priceCents,
  images: products.images,
  badge: products.badge,
  quantity: stock.quantity,
  colour: products.colour,
  description: products.description,
  details: products.details,
};

const selectProducts = () =>
  db
    .select(productColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .$dynamic();

type ProductRow = Awaited<ReturnType<typeof selectProducts>>[number];

const toProduct = ({
  categorySlug,
  categoryName,
  quantity,
  ...row
}: ProductRow): Product => ({
  ...row,
  category: { slug: categorySlug, name: categoryName },
  stock: quantity ?? 0,
});

// Cached per request: generateMetadata and the page both look the product up.
export const getProductBySlug = cache(async (slug: string) => {
  const [row] = await selectProducts().where(eq(products.slug, slug)).limit(1);
  return row ? toProduct(row) : undefined;
});

export async function getNewArrivals(limit = 8) {
  const rows = await selectProducts().orderBy(desc(products.createdAt)).limit(limit);
  return rows.map(toProduct);
}

export async function getProductsByCategory(slug: string, limit?: number) {
  const query = selectProducts()
    .where(eq(categories.slug, slug))
    .orderBy(desc(products.createdAt));
  const rows = await (limit ? query.limit(limit) : query);
  return rows.map(toProduct);
}

// Same category first, then everything else; newest first within each group.
export async function getRelatedProducts(product: Product, limit = 8) {
  const rows = await selectProducts()
    .where(ne(products.id, product.id))
    .orderBy(
      desc(sql`${categories.slug} = ${product.category.slug}`),
      desc(products.createdAt),
    )
    .limit(limit);
  return rows.map(toProduct);
}
