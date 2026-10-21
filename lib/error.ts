import { MAX_PHOTO_BYTES } from "@/lib/constants/scoring";
import { formatBytes } from "@/lib/utils";

export const ERRORS = {
  validation: {
    nameRequired: "Enter your name",
    emailInvalid: "Enter a valid email address",
    passwordRequired: "Enter your password",
    passwordTooShort: "Use at least 8 characters",
    passwordTooLong: "Use 128 characters or fewer",
    photoRequired: "Choose a photo to upload",
    photoType: "Use a JPG or PNG photo",
    photoTooLarge: `Use a photo under ${formatBytes(MAX_PHOTO_BYTES)}`,
  },
  score: {
    noFace: "We couldn't find a face. Try a clear, well-lit photo of one face.",
    unreadableImage: "We couldn't read that image. Try a different photo.",
    busy: "Scoring is busy right now. Try again in a moment.",
    rateLimited: "You've scored a lot of photos. Wait a minute and try again.",
  },
  auth: {
    rateLimited: "Too many attempts. Wait a minute and try again.",
    emailNotVerified:
      "Verify your email before signing in. Check your inbox for the link.",
    generic: "Something went wrong. Try again.",
  },
  http: {
    unauthorized: "Unauthorized",
    notFound: "Not found",
    invalidJson: "Invalid JSON body",
    validationFailed: "Validation failed",
    internal: "Internal server error",
  },
} as const;

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
