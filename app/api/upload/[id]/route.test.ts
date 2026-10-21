// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERRORS, HttpError } from "@/lib/error";

import { GET } from "./route";

const { verifySession, getUpload, getPhotoUrl } = vi.hoisted(() => ({
  verifySession: vi.fn(),
  getUpload: vi.fn(),
  getPhotoUrl: vi.fn(),
}));

vi.mock("@/lib/dal/auth-checker", () => ({
  verifyAuth: async (handler: (session: unknown) => unknown) =>
    handler(await verifySession()),
}));
vi.mock("@/lib/dal/score", () => ({ getUpload }));
vi.mock("@/lib/storage", () => ({ getPhotoUrl }));

const ID = "0199f3a2-7c1e-7b4a-9d2e-1f2a3b4c5d6e";

const request = (id: string, query = "") =>
  GET(new NextRequest(`http://localhost/api/upload/${id}${query}`), {
    params: Promise.resolve({ id }),
  });

describe("GET /api/upload/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifySession.mockResolvedValue({ user: { id: "user-1" } });
    getPhotoUrl.mockResolvedValue("https://signed/photo");
  });

  it("returns the upload with a fresh signed URL", async () => {
    getUpload.mockResolvedValue({
      id: ID,
      userId: "user-1",
      path: `user-1/${ID}`,
      fileName: "beach-day.jpg",
      contentType: "image/jpeg",
      size: 1234,
      createdAt: new Date("2026-10-21T14:14:00Z"),
    });

    const response = await request(ID);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: {
        id: ID,
        fileName: "beach-day.jpg",
        contentType: "image/jpeg",
        size: 1234,
        uploadedAt: "2026-10-21T14:14:00.000Z",
        url: "https://signed/photo",
      },
    });
    expect(getUpload).toHaveBeenCalledWith("user-1", ID);
    expect(getPhotoUrl).toHaveBeenCalledWith(`user-1/${ID}`, {
      download: undefined,
    });
  });

  it("names an upload without a saved file name", async () => {
    getUpload.mockResolvedValue({
      id: ID,
      path: `user-1/${ID}`,
      fileName: null,
      contentType: "image/png",
      size: 1,
      createdAt: new Date(),
    });
    const { data } = await (await request(ID)).json();
    expect(data.fileName).toBe("Untitled photo");
  });

  it("returns 404 for someone else's or a missing upload", async () => {
    getUpload.mockResolvedValue(null);
    const response = await request(ID);
    expect(response.status).toBe(404);
    expect((await response.json()).error.message).toBe(ERRORS.http.notFound);
    expect(getPhotoUrl).not.toHaveBeenCalled();
  });

  it("returns 404 without querying for an id that is not a UUID", async () => {
    const response = await request("not-a-uuid");
    expect(response.status).toBe(404);
    expect(getUpload).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    verifySession.mockRejectedValue(
      new HttpError(401, ERRORS.http.unauthorized),
    );
    const response = await request(ID);
    expect(response.status).toBe(401);
    expect(getUpload).not.toHaveBeenCalled();
  });

  it("signs a download link named after the file when asked", async () => {
    getUpload.mockResolvedValue({
      id: ID,
      path: `user-1/${ID}`,
      fileName: "beach-day.jpg",
      contentType: "image/jpeg",
      size: 1,
      createdAt: new Date(),
    });
    await request(ID, "?download=1");
    expect(getPhotoUrl).toHaveBeenCalledWith(`user-1/${ID}`, {
      download: "beach-day.jpg",
    });
  });
});
