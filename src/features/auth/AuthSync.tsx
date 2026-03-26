"use client";

import { useAuthSync } from "@/features/auth/hooks/useAuthSync";

export function AuthSync() {
  useAuthSync();
  return null;
}

