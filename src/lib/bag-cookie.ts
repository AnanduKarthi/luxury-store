import { cookies } from "next/headers";
import { parseBag, serializeBag, type BagEntry } from "@/lib/cart";

const BAG_COOKIE = "bag";

export async function readBag(): Promise<BagEntry[]> {
  return parseBag((await cookies()).get(BAG_COOKIE)?.value);
}

// Only callable from server actions and route handlers.
export async function writeBag(entries: BagEntry[]) {
  const store = await cookies();
  if (entries.length === 0) {
    store.delete(BAG_COOKIE);
    return;
  }
  store.set(BAG_COOKIE, serializeBag(entries), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

// Units in the bag as stored, without checking stock. Cheap enough for the
// header on every page.
export async function readBagCount() {
  return (await readBag()).reduce((sum, entry) => sum + entry.quantity, 0);
}
