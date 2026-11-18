"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest, login as apiLogin, logout as apiLogout, getUser as apiGetUser } from "@/lib/api-client";

export interface User {
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
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
  hasPermission: (...permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await apiGetUser();
      setUser(response.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, remember = false) => {
    const response = await apiLogin(email, password, remember);
    setUser(response.user);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const hasRole = (...roles: string[]): boolean => {
    return user?.role ? roles.includes(user.role.name) : false;
  };

  const hasPermission = (...permissions: string[]): boolean => {
    if (!user?.role?.permissions) return false;
    return permissions.some((p) => user.role!.permissions.includes(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}