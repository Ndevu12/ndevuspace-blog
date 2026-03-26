export type EnvSource = Record<string, string | undefined>;

type ClientEnvKey =
  | "NEXT_PUBLIC_SITE_URL"
  | "NEXT_PUBLIC_USE_DUMMY_DATA"
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

export type ClientEnv = Record<ClientEnvKey, string | undefined>;

const normalizeEnv = (value: string | undefined): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

// Single server-side env accessor.
export const readServerEnv = (key: string): string | undefined => {
  const value = normalizeEnv(process.env[key]);
  return value;
};

export const readRequiredServerEnv = (key: string): string => {
  const value = readServerEnv(key);
  if (!value) {
    throw new Error(`Missing server environment variable: ${key}`);
  }
  return value;
};

// Single client env loader that serves all NEXT_PUBLIC_* values we support.
export const getClientEnv = (): ClientEnv => {
  const env = {
    NEXT_PUBLIC_SITE_URL: normalizeEnv(process.env.NEXT_PUBLIC_SITE_URL),
    NEXT_PUBLIC_USE_DUMMY_DATA: normalizeEnv(process.env.NEXT_PUBLIC_USE_DUMMY_DATA),
    NEXT_PUBLIC_SUPABASE_URL: normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
  return env;
};

export const readClientEnv = (key: ClientEnvKey): string | undefined => {
  return getClientEnv()[key];
};

export const readRequiredClientEnv = (key: ClientEnvKey): string => {
  const value = readClientEnv(key);
  if (!value) {
    throw new Error(`Missing client environment variable: ${key}`);
  }
  return value;
};

export const IS_USE_DUMMY_DATA_ENABLED = (readClientEnv("NEXT_PUBLIC_USE_DUMMY_DATA") ?? "false").toLowerCase() === "true";

export const SITE_URL = readClientEnv("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000";

export const readOptionalDatabaseUrl = (): string | undefined => {
  return readServerEnv("DATABASE_URL");
};