"use client";

import { useState } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirm: (paymentData: PaymentData) => void;
}

export interface PaymentData {
  paymentMethod: "credit_card" | "cash";
  cardData?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
}

export default function PaymentModal({
  isOpen,
  onClose,
  totalAmount,
  onConfirm,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "cash">(
    "credit_card"
  );
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  const handleFormatCardNumber = (value: string) => {
    // Remover espacios y caracteres no numéricos
    const cleaned = value.replace(/\D/g, "");
    // Limitar a 16 dígitos
    const limited = cleaned.slice(0, 16);
    // Agregar espacios cada 4 dígitos
    const formatted = limited.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleFormatExpiryDate = (value: string) => {
    // Remover espacios y caracteres no numéricos
    const cleaned = value.replace(/\D/g, "");
    // Limitar a 4 dígitos (MMAA)
    const limited = cleaned.slice(0, 4);
    // Agregar barra después de 2 dígitos
    if (limited.length >= 2) {
      setExpiryDate(`${limited.slice(0, 2)}/${limited.slice(2)}`);
    } else {
      setExpiryDate(limited);
    }
  };

  const handleFormatCvv = (value: string) => {
    // Solo números, máximo 4 dígitos
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    setCvv(cleaned);
  };

  const validateCardData = (): boolean => {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
      alert("El número de tarjeta debe tener 16 dígitos");
      return false;
    }
    if (!expiryDate || expiryDate.length !== 5) {
      alert("La fecha de vencimiento debe estar en formato MM/AA");
      return false;
    }
    if (!cvv || cvv.length < 3) {
      alert("El CVV debe tener al menos 3 dígitos");
      return false;
    }
    if (!cardholderName.trim()) {
      alert("El nombre del titular es requerido");
      return false;
    }
    return true;
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === "credit_card") {
      if (!validateCardData()) return;
      onConfirm({
        paymentMethod: "credit_card",
        cardData: {
          cardNumber: cardNumber.replace(/\s/g, ""),
          expiryDate,
          cvv,
          cardholderName,
        },
      });
    } else {
      onConfirm({
        paymentMethod: "cash",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className="absolute inset-0 z-0 h-full w-full bg-cover bg-center"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 32 32%22 fill=%22none%22%3e%3cpath d=%22M0 .5H31.5V32%22 stroke=%22%23e1e6db%22/%3e%3c/svg%3e")',
        }}
      >
        <div
          className="absolute inset-0 bg-background-light/90 dark:bg-background-dark/90"
          style={{
            backgroundColor: "rgba(243, 244, 246, 0.9)",
          }}
        />
      </div>

      <div className="relative flex h-full w-full max-w-[450px] max-h-[90vh] flex-col overflow-hidden rounded-xl border border-gray-200/50 bg-white/30 shadow-xl dark:border-gray-700/50 dark:bg-black/30">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-2 px-4 py-3">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-slate-900 transition-transform hover:scale-105 dark:bg-black/50 dark:text-slate-200"
            style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Ingresar Pago
          </h1>
          <div className="w-10"></div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-6 overflow-y-auto px-2 py-4 sm:px-4">
          {/* Payment Method Section */}
          <div
            className="flex flex-col gap-4 rounded-lg p-5 shadow-lg"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Método de Pago
            </h3>

            <fieldset className="grid grid-cols-2 gap-3">
              <legend className="sr-only">Seleccione un método de pago</legend>

              {/* Credit Card Option */}
              <label
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all"
                style={{
                  borderColor:
                    paymentMethod === "credit_card" ? "#65A30D" : "transparent",
                  backgroundColor:
                    paymentMethod === "credit_card"
                      ? "rgba(101, 163, 13, 0.2)"
                      : "rgba(255, 255, 255, 0.8)",
                }}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="credit_card"
                  checked={paymentMethod === "credit_card"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "credit_card" | "cash")
                  }
                  className="sr-only"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 dark:bg-slate-800/80">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ color: "#65A30D" }}
                  >
                    credit_card
                  </span>
                </div>
                <span className="text-xs font-medium text-center text-slate-800 dark:text-white">
                  Tarjeta
                </span>
              </label>

              {/* Cash Option */}
              <label
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-white/80 p-3 transition-all hover:border-primary/50 dark:bg-slate-800/80 dark:hover:border-primary/50"
                style={{
                  borderColor:
                    paymentMethod === "cash" ? "#65A30D" : "transparent",
                  backgroundColor:
                    paymentMethod === "cash"
                      ? "rgba(101, 163, 13, 0.2)"
                      : "rgba(255, 255, 255, 0.8)",
                }}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "credit_card" | "cash")
                  }
                  className="sr-only"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 dark:bg-slate-800/80">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{
                      color:
                        paymentMethod === "cash" ? "#65A30D" : "text-slate-600",
                    }}
                  >
                    payments
                  </span>
                </div>
                <span className="text-xs font-medium text-center text-slate-800 dark:text-white">
                  Efectivo
                </span>
              </label>
            </fieldset>

            {/* Card Form - Only shown when credit_card is selected */}
            {paymentMethod === "credit_card" && (
              <div className="flex flex-col gap-4 pt-4">
                {/* Card Number */}
                <label className="flex flex-col">
                  <p className="pb-2 text-base font-medium text-slate-900 dark:text-slate-300">
                    Número de Tarjeta
                  </p>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => handleFormatCardNumber(e.target.value)}
                    className="h-14 w-full rounded-lg border border-gray-300 bg-white/80 px-4 py-3 text-base font-normal text-slate-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder:text-gray-400"
                  />
                </label>

                {/* Expiry and CVV */}
                <div className="flex flex-row gap-4">
                  <label className="flex flex-col flex-1 min-w-0">
                    <p className="pb-2 text-base font-medium text-slate-900 dark:text-slate-300">
                      Vencimiento
                    </p>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={expiryDate}
                      onChange={(e) => handleFormatExpiryDate(e.target.value)}
                      className="h-14 w-full rounded-lg border border-gray-300 bg-white/80 px-4 py-3 text-base font-normal text-slate-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder:text-gray-400"
                    />
                  </label>

                  <label className="flex flex-col flex-1 min-w-0">
                    <p className="pb-2 text-base font-medium text-slate-900 dark:text-slate-300">
                      CVV
                    </p>
                    <input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => handleFormatCvv(e.target.value)}
                      className="h-14 w-full rounded-lg border border-gray-300 bg-white/80 px-4 py-3 text-base font-normal text-slate-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder:text-gray-400"
                    />
                  </label>
                </div>

                {/* Cardholder Name */}
                <label className="flex flex-col">
                  <p className="pb-2 text-base font-medium text-slate-900 dark:text-slate-300">
                    Nombre del Titular
                  </p>
                  <input
                    type="text"
                    placeholder="Nombre como aparece en la tarjeta"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="h-14 w-full rounded-lg border border-gray-300 bg-white/80 px-4 py-3 text-base font-normal text-slate-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder:text-gray-400"
                  />
                </label>
              </div>
            )}

            {/* Cash Option Message */}
            {paymentMethod === "cash" && (
              <div className="flex flex-col gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-950/20">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Efectivo
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Pagarás en efectivo al momento de la entrega.
                </p>
              </div>
            )}
          </div>

          {/* Total Amount Section */}
          <div
            className="flex flex-col gap-3 rounded-lg p-5 shadow-lg"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
              <span>Total a pagar</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </main>

        {/* Footer with Confirm Button */}
        <footer className="shrink-0 border-t border-gray-200/50 bg-white/30 px-2 py-4 dark:border-gray-700/50 dark:bg-black/30 sm:px-4">
          <button
            onClick={handleConfirmPayment}
            className="flex h-16 w-full items-center justify-center rounded-lg text-lg font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"
            style={{
              backgroundColor: "#65A30D",
              boxShadow: "0 8px 16px rgba(101, 163, 13, 0.3)",
            }}
          >
            Confirmar Pago
          </button>
        </footer>
      </div>
    </div>
  );
}
