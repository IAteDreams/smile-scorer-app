import { z } from "zod";
import { MAX_PHOTO_BYTES, PHOTO_MIME_TYPES } from "@/lib/constants/scoring";
import { ERRORS } from "@/lib/error";

export const photoSchema = z
  .file({ error: ERRORS.validation.photoRequired })
  .max(MAX_PHOTO_BYTES, ERRORS.validation.photoTooLarge)
  .mime([...PHOTO_MIME_TYPES], ERRORS.validation.photoType);
