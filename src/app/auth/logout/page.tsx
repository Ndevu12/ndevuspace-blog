"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
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
    return () => { cancelled = true; };
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
