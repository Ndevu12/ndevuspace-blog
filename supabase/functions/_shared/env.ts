export type SupabaseFunctionEnvName = "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY";

export type SupabaseFunctionEnv = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

const ENV_ERROR_PREFIX = "[supabase/_shared/env]";
type DenoLikeGlobal = {
  env: {
    get(name: string): string | undefined;
  };
};

function getDenoEnvValue(name: string): string | undefined {
  const deno = (globalThis as { Deno?: DenoLikeGlobal }).Deno;

  if (!deno?.env?.get) {
    throw new Error(`${ENV_ERROR_PREFIX} Deno env API is unavailable in this runtime.`);
  }

  return deno.env.get(name);
}

/**
 * Reads a required Supabase Edge Function environment variable.
 */
export function readRequiredFunctionEnv(name: SupabaseFunctionEnvName): string {
  const value = getDenoEnvValue(name)?.trim();

  if (!value) {
    throw new Error(`${ENV_ERROR_PREFIX} Missing required env var: ${name}`);
  }

  return value;
}

/**
 * Returns required Supabase environment values for privileged function operations.
 */
export function getRequiredSupabaseFunctionEnv(): SupabaseFunctionEnv {
  return {
    SUPABASE_URL: readRequiredFunctionEnv("SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: readRequiredFunctionEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}
