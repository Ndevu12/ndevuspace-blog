"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
}

/**
 * Wraps protected routes — redirects to login if unauthenticated
 */
export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const normalizedUserRole = (user?.role ?? "user").trim().toLowerCase();
  const normalizedRequiredRole = requiredRole?.trim().toLowerCase();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const loginUrl = pathname ? `/auth/login?next=${encodeURIComponent(pathname)}` : "/auth/login";
      router.replace(loginUrl);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !normalizedRequiredRole) {
      return;
    }

    if (normalizedUserRole !== normalizedRequiredRole) {
      router.replace("/blog?accessDenied=1");
    }
  }, [isAuthenticated, isLoading, normalizedRequiredRole, normalizedUserRole, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (normalizedRequiredRole && normalizedUserRole !== normalizedRequiredRole)) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
