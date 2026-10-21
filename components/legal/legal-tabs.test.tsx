import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LegalTabs } from "./legal-tabs";

describe("LegalTabs", () => {
  it.each([
    ["Privacy", "/privacy"],
    ["Terms", "/terms"],
  ])("links %s to %s", (name, href) => {
    render(<LegalTabs current="/terms" />);
    expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
  });

  it("marks only the current page", () => {
    render(<LegalTabs current="/privacy" />);
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Terms" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
