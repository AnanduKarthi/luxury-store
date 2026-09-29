import type { Product } from "@/lib/catalog";

// A plain in-stock product; override only what a test cares about.
export const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "prod-1",
  slug: "quilted-tote",
  name: "Quilted Tote",
  productType: "Handbags",
  category: { slug: "handbags", name: "Handbags" },
  pricePaise: 29_500_000,
  images: ["/images/quilted-tote.jpg"],
  badge: null,
  stock: 10,
  colour: "Black",
  description: "A structured tote in quilted lambskin.",
  details: ["Lambskin", "Made in Italy"],
  ...overrides,
});
