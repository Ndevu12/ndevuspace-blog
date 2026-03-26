import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getRequiredSupabaseFunctionEnv } from "./env";

let adminClient: SupabaseClient | undefined;

/**
 * Returns a singleton service-role client for Supabase Edge Functions.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (!adminClient) {
    const env = getRequiredSupabaseFunctionEnv();

    adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
