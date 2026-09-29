"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { navigation } from "@/lib/site-content";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="btn-icon"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </button>

      <div
        className={`fixed inset-0 z-50 bg-overlay transition-opacity duration-500 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        inert={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col bg-background transition-transform duration-500 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-header items-center justify-between px-gutter">
          <span className="type-caption">Menu</span>
          <button
            type="button"
            className="btn-icon"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
        <ul className="flex flex-col px-gutter pt-4">
          {navigation.map((item) => (
            <li key={item.href} className="border-b border-divider">
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="type-title-m block py-5"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
