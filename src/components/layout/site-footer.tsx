import Link from "next/link";

const columns = [
  {
    title: "Client Services",
    links: ["Contact Us", "Shipping", "Returns & Exchanges", "Book an Appointment", "FAQs"],
  },
  {
    title: "The House",
    links: ["Our Story", "Craftsmanship", "Sustainability", "Careers"],
  },
  {
    title: "Legal",
    links: ["Terms & Conditions", "Privacy Policy", "Cookie Settings", "Accessibility"],
  },
];

export function SiteFooter() {
  return (
    <footer className="inverse mt-auto">
      <div className="container-page section-y">
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="type-caption mb-4 text-muted">{column.title}</h2>
              <ul className="flex flex-col gap-3">
                {column.links.map((label) => (
                  <li key={label}>
                    <Link href="#" className="link-subtle">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h2 className="type-caption mb-4 text-muted">Store Locator</h2>
            <p className="mb-4 text-muted">
              Find a boutique near you for personal appointments and
              made-to-order services.
            </p>
            <Link href="#" className="type-cta link-underline">
              Find a store
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-divider pt-8 md:flex-row md:items-end md:justify-between">
          <p className="text-3xl font-bold tracking-[0.3em] uppercase lg:text-5xl">
            Luxury Store
          </p>
          <p className="type-caption text-muted">
            © {new Date().getFullYear()} Luxury Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
