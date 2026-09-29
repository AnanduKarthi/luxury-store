import Link from "next/link";
import { BagIcon } from "@/components/icons";
import { readBagCount } from "@/lib/bag-cookie";

// Reads only the cookie (no DB), so it's cheap on every page.
export async function BagLink() {
  const count = await readBagCount();
  const label = count
    ? `Shopping bag, ${count} ${count === 1 ? "item" : "items"}`
    : "Shopping bag";
  return (
    <Link href="/bag" aria-label={label} className="btn-icon relative">
      <BagIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[0.625rem] leading-none font-bold text-background tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
