import { Suspense, type ReactNode } from "react";

import { SessionGate } from "./session-gate";

/**
 * Static shell for all authenticated pages. The session resolves
 * inside the Suspense boundary (cacheComponents requires this), so
 * protected content streams in behind the skeleton.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-slate-100">
      <Suspense fallback={<ShellSkeleton />}>
        <SessionGate>{children}</SessionGate>
      </Suspense>
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="min-h-full lg:pl-64" aria-busy="true">
      <div className="flex h-14 items-center border-b border-slate-200 bg-white px-6">
        <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-lg bg-slate-200"
            />
          ))}
        </div>
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}
