import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERRORS, HttpError } from "@/lib/error";

import { getSession, verifyAuth, verifySession } from "./auth-checker";

const { calls, connection, headers, getSessionApi } = vi.hoisted(() => {
  const calls: string[] = [];
  return {
    calls,
    connection: vi.fn(async () => {
      calls.push("connection");
    }),
    headers: vi.fn(async () => new Headers({ cookie: "session=abc" })),
    getSessionApi: vi.fn(),
  };
});

vi.mock("next/server", () => ({ connection }));
vi.mock("next/headers", () => ({ headers }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: getSessionApi } } }));

const SESSION = { user: { id: "user-1" }, session: { id: "s-1" } };

describe("getSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    calls.length = 0;
    getSessionApi.mockImplementation(async () => {
      calls.push("lookup");
      return SESSION;
    });
  });

  it("waits for a real request before looking the session up", async () => {
    expect(await getSession()).toBe(SESSION);
    expect(calls).toEqual(["connection", "lookup"]);
  });

  it("passes the request headers to Better Auth", async () => {
    await getSession();
    const [{ headers: sent }] = getSessionApi.mock.calls[0];
    expect(sent.get("cookie")).toBe("session=abc");
  });
});

describe("verifySession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the session when signed in", async () => {
    getSessionApi.mockResolvedValue(SESSION);
    expect(await verifySession()).toBe(SESSION);
  });

  it("refuses with 401 when signed out", async () => {
    getSessionApi.mockResolvedValue(null);
    const error = await verifySession().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({
      status: 401,
      message: ERRORS.http.unauthorized,
    });
  });
});

describe("verifyAuth", () => {
  it("runs the handler with the session", async () => {
    getSessionApi.mockResolvedValue(SESSION);
    const handler = vi.fn(async () => "done");
    expect(await verifyAuth(handler)).toBe("done");
    expect(handler).toHaveBeenCalledWith(SESSION);
  });
});
