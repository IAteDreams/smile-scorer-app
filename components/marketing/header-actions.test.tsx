import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeaderActions, HeaderActionsSkeleton } from "./header-actions";

describe("HeaderActions", () => {
  it("offers sign in and sign up to visitors", () => {
    render(<HeaderActions signedIn={false} />);
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
    expect(screen.getByRole("link", { name: "Get started" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
    expect(
      screen.queryByRole("link", { name: "Go to dashboard" }),
    ).not.toBeInTheDocument();
  });

  it("links signed-in users to the dashboard", () => {
    render(<HeaderActions signedIn />);
    expect(
      screen.getByRole("link", { name: "Go to dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
    expect(
      screen.queryByRole("link", { name: "Sign in" }),
    ).not.toBeInTheDocument();
  });
});

describe("HeaderActionsSkeleton", () => {
  it("is hidden from assistive tech and has no links", () => {
    const { container } = render(<HeaderActionsSkeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
