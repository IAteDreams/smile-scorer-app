import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TableOfContents } from "./table-of-contents";

const sections = [
  { id: "first", title: "First section" },
  { id: "second", title: "Second section" },
];

describe("TableOfContents", () => {
  it("is labelled for assistive tech", () => {
    render(<TableOfContents sections={sections} />);
    expect(
      screen.getByRole("navigation", { name: "On this page" }),
    ).toBeInTheDocument();
  });

  it("links each section to its anchor, in order", () => {
    render(<TableOfContents sections={sections} />);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "#first",
      "#second",
    ]);
    expect(links.map((link) => link.textContent)).toEqual([
      "First section",
      "Second section",
    ]);
  });
});
