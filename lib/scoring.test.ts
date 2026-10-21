import type { FaceDetail } from "@aws-sdk/client-rekognition";
import { describe, expect, it } from "vitest";

import { pickPrimaryFace, scoreFace, scoreLabel } from "./scoring";

const face = (overrides: Partial<FaceDetail> = {}): FaceDetail => ({
  BoundingBox: { Left: 0.1, Top: 0.1, Width: 0.3, Height: 0.3 },
  Confidence: 99.9,
  Smile: { Value: true, Confidence: 100 },
  Emotions: [{ Type: "HAPPY", Confidence: 100 }],
  MouthOpen: { Value: true, Confidence: 100 },
  EyesOpen: { Value: true, Confidence: 99 },
  Quality: { Brightness: 80, Sharpness: 90 },
  ...overrides,
});

describe("scoreFace", () => {
  it("gives 100 to a certain, happy, open-mouthed smile", () => {
    expect(scoreFace(face()).score).toBe(100);
  });

  it("gives 0 to a certain non-smile with no happiness and a closed mouth", () => {
    const result = scoreFace(
      face({
        Smile: { Value: false, Confidence: 100 },
        Emotions: [{ Type: "CALM", Confidence: 100 }],
        MouthOpen: { Value: false, Confidence: 100 },
      }),
    );
    expect(result.score).toBe(0);
    expect(result.label).toBe("Neutral");
  });

  it("weights smile 60%, happy 30% and mouth open 10%", () => {
    const result = scoreFace(
      face({
        Smile: { Value: true, Confidence: 100 },
        Emotions: [{ Type: "HAPPY", Confidence: 0 }],
        MouthOpen: { Value: false, Confidence: 100 },
      }),
    );
    expect(result.score).toBe(60);
  });

  it("reads a 'no' answer as the opposite likelihood", () => {
    // 80% sure there's no smile = 20% likely there is one.
    const result = scoreFace(
      face({
        Smile: { Value: false, Confidence: 80 },
        Emotions: [],
        MouthOpen: { Value: false, Confidence: 100 },
      }),
    );
    expect(result.score).toBe(12);
  });

  it("reports the strongest emotion and rounds confidences", () => {
    const result = scoreFace(
      face({
        Emotions: [
          { Type: "CALM", Confidence: 12.345 },
          { Type: "HAPPY", Confidence: 87.654 },
        ],
      }),
    );
    expect(result.topEmotion).toEqual({ type: "HAPPY", confidence: 87.7 });
  });

  it("handles a face with no attributes", () => {
    const result = scoreFace({});
    expect(result.score).toBe(0);
    expect(result.topEmotion).toBeNull();
  });
});

describe("scoreLabel", () => {
  it.each([
    [100, "Beaming"],
    [85, "Beaming"],
    [84, "Smiling"],
    [60, "Smiling"],
    [59, "Slight smile"],
    [30, "Slight smile"],
    [29, "Neutral"],
    [0, "Neutral"],
  ])("labels %i as %s", (score, label) => {
    expect(scoreLabel(score)).toBe(label);
  });
});

describe("pickPrimaryFace", () => {
  it("picks the largest face", () => {
    const small = face({ BoundingBox: { Width: 0.1, Height: 0.1 } });
    const large = face({ BoundingBox: { Width: 0.4, Height: 0.5 } });
    expect(pickPrimaryFace([small, large, small])).toBe(large);
  });

  it("returns undefined when there are no faces", () => {
    expect(pickPrimaryFace([])).toBeUndefined();
  });
});
