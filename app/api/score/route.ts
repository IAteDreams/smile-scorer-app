import { SCORE_RATE_LIMIT } from "@/lib/constants/scoring";
import { apiWrapper } from "@/lib/dal/api";
import { verifyAuth } from "@/lib/dal/auth-checker";
import { ERRORS, HttpError } from "@/lib/error";
import { withinRateLimit } from "@/lib/rate-limit";
import { analyzePhoto } from "@/lib/rekognition";
import { photoSchema } from "@/lib/schemas/score";

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

    return analyzePhoto(new Uint8Array(await parsed.data.arrayBuffer()));
  }),
);
