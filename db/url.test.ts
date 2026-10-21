import { describe, expect, it } from "vitest";

import { withoutSupaParam } from "./url";

describe("withoutSupaParam", () => {
  it("removes the supa param and keeps the rest", () => {
    const url = withoutSupaParam(
      "postgres://user:pass@db.example.com:6543/postgres?sslmode=require&supa=base-pooler.x",
    );
    expect(url).toBe(
      "postgres://user:pass@db.example.com:6543/postgres?sslmode=require",
    );
  });

  it("leaves URLs without it unchanged", () => {
    const url = "postgres://user:pass@db.example.com:5432/postgres";
    expect(withoutSupaParam(url)).toBe(url);
  });
});
