import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignIn } from "./sign-in";

const { email, push, refresh } = vi.hoisted(() => ({
  email: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({ signIn: { email } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const fillAndSubmit = async () => {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "maria@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "secret123" },
  });
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Sign in" })),
  );
};

describe("SignIn", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not call the API when the form is invalid", () => {
    render(<SignIn />);
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
    expect(email).not.toHaveBeenCalled();
  });

  it("signs in and redirects home", async () => {
    email.mockResolvedValue({ data: {}, error: null });
    render(<SignIn />);

    await fillAndSubmit();

    expect(email).toHaveBeenCalledWith({
      email: "maria@example.com",
      password: "secret123",
    });
    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(refresh).toHaveBeenCalled();
  });

  it("shows the API error and stays on the page", async () => {
    email.mockResolvedValue({
      data: null,
      error: { status: 401, message: "Invalid email or password" },
    });
    render(<SignIn />);

    await fillAndSubmit();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid email or password",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
