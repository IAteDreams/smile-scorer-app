import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { LINKS } from "@/lib/constants/links";

const protectedRoutes = Object.values(LINKS.protected);
const guestRoutes = Object.values(LINKS.guest);

const matches = (path: string, routes: readonly string[]) =>
  routes.some((route) => path === route || path.startsWith(`${route}/`));

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (matches(pathname, protectedRoutes)) {
    if (!getSessionCookie(request)) {
      return NextResponse.redirect(new URL(LINKS.guest.signIn, request.url));
    }
    return NextResponse.next();
  }

  if (matches(pathname, guestRoutes)) {
    if (getSessionCookie(request)) {
      const session = await auth.api.getSession({ headers: request.headers });
      if (session) {
        return NextResponse.redirect(
          new URL(LINKS.protected.dashboard, request.url),
        );
      }
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
