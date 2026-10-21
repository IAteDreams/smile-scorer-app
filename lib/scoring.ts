import type { FaceDetail } from "@aws-sdk/client-rekognition";
import { SCORE_LABELS, SCORE_WEIGHTS } from "@/lib/constants/scoring";

type Attribute = { value: boolean; confidence: number };

export type SmileScore = {
  score: number;
  label: (typeof SCORE_LABELS)[number]["label"];
  faceConfidence: number;
  smile: Attribute;
  topEmotion: { type: string; confidence: number } | null;
  mouthOpen: Attribute;
  eyesOpen: Attribute;
  quality: { brightness: number; sharpness: number };
  boundingBox: { left: number; top: number; width: number; height: number };
};

export type PhotoScore = SmileScore & { faceCount: number };

const round1 = (n: number) => Math.round(n * 10) / 10;

const attribute = (raw?: { Value?: boolean; Confidence?: number }) => ({
  value: raw?.Value ?? false,
  confidence: round1(raw?.Confidence ?? 0),
});

const likelihood = (raw?: { Value?: boolean; Confidence?: number }) => {
  if (raw?.Confidence === undefined) return 0;
  return raw.Value ? raw.Confidence : 100 - raw.Confidence;
};

const area = (face: FaceDetail) =>
  (face.BoundingBox?.Width ?? 0) * (face.BoundingBox?.Height ?? 0);

export function pickPrimaryFace(faces: readonly FaceDetail[]) {
  return faces.reduce<FaceDetail | undefined>(
    (largest, face) =>
      !largest || area(face) > area(largest) ? face : largest,
    undefined,
  );
}

export function scoreLabel(score: number) {
  return (
    SCORE_LABELS.find((band) => score >= band.min) ?? SCORE_LABELS.at(-1)!
  ).label;
}

export function scoreFace(face: FaceDetail): SmileScore {
  const happy =
    face.Emotions?.find((emotion) => emotion.Type === "HAPPY")?.Confidence ?? 0;
  const raw =
    SCORE_WEIGHTS.smile * likelihood(face.Smile) +
    SCORE_WEIGHTS.happy * happy +
    SCORE_WEIGHTS.mouthOpen * likelihood(face.MouthOpen);
  const score = Math.min(100, Math.max(0, Math.round(raw)));

  const top = [...(face.Emotions ?? [])].sort(
    (a, b) => (b.Confidence ?? 0) - (a.Confidence ?? 0),
  )[0];

  return {
    score,
    label: scoreLabel(score),
    faceConfidence: round1(face.Confidence ?? 0),
    smile: attribute(face.Smile),
    topEmotion: top?.Type
      ? { type: top.Type, confidence: round1(top.Confidence ?? 0) }
      : null,
    mouthOpen: attribute(face.MouthOpen),
    eyesOpen: attribute(face.EyesOpen),
    quality: {
      brightness: round1(face.Quality?.Brightness ?? 0),
      sharpness: round1(face.Quality?.Sharpness ?? 0),
    },
    boundingBox: {
      left: face.BoundingBox?.Left ?? 0,
      top: face.BoundingBox?.Top ?? 0,
      width: face.BoundingBox?.Width ?? 0,
      height: face.BoundingBox?.Height ?? 0,
    },
  };
}
