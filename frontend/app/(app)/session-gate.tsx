import type { ReactNode } from "react";

import { AuthProvider } from "@/app/providers/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth";

/**
 * Server component: resolves the session inside the Suspense boundary
 * on the (app) layout. An invalid session redirects to /login from
 * getCurrentUser(); a valid one feeds the shell and every client page.
 */
export async function SessionGate({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <AuthProvider user={user}>
      <AppShell user={user}>{children}</AppShell>
    </AuthProvider>
  );
}
