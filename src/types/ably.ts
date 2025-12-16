import type Ably from "ably";

/**
 * Tipos personalizados para Ably en el proyecto
 */

export type AblyChannelName = string;
export type AblyEventName = string;

export interface AblyMessageData {
  [key: string]: any;
}

export interface AblyPresenceData {
  userId?: string;
  userName?: string;
  status?: "online" | "away" | "busy" | "offline";
  [key: string]: any;
}

export type AblyConnectionState = Ably.ConnectionState;
export type AblyChannelState = Ably.ChannelState;

export interface AblyHookReturn {
  isConnected: boolean;
  messages: Ably.Message[];
  clearMessages: () => void;
}

export interface AblyPublishHookReturn {
  publish: (eventName: string, data: any) => Promise<void>;
}

export interface AblyPresenceHookReturn {
  members: Ably.PresenceMessage[];
  enterPresence: (data?: any) => Promise<void>;
  leavePresence: () => Promise<void>;
  updatePresence: (data: any) => Promise<void>;
}
