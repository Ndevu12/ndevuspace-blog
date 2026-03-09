"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Typography from "@/components/atoms/Typography/Typography";

export default function LogoutPage() {
  const router = useRouter();
  const { logout, isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();

        // Redirect to login with a delay for UX
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } catch (error) {
        console.error("Logout error:", error);
        // Redirect even if logout fails
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    };

    if (isAuthenticated) {
      handleLogout();
    } else {
      // Already logged out, redirect
      router.push("/auth/login");
    }
  }, [isAuthenticated, logout, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-black to-primary">
      <div className="text-center">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        </div>

        <Typography variant="h3" className="text-white mb-4">
          Signing Out
        </Typography>

        {user && (
          <Typography variant="p" className="text-gray-300 mb-2">
            Goodbye, {user.firstName}!
          </Typography>
        )}

        <Typography variant="small" className="text-gray-400">
          You&apos;ll be redirected to the login page shortly...
        </Typography>
      </div>
    </div>
  );
}
