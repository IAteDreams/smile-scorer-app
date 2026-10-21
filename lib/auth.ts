import { betterAuth, SecondaryStorage } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";
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

const previewHosts = [env.VERCEL_URL, env.VERCEL_BRANCH_URL].filter(
  (host): host is string => !!host,
);
const baseURL =
  env.VERCEL_ENV === "preview" && previewHosts.length > 0
    ? { allowedHosts: previewHosts, protocol: "https" as const }
    : undefined;

export const auth = betterAuth({
  baseURL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (env.NODE_ENV === "development") {
        console.info(`[auth] Verify ${user.email}: ${url}`);
        return;
      }

      const { error } = await resend.emails.send({
        from: "Resend <onboarding@resend.dev>",
        to: user.email,
        subject: "Verify your email",
        html: `<a href="${url}">Verify your email</a>`,
      });
      if (error) {
        throw new Error(`Failed to send verification email: ${error.message}`);
      }
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
  },
  plugins: [nextCookies()],
});
