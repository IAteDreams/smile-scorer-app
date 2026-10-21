import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormField } from "./form-field";

describe("FormField", () => {
  it("labels its control", () => {
    render(
      <FormField id="email" label="Email">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email");
  });

  it("shows the error with an id the control can reference", () => {
    render(
      <FormField id="email" label="Email" error="Enter a valid email address">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByText("Enter a valid email address")).toHaveAttribute(
      "id",
      "email-error",
    );
  });

  it("renders no error element without an error", () => {
    const { container } = render(
      <FormField id="email" label="Email">
        <input id="email" />
      </FormField>,
    );
    expect(container.querySelector("#email-error")).toBeNull();
  });
});
