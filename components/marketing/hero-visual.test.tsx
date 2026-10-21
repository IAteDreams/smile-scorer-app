import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HeroVisual } from "./hero-visual";

// Vitest imports images as a plain path; Next's build adds these fields.
vi.mock("@/public/group_of_friends.webp", () => ({
  default: {
    src: "/group_of_friends.webp",
    width: 3648,
    height: 5322,
    blurDataURL: "data:image/webp;base64,AAAA",
  },
}));

describe("HeroVisual", () => {
  it("describes the photo", () => {
    render(<HeroVisual />);
    expect(
      screen.getByAltText("Four friends smiling with their arms outstretched"),
    ).toBeInTheDocument();
  });

  it("shows the sample score card", () => {
    render(<HeroVisual />);
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText("Beaming")).toBeInTheDocument();
  });

  it("hides the decorative face box from assistive tech", () => {
    render(<HeroVisual />);
    expect(screen.getByText("FACE · 99.8%").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
