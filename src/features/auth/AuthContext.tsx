"use client";

import {
  createContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { authService } from "@/services/authService";
import { IS_USE_DUMMY_DATA_ENABLED } from "@/lib/envConfig";
import type { AuthState, LoginCredentials, User } from "@/types/auth";

// ─── Context Type ───

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isPending: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ───

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const isAuthenticated = !!user;

  // Check auth state on mount (skip in dummy data mode — no real backend)
  useEffect(() => {
    if (IS_USE_DUMMY_DATA_ENABLED) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function checkAuth() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!cancelled) setUser(currentUser);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };

  const logout = async () => {
    startTransition(async () => {
      await authService.logout();
      setUser(null);
    });
  };

  const refreshUser = async () => {
    startTransition(async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    });
  };

  // Stable context value — functions are stable since they only use setUser/startTransition
  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    isPending,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
