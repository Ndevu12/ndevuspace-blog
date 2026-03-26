import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnvConfig } from "@/lib/supabase/env";

export const createClient = () => {
  const { url, anonKey } = getSupabaseEnvConfig();
  return createBrowserClient(url, anonKey);
};
