import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeProduct } from "../../fixtures";
import { ProductListing } from "@/components/product/product-listing";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

describe("ProductListing", () => {
  it("shows a breadcrumb from Home to the current collection", () => {
    render(<ProductListing title="Handbags" products={[]} />);

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(breadcrumb).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(within(breadcrumb).getByText("Handbags")).toHaveAttribute("aria-current", "page");
  });

  it("shows the eyebrow label above the heading when given", () => {
    render(<ProductListing eyebrow="Collection" title="Handbags" products={[]} />);

    expect(screen.getByText("Collection")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Handbags" })).toBeInTheDocument();
  });

  it("leaves the eyebrow out when none is given", () => {
    render(<ProductListing title="Handbags" products={[]} />);

    expect(screen.queryByText("Collection")).not.toBeInTheDocument();
  });

  it.each([
    [0, "0 items"],
    [1, "1 item"],
    [2, "2 items"],
  ])("counts %i product(s) as %s", (count, label) => {
    const products = Array.from({ length: count }, (_, i) =>
      makeProduct({ id: `p${i}`, slug: `p${i}`, name: `Product ${i}` }),
    );

    render(<ProductListing title="Handbags" products={products} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("renders one card per product and no empty state when products exist", () => {
    render(
      <ProductListing
        title="Handbags"
        products={[
          makeProduct({ id: "a", slug: "a", name: "Quilted Tote" }),
          makeProduct({ id: "b", slug: "b", name: "Mini Flap Bag" }),
        ]}
      />,
    );

    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.queryByText(/New pieces are on their way/)).not.toBeInTheDocument();
  });

  it("shows the empty state with a way home when there are no products", () => {
    render(<ProductListing title="Handbags" products={[]} />);

    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.getByText("New pieces are on their way. Check back soon.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue shopping" })).toHaveAttribute("href", "/");
  });
});
