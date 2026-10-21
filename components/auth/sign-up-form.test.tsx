import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SignUpForm } from "./sign-up-form";

const props = {
  onSubmit: vi.fn(),
  pending: false,
  errors: {},
  formError: null,
};

describe("SignUpForm", () => {
  it("renders name, email and password fields", () => {
    render(<SignUpForm {...props} />);
    expect(screen.getByLabelText("Name")).toHaveAttribute(
      "autocomplete",
      "name",
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });

  it("shows each field's error", () => {
    render(
      <SignUpForm
        {...props}
        errors={{
          name: ["Enter your name"],
          password: ["Use at least 8 characters"],
        }}
      />,
    );
    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription(
      "Enter your name",
    );
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "Use at least 8 characters",
    );
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
  });

  it("shows the form error", () => {
    render(<SignUpForm {...props} formError="User already exists" />);
    expect(screen.getByRole("alert")).toHaveTextContent("User already exists");
  });

  it("disables submit while pending", () => {
    render(<SignUpForm {...props} pending />);
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeDisabled();
  });
});
