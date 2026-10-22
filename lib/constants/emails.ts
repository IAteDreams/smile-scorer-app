export const EMAILS = {
  verify: {
    subject: "Verify your email",
    action: "Verify your email",
  },
  existingAccount: {
    subject: "You already have an account",
    body: "Someone tried to sign up with this email, but you already have an account. Sign in instead.",
    action: "Sign in",
    footer: "If this wasn't you, you can ignore this email.",
  },
} as const;
