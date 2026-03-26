import { useEffect } from "react";
import { startAuthSync } from "../services/authSyncService";
import { useAuthStore } from "@/features/auth/store/authStore";

export function useAuthSync() {
  const setUser = useAuthStore((s) => s.setUser);
  const setIsLoading = useAuthStore((s) => s.setIsLoading);

  useEffect(() => {
    const subscription = startAuthSync({
      onUser: setUser,
      onLoadingChange: setIsLoading,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setIsLoading, setUser]);
}

