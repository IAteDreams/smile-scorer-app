import { describe, expect, it } from "vitest";
import type { ScoreDetails } from "@/db/schema/score";
import type { ScoreEntry, ScoreSummary } from "@/types/score";

import {
  DAY_MS,
  dayKey,
  describeScore,
  faceAttributes,
  firstName,
  formatDay,
  formatEmotion,
  formatPercent,
  formatUploadedAt,
  getBreakdown,
  getChartEntries,
  getStreak,
  greeting,
  initials,
  toChartPoint,
  toHistoryRow,
  toPhotoDetails,
  toStatSummary,
} from "./dashboard";

const NOW = Date.parse("2026-10-21T14:14:00Z");

const DETAILS: ScoreDetails = {
  faceConfidence: 99.9,
  smile: { value: true, confidence: 99.2 },
  topEmotion: { type: "HAPPY", confidence: 98.1 },
  mouthOpen: { value: false, confidence: 80 },
  eyesOpen: { value: true, confidence: 99.7 },
  quality: { brightness: 72.6, sharpness: 86.1 },
  boundingBox: { left: 0.3, top: 0.4, width: 0.2, height: 0.2 },
};

let nextId = 0;
const entry = (overrides: Partial<ScoreEntry> & { daysAgo?: number } = {}) => {
  const { daysAgo = 0, ...rest } = overrides;
  nextId++;
  return {
    id: `entry-${nextId}`,
    fileName: `photo-${nextId}.jpg`,
    uploadedAt: new Date(NOW - daysAgo * DAY_MS).toISOString(),
    photoUrl: null,
    thumbnailUrl: null,
    score: 70,
    label: "Smiling",
    rank: 1,
    faceCount: 1,
    details: DETAILS,
    ...rest,
  } satisfies ScoreEntry;
};

const summary = (overrides: Partial<ScoreSummary> = {}): ScoreSummary => ({
  count: 0,
  average: null,
  recentAverage: null,
  previousAverage: null,
  thisWeek: 0,
  best: null,
  latest: null,
  bands: { Beaming: 0, Smiling: 0, "Slight smile": 0, Neutral: 0 },
  recent: [],
  uploadTimes: [],
  ...overrides,
});

describe("dayKey", () => {
  it("uses the calendar day in the given time zone", () => {
    const evening = Date.parse("2026-10-21T20:00:00Z");
    expect(dayKey(evening, "UTC")).toBe("2026-10-21");
    expect(dayKey(evening, "Asia/Manila")).toBe("2026-10-22");
  });
});

describe("getStreak", () => {
  const daysAgo = (...days: number[]) =>
    days.map((day) => new Date(NOW - day * DAY_MS).toISOString());

  it("counts consecutive days ending today", () => {
    expect(getStreak(daysAgo(0, 0, 1, 2, 4), NOW, "UTC")).toEqual({
      days: 3,
      scoredToday: true,
    });
  });

  it("keeps a streak alive until the day is over", () => {
    expect(getStreak(daysAgo(1, 2), NOW, "UTC")).toEqual({
      days: 2,
      scoredToday: false,
    });
  });

  it("is zero after a missed day", () => {
    expect(getStreak(daysAgo(2), NOW, "UTC").days).toBe(0);
    expect(getStreak([], NOW, "UTC").days).toBe(0);
  });

  it("follows the viewer's time zone", () => {
    const earlyManilaMorning = ["2026-10-20T20:00:00Z"];
    expect(getStreak(earlyManilaMorning, NOW, "Asia/Manila")).toEqual({
      days: 1,
      scoredToday: true,
    });
    expect(getStreak(earlyManilaMorning, NOW, "UTC")).toEqual({
      days: 1,
      scoredToday: false,
    });
  });
});

describe("getChartEntries", () => {
  const entries = Array.from({ length: 20 }, (_, i) =>
    entry({ daysAgo: i * 3, score: i }),
  );

  it("shows the last 14 uploads, oldest first", () => {
    const points = getChartEntries(entries, "recent", NOW);
    expect(points).toHaveLength(14);
    expect(points[0].score).toBe(13);
    expect(points.at(-1)?.score).toBe(0);
  });

  it("can show the last 30 days", () => {
    const points = getChartEntries(entries, "30d", NOW);
    expect(points.map((point) => point.score)).toEqual([
      9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
    ]);
  });

  it("can show everything", () => {
    expect(getChartEntries(entries, "all", NOW)).toHaveLength(20);
  });
});

describe("getBreakdown", () => {
  it("lists every score band with its range and count", () => {
    expect(
      getBreakdown({ Beaming: 2, Smiling: 0, "Slight smile": 0, Neutral: 1 }),
    ).toEqual([
      { label: "Beaming", min: 85, max: 100, count: 2 },
      { label: "Smiling", min: 60, max: 84, count: 0 },
      { label: "Slight smile", min: 30, max: 59, count: 0 },
      { label: "Neutral", min: 0, max: 29, count: 1 },
    ]);
  });
});

describe("greeting", () => {
  it.each([
    ["2026-10-21T08:00:00Z", "UTC", "Good morning"],
    ["2026-10-21T14:14:00Z", "UTC", "Good afternoon"],
    ["2026-10-21T14:14:00Z", "Asia/Manila", "Good evening"],
  ])("greets %s in %s with %s", (iso, timeZone, text) => {
    expect(greeting(Date.parse(iso), timeZone)).toBe(text);
  });
});

describe("formatUploadedAt", () => {
  it.each([
    ["2026-10-21T09:05:00Z", /^Today, 9:05\sAM$/],
    ["2026-10-20T18:30:00Z", /^Yesterday, 6:30\sPM$/],
    ["2026-10-18T10:00:00Z", /^Oct 18$/],
    ["2025-12-30T10:00:00Z", /^Dec 30, 2025$/],
  ])("formats %s", (iso, expected) => {
    expect(formatUploadedAt(iso, NOW, "UTC")).toMatch(expected);
  });
});

describe("formatDay", () => {
  it("adds the year only for other years", () => {
    expect(formatDay("2026-09-28T10:00:00Z", NOW, "UTC")).toBe("Sep 28");
    expect(formatDay("2025-09-28T10:00:00Z", NOW, "UTC")).toBe("Sep 28, 2025");
  });
});

describe("formatters", () => {
  it("formats emotions from Rekognition", () => {
    expect(formatEmotion("HAPPY")).toBe("Happy");
    expect(formatEmotion(null)).toBe("—");
  });

  it("formats confidence", () => {
    expect(formatPercent(98.1)).toBe("98.1%");
    expect(formatPercent(99)).toBe("99.0%");
    expect(formatPercent(null)).toBe("—");
  });

  it.each([
    ["Maria Reyes", "MR"],
    ["Maria Santos Reyes", "MR"],
    ["maria", "MA"],
    ["  ", "?"],
  ])("makes initials from %j", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });

  it("finds the first name", () => {
    expect(firstName(" Maria Reyes")).toBe("Maria");
  });
});

describe("describeScore", () => {
  const totals = { average: 73, count: 4 };

  it("compares a photo with the user's average and rank", () => {
    expect(describeScore({ score: 92, rank: 1 }, totals)).toBe(
      "19 points above your average. Your best score so far.",
    );
    expect(describeScore({ score: 81, rank: 2 }, totals)).toBe(
      "8 points above your average. Your second-best score so far.",
    );
    expect(describeScore({ score: 50, rank: 4 }, totals)).toBe(
      "23 points below your average. Ranked 4 of 4.",
    );
  });

  it("handles one point and the exact average", () => {
    expect(
      describeScore({ score: 61, rank: 1 }, { average: 60, count: 2 }),
    ).toBe("1 point above your average. Your best score so far.");
    expect(
      describeScore({ score: 60, rank: 1 }, { average: 60, count: 2 }),
    ).toBe("Right on your average. Your best score so far.");
  });

  it("has nothing to compare for the first photo", () => {
    expect(
      describeScore({ score: 92, rank: 1 }, { average: 92, count: 1 }),
    ).toBe("Your first score. Upload more to compare.");
    expect(
      describeScore({ score: 92, rank: 1 }, { average: null, count: 0 }),
    ).toBe("Your first score. Upload more to compare.");
  });
});

describe("faceAttributes", () => {
  it("lists what Rekognition saw", () => {
    expect(faceAttributes(DETAILS)).toEqual([
      { name: "Smile", value: "Yes", confidence: "99.2%" },
      { name: "Top emotion", value: "Happy", confidence: "98.1%" },
      { name: "Mouth open", value: "No", confidence: "80.0%" },
      { name: "Eyes open", value: "Yes", confidence: "99.7%" },
      { name: "Sharpness", value: "86", confidence: "/ 100" },
      { name: "Brightness", value: "73", confidence: "/ 100" },
    ]);
  });

  it("handles a face with no emotion", () => {
    expect(faceAttributes({ ...DETAILS, topEmotion: null })[1]).toEqual({
      name: "Top emotion",
      value: "—",
      confidence: "—",
    });
  });
});

describe("toStatSummary", () => {
  it("turns the database totals into the stat cards", () => {
    const best = entry({ fileName: "sunset.jpg", score: 96, daysAgo: 23 });
    expect(
      toStatSummary(
        summary({
          count: 5,
          average: 77,
          recentAverage: 80,
          previousAverage: 73,
          thisWeek: 2,
          best,
          uploadTimes: [new Date(NOW).toISOString()],
        }),
        NOW,
        "UTC",
      ),
    ).toEqual({
      average: 77,
      averageChange: 7,
      best: { score: 96, fileName: "sunset.jpg", day: "Sep 28" },
      count: 5,
      thisWeek: 2,
      streak: { days: 1, scoredToday: true },
    });
  });

  it("has no change without scores in both 30-day windows", () => {
    expect(
      toStatSummary(summary({ recentAverage: 80 }), NOW, "UTC").averageChange,
    ).toBeNull();
  });

  it("handles a new account", () => {
    expect(toStatSummary(summary(), NOW, "UTC")).toEqual({
      average: null,
      averageChange: null,
      best: null,
      count: 0,
      thisWeek: 0,
      streak: { days: 0, scoredToday: false },
    });
  });
});

describe("toHistoryRow", () => {
  it("formats an entry for the history table", () => {
    const photo = entry({ fileName: "beach.jpg", score: 92 });
    expect(toHistoryRow(photo, NOW, "UTC")).toEqual({
      id: photo.id,
      fileName: "beach.jpg",
      photoUrl: null,
      thumbnailUrl: null,
      uploaded: expect.stringMatching(/^Today, 2:14\sPM$/),
      score: 92,
      emotion: "Happy",
      confidence: "98.1%",
    });
  });

  it("shows dashes when no emotion was found", () => {
    const photo = entry({ details: { ...DETAILS, topEmotion: null } });
    expect(toHistoryRow(photo, NOW, "UTC")).toMatchObject({
      emotion: "—",
      confidence: "—",
    });
  });
});

describe("toChartPoint", () => {
  it("formats an entry for the score chart", () => {
    const photo = entry({ fileName: "graduation.png", score: 81, daysAgo: 3 });
    expect(toChartPoint(photo, NOW, "UTC")).toEqual({
      id: photo.id,
      score: 81,
      label: "Smiling",
      fileName: "graduation.png",
      date: "Oct 18",
    });
  });
});

describe("toPhotoDetails", () => {
  it("prepares everything the photo dialog shows", () => {
    const photo = entry({ fileName: "beach.jpg", score: 92, label: "Beaming" });
    const totals = { average: 76, count: 2 };
    expect(toPhotoDetails(photo, totals, NOW, "UTC")).toEqual({
      id: photo.id,
      fileName: "beach.jpg",
      uploaded: expect.stringMatching(/^Today, /),
      photoUrl: null,
      score: 92,
      label: "Beaming",
      comparison: "16 points above your average. Your best score so far.",
      faceCount: 1,
      faceConfidence: "99.9%",
      boundingBox: DETAILS.boundingBox,
      attributes: faceAttributes(DETAILS),
    });
  });
});
