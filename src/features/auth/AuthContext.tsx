"use client";

import {
  createContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { authService } from "@/services/authService";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnvConfig } from "@/lib/supabase/env";
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

  // Resolve initial user and keep auth state synced with Supabase session events.
  useEffect(() => {
    if (!hasSupabaseEnvConfig()) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "Supabase auth is disabled: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
      }
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
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

    void checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;

      if (!session?.user) {
        setUser(null);
        return;
      }

      const currentUser = await authService.getCurrentUser();
      if (!cancelled) setUser(currentUser);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
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
