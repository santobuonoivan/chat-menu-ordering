/**
 * AblyProvider
 *
 * Componente que inicializa y gestiona la conexión global de Ably.
 * Debe envolverse en la raíz de la aplicación para mantener la conexión activa.
 *
 * Funcionalidades:
 * - Inicializa el store de Ably
 * - Mantiene la conexión activa durante toda la sesión
 * - Limpia recursos al desmontar
 * - Limpia pagos expirados periódicamente
 */

"use client";

import { useEffect } from "react";
import { useAblyStore } from "@/stores/ablyStore";
import { useSessionStore } from "@/stores/sessionStore";

interface AblyProviderProps {
  children: React.ReactNode;
}

export const AblyProvider: React.FC<AblyProviderProps> = ({ children }) => {
  const {
    initialize,
    cleanup,
    clearExpiredPayments,
    subscribeToChannel,
    unsubscribeFromChannel,
    activeChannels,
  } = useAblyStore();
  const {
    clientPhone,
    restPhone,
    getSessionChannelName,
    generateSessionChannel,
  } = useSessionStore();

  // 🚀 Inicialización de Ably (solo una vez)
  useEffect(() => {
    initialize();

    // 🧪 En desarrollo, suscribirse al canal de pruebas
    if (process.env.NODE_ENV === "development") {
      console.log("🧪 [DEV] Auto-suscripción a test-channel");
      subscribeToChannel("test-channel", "test-event");
    }

    // Limpiar pagos expirados cada minuto
    const cleanupInterval = setInterval(() => {
      clearExpiredPayments();
    }, 60000); // 1 minuto

    // Cleanup al desmontar el provider
    return () => {
      clearInterval(cleanupInterval);
      cleanup();
    };
  }, [initialize, cleanup, clearExpiredPayments, subscribeToChannel]);

  // 🔄 Re-suscripción cuando cambian los teléfonos (clientPhone o restPhone)
  useEffect(() => {
    // Solo proceder si ambos teléfonos están disponibles
    if (!clientPhone || !restPhone) {
      console.warn("⚠️ No se puede suscribir: faltan clientPhone o restPhone");
      return;
    }

    // Regenerar el canal de sesión con los nuevos teléfonos
    const newSessionChannel = generateSessionChannel();
    console.log("🔐 Nuevo canal de sesión generado:", newSessionChannel);

    // Desuscribirse de canales de pago anteriores (excepto test-channel)
    const paymentChannels = activeChannels.filter((ch) =>
      ch.startsWith("payment-")
    );
    paymentChannels.forEach((oldChannel) => {
      if (oldChannel !== newSessionChannel) {
        console.log("🔕 Desuscribiendo del canal anterior:", oldChannel);
        unsubscribeFromChannel(oldChannel);
      }
    });

    // Suscribirse al nuevo canal si no está ya suscrito
    if (!activeChannels.includes(newSessionChannel)) {
      console.log("🔐 Suscripción al nuevo canal de pago:", newSessionChannel);
      subscribeToChannel(newSessionChannel, "payment-response");
    }

    // Cleanup: desuscribirse cuando cambien los teléfonos de nuevo
    return () => {
      // No hacer cleanup aquí ya que el siguiente useEffect se encargará
      // de desuscribir el canal anterior
    };
  }, [
    clientPhone,
    restPhone,
    subscribeToChannel,
    unsubscribeFromChannel,
    activeChannels,
    generateSessionChannel,
  ]);

  return <>{children}</>;
};

export default AblyProvider;
