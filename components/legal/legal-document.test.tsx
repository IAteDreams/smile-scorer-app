import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LegalDocument } from "./legal-document";

const sections = [
  { id: "first", title: "First section" },
  { id: "second", title: "Second section" },
];

describe("LegalDocument", () => {
  it("lists the sections and renders the document beside them", () => {
    render(
      <LegalDocument sections={sections}>
        <h1>Document</h1>
      </LegalDocument>,
    );
    const toc = screen.getByRole("navigation", { name: "On this page" });
    expect(within(toc).getAllByRole("link")).toHaveLength(2);
    expect(
      within(screen.getByRole("article")).getByRole("heading", {
        name: "Document",
      }),
    ).toBeInTheDocument();
  });
});
