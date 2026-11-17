import { apiRequest } from "@/lib/api-client";

export interface Program {
  id: number;
  department_id: number | null;
  title: string;
  code: string;
  description: string | null;
  total_hours: number;
  status: "draft" | "published" | "archived";
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  department?: {
    id: number;
    name: string;
    code: string;
  } | null;
  modules?: Array<{
    id: number;
    title: string;
    code: string;
  }>;
  trainees?: Array<{
    id: number;
    trainee_number: string;
    first_name: string;
    last_name: string;
    pivot: {
      status: string;
      enrolled_on: string;
      completed_on: string | null;
    };
  }>;
}

export interface ProgramListResponse {
  current_page: number;
  data: Program[];
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

export interface ProgramCreateInput {
  department_id?: number | null;
  title: string;
  code: string;
  description?: string | null;
  total_hours?: number;
  status?: "draft" | "published" | "archived";
  start_date?: string | null;
  end_date?: string | null;
}

export interface ProgramUpdateInput extends Partial<ProgramCreateInput> {}

export interface ProgramFilters {
  search?: string;
  status?: "draft" | "published" | "archived";
  per_page?: number;
}

export async function getPrograms(filters: ProgramFilters = {}): Promise<ProgramListResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.per_page) params.set("per_page", String(filters.per_page));

  const queryString = params.toString();
  const path = `/api/v1/programs${queryString ? `?${queryString}` : ""}`;

  const response = await apiRequest<ProgramListResponse>(path);
  return response.data;
}

export async function getProgram(id: number): Promise<Program> {
  const response = await apiRequest<Program>(`/api/v1/programs/${id}`);
  return response.data;
}

export async function createProgram(data: ProgramCreateInput): Promise<Program> {
  const response = await apiRequest<Program>("/api/v1/programs", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateProgram(id: number, data: ProgramUpdateInput): Promise<Program> {
  const response = await apiRequest<Program>(`/api/v1/programs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteProgram(id: number): Promise<void> {
  await apiRequest(`/api/v1/programs/${id}`, {
    method: "DELETE",
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "draft":
      return "bg-yellow-100 text-yellow-800";
    case "published":
      return "bg-green-100 text-green-800";
    case "archived":
      return "bg-slate-100 text-slate-800";
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