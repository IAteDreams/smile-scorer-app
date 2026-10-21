import type { ScoreDetails } from "@/db/schema/score";
import type { CHART_RANGES, HISTORY_SORTS } from "@/lib/constants/dashboard";
import type { SmileScore } from "@/lib/scoring";

export type ScoreEntry = {
  id: string;
  fileName: string;
  uploadedAt: string;
  photoUrl: string | null;
  score: number;
  label: SmileScore["label"];
  faceCount: number;
  details: ScoreDetails;
};

export type HistoryRow = {
  id: string;
  fileName: string;
  photoUrl: string | null;
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
