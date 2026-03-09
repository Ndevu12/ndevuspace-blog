// Static lookup for NEXT_PUBLIC_* vars — Next.js only inlines process.env.NEXT_PUBLIC_X
// with literal dot-notation access. Dynamic process.env[key] returns undefined on the client.
// This object uses static access so values are correctly inlined at compile time.
const CLIENT_ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_USE_DUMMY_DATA: process.env.NEXT_PUBLIC_USE_DUMMY_DATA,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

export const getEnv = (key: string, defaultValue: string = ""): string => {
  const value = CLIENT_ENV[key] ?? process.env[key];
  if (value === undefined) {
    console.warn(`Environment variable ${key} is not set. Using default value: "${defaultValue}"`);
    return defaultValue;
  }
  return value;
};

// Base URL for API calls, can be overridden by environment variable
export const API_BASE_URL = getEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:4000/");

// Flag to determine whether to use dummy data, can be overridden by environment variable
export const IS_USE_DUMMY_DATA_ENABLED = getEnv("NEXT_PUBLIC_USE_DUMMY_DATA", "false").toLowerCase() === "true";

// Site URL for SEO and sitemap generation, can be overridden by environment variable
export const SITE_URL = getEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");