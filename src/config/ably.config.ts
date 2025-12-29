export interface AblyConfig {
  API_KEY: string;
  options?: {
    clientId?: string;
    echoMessages?: boolean;
    autoConnect?: boolean;
  };
}

export const getAblyConfig = async (): Promise<AblyConfig> => {
  // En el cliente, obtener la key desde la API
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/ably/token");
      if (!response.ok) {
        throw new Error("Failed to fetch Ably token");
      }
      const data = await response.json();
      return {
        API_KEY: data.apiKey || "",
        options: {
          echoMessages: false,
          autoConnect: true,
        },
      };
    } catch (error) {
      console.error("Error fetching Ably token:", error);
      throw new Error("Ably API key not configured");
    }
  }

  // En el servidor, esto nunca debería ejecutarse ya que getAblyInstance
  // solo se llama desde el cliente
  throw new Error("getAblyConfig called on server side");
};

export const validateAblyConfig = (config: AblyConfig): boolean => {
  return Boolean(config.API_KEY && config.API_KEY.trim().length > 0);
};
