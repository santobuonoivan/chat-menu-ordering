import { useEffect, useRef, useState, useCallback } from "react";
import type Ably from "ably";
import {
  getAblyChannel,
  subscribeToChannel,
  isAblyConnected,
} from "@/lib/ably";

/**
 * Hook personalizado para usar Ably en componentes React
 * @param channelName Nombre del canal
 * @param eventName Nombre del evento (opcional)
 * @returns Estado de conexión y funciones útiles
 */
export const useAbly = (channelName: string, eventName?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Ably.Message[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Verificar estado de conexión
    setIsConnected(isAblyConnected());

    // Suscribirse al canal
    const handleMessage = (message: Ably.Message) => {
      setMessages((prev) => [...prev, message]);
    };

    unsubscribeRef.current = subscribeToChannel(
      channelName,
      eventName || null,
      handleMessage
    );

    // Cleanup al desmontar
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [channelName, eventName]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    messages,
    clearMessages,
  };
};

/**
 * Hook para publicar mensajes en Ably
 * @param channelName Nombre del canal
 * @returns Función para publicar mensajes
 */
export const useAblyPublish = (channelName: string) => {
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  useEffect(() => {
    channelRef.current = getAblyChannel(channelName);

    return () => {
      channelRef.current = null;
    };
  }, [channelName]);

  const publish = async (eventName: string, data: any) => {
    if (!channelRef.current) {
      throw new Error("Channel not initialized");
    }
    await channelRef.current.publish(eventName, data);
  };

  return { publish };
};

/**
 * Hook para obtener presencia en un canal
 * @param channelName Nombre del canal
 * @returns Información de presencia
 */
export const useAblyPresence = (channelName: string) => {
  const [members, setMembers] = useState<Ably.PresenceMessage[]>([]);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  useEffect(() => {
    channelRef.current = getAblyChannel(channelName);

    const updateMembers = async () => {
      if (!channelRef.current) return;

      const presence = await channelRef.current.presence.get();
      setMembers(presence);
    };

    // Actualizar lista inicial
    updateMembers();

    // Escuchar cambios de presencia
    channelRef.current.presence.subscribe("enter", updateMembers);
    channelRef.current.presence.subscribe("leave", updateMembers);
    channelRef.current.presence.subscribe("update", updateMembers);

    return () => {
      if (channelRef.current) {
        channelRef.current.presence.unsubscribe();
      }
    };
  }, [channelName]);

  const enterPresence = async (data?: any) => {
    if (!channelRef.current) return;
    await channelRef.current.presence.enter(data);
  };

  const leavePresence = async () => {
    if (!channelRef.current) return;
    await channelRef.current.presence.leave();
  };

  const updatePresence = async (data: any) => {
    if (!channelRef.current) return;
    await channelRef.current.presence.update(data);
  };

  return {
    members,
    enterPresence,
    leavePresence,
    updatePresence,
  };
};
