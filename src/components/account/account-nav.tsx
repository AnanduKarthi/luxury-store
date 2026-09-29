"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

const items = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Account details", href: "/account/details" },
];

// Tabs that scroll sideways on small screens, a vertical list from lg up.
export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const links = isAdmin ? [...items, { label: "Admin", href: "/admin" }] : items;

  return (
    <nav aria-label="Account" className="bleed lg:mx-0">
      <ul className="flex gap-6 overflow-x-auto border-b border-divider px-gutter [scrollbar-width:none] lg:flex-col lg:gap-5 lg:overflow-visible lg:border-b-0 lg:px-0">
        {links.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className="type-cta link-subtle inline-block py-4 text-muted aria-[current=page]:text-foreground lg:py-0"
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li className="shrink-0 lg:border-t lg:border-divider lg:pt-5">
          <SignOutButton className="type-cta link-subtle inline-block cursor-pointer py-4 text-muted disabled:cursor-not-allowed lg:py-0" />
        </li>
      </ul>
    </nav>
  );
}
