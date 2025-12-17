/**
 * Hook personalizado para monitorear el estado de pagos en tiempo real
 *
 * Uso:
 * ```tsx
 * const { pendingPayment, lastMessage, isWaitingResponse } = usePaymentMonitor(transactionId);
 *
 * useEffect(() => {
 *   if (lastMessage?.data.status === 'success') {
 *     // Pago confirmado
 *   }
 * }, [lastMessage]);
 * ```
 */

import { useEffect, useState } from "react";
import {
  useAblyStore,
  PendingPayment,
  AblyReceivedMessage,
} from "@/stores/ablyStore";

interface UsePaymentMonitorResult {
  pendingPayment: PendingPayment | undefined;
  lastMessage: AblyReceivedMessage | undefined;
  isWaitingResponse: boolean;
  allMessages: AblyReceivedMessage[];
}

/**
 * Hook para monitorear el estado de un pago específico
 * @param transactionId ID de la transacción a monitorear
 * @returns Estado del pago y mensajes relacionados
 */
export const usePaymentMonitor = (
  transactionId: string | null
): UsePaymentMonitorResult => {
  const { getPendingPayment, messages } = useAblyStore();
  const [pendingPayment, setPendingPayment] = useState<
    PendingPayment | undefined
  >();
  const [relatedMessages, setRelatedMessages] = useState<AblyReceivedMessage[]>(
    []
  );

  useEffect(() => {
    if (!transactionId) {
      setPendingPayment(undefined);
      setRelatedMessages([]);
      return;
    }

    // Obtener pago pendiente
    const payment = getPendingPayment(transactionId);
    setPendingPayment(payment);

    // Filtrar mensajes relacionados con este pago
    const filteredMessages = messages.filter(
      (msg) => msg.data?.transaction_id === transactionId
    );
    setRelatedMessages(filteredMessages);
  }, [transactionId, messages, getPendingPayment]);

  const lastMessage =
    relatedMessages.length > 0
      ? relatedMessages[relatedMessages.length - 1]
      : undefined;

  const isWaitingResponse = Boolean(
    pendingPayment &&
      (!lastMessage ||
        (lastMessage.data?.status !== "success" &&
          lastMessage.data?.status !== "failed"))
  );

  return {
    pendingPayment,
    lastMessage,
    isWaitingResponse,
    allMessages: relatedMessages,
  };
};

/**
 * Hook para obtener todos los pagos pendientes activos
 * @returns Lista de pagos pendientes
 */
export const useActivePendingPayments = () => {
  const { pendingPayments } = useAblyStore();
  return pendingPayments;
};

/**
 * Hook para obtener mensajes no procesados
 * @returns Lista de mensajes sin procesar
 */
export const useUnprocessedMessages = () => {
  const { messages } = useAblyStore();
  return messages.filter((msg) => !msg.processed);
};
