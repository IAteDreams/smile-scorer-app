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

export const photoPath = (userId: string, photoId: string) =>
  `${userId}/${photoId}`;

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

export async function getPhotoUrl(
  path: string,
  expiresIn: number = PHOTO_URL_TTL_SECONDS,
) {
  const { data, error } = await photos().createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
