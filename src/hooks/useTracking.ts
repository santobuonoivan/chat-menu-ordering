import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { eventTracker } from "@/services/eventTracker";
import { generateUUID } from "@/utils";
import { EventType, EventCategory } from "@/types/tracking";

export function useTracking() {
  const pathname = usePathname();

  // Inicializar tracker
  useEffect(() => {
    eventTracker.initialize();
    return () => {
      eventTracker.destroy();
    };
  }, []);

  // Track cambios de ruta
  useEffect(() => {
    if (pathname) {
      eventTracker.setRoute(pathname);
      trackPageView(pathname);
    }
  }, [pathname]);

  const trackPageView = useCallback((path: string) => {
    eventTracker.track({
      id: generateUUID(),
      type: "PAGE_VIEW",
      category: "navigation",
      data: {
        path,
        title: typeof document !== "undefined" ? document.title : "",
        params: {},
      },
    });
  }, []);

  const trackUserAction = useCallback(
    (
      action: string,
      target: string,
      value?: any,
      context?: Record<string, any>
    ) => {
      eventTracker.track({
        id: generateUUID(),
        type: "USER_ACTION",
        category: "interaction",
        data: {
          action,
          target,
          value,
          context,
        },
      });
    },
    []
  );

  const trackApiCall = useCallback(
    (
      endpoint: string,
      method: string,
      options: {
        status?: number;
        duration?: number;
        success: boolean;
        error?: string;
        requestPayload?: any;
        responseData?: any;
      }
    ) => {
      eventTracker.track({
        id: generateUUID(),
        type: "API_CALL",
        category: "system",
        data: {
          endpoint,
          method,
          ...options,
        },
      });
    },
    []
  );

  const trackCartAction = useCallback(
    (
      action: "add" | "remove" | "update" | "clear",
      data?: {
        itemId?: string;
        itemName?: string;
        quantity?: number;
        price?: number;
        modifiers?: any[];
        cartTotal?: number;
        cartItemCount?: number;
      }
    ) => {
      eventTracker.track({
        id: generateUUID(),
        type: "CART_ACTION",
        category: "transaction",
        data: {
          action,
          ...data,
        },
      });
    },
    []
  );

  const trackChatMessage = useCallback(
    (
      sender: "user" | "assistant",
      messageId: string,
      messageLength: number,
      options?: {
        hasData?: boolean;
        dataType?: string;
        intent?: string;
      }
    ) => {
      eventTracker.track({
        id: generateUUID(),
        type: "CHAT_MESSAGE",
        category: "communication",
        data: {
          sender,
          messageId,
          messageLength,
          ...options,
        },
      });
    },
    []
  );

  const trackPaymentFlow = useCallback(
    (
      step: string,
      data?: {
        paymentMethod?: string;
        amount?: number;
        status?: "pending" | "success" | "failed";
        error?: string;
      }
    ) => {
      eventTracker.track({
        id: generateUUID(),
        type: "PAYMENT_FLOW",
        category: "transaction",
        data: {
          step,
          ...data,
        },
      });
    },
    []
  );

  const trackError = useCallback(
    (
      errorMessage: string,
      errorType: "runtime" | "api" | "user" | "network",
      options?: {
        errorStack?: string;
        componentStack?: string;
        severity?: "low" | "medium" | "high" | "critical";
        context?: Record<string, any>;
      }
    ) => {
      eventTracker.track({
        id: generateUUID(),
        type: "ERROR",
        category: "system",
        data: {
          errorMessage,
          errorType,
          errorStack: options?.errorStack,
          componentStack: options?.componentStack,
          userJourney: eventTracker.getUserJourney(),
          storeState: options?.context,
          severity: options?.severity || "medium",
        },
      });

      // Flush inmediato para errores high/critical
      if (options?.severity === "high" || options?.severity === "critical") {
        eventTracker.flush(true);
      }
    },
    []
  );

  const trackCustomEvent = useCallback(
    (type: EventType, category: EventCategory, data: any) => {
      eventTracker.track({
        id: generateUUID(),
        type,
        category,
        data,
      } as any);
    },
    []
  );

  return {
    trackPageView,
    trackUserAction,
    trackApiCall,
    trackCartAction,
    trackChatMessage,
    trackPaymentFlow,
    trackError,
    trackCustomEvent,
  };
}
