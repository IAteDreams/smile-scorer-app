import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CheckEmail } from "./check-email";

describe("CheckEmail", () => {
  it("shows where the link was sent", () => {
    render(<CheckEmail email="maria@example.com" />);
    expect(
      screen.getByRole("heading", { name: "Check your email" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We sent a verification link to/),
    ).toHaveTextContent(
      "We sent a verification link to maria@example.com. Open it",
    );
  });

  it("links back to sign in", () => {
    render(<CheckEmail email="maria@example.com" />);
    expect(
      screen.getByRole("link", { name: "Back to sign in" }),
    ).toHaveAttribute("href", "/sign-in");
  });
});
