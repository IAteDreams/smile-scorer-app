import { betterAuth, SecondaryStorage, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import {
  sendExistingAccountEmail,
  sendVerificationEmail,
} from "@/lib/auth-emails";
import { LINKS } from "@/lib/constants/links";
import { env } from "@/lib/env";
import { redis } from "@/lib/redis";

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

/**
 * Someone signed up with an email that already has an account. Better Auth
 * still answers with a normal sign-up response, so the form can't be used to
 * find out who is registered; the email tells the real owner what to do.
 */
async function onExistingUserSignUp(
  { user }: { user: User },
  request?: Request,
): Promise<void> {
  try {
    if (user.emailVerified) {
      const origin = request
        ? new URL(request.url).origin
        : (await auth.$context).baseURL;
      await sendExistingAccountEmail({
        email: user.email,
        signInUrl: new URL(LINKS.guest.signIn, origin).href,
      });
    } else {
      await auth.api.sendVerificationEmail({
        body: { email: user.email, callbackURL: LINKS.protected.dashboard },
      });
    }
  } catch (error) {
    // Failing here would answer differently for registered emails.
    console.error("[auth] Could not email an existing user", error);
  }
}

export const auth = betterAuth({
  baseURL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    onExistingUserSignUp,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail,
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
