import type { ScoreDetails } from "@/db/schema/score";
import type { CHART_RANGES, HISTORY_SORTS } from "@/lib/constants/dashboard";
import type { PhotoScore, SmileScore } from "@/lib/scoring";

export type ScoreLabel = SmileScore["label"];

export type ScoreEntry = {
  id: string;
  fileName: string;
  uploadedAt: string;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  score: number;
  label: ScoreLabel;
  /** 1 for the user's best score; ties share a rank. */
  rank: number;
  faceCount: number;
  details: ScoreDetails;
};

/** The few fields the chart and stat cards need. */
export type ChartEntry = Pick<
  ScoreEntry,
  "id" | "fileName" | "uploadedAt" | "score" | "label"
>;

/** Totals for the whole history, computed in the database. */
export type ScoreSummary = {
  count: number;
  average: number | null;
  recentAverage: number | null;
  previousAverage: number | null;
  thisWeek: number;
  best: ChartEntry | null;
  latest: ChartEntry | null;
  bands: Record<ScoreLabel, number>;
  /** The newest uploads for the chart, oldest first. */
  recent: ChartEntry[];
  /** Upload times inside the streak window, for counting days. */
  uploadTimes: string[];
};

/** The average and size of the whole history, for comparing one photo. */
export type ScoreTotals = Pick<ScoreSummary, "average" | "count">;

export type ScoreQuery = {
  query: string;
  sort: HistorySort;
  page: number;
};

/** One page of the history, as `GET /api/score` returns it. */
export type ScorePage = {
  items: ScoreEntry[];
  total: number;
  page: number;
  pageSize: number;
};

/** What `POST /api/score` returns for a scored photo. */
export type ScoreResult = PhotoScore & { id: string };

export type HistoryRow = {
  id: string;
  fileName: string;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  uploaded: string;
  score: number;
  emotion: string;
  confidence: string;
};

export type ChartPoint = {
  id: string;
  score: number;
  label: string;
  fileName: string;
  date: string;
};

export type Streak = { days: number; scoredToday: boolean };

/** The numbers shown in the four dashboard stat cards. */
export type StatSummary = {
  average: number | null;
  averageChange: number | null;
  best: { score: number; fileName: string; day: string } | null;
  count: number;
  thisWeek: number;
  streak: Streak;
};

export type ChartRange = (typeof CHART_RANGES)[number]["value"];

export type HistorySort = (typeof HISTORY_SORTS)[number]["value"];
