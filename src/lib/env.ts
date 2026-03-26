export type EnvSource = Record<string, string | undefined>;
type ImportMetaWithEnv = ImportMeta & { env?: EnvSource };

const getDefaultClientEnvSource = (): EnvSource => {
  const importMetaEnv = (import.meta as ImportMetaWithEnv).env;
  if (importMetaEnv) {
    return importMetaEnv;
  }

  if (typeof process !== "undefined") {
    return process.env;
  }

  return {};
};

export const readServerEnv = (key: string, env: EnvSource = process.env): string | undefined => {
  return env[key];
};

export const readRequiredServerEnv = (key: string, env: EnvSource = process.env): string => {
  const value = readServerEnv(key, env);
  if (!value) {
    throw new Error(`Missing server environment variable: ${key}`);
  }
  return value;
};

export const readClientEnv = (key: string, env: EnvSource = getDefaultClientEnvSource()): string | undefined => {
  if (!key.startsWith("NEXT_PUBLIC_")) {
    throw new Error(`Client env key must start with NEXT_PUBLIC_: ${key}`);
  }
  return env[key];
};

export const readRequiredClientEnv = (key: string, env: EnvSource = getDefaultClientEnvSource()): string => {
  const value = readClientEnv(key, env);
  if (!value) {
    throw new Error(`Missing client environment variable: ${key}`);
  }
  return value;
};
