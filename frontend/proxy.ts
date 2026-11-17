import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route gate for the CDRRMD Onboarding System.
 *
 * The authenticated session lives in a Laravel Sanctum cookie. The
 * proxy performs a cheap cookie-presence check so unauthenticated
 * visitors are sent to /login before any page renders. The real
 * verification always happens server-side: Laravel rejects API calls
 * without a valid session, and protected pages re-resolve the session
 * via lib/auth.ts.
 */

const SESSION_COOKIE = "cdrrmd_session";
const LOGIN_PATH = "/login";
const DEFAULT_REDIRECT = "/dashboard";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && pathname !== LOGIN_PATH) {
    const url = new URL(LOGIN_PATH, request.url);
    if (pathname !== "/") {
      url.searchParams.set("redirect", `${pathname}${search}`);
    }
    return NextResponse.redirect(url);
  }

  if (hasSession && pathname === LOGIN_PATH) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  if (hasSession && pathname === "/") {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on every page request except static assets and the Next.js
  // internals.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
