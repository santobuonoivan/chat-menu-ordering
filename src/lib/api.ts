// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_TIMEOUT || "30000"),
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Authorization": process.env.NEXT_PUBLIC_API_KEY || "",
  },
};

// API Request Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// Generic API Call Function
export async function apiCall<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    headers = {},
    body,
    timeout = API_CONFIG.TIMEOUT,
  } = options;

  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    ...API_CONFIG.HEADERS,
    ...headers,
  };

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== "GET") {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If response is not JSON, use text
      data = await response.text();
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          data?.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    if (error.name === "AbortError") {
      return {
        success: false,
        error: "Request timeout",
      };
    }

    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

// Specific API functions examples
export const api = {
  // GET request example
  get: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    apiCall<T>(endpoint, { method: "GET", headers }),

  // POST request example
  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) => apiCall<T>(endpoint, { method: "POST", body: data, headers }),

  // PUT request example
  put: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) => apiCall<T>(endpoint, { method: "PUT", body: data, headers }),

  // DELETE request example
  delete: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    apiCall<T>(endpoint, { method: "DELETE", headers }),

  // PATCH request example
  patch: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) => apiCall<T>(endpoint, { method: "PATCH", body: data, headers }),
};
