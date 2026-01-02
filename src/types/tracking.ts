export type EventType =
  | "PAGE_VIEW"
  | "USER_ACTION"
  | "API_CALL"
  | "CART_ACTION"
  | "CHAT_MESSAGE"
  | "PAYMENT_FLOW"
  | "ERROR"
  | "SESSION_START"
  | "SESSION_END";

export type EventCategory =
  | "navigation"
  | "interaction"
  | "transaction"
  | "communication"
  | "system";

export interface DeviceInfo {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  platform: string;
  language: string;
  timezone: string;
}

export interface EventMetadata {
  sessionId: string;
  orderingSessionId: string;
  userId?: string; // teléfono del cliente
  restaurantId?: string;
  cartId?: string;
  timestamp: number;
  deviceInfo: DeviceInfo;
  currentRoute: string;
  previousRoute?: string;
  referrer?: string;
}

export interface BaseEvent {
  id: string;
  type: EventType;
  category: EventCategory;
  metadata: EventMetadata;
}

export interface PageViewEvent extends BaseEvent {
  type: "PAGE_VIEW";
  category: "navigation";
  data: {
    path: string;
    title: string;
    params?: Record<string, string>;
  };
}

export interface UserActionEvent extends BaseEvent {
  type: "USER_ACTION";
  category: "interaction";
  data: {
    action: string; // "click", "input", "select", etc.
    target: string; // elemento que se interactuó
    value?: any;
    context?: Record<string, any>;
  };
}

export interface ApiCallEvent extends BaseEvent {
  type: "API_CALL";
  category: "system";
  data: {
    endpoint: string;
    method: string;
    status?: number;
    duration?: number;
    success: boolean;
    error?: string;
    requestPayload?: any;
    responseData?: any;
  };
}

export interface CartActionEvent extends BaseEvent {
  type: "CART_ACTION";
  category: "transaction";
  data: {
    action: "add" | "remove" | "update" | "clear";
    itemId?: string;
    itemName?: string;
    quantity?: number;
    price?: number;
    modifiers?: any[];
    cartTotal?: number;
    cartItemCount?: number;
  };
}

export interface ChatMessageEvent extends BaseEvent {
  type: "CHAT_MESSAGE";
  category: "communication";
  data: {
    sender: "user" | "assistant";
    messageId: string;
    messageLength: number;
    hasData?: boolean;
    dataType?: string;
    intent?: string;
  };
}

export interface PaymentFlowEvent extends BaseEvent {
  type: "PAYMENT_FLOW";
  category: "transaction";
  data: {
    step: string; // "initiate", "address", "payment_method", "confirm", "complete"
    paymentMethod?: string;
    amount?: number;
    status?: "pending" | "success" | "failed";
    error?: string;
  };
}

export interface ErrorEvent extends BaseEvent {
  type: "ERROR";
  category: "system";
  data: {
    errorMessage: string;
    errorStack?: string;
    errorType: "runtime" | "api" | "user" | "network";
    componentStack?: string;
    userJourney: string[]; // últimas 10 acciones del usuario
    storeState?: Record<string, any>; // snapshot de stores relevantes
    severity: "low" | "medium" | "high" | "critical";
  };
}

export type TrackingEvent =
  | PageViewEvent
  | UserActionEvent
  | ApiCallEvent
  | CartActionEvent
  | ChatMessageEvent
  | PaymentFlowEvent
  | ErrorEvent;

export interface EventBatch {
  batchId: string;
  events: TrackingEvent[];
  timestamp: number;
  count: number;
}

export interface TrackingConfig {
  enabled: boolean;
  batchSize: number; // número de eventos antes de enviar
  flushInterval: number; // ms entre envíos automáticos
  maxRetries: number;
  retryDelay: number; // ms entre reintentos
  enableLocalStorage: boolean;
  debugMode: boolean;
}
