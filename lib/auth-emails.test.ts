import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EMAILS } from "@/lib/constants/emails";

import { sendExistingAccountEmail, sendVerificationEmail } from "./auth-emails";

const { env, send } = vi.hoisted(() => ({
  env: { NODE_ENV: "production" },
  send: vi.fn(),
}));

vi.mock("@/lib/env", () => ({ env }));
vi.mock("@/lib/resend", () => ({ resend: { emails: { send } } }));

const SIGN_IN = "https://smilescore.test/sign-in";
const VERIFY = "https://smilescore.test/api/auth/verify-email?token=abc";

describe("auth emails", () => {
  beforeEach(() => {
    env.NODE_ENV = "production";
    send.mockResolvedValue({ data: { id: "1" }, error: null });
  });
  afterEach(() => vi.restoreAllMocks());

  it("sends a verification link", async () => {
    await sendVerificationEmail({ user: { email: "a@b.test" }, url: VERIFY });
    expect(send).toHaveBeenCalledExactlyOnceWith({
      from: EMAILS.from,
      to: "a@b.test",
      subject: "Verify your email",
      html: `<a href="${VERIFY}">Verify your email</a>`,
    });
  });

  it("tells an existing user to sign in instead", async () => {
    await sendExistingAccountEmail({ email: "a@b.test", signInUrl: SIGN_IN });
    const [email] = send.mock.calls[0];
    expect(email).toMatchObject({
      to: "a@b.test",
      subject: "You already have an account",
    });
    expect(email.html).toContain(
      "you already have an account. Sign in instead.",
    );
    expect(email.html).toContain(`<a href="${SIGN_IN}">Sign in</a>`);
  });

  it("fails when the email can't be sent", async () => {
    send.mockResolvedValue({ data: null, error: { message: "quota" } });
    await expect(
      sendExistingAccountEmail({ email: "a@b.test", signInUrl: SIGN_IN }),
    ).rejects.toThrow("Failed to send email: quota");
  });

  it("logs the links instead of sending in development", async () => {
    env.NODE_ENV = "development";
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await sendVerificationEmail({ user: { email: "a@b.test" }, url: VERIFY });
    await sendExistingAccountEmail({ email: "a@b.test", signInUrl: SIGN_IN });

    expect(send).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith(`[auth] Verify a@b.test: ${VERIFY}`);
    expect(info).toHaveBeenCalledWith(
      `[auth] Existing account a@b.test: ${SIGN_IN}`,
    );
  });
});
