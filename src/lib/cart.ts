// Shopping bag types and pure helpers. The bag cookie stores only product ids
// and quantities; names, prices and stock always come from the database.
// No database imports here, so any component can use it.

import type { Product } from "@/lib/catalog";

export type BagEntry = { productId: string; quantity: number };

export type BagLineStatus = "ok" | "reduced" | "sold-out";

export type BagLine = {
  product: Pick<
    Product,
    "id" | "slug" | "name" | "productType" | "colour" | "pricePaise" | "images" | "stock"
  >;
  requested: number; // what the cookie asked for
  quantity: number; // what can actually be bought now
  available: number; // most this line may hold
  status: BagLineStatus;
  lineTotalPaise: number;
};

export type Bag = {
  lines: BagLine[];
  itemCount: number; // units counted in the subtotal
  subtotalPaise: number;
  hasUnavailable: boolean;
};

// Sanity cap per line, on top of stock.
export const MAX_LINE_QUANTITY = 10;
// Keeps the cookie well under the 4 KB limit (~45 bytes per line).
export const MAX_BAG_LINES = 50;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isProductId = (value: unknown): value is string =>
  typeof value === "string" && UUID.test(value);

export const isQuantity = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 1;

export const availableFor = (stock: number) =>
  Math.max(0, Math.min(stock, MAX_LINE_QUANTITY));

// Tolerates anything: garbage, tampered or oversized input yields a clean bag.
export function parseBag(raw: string | undefined): BagEntry[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const seen = new Set<string>();
  const entries: BagEntry[] = [];
  for (const item of data) {
    if (entries.length >= MAX_BAG_LINES) break;
    if (!Array.isArray(item) || item.length !== 2) continue;
    const [id, quantity] = item;
    if (!isProductId(id) || !isQuantity(quantity)) continue;
    const productId = id.toLowerCase();
    if (seen.has(productId)) continue;
    seen.add(productId);
    entries.push({ productId, quantity: Math.min(quantity, MAX_LINE_QUANTITY) });
  }
  return entries;
}

export const serializeBag = (entries: BagEntry[]) =>
  JSON.stringify(entries.map((entry) => [entry.productId, entry.quantity]));

// Joins cookie entries with current product data. Lines for deleted products
// are dropped; sold-out lines are kept (so the customer sees what happened)
// but left out of the subtotal.
export function buildBag(entries: BagEntry[], products: BagLine["product"][]): Bag {
  const byId = new Map(products.map((product) => [product.id, product]));
  const lines: BagLine[] = [];
  for (const entry of entries) {
    const product = byId.get(entry.productId);
    if (!product) continue;
    const available = availableFor(product.stock);
    const quantity = Math.min(entry.quantity, available);
    const status: BagLineStatus =
      available === 0 ? "sold-out" : quantity < entry.quantity ? "reduced" : "ok";
    lines.push({
      product,
      requested: entry.quantity,
      quantity,
      available,
      status,
      lineTotalPaise: product.pricePaise * quantity,
    });
  }
  return {
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotalPaise: lines.reduce((sum, line) => sum + line.lineTotalPaise, 0),
    hasUnavailable: lines.some((line) => line.status === "sold-out"),
  };
}

// Entries as they should be persisted after validating against stock: deleted
// products go, over-stock quantities are lowered, and sold-out lines keep
// their quantity so they stay visible until the customer removes them.
export const normalizedEntries = (bag: Bag): BagEntry[] =>
  bag.lines.map((line) => ({
    productId: line.product.id,
    quantity: line.status === "sold-out" ? line.requested : line.quantity,
  }));
