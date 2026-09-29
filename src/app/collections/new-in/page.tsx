import type { Metadata } from "next";
import { ProductListing } from "@/components/product/product-listing";
import { getNewArrivals } from "@/db/queries/catalog";

// Stock must be current, and nothing may query the database at build time.
export const dynamic = "force-dynamic";

const NEW_ARRIVALS_LIMIT = 24;

export const metadata: Metadata = {
  title: "New Arrivals | Luxury Store",
  description: "The latest pieces to arrive, from ready-to-wear to leather goods and jewelry.",
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(NEW_ARRIVALS_LIMIT);
  return <ProductListing eyebrow="Just landed" title="New Arrivals" products={products} />;
}
