import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnvConfig } from "@/lib/supabase/env";

export const createClient = async () => {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnvConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Can be called from Server Components where writes are not allowed.
        }
      },
    },
  });
};
