import { describe, expect, it } from "vitest";

import { scoreQuerySchema } from "./score";

describe("scoreQuerySchema", () => {
  it("defaults to the first page of the newest photos", () => {
    expect(scoreQuerySchema.parse({})).toEqual({
      q: "",
      sort: "newest",
      page: 0,
    });
  });

  it("reads query-string values", () => {
    expect(
      scoreQuerySchema.parse({ q: "  beach ", sort: "lowest", page: "3" }),
    ).toEqual({ q: "beach", sort: "lowest", page: 3 });
  });

  it.each([
    [{ sort: "random" }],
    [{ page: "-1" }],
    [{ page: "1.5" }],
    [{ page: "lots" }],
    [{ q: "x".repeat(101) }],
  ])("rejects %j", (input) => {
    expect(scoreQuerySchema.safeParse(input).success).toBe(false);
  });
});
