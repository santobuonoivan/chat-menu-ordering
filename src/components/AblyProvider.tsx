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
  const { initialize, cleanup, clearExpiredPayments, subscribeToChannel } =
    useAblyStore();
  const { getSessionChannelName } = useSessionStore();

  useEffect(() => {
    // Inicializar Ably al montar
    initialize();

    // 🔐 Suscribirse al canal único de la sesión (basado en teléfonos)
    const sessionChannel = getSessionChannelName();
    if (sessionChannel) {
      console.log("🔐 Suscripción al canal de pago:", sessionChannel);
      // Solo un evento: payment-response
      subscribeToChannel(sessionChannel, "payment-response");
    } else {
      console.warn("⚠️ No se puede suscribir: faltan clientPhone o restPhone");
    }

    // 🧪 En desarrollo, también suscribirse al canal de pruebas
    if (process.env.NODE_ENV === "development") {
      console.log("🧪 [DEV] Auto-suscripción a test-channel");
      subscribeToChannel("test-channel", "test-event");
    }

    // Limpiar pagos expirados cada minuto
    const cleanupInterval = setInterval(() => {
      clearExpiredPayments();
    }, 60000); // 1 minuto

    // Cleanup al desmontar
    return () => {
      clearInterval(cleanupInterval);
      cleanup();
    };
  }, [
    initialize,
    cleanup,
    clearExpiredPayments,
    subscribeToChannel,
    getSessionChannelName,
  ]);

  return <>{children}</>;
};

export default AblyProvider;
