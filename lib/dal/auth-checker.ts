import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { HttpError } from "@/lib/error";

export type Session = typeof auth.$Infer.Session;

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export const verifySession = async () => {
  const session = await getSession();
  if (!session) throw new HttpError(401, "Unauthorized");
  return session;
};

export const verifyAuth = async <T>(
  handler: (session: Session) => Promise<T> | T,
): Promise<T> => handler(await verifySession());
