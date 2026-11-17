"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AuditLogsPage() {
  const router = useRouter();
  const { hasRole, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !hasRole("super_admin", "training_supervisor")) {
      router.push("/dashboard");
    }
  }, [hasRole, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!hasRole("super_admin", "training_supervisor")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audit Logs</h1>
        <p className="mt-1 text-slate-500">View system audit trail.</p>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-slate-500">Coming soon...</p>
      </div>
    </div>
  );
}