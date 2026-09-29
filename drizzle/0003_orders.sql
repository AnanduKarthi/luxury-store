CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'expired', 'failed', 'needs_review');--> statement-breakpoint
CREATE TABLE "order_items" (
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"product_slug" text NOT NULL,
	"unit_price_paise" integer NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "order_items_order_id_product_id_pk" PRIMARY KEY("order_id","product_id"),
	CONSTRAINT "order_items_unit_price_paise_non_negative" CHECK ("order_items"."unit_price_paise" >= 0),
	CONSTRAINT "order_items_quantity_range" CHECK ("order_items"."quantity" between 1 and 10)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" integer GENERATED ALWAYS AS IDENTITY (sequence name "orders_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 10001 CACHE 1),
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"currency" text DEFAULT 'inr' NOT NULL,
	"subtotal_paise" integer NOT NULL,
	"amount_total_paise" integer,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"shipping" jsonb,
	"reserved_until" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_number_unique" UNIQUE("number"),
	CONSTRAINT "orders_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id"),
	CONSTRAINT "orders_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id"),
	CONSTRAINT "orders_subtotal_paise_non_negative" CHECK ("orders"."subtotal_paise" >= 0),
	CONSTRAINT "orders_amount_total_paise_non_negative" CHECK ("orders"."amount_total_paise" >= 0)
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_items_product_id_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "orders_user_id_created_at_idx" ON "orders" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "orders_status_reserved_until_idx" ON "orders" USING btree ("status","reserved_until");