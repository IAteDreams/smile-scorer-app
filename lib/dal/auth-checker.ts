import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { ERRORS, HttpError } from "@/lib/error";

export type Session = typeof auth.$Infer.Session;

// connection() keeps the session lookup out of prefetches: it waits for a
// real request, so a prefetch never starts the Redis call only to abandon it.
export const getSession = cache(async () => {
  await connection();
  return auth.api.getSession({ headers: await headers() });
});

export const verifySession = async () => {
  const session = await getSession();
  if (!session) throw new HttpError(401, ERRORS.http.unauthorized);
  return session;
};

export const verifyAuth = async <T>(
  handler: (session: Session) => Promise<T> | T,
): Promise<T> => handler(await verifySession());
