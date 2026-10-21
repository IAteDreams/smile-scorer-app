import type { ScoreDetails } from "@/db/schema/score";
import { DAY_MS } from "@/lib/dashboard";
import { scoreLabel } from "@/lib/scoring";
import type { ScoreEntry } from "@/types/score";

export const TEST_NOW = Date.parse("2026-10-21T14:14:00Z");

export const TEST_DETAILS: ScoreDetails = {
  faceConfidence: 99.9,
  smile: { value: true, confidence: 99.2 },
  topEmotion: { type: "HAPPY", confidence: 98.1 },
  mouthOpen: { value: true, confidence: 94.6 },
  eyesOpen: { value: true, confidence: 99.7 },
  quality: { brightness: 72.6, sharpness: 86.1 },
  boundingBox: { left: 0.32, top: 0.445, width: 0.14, height: 0.11 },
};

type ScoreEntryInput = Partial<ScoreEntry> & {
  id: string;
  daysAgo?: number;
};

/** Builds one score entry for tests, uploaded `daysAgo` before TEST_NOW. */
export function scoreEntry({
  id,
  daysAgo = 0,
  score = 70,
  ...overrides
}: ScoreEntryInput): ScoreEntry {
  return {
    id,
    fileName: `${id}.jpg`,
    uploadedAt: new Date(TEST_NOW - daysAgo * DAY_MS).toISOString(),
    photoUrl: `/photos/${id}.jpg`,
    score,
    label: scoreLabel(score),
    faceCount: 1,
    details: TEST_DETAILS,
    ...overrides,
  };
}
