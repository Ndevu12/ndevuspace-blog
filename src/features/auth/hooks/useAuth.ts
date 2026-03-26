import { useCallback } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { authActionsService } from "../services/authActionsService";
import type { LoginCredentials, User } from "@/types/auth";

const AUTH_ACTION_TIMEOUT_MS = 12000;

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isPending = useAuthStore((s) => s.isPending);

  const setUser = useAuthStore((s) => s.setUser);
  const setIsLoading = useAuthStore((s) => s.setIsLoading);
  const setIsPending = useAuthStore((s) => s.setIsPending);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    if (useAuthStore.getState().isPending) {
      throw new Error("Please wait for the current auth action to finish.");
    }
    setIsPending(true);
    try {
      const response = await withTimeout(
        authActionsService.login(credentials),
        AUTH_ACTION_TIMEOUT_MS,
        "Login took too long. Please try again."
      );
      setUser(response.user);
      setIsLoading(false);
      return response.user;
    } finally {
      setIsPending(false);
    }
  }, [setIsLoading, setIsPending, setUser]);

  const logout = useCallback(async () => {
    if (useAuthStore.getState().isPending) {
      return;
    }
    setIsPending(true);
    try {
      await withTimeout(
        authActionsService.logout(),
        AUTH_ACTION_TIMEOUT_MS,
        "Logout took too long. Please try again."
      );
      setUser(null);
      setIsLoading(false);
    } finally {
      setIsPending(false);
    }
  }, [setIsLoading, setIsPending, setUser]);

  const refreshUser = useCallback(async () => {
    if (useAuthStore.getState().isPending) {
      return;
    }
    setIsPending(true);
    try {
      const currentUser = await withTimeout(
        authActionsService.refreshUser(),
        AUTH_ACTION_TIMEOUT_MS,
        "Refreshing your session took too long."
      );
      setUser(currentUser);
      setIsLoading(false);
    } finally {
      setIsPending(false);
    }
  }, [setIsLoading, setIsPending, setUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isPending,
    login,
    logout,
    refreshUser,
  };
}

