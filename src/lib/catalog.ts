// Storefront catalogue types and pure helpers. No database imports here, so
// any component can use it.

export type StockStatus = "in-stock" | "low-stock" | "sold-out";

export type Product = {
  id: string;
  slug: string;
  name: string;
  productType: string; // display label, e.g. "Handbags"
  category: { slug: string; name: string };
  priceCents: number;
  images: string[]; // 3:4 crops; the first is the primary image
  badge: string | null;
  stock: number;
  colour: string;
  description: string;
  details: string[];
};

export const LOW_STOCK_THRESHOLD = 3;

export const getStockStatus = (stock: number): StockStatus =>
  stock <= 0 ? "sold-out" : stock <= LOW_STOCK_THRESHOLD ? "low-stock" : "in-stock";

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  trailingZeroDisplay: "stripIfInteger",
});

export const formatPrice = (cents: number) => priceFormat.format(cents / 100);
