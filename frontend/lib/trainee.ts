import { apiRequest } from "@/lib/api-client";

export interface Trainee {
  id: number;
  user_id: number | null;
  trainee_number: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  barangay: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  enrollments?: Array<{
    id: number;
    program_id: number;
    status: string;
    enrolled_on: string;
    completed_on: string | null;
    program: {
      id: number;
      name: string;
      code: string;
    };
  }>;
  competencies?: Array<{
    id: number;
    name: string;
    code: string;
    pivot: {
      status: string;
      achieved_on: string | null;
      verified_by: number | null;
    };
  }>;
  assessment_results?: Array<{
    id: number;
    assessment_id: number;
    score: number;
    status: string;
    assessment: {
      id: number;
      title: string;
      type: string;
    };
  }>;
  attendance_records?: Array<{
    id: number;
    schedule_id: number;
    status: string;
    schedule: {
      id: number;
      title: string;
      start_time: string;
      end_time: string;
    };
  }>;
}

export interface TraineeListResponse {
  current_page: number;
  data: Trainee[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface TraineeCreateInput {
  user_id?: number | null;
  trainee_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  barangay?: string | null;
  status?: string;
}

export interface TraineeUpdateInput extends Partial<TraineeCreateInput> {}

export interface TraineeFilters {
  search?: string;
  status?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  per_page?: number;
}

export async function getTrainees(filters: TraineeFilters = {}): Promise<TraineeListResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.sort_by) params.set("sort_by", filters.sort_by);
  if (filters.sort_dir) params.set("sort_dir", filters.sort_dir);
  if (filters.per_page) params.set("per_page", String(filters.per_page));

  const queryString = params.toString();
  const path = `/api/v1/trainees${queryString ? `?${queryString}` : ""}`;

  const response = await apiRequest<TraineeListResponse>(path);
  return response.data;
}

export async function getTrainee(id: number): Promise<Trainee> {
  const response = await apiRequest<Trainee>(`/api/v1/trainees/${id}`);
  return response.data;
}

export async function createTrainee(data: TraineeCreateInput): Promise<Trainee> {
  const response = await apiRequest<Trainee>("/api/v1/trainees", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateTrainee(id: number, data: TraineeUpdateInput): Promise<Trainee> {
  const response = await apiRequest<Trainee>(`/api/v1/trainees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteTrainee(id: number): Promise<void> {
  await apiRequest(`/api/v1/trainees/${id}`, {
    method: "DELETE",
  });
}

export function getFullName(trainee: Trainee): string {
  const parts = [trainee.first_name, trainee.middle_name, trainee.last_name].filter(Boolean);
  return parts.join(" ");
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-slate-100 text-slate-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "withdrawn":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}