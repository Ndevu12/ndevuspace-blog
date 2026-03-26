import type { PostgrestError } from "https://esm.sh/@supabase/supabase-js@2";

export type SupabaseErrorCode =
  | "SUPABASE_ERROR"
  | "UNEXPECTED_SUPABASE_ERROR"
  | "UNKNOWN_ERROR";

export type NormalizedSupabaseError = {
  code: SupabaseErrorCode;
  message: string;
  details?: string;
  hint?: string;
  status?: number;
};

/**
 * Normalizes unknown errors into a stable Supabase-function-safe shape.
 */
export function normalizeSupabaseError(error: unknown): NormalizedSupabaseError {
  if (isSupabaseError(error)) {
    return {
      code: "SUPABASE_ERROR",
      message: error.message ?? "Supabase query failed",
      details: readOptionalString(error.details),
      hint: readOptionalString(error.hint),
      status: readOptionalNumber(error.status),
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNEXPECTED_SUPABASE_ERROR",
      message: error.message,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unknown error occurred",
  };
}

function isSupabaseError(error: unknown): error is PostgrestError & { status?: number } {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as Record<string, unknown>;

  return (
    typeof candidate.message === "string" &&
    typeof candidate.code === "string" &&
    ("details" in candidate || "hint" in candidate)
  );
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
