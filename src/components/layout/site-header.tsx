import Link from "next/link";
import { BagIcon, SearchIcon, UserIcon } from "@/components/icons";
import { navigation } from "@/lib/site-content";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <>
      <div className="inverse">
        <p className="container-page type-caption py-2 text-center">
          Complimentary shipping and returns on all orders
        </p>
      </div>

      <header className="sticky top-0 z-40 border-b border-divider bg-background">
        <div className="container-page grid h-header grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-1">
            <MobileNav />
            <Link href="/search" aria-label="Search" className="btn-icon">
              <SearchIcon />
            </Link>
          </div>

          <Link
            href="/"
            className="text-sm font-bold tracking-[0.25em] whitespace-nowrap uppercase md:text-lg md:tracking-[0.3em] lg:text-2xl"
          >
            Luxury Store
          </Link>

          <div className="flex items-center justify-end gap-1">
            <Link href="/account" aria-label="Account" className="btn-icon">
              <UserIcon />
            </Link>
            <Link href="/bag" aria-label="Shopping bag" className="btn-icon">
              <BagIcon />
            </Link>
          </div>
        </div>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="container-page flex justify-center gap-8 pb-4">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="type-cta link-subtle">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
