import { describe, expect, it, vi } from "vitest";
import { score, upload } from "@/db/schema";
import type { PhotoScore } from "@/lib/scoring";

import { saveScore } from "./score";

const { inserted, transaction } = vi.hoisted(() => {
  const inserted: { table: unknown; values: unknown }[] = [];
  const tx = {
    insert: (table: unknown) => ({
      values: async (values: unknown) => {
        inserted.push({ table, values });
      },
    }),
  };
  return {
    inserted,
    transaction: vi.fn(async (run: (t: typeof tx) => Promise<void>) => run(tx)),
  };
});

vi.mock("@/db", () => ({ db: { transaction } }));

const RESULT: PhotoScore = {
  score: 92,
  label: "Beaming",
  faceCount: 2,
  faceConfidence: 99.9,
  smile: { value: true, confidence: 98 },
  topEmotion: { type: "HAPPY", confidence: 97 },
  mouthOpen: { value: true, confidence: 80 },
  eyesOpen: { value: true, confidence: 95 },
  quality: { brightness: 70, sharpness: 80 },
  boundingBox: { left: 0.3, top: 0.4, width: 0.2, height: 0.3 },
};

describe("saveScore", () => {
  it("stores the upload and its score in one transaction", async () => {
    await saveScore({
      id: "photo-1",
      userId: "user-1",
      path: "user-1/photo-1",
      contentType: "image/jpeg",
      size: 1234,
      result: RESULT,
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    const { score: value, label, faceCount, ...details } = RESULT;
    expect(inserted).toEqual([
      {
        table: upload,
        values: {
          id: "photo-1",
          userId: "user-1",
          path: "user-1/photo-1",
          contentType: "image/jpeg",
          size: 1234,
        },
      },
      {
        table: score,
        values: {
          uploadId: "photo-1",
          userId: "user-1",
          score: value,
          label,
          faceCount,
          details,
        },
      },
    ]);
  });
});
