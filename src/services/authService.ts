// Auth service — ported from my-brand-nextjs/src/services/authService.ts

import { API_BASE_URL } from "@/lib/constants";
import { safeFetch } from "@/lib/api";
import type { LoginCredentials, AuthResponse, User } from "@/types/auth";

// ─── Error Handling ───

function getAuthErrorMessage(error: string | null, code?: string): string {
  switch (code) {
    case "INVALID_CREDENTIALS":
      return "Invalid username or password";
    case "USER_NOT_FOUND":
      return "User not found";
    case "USER_ALREADY_EXISTS":
      return "User with this email already exists";
    case "VALIDATION_ERROR":
      return "Please check your input and try again";
    case "UNAUTHORIZED":
      return "You are not authorized to perform this action";
    default:
      return error || "Authentication failed";
  }
}

// ─── Auth Service ───

class AuthService {
  /** Login user with credentials */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const result = await safeFetch<AuthResponse>(
      `${API_BASE_URL}/auth/login`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      }
    );

    if (!result.success) {
      throw new Error(getAuthErrorMessage(result.error, result.code));
    }

    return result.data as AuthResponse;
  }

  /** Logout current user */
  async logout(): Promise<void> {
    const result = await safeFetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!result.success) {
      throw new Error(getAuthErrorMessage(result.error, result.code));
    }
  }

  /** Get current user (check if authenticated) */
  async getCurrentUser(): Promise<User | null> {
    const result = await safeFetch<User>(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!result.success) {
      // Not authenticated — return null without throwing
      return null;
    }

    return result.data;
  }
}

export const authService = new AuthService();
