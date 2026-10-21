// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERRORS, HttpError } from "@/lib/error";

import { GET, POST } from "./route";

const {
  verifySession,
  withinRateLimit,
  analyzePhoto,
  uploadPhoto,
  removePhotos,
  saveScore,
  listScores,
} = vi.hoisted(() => ({
  verifySession: vi.fn(),
  withinRateLimit: vi.fn(),
  analyzePhoto: vi.fn(),
  uploadPhoto: vi.fn(),
  removePhotos: vi.fn(),
  saveScore: vi.fn(),
  listScores: vi.fn(),
}));

vi.mock("@/lib/dal/auth-checker", () => ({
  verifyAuth: async (handler: (session: unknown) => unknown) =>
    handler(await verifySession()),
}));
vi.mock("@/lib/rate-limit", () => ({ withinRateLimit }));
vi.mock("@/lib/rekognition", () => ({ analyzePhoto }));
vi.mock("@/lib/storage", () => ({
  photoPath: (userId: string, id: string) => `${userId}/${id}`,
  uploadPhoto,
  removePhotos,
}));
vi.mock("@/lib/dal/score", () => ({ saveScore, listScores }));

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
    uploadPhoto.mockResolvedValue(undefined);
    removePhotos.mockResolvedValue(undefined);
    saveScore.mockResolvedValue(undefined);
  });

  it("scores a valid photo", async () => {
    const response = await send(jpeg());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: { id: expect.any(String), ...RESULT },
    });
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
    expect(uploadPhoto).not.toHaveBeenCalled();
    expect(saveScore).not.toHaveBeenCalled();
  });

  it("stores the photo and its score under the user's folder", async () => {
    const response = await send(jpeg(10));
    const { data } = await response.json();

    const path = `user-1/${data.id}`;
    expect(uploadPhoto).toHaveBeenCalledWith(
      path,
      expect.any(Uint8Array),
      "image/jpeg",
    );
    expect(saveScore).toHaveBeenCalledWith({
      id: data.id,
      userId: "user-1",
      path,
      fileName: "smile.jpg",
      contentType: "image/jpeg",
      size: 10,
      result: RESULT,
    });
    expect(removePhotos).not.toHaveBeenCalled();
  });

  it("does not save a score when the upload fails", async () => {
    uploadPhoto.mockRejectedValue(new Error("storage down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await send(jpeg());
    expect(response.status).toBe(500);
    expect(saveScore).not.toHaveBeenCalled();
  });

  it("removes the uploaded photo when saving the score fails", async () => {
    saveScore.mockRejectedValue(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await send(jpeg());
    const [[path]] = uploadPhoto.mock.calls;
    expect(response.status).toBe(500);
    expect(removePhotos).toHaveBeenCalledWith([path]);
  });
});

describe("GET /api/score", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifySession.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("lists the signed-in user's scores", async () => {
    const entries = [{ id: "photo-1", score: 92 }];
    listScores.mockResolvedValue(entries);

    const response = await GET(new NextRequest("http://localhost/api/score"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: entries });
    expect(listScores).toHaveBeenCalledWith("user-1");
  });

  it("requires a signed-in user", async () => {
    verifySession.mockRejectedValue(
      new HttpError(401, ERRORS.http.unauthorized),
    );
    const response = await GET(new NextRequest("http://localhost/api/score"));
    expect(response.status).toBe(401);
    expect(listScores).not.toHaveBeenCalled();
  });
});
