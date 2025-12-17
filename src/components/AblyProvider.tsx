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

interface AblyProviderProps {
  children: React.ReactNode;
}

export const AblyProvider: React.FC<AblyProviderProps> = ({ children }) => {
  const { initialize, cleanup, clearExpiredPayments, subscribeToChannel } =
    useAblyStore();

  useEffect(() => {
    // Inicializar Ably al montar
    initialize();

    // 🧪 En desarrollo, suscribirse automáticamente al canal de pruebas
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
  }, [initialize, cleanup, clearExpiredPayments, subscribeToChannel]);

  return <>{children}</>;
};

export default AblyProvider;
