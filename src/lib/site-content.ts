// Static marketing content: navigation, campaign imagery and featured
// collection cards. Catalogue data lives in the database (src/db).
// Images are from Unsplash (https://unsplash.com/license). Photos showing a
// real brand's logo or signature hardware are deliberately not used.

export type Collection = {
  slug: string;
  title: string;
  image: string;
};

export const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

export const navigation = [
  { label: "New In", href: "/collections/new-in" },
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Bags", href: "/collections/bags" },
  { label: "Shoes", href: "/collections/shoes" },
  { label: "Jewelry & Watches", href: "/collections/jewelry-watches" },
];

export const heroImages = {
  primary: unsplash("1539533018447-63fcce2678e3", 2000),
  secondary: unsplash("1539109136881-3be0616acf4b", 2000),
};

export const collections: Collection[] = [
  { slug: "women", title: "Women", image: unsplash("1581044777550-4cfa60707c03", 1000) },
  { slug: "men", title: "Men", image: unsplash("1617137968427-85924c800a22", 1000) },
  { slug: "bags", title: "Bags", image: unsplash("1594223274512-ad4803739b7c", 1000) },
  { slug: "jewelry-watches", title: "Jewelry & Watches", image: unsplash("1535632066927-ab7c9ab60908", 1000) },
];

export const editorial = {
  image: unsplash("1558769132-cb1aea458c5e", 1400),
  campaign: unsplash("1507679799987-c73779587ccf", 2400),
};
