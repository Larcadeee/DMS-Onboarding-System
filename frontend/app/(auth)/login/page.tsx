import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In | CDRRMD Onboarding System",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-blue-700 text-lg font-bold text-white">
            CD
          </div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            CDRRMD Dispatch Management Section
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            New Hire Onboarding System
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Use the credentials issued by the system administrator.
          </p>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Butuan City Disaster Risk Reduction and Management Department
        </p>
      </div>
    </main>
  );
}
