// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { score, upload, user } from "@/db/schema";
import type { PhotoScore } from "@/lib/scoring";

import { getScoreSummary, getUpload, listScores, saveScore } from "./score";

// A real Postgres (PGlite, in memory) with the project's migrations applied,
// so these tests run the actual SQL.
vi.mock("@/db", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");

  const client = new PGlite();
  const folder = path.resolve("drizzle");
  for (const migration of fs.readdirSync(folder).sort()) {
    const sql = fs.readFileSync(
      path.join(folder, migration, "migration.sql"),
      "utf8",
    );
    for (const statement of sql.split("--> statement-breakpoint")) {
      if (statement.trim()) await client.exec(statement);
    }
  }
  return { db: drizzle({ client }) };
});

const { getPhotoUrls } = vi.hoisted(() => ({ getPhotoUrls: vi.fn() }));

vi.mock("@/lib/storage", () => ({
  getPhotoUrls,
  thumbnailPath: (path: string) => `${path}.thumb.webp`,
}));

const NOW = new Date("2026-10-21T14:14:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

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

const label = (value: number): PhotoScore["label"] =>
  value >= 85
    ? "Beaming"
    : value >= 60
      ? "Smiling"
      : value >= 30
        ? "Slight smile"
        : "Neutral";

let nextId = 0;

/** Saves a scored photo for a user, uploaded `daysAgo` before NOW. */
async function addPhoto(
  userId: string,
  {
    fileName = null,
    value = 70,
    daysAgo = 0,
  }: { fileName?: string | null; value?: number; daysAgo?: number } = {},
) {
  nextId++;
  const id = `00000000-0000-7000-8000-${String(nextId).padStart(12, "0")}`;
  await saveScore({
    id,
    userId,
    path: `${userId}/${id}`,
    fileName,
    contentType: "image/jpeg",
    size: 1000,
    result: { ...RESULT, score: value, label: label(value) },
  });
  await db
    .update(upload)
    .set({ createdAt: new Date(NOW.getTime() - daysAgo * DAY_MS) })
    .where(eq(upload.id, id));
  return id;
}

const firstPage = { query: "", sort: "newest", page: 0 } as const;

const names = (page: { items: { fileName: string }[] }) =>
  page.items.map((item) => item.fileName);

beforeEach(async () => {
  await db.delete(score);
  await db.delete(upload);
  await db.delete(user);
  for (const id of ["maria", "jun"]) {
    await db.insert(user).values({
      id,
      name: id,
      email: `${id}@example.com`,
      emailVerified: true,
    });
  }
  getPhotoUrls.mockImplementation(
    async (paths: string[]) =>
      new Map(paths.map((path) => [path, `https://signed/${path}`])),
  );
});

describe("saveScore", () => {
  it("stores the upload and its score together", async () => {
    const id = await addPhoto("maria", { fileName: "beach.jpg", value: 92 });

    const [saved] = await db.select().from(upload).where(eq(upload.id, id));
    expect(saved).toMatchObject({
      userId: "maria",
      path: `maria/${id}`,
      fileName: "beach.jpg",
      contentType: "image/jpeg",
      size: 1000,
    });

    const [scored] = await db
      .select()
      .from(score)
      .where(eq(score.uploadId, id));
    const { score: value, label: band, faceCount, ...details } = RESULT;
    expect(scored).toMatchObject({
      userId: "maria",
      score: value,
      label: band,
      faceCount,
      details,
    });
  });
});

describe("listScores", () => {
  it("pages the user's photos newest first", async () => {
    for (let day = 0; day < 8; day++) {
      await addPhoto("maria", { fileName: `day-${day}.jpg`, daysAgo: day });
    }
    await addPhoto("jun", { fileName: "not-mine.jpg" });

    const first = await listScores("maria", firstPage, 3);
    expect(first.total).toBe(8);
    expect(names(first)).toEqual(["day-0.jpg", "day-1.jpg", "day-2.jpg"]);

    const last = await listScores("maria", { ...firstPage, page: 2 }, 3);
    expect(last).toMatchObject({ page: 2, pageSize: 3, total: 8 });
    expect(names(last)).toEqual(["day-6.jpg", "day-7.jpg"]);
  });

  it("returns signed photo and thumbnail links and the full entry", async () => {
    const id = await addPhoto("maria", { fileName: "beach.jpg", value: 92 });
    const { items } = await listScores("maria", firstPage);

    expect(items[0]).toEqual({
      id,
      fileName: "beach.jpg",
      uploadedAt: NOW.toISOString(),
      photoUrl: `https://signed/maria/${id}`,
      thumbnailUrl: `https://signed/maria/${id}.thumb.webp`,
      score: 92,
      label: "Beaming",
      rank: 1,
      faceCount: 2,
      details: expect.objectContaining({ faceConfidence: 99.9 }),
    });
    expect(getPhotoUrls).toHaveBeenCalledTimes(1);
  });

  it("ranks across the whole history, sharing ties, whatever the page", async () => {
    await addPhoto("maria", { fileName: "a.jpg", value: 60, daysAgo: 0 });
    await addPhoto("maria", { fileName: "b.jpg", value: 90, daysAgo: 1 });
    await addPhoto("maria", { fileName: "c.jpg", value: 90, daysAgo: 2 });
    await addPhoto("maria", { fileName: "d.jpg", value: 40, daysAgo: 3 });

    const page = await listScores("maria", firstPage, 1);
    expect(page.items[0]).toMatchObject({ fileName: "a.jpg", rank: 3 });

    const all = await listScores("maria", firstPage);
    expect(all.items.map((item) => [item.fileName, item.rank])).toEqual([
      ["a.jpg", 3],
      ["b.jpg", 1],
      ["c.jpg", 1],
      ["d.jpg", 4],
    ]);
  });

  it.each([
    ["highest", ["b.jpg", "c.jpg", "a.jpg"]],
    ["lowest", ["a.jpg", "b.jpg", "c.jpg"]],
    ["oldest", ["c.jpg", "b.jpg", "a.jpg"]],
  ] as const)("sorts by %s, newest first among ties", async (sort, order) => {
    await addPhoto("maria", { fileName: "a.jpg", value: 50, daysAgo: 0 });
    await addPhoto("maria", { fileName: "b.jpg", value: 80, daysAgo: 1 });
    await addPhoto("maria", { fileName: "c.jpg", value: 80, daysAgo: 2 });

    expect(names(await listScores("maria", { ...firstPage, sort }))).toEqual(
      order,
    );
  });

  it("searches file names ignoring case, with % and _ taken literally", async () => {
    await addPhoto("maria", { fileName: "Beach-Day.jpg" });
    await addPhoto("maria", { fileName: "100%_happy.png" });
    await addPhoto("maria", { fileName: "100x happy.png" });
    await addPhoto("jun", { fileName: "beach-jun.jpg" });

    const beach = await listScores("maria", { ...firstPage, query: " beach " });
    expect(names(beach)).toEqual(["Beach-Day.jpg"]);
    expect(beach.total).toBe(1);

    const literal = await listScores("maria", { ...firstPage, query: "%_" });
    expect(names(literal)).toEqual(["100%_happy.png"]);
  });

  it("names photos uploaded before file names were saved", async () => {
    await addPhoto("maria", { fileName: null });
    const { items } = await listScores("maria", firstPage);
    expect(items[0].fileName).toBe("Untitled photo");
  });

  it("still lists scores when links cannot be signed", async () => {
    await addPhoto("maria");
    getPhotoUrls.mockRejectedValue(new Error("storage down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { items } = await listScores("maria", firstPage);
    expect(items[0]).toMatchObject({ photoUrl: null, thumbnailUrl: null });
  });

  it("returns an empty page for a new user", async () => {
    expect(await listScores("maria", firstPage)).toEqual({
      items: [],
      total: 0,
      page: 0,
      pageSize: 6,
    });
  });
});

describe("getScoreSummary", () => {
  it("totals the whole history in the database", async () => {
    await addPhoto("maria", { fileName: "today.jpg", value: 81, daysAgo: 0 });
    await addPhoto("maria", { fileName: "monday.jpg", value: 90, daysAgo: 3 });
    await addPhoto("maria", {
      fileName: "earlier.jpg",
      value: 70,
      daysAgo: 10,
    });
    await addPhoto("maria", { fileName: "sunset.jpg", value: 96, daysAgo: 40 });
    await addPhoto("maria", { fileName: "old.jpg", value: 50, daysAgo: 45 });
    await addPhoto("maria", {
      fileName: "ancient.jpg",
      value: 20,
      daysAgo: 130,
    });
    await addPhoto("jun", { value: 100 });

    const summary = await getScoreSummary("maria", NOW);

    expect(summary).toMatchObject({
      count: 6,
      average: 68,
      recentAverage: 80,
      previousAverage: 73,
      thisWeek: 2,
      best: { fileName: "sunset.jpg", score: 96, label: "Beaming" },
      latest: { fileName: "today.jpg", score: 81 },
      bands: { Beaming: 2, Smiling: 2, "Slight smile": 1, Neutral: 1 },
    });
    expect(summary.recent.map((entry) => entry.fileName)).toEqual([
      "ancient.jpg",
      "old.jpg",
      "sunset.jpg",
      "earlier.jpg",
      "monday.jpg",
      "today.jpg",
    ]);
    expect(summary.uploadTimes).toHaveLength(5);
  });

  it("picks the newest photo when the best score is tied", async () => {
    await addPhoto("maria", { fileName: "older.jpg", value: 90, daysAgo: 5 });
    await addPhoto("maria", { fileName: "newer.jpg", value: 90, daysAgo: 1 });
    expect((await getScoreSummary("maria", NOW)).best?.fileName).toBe(
      "newer.jpg",
    );
  });

  it("handles a new user", async () => {
    expect(await getScoreSummary("maria", NOW)).toEqual({
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
    });
  });
});

describe("getUpload", () => {
  it("returns the user's own upload only", async () => {
    const id = await addPhoto("maria", { fileName: "beach.jpg" });

    expect(await getUpload("maria", id)).toMatchObject({
      id,
      fileName: "beach.jpg",
    });
    expect(await getUpload("jun", id)).toBeNull();
    expect(
      await getUpload("maria", "00000000-0000-7000-8000-999999999999"),
    ).toBeNull();
  });
});
