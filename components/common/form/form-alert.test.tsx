import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormAlert } from "./form-alert";

describe("FormAlert", () => {
  it("announces the message as an alert", () => {
    render(<FormAlert message="Invalid email or password" />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid email or password",
    );
  });
});
