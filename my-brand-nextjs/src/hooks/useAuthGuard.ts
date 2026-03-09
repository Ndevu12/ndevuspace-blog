import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface UseAuthGuardOptions {
  redirectTo?: string;
  onUnauthorized?: () => void;
}

interface UseAuthGuardReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any;
}

interface UseGuestGuardReturn {
  isLoading: boolean;
  isGuest: boolean;
}

/**
 * Authentication guard hook - simplified for single user website
 * Redirects unauthorized users and provides loading state
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}): UseAuthGuardReturn {
  const { redirectTo = '/auth/login', onUnauthorized } = options;
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    // Wait for auth to initialize
    if (auth.isLoading) return;
    
    // Check if user is authenticated
    if (!auth.isAuthenticated || !auth.user) {
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        router.push(redirectTo);
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, redirectTo, onUnauthorized, router]);

  return {
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
  };
}

/**
 * Guest guard hook - redirects authenticated users (for login pages)
 */
export function useGuestGuard(redirectTo = '/dashboard'): UseGuestGuardReturn {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    // Wait for auth to initialize
    if (auth.isLoading) return;
    
    if (auth.isAuthenticated && auth.user) {
      router.push(redirectTo);
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, redirectTo, router]);

  return {
    isLoading: auth.isLoading,
    isGuest: !auth.isAuthenticated,
  };
}

/**
 * Permission checking utilities for different user roles
 */
export const permissions = {
  canCreateBlog: (user: any) => user && user._id,
  canEditBlog: (user: any) => user && user._id,
  canDeleteBlog: (user: any) => user && user._id,
  canManageUsers: (user: any) => user && user._id,
  canViewDashboard: (user: any) => user && user._id,
} as const;

/**
 * Hook for admin access - simplified for single-user system
 */
export function useAdminGuard() {
  return useAuthGuard({
    redirectTo: '/auth/login',
  });
}

export default useAuthGuard;
