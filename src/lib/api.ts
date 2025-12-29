// API Configuration
// IMPORTANTE: Las configuraciones se crean como funciones para leer env vars en runtime
const getApiConfig = () => ({
  BASE_URL: process.env.BACKEND_URL || "",
  TIMEOUT: parseInt(process.env.TIMEOUT || "30000"),
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Authorization": process.env.API_KEY || "",
  },
});

const getApiConfigCore = () => ({
  BASE_URL: process.env.URL_CORE_API || "",
  TIMEOUT: parseInt(process.env.TIMEOUT || "30000"),
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "HTTP-X-API-KEY": process.env.CORE_API_KEY || "",
  },
});

const getWebhookConfig = () => ({
  URL: process.env.WEBHOOK_URL || "",
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const getDeliveryApiConfig = () => ({
  BASE_URL: process.env.URL_API_BACKEND || "",
  TIMEOUT: parseInt(process.env.DUCK_API_TIMEOUT || "10000"),
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Authorization": process.env.KEY_API_BACKEND || "",
  },
});

const getDuckApiConfig = () => ({
  BASE_URL: process.env.DUCK_API_URL || "",
  TIMEOUT: parseInt(process.env.DUCK_API_TIMEOUT || "10000"),
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

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
  timeout?: number | string;
}

// Generic API Call Function
export async function apiCall<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {},
  host?: string
): Promise<ApiResponse<T>> {
  const config = getApiConfig();
  const {
    method = "GET",
    headers = {},
    body,
    timeout = config.TIMEOUT,
  } = options;
  const baseHost = host || config.BASE_URL;

  const url = `${baseHost}${endpoint}`;

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
    const timeoutId = setTimeout(() => controller.abort(), Number(timeout));

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
    const config = getDeliveryApiConfig();
    return apiCall<T>(
      endpoint,
      {
        ...options,
        method: "GET",
        headers: config.HEADERS as any,
      },
      config.BASE_URL
    );
  },
  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    const config = getDeliveryApiConfig();
    return apiCall<T>(
      endpoint,
      {
        method: "POST",
        body: data,
        headers: { ...config.HEADERS, ...headers } as any,
      },
      config.BASE_URL
    );
  },
};

export const duckApi = {
  get: <T = any>(
    endpoint: string,
    options: ApiRequestOptions = {},
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    const config = getDuckApiConfig();
    return apiCall<T>(
      endpoint,
      { ...options, method: "GET", headers: config.HEADERS },
      config.BASE_URL
    );
  },
  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    const config = getDuckApiConfig();
    return apiCall<T>(
      endpoint,
      { method: "POST", body: data, headers: config.HEADERS },
      config.BASE_URL
    );
  },
  put: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    const config = getDuckApiConfig();
    return apiCall<T>(
      endpoint,
      { method: "PUT", body: data, headers: config.HEADERS },
      config.BASE_URL
    );
  },
  delete: <T = any>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    const config = getDuckApiConfig();
    return apiCall<T>(
      endpoint,
      { method: "DELETE", headers: config.HEADERS },
      config.BASE_URL
    );
  },
  patch: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    const config = getDuckApiConfig();
    return apiCall<T>(
      endpoint,
      { method: "PATCH", body: data, headers: config.HEADERS },
      config.BASE_URL
    );
  },
};

export const agentAIApi = {
  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) => {
    const config = getWebhookConfig();
    return apiCall<T>(
      endpoint,
      { method: "POST", body: data, headers: config.HEADERS },
      config.URL
    );
  },
};
// Specific API functions examples

export const standarApi = {
  // GET request example
  get: <T = any>(endpoint: string, headers?: Record<string, string>) => {
    const config = getApiConfig();
    return apiCall<T>(endpoint, {
      method: "GET",
      headers: config.HEADERS as any,
    });
  },

  // POST request example
  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) => {
    const config = getApiConfig();
    return apiCall<T>(endpoint, {
      method: "POST",
      body: data,
      headers: config.HEADERS as any,
    });
  },

  // PUT request example
  put: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) => {
    const config = getApiConfig();
    return apiCall<T>(endpoint, {
      method: "PUT",
      body: data,
      headers: config.HEADERS as any,
    });
  },

  // DELETE request example
  delete: <T = any>(endpoint: string, headers?: Record<string, string>) => {
    const config = getApiConfig();
    return apiCall<T>(endpoint, {
      method: "DELETE",
      headers: config.HEADERS as any,
    });
  },
  // PATCH request example
  patch: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) => {
    const config = getApiConfig();
    return apiCall<T>(endpoint, {
      method: "PATCH",
      body: data,
      headers: config.HEADERS as any,
    });
  },
};

export const coreApi = {
  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    const config = getApiConfigCore();
    console.log("Core API Config:", {
      BASE_URL: config.BASE_URL,
      HEADERS: config.HEADERS,
    });

    return apiCall<T>(
      endpoint,
      {
        method: "POST",
        body: data,
        headers: { ...config.HEADERS, ...headers } as any,
      },
      config.BASE_URL
    );
  },
};
