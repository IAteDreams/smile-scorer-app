import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScoreBreakdown } from "./score-breakdown";

const bands = [
  { label: "Beaming", min: 85, max: 100, count: 6 },
  { label: "Smiling", min: 60, max: 84, count: 12 },
  { label: "Slight smile", min: 30, max: 59, count: 3 },
  { label: "Neutral", min: 0, max: 29, count: 0 },
] as const;

describe("ScoreBreakdown", () => {
  it("lists each band with its range and count", () => {
    render(<ScoreBreakdown bands={[...bands]} total={21} />);
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveTextContent("Beaming 85–1006");
    expect(rows[3]).toHaveTextContent("Neutral 0–290");
    expect(screen.getByText("All 21 photos")).toBeInTheDocument();
  });

  it("sizes bars against the biggest band", () => {
    render(<ScoreBreakdown bands={[...bands]} total={21} />);
    const fill = (index: number) =>
      screen.getAllByRole("listitem")[index].lastElementChild!
        .firstElementChild;
    expect(fill(0)).toHaveStyle({ width: "50%" });
    expect(fill(1)).toHaveStyle({ width: "100%" });
    expect(fill(3)).toHaveStyle({ width: "0%" });
  });

  it("handles no photos", () => {
    render(
      <ScoreBreakdown
        bands={bands.map((band) => ({ ...band, count: 0 }))}
        total={0}
      />,
    );
    expect(screen.getByText("No photos yet")).toBeInTheDocument();
  });
});
