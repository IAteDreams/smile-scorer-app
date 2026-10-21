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
  makeThumbnail,
} = vi.hoisted(() => ({
  verifySession: vi.fn(),
  withinRateLimit: vi.fn(),
  analyzePhoto: vi.fn(),
  uploadPhoto: vi.fn(),
  removePhotos: vi.fn(),
  saveScore: vi.fn(),
  listScores: vi.fn(),
  makeThumbnail: vi.fn(),
}));

vi.mock("@/lib/dal/auth-checker", () => ({
  verifyAuth: async (handler: (session: unknown) => unknown) =>
    handler(await verifySession()),
}));
vi.mock("@/lib/rate-limit", () => ({ withinRateLimit }));
vi.mock("@/lib/rekognition", () => ({ analyzePhoto }));
vi.mock("@/lib/storage", () => ({
  photoPath: (userId: string, id: string) => `${userId}/${id}`,
  thumbnailPath: (path: string) => `${path}.thumb.webp`,
  uploadPhoto,
  removePhotos,
}));
vi.mock("@/lib/thumbnail", () => ({
  makeThumbnail,
  THUMBNAIL_TYPE: "image/webp",
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
    makeThumbnail.mockResolvedValue(new Uint8Array([9]));
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

  it("stores a small thumbnail next to the photo", async () => {
    const { data } = await (await send(jpeg())).json();
    expect(uploadPhoto).toHaveBeenCalledWith(
      `user-1/${data.id}.thumb.webp`,
      new Uint8Array([9]),
      "image/webp",
    );
  });

  it("still scores the photo when no thumbnail can be made", async () => {
    makeThumbnail.mockResolvedValue(null);
    const response = await send(jpeg());
    expect(response.status).toBe(200);
    expect(uploadPhoto).toHaveBeenCalledTimes(1);
    expect(saveScore).toHaveBeenCalled();
  });

  it("still scores the photo when the thumbnail upload fails", async () => {
    uploadPhoto
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("storage hiccup"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await send(jpeg());
    expect(response.status).toBe(200);
    expect(saveScore).toHaveBeenCalled();
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
    expect(removePhotos).toHaveBeenCalledWith([path, `${path}.thumb.webp`]);
  });
});

describe("GET /api/score", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifySession.mockResolvedValue({ user: { id: "user-1" } });
  });

  const get = (query = "") =>
    GET(new NextRequest(`http://localhost/api/score${query}`));

  it("returns the first page of the user's scores by default", async () => {
    const page = { items: [{ id: "photo-1" }], total: 1, page: 0, pageSize: 6 };
    listScores.mockResolvedValue(page);

    const response = await get();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: page });
    expect(listScores).toHaveBeenCalledWith("user-1", {
      query: "",
      sort: "newest",
      page: 0,
    });
  });

  it("passes the search, sort and page through", async () => {
    listScores.mockResolvedValue({ items: [], total: 0, page: 2, pageSize: 6 });
    await get("?q=%20beach%20&sort=highest&page=2");
    expect(listScores).toHaveBeenCalledWith("user-1", {
      query: "beach",
      sort: "highest",
      page: 2,
    });
  });

  it.each([
    ["an unknown sort", "?sort=random"],
    ["a negative page", "?page=-1"],
    ["a page that is not a number", "?page=two"],
    ["a very long search", `?q=${"a".repeat(101)}`],
  ])("rejects %s", async (_, query) => {
    const response = await get(query);
    expect(response.status).toBe(422);
    expect(listScores).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    verifySession.mockRejectedValue(
      new HttpError(401, ERRORS.http.unauthorized),
    );
    const response = await get();
    expect(response.status).toBe(401);
    expect(listScores).not.toHaveBeenCalled();
  });
});
