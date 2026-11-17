import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  /** Tailwind text/border color classes for the accent bar and value. */
  accent?: string;
  hint?: string;
  icon?: ReactNode;
}

export function StatCard({
  label,
  value,
  accent = "text-blue-700",
  hint,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && <span className={`shrink-0 ${accent}`}>{icon}</span>}
      </div>
      <p className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
