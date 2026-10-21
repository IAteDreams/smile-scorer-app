import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it.each([
    ["Smilescore", "/"],
    ["How it works", "/#how-it-works"],
    ["Sign in", "/sign-in"],
    ["Get started", "/sign-up"],
  ])("links %s to %s", (name, href) => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
  });
});
