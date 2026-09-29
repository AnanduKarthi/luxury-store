import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { OrderShipping } from "@/lib/orders";
import { user } from "./auth";
import { products } from "./catalog";

// pending → paid | expired | failed | needs_review. Only pending orders hold
// reserved stock; every transition out of pending is a conditional update, so
// replays are no-ops (see src/db/queries/orders.ts).
export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "expired",
  "failed",
  "needs_review",
]);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Customer-facing number, shown as "LS-10001".
    number: integer("number").notNull().unique().generatedAlwaysAsIdentity({ startWith: 10001 }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    email: text("email").notNull(),
    status: orderStatus("status").notNull().default("pending"),
    currency: text("currency").notNull().default("inr"),
    // Paise, from our DB prices when checkout started.
    subtotalPaise: integer("subtotal_paise").notNull(),
    // Paise, as charged by Stripe. Set when paid.
    amountTotalPaise: integer("amount_total_paise"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
    // Copied from the Checkout Session when paid.
    shipping: jsonb("shipping").$type<OrderShipping>(),
    // Stock is held until then; matches the Checkout Session's expires_at.
    reservedUntil: timestamp("reserved_until", { withTimezone: true }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check("orders_subtotal_paise_non_negative", sql`${table.subtotalPaise} >= 0`),
    check("orders_amount_total_paise_non_negative", sql`${table.amountTotalPaise} >= 0`),
    index("orders_user_id_created_at_idx").on(table.userId, table.createdAt.desc()),
    index("orders_status_reserved_until_idx").on(table.status, table.reservedUntil),
  ],
);

// Names and prices are snapshots, so orders read the same after the catalogue changes.
export const orderItems = pgTable(
  "order_items",
  {
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    productName: text("product_name").notNull(),
    productSlug: text("product_slug").notNull(),
    unitPricePaise: integer("unit_price_paise").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.orderId, table.productId] }),
    check("order_items_unit_price_paise_non_negative", sql`${table.unitPricePaise} >= 0`),
    check("order_items_quantity_range", sql`${table.quantity} between 1 and 10`),
    index("order_items_product_id_idx").on(table.productId),
  ],
);

// Stripe webhook events that were fully processed, for skipping redeliveries.
export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
