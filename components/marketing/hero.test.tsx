import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Hero } from "./hero";

vi.mock("@/components/marketing/hero-visual", () => ({
  HeroVisual: () => <div data-testid="hero-visual" />,
}));

describe("Hero", () => {
  it("renders the headline and calls to action", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "How big is your smile, really?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Score my smile" }),
    ).toHaveAttribute("href", "/sign-up");
    expect(
      screen.getByRole("link", { name: "See how it works" }),
    ).toHaveAttribute("href", "/#how-it-works");
  });

  it("renders the visual beside the copy", () => {
    render(<Hero />);
    expect(screen.getByTestId("hero-visual")).toBeInTheDocument();
  });
});
