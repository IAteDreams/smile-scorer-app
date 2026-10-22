import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sendExistingAccountEmail, sendVerificationEmail } from "./auth-emails";

const { env, send } = vi.hoisted(() => ({
  env: { NODE_ENV: "production", EMAIL_FROM: "Smilescore <me@gmail.test>" },
  send: vi.fn(),
}));

vi.mock("@/lib/env", () => ({ env }));
vi.mock("@/lib/mailer", () => ({ mailer: { sendMail: send } }));

const SIGN_IN = "https://smilescore.test/sign-in";
const VERIFY = "https://smilescore.test/api/auth/verify-email?token=abc";

describe("auth emails", () => {
  beforeEach(() => {
    env.NODE_ENV = "production";
    send.mockResolvedValue({ messageId: "<1@gmail.test>" });
  });
  afterEach(() => vi.restoreAllMocks());

  it("sends a verification link", async () => {
    await sendVerificationEmail({ user: { email: "a@b.test" }, url: VERIFY });
    expect(send).toHaveBeenCalledExactlyOnceWith({
      from: "Smilescore <me@gmail.test>",
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
    send.mockRejectedValue(new Error("Daily user sending limit exceeded"));
    await expect(
      sendExistingAccountEmail({ email: "a@b.test", signInUrl: SIGN_IN }),
    ).rejects.toThrow("Daily user sending limit exceeded");
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
