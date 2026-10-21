import { DAY_MS } from "@/lib/dashboard";
import { scoreLabel } from "@/lib/scoring";
import type { ScoreEntry } from "@/types/score";

const SAMPLE_PHOTO = "/group_of_friends.webp";

const SAMPLES: [string, number, number, string, number][] = [
  ["beach-day.jpg", 0, 92, "HAPPY", 98.1],
  ["graduation.png", 1, 81, "HAPPY", 96.4],
  ["birthday-cake.jpg", 2, 90, "HAPPY", 99],
  ["office-badge.jpg", 3, 54, "CALM", 91.2],
  ["selfie-0931.jpg", 4, 73, "HAPPY", 88.7],
  ["park-picnic.jpg", 5, 85, "HAPPY", 97.3],
  ["coffee-date.jpg", 7, 79, "HAPPY", 93.5],
  ["family-dinner.jpg", 9, 88, "HAPPY", 98.6],
  ["gym-mirror.jpg", 11, 74, "HAPPY", 85.2],
  ["road-trip.jpg", 13, 69, "HAPPY", 90.4],
  ["team-photo.png", 15, 82, "HAPPY", 95.1],
  ["rainy-day.jpg", 17, 58, "CALM", 89.9],
  ["concert.jpg", 19, 77, "HAPPY", 92.8],
  ["new-haircut.jpg", 21, 71, "HAPPY", 87.6],
  ["sunset-walk.jpg", 23, 96, "HAPPY", 99.4],
  ["passport.jpg", 26, 12, "CALM", 97.5],
  ["first-day.jpg", 29, 64, "HAPPY", 86.3],
  ["wedding-guest.jpg", 33, 87, "HAPPY", 98.2],
  ["hiking.jpg", 36, 66, "HAPPY", 84],
  ["bookshop.jpg", 40, 45, "CALM", 90.7],
  ["karaoke.jpg", 44, 83, "HAPPY", 96.9],
  ["museum.jpg", 48, 61, "HAPPY", 82.5],
  ["morning-run.jpg", 52, 25, "CALM", 93.3],
  ["holiday-lights.png", 57, 70, "HAPPY", 91],
];

export function sampleScores(now: number): ScoreEntry[] {
  return SAMPLES.map(([fileName, daysAgo, score, emotion, confidence], i) => ({
    id: `sample-${i + 1}`,
    fileName,
    uploadedAt: new Date(now - daysAgo * DAY_MS - 5 * 60 * 1000).toISOString(),
    photoUrl: SAMPLE_PHOTO,
    score,
    label: scoreLabel(score),
    faceCount: 4,
    details: {
      faceConfidence: 99.9,
      smile: { value: score >= 30, confidence: 90 + (score % 10) },
      topEmotion: { type: emotion, confidence },
      mouthOpen: { value: score >= 80, confidence: 85 + (score % 15) },
      eyesOpen: { value: true, confidence: 97.4 },
      quality: { brightness: 72.6, sharpness: 86.1 },
      boundingBox: { left: 0.32, top: 0.445, width: 0.14, height: 0.11 },
    },
  }));
}
