"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";

interface HealthData {
  app: string;
  environment: string;
  database: string;
  database_name: string | null;
  timestamp: string;
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<HealthData>("/api/v1/health")
      .then((res) => setHealth(res.data))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold text-slate-900">
        CDRRMD Onboarding System
      </h1>
      <p className="mt-1 text-sm text-slate-500">Connectivity check</p>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        {error && (
          <p className="text-sm text-red-600">Backend unreachable: {error}</p>
        )}
        {!error && !health && (
          <p className="text-sm text-slate-500">Checking backend…</p>
        )}
        {health && (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-slate-500">Application</dt>
            <dd className="text-slate-900">{health.app}</dd>
            <dt className="text-slate-500">Environment</dt>
            <dd className="text-slate-900">{health.environment}</dd>
            <dt className="text-slate-500">Database</dt>
            <dd className="text-slate-900">
              {health.database} ({health.database_name})
            </dd>
            <dt className="text-slate-500">Checked at</dt>
            <dd className="text-slate-900">{health.timestamp}</dd>
          </dl>
        )}
      </section>
    </main>
  );
}