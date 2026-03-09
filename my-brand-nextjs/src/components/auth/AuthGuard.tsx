"use client";

import React from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loading from "@/components/atoms/Loading/Loading";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Authentication Guard Component
 * Protects routes by checking authentication status
 * Simplified for single-user website (no role checking needed)
 */
export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isLoading, isAuthenticated, user } = useAuthGuard();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-black to-primary">
        {fallback || <Loading />}
      </div>
    );
  }

  // If not authenticated, useAuthGuard will redirect
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-black to-primary">
        {fallback || <Loading />}
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}
