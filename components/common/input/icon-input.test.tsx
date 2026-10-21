import { render, screen } from "@testing-library/react";
import { Mail } from "lucide-react";
import { describe, expect, it } from "vitest";

import { IconInput } from "./icon-input";

describe("IconInput", () => {
  it("passes input props through", () => {
    render(
      <IconInput icon={Mail} aria-label="Email" type="email" name="email" />,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("name", "email");
  });

  it("hides the icon from assistive tech", () => {
    const { container } = render(<IconInput icon={Mail} aria-label="Email" />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("renders the trailing element and leaves room for it", () => {
    render(
      <IconInput
        icon={Mail}
        aria-label="Email"
        trailing={<button type="button">Clear</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveClass("pr-9");
  });

  it("does not pad the right side without a trailing element", () => {
    render(<IconInput icon={Mail} aria-label="Email" />);
    expect(screen.getByRole("textbox")).not.toHaveClass("pr-9");
  });
});
