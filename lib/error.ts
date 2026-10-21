export const ERRORS = {
  validation: {
    nameRequired: "Enter your name",
    emailInvalid: "Enter a valid email address",
    passwordRequired: "Enter your password",
    passwordTooShort: "Use at least 8 characters",
    passwordTooLong: "Use 128 characters or fewer",
  },
  auth: {
    rateLimited: "Too many attempts. Wait a minute and try again.",
    emailNotVerified:
      "Verify your email before signing in. Check your inbox for the link.",
    generic: "Something went wrong. Try again.",
  },
  http: {
    unauthorized: "Unauthorized",
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
