import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/product/product-listing";
import { getCategoryBySlug, getProductsByCategory } from "@/db/queries/catalog";

// Stock must be current, and nothing may query the database at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/collections/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} | Luxury Store`,
    description: `Shop the ${category.name} collection at Luxury Store.`,
  };
}

export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug),
  ]);
  if (!category) notFound();

  return <ProductListing eyebrow="Collection" title={category.name} products={products} />;
}
