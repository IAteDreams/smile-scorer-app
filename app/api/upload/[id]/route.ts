import { z } from "zod";
import { UNTITLED_PHOTO } from "@/lib/constants/storage";
import { apiWrapper } from "@/lib/dal/api";
import { verifyAuth } from "@/lib/dal/auth-checker";
import { getUpload } from "@/lib/dal/score";
import { ERRORS, HttpError } from "@/lib/error";
import { getPhotoUrl, getPhotoUrls, thumbnailPath } from "@/lib/storage";
import type { HandlerArgs } from "@/types/handler";
import type { UploadInfo } from "@/types/photo";

async function thumbnailUrl(path: string) {
  const thumbnail = thumbnailPath(path);
  const urls = await getPhotoUrls([thumbnail]).catch(() => null);
  return urls?.get(thumbnail) ?? null;
}

export const GET = apiWrapper(
  ({ req, params }: HandlerArgs<undefined, { id: string }>) =>
    verifyAuth(async ({ user }): Promise<UploadInfo> => {
      const id = z.uuid().safeParse(params.id);
      const found = id.success ? await getUpload(user.id, id.data) : null;
      if (!found) throw new HttpError(404, ERRORS.http.notFound);

      const fileName = found.fileName ?? UNTITLED_PHOTO;
      const download = req.nextUrl.searchParams.has("download");

      return {
        id: found.id,
        fileName,
        contentType: found.contentType,
        size: found.size,
        uploadedAt: found.createdAt.toISOString(),
        url: await getPhotoUrl(found.path, {
          download: download ? fileName : undefined,
        }),
        thumbnailUrl: await thumbnailUrl(found.path),
      };
    }),
);
