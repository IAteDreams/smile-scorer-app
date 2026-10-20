import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Score my smile</Button>);
    expect(
      screen.getByRole("button", { name: "Score my smile" }),
    ).toBeInTheDocument();
  });
});
