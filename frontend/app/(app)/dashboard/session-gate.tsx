import { AuthProvider } from "@/app/providers/auth-provider";
import { getCurrentUser } from "@/lib/auth";

import { DashboardContent } from "./dashboard-content";

/**
 * Server component: resolves the session inside the Suspense boundary
 * on the dashboard page. Laravel decides whether the session is valid;
 * an invalid session redirects to /login from getCurrentUser().
 */
export async function SessionGate() {
  const user = await getCurrentUser();

  return (
    <AuthProvider user={user}>
      <DashboardContent />
    </AuthProvider>
  );
}
