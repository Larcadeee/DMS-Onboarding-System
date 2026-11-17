import { apiRequest } from "@/lib/api-client";

export interface DashboardStats {
  id: string | null;
  perspective: "organization" | "trainer" | "trainee";
  trainee?: {
    id: number;
    name: string;
    trainee_number: string;
    status: string;
  } | null;
  stats: {
    active_trainees?: number;
    ongoing_programs?: number;
    completed_programs?: number;
    pending_assessments?: number;
    assigned_trainees?: number;
    upcoming_sessions?: number;
    completed_sessions?: number;
    assessments_passed?: number;
    assessments_pending?: number;
  } | null;
  completion: {
    enrolled: number;
    in_progress: number;
    completed: number;
    dropped: number;
  } | null;
  upcoming_sessions: UpcomingSession[];
  recent_activity: RecentActivity[];
}

export interface UpcomingSession {
  id: number;
  module_title: string;
  trainer: string | null;
  starts_at: string;
  ends_at: string;
  location: string | null;
  status: string;
}

export interface RecentActivity {
  id: number;
  action: string;
  user: string | null;
  created_at: string;
}

export function fetchDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>("/api/v1/dashboard/stats", {
    method: "GET",
  }).then((response) => response.data);
}
