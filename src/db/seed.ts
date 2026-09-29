// Seeds the catalogue with the original sample products. Safe to re-run:
// rows are upserted by slug and stock is reset to the values below.
//
//   pnpm db:seed
//
// Images are from Unsplash (https://unsplash.com/license). Photos showing a
// real brand's logo or signature hardware are deliberately not used.

import { sql } from "drizzle-orm";
import { db } from "./index";
import { categories, products, stock } from "./schema";

const categorySeeds = [
  { slug: "women", name: "Women" },
  { slug: "men", name: "Men" },
  { slug: "bags", name: "Bags" },
  { slug: "shoes", name: "Shoes" },
  { slug: "jewelry-watches", name: "Jewelry & Watches" },
  { slug: "accessories", name: "Accessories" },
];

type ProductSeed = {
  id: string; // original sample id, only used to order new arrivals below
  slug: string;
  name: string;
  category: string; // display label → products.product_type
  collection: string; // category slug
  price: number; // whole INR
  photo: string;
  // focal points for the gallery: [main, detail 1, detail 2]
  focus?: [number, number][];
  badge?: string;
  stock: number;
  colour: string;
  description: string;
  details: string[];
};

// 3:4 crop centred on a focal point; zoom > 1 gives close-up "detail" shots
// from the same photograph.
const unsplashCrop = (id: string, [x, y]: [number, number], zoom = 1) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=1600&crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${zoom}&q=80`;

const seeds: ProductSeed[] = [
  {
    id: "p1",
    slug: "top-handle-bag-grained-leather",
    name: "Top-Handle Bag in Grained Leather",
    category: "Handbags",
    collection: "bags",
    price: 295000,
    photo: "1594223274512-ad4803739b7c",
    focus: [[0.6, 0.55], [0.45, 0.6], [0.6, 0.35]],
    badge: "New in",
    stock: 8,
    colour: "Teal",
    description:
      "A structured top-handle bag cut from full-grain calfskin with a softly pebbled finish. The front flap closes with a polished push-lock, and a detachable strap lets it be carried by hand or worn across the body.",
    details: [
      "Full-grain calfskin with pebbled finish",
      "Gold-toned hardware",
      "Push-lock closure",
      "Detachable, adjustable shoulder strap",
      "Microfibre lining with one internal pocket",
      "W 28 × H 21 × D 11 cm",
      "Made in Italy",
    ],
  },
  {
    id: "p2",
    slug: "belted-wool-trench-coat",
    name: "Belted Wool Trench Coat",
    category: "Coats",
    collection: "women",
    price: 245000,
    photo: "1539533018447-63fcce2678e3",
    focus: [[0.5, 0.4], [0.5, 0.25], [0.5, 0.5]],
    badge: "New in",
    stock: 12,
    colour: "Camel",
    description:
      "A relaxed wrap coat in double-faced wool with wide notched lapels and a self-tie belt. Unlined for a fluid drape, with hand-finished seams throughout.",
    details: [
      "100% virgin wool, double-faced",
      "Notched lapels",
      "Self-tie belt with belt loops",
      "Two welt pockets",
      "Unlined",
      "Dry clean only",
      "Made in Italy",
    ],
  },
  {
    id: "p3",
    slug: "leather-monk-strap-shoe",
    name: "Double Monk-Strap Shoe",
    category: "Shoes",
    collection: "shoes",
    price: 98000,
    photo: "1533867617858-e7b97e060509",
    focus: [[0.5, 0.45], [0.55, 0.42], [0.4, 0.45]],
    stock: 2,
    colour: "Chestnut",
    description:
      "A double monk-strap shoe in burnished calfskin, built on a slim almond last. Blake-stitched to a leather sole for a close, flexible fit.",
    details: [
      "Burnished calfskin upper",
      "Two buckled straps",
      "Leather lining and sole",
      "Blake-stitched construction",
      "Made in Italy",
    ],
  },
  {
    id: "p4",
    slug: "sapphire-drop-earrings",
    name: "Sapphire Drop Earrings",
    category: "Fine Jewelry",
    collection: "jewelry-watches",
    price: 355000,
    photo: "1535632066927-ab7c9ab60908",
    focus: [[0.5, 0.5], [0.62, 0.35], [0.45, 0.7]],
    badge: "Exclusive",
    stock: 0,
    colour: "Sapphire / Silver",
    description:
      "Statement drop earrings setting pear-cut blue sapphires within a frame of baguette-cut stones. Each pair is assembled and polished by hand.",
    details: [
      "Pear-cut sapphires",
      "Baguette-cut white stones",
      "Sterling silver setting",
      "Post and butterfly fastening",
      "Length 6 cm",
      "Presented in a signature box",
    ],
  },
  {
    id: "p5",
    slug: "technical-bomber-jacket",
    name: "Technical Bomber Jacket",
    category: "Jackets",
    collection: "men",
    price: 170000,
    photo: "1591047139829-d91aecb6caea",
    focus: [[0.5, 0.55], [0.5, 0.3], [0.45, 0.8]],
    stock: 6,
    colour: "Rust",
    description:
      "A lightweight bomber in water-repellent technical twill, finished with ribbed trims and a utility sleeve pocket. Cut close through the body for layering.",
    details: [
      "Water-repellent technical twill",
      "Ribbed collar, cuffs and hem",
      "Two-way zip fastening",
      "Zipped sleeve pocket",
      "Machine washable",
    ],
  },
  {
    id: "p6",
    slug: "round-metal-sunglasses",
    name: "Round Metal Sunglasses",
    category: "Eyewear",
    collection: "accessories",
    price: 46000,
    photo: "1511499767150-a48a237f0083",
    focus: [[0.5, 0.5], [0.35, 0.47], [0.75, 0.45]],
    stock: 15,
    colour: "Gold / Green",
    description:
      "Round sunglasses with a fine gold-toned metal frame and green mineral-glass lenses. Adjustable nose pads and tipped temples keep them comfortable all day.",
    details: [
      "Gold-toned metal frame",
      "Green mineral-glass lenses, 100% UV protection",
      "Adjustable nose pads",
      "Includes leather case and cleaning cloth",
    ],
  },
  {
    id: "p7",
    slug: "pleated-silk-trousers",
    name: "Pleated Silk Jogger Trousers",
    category: "Trousers",
    collection: "women",
    price: 115000,
    photo: "1594633312681-425c7b97ccd1",
    focus: [[0.5, 0.45], [0.5, 0.18], [0.5, 0.85]],
    badge: "New in",
    stock: 3,
    colour: "Blush",
    description:
      "Soft jogger trousers in washed silk satin with an elasticated waist and cuffs. Patch pockets at the front add a utilitarian note to a fluid silhouette.",
    details: [
      "100% silk satin",
      "Elasticated waist and cuffs",
      "Front patch pockets",
      "Relaxed fit",
      "Dry clean only",
    ],
  },
  {
    id: "p8",
    slug: "classic-leather-strap-watch",
    name: "Classic Leather-Strap Watch",
    category: "Watches",
    collection: "jewelry-watches",
    price: 225000,
    photo: "1524592094714-0f0654e20314",
    focus: [[0.5, 0.5], [0.52, 0.52], [0.45, 0.25]],
    stock: 5,
    colour: "Rose Gold / Taupe",
    description:
      "A slim, time-only watch with a white lacquered dial and rose gold-toned case. The suede strap is quick-release, so it can be changed without tools.",
    details: [
      "38 mm rose gold-toned steel case",
      "Swiss quartz movement",
      "Sapphire crystal",
      "Quick-release suede strap",
      "Water resistant to 30 m",
      "Two-year warranty",
    ],
  },
  {
    id: "l1",
    slug: "straw-basket-bag",
    name: "Straw Basket Bag",
    category: "Handbags",
    collection: "bags",
    price: 83000,
    photo: "1554342872-034a06541bad",
    focus: [[0.5, 0.55], [0.5, 0.7], [0.45, 0.35]],
    stock: 9,
    colour: "Natural",
    description:
      "A hand-woven basket bag with rounded top handles, made from sun-dried seagrass. Light enough for every day, generous enough for a weekend away.",
    details: [
      "Hand-woven seagrass",
      "Rounded top handles",
      "Open top",
      "W 38 × H 30 × D 15 cm",
      "Handmade, so each piece varies slightly",
    ],
  },
  {
    id: "l2",
    slug: "leather-messenger-bag",
    name: "Leather Messenger Bag",
    category: "Bags",
    collection: "bags",
    price: 185000,
    photo: "1473188588951-666fce8e7c68",
    focus: [[0.5, 0.4], [0.45, 0.3], [0.6, 0.55]],
    stock: 4,
    colour: "Cognac",
    description:
      "A messenger in waxed, vegetable-tanned leather that darkens and softens with use. Twin buckled straps secure a deep front flap over a padded laptop sleeve.",
    details: [
      "Vegetable-tanned waxed leather",
      "Twin buckle closures",
      "Padded 15-inch laptop sleeve",
      "Adjustable shoulder strap",
      "W 40 × H 30 × D 10 cm",
    ],
  },
  {
    id: "l3",
    slug: "chain-shoulder-bag",
    name: "Chain Shoulder Bag",
    category: "Handbags",
    collection: "bags",
    price: 210000,
    photo: "1566150905458-1bf1fc113f0d",
    focus: [[0.5, 0.45], [0.45, 0.4], [0.75, 0.3]],
    badge: "New in",
    stock: 1,
    colour: "Rose / Butter",
    description:
      "A compact flap bag in smooth calfskin with an inlaid chevron in contrasting leather. The fine chain strap can be doubled for a shorter carry.",
    details: [
      "Smooth calfskin with leather inlay",
      "Silver-toned chain strap",
      "Magnetic flap closure",
      "W 20 × H 13 × D 6 cm",
      "Made in Italy",
    ],
  },
  {
    id: "l4",
    slug: "buckled-satchel",
    name: "Buckled Satchel",
    category: "Bags",
    collection: "bags",
    price: 235000,
    photo: "1605733513597-a8f8341084e6",
    focus: [[0.5, 0.5], [0.5, 0.55], [0.5, 0.3]],
    stock: 7,
    colour: "Dove Grey",
    description:
      "A small satchel in pebbled leather with twin buckled straps over a magnetic flap. Carry it by the top handle or wear it on the detachable strap.",
    details: [
      "Pebbled calfskin",
      "Gold-toned buckles",
      "Magnetic closures beneath buckles",
      "Top handle and detachable strap",
      "W 25 × H 18 × D 9 cm",
    ],
  },
  {
    id: "l5",
    slug: "bifold-wallet",
    name: "Bifold Wallet",
    category: "Small Leather Goods",
    collection: "bags",
    price: 53000,
    photo: "1627123424574-724758594e93",
    focus: [[0.55, 0.5], [0.55, 0.45], [0.5, 0.6]],
    stock: 0,
    colour: "Tobacco",
    description:
      "A slim bifold in hand-burnished leather with six card slots and a full-length note compartment. Edges are painted and polished by hand.",
    details: [
      "Hand-burnished calfskin",
      "Six card slots",
      "Full-length note compartment",
      "W 11 × H 9 cm closed",
    ],
  },
];

const detailZoom = [1, 2, 2.8];

// Newest first: p1–p8 are the home page's New Arrivals, in this order.
const newestFirst = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "l1", "l2", "l3", "l4", "l5"];
const seededAt = Date.now();

async function main() {
  const categoryRows = await db
    .insert(categories)
    .values(categorySeeds)
    .onConflictDoUpdate({
      target: categories.slug,
      set: { name: sql`excluded.name` },
    })
    .returning({ id: categories.id, slug: categories.slug });
  const categoryId = new Map(categoryRows.map((row) => [row.slug, row.id]));

  const productRows = await db
    .insert(products)
    .values(
      seeds.map((seed) => {
        const seedCategoryId = categoryId.get(seed.collection);
        if (!seedCategoryId) throw new Error(`Unknown category "${seed.collection}"`);
        const points = seed.focus ?? [[0.5, 0.5], [0.5, 0.5], [0.5, 0.35]];
        return {
          slug: seed.slug,
          name: seed.name,
          categoryId: seedCategoryId,
          productType: seed.category,
          pricePaise: seed.price * 100,
          colour: seed.colour,
          description: seed.description,
          details: seed.details,
          images: points.map((point, i) => unsplashCrop(seed.photo, point, detailZoom[i])),
          badge: seed.badge ?? null,
          createdAt: new Date(seededAt - newestFirst.indexOf(seed.id) * 60_000),
        };
      }),
    )
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        name: sql`excluded.name`,
        categoryId: sql`excluded.category_id`,
        productType: sql`excluded.product_type`,
        pricePaise: sql`excluded.price_paise`,
        colour: sql`excluded.colour`,
        description: sql`excluded.description`,
        details: sql`excluded.details`,
        images: sql`excluded.images`,
        badge: sql`excluded.badge`,
        createdAt: sql`excluded.created_at`,
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: products.id, slug: products.slug });
  const productId = new Map(productRows.map((row) => [row.slug, row.id]));

  await db
    .insert(stock)
    .values(seeds.map((seed) => ({ productId: productId.get(seed.slug)!, quantity: seed.stock })))
    .onConflictDoUpdate({
      target: stock.productId,
      set: { quantity: sql`excluded.quantity`, updatedAt: sql`now()` },
    });

  console.log(
    `Seeded ${categoryRows.length} categories, ${productRows.length} products and their stock.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
