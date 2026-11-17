const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta: Record<string, unknown> | null;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiSuccess<T>> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const xsrf = getCookie("XSRF-TOKEN");
    if (xsrf) headers.set("X-XSRF-TOKEN", xsrf);
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiFailure
    | null;

  if (!response.ok || !payload || payload.success === false) {
    const failure = payload as ApiFailure | null;
    throw new ApiError(
      response.status,
      failure?.message ?? `Request failed with status ${response.status}`,
      failure?.errors
    );
  }

  return payload;
}

export async function ensureCsrfCookie(): Promise<void> {
  await apiRequest("/api/sanctum/csrf-cookie");
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    employee_number: string | null;
    is_active: boolean;
    last_login_at: string | null;
    role: {
      id: number;
      name: string;
      label: string;
      description: string | null;
      permissions: string[];
    } | null;
    department: {
      id: number;
      name: string;
      code: string;
    } | null;
  };
}

export async function login(email: string, password: string, remember = false): Promise<LoginResponse> {
  await ensureCsrfCookie();

  const response = await apiRequest<LoginResponse["user"]>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, remember }),
  });

  return { user: response.data };
}

export async function logout(): Promise<void> {
  await apiRequest("/api/v1/auth/logout", { method: "POST" });
}

export async function getUser(): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse["user"]>("/api/v1/auth/user");
  return { user: response.data };
}