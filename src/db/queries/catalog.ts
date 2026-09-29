import { and, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
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
  pricePaise: products.pricePaise,
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

// Cached per request: generateMetadata and the page both look the category up.
export const getCategoryBySlug = cache(async (slug: string) => {
  const [row] = await db
    .select({ slug: categories.slug, name: categories.name })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return row;
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

// Every word must appear (case-insensitively) in the name, type, colour,
// category or description. LIKE wildcards in the query are matched literally.
export async function searchProducts(query: string, limit = 48) {
  const terms = query.trim().split(/\s+/).filter(Boolean).slice(0, 8);
  if (terms.length === 0) return [];
  const conditions = terms.map((term) => {
    const pattern = `%${term.replace(/[\\%_]/g, "\\$&")}%`;
    return or(
      ilike(products.name, pattern),
      ilike(products.productType, pattern),
      ilike(products.colour, pattern),
      ilike(categories.name, pattern),
      ilike(products.description, pattern),
    );
  });
  const rows = await selectProducts()
    .where(and(...conditions))
    .orderBy(desc(products.createdAt))
    .limit(limit);
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

// Current price and stock for the bag. Unknown ids are simply absent.
export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await selectProducts().where(inArray(products.id, ids));
  return rows.map(toProduct);
}
