import { isSupabaseAuthEnabled } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { authService } from "./authService";
import type { User } from "@/types/auth";

const AUTH_SYNC_TIMEOUT_MS = 10000;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Auth sync timed out"));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export type AuthSyncHandlers = {
  onUser: (user: User | null) => void;
  onLoadingChange?: (isLoading: boolean) => void;
};

export type AuthSyncSubscription = {
  unsubscribe: () => void;
};

/**
 * Resolve the initial user and keep auth state synced with Supabase session events.
 *
 * Intended usage: call once from a top-level client initializer (e.g. `useEffect`),
 * and pipe updates into a store (zustand) or component state.
 */
export const startAuthSync = ({
  onUser,
  onLoadingChange,
}: AuthSyncHandlers): AuthSyncSubscription => {
  onLoadingChange?.(true);

  if (!isSupabaseAuthEnabled()) {
    onUser(null);
    onLoadingChange?.(false);
    return { unsubscribe: () => {} };
  }

  let cancelled = false;
  let requestSeq = 0;
  let unsubscribe = () => {
    cancelled = true;
    onLoadingChange?.(false);
  };

  try {
    const supabase = createClient();

    const resolveUserFromSession = async (hasSessionUser: boolean) => {
      const seq = ++requestSeq;

      if (!hasSessionUser) {
        if (!cancelled && seq === requestSeq) {
          onUser(null);
          onLoadingChange?.(false);
        }
        return;
      }

      onLoadingChange?.(true);
      try {
        const currentUser = await withTimeout(
          authService.getCurrentUser(),
          AUTH_SYNC_TIMEOUT_MS
        );
        if (!cancelled && seq === requestSeq) {
          onUser(currentUser);
        }
      } catch {
        if (!cancelled && seq === requestSeq) {
          onUser(null);
        }
      } finally {
        if (!cancelled && seq === requestSeq) {
          onLoadingChange?.(false);
        }
      }
    };

    void (async () => {
      try {
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_SYNC_TIMEOUT_MS
        );
        await resolveUserFromSession(Boolean(data.session?.user));
      } catch {
        if (!cancelled) {
          onUser(null);
          onLoadingChange?.(false);
        }
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) {
        return;
      }

      void resolveUserFromSession(Boolean(session?.user));
    });

    unsubscribe = () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  } catch (error) {
    console.error("Error creating Supabase client", error);
    onUser(null);
    onLoadingChange?.(false);
  }

  return { unsubscribe };
};

