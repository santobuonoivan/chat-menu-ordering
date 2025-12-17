import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type Ably from "ably";
import { getAblyInstance, subscribeToChannel } from "@/lib/ably";

/**
 * Interface para mensajes de Ably recibidos
 */
export interface AblyReceivedMessage {
  id: string;
  channelName: string;
  eventName: string;
  data: any;
  timestamp: number;
  processed: boolean;
}

/**
 * Interface para datos de pago pendientes
 */
export interface PendingPayment {
  transactionId: string;
  cartId: string;
  channelName: string;
  amount: number;
  timestamp: number;
  cardData?: {
    last4Digits: string;
    cardholderName: string;
  };
  metadata?: any;
}

/**
 * Interface del store de Ably
 */
interface AblyStore {
  // Estado de conexión
  isConnected: boolean;
  connectionState: string;

  // Mensajes recibidos
  messages: AblyReceivedMessage[];

  // Pagos pendientes
  pendingPayments: PendingPayment[];

  // Canales activos suscritos
  activeChannels: string[];

  // Acciones
  setConnectionState: (isConnected: boolean, state: string) => void;
  addMessage: (message: AblyReceivedMessage) => void;
  markMessageAsProcessed: (messageId: string) => void;
  clearMessages: () => void;

  // Gestión de pagos pendientes
  addPendingPayment: (payment: PendingPayment) => void;
  removePendingPayment: (transactionId: string) => void;
  getPendingPayment: (transactionId: string) => PendingPayment | undefined;
  clearExpiredPayments: () => void;

  // Gestión de canales
  subscribeToChannel: (channelName: string, eventName?: string) => void;
  unsubscribeFromChannel: (channelName: string) => void;

  // Inicialización
  initialize: () => void;
  cleanup: () => void;
}

// Objeto para mantener las funciones de desuscripción
const unsubscribeFunctions: Map<string, () => void> = new Map();

/**
 * Store global de Ably
 * Gestiona la conexión, mensajes y pagos pendientes
 */
export const useAblyStore = create<AblyStore>()(
  persist(
    (set, get) => ({
      isConnected: false,
      connectionState: "initialized",
      messages: [],
      pendingPayments: [],
      activeChannels: [],

      setConnectionState: (isConnected, state) => {
        set({ isConnected, connectionState: state });
        console.log(
          `📡 Ably connection state: ${state} (${
            isConnected ? "connected" : "disconnected"
          })`
        );
      },

      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
        console.log("📨 New Ably message received:", message);
      },

      markMessageAsProcessed: (messageId) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, processed: true } : msg
          ),
        }));
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      addPendingPayment: (payment) => {
        set((state) => ({
          pendingPayments: [...state.pendingPayments, payment],
        }));
        console.log("💳 Pending payment added:", payment.transactionId);
      },

      removePendingPayment: (transactionId) => {
        set((state) => ({
          pendingPayments: state.pendingPayments.filter(
            (p) => p.transactionId !== transactionId
          ),
        }));
        console.log("✅ Pending payment removed:", transactionId);
      },

      getPendingPayment: (transactionId) => {
        return get().pendingPayments.find(
          (p) => p.transactionId === transactionId
        );
      },

      clearExpiredPayments: () => {
        const now = Date.now();
        const EXPIRY_TIME = 5 * 60 * 1000; // 5 minutos

        set((state) => ({
          pendingPayments: state.pendingPayments.filter(
            (p) => now - p.timestamp < EXPIRY_TIME
          ),
        }));
      },

      subscribeToChannel: (channelName, eventName = "payment-response") => {
        // Evitar suscripciones duplicadas
        if (get().activeChannels.includes(channelName)) {
          console.log(`⚠️ Already subscribed to channel: ${channelName}`);
          return;
        }

        try {
          const handleMessage = (message: Ably.Message) => {
            const receivedMessage: AblyReceivedMessage = {
              id: `${channelName}-${message.id || Date.now()}`,
              channelName,
              eventName: message.name || "unknown",
              data: message.data,
              timestamp: message.timestamp || Date.now(),
              processed: false,
            };

            get().addMessage(receivedMessage);

            // Si es un mensaje de pago, procesar automáticamente
            if (
              message.name === "payment-response" &&
              message.data?.transaction_id
            ) {
              const pendingPayment = get().getPendingPayment(
                message.data.transaction_id
              );

              if (pendingPayment) {
                console.log(
                  "💰 Payment response received for:",
                  message.data.transaction_id
                );

                // Aquí puedes agregar lógica adicional según el status
                if (message.data.status === "success") {
                  console.log("✅ Payment successful");
                } else if (message.data.status === "failed") {
                  console.error("❌ Payment failed:", message.data.message);
                }

                // Marcar mensaje como procesado
                get().markMessageAsProcessed(receivedMessage.id);
              }
            }
          };

          const unsubscribe = subscribeToChannel(
            channelName,
            eventName,
            handleMessage
          );
          unsubscribeFunctions.set(channelName, unsubscribe);

          set((state) => ({
            activeChannels: [...state.activeChannels, channelName],
          }));

          console.log(
            `🔔 Subscribed to channel: ${channelName} (event: ${eventName})`
          );
        } catch (error) {
          console.error("❌ Error subscribing to channel:", error);
        }
      },

      unsubscribeFromChannel: (channelName) => {
        const unsubscribe = unsubscribeFunctions.get(channelName);
        if (unsubscribe) {
          unsubscribe();
          unsubscribeFunctions.delete(channelName);
        }

        set((state) => ({
          activeChannels: state.activeChannels.filter(
            (ch) => ch !== channelName
          ),
        }));

        console.log(`🔕 Unsubscribed from channel: ${channelName}`);
      },

      initialize: () => {
        try {
          const ably = getAblyInstance();

          // Escuchar cambios en el estado de conexión
          ably.connection.on((stateChange) => {
            get().setConnectionState(
              stateChange.current === "connected",
              stateChange.current
            );
          });

          console.log("🚀 Ably store initialized");
        } catch (error) {
          console.error("❌ Error initializing Ably store:", error);
        }
      },

      cleanup: () => {
        // Desuscribir de todos los canales
        const channels = get().activeChannels;
        channels.forEach((channel) => {
          get().unsubscribeFromChannel(channel);
        });

        // Limpiar pagos expirados
        get().clearExpiredPayments();

        console.log("🧹 Ably store cleaned up");
      },
    }),
    {
      name: "ably-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Solo persistir pagos pendientes y mensajes no procesados
        pendingPayments: state.pendingPayments,
        messages: state.messages.filter((m) => !m.processed),
      }),
    }
  )
);

// Hook para usar el store de forma más simple
export const useAblyConnection = () => {
  const { isConnected, connectionState } = useAblyStore();
  return { isConnected, connectionState };
};

export const useAblyMessages = () => {
  const { messages, clearMessages, markMessageAsProcessed } = useAblyStore();
  return { messages, clearMessages, markMessageAsProcessed };
};

export const usePendingPayments = () => {
  const {
    pendingPayments,
    addPendingPayment,
    removePendingPayment,
    getPendingPayment,
  } = useAblyStore();

  return {
    pendingPayments,
    addPendingPayment,
    removePendingPayment,
    getPendingPayment,
  };
};
