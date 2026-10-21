import { redis } from "@/lib/redis";

type RateLimit = { limit: number; windowSeconds: number };

export async function withinRateLimit(
  key: string,
  { limit, windowSeconds }: RateLimit,
) {
  const [count] = await redis
    .multi()
    .incr(key)
    .expire(key, windowSeconds, "NX")
    .exec<[number, number]>();
  return Number(count) <= limit;
}
