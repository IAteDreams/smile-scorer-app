import { z } from "zod";
import { HISTORY_SORTS, MAX_SEARCH_LENGTH } from "@/lib/constants/dashboard";
import { MAX_PHOTO_BYTES, PHOTO_MIME_TYPES } from "@/lib/constants/scoring";
import { ERRORS } from "@/lib/error";

export const photoSchema = z
  .file({ error: ERRORS.validation.photoRequired })
  .max(MAX_PHOTO_BYTES, ERRORS.validation.photoTooLarge)
  .mime([...PHOTO_MIME_TYPES], ERRORS.validation.photoType);

const SORT_VALUES = HISTORY_SORTS.map((option) => option.value) as [
  (typeof HISTORY_SORTS)[number]["value"],
  ...(typeof HISTORY_SORTS)[number]["value"][],
];

export const scoreQuerySchema = z.object({
  q: z.string().trim().max(MAX_SEARCH_LENGTH).default(""),
  sort: z.enum(SORT_VALUES).default("newest"),
  page: z.coerce.number().int().min(0).max(10_000).default(0),
});
