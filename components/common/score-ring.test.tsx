import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScoreRing } from "./score-ring";

const ring = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="score-ring"]')!;

describe("ScoreRing", () => {
  it("fills the ring to the score", () => {
    const { container } = render(<ScoreRing score={92} />);
    expect(ring(container).style.background).toContain("92%");
    expect(screen.getByText("92")).toBeInTheDocument();
  });

  it("is compact by default, without the out-of label", () => {
    const { container } = render(<ScoreRing score={92} />);
    expect(ring(container)).toHaveClass("size-16");
    expect(screen.queryByText("/ 100")).not.toBeInTheDocument();
  });

  it("shows the out-of label when large", () => {
    const { container } = render(<ScoreRing score={92} size="lg" />);
    expect(ring(container)).toHaveClass("size-28");
    expect(screen.getByText("/ 100")).toBeInTheDocument();
  });

  it("matches the surface it sits on", () => {
    render(<ScoreRing score={50} surfaceClassName="bg-popover" />);
    expect(screen.getByText("50").parentElement).toHaveClass("bg-popover");
  });

  it("keeps the fill within 0–100", () => {
    const { container } = render(<ScoreRing score={140} />);
    expect(ring(container).style.background).toContain("100%");
  });
});
