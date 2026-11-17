"use client";

import { apiRequest, ensureCsrfCookie } from "./api-client";
import type { AuthUser } from "./types";

/**
 * Client-side authentication helpers.
 *
 * Uses the Sanctum SPA flow: fetch a CSRF cookie, then POST the
 * credentials directly to Laravel, which sets the session cookies on
 * the browser. The session never passes through Next.js storage.
 */

export async function login(email: string, password: string): Promise<AuthUser> {
  await ensureCsrfCookie();

  const response = await apiRequest<AuthUser>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest("/api/v1/auth/logout", { method: "POST" });
  } catch {
    // Session may already be expired; the redirect below clears the UI
    // and the proxy gate prevents access to protected pages.
  }
}
