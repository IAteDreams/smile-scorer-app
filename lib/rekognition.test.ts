import {
  DetectFacesCommand,
  ImageTooLargeException,
  InvalidImageFormatException,
  RekognitionClient,
  ThrottlingException,
} from "@aws-sdk/client-rekognition";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "@/lib/error";

import { analyzePhoto, FACE_ATTRIBUTES } from "./rekognition";

const { env } = vi.hoisted(() => ({
  env: {
    AWS_REGION: "us-east-1",
    AWS_ACCESS_KEY_ID: "test",
    AWS_SECRET_ACCESS_KEY: "test",
    USE_MOCK_SCORER: false,
  },
}));

vi.mock("@/lib/env", () => ({ env }));

const rekognition = mockClient(RekognitionClient);
const bytes = new Uint8Array([1, 2, 3]);
const awsError = { message: "aws", $metadata: {} };

const expectHttpError = async (status: number) => {
  const error = await analyzePhoto(bytes).catch((e: unknown) => e);
  expect(error).toBeInstanceOf(HttpError);
  expect((error as HttpError).status).toBe(status);
};

describe("analyzePhoto", () => {
  beforeEach(() => {
    rekognition.reset();
    env.USE_MOCK_SCORER = false;
  });

  it("sends the photo with only the attributes scoring needs", async () => {
    rekognition.on(DetectFacesCommand).resolves({
      FaceDetails: [{ Smile: { Value: true, Confidence: 99 } }],
    });

    await analyzePhoto(bytes);

    const input = rekognition.commandCalls(DetectFacesCommand)[0].args[0].input;
    expect(input.Image?.Bytes).toBe(bytes);
    expect(input.Attributes).toEqual([...FACE_ATTRIBUTES]);
    expect(input.Attributes).not.toContain("ALL");
    expect(input.Attributes).not.toContain("AGE_RANGE");
    expect(input.Attributes).not.toContain("GENDER");
  });

  it("scores the largest face", async () => {
    rekognition.on(DetectFacesCommand).resolves({
      FaceDetails: [
        {
          BoundingBox: { Width: 0.1, Height: 0.1 },
          Smile: { Value: false, Confidence: 100 },
        },
        {
          BoundingBox: { Width: 0.5, Height: 0.5 },
          Smile: { Value: true, Confidence: 100 },
          Emotions: [{ Type: "HAPPY", Confidence: 100 }],
          MouthOpen: { Value: true, Confidence: 100 },
        },
      ],
    });

    const result = await analyzePhoto(bytes);
    expect(result.score).toBe(100);
    expect(result.boundingBox.width).toBe(0.5);
    expect(result.faceCount).toBe(2);
  });

  it("reports one face for a single-face photo", async () => {
    rekognition.on(DetectFacesCommand).resolves({
      FaceDetails: [{ Smile: { Value: true, Confidence: 90 } }],
    });
    expect((await analyzePhoto(bytes)).faceCount).toBe(1);
  });

  it("rejects photos with no face", async () => {
    rekognition.on(DetectFacesCommand).resolves({ FaceDetails: [] });
    await expectHttpError(422);
  });

  it.each([
    ["an unreadable image", new InvalidImageFormatException(awsError), 422],
    ["an image that is too large", new ImageTooLargeException(awsError), 413],
    ["throttling", new ThrottlingException(awsError), 503],
  ])("turns %s into a clear error", async (_, error, status) => {
    rekognition.on(DetectFacesCommand).rejects(error);
    await expectHttpError(status);
  });

  it("lets unexpected AWS errors through for the 500 handler", async () => {
    rekognition.on(DetectFacesCommand).rejects(new Error("boom"));
    await expect(analyzePhoto(bytes)).rejects.toThrow("boom");
  });

  it("skips AWS when USE_MOCK_SCORER is on", async () => {
    env.USE_MOCK_SCORER = true;
    const result = await analyzePhoto(bytes);
    expect(rekognition.commandCalls(DetectFacesCommand)).toHaveLength(0);
    expect(result.label).toBe("Beaming");
    expect(result.faceCount).toBe(1);
  });
});
