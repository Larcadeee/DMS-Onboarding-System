"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";

import { logout as apiLogout } from "@/lib/auth-client";
import type { AuthUser } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser;
  roleName: string | null;
  roleLabel: string | null;
  hasPermission: (...permissions: string[]) => boolean;
  hasRole: (...roles: string[]) => boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  const router = useRouter();

  const logout = useCallback(async () => {
    await apiLogout();
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(() => {
    const isSuperAdmin = user.role?.name === "super_admin";
    const granted = new Set(user.permissions ?? []);

    return {
      user,
      roleName: user.role?.name ?? null,
      roleLabel: user.role?.label ?? null,
      hasPermission: (...permissions: string[]) =>
        isSuperAdmin || permissions.every((permission) => granted.has(permission)),
      hasRole: (...roles: string[]) =>
        user.role !== null && roles.includes(user.role.name),
      logout,
    };
  }, [user, logout]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
