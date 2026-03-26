import type { SupabaseClient } from "@supabase/supabase-js";

type RoleRow = {
  role: string;
};

export async function getUserRoleById(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle<RoleRow>();

  return data?.role ?? null;
}

