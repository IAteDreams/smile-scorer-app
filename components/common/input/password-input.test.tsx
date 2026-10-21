import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PasswordInput } from "./password-input";

const getInput = () => screen.getByLabelText("Password");

describe("PasswordInput", () => {
  it("starts hidden", () => {
    render(<PasswordInput aria-label="Password" />);
    expect(getInput()).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles visibility", () => {
    render(<PasswordInput aria-label="Password" />);

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(getInput()).toHaveAttribute("type", "text");
    const hide = screen.getByRole("button", { name: "Hide password" });
    expect(hide).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(hide);
    expect(getInput()).toHaveAttribute("type", "password");
  });

  it("does not submit the surrounding form when toggled", () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) =>
      event.preventDefault(),
    );
    render(
      <form onSubmit={onSubmit}>
        <PasswordInput aria-label="Password" />
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
