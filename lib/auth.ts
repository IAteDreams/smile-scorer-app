import { betterAuth, SecondaryStorage } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { redis } from "@/lib/redis";
import { resend } from "./resend";

const redisSecondaryStorage: SecondaryStorage = {
  get(key) {
    return redis.get(key);
  },
  getAndDelete(key) {
    return redis.getdel(key);
  },
  async increment(key, ttl) {
    if (!Number.isInteger(ttl) || ttl <= 0) {
      throw new TypeError("Redis increment TTL must be a positive integer");
    }
    const [value] = await redis.multi().incr(key).expire(key, ttl, "NX").exec();
    return value;
  },
  async set(key, value, ttl) {
    if (ttl) {
      await redis.set(key, value, { ex: ttl });
    } else {
      await redis.set(key, value);
    }
  },
  async delete(key) {
    await redis.del(key);
  },
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "noreply@smilescore.com",
        to: user.email,
        subject: "Verify your email",
        html: `<a href="${url}">Verify your email</a>`,
      });
    },
  },
  secondaryStorage: redisSecondaryStorage,
  session: {
    storeSessionInDatabase: true,
  },
  rateLimit: {
    enabled: true,
    storage: "secondary-storage",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },
  advanced: {
    ipAddress: { ipAddressHeaders: ["x-forwarded-for", "cf-connecting-ip"] },
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
