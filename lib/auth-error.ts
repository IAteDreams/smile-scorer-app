import { ERRORS } from "@/lib/error";

type AuthError = { status: number; code?: string; message?: string };

/** Turns a better-auth client error into a message for the form. */
export function authErrorMessage(error: AuthError) {
  if (error.status === 429) return ERRORS.auth.rateLimited;
  if (error.code === "EMAIL_NOT_VERIFIED") return ERRORS.auth.emailNotVerified;
  return error.message || ERRORS.auth.generic;
}
