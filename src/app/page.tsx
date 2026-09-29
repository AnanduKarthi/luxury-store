import { CampaignBand, EditorialSplit } from "@/components/home/editorial";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { Hero } from "@/components/home/hero";
import { SectionHeading } from "@/components/home/section-heading";
import { Services } from "@/components/home/services";
import { ProductCard } from "@/components/product/product-card";
import { ProductRail } from "@/components/product/product-rail";
import { getNewArrivals, getProductsByCategory } from "@/db/queries/catalog";

// Stock must be current, and nothing may query the database at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [newArrivals, leatherGoods] = await Promise.all([
    getNewArrivals(),
    getProductsByCategory("bags"),
  ]);

  return (
    <main>
      <Hero />

      <FeaturedCollections />

      <section className="container-page pb-section">
        <SectionHeading
          eyebrow="Just landed"
          title="New Arrivals"
          href="/collections/new-in"
        />
        <ul className="grid-products">
          {newArrivals.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>

      <EditorialSplit />

      <section className="container-page section-y overflow-hidden">
        <SectionHeading
          eyebrow="Leather goods"
          title="Carried Every Day"
          href="/collections/bags"
          linkLabel="Shop bags"
        />
        <ProductRail label="Leather goods">
          {leatherGoods.map((product) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                sizes="(min-width: 64rem) 25vw, (min-width: 48rem) 33vw, 70vw"
              />
            </li>
          ))}
        </ProductRail>
      </section>

      <CampaignBand />

      <Services />
    </main>
  );
}
