// API Response utility — ported from my-brand-nextjs/utils/apiResponse.ts
// Centralized fetch wrapper with error handling, timeout, and typed responses

// ─── Response Types ───

export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T | null;
  code?: string;
}

export interface ApiResult<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  code?: string;
}

// ─── Response Extractors ───

/**
 * Extract data from API response gracefully
 */
export function extractApiResponse<T = unknown>(
  response: ApiResponse<T>
): ApiResult<T> {
  const isSuccess = response.status >= 200 && response.status < 300;

  if (isSuccess && response.data !== null) {
    return {
      success: true,
      data: response.data,
      error: null,
      code: response.code,
    };
  }

  return {
    success: false,
    data: null,
    error: response.message || "An unknown error occurred",
    code: response.code,
  };
}

// ─── Safe Fetch ───

const DEFAULT_TIMEOUT = 15_000; // 15 seconds (increased from 5s for Render cold starts)

/**
 * Safe fetch wrapper that handles network errors, timeouts, and API error responses.
 * All API calls in the app should use this instead of raw `fetch()`.
 *
 * Error logging is centralized here — callers do NOT need to console.error on failure.
 * They only need to check `result.success` and handle the UI response.
 */
export async function safeFetch<T = unknown>(
  url: string,
  options?: RequestInit & { timeout?: number }
): Promise<ApiResult<T>> {
  const method = options?.method ?? "GET";

  try {
    const controller = new AbortController();
    const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const fetchOptions: RequestInit = {
      ...options,
      signal: controller.signal,
    };

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      let result: ApiResult<T>;
      try {
        const errorResponse = await response.json() as ApiResponse<T>;
        result = extractApiResponse<T>(errorResponse);
      } catch {
        result = {
          success: false,
          data: null,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      console.error(`[API] ${method} ${url} failed:`, result.error);
      return result;
    }

    const apiResponse: ApiResponse<T> = await response.json();
    return extractApiResponse(apiResponse);
  } catch (error) {
    let result: ApiResult<T>;

    if (error instanceof Error && error.name === "AbortError") {
      result = {
        success: false,
        data: null,
        error: "Request timeout — please check your connection",
      };
    } else {
      result = {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "Network error occurred",
      };
    }

    console.error(`[API] ${method} ${url} failed:`, result.error);
    return result;
  }
}
