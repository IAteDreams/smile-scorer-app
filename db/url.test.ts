import { describe, expect, it } from "vitest";

import { isLocalDatabase, withoutSupaParam } from "./url";

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

describe("isLocalDatabase", () => {
  it.each([
    "postgres://user:pass@localhost:54329/smile",
    "postgres://user:pass@127.0.0.1:5432/smile",
    "postgres://user:pass@[::1]:5432/smile",
  ])("treats %s as local", (url) => {
    expect(isLocalDatabase(url)).toBe(true);
  });

  it("treats a hosted database as remote", () => {
    expect(
      isLocalDatabase(
        "postgres://user:pass@db.example.supabase.co:6543/postgres",
      ),
    ).toBe(false);
  });
});
