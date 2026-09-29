"use server";

import { revalidatePath } from "next/cache";
import { getProductsByIds } from "@/db/queries/catalog";
import { getOrderForUser } from "@/db/queries/orders";
import { readBag, writeBag } from "@/lib/bag-cookie";
import {
  availableFor,
  buildBag,
  isProductId,
  isQuantity,
  MAX_BAG_LINES,
  normalizedEntries,
  type BagEntry,
} from "@/lib/cart";
import { getSession } from "@/lib/session";

export type BagActionResult =
  | { ok: true; quantity: number; adjusted?: string }
  | { ok: false; error: string };

// Loads the bag against current stock, so every write also settles lines that
// went sold out or over stock since they were added.
async function loadBag() {
  const entries = await readBag();
  const products = await getProductsByIds(entries.map((entry) => entry.productId));
  return buildBag(entries, products);
}

async function save(entries: BagEntry[]) {
  await writeBag(entries);
  // The header badge is on every page.
  revalidatePath("/", "layout");
}

const unavailable = { ok: false, error: "This piece is no longer available." } as const;

export async function addToBag(productId: unknown): Promise<BagActionResult> {
  if (!isProductId(productId)) return unavailable;
  const id = productId.toLowerCase();

  const [bag, [product]] = await Promise.all([loadBag(), getProductsByIds([id])]);
  if (!product) return unavailable;

  const available = availableFor(product.stock);
  if (available === 0) return { ok: false, error: "This piece is sold out." };

  const entries = normalizedEntries(bag);
  const existing = entries.find((entry) => entry.productId === id);
  const current = existing?.quantity ?? 0;
  if (current + 1 > available) {
    return {
      ok: false,
      error:
        available === 1
          ? "This piece is already in your bag, and it’s the last one available."
          : `You already have all ${available} available in your bag.`,
    };
  }
  if (!existing && entries.length >= MAX_BAG_LINES) {
    return { ok: false, error: "Your bag is full. Remove a piece to add another." };
  }

  const next = existing
    ? entries.map((entry) => (entry.productId === id ? { ...entry, quantity: current + 1 } : entry))
    : [...entries, { productId: id, quantity: 1 }];
  await save(next);
  return { ok: true, quantity: current + 1 };
}

export async function setQuantity(productId: unknown, quantity: unknown): Promise<BagActionResult> {
  if (!isProductId(productId)) return unavailable;
  if (!isQuantity(quantity)) return { ok: false, error: "Choose a quantity of 1 or more." };
  const id = productId.toLowerCase();

  const bag = await loadBag();
  const line = bag.lines.find((l) => l.product.id === id);
  if (!line) return { ok: false, error: "This piece is no longer in your bag." };
  if (line.available === 0) {
    await save(normalizedEntries(bag));
    return { ok: false, error: "This piece is sold out." };
  }

  const next = Math.min(quantity, line.available);
  await save(
    normalizedEntries(bag).map((entry) =>
      entry.productId === id ? { ...entry, quantity: next } : entry,
    ),
  );
  return next < quantity
    ? { ok: true, quantity: next, adjusted: `Only ${line.available} available.` }
    : { ok: true, quantity: next };
}

export async function removeFromBag(productId: unknown): Promise<BagActionResult> {
  if (!isProductId(productId)) return unavailable;
  const id = productId.toLowerCase();
  let entries: BagEntry[];
  try {
    entries = normalizedEntries(await loadBag());
  } catch {
    // Removal must still work if the DB is unreachable.
    entries = await readBag();
  }
  await save(entries.filter((entry) => entry.productId !== id));
  return { ok: true, quantity: 0 };
}

// After a paid order, takes its pieces out of the bag. Anything added to the
// bag since checkout started stays. Only acts on the caller's own paid order.
export async function clearOrderedItems(orderId: unknown): Promise<void> {
  if (!isProductId(orderId)) return;
  const auth = await getSession();
  if (!auth) return;
  const order = await getOrderForUser(orderId.toLowerCase(), auth.user.id);
  if (order?.status !== "paid") return;

  const ordered = new Set(order.items.map((item) => item.productId));
  const entries = await readBag();
  const remaining = entries.filter((entry) => !ordered.has(entry.productId));
  if (remaining.length !== entries.length) await save(remaining);
}
