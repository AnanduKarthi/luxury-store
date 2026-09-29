"use server";

import { revalidatePath } from "next/cache";
import { setStockQuantity } from "@/db/queries/admin";
import { requireAdmin } from "@/lib/session";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_QUANTITY = 100_000;

export type StockFormState = { error?: string; saved?: boolean };

// Server actions are public endpoints: authorize here, not just on the page.
export async function updateStockAction(
  _prev: StockFormState,
  formData: FormData,
): Promise<StockFormState> {
  await requireAdmin();

  const productId = formData.get("productId");
  const quantity = Number(formData.get("quantity"));
  if (typeof productId !== "string" || !UUID.test(productId)) {
    return { error: "Unknown product." };
  }
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) {
    return { error: "Enter a whole number from 0 to 100,000." };
  }

  try {
    await setStockQuantity(productId, quantity);
  } catch {
    // e.g. the product was deleted (FK violation)
    return { error: "Could not update stock." };
  }
  revalidatePath("/admin");
  return { saved: true };
}
