/**
 * Shared domain types for authentication and RBAC.
 */

export interface RoleInfo {
  id: number;
  name: string;
  label: string;
  permissions: string[];
}

export interface DepartmentInfo {
  id: number;
  name: string;
  code: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  employee_number: string | null;
  is_active: boolean;
  last_login_at: string | null;
  role: RoleInfo | null;
  department: DepartmentInfo | null;
  permissions: string[];
}

export type RoleName =
  | "super_admin"
  | "training_supervisor"
  | "trainer"
  | "trainee";
