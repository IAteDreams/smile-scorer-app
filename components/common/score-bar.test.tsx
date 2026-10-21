import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScoreBar } from "./score-bar";

const fill = (container: HTMLElement) =>
  container.querySelector('[data-slot="score-bar-fill"]');

describe("ScoreBar", () => {
  it("fills to the score out of 100", () => {
    const { container } = render(<ScoreBar value={92} />);
    expect(fill(container)).toHaveStyle({ width: "92%" });
  });

  it("fills relative to a custom max", () => {
    const { container } = render(<ScoreBar value={6} max={12} />);
    expect(fill(container)).toHaveStyle({ width: "50%" });
  });

  it.each([
    [-5, 100, "0%"],
    [150, 100, "100%"],
    [3, 0, "0%"],
  ])("clamps %s of %s to %s", (value, max, width) => {
    const { container } = render(<ScoreBar value={value} max={max} />);
    expect(fill(container)).toHaveStyle({ width });
  });

  it("is decorative and accepts layout classes", () => {
    const { container } = render(<ScoreBar value={50} className="flex-1" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstChild).toHaveClass("flex-1", "bg-muted");
  });
});
