"use client";

import { use } from "react";
import { AuthContext } from "@/features/auth/AuthContext";

/**
 * Hook to access auth state and actions.
 * Uses React 19's `use()` instead of `useContext()` for context consumption.
 */
export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
