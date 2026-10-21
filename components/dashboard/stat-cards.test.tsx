import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { StatSummary } from "@/types/score";

import { StatCards } from "./stat-cards";

const STATS: StatSummary = {
  average: 81,
  averageChange: 6,
  best: { score: 96, fileName: "sunset-walk.jpg", day: "Sep 28" },
  count: 24,
  thisWeek: 5,
  streak: { days: 6, scoredToday: true },
};

const card = (label: string) => screen.getByText(label).parentElement!;

describe("StatCards", () => {
  it("shows the four stats", () => {
    render(<StatCards stats={STATS} />);
    expect(card("Average score")).toHaveTextContent(
      "81+6 vs. previous 30 days",
    );
    expect(card("Best score")).toHaveTextContent("96sunset-walk.jpg · Sep 28");
    expect(card("Photos scored")).toHaveTextContent("245 this week");
    expect(card("Smile streak")).toHaveTextContent("6 daysYou scored today");
  });

  it.each([
    [-4, "−4 vs. previous 30 days"],
    [0, "Same as previous 30 days"],
    [null, "Across all your photos"],
  ])("describes an average change of %s", (averageChange, text) => {
    render(<StatCards stats={{ ...STATS, averageChange: averageChange }} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("nudges the user to keep a streak going", () => {
    render(
      <StatCards
        stats={{ ...STATS, streak: { days: 1, scoredToday: false } }}
      />,
    );
    expect(card("Smile streak")).toHaveTextContent(
      "1 dayUpload today to keep it",
    );
  });

  it("handles a new account", () => {
    render(
      <StatCards
        stats={{
          average: null,
          averageChange: null,
          best: null,
          count: 0,
          thisWeek: 0,
          streak: { days: 0, scoredToday: false },
        }}
      />,
    );
    expect(card("Average score")).toHaveTextContent("—");
    expect(card("Best score")).toHaveTextContent("—No photos yet");
    expect(card("Smile streak")).toHaveTextContent(
      "0 daysUpload a photo to start one",
    );
  });
});
