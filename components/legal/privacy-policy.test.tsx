import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PRIVACY_POLICY } from "@/lib/constants/legal";

import { PrivacyPolicy } from "./privacy-policy";

describe("PrivacyPolicy", () => {
  it("renders the title, date and summary", () => {
    render(<PrivacyPolicy />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Privacy Policy" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Last updated ${PRIVACY_POLICY.lastUpdated}`),
    ).toBeInTheDocument();
    expect(screen.getByText("In short:")).toBeInTheDocument();
  });

  it("numbers each section and gives it an anchor", () => {
    render(<PrivacyPolicy />);
    PRIVACY_POLICY.sections.forEach((section, index) => {
      const heading = screen.getByRole("heading", {
        level: 2,
        name: `${index + 1}. ${section.title}`,
      });
      expect(heading.closest("section")).toHaveAttribute("id", section.id);
    });
  });

  it("marks Privacy as the current legal page", () => {
    render(<PrivacyPolicy />);
    const tabs = screen.getByRole("navigation", { name: "Legal pages" });
    expect(within(tabs).getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(tabs).getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms",
    );
  });

  it("links every section from the table of contents", () => {
    render(<PrivacyPolicy />);
    const toc = screen.getByRole("navigation", { name: "On this page" });
    PRIVACY_POLICY.sections.forEach((section) => {
      expect(
        within(toc).getByRole("link", { name: section.title }),
      ).toHaveAttribute("href", `#${section.id}`);
    });
  });

  it("says only an essential cookie is used", () => {
    render(<PrivacyPolicy />);
    expect(
      screen.getByText(/one essential cookie to keep you signed in/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Cookie settings/)).not.toBeInTheDocument();
  });
});
