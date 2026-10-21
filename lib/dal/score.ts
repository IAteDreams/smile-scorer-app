import { db } from "@/db";
import { score, upload } from "@/db/schema";
import type { PhotoScore } from "@/lib/scoring";

type NewScore = {
  id: string;
  userId: string;
  path: string;
  contentType: string;
  size: number;
  result: PhotoScore;
};

export async function saveScore({
  id,
  userId,
  path,
  contentType,
  size,
  result,
}: NewScore) {
  const { score: value, label, faceCount, ...details } = result;

  await db.transaction(async (tx) => {
    await tx.insert(upload).values({ id, userId, path, contentType, size });
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
