import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it.each([
    ["Smilescore", "/"],
    ["How it works", "/#how-it-works"],
  ])("links %s to %s", (name, href) => {
    render(<SiteHeader actions={null} />);
    expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
  });

  it("renders the actions it is given", () => {
    render(<SiteHeader actions={<button type="button">Action</button>} />);
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});
