import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCategoryBySlug, getProductsByCategory } from "@/db/queries/catalog";
import { makeProduct } from "../../../fixtures";
import CollectionPage, { dynamic, generateMetadata } from "@/app/collections/[slug]/page";

vi.mock("@/db/queries/catalog", () => ({
  getCategoryBySlug: vi.fn(),
  getProductsByCategory: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const pageProps = (slug: string) => ({
  params: Promise.resolve({ slug }),
  searchParams: Promise.resolve({}),
});

const handbags = { slug: "handbags", name: "Handbags" };
// The query's type claims a category is always found; at runtime a miss is undefined.
const noCategory = undefined as unknown as typeof handbags;

const renderPage = async (slug: string) => render(await CollectionPage(pageProps(slug)));

describe("CollectionPage", () => {
  beforeEach(() => {
    vi.mocked(getCategoryBySlug).mockResolvedValue(handbags);
    vi.mocked(getProductsByCategory).mockResolvedValue([]);
  });

  it("renders fresh on every request so stock is never stale", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("looks up the category and its products by the slug in the URL", async () => {
    await renderPage("handbags");

    expect(getCategoryBySlug).toHaveBeenCalledWith("handbags");
    expect(getProductsByCategory).toHaveBeenCalledWith("handbags");
  });

  it("shows the category name as the page heading under a Collection label", async () => {
    await renderPage("handbags");

    expect(screen.getByRole("heading", { level: 1, name: "Handbags" })).toBeInTheDocument();
    expect(screen.getByText("Collection")).toBeInTheDocument();
  });

  it("lists every product in the category with a link to its product page", async () => {
    vi.mocked(getProductsByCategory).mockResolvedValue([
      makeProduct({ id: "a", slug: "quilted-tote", name: "Quilted Tote" }),
      makeProduct({ id: "b", slug: "mini-flap-bag", name: "Mini Flap Bag" }),
    ]);

    await renderPage("handbags");

    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Quilted Tote" })).toHaveAttribute(
      "href",
      "/products/quilted-tote",
    );
    expect(screen.getByRole("link", { name: "Mini Flap Bag" })).toHaveAttribute(
      "href",
      "/products/mini-flap-bag",
    );
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("shows the empty state when the category has no products yet", async () => {
    await renderPage("handbags");

    expect(screen.getByText("0 items")).toBeInTheDocument();
    expect(screen.getByText("New pieces are on their way. Check back soon.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue shopping" })).toHaveAttribute("href", "/");
  });

  it("sends an unknown slug to the not found page", async () => {
    vi.mocked(getCategoryBySlug).mockResolvedValue(noCategory);

    await expect(CollectionPage(pageProps("does-not-exist"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("fails loudly instead of rendering a half page when the database errors", async () => {
    vi.mocked(getProductsByCategory).mockRejectedValue(new Error("connection lost"));

    await expect(CollectionPage(pageProps("handbags"))).rejects.toThrow("connection lost");
  });
});

describe("generateMetadata", () => {
  it("titles the page after the category", async () => {
    vi.mocked(getCategoryBySlug).mockResolvedValue(handbags);

    await expect(generateMetadata(pageProps("handbags"))).resolves.toEqual({
      title: "Handbags | Luxury Store",
      description: "Shop the Handbags collection at Luxury Store.",
    });
  });

  it("returns empty metadata for an unknown slug", async () => {
    vi.mocked(getCategoryBySlug).mockResolvedValue(noCategory);

    await expect(generateMetadata(pageProps("does-not-exist"))).resolves.toEqual({});
  });
});
