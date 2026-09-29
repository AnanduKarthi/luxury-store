// Storefront catalogue types and pure helpers. No database imports here, so
// any component can use it.

export type StockStatus = "in-stock" | "low-stock" | "sold-out";

export type Product = {
  id: string;
  slug: string;
  name: string;
  productType: string; // display label, e.g. "Handbags"
  category: { slug: string; name: string };
  pricePaise: number;
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

// Indian digit grouping, e.g. ₹2,95,000.
const priceFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  trailingZeroDisplay: "stripIfInteger",
});

export const formatPrice = (paise: number) => priceFormat.format(paise / 100);
