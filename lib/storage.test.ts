import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getPhotoUrl,
  getPhotoUrls,
  photoPath,
  removePhotos,
  uploadPhoto,
} from "./storage";

const { bucket, from } = vi.hoisted(() => {
  const bucket = {
    upload: vi.fn(),
    remove: vi.fn(),
    createSignedUrl: vi.fn(),
    createSignedUrls: vi.fn(),
  };
  return { bucket, from: vi.fn(() => bucket) };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SECRET_KEY: "secret",
  },
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ storage: { from } }),
}));

const failure = new Error("storage down");

describe("storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bucket.upload.mockResolvedValue({ data: {}, error: null });
    bucket.remove.mockResolvedValue({ data: [], error: null });
    bucket.createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed" },
      error: null,
    });
  });

  it("keeps each user's photos in their own folder", () => {
    expect(photoPath("user-1", "photo-1")).toBe("user-1/photo-1");
  });

  it("uploads to the photos bucket without overwriting", async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    await uploadPhoto("user-1/photo-1", bytes, "image/jpeg");
    expect(from).toHaveBeenCalledWith("photos");
    expect(bucket.upload).toHaveBeenCalledWith("user-1/photo-1", bytes, {
      contentType: "image/jpeg",
      upsert: false,
    });
  });

  it("throws when the upload fails", async () => {
    bucket.upload.mockResolvedValue({ data: null, error: failure });
    await expect(
      uploadPhoto("user-1/photo-1", new Uint8Array(), "image/png"),
    ).rejects.toBe(failure);
  });

  it("removes photos", async () => {
    await removePhotos(["user-1/photo-1"]);
    expect(bucket.remove).toHaveBeenCalledWith(["user-1/photo-1"]);
  });

  it("skips the request when there is nothing to remove", async () => {
    await removePhotos([]);
    expect(bucket.remove).not.toHaveBeenCalled();
  });

  it("returns a short-lived signed URL", async () => {
    expect(await getPhotoUrl("user-1/photo-1")).toBe("https://signed");
    expect(bucket.createSignedUrl).toHaveBeenCalledWith(
      "user-1/photo-1",
      3600,
      undefined,
    );
  });

  it("can sign a link that downloads under the original name", async () => {
    await getPhotoUrl("user-1/photo-1", { download: "beach-day.jpg" });
    expect(bucket.createSignedUrl).toHaveBeenCalledWith(
      "user-1/photo-1",
      3600,
      { download: "beach-day.jpg" },
    );
  });

  it("throws when signing fails", async () => {
    bucket.createSignedUrl.mockResolvedValue({ data: null, error: failure });
    await expect(getPhotoUrl("user-1/photo-1")).rejects.toBe(failure);
  });

  it("signs many photos in one request", async () => {
    bucket.createSignedUrls.mockResolvedValue({
      data: [
        { path: "user-1/a", signedUrl: "https://signed/a", error: null },
        { path: "user-1/b", signedUrl: null, error: "Object not found" },
      ],
      error: null,
    });

    const urls = await getPhotoUrls(["user-1/a", "user-1/b"]);
    expect(bucket.createSignedUrls).toHaveBeenCalledWith(
      ["user-1/a", "user-1/b"],
      3600,
    );
    expect([...urls]).toEqual([["user-1/a", "https://signed/a"]]);
  });

  it("skips the request when there are no photos to sign", async () => {
    expect((await getPhotoUrls([])).size).toBe(0);
    expect(bucket.createSignedUrls).not.toHaveBeenCalled();
  });

  it("throws when batch signing fails", async () => {
    bucket.createSignedUrls.mockResolvedValue({ data: null, error: failure });
    await expect(getPhotoUrls(["user-1/a"])).rejects.toBe(failure);
  });
});
