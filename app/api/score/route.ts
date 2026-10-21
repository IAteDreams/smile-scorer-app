import { uuidv7 } from "uuidv7";
import { SCORE_RATE_LIMIT } from "@/lib/constants/scoring";
import { apiWrapper } from "@/lib/dal/api";
import { verifyAuth } from "@/lib/dal/auth-checker";
import { saveScore } from "@/lib/dal/score";
import { ERRORS, HttpError } from "@/lib/error";
import { withinRateLimit } from "@/lib/rate-limit";
import { analyzePhoto } from "@/lib/rekognition";
import { photoSchema } from "@/lib/schemas/score";
import { photoPath, removePhotos, uploadPhoto } from "@/lib/storage";

export const POST = apiWrapper(({ req }) =>
  verifyAuth(async ({ user }) => {
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
    await uploadPhoto(path, bytes, photo.type);

    try {
      await saveScore({
        id,
        userId: user.id,
        path,
        contentType: photo.type,
        size: photo.size,
        result,
      });
    } catch (error) {
      await removePhotos([path]).catch(() => {});
      throw error;
    }

    return { id, ...result };
  }),
);
