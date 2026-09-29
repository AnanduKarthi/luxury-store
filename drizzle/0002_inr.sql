-- The store now sells in INR. Prices move from USD cents to INR paise; the
-- values themselves are re-set by `pnpm db:seed`.
ALTER TABLE "products" RENAME COLUMN "price_cents" TO "price_paise";--> statement-breakpoint
ALTER TABLE "products" RENAME CONSTRAINT "products_price_cents_non_negative" TO "products_price_paise_non_negative";
