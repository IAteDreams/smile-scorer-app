import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { DATABASE_URL, PHOTO_BUCKET, SERVICES_URL } from "./env";
import { PHOTO_FIXTURE } from "./paths";

const DAY_MS = 24 * 60 * 60 * 1000;

export const sql = postgres(DATABASE_URL, { max: 2, onnotice: () => {} });

export type SeedPhoto = {
  fileName: string;
  score: number;
  daysAgo?: number;
};

const labelFor = (score: number) =>
  score >= 85
    ? "Beaming"
    : score >= 60
      ? "Smiling"
      : score >= 30
        ? "Slight smile"
        : "Neutral";

const DETAILS = {
  faceConfidence: 99.9,
  smile: { value: true, confidence: 99.2 },
  topEmotion: { type: "HAPPY", confidence: 98.1 },
  mouthOpen: { value: true, confidence: 94.6 },
  eyesOpen: { value: true, confidence: 99.7 },
  quality: { brightness: 88.4, sharpness: 96 },
  boundingBox: { left: 0.26, top: 0.2, width: 0.48, height: 0.46 },
};

async function putFile(path: string, bytes: Buffer, contentType: string) {
  const response = await fetch(
    `${SERVICES_URL}/storage/v1/object/${PHOTO_BUCKET}/${path}`,
    {
      method: "POST",
      body: new Uint8Array(bytes),
      headers: { "content-type": contentType },
    },
  );
  if (!response.ok) throw new Error(`could not store ${path}`);
}

export async function userIdFor(email: string) {
  const [row] = await sql<{ id: string }[]>`
    select id from "user" where email = ${email}
  `;
  if (!row) throw new Error(`no user ${email}`);
  return row.id;
}

/**
 * Inserts scored photos straight into the database (and their files into
 * the fake storage), bypassing the upload rate limit.
 */
export async function seedPhotos(email: string, photos: SeedPhoto[]) {
  const userId = await userIdFor(email);
  const bytes = readFileSync(PHOTO_FIXTURE);

  for (const { fileName, score, daysAgo = 0 } of photos) {
    const id = randomUUID();
    const path = `${userId}/${id}`;
    const createdAt = new Date(Date.now() - daysAgo * DAY_MS);

    await putFile(path, bytes, "image/jpeg");
    await putFile(`${path}.thumb.webp`, bytes, "image/jpeg");
    await sql`
      insert into upload (id, user_id, path, file_name, content_type, size, created_at)
      values (${id}, ${userId}, ${path}, ${fileName}, 'image/jpeg', ${bytes.length}, ${createdAt})
    `;
    await sql`
      insert into score (id, upload_id, user_id, score, label, face_count, details, created_at)
      values (${randomUUID()}, ${id}, ${userId}, ${score}, ${labelFor(score)}, 1,
              ${sql.json(DETAILS)}, ${createdAt})
    `;
  }
}
