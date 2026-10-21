// The docs call it unstable_doesProxyMatch; this Next version still exports the old name.
import {
  getRedirectUrl,
  unstable_doesMiddlewareMatch,
} from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LINKS } from "@/lib/constants";

import { config, proxy } from "./proxy";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }));

const SESSION_COOKIE = "better-auth.session_token=abc.def";

const request = (path: string, cookie?: string) =>
  new NextRequest(
    `http://localhost:3000${path}`,
    cookie ? { headers: { cookie } } : undefined,
  );

describe("proxy matcher", () => {
  it.each([
    ...Object.values(LINKS.protected),
    ...Object.values(LINKS.guest),
    "/dashboard/history",
  ])("runs on %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
  });

  it.each([
    ...Object.values(LINKS.public),
    "/api/auth/sign-in/email",
    "/_next/static/x.js",
  ])("skips %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
  });
});

describe("proxy", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends signed-out users from protected routes to sign in", async () => {
    const response = await proxy(request("/dashboard/history"));
    expect(getRedirectUrl(response)).toBe("http://localhost:3000/sign-in");
  });

  it("lets users with a session cookie into protected routes", async () => {
    const response = await proxy(request("/dashboard", SESSION_COOKIE));
    expect(getRedirectUrl(response)).toBeNull();
    expect(getSession).not.toHaveBeenCalled();
  });

  it("lets signed-out users onto guest routes", async () => {
    const response = await proxy(request("/sign-in"));
    expect(getRedirectUrl(response)).toBeNull();
    expect(getSession).not.toHaveBeenCalled();
  });

  it("sends signed-in users from guest routes to the dashboard", async () => {
    getSession.mockResolvedValue({ user: { id: "1" }, session: {} });
    const response = await proxy(request("/sign-up", SESSION_COOKIE));
    expect(getRedirectUrl(response)).toBe("http://localhost:3000/dashboard");
  });

  it("keeps users with an expired cookie on guest routes", async () => {
    getSession.mockResolvedValue(null);
    const response = await proxy(request("/sign-in", SESSION_COOKIE));
    expect(getRedirectUrl(response)).toBeNull();
  });
});
