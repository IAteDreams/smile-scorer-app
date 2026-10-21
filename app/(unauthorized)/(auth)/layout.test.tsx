import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AuthLayout from "./layout";

vi.mock("@/public/group_of_friends.webp", () => ({
  default: {
    src: "/group_of_friends.webp",
    width: 3648,
    height: 5322,
    blurDataURL: "data:image/webp;base64,AAAA",
  },
}));

const renderLayout = () =>
  render(
    <AuthLayout params={Promise.resolve({})}>
      <p>form</p>
    </AuthLayout>,
  );

describe("AuthLayout", () => {
  it("spaces the legal links in the footer sentence", () => {
    renderLayout();
    expect(screen.getByText(/By continuing you agree to our/).textContent).toBe(
      "By continuing you agree to our Terms and Privacy Policy.",
    );
  });

  it("links to the legal pages", () => {
    renderLayout();
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy");
  });

  it("renders the page content", () => {
    renderLayout();
    expect(screen.getByText("form")).toBeInTheDocument();
  });
});
