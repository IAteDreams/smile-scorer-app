import { describe, expect, it } from "vitest";
import { getStreak } from "@/lib/dashboard";
import { scoreLabel } from "@/lib/scoring";

import { sampleScores } from "./sample-scores";

const NOW = Date.parse("2026-10-21T14:14:00Z");

describe("sampleScores", () => {
  const entries = sampleScores(NOW);

  it("dates every photo relative to now, newest first", () => {
    expect(entries).toHaveLength(24);
    const times = entries.map((entry) => Date.parse(entry.uploadedAt));
    expect(times.every((t) => t < NOW)).toBe(true);
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it("labels each score the way the scorer does", () => {
    for (const entry of entries) {
      expect(entry.label).toBe(scoreLabel(entry.score));
    }
  });

  it("has unique ids", () => {
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(24);
  });

  it("includes a streak that is still going today", () => {
    expect(getStreak(entries, NOW, "UTC")).toEqual({
      days: 6,
      scoredToday: true,
    });
  });
});
