import "server-only";

import sharp from "sharp";
import { THUMBNAIL_SIZE } from "@/lib/constants/storage";

export const THUMBNAIL_TYPE = "image/webp";

/** A small square WebP for the history list, or null if it can't be made. */
export async function makeThumbnail(bytes: Uint8Array) {
  try {
    const buffer = await sharp(bytes)
      .rotate()
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    console.error("[thumbnail] could not make a thumbnail", error);
    return null;
  }
}
