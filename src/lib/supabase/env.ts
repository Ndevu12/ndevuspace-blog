import { readClientEnv, readRequiredClientEnv } from "@/lib/env";

export type SupabaseEnvConfig = {
  url: string;
  anonKey: string;
};

export const getSupabaseEnvConfig = (): SupabaseEnvConfig => {
  return {
    url: readRequiredClientEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: readRequiredClientEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
};

export const hasSupabaseEnvConfig = (): boolean => {
  return Boolean(
    readClientEnv("NEXT_PUBLIC_SUPABASE_URL") && readClientEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
};

export const ensureSupabaseEnvConfig = (): void => {
  getSupabaseEnvConfig();
};
