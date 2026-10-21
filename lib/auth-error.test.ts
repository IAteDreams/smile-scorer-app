import { describe, expect, it } from "vitest";

import { authErrorMessage } from "./auth-error";

describe("authErrorMessage", () => {
  it("explains rate limiting", () => {
    expect(
      authErrorMessage({ status: 429, message: "Too many requests" }),
    ).toBe("Too many attempts. Wait a minute and try again.");
  });

  it("explains an unverified email", () => {
    expect(
      authErrorMessage({ status: 403, code: "EMAIL_NOT_VERIFIED" }),
    ).toMatch(/verify your email/i);
  });

  it("falls back to the server message", () => {
    expect(
      authErrorMessage({ status: 401, message: "Invalid email or password" }),
    ).toBe("Invalid email or password");
  });

  it("falls back to a generic message", () => {
    expect(authErrorMessage({ status: 500 })).toBe(
      "Something went wrong. Try again.",
    );
  });
});
