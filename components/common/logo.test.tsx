import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo } from "./logo";

describe("Logo", () => {
  it("links home by default", () => {
    render(<Logo />);
    expect(screen.getByRole("link", { name: "Smilescore" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("links to a custom href", () => {
    render(<Logo href="/dashboard" />);
    expect(screen.getByRole("link", { name: "Smilescore" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });

  it("merges extra classes", () => {
    render(<Logo className="self-start" />);
    expect(screen.getByRole("link")).toHaveClass("flex", "self-start");
  });
});
