import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SignInForm } from "./sign-in-form";

const props = {
  onSubmit: vi.fn(),
  pending: false,
  errors: {},
  formError: null,
};

describe("SignInForm", () => {
  it("renders email and password fields", () => {
    render(<SignInForm {...props} />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByRole("link", { name: "Create one" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
  });

  it("marks fields with errors as invalid", () => {
    render(
      <SignInForm
        {...props}
        errors={{ email: ["Enter a valid email address"] }}
      />,
    );
    const email = screen.getByLabelText("Email");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription("Enter a valid email address");
    expect(screen.getByLabelText("Password")).not.toHaveAttribute(
      "aria-invalid",
    );
  });

  it("shows the form error", () => {
    render(<SignInForm {...props} formError="Invalid email or password" />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid email or password",
    );
  });

  it("disables submit while pending", () => {
    render(<SignInForm {...props} pending />);
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
  });
});
