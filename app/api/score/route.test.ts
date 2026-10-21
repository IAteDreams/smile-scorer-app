// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERRORS, HttpError } from "@/lib/error";

import { POST } from "./route";

const { verifySession, withinRateLimit, analyzePhoto } = vi.hoisted(() => ({
  verifySession: vi.fn(),
  withinRateLimit: vi.fn(),
  analyzePhoto: vi.fn(),
}));

vi.mock("@/lib/dal/auth-checker", () => ({
  verifyAuth: async (handler: (session: unknown) => unknown) =>
    handler(await verifySession()),
}));
vi.mock("@/lib/rate-limit", () => ({ withinRateLimit }));
vi.mock("@/lib/rekognition", () => ({ analyzePhoto }));

const RESULT = { score: 92, label: "Beaming" };

const send = (photo?: File) => {
  const form = new FormData();
  if (photo) form.set("photo", photo);
  return POST(
    new NextRequest("http://localhost/api/score", {
      method: "POST",
      body: form,
    }),
  );
};

const jpeg = (bytes = 10) =>
  new File([new Uint8Array(bytes)], "smile.jpg", { type: "image/jpeg" });

describe("POST /api/score", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifySession.mockResolvedValue({ user: { id: "user-1" } });
    withinRateLimit.mockResolvedValue(true);
    analyzePhoto.mockResolvedValue(RESULT);
  });

  it("scores a valid photo", async () => {
    const response = await send(jpeg());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: RESULT });
    expect(analyzePhoto).toHaveBeenCalledWith(expect.any(Uint8Array));
    expect(withinRateLimit).toHaveBeenCalledWith(
      "rate-limit:score:user-1",
      expect.anything(),
    );
  });

  it("requires a signed-in user", async () => {
    verifySession.mockRejectedValue(
      new HttpError(401, ERRORS.http.unauthorized),
    );
    const response = await send(jpeg());
    expect(response.status).toBe(401);
    expect(analyzePhoto).not.toHaveBeenCalled();
  });

  it.each([
    ["no photo", undefined, ERRORS.validation.photoRequired],
    [
      "an unsupported type",
      new File(["x"], "smile.gif", { type: "image/gif" }),
      ERRORS.validation.photoType,
    ],
    [
      "a photo over 4 MB",
      jpeg(4 * 1024 * 1024 + 1),
      ERRORS.validation.photoTooLarge,
    ],
  ])("rejects %s without calling AWS", async (_, photo, message) => {
    const response = await send(photo);
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      success: false,
      error: { message },
    });
    expect(analyzePhoto).not.toHaveBeenCalled();
    expect(withinRateLimit).not.toHaveBeenCalled();
  });

  it("refuses once the user hits the rate limit", async () => {
    withinRateLimit.mockResolvedValue(false);
    const response = await send(jpeg());
    expect(response.status).toBe(429);
    expect(analyzePhoto).not.toHaveBeenCalled();
  });

  it("passes on errors from scoring", async () => {
    analyzePhoto.mockRejectedValue(new HttpError(422, ERRORS.score.noFace));
    const response = await send(jpeg());
    expect(response.status).toBe(422);
    expect((await response.json()).error.message).toBe(ERRORS.score.noFace);
  });
});
