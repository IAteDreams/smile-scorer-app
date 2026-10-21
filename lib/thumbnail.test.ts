// @vitest-environment node
import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

import { makeThumbnail, THUMBNAIL_TYPE } from "./thumbnail";

vi.mock("server-only", () => ({}));

const photo = (width: number, height: number) =>
  sharp({
    create: { width, height, channels: 3, background: "#f0a" },
  })
    .jpeg()
    .toBuffer();

describe("makeThumbnail", () => {
  it("makes a 96px square WebP from a portrait photo", async () => {
    const thumbnail = await makeThumbnail(
      new Uint8Array(await photo(600, 900)),
    );
    expect(thumbnail).not.toBeNull();

    const { width, height, format } = await sharp(thumbnail!).metadata();
    expect({ width, height, format }).toEqual({
      width: 96,
      height: 96,
      format: "webp",
    });
    expect(THUMBNAIL_TYPE).toBe("image/webp");
  });

  it("is much smaller than the original", async () => {
    const original = new Uint8Array(await photo(2000, 3000));
    const thumbnail = await makeThumbnail(original);
    expect(thumbnail!.byteLength).toBeLessThan(original.byteLength / 5);
  });

  it("returns null instead of throwing for bytes it cannot read", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await makeThumbnail(new Uint8Array([1, 2, 3]))).toBeNull();
  });
});
