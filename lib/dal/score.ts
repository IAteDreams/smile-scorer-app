import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { score, upload } from "@/db/schema";
import { UNTITLED_PHOTO } from "@/lib/constants/storage";
import type { PhotoScore, SmileScore } from "@/lib/scoring";
import { getPhotoUrls } from "@/lib/storage";
import type { ScoreEntry } from "@/types/score";

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

export async function listScores(userId: string): Promise<ScoreEntry[]> {
  const rows = await db
    .select({
      id: upload.id,
      fileName: upload.fileName,
      path: upload.path,
      uploadedAt: upload.createdAt,
      score: score.score,
      label: score.label,
      faceCount: score.faceCount,
      details: score.details,
    })
    .from(score)
    .innerJoin(upload, eq(score.uploadId, upload.id))
    .where(eq(score.userId, userId))
    .orderBy(desc(upload.createdAt));

  const urls = await signedUrls(rows.map((row) => row.path));

  return rows.map((row) => ({
    id: row.id,
    fileName: row.fileName ?? UNTITLED_PHOTO,
    uploadedAt: row.uploadedAt.toISOString(),
    photoUrl: urls.get(row.path) ?? null,
    score: row.score,
    label: row.label as SmileScore["label"],
    faceCount: row.faceCount,
    details: row.details,
  }));
}

export async function getUpload(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(upload)
    .where(and(eq(upload.id, id), eq(upload.userId, userId)))
    .limit(1);
  return row ?? null;
}
