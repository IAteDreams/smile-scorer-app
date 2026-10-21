import "server-only";

import { createClient } from "@supabase/supabase-js";
import { PHOTO_BUCKET, PHOTO_URL_TTL_SECONDS } from "@/lib/constants/storage";
import { env } from "@/lib/env";

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const photos = () => supabase.storage.from(PHOTO_BUCKET);

type PhotoUrlOptions = {
  expiresIn?: number;
  download?: string;
};

export const photoPath = (userId: string, photoId: string) =>
  `${userId}/${photoId}`;

export const thumbnailPath = (path: string) => `${path}.thumb.webp`;

export async function uploadPhoto(
  path: string,
  bytes: Uint8Array,
  contentType: string,
) {
  const { error } = await photos().upload(path, bytes, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
}

export async function removePhotos(paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await photos().remove(paths);
  if (error) throw error;
}

export async function getPhotoUrls(
  paths: string[],
  expiresIn: number = PHOTO_URL_TTL_SECONDS,
) {
  const urls = new Map<string, string>();
  if (paths.length === 0) return urls;

  const { data, error } = await photos().createSignedUrls(paths, expiresIn);
  if (error) throw error;
  for (const signed of data) {
    if (signed.path && signed.signedUrl)
      urls.set(signed.path, signed.signedUrl);
  }
  return urls;
}

export async function getPhotoUrl(
  path: string,
  { expiresIn = PHOTO_URL_TTL_SECONDS, download }: PhotoUrlOptions = {},
) {
  const { data, error } = await photos().createSignedUrl(
    path,
    expiresIn,
    download ? { download } : undefined,
  );
  if (error) throw error;
  return data.signedUrl;
}
