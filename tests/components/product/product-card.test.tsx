import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeProduct } from "../../fixtures";
import { ProductCard } from "@/components/product/product-card";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

describe("ProductCard", () => {
  it("links the product name to its product page", () => {
    render(<ProductCard product={makeProduct({ slug: "quilted-tote", name: "Quilted Tote" })} />);

    expect(screen.getByRole("link", { name: "Quilted Tote" })).toHaveAttribute(
      "href",
      "/products/quilted-tote",
    );
  });

  it("shows the first image with the product name as its alt text", () => {
    render(
      <ProductCard
        product={makeProduct({ name: "Quilted Tote", images: ["/first.jpg", "/second.jpg"] })}
      />,
    );

    expect(screen.getByRole("img", { name: "Quilted Tote" })).toHaveAttribute("src", "/first.jpg");
  });

  it("formats the price in rupees with Indian digit grouping", () => {
    render(<ProductCard product={makeProduct({ pricePaise: 29_500_000 })} />);

    expect(screen.getByText("₹2,95,000")).toBeInTheDocument();
  });

  it("keeps paise in the price when it is not a whole rupee amount", () => {
    render(<ProductCard product={makeProduct({ pricePaise: 1_234_550 })} />);

    expect(screen.getByText("₹12,345.50")).toBeInTheDocument();
  });

  it("shows the product's own badge while it is in stock", () => {
    render(<ProductCard product={makeProduct({ badge: "New", stock: 5 })} />);

    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("replaces the badge with Sold out when stock reaches zero", () => {
    render(<ProductCard product={makeProduct({ badge: "New", stock: 0 })} />);

    expect(screen.getByText("Sold out")).toBeInTheDocument();
    expect(screen.queryByText("New")).not.toBeInTheDocument();
  });

  it("treats negative stock as sold out", () => {
    render(<ProductCard product={makeProduct({ stock: -1 })} />);

    expect(screen.getByText("Sold out")).toBeInTheDocument();
  });

  it("does not mark a low stock product as sold out", () => {
    render(<ProductCard product={makeProduct({ badge: null, stock: 1 })} />);

    expect(screen.queryByText("Sold out")).not.toBeInTheDocument();
  });

  it("gives the icon only save button an accessible name", () => {
    render(<ProductCard product={makeProduct({ name: "Quilted Tote" })} />);

    expect(screen.getByRole("button", { name: "Save Quilted Tote" })).toBeInTheDocument();
  });
});
