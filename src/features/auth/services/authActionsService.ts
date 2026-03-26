import { authService } from "./authService";
import type { AuthResponse, LoginCredentials, User } from "@/types/auth";

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  return await authService.login(credentials);
}

export async function logout(): Promise<void> {
  return await authService.logout();
}

export async function getCurrentUser(): Promise<User | null> {
  return await authService.getCurrentUser();
}

export async function refreshUser(): Promise<User | null> {
  return await authService.getCurrentUser();
}

export const authActionsService = {
  login,
  logout,
  getCurrentUser,
  refreshUser,
};

