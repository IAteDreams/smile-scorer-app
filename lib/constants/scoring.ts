export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export const PHOTO_MIME_TYPES = ["image/jpeg", "image/png"] as const;

export const SCORE_WEIGHTS = {
  smile: 0.6,
  happy: 0.3,
  mouthOpen: 0.1,
} as const;

export const SCORE_LABELS = [
  { min: 85, label: "Beaming" },
  { min: 60, label: "Smiling" },
  { min: 30, label: "Slight smile" },
  { min: 0, label: "Neutral" },
] as const;

export const SCORE_RATE_LIMIT = { limit: 10, windowSeconds: 60 } as const;
