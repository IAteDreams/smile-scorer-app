import { and, asc, count, desc, eq, gt, ilike, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { score, upload } from "@/db/schema";
import {
  CHART_LIMIT,
  HISTORY_PAGE_SIZE,
  STREAK_WINDOW_DAYS,
} from "@/lib/constants/dashboard";
import { SCORE_LABELS } from "@/lib/constants/scoring";
import { UNTITLED_PHOTO } from "@/lib/constants/storage";
import type { PhotoScore } from "@/lib/scoring";
import { getPhotoUrls, thumbnailPath } from "@/lib/storage";
import type {
  ChartEntry,
  ScoreLabel,
  ScorePage,
  ScoreQuery,
  ScoreSummary,
} from "@/types/score";

const DAY_MS = 24 * 60 * 60 * 1000;

type NewScore = {
  id: string;
  userId: string;
  path: string;
  fileName: string | null;
  contentType: string;
  size: number;
  result: PhotoScore;
};

export async function saveScore({
  id,
  userId,
  path,
  fileName,
  contentType,
  size,
  result,
}: NewScore) {
  const { score: value, label, faceCount, ...details } = result;

  await db.transaction(async (tx) => {
    await tx
      .insert(upload)
      .values({ id, userId, path, fileName, contentType, size });
    await tx.insert(score).values({
      uploadId: id,
      userId,
      score: value,
      label,
      faceCount,
      details,
    });
  });
}

async function signedUrls(paths: string[]) {
  try {
    return await getPhotoUrls(paths);
  } catch (error) {
    console.error("[storage] could not sign photo URLs", error);
    return new Map<string, string>();
  }
}

const escapeLike = (text: string) => text.replace(/[\\%_]/g, "\\$&");

const roundOrNull = (value: string | number | null) =>
  value === null ? null : Math.round(Number(value));

function rankedScores(userId: string) {
  return db
    .select({
      id: upload.id,
      fileName: upload.fileName,
      path: upload.path,
      uploadedAt: upload.createdAt,
      score: score.score,
      label: score.label,
      faceCount: score.faceCount,
      details: score.details,
      rank: sql<number>`cast(rank() over (order by ${score.score} desc) as integer)`.as(
        "rank",
      ),
    })
    .from(score)
    .innerJoin(upload, eq(score.uploadId, upload.id))
    .where(eq(score.userId, userId))
    .as("ranked");
}

export async function listScores(
  userId: string,
  { query, sort, page }: ScoreQuery,
  pageSize: number = HISTORY_PAGE_SIZE,
): Promise<ScorePage> {
  const ranked = rankedScores(userId);
  const search = query.trim();
  const where = search
    ? ilike(ranked.fileName, `%${escapeLike(search)}%`)
    : undefined;

  const order = {
    newest: [desc(ranked.uploadedAt)],
    oldest: [asc(ranked.uploadedAt)],
    highest: [desc(ranked.score), desc(ranked.uploadedAt)],
    lowest: [asc(ranked.score), desc(ranked.uploadedAt)],
  }[sort];

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(ranked)
      .where(where)
      .orderBy(...order)
      .limit(pageSize)
      .offset(page * pageSize),
    db.select({ total: count() }).from(ranked).where(where),
  ]);

  const urls = await signedUrls(
    rows.flatMap((row) => [row.path, thumbnailPath(row.path)]),
  );

  return {
    total,
    page,
    pageSize,
    items: rows.map((row) => ({
      id: row.id,
      fileName: row.fileName ?? UNTITLED_PHOTO,
      uploadedAt: row.uploadedAt.toISOString(),
      photoUrl: urls.get(row.path) ?? null,
      thumbnailUrl: urls.get(thumbnailPath(row.path)) ?? null,
      score: row.score,
      label: row.label as ScoreLabel,
      rank: row.rank,
      faceCount: row.faceCount,
      details: row.details,
    })),
  };
}

const chartColumns = {
  id: upload.id,
  fileName: upload.fileName,
  uploadedAt: upload.createdAt,
  score: score.score,
  label: score.label,
};

type ChartRow = {
  id: string;
  fileName: string | null;
  uploadedAt: Date;
  score: number;
  label: string;
};

const toChartEntry = (row: ChartRow): ChartEntry => ({
  id: row.id,
  fileName: row.fileName ?? UNTITLED_PHOTO,
  uploadedAt: row.uploadedAt.toISOString(),
  score: row.score,
  label: row.label as ScoreLabel,
});

export async function getScoreSummary(
  userId: string,
  now: Date,
): Promise<ScoreSummary> {
  const daysAgo = (days: number) => new Date(now.getTime() - days * DAY_MS);
  const mine = eq(score.userId, userId);
  const joined = () =>
    db
      .select(chartColumns)
      .from(score)
      .innerJoin(upload, eq(score.uploadId, upload.id));

  const [[totals], bands, recent, [best], times] = await Promise.all([
    db
      .select({
        count: count(),
        average: sql<string | null>`avg(${score.score})`,
        recentAverage: sql<
          string | null
        >`avg(${score.score}) filter (where ${gt(upload.createdAt, daysAgo(30))})`,
        previousAverage: sql<
          string | null
        >`avg(${score.score}) filter (where ${and(gt(upload.createdAt, daysAgo(60)), lte(upload.createdAt, daysAgo(30)))})`,
        thisWeek: sql<number>`cast(count(*) filter (where ${gt(upload.createdAt, daysAgo(7))}) as integer)`,
      })
      .from(score)
      .innerJoin(upload, eq(score.uploadId, upload.id))
      .where(mine),
    db
      .select({ label: score.label, count: count() })
      .from(score)
      .where(mine)
      .groupBy(score.label),
    joined().where(mine).orderBy(desc(upload.createdAt)).limit(CHART_LIMIT),
    joined()
      .where(mine)
      .orderBy(desc(score.score), desc(upload.createdAt))
      .limit(1),
    db
      .select({ uploadedAt: upload.createdAt })
      .from(upload)
      .where(
        and(
          eq(upload.userId, userId),
          gt(upload.createdAt, daysAgo(STREAK_WINDOW_DAYS)),
        ),
      ),
  ]);

  const chart = recent.map(toChartEntry).reverse();

  return {
    count: totals.count,
    average: roundOrNull(totals.average),
    recentAverage: roundOrNull(totals.recentAverage),
    previousAverage: roundOrNull(totals.previousAverage),
    thisWeek: totals.thisWeek,
    best: best ? toChartEntry(best) : null,
    latest: chart.at(-1) ?? null,
    bands: Object.fromEntries(
      SCORE_LABELS.map(({ label }) => [
        label,
        bands.find((band) => band.label === label)?.count ?? 0,
      ]),
    ) as Record<ScoreLabel, number>,
    recent: chart,
    uploadTimes: times.map((row) => row.uploadedAt.toISOString()),
  };
}

export async function getUpload(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(upload)
    .where(and(eq(upload.id, id), eq(upload.userId, userId)))
    .limit(1);
  return row ?? null;
}
