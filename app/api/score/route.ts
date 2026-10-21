import { uuidv7 } from "uuidv7";
import { SCORE_RATE_LIMIT } from "@/lib/constants/scoring";
import { MAX_FILE_NAME_LENGTH } from "@/lib/constants/storage";
import { apiWrapper } from "@/lib/dal/api";
import { verifyAuth } from "@/lib/dal/auth-checker";
import { listScores, saveScore } from "@/lib/dal/score";
import { ERRORS, HttpError } from "@/lib/error";
import { withinRateLimit } from "@/lib/rate-limit";
import { analyzePhoto } from "@/lib/rekognition";
import { photoSchema, scoreQuerySchema } from "@/lib/schemas/score";
import {
  photoPath,
  removePhotos,
  thumbnailPath,
  uploadPhoto,
} from "@/lib/storage";
import { makeThumbnail, THUMBNAIL_TYPE } from "@/lib/thumbnail";
import type { ScoreResult } from "@/types/score";

export const GET = apiWrapper(({ req }) =>
  verifyAuth(({ user }) => {
    const parsed = scoreQuerySchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams),
    );
    if (!parsed.success) {
      throw new HttpError(422, ERRORS.http.validationFailed);
    }
    const { q, sort, page } = parsed.data;
    return listScores(user.id, { query: q, sort, page });
  }),
);

export const POST = apiWrapper(({ req }) =>
  verifyAuth(async ({ user }): Promise<ScoreResult> => {
    const form = await req.formData().catch(() => {
      throw new HttpError(400, ERRORS.validation.photoRequired);
    });

    const parsed = photoSchema.safeParse(form.get("photo"));
    if (!parsed.success) {
      throw new HttpError(
        422,
        parsed.error.issues[0]?.message ?? ERRORS.http.validationFailed,
      );
    }

    const allowed = await withinRateLimit(
      `rate-limit:score:${user.id}`,
      SCORE_RATE_LIMIT,
    );
    if (!allowed) throw new HttpError(429, ERRORS.score.rateLimited);

    const photo = parsed.data;
    const bytes = new Uint8Array(await photo.arrayBuffer());
    const result = await analyzePhoto(bytes);

    const id = uuidv7();
    const path = photoPath(user.id, id);
    const thumbnail = thumbnailPath(path);
    await uploadPhoto(path, bytes, photo.type);

    const thumbnailBytes = await makeThumbnail(bytes);
    if (thumbnailBytes) {
      await uploadPhoto(thumbnail, thumbnailBytes, THUMBNAIL_TYPE).catch(
        (error) => console.error("[thumbnail] upload failed", error),
      );
    }

    try {
      await saveScore({
        id,
        userId: user.id,
        path,
        fileName: photo.name.trim().slice(0, MAX_FILE_NAME_LENGTH) || null,
        contentType: photo.type,
        size: photo.size,
        result,
      });
    } catch (error) {
      await removePhotos([path, thumbnail]).catch(() => {});
      throw error;
    }

    return { id, ...result };
  }),
);
