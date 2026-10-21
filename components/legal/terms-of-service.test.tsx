import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TERMS_OF_SERVICE } from "@/lib/constants/legal";

import { TermsOfService } from "./terms-of-service";

describe("TermsOfService", () => {
  it("renders the title and effective date", () => {
    render(<TermsOfService />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Terms of Service" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Effective ${TERMS_OF_SERVICE.effective}`),
    ).toBeInTheDocument();
  });

  it("numbers each section and gives it an anchor", () => {
    render(<TermsOfService />);
    TERMS_OF_SERVICE.sections.forEach((section, index) => {
      const heading = screen.getByRole("heading", {
        level: 2,
        name: section.title,
      });
      const container = heading.closest("section");
      expect(container).toHaveAttribute("id", section.id);
      expect(container).toHaveTextContent(String(index + 1).padStart(2, "0"));
    });
  });

  it("links every section from the table of contents", () => {
    render(<TermsOfService />);
    const toc = screen.getByRole("navigation", { name: "On this page" });
    TERMS_OF_SERVICE.sections.forEach((section) => {
      expect(
        within(toc).getByRole("link", { name: section.title }),
      ).toHaveAttribute("href", `#${section.id}`);
    });
  });

  it("marks Terms as the current legal page", () => {
    render(<TermsOfService />);
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("links the contact email", () => {
    render(<TermsOfService />);
    expect(
      screen.getByRole("link", { name: TERMS_OF_SERVICE.contactEmail }),
    ).toHaveAttribute("href", `mailto:${TERMS_OF_SERVICE.contactEmail}`);
  });
});
