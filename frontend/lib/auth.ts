import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthUser } from "./types";

/**
 * Server-side session helpers (Data Access Layer).
 *
 * The session itself lives in Laravel Sanctum cookies. To resolve the
 * current user on the server, we forward the browser's cookies (and a
 * Referer header so Sanctum treats the request as stateful) to the
 * Laravel `/auth/me` endpoint.
 */

async function laravelApiUrl(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not set. Check frontend/.env.local.");
  }
  return url.replace(/\/$/, "");
}

/**
 * Resolve the authenticated user, or null when there is no valid session.
 */
export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  if (!cookieHeader) {
    return null;
  }

  const host = (await headers()).get("host") ?? "localhost:3000";
  const apiUrl = await laravelApiUrl();

  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
      headers: {
        Cookie: cookieHeader,
        Referer: `http://${host}/`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data: AuthUser };
    return payload.data;
  } catch {
    return null;
  }
}

/**
 * Resolve the authenticated user or redirect to the login page.
 *
 * Session reads cannot be prerendered into the static shell, so pages
 * call this inside a <Suspense> boundary. The `use cache: private`
 * scope keeps the result in the browser only and allows prefetching.
 */
export async function getCurrentUser(): Promise<AuthUser> {
  "use cache: private";

  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}
