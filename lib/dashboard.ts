import { RECENT_UPLOADS } from "@/lib/constants/dashboard";
import { SCORE_LABELS } from "@/lib/constants/scoring";
import type { ScoreDetails } from "@/db/schema/score";
import type { FaceAttribute, PhotoDetailsData } from "@/types/photo";
import type {
  ChartEntry,
  ChartPoint,
  ChartRange,
  HistoryRow,
  ScoreEntry,
  ScoreLabel,
  ScoreSummary,
  ScoreTotals,
  StatSummary,
  Streak,
} from "@/types/score";

export const DAY_MS = 24 * 60 * 60 * 1000;

const time = (entry: { uploadedAt: string }) => Date.parse(entry.uploadedAt);

export function dayKey(date: Date | number, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getStreak(
  uploadTimes: readonly string[],
  now: number,
  timeZone: string,
): Streak {
  const days = new Set(
    uploadTimes.map((iso) => dayKey(Date.parse(iso), timeZone)),
  );
  const scoredToday = days.has(dayKey(now, timeZone));

  let cursor = scoredToday ? now : now - DAY_MS;
  let length = 0;
  while (days.has(dayKey(cursor, timeZone))) {
    length++;
    cursor -= DAY_MS;
  }
  return { days: length, scoredToday };
}

export function toStatSummary(
  summary: ScoreSummary,
  now: number,
  timeZone: string,
): StatSummary {
  const { best, recentAverage, previousAverage } = summary;
  return {
    average: summary.average,
    averageChange:
      recentAverage !== null && previousAverage !== null
        ? recentAverage - previousAverage
        : null,
    best: best && {
      score: best.score,
      fileName: best.fileName,
      day: formatDay(best.uploadedAt, now, timeZone),
    },
    count: summary.count,
    thisWeek: summary.thisWeek,
    streak: getStreak(summary.uploadTimes, now, timeZone),
  };
}

export function getChartEntries(
  entries: readonly ChartEntry[],
  range: ChartRange,
  now: number,
) {
  const sorted = [...entries].sort((a, b) => time(a) - time(b));
  if (range === "recent") return sorted.slice(-RECENT_UPLOADS);
  if (range === "30d") {
    return sorted.filter((entry) => time(entry) > now - 30 * DAY_MS);
  }
  return sorted;
}

export function getBreakdown(bands: Record<ScoreLabel, number>) {
  return SCORE_LABELS.map((band, index) => ({
    label: band.label,
    min: band.min,
    max: index === 0 ? 100 : SCORE_LABELS[index - 1].min - 1,
    count: bands[band.label],
  }));
}

export type ScoreBand = ReturnType<typeof getBreakdown>[number];

export function greeting(now: number, timeZone: string) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      hourCycle: "h23",
    }).format(now),
  );
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatDay(iso: string, now: number, timeZone: string) {
  const date = new Date(iso);
  const sameYear =
    dayKey(date, timeZone).slice(0, 4) === dayKey(now, timeZone).slice(0, 4);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  }).format(date);
}

export function formatUploadedAt(iso: string, now: number, timeZone: string) {
  const date = new Date(iso);
  const day = dayKey(date, timeZone);
  const clock = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (day === dayKey(now, timeZone)) return `Today, ${clock}`;
  if (day === dayKey(now - DAY_MS, timeZone)) return `Yesterday, ${clock}`;
  return formatDay(iso, now, timeZone);
}

export const formatEmotion = (type: string | null) =>
  type ? type.charAt(0) + type.slice(1).toLowerCase() : "—";

export const formatPercent = (value: number | null) =>
  value === null ? "—" : `${value.toFixed(1)}%`;

const ORDINALS = ["", "best", "second-best", "third-best"];

export function describeScore(
  entry: Pick<ScoreEntry, "score" | "rank">,
  { average, count }: ScoreTotals,
) {
  if (count < 2 || average === null) {
    return "Your first score. Upload more to compare.";
  }

  const diff = entry.score - average;
  const points = `${Math.abs(diff)} ${Math.abs(diff) === 1 ? "point" : "points"}`;
  const versusAverage =
    diff === 0
      ? "Right on your average."
      : `${points} ${diff > 0 ? "above" : "below"} your average.`;

  const { rank } = entry;
  const ranking =
    rank < ORDINALS.length
      ? `Your ${ORDINALS[rank]} score so far.`
      : `Ranked ${rank} of ${count}.`;

  return `${versusAverage} ${ranking}`;
}

const yesNo = (attribute: { value: boolean }) =>
  attribute.value ? "Yes" : "No";

export function faceAttributes(details: ScoreDetails): FaceAttribute[] {
  return [
    {
      name: "Smile",
      value: yesNo(details.smile),
      confidence: formatPercent(details.smile.confidence),
    },
    {
      name: "Top emotion",
      value: formatEmotion(details.topEmotion?.type ?? null),
      confidence: formatPercent(details.topEmotion?.confidence ?? null),
    },
    {
      name: "Mouth open",
      value: yesNo(details.mouthOpen),
      confidence: formatPercent(details.mouthOpen.confidence),
    },
    {
      name: "Eyes open",
      value: yesNo(details.eyesOpen),
      confidence: formatPercent(details.eyesOpen.confidence),
    },
    {
      name: "Sharpness",
      value: String(Math.round(details.quality.sharpness)),
      confidence: "/ 100",
    },
    {
      name: "Brightness",
      value: String(Math.round(details.quality.brightness)),
      confidence: "/ 100",
    },
  ];
}

export function toPhotoDetails(
  entry: ScoreEntry,
  totals: ScoreTotals,
  now: number,
  timeZone: string,
): PhotoDetailsData {
  return {
    id: entry.id,
    fileName: entry.fileName,
    uploaded: formatUploadedAt(entry.uploadedAt, now, timeZone),
    photoUrl: entry.photoUrl,
    score: entry.score,
    label: entry.label,
    comparison: describeScore(entry, totals),
    faceCount: entry.faceCount,
    faceConfidence: formatPercent(entry.details.faceConfidence),
    boundingBox: entry.details.boundingBox,
    attributes: faceAttributes(entry.details),
  };
}

export function toChartPoint(
  entry: ChartEntry,
  now: number,
  timeZone: string,
): ChartPoint {
  return {
    id: entry.id,
    score: entry.score,
    label: entry.label,
    fileName: entry.fileName,
    date: formatDay(entry.uploadedAt, now, timeZone),
  };
}

export function toHistoryRow(
  entry: ScoreEntry,
  now: number,
  timeZone: string,
): HistoryRow {
  return {
    id: entry.id,
    fileName: entry.fileName,
    photoUrl: entry.photoUrl,
    thumbnailUrl: entry.thumbnailUrl,
    uploaded: formatUploadedAt(entry.uploadedAt, now, timeZone),
    score: entry.score,
    emotion: formatEmotion(entry.details.topEmotion?.type ?? null),
    confidence: formatPercent(entry.details.topEmotion?.confidence ?? null),
  };
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? parts[0][0] + parts.at(-1)![0]
      : (parts[0] ?? "").slice(0, 2);
  return letters.toUpperCase() || "?";
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? "";
