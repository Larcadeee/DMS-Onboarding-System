"use client";

import { useEffect, useState } from "react";

import { StatCard } from "@/components/ui/stat-card";
import { ClockIcon, MapPinIcon } from "@/components/ui/icons";
import { fetchDashboardStats } from "@/lib/api/dashboard";
import type {
  DashboardStats,
  RecentActivity,
  UpcomingSession,
} from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/app/providers/auth-provider";

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "signed in",
  "auth.logout": "signed out",
  "auth.login_failed": "failed sign-in attempt",
  "auth.login_blocked": "was blocked from signing in",
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatSessionTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelative(iso: string): string {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function DashboardContent() {
  const { user, roleLabel } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load dashboard."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (stats === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true">
        <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {greeting()}, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {roleLabel ?? "No role"} · Dispatch Management Section
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
          {stats.perspective === "organization"
            ? "Organization view"
            : stats.perspective === "trainer"
              ? "Trainer view"
              : "My onboarding"}
        </span>
      </div>

      {/* Trainee profile banner */}
      {stats.trainee && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {stats.trainee.name}
              </p>
              <p className="text-xs text-slate-500">
                Trainee No. {stats.trainee.trainee_number}
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              {stats.trainee.status}
            </span>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCards stats={stats} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {stats.completion && <CompletionOverview stats={stats} />}
          <UpcomingSessionsCard sessions={stats.upcoming_sessions} />
        </div>
        <div>
          {stats.perspective !== "trainee" && (
            <RecentActivityCard activity={stats.recent_activity} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCards({ stats }: { stats: DashboardStats }) {
  if (stats.stats === null) {
    return (
      <div className="sm:col-span-2 xl:col-span-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        No trainee profile is linked to your account yet. Please contact the
        system administrator.
      </div>
    );
  }

  const s = stats.stats;

  if (stats.perspective === "organization") {
    return (
      <>
        <StatCard label="Active Trainees" value={s.active_trainees ?? 0} hint="Currently in onboarding" />
        <StatCard label="Ongoing Enrollments" value={s.ongoing_programs ?? 0} accent="text-blue-700" hint="In-progress programs" />
        <StatCard label="Completed Enrollments" value={s.completed_programs ?? 0} accent="text-emerald-700" hint="Finished the program" />
        <StatCard label="Pending Assessments" value={s.pending_assessments ?? 0} accent="text-amber-600" hint="Awaiting scores" />
      </>
    );
  }

  if (stats.perspective === "trainer") {
    return (
      <>
        <StatCard label="Active Trainees" value={s.assigned_trainees ?? 0} hint="In onboarding" />
        <StatCard label="Upcoming Sessions" value={s.upcoming_sessions ?? 0} accent="text-blue-700" hint="Assigned to you" />
        <StatCard label="Completed Sessions" value={s.completed_sessions ?? 0} accent="text-emerald-700" />
        <StatCard label="Pending Assessments" value={s.pending_assessments ?? 0} accent="text-amber-600" hint="Awaiting scores" />
      </>
    );
  }

  return (
    <>
      <StatCard label="Ongoing Programs" value={s.ongoing_programs ?? 0} hint="Currently enrolled" />
      <StatCard label="Completed Programs" value={s.completed_programs ?? 0} accent="text-emerald-700" />
      <StatCard label="Assessments Passed" value={s.assessments_passed ?? 0} accent="text-emerald-700" hint="Out of graded attempts" />
      <StatCard label="Pending Results" value={s.assessments_pending ?? 0} accent="text-amber-600" hint="Awaiting scores" />
    </>
  );
}

const COMPLETION_ROWS = [
  { key: "in_progress", label: "In progress", color: "bg-blue-600" },
  { key: "enrolled", label: "Enrolled", color: "bg-sky-400" },
  { key: "completed", label: "Completed", color: "bg-emerald-600" },
  { key: "dropped", label: "Dropped", color: "bg-slate-400" },
] as const;

function CompletionOverview({ stats }: { stats: DashboardStats }) {
  const completion = stats.completion;
  if (!completion) return null;

  const total = completion.enrolled + completion.in_progress + completion.completed + completion.dropped;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">
        {stats.perspective === "trainee" ? "My program status" : "Enrollment status overview"}
      </h2>
      {total === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No program enrollments yet.
        </p>
      ) : (
        <>
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
            {COMPLETION_ROWS.map((row) => {
              const value = completion[row.key];
              return value > 0 ? (
                <div
                  key={row.key}
                  className={row.color}
                  style={{ width: `${(value / total) * 100}%` }}
                  title={`${row.label}: ${value}`}
                />
              ) : null;
            })}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {COMPLETION_ROWS.map((row) => (
              <div key={row.key} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                <dt className="text-xs text-slate-500">{row.label}</dt>
                <dd className="text-xs font-semibold text-slate-900">
                  {completion[row.key]}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </section>
  );
}

function UpcomingSessionsCard({ sessions }: { sessions: UpcomingSession[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Upcoming sessions</h2>
      {sessions.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No upcoming sessions scheduled.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {sessions.map((session) => (
            <li key={session.id} className="flex items-start gap-4 py-3">
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md bg-blue-50 text-blue-800">
                <span className="text-[10px] font-semibold uppercase">
                  {new Date(session.starts_at).toLocaleString(undefined, { month: "short" })}
                </span>
                <span className="text-sm font-bold leading-none">
                  {new Date(session.starts_at).getDate()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {session.module_title}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon width={12} height={12} />
                    {formatSessionTime(session.starts_at)}
                  </span>
                  {session.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon width={12} height={12} />
                      {session.location}
                    </span>
                  )}
                </p>
                {session.trainer && (
                  <p className="mt-0.5 text-xs text-slate-400">
                    Trainer: {session.trainer}
                  </p>
                )}
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                {session.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RecentActivityCard({ activity }: { activity: RecentActivity[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Recent activity</h2>
      {activity.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No recorded activity yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {activity.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <div className="min-w-0">
                <p className="text-slate-700">
                  <span className="font-medium text-slate-900">
                    {entry.user ?? "Unknown user"}
                  </span>{" "}
                  {ACTION_LABELS[entry.action] ?? `triggered ${entry.action}`}
                </p>
                <p className="text-xs text-slate-400">{formatRelative(entry.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
