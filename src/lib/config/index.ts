import { getClientEnv, readServerEnv } from "@/lib/env";
type AppEnv = "development" | "test" | "production";

export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

export type ClientPublicConfig = {
  siteUrl: string;
  useDummyData: boolean;
  supabase: SupabasePublicConfig | null;
};

export type ServerConfig = {
  env: AppEnv;
  databaseUrl: string | null;
  supabase: SupabasePublicConfig | null;
};

const APP_ENV: AppEnv = process.env.NODE_ENV === "production"
  ? "production"
  : process.env.NODE_ENV === "test"
    ? "test"
    : "development";

const formatMissingEnvMessage = (keys: string[]): string => {
  return `Missing required environment variable${keys.length > 1 ? "s" : ""}: ${keys.join(", ")}`;
};

const CLIENT_ENV = getClientEnv();
const DATABASE_URL = readServerEnv("DATABASE_URL");

let hasWarnedAboutMissingSupabasePublicConfig = false;
let hasWarnedAboutInvalidSupabasePublicConfig = false;

const missingSupabasePublicKeys = (): string[] => {
  const missing: string[] = [];
  if (!CLIENT_ENV.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!CLIENT_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return missing;
};

const getInvalidSupabasePublicConfigReason = (): string | null => {
  if (!CLIENT_ENV.NEXT_PUBLIC_SUPABASE_URL || !CLIENT_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(CLIENT_ENV.NEXT_PUBLIC_SUPABASE_URL);
  } catch {
    return "NEXT_PUBLIC_SUPABASE_URL must be a valid URL.";
  }

  return null;
};

const warnMissingSupabaseConfigOnce = (missingKeys: string[]) => {
  if (APP_ENV !== "development" || hasWarnedAboutMissingSupabasePublicConfig || missingKeys.length === 0) {
    return;
  }
  hasWarnedAboutMissingSupabasePublicConfig = true;
  console.warn(`Supabase is disabled in development. ${formatMissingEnvMessage(missingKeys)}.`);
};

const warnInvalidSupabaseConfigOnce = (reason: string) => {
  if (APP_ENV !== "development" || hasWarnedAboutInvalidSupabasePublicConfig) {
    return;
  }
  hasWarnedAboutInvalidSupabasePublicConfig = true;
  console.warn(`Supabase is disabled in development. Invalid Supabase config: ${reason}`);
};

export const getSupabasePublicConfigOptional = (): SupabasePublicConfig | null => {
  const missingKeys = missingSupabasePublicKeys();
  if (missingKeys.length > 0) {
    warnMissingSupabaseConfigOnce(missingKeys);
    return null;
  }

  const invalidReason = getInvalidSupabasePublicConfigReason();
  if (invalidReason) {
    warnInvalidSupabaseConfigOnce(invalidReason);
    return null;
  }

  return {
    url: CLIENT_ENV.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: CLIENT_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
};

export const getSupabasePublicConfigRequired = (): SupabasePublicConfig => {
  const config = getSupabasePublicConfigOptional();
  if (config) {
    return config;
  }

  const missingMessage = formatMissingEnvMessage([
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);
  const invalidReason = getInvalidSupabasePublicConfigReason();
  const message = invalidReason
    ? `Invalid Supabase public config: ${invalidReason}`
    : missingMessage;
  if (APP_ENV === "production") {
    throw new Error(message);
  }

  throw new Error(`${message} (required when Supabase auth is enabled).`);
};

export const isSupabaseAuthEnabled = (): boolean => {
  return getSupabasePublicConfigOptional() !== null;
};

export const getClientPublicConfig = (): ClientPublicConfig => {
  return {
    siteUrl: CLIENT_ENV.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    useDummyData: (CLIENT_ENV.NEXT_PUBLIC_USE_DUMMY_DATA ?? "false").toLowerCase() === "true",
    supabase: getSupabasePublicConfigOptional(),
  };
};

export const getServerConfig = (): ServerConfig => {
  return {
    env: APP_ENV,
    databaseUrl: DATABASE_URL ?? null,
    supabase: getSupabasePublicConfigOptional(),
  };
};
