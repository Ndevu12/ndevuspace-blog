// API Response utility helper for consistent server response handling

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T | null;
  code?: string;
}

export interface ApiResult<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  code?: string;
}

/**
 * Extract data from API response gracefully
 * @param response - The server response
 * @returns ApiResult with success flag, data, and error message
 */
export function extractApiResponse<T = any>(response: ApiResponse<T>): ApiResult<T> {
  // Check if response is successful (status 200-299)
  const isSuccess = response.status >= 200 && response.status < 300;
  
  if (isSuccess && response.data !== null) {
    return {
      success: true,
      data: response.data,
      error: null,
      code: response.code
    };
  }
  
  // Handle error cases
  return {
    success: false,
    data: null,
    error: response.message || 'An unknown error occurred',
    code: response.code
  };
}

/**
 * Safe fetch wrapper that handles both network errors and API errors
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns ApiResult with extracted data or error
 */
export async function safeFetch<T = any>(
  url: string, 
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const fetchOptions = {
      ...options,
      signal: controller.signal,
    };
    
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    // Check if response is ok (status 200-299)
    if (!response.ok) {
      // Try to parse error response
      try {
        const errorResponse: ApiResponse = await response.json();
        return extractApiResponse(errorResponse);
      } catch {
        // If JSON parsing fails, return generic error
        return {
          success: false,
          data: null,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    }
    
    // Parse successful response
    const apiResponse: ApiResponse<T> = await response.json();
    return extractApiResponse(apiResponse);
    
  } catch (error) {
    // Handle network errors, JSON parsing errors, etc.
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        data: null,
        error: 'Request timeout - please check your connection',
      };
    }
    
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}
