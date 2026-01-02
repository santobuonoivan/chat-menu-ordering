import { eventTracker } from "@/services/eventTracker";
import { generateUUID } from "@/utils";

/**
 * Wrapper para fetch que automáticamente trackea las llamadas API
 */
export async function trackedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const startTime = performance.now();
  const method = options?.method || "GET";

  let response: Response | undefined;
  let success = false;
  let error: string | undefined;

  try {
    response = await fetch(url, options);
    success = response.ok;

    if (!response.ok) {
      error = `${response.status} ${response.statusText}`;
    }

    return response;
  } catch (e: any) {
    error = e.message || "Network error";
    throw e;
  } finally {
    const duration = performance.now() - startTime;

    // Track API call
    eventTracker.track({
      id: generateUUID(),
      type: "API_CALL",
      category: "system",
      data: {
        endpoint: url,
        method,
        status: response?.status,
        duration: Math.round(duration),
        success,
        error,
      },
    });
  }
}

/**
 * Helper para trackear errores de API con contexto
 */
export function trackApiError(
  endpoint: string,
  method: string,
  error: any,
  context?: Record<string, any>
) {
  eventTracker.track({
    id: generateUUID(),
    type: "ERROR",
    category: "system",
    data: {
      errorMessage: error.message || "API Error",
      errorStack: error.stack,
      errorType: "api",
      userJourney: eventTracker.getUserJourney(),
      storeState: context,
      severity: "high",
    },
  });
}
