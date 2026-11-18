import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = [
  "/login",
  "/api/health",
  "/api/sanctum/csrf-cookie",
  "/api/v1/auth/login",
  "/api/v1/auth/logout",
  "/api/v1/auth/user",
  "/api/v1/trainees",
  "/api/v1/programs",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // For API routes, let the API routes handle authentication
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // For dashboard routes, redirect to login if no session
  // Check for Laravel session cookie
  const sessionCookie = request.cookies.get("laravel_session");
  if (pathname.startsWith("/dashboard")) {
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};