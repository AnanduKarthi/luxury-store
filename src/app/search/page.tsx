import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { ProductGrid } from "@/components/product/product-grid";
import { searchProducts } from "@/db/queries/catalog";
import { navigation } from "@/lib/site-content";

// Stock must be current, and nothing may query the database at build time.
export const dynamic = "force-dynamic";

const MAX_QUERY_LENGTH = 100;

async function getQuery(searchParams: PageProps<"/search">["searchParams"]) {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : (q ?? "")).trim().slice(0, MAX_QUERY_LENGTH);
}

export async function generateMetadata(props: PageProps<"/search">): Promise<Metadata> {
  const query = await getQuery(props.searchParams);
  return {
    title: query ? `Search results for “${query}” | Luxury Store` : "Search | Luxury Store",
    robots: { index: false },
  };
}

export default async function SearchPage(props: PageProps<"/search">) {
  const query = await getQuery(props.searchParams);
  const results = query ? await searchProducts(query) : [];

  return (
    <main className="container-page pt-4 pb-section lg:pt-6">
      <nav aria-label="Breadcrumb" className="type-caption mb-8 text-muted lg:mb-10">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="link-subtle">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            Search
          </li>
        </ol>
      </nav>

      <div className="mx-auto mb-10 max-w-prose lg:mb-16">
        <h1 className="type-title-l mb-6 text-center">Search</h1>
        <Form action="/search" role="search" className="relative">
          <label htmlFor="search-query" className="sr-only">
            Search products
          </label>
          <input
            // Remount on a new query so the field shows it after client navigation.
            key={query}
            id="search-query"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="What are you looking for?"
            autoComplete="off"
            maxLength={MAX_QUERY_LENGTH}
            autoFocus={!query}
            className="type-body-l w-full border-b border-divider-strong bg-transparent py-3 pr-12 transition-colors outline-none placeholder:text-muted focus:border-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="btn-icon absolute top-1/2 right-0 -translate-y-1/2"
          >
            <SearchIcon />
          </button>
        </Form>
      </div>

      {query && results.length > 0 ? (
        <>
          <p role="status" className="type-caption mb-8 text-muted lg:mb-10">
            {results.length} {results.length === 1 ? "result" : "results"} for “
            <span className="text-foreground">{query}</span>”
          </p>
          <ProductGrid products={results} />
        </>
      ) : (
        <div className="flex flex-col items-center text-center">
          {query && (
            <div role="status" className="mb-10">
              <p className="type-title-m mb-3">No results for “{query}”</p>
              <p className="text-muted">
                Check the spelling, or try a more general term such as a colour or category.
              </p>
            </div>
          )}
          <p className="type-caption mb-4 text-muted">Browse collections</p>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="type-cta link-underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
