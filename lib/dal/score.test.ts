import { beforeEach, describe, expect, it, vi } from "vitest";
import { score, upload } from "@/db/schema";
import type { PhotoScore } from "@/lib/scoring";

import { getUpload, listScores, saveScore } from "./score";

const { inserted, transaction, selectResult, select, getPhotoUrls } =
  vi.hoisted(() => {
    const inserted: { table: unknown; values: unknown }[] = [];
    const tx = {
      insert: (table: unknown) => ({
        values: async (values: unknown) => {
          inserted.push({ table, values });
        },
      }),
    };
    const selectResult = { rows: [] as unknown[] };
    const chain = {
      from: () => chain,
      innerJoin: () => chain,
      where: () => chain,
      orderBy: () => Promise.resolve(selectResult.rows),
      limit: () => Promise.resolve(selectResult.rows),
    };
    return {
      inserted,
      transaction: vi.fn(async (run: (t: typeof tx) => Promise<void>) =>
        run(tx),
      ),
      selectResult,
      select: vi.fn(() => chain),
      getPhotoUrls: vi.fn(),
    };
  });

vi.mock("@/db", () => ({ db: { transaction, select } }));
vi.mock("@/lib/storage", () => ({ getPhotoUrls }));

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

const { score: SCORE, label: LABEL, faceCount: FACES, ...DETAILS } = RESULT;

describe("saveScore", () => {
  it("stores the upload and its score in one transaction", async () => {
    await saveScore({
      id: "photo-1",
      userId: "user-1",
      path: "user-1/photo-1",
      fileName: "beach-day.jpg",
      contentType: "image/jpeg",
      size: 1234,
      result: RESULT,
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(inserted).toEqual([
      {
        table: upload,
        values: {
          id: "photo-1",
          userId: "user-1",
          path: "user-1/photo-1",
          fileName: "beach-day.jpg",
          contentType: "image/jpeg",
          size: 1234,
        },
      },
      {
        table: score,
        values: {
          uploadId: "photo-1",
          userId: "user-1",
          score: SCORE,
          label: LABEL,
          faceCount: FACES,
          details: DETAILS,
        },
      },
    ]);
  });
});

describe("listScores", () => {
  const row = (overrides: Record<string, unknown> = {}) => ({
    id: "photo-1",
    fileName: "beach-day.jpg",
    path: "user-1/photo-1",
    uploadedAt: new Date("2026-10-21T14:14:00Z"),
    score: SCORE,
    label: LABEL,
    faceCount: FACES,
    details: DETAILS,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getPhotoUrls.mockResolvedValue(
      new Map([["user-1/photo-1", "https://signed/photo-1"]]),
    );
  });

  it("returns the user's scores with signed photo URLs", async () => {
    selectResult.rows = [row()];
    expect(await listScores("user-1")).toEqual([
      {
        id: "photo-1",
        fileName: "beach-day.jpg",
        uploadedAt: "2026-10-21T14:14:00.000Z",
        photoUrl: "https://signed/photo-1",
        score: SCORE,
        label: LABEL,
        faceCount: FACES,
        details: DETAILS,
      },
    ]);
    expect(getPhotoUrls).toHaveBeenCalledWith(["user-1/photo-1"]);
  });

  it("names photos uploaded before file names were saved", async () => {
    selectResult.rows = [row({ fileName: null })];
    const [entry] = await listScores("user-1");
    expect(entry.fileName).toBe("Untitled photo");
  });

  it("still lists scores when photo URLs cannot be signed", async () => {
    selectResult.rows = [row()];
    getPhotoUrls.mockRejectedValue(new Error("storage down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const [entry] = await listScores("user-1");
    expect(entry.photoUrl).toBeNull();
    expect(entry.score).toBe(SCORE);
  });

  it("returns nothing for a new user", async () => {
    selectResult.rows = [];
    getPhotoUrls.mockResolvedValue(new Map());
    expect(await listScores("user-1")).toEqual([]);
  });
});

describe("getUpload", () => {
  it("returns the user's upload", async () => {
    const found = { id: "photo-1", userId: "user-1" };
    selectResult.rows = [found];
    expect(await getUpload("user-1", "photo-1")).toBe(found);
  });

  it("returns null when it is missing or not theirs", async () => {
    selectResult.rows = [];
    expect(await getUpload("user-2", "photo-1")).toBeNull();
  });
});
