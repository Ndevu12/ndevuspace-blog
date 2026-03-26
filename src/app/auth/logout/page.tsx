"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const LOGOUT_REDIRECT_TIMEOUT_MS = 12000;

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        toast.error("Logout is taking too long. Redirecting...");
        router.replace("/blog");
      }
    }, LOGOUT_REDIRECT_TIMEOUT_MS);

    async function performLogout() {
      try {
        await logout();
        if (!cancelled) {
          toast.success("Logged out successfully");
          router.replace("/blog");
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to logout");
          router.replace("/blog");
        }
      }
    }
    performLogout();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [logout, router]);

  return (
    <main className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Logging out...</p>
      </div>
    </main>
  );
}
