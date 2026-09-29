import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CollectionNotFound from "@/app/collections/[slug]/not-found";

describe("CollectionNotFound", () => {
  it("tells the shopper the collection does not exist", () => {
    render(<CollectionNotFound />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Collection not found" }),
    ).toBeInTheDocument();
  });

  it("offers a way back to the home page", () => {
    render(<CollectionNotFound />);

    expect(screen.getByRole("link", { name: "Continue shopping" })).toHaveAttribute("href", "/");
  });
});
