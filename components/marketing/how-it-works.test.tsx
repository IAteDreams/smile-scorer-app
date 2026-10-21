import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants/marketing";

import { HowItWorks } from "./how-it-works";

describe("HowItWorks", () => {
  it("is the target of the How it works links", () => {
    render(<HowItWorks />);
    expect(
      screen.getByRole("region", { name: "Three steps to a score" }),
    ).toHaveAttribute("id", "how-it-works");
  });

  it("renders every step in order", () => {
    render(<HowItWorks />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(HOW_IT_WORKS_STEPS.length);
    HOW_IT_WORKS_STEPS.forEach((step, index) => {
      expect(items[index]).toHaveTextContent(step.title);
      expect(items[index]).toHaveTextContent(step.body);
    });
  });
});
