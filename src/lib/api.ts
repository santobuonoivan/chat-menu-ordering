// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "",
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_TIMEOUT || "30000"),
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Authorization": process.env.NEXT_PUBLIC_API_KEY || "",
  },
};

const API_CONFIG_CORE = {
  BASE_URL: process.env.NEXT_PUBLIC_URL_CORE_API,
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_TIMEOUT || "30000"),
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "HTTP-X-API-KEY": process.env.NEXT_PUBLIC_CORE_API_KEY || "",
  },
};

const WEBHOOK_CONFIG = {
  URL: process.env.NEXT_PUBLIC_WEBHOOK_URL,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};
const DELIVERY_API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_URL_API_BACKEND,
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_DUCK_API_TIMEOUT || "10000"),
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Authorization": process.env.NEXT_PUBLIC_KEY_API_BACKEND || "",
  },
};

const DUCK_API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_DUCK_API_URL,
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_DUCK_API_TIMEOUT || "10000"),
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
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
  options: ApiRequestOptions = {},
  host: string = API_CONFIG.BASE_URL
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    headers = {},
    body,
    timeout = API_CONFIG.TIMEOUT,
  } = options;

  const url = `${host}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  };

  console.log("API Request Details:", {
    url,
    method,
    headers: requestHeaders,
  });

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
    console.error("API Call Error:", {
      url,
      method,
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      errorType: error.type,
    });

    if (error.name === "AbortError") {
      return {
        success: false,
        error: "Request timeout",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to fetch",
    };
  }
}

export const deliveryApi = {
  get: <T = any>(
    endpoint: string,
    options: ApiRequestOptions = {},
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    return apiCall<T>(
      endpoint,
      { ...options, method: "GET", headers: DELIVERY_API_CONFIG.HEADERS },
      DELIVERY_API_CONFIG.BASE_URL
    );
  },
  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    return apiCall<T>(
      endpoint,
      { method: "POST", body: data, headers: DELIVERY_API_CONFIG.HEADERS },
      DELIVERY_API_CONFIG.BASE_URL
    );
  },
};

export const duckApi = {
  get: <T = any>(
    endpoint: string,
    options: ApiRequestOptions = {},
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    return apiCall<T>(
      endpoint,
      { ...options, method: "GET", headers: DUCK_API_CONFIG.HEADERS },
      DUCK_API_CONFIG.BASE_URL
    );
  },
  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    return apiCall<T>(
      endpoint,
      { method: "POST", body: data, headers: DUCK_API_CONFIG.HEADERS },
      DUCK_API_CONFIG.BASE_URL
    );
  },
  put: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    return apiCall<T>(
      endpoint,
      { method: "PUT", body: data, headers: DUCK_API_CONFIG.HEADERS },
      DUCK_API_CONFIG.BASE_URL
    );
  },
  delete: <T = any>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    return apiCall<T>(
      endpoint,
      { method: "DELETE", headers: DUCK_API_CONFIG.HEADERS },
      DUCK_API_CONFIG.BASE_URL
    );
  },
  patch: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    return apiCall<T>(
      endpoint,
      { method: "PATCH", body: data, headers: DUCK_API_CONFIG.HEADERS },
      DUCK_API_CONFIG.BASE_URL
    );
  },
};

export const agentAIApi = {
  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) =>
    apiCall<T>(
      endpoint,
      { method: "POST", body: data, headers: WEBHOOK_CONFIG.HEADERS },
      WEBHOOK_CONFIG.URL
    ),
};
// Specific API functions examples

export const api = {
  // GET request example
  get: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    apiCall<T>(endpoint, { method: "GET", headers: API_CONFIG.HEADERS }),

  // POST request example
  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) =>
    apiCall<T>(endpoint, {
      method: "POST",
      body: data,
      headers: API_CONFIG.HEADERS,
    }),

  // PUT request example
  put: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) =>
    apiCall<T>(endpoint, {
      method: "PUT",
      body: data,
      headers: API_CONFIG.HEADERS,
    }),

  // DELETE request example
  delete: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    apiCall<T>(endpoint, { method: "DELETE", headers: API_CONFIG.HEADERS }),
  // PATCH request example
  patch: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) =>
    apiCall<T>(endpoint, {
      method: "PATCH",
      body: data,
      headers: API_CONFIG.HEADERS,
    }),
};

export const coreApi = {
  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    console.log("Core API Config:", {
      BASE_URL: API_CONFIG_CORE.BASE_URL,
      HEADERS: API_CONFIG_CORE.HEADERS,
    });

    return apiCall<T>(
      endpoint,
      { method: "POST", body: data, headers: API_CONFIG_CORE.HEADERS },
      API_CONFIG_CORE.BASE_URL
    );
  },
};
