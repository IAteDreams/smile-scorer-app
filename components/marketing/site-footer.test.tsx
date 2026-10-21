import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it.each([
    ["Privacy Policy", "/privacy"],
    ["Terms of Service", "/terms"],
  ])("links %s to %s", (name, href) => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
  });

  it("shows the copyright", () => {
    render(<SiteFooter />);
    expect(screen.getByText("© 2026 Smilescore")).toBeInTheDocument();
  });

  it("lines up with the page it sits on", () => {
    render(<SiteFooter className="sm:px-10" />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("sm:px-10");
    expect(footer).not.toHaveClass("sm:px-14");
  });
});
