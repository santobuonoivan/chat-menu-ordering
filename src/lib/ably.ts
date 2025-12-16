import Ably from "ably";
import { ABLY_CONFIG, validateAblyConfig } from "@/config/ably.config";

/**
 * Singleton instance of Ably Realtime client
 * Se crea una única instancia para toda la aplicación
 */
let ablyInstance: Ably.Realtime | null = null;

/**
 * Obtiene o crea la instancia de Ably
 * @returns Instancia de Ably Realtime
 */
export const getAblyInstance = (): Ably.Realtime => {
  if (!ablyInstance) {
    if (!validateAblyConfig()) {
      throw new Error("Ably API key is not configured");
    }

    ablyInstance = new Ably.Realtime({
      key: ABLY_CONFIG.API_KEY,
      ...ABLY_CONFIG.options,
    });

    // Log de eventos de conexión (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      ablyInstance.connection.on("connected", () => {
        console.log("✅ Ably connected");
      });

      ablyInstance.connection.on("disconnected", () => {
        console.log("❌ Ably disconnected");
      });

      ablyInstance.connection.on("failed", (error) => {
        console.error("❌ Ably connection failed:", error);
      });
    }
  }

  return ablyInstance;
};

/**
 * Cierra la conexión de Ably
 * Útil para cleanup cuando se desmonta la aplicación
 */
export const closeAblyConnection = () => {
  if (ablyInstance) {
    ablyInstance.close();
    ablyInstance = null;
  }
};

/**
 * Obtiene un canal específico de Ably
 * @param channelName Nombre del canal
 * @returns Canal de Ably
 */
export const getAblyChannel = (channelName: string): Ably.RealtimeChannel => {
  const ably = getAblyInstance();
  return ably.channels.get(channelName);
};

/**
 * Publica un mensaje en un canal
 * @param channelName Nombre del canal
 * @param eventName Nombre del evento
 * @param data Datos a enviar
 */
export const publishMessage = async (
  channelName: string,
  eventName: string,
  data: any
): Promise<void> => {
  const channel = getAblyChannel(channelName);
  await channel.publish(eventName, data);
};

/**
 * Se suscribe a un canal y evento específico
 * @param channelName Nombre del canal
 * @param eventName Nombre del evento (opcional, si no se especifica escucha todos)
 * @param callback Función a ejecutar cuando llega un mensaje
 * @returns Función para desuscribirse
 */
export const subscribeToChannel = (
  channelName: string,
  eventName: string | null,
  callback: (message: Ably.Message) => void
): (() => void) => {
  const channel = getAblyChannel(channelName);

  if (eventName) {
    channel.subscribe(eventName, callback);
  } else {
    channel.subscribe(callback);
  }

  // Retornar función de cleanup
  return () => {
    if (eventName) {
      channel.unsubscribe(eventName, callback);
    } else {
      channel.unsubscribe(callback);
    }
  };
};

/**
 * Obtiene el estado de la conexión actual
 * @returns Estado de la conexión
 */
export const getConnectionState = (): Ably.ConnectionState => {
  const ably = getAblyInstance();
  return ably.connection.state;
};

/**
 * Verifica si Ably está conectado
 * @returns true si está conectado
 */
export const isAblyConnected = (): boolean => {
  return getConnectionState() === "connected";
};
