import { generateUUID } from "@/utils";
import {
  TrackingEvent,
  EventBatch,
  TrackingConfig,
  DeviceInfo,
  EventMetadata,
} from "@/types/tracking";
import { use } from "react";
import { useSessionStore } from "@/stores/sessionStore";

class EventTracker {
  private static instance: EventTracker;
  private config: TrackingConfig;
  private eventBuffer: TrackingEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId: string;
  private orderingSessionId: string = "";
  private userJourney: string[] = [];
  private currentRoute: string = "";
  private previousRoute: string = "";
  private isInitialized: boolean = false;

  private constructor() {
    this.config = {
      enabled: true,
      batchSize: 50,
      flushInterval: 30000, // 30 segundos
      maxRetries: 3,
      retryDelay: 2000,
      enableLocalStorage: true,
      debugMode: process.env.NODE_ENV === "development",
    };
    this.sessionId = this.getOrCreateSessionId();
  }

  static getInstance(): EventTracker {
    if (!EventTracker.instance) {
      EventTracker.instance = new EventTracker();
    }
    return EventTracker.instance;
  }

  initialize() {
    if (this.isInitialized || typeof window === "undefined") return;

    this.isInitialized = true;

    // Obtener orderingSessionId solo en el cliente
    const sessionData: any = useSessionStore.getState().sessionData;
    const orderingSessionId = sessionData ? sessionData.cart.session_id : "";
    if (orderingSessionId) {
      this.orderingSessionId = sessionData.cart.session_id;
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const restNumberParam = urlParams.get("phone");
      const clientNumberParam = urlParams.get("client_phone");
      this.orderingSessionId = `${clientNumberParam || ""}||${
        restNumberParam || ""
      }`;
    }

    this.startFlushTimer();
    this.setupBeforeUnload();
    this.recoverFailedEvents();

    // Track session start
    this.track({
      id: generateUUID(),
      type: "SESSION_START",
      category: "system",
      metadata: this.buildMetadata(),
      data: {
        initialRoute: window.location.pathname,
      },
    } as any);

    if (this.config.debugMode) {
      console.log("[EventTracker] Initialized with sessionId:", this.sessionId);
    }
  }

  private getOrCreateSessionId(): string {
    if (typeof window === "undefined") return generateUUID();

    let sessionId = sessionStorage.getItem("tracking_session_id");
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem("tracking_session_id", sessionId);
    }
    return sessionId;
  }

  private getDeviceInfo(): DeviceInfo {
    if (typeof window === "undefined") {
      return {
        userAgent: "",
        viewport: { width: 0, height: 0 },
        platform: "",
        language: "",
        timezone: "",
      };
    }

    return {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private buildMetadata(): EventMetadata {
    if (typeof window === "undefined") {
      return {
        orderingSessionId: this.orderingSessionId,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        deviceInfo: this.getDeviceInfo(),
        currentRoute: "",
      };
    }

    return {
      orderingSessionId: this.orderingSessionId,

      sessionId: this.sessionId,
      userId: localStorage.getItem("clientPhone") || undefined,
      restaurantId: localStorage.getItem("restId") || undefined,
      cartId: localStorage.getItem("cartId") || undefined,
      timestamp: Date.now(),
      deviceInfo: this.getDeviceInfo(),
      currentRoute: this.currentRoute || window.location.pathname,
      previousRoute: this.previousRoute || undefined,
      referrer: document.referrer || undefined,
    };
  }

  track(event: Partial<TrackingEvent>) {
    if (!this.config.enabled || typeof window === "undefined") return;

    const fullEvent: TrackingEvent = {
      ...event,
      id: event.id || generateUUID(),
      metadata: this.buildMetadata(),
    } as TrackingEvent;

    // Agregar a user journey (para contexto de errores)
    if (fullEvent.type !== "ERROR") {
      this.addToUserJourney(fullEvent);
    }

    this.eventBuffer.push(fullEvent);

    if (this.config.debugMode) {
      console.log("[EventTracker] Event tracked:", fullEvent);
    }

    // Flush si alcanzamos el tamaño del batch
    if (this.eventBuffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private addToUserJourney(event: TrackingEvent) {
    const journeyEntry = `${event.type}:${JSON.stringify(event.data).substring(
      0,
      50
    )}`;
    this.userJourney.push(journeyEntry);

    // Mantener solo las últimas 20 acciones
    if (this.userJourney.length > 20) {
      this.userJourney.shift();
    }
  }

  getUserJourney(): string[] {
    return [...this.userJourney];
  }

  setRoute(route: string) {
    this.previousRoute = this.currentRoute;
    this.currentRoute = route;
  }

  async flush(force: boolean = false) {
    if (this.eventBuffer.length === 0) return;

    const batch: EventBatch = {
      batchId: generateUUID(),
      events: [...this.eventBuffer],
      timestamp: Date.now(),
      count: this.eventBuffer.length,
    };

    this.eventBuffer = [];

    if (this.config.debugMode) {
      console.log(`[EventTracker] Flushing ${batch.count} events`, batch);
    }

    await this.sendBatch(batch);
  }

  private async sendBatch(
    batch: EventBatch,
    retryCount: number = 0
  ): Promise<void> {
    try {
      const response = await fetch("/api/tracking/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        throw new Error(`Failed to send batch: ${response.statusText}`);
      }

      // Limpiar del localStorage si se envió exitosamente
      if (this.config.enableLocalStorage) {
        this.removeFromFailedBatches(batch.batchId);
      }

      if (this.config.debugMode) {
        console.log("[EventTracker] Batch sent successfully:", batch.batchId);
      }
    } catch (error) {
      console.error("[EventTracker] Failed to send batch:", error);

      // Guardar en localStorage para reintentar después
      if (this.config.enableLocalStorage) {
        this.saveFailedBatch(batch);
      }

      // Reintentar si no hemos alcanzado el máximo
      if (retryCount < this.config.maxRetries) {
        setTimeout(() => {
          this.sendBatch(batch, retryCount + 1);
        }, this.config.retryDelay * (retryCount + 1));
      }
    }
  }

  private saveFailedBatch(batch: EventBatch) {
    if (typeof window === "undefined") return;

    try {
      const failed = localStorage.getItem("tracking_failed_batches");
      const batches = failed ? JSON.parse(failed) : [];
      batches.push(batch);

      // Mantener solo los últimos 10 batches fallidos
      if (batches.length > 10) {
        batches.shift();
      }

      localStorage.setItem("tracking_failed_batches", JSON.stringify(batches));
    } catch (error) {
      console.error("[EventTracker] Failed to save failed batch:", error);
    }
  }

  private removeFromFailedBatches(batchId: string) {
    if (typeof window === "undefined") return;

    try {
      const failed = localStorage.getItem("tracking_failed_batches");
      if (!failed) return;

      const batches = JSON.parse(failed);
      const filtered = batches.filter((b: EventBatch) => b.batchId !== batchId);
      localStorage.setItem("tracking_failed_batches", JSON.stringify(filtered));
    } catch (error) {
      console.error(
        "[EventTracker] Failed to remove from failed batches:",
        error
      );
    }
  }

  private recoverFailedEvents() {
    if (typeof window === "undefined" || !this.config.enableLocalStorage)
      return;

    try {
      const failed = localStorage.getItem("tracking_failed_batches");
      if (!failed) return;

      const batches: EventBatch[] = JSON.parse(failed);

      if (this.config.debugMode) {
        console.log(
          `[EventTracker] Recovering ${batches.length} failed batches`
        );
      }

      // Reintentar enviar cada batch
      batches.forEach((batch) => {
        this.sendBatch(batch);
      });
    } catch (error) {
      console.error("[EventTracker] Failed to recover failed events:", error);
    }
  }

  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      if (this.eventBuffer.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private setupBeforeUnload() {
    if (typeof window === "undefined") return;

    window.addEventListener("beforeunload", () => {
      // Track session end
      this.track({
        id: generateUUID(),
        type: "SESSION_END",
        category: "system",
        metadata: this.buildMetadata(),
        data: {
          duration:
            Date.now() -
            parseInt(sessionStorage.getItem("session_start") || "0"),
          eventCount: this.userJourney.length,
        },
      } as any);

      // Flush inmediato antes de cerrar
      if (this.eventBuffer.length > 0) {
        // Usar sendBeacon para envío garantizado antes de cerrar
        const batch: EventBatch = {
          batchId: generateUUID(),
          events: this.eventBuffer,
          timestamp: Date.now(),
          count: this.eventBuffer.length,
        };

        navigator.sendBeacon("/api/tracking/batch", JSON.stringify(batch));

        this.eventBuffer = [];
      }
    });
  }

  updateConfig(newConfig: Partial<TrackingConfig>) {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.flushInterval) {
      this.startFlushTimer();
    }
  }

  getConfig(): TrackingConfig {
    return { ...this.config };
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(true);
    this.isInitialized = false;
  }
}

// Export singleton instance
export const eventTracker = EventTracker.getInstance();
