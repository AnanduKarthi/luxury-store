import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Categories are the storefront collections (/collections/<slug>).
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    // Display label shown above the product name, e.g. "Handbags".
    productType: text("product_type").notNull(),
    // Whole cents, USD.
    priceCents: integer("price_cents").notNull(),
    colour: text("colour").notNull(),
    description: text("description").notNull(),
    details: text("details").array().notNull().default(sql`'{}'::text[]`),
    // 3:4 crops; the first is the primary image.
    images: text("images").array().notNull().default(sql`'{}'::text[]`),
    badge: text("badge"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check("products_price_cents_non_negative", sql`${table.priceCents} >= 0`),
    index("products_category_id_idx").on(table.categoryId),
    index("products_created_at_idx").on(table.createdAt),
  ],
);

// One row per product. A product without a row is treated as sold out.
export const stock = pgTable(
  "stock",
  {
    productId: uuid("product_id")
      .primaryKey()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [check("stock_quantity_non_negative", sql`${table.quantity} >= 0`)],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  stock: one(stock),
}));

export const stockRelations = relations(stock, ({ one }) => ({
  product: one(products, {
    fields: [stock.productId],
    references: [products.id],
  }),
}));
