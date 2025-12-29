export interface AblyConfig {
  API_KEY: string;
  options?: {
    clientId?: string;
    echoMessages?: boolean;
    autoConnect?: boolean;
  };
}

export const ABLY_CONFIG: AblyConfig = {
  API_KEY: process.env.ABLY_API_KEY || "",
  options: {
    echoMessages: false,
    autoConnect: true,
  },
};

export const validateAblyConfig = (): boolean => {
  return Boolean(ABLY_CONFIG.API_KEY && ABLY_CONFIG.API_KEY.trim().length > 0);
};
