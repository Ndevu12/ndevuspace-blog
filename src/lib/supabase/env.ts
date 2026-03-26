import { readRequiredClientEnv, type EnvSource } from "@/lib/env";

export type SupabaseEnvConfig = {
  url: string;
  anonKey: string;
};

export const getSupabaseEnvConfig = (): SupabaseEnvConfig => {
  const clientEnv: EnvSource = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  const serverEnv: EnvSource = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  return {
    url: readRequiredClientEnv("NEXT_PUBLIC_SUPABASE_URL", clientEnv),
    anonKey: readRequiredClientEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", clientEnv),
  };
};

export const ensureSupabaseEnvConfig = (): void => {
  getSupabaseEnvConfig();
};
