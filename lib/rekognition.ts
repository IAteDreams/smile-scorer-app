import {
  DetectFacesCommand,
  ImageTooLargeException,
  InvalidImageFormatException,
  InvalidParameterException,
  ProvisionedThroughputExceededException,
  RekognitionClient,
  ThrottlingException,
  type FaceDetail,
} from "@aws-sdk/client-rekognition";
import { env } from "@/lib/env";
import { ERRORS, HttpError } from "@/lib/error";
import { pickPrimaryFace, scoreFace, type PhotoScore } from "@/lib/scoring";

const client = new RekognitionClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const FACE_ATTRIBUTES = [
  "DEFAULT",
  "SMILE",
  "EMOTIONS",
  "MOUTH_OPEN",
  "EYES_OPEN",
] as const;

const MOCK_FACE: FaceDetail = {
  BoundingBox: { Left: 0.26, Top: 0.2, Width: 0.48, Height: 0.46 },
  Confidence: 99.9,
  Smile: { Value: true, Confidence: 99.2 },
  Emotions: [
    { Type: "HAPPY", Confidence: 98.1 },
    { Type: "CALM", Confidence: 1.2 },
  ],
  MouthOpen: { Value: true, Confidence: 94.6 },
  EyesOpen: { Value: true, Confidence: 99.7 },
  Quality: { Brightness: 88.4, Sharpness: 96 },
};

async function detectFaces(bytes: Uint8Array) {
  try {
    const { FaceDetails = [] } = await client.send(
      new DetectFacesCommand({
        Image: { Bytes: bytes },
        Attributes: [...FACE_ATTRIBUTES],
      }),
    );
    return FaceDetails;
  } catch (error) {
    if (
      error instanceof InvalidImageFormatException ||
      error instanceof InvalidParameterException
    ) {
      throw new HttpError(422, ERRORS.score.unreadableImage);
    }
    if (error instanceof ImageTooLargeException) {
      throw new HttpError(413, ERRORS.validation.photoTooLarge);
    }
    if (
      error instanceof ThrottlingException ||
      error instanceof ProvisionedThroughputExceededException
    ) {
      throw new HttpError(503, ERRORS.score.busy);
    }
    throw error;
  }
}

export async function analyzePhoto(bytes: Uint8Array): Promise<PhotoScore> {
  const faces = env.USE_MOCK_SCORER ? [MOCK_FACE] : await detectFaces(bytes);
  const face = pickPrimaryFace(faces);
  if (!face) throw new HttpError(422, ERRORS.score.noFace);
  return { ...scoreFace(face), faceCount: faces.length };
}
