import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, stock } from "@/db/schema";

// Callers must check requireAdmin() first; these queries do no auth.

export async function getStockLevels() {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      quantity: stock.quantity,
    })
    .from(products)
    .leftJoin(stock, eq(stock.productId, products.id))
    .orderBy(asc(products.name));
  return rows.map((row) => ({ ...row, quantity: row.quantity ?? 0 }));
}

export async function setStockQuantity(productId: string, quantity: number) {
  const [row] = await db
    .insert(stock)
    .values({ productId, quantity })
    .onConflictDoUpdate({ target: stock.productId, set: { quantity, updatedAt: sql`now()` } })
    .returning({ productId: stock.productId });
  return row;
}
