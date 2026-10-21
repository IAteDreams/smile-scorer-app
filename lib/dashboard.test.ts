import { describe, expect, it } from "vitest";
import type { ScoreDetails } from "@/db/schema/score";
import type { ScoreEntry } from "@/types/score";

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
  getHistory,
  getStats,
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
    score: 70,
    label: "Smiling",
    faceCount: 1,
    details: DETAILS,
    ...rest,
  } satisfies ScoreEntry;
};

describe("dayKey", () => {
  it("uses the calendar day in the given time zone", () => {
    const evening = Date.parse("2026-10-21T20:00:00Z");
    expect(dayKey(evening, "UTC")).toBe("2026-10-21");
    expect(dayKey(evening, "Asia/Manila")).toBe("2026-10-22");
  });
});

describe("getStreak", () => {
  it("counts consecutive days ending today", () => {
    const entries = [0, 0, 1, 2, 4].map((daysAgo) => entry({ daysAgo }));
    expect(getStreak(entries, NOW, "UTC")).toEqual({
      days: 3,
      scoredToday: true,
    });
  });

  it("keeps a streak alive until the day is over", () => {
    const entries = [1, 2].map((daysAgo) => entry({ daysAgo }));
    expect(getStreak(entries, NOW, "UTC")).toEqual({
      days: 2,
      scoredToday: false,
    });
  });

  it("is zero after a missed day", () => {
    expect(getStreak([entry({ daysAgo: 2 })], NOW, "UTC").days).toBe(0);
    expect(getStreak([], NOW, "UTC").days).toBe(0);
  });

  it("follows the viewer's time zone", () => {
    const earlyManilaMorning = entry({ uploadedAt: "2026-10-20T20:00:00Z" });
    expect(getStreak([earlyManilaMorning], NOW, "Asia/Manila")).toEqual({
      days: 1,
      scoredToday: true,
    });
    expect(getStreak([earlyManilaMorning], NOW, "UTC")).toEqual({
      days: 1,
      scoredToday: false,
    });
  });
});

describe("getStats", () => {
  it("summarizes the photos", () => {
    const best = entry({ daysAgo: 40, score: 96, label: "Beaming" });
    const entries = [
      entry({ daysAgo: 0, score: 81 }),
      entry({ daysAgo: 3, score: 90 }),
      entry({ daysAgo: 10, score: 70 }),
      best,
      entry({ daysAgo: 45, score: 50 }),
    ];

    const stats = getStats(entries, NOW, "UTC");
    expect(stats.count).toBe(5);
    expect(stats.average).toBe(77);
    expect(stats.averageChange).toBe(7);
    expect(stats.best).toBe(best);
    expect(stats.thisWeek).toBe(2);
    expect(stats.streak).toEqual({ days: 1, scoredToday: true });
  });

  it("has no change without photos in both 30-day windows", () => {
    expect(getStats([entry()], NOW, "UTC").averageChange).toBeNull();
  });

  it("handles a new account", () => {
    expect(getStats([], NOW, "UTC")).toEqual({
      count: 0,
      average: null,
      averageChange: null,
      best: null,
      thisWeek: 0,
      streak: { days: 0, scoredToday: false },
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
  it("counts photos in each score band", () => {
    const entries = [
      entry({ label: "Beaming" }),
      entry({ label: "Beaming" }),
      entry({ label: "Neutral" }),
    ];
    expect(getBreakdown(entries)).toEqual([
      { label: "Beaming", min: 85, max: 100, count: 2 },
      { label: "Smiling", min: 60, max: 84, count: 0 },
      { label: "Slight smile", min: 30, max: 59, count: 0 },
      { label: "Neutral", min: 0, max: 29, count: 1 },
    ]);
  });
});

describe("getHistory", () => {
  const beach = entry({ fileName: "Beach-Day.jpg", daysAgo: 0, score: 60 });
  const office = entry({ fileName: "office.jpg", daysAgo: 2, score: 90 });
  const party = entry({ fileName: "party.png", daysAgo: 1, score: 60 });
  const entries = [office, beach, party];

  it("searches file names, ignoring case and spaces", () => {
    expect(getHistory(entries, { query: "  beach ", sort: "newest" })).toEqual([
      beach,
    ]);
  });

  it.each([
    ["newest", [beach, party, office]],
    ["oldest", [office, party, beach]],
    ["highest", [office, beach, party]],
    ["lowest", [beach, party, office]],
  ] as const)("sorts by %s", (sort, expected) => {
    expect(getHistory(entries, { query: "", sort })).toEqual(expected);
  });

  it("does not change the original list", () => {
    getHistory(entries, { query: "", sort: "newest" });
    expect(entries).toEqual([office, beach, party]);
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
  const scores = [92, 81, 70, 50].map((score) => entry({ score }));

  it("compares a photo with the user's average and best", () => {
    expect(describeScore(scores[0], scores)).toBe(
      "19 points above your average. Your best score so far.",
    );
    expect(describeScore(scores[1], scores)).toBe(
      "8 points above your average. Your second-best score so far.",
    );
    expect(describeScore(scores[3], scores)).toBe(
      "23 points below your average. Ranked 4 of 4.",
    );
  });

  it("handles one point and the exact average", () => {
    const pair = [entry({ score: 61 }), entry({ score: 59 })];
    expect(describeScore(pair[0], pair)).toBe(
      "1 point above your average. Your best score so far.",
    );
    const even = [entry({ score: 60 }), entry({ score: 60 })];
    expect(describeScore(even[0], even)).toBe(
      "Right on your average. Your best score so far.",
    );
  });

  it("has nothing to compare for the first photo", () => {
    expect(describeScore(scores[0], [scores[0]])).toBe(
      "Your first score. Upload more to compare.",
    );
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
  it("formats the best photo's day and keeps the rest", () => {
    const best = entry({ fileName: "sunset.jpg", score: 96, daysAgo: 23 });
    const summary = toStatSummary(
      getStats([entry({ score: 70 }), best], NOW, "UTC"),
      NOW,
      "UTC",
    );
    expect(summary).toEqual({
      average: 83,
      averageChange: null,
      best: { score: 96, fileName: "sunset.jpg", day: "Sep 28" },
      count: 2,
      thisWeek: 1,
      streak: { days: 1, scoredToday: true },
    });
  });

  it("has no best photo without photos", () => {
    expect(toStatSummary(getStats([], NOW, "UTC"), NOW, "UTC").best).toBeNull();
  });
});

describe("toHistoryRow", () => {
  it("formats an entry for the history table", () => {
    const photo = entry({ fileName: "beach.jpg", score: 92 });
    expect(toHistoryRow(photo, NOW, "UTC")).toEqual({
      id: photo.id,
      fileName: "beach.jpg",
      photoUrl: null,
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
    const others = [photo, entry({ score: 60 })];
    expect(toPhotoDetails(photo, others, NOW, "UTC")).toEqual({
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
