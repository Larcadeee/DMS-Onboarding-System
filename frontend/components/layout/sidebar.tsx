"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  AssessmentIcon,
  AttendanceIcon,
  AuditIcon,
  CalendarIcon,
  CompetencyIcon,
  DashboardIcon,
  ModuleIcon,
  ProgramIcon,
  ReportsIcon,
  UsersIcon,
} from "@/components/ui/icons";
import type { AuthUser } from "@/lib/types";

interface NavItem {
  label: string;
  href?: string;
  /** Roles that see this item; undefined = all roles. */
  roles?: string[];
  /** Phases that have not shipped yet render as disabled. */
  comingSoon?: boolean;
  icon: React.ReactNode;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
      {
        label: "Trainees",
        roles: ["super_admin", "training_supervisor", "trainer"],
        comingSoon: true, // Phase 06
        icon: <UsersIcon />,
      },
      {
        label: "Onboarding Programs",
        roles: ["super_admin", "training_supervisor"],
        comingSoon: true, // Phase 07
        icon: <ProgramIcon />,
      },
      {
        label: "Training Modules",
        roles: ["super_admin", "training_supervisor", "trainer"],
        comingSoon: true, // Phase 07
        icon: <ModuleIcon />,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Schedules",
        comingSoon: true, // Phase 08
        icon: <CalendarIcon />,
      },
      {
        label: "Attendance",
        roles: ["super_admin", "training_supervisor", "trainer"],
        comingSoon: true, // Phase 08
        icon: <AttendanceIcon />,
      },
      {
        label: "Assessments",
        roles: ["super_admin", "training_supervisor", "trainer"],
        comingSoon: true, // Phase 09
        icon: <AssessmentIcon />,
      },
      {
        label: "My Results",
        roles: ["trainee"],
        comingSoon: true, // Phase 09
        icon: <AssessmentIcon />,
      },
      {
        label: "Competencies",
        comingSoon: true, // Phase 10
        icon: <CompetencyIcon />,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Reports",
        roles: ["super_admin", "training_supervisor"],
        comingSoon: true, // Phase 11
        icon: <ReportsIcon />,
      },
      {
        label: "User Management",
        roles: ["super_admin"],
        comingSoon: true, // Phase 12
        icon: <UsersIcon />,
      },
      {
        label: "Audit Logs",
        roles: ["super_admin"],
        comingSoon: true, // Phase 12
        icon: <AuditIcon />,
      },
    ],
  },
];

export function Sidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const role = user.role?.name ?? "";

  return (
    <nav className="flex h-full flex-col" aria-label="Main navigation">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-700 text-sm font-bold text-white">
          CD
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            CDRRMD Onboarding
          </p>
          <p className="truncate text-xs text-slate-500">Dispatch Management</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter(
            (item) => !item.roles || item.roles.includes(role)
          );
          if (items.length === 0) return null;

          return (
            <div key={section.title} className="mt-4">
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <ul className="mt-2 space-y-0.5">
                {items.map((item) => {
                  if (item.comingSoon || !item.href) {
                    return (
                      <li key={item.label}>
                        <span
                          className="flex cursor-not-allowed items-center justify-between rounded-md px-2 py-2 text-sm text-slate-400"
                          title="Available in an upcoming phase"
                        >
                          <span className="flex items-center gap-3">
                            {item.icon}
                            {item.label}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                            soon
                          </span>
                        </span>
                      </li>
                    );
                  }

                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                          active
                            ? "bg-blue-50 font-medium text-blue-800"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 px-5 py-3">
        <p className="text-[11px] leading-tight text-slate-400">
          Butuan City Disaster Risk Reduction and Management Department
        </p>
      </div>
    </nav>
  );
}
