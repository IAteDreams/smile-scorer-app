type AuthError = { status: number; code?: string; message?: string };

/** Turns a better-auth client error into a message for the form. */
export function authErrorMessage(error: AuthError) {
  if (error.status === 429) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (error.code === "EMAIL_NOT_VERIFIED") {
    return "Verify your email before signing in. Check your inbox for the link.";
  }
  return error.message || "Something went wrong. Try again.";
}
