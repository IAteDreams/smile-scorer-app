import { beforeEach, describe, expect, it, vi } from "vitest";

import { withinRateLimit } from "./rate-limit";

const { counts, expire } = vi.hoisted(() => ({
  counts: new Map<string, number>(),
  expire: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({
  redis: {
    multi: () => {
      let key = "";
      const chain = {
        incr: (k: string) => ((key = k), chain),
        expire: (...args: unknown[]) => (expire(...args), chain),
        exec: async () => {
          const next = (counts.get(key) ?? 0) + 1;
          counts.set(key, next);
          return [next, 1];
        },
      };
      return chain;
    },
  },
}));

const rule = { limit: 2, windowSeconds: 60 };

describe("withinRateLimit", () => {
  beforeEach(() => {
    counts.clear();
    expire.mockClear();
  });

  it("allows uses up to the limit, then refuses", async () => {
    expect(await withinRateLimit("user-1", rule)).toBe(true);
    expect(await withinRateLimit("user-1", rule)).toBe(true);
    expect(await withinRateLimit("user-1", rule)).toBe(false);
  });

  it("counts each key separately", async () => {
    await withinRateLimit("user-1", rule);
    await withinRateLimit("user-1", rule);
    expect(await withinRateLimit("user-2", rule)).toBe(true);
  });

  it("only sets the window when it starts", async () => {
    await withinRateLimit("user-1", rule);
    expect(expire).toHaveBeenCalledWith("user-1", 60, "NX");
  });
});
