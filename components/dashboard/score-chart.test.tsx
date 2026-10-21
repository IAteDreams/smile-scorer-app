import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ChartPoint } from "@/types/score";

import { ScoreChart } from "./score-chart";

const points: ChartPoint[] = [
  { id: "1", score: 64, label: "Smiling", fileName: "a.jpg", date: "Oct 1" },
  { id: "2", score: 92, label: "Beaming", fileName: "b.jpg", date: "Oct 2" },
];

describe("ScoreChart", () => {
  it("draws one bar per photo, oldest first, scaled to the score", () => {
    render(
      <ScoreChart points={points} range="recent" onRangeChange={vi.fn()} />,
    );

    const bars = within(
      screen.getByRole("list", { name: "Scores from oldest to newest" }),
    ).getAllByRole("listitem");
    expect(bars.map((bar) => bar.getAttribute("aria-label"))).toEqual([
      "a.jpg, Oct 1: 64, Smiling",
      "b.jpg, Oct 2: 92, Beaming",
    ]);
    expect(bars[0].firstElementChild).toHaveStyle({ height: "64%" });
  });

  it("highlights only the latest upload", () => {
    render(
      <ScoreChart points={points} range="recent" onRangeChange={vi.fn()} />,
    );
    const bars = screen.getAllByRole("listitem");
    expect(bars[0].firstElementChild).not.toHaveAttribute("data-latest");
    expect(bars[1].firstElementChild).toHaveAttribute("data-latest", "true");
  });

  it("keeps bars with a score of 0 visible", () => {
    render(
      <ScoreChart
        points={[{ ...points[0], score: 0 }]}
        range="all"
        onRangeChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("listitem").firstElementChild).toHaveStyle({
      height: "1%",
    });
  });

  it("describes and switches the range", () => {
    const onRangeChange = vi.fn();
    render(
      <ScoreChart
        points={points}
        range="recent"
        onRangeChange={onRangeChange}
      />,
    );

    expect(screen.getByText("Last 14 uploads")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "14 uploads" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "30 days" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    fireEvent.click(screen.getByRole("button", { name: "30 days" }));
    expect(onRangeChange).toHaveBeenCalledWith("30d");
  });

  it("explains an empty range", () => {
    render(<ScoreChart points={[]} range="30d" onRangeChange={vi.fn()} />);
    expect(
      screen.getByText("No photos in this range yet."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
