import { describe, expect, it } from "vitest";

import { formatBytes, megabytes } from "./utils";

describe("megabytes", () => {
  it("converts megabytes to bytes", () => {
    expect(megabytes(4)).toBe(4_194_304);
    expect(megabytes(0.5)).toBe(524_288);
  });
});

describe("formatBytes", () => {
  it.each([
    [0, "0 B"],
    [512, "512 B"],
    [1023, "1023 B"],
    [1024, "1 KB"],
    [1536, "1.5 KB"],
    [380_307, "371.4 KB"],
    [megabytes(4), "4 MB"],
    [megabytes(4) + 1, "4 MB"],
    [megabytes(1024), "1 GB"],
    [megabytes(1024 * 1024), "1024 GB"],
  ])("formats %i as %s", (bytes, text) => {
    expect(formatBytes(bytes)).toBe(text);
  });

  it("round-trips megabytes", () => {
    expect(formatBytes(megabytes(4))).toBe("4 MB");
  });
});
