import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignUp } from "./sign-up";

const { email } = vi.hoisted(() => ({ email: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({ signUp: { email } }));

const fillAndSubmit = async () => {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Maria" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "maria@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "secret123" },
  });
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Create account" })),
  );
};

describe("SignUp", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not call the API when the form is invalid", () => {
    render(<SignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(screen.getByText("Enter your name")).toBeInTheDocument();
    expect(email).not.toHaveBeenCalled();
  });

  it("creates the account and asks the user to check their email", async () => {
    email.mockResolvedValue({ data: {}, error: null });
    render(<SignUp />);

    await fillAndSubmit();

    expect(email).toHaveBeenCalledWith({
      name: "Maria",
      email: "maria@example.com",
      password: "secret123",
      callbackURL: "/dashboard",
    });
    expect(
      screen.getByRole("heading", { name: "Check your email" }),
    ).toBeInTheDocument();
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();
  });

  it("shows the API error and keeps the form", async () => {
    email.mockResolvedValue({
      data: null,
      error: { status: 422, message: "User already exists" },
    });
    render(<SignUp />);

    await fillAndSubmit();

    expect(screen.getByRole("alert")).toHaveTextContent("User already exists");
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
  });
});
