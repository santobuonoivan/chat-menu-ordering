"use client";

import { CreditCardSchema } from "@/schemas/ credit-card.schema";
import { EmailSchema } from "@/schemas/email.schema";
import { useCartStore } from "@/stores/cartStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useDeliveryStore } from "@/stores/deliveryStore";
import Script from "next/script";
import { useState, useEffect, useMemo } from "react";
import { ICartItem } from "@/types/cart";
import { ApiCallGetPaymentGateway } from "@/handlers/delivery/quotes";
import { ApiCallSendOrder } from "@/handlers/standar/orders";
import { ApiCallProcessPayment } from "@/handlers/duck-payments/payments";
import { useAblyStore } from "@/stores/ablyStore";
import { useChatStore } from "@/stores/chatStore";
import { generateUUID } from "@/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirm: (paymentMethod: "credit_card" | "cash") => void;
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

interface CardErrors {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  totalAmount,
  onConfirm,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "cash">(
    "cash"
  );
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [email, setEmail] = useState("");
  const [cardErrors, setCardErrors] = useState<CardErrors>({});
  const [disable, setDisable] = useState<any>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [payment, setPayment] = useState<any>({});
  const [syncCart, setSyncCart] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const cartStore = useCartStore();
  const {
    getSessionData,
    clientPhone,
    restPhone,
    clientName,
    getSessionChannelName,
  } = useSessionStore();
  const deliveryStore = useDeliveryStore();

  // Store de Ably para gestión global
  const { addPendingPayment } = useAblyStore();

  // Usar el canal único de la sesión
  const channelName = useMemo(
    () => getSessionChannelName() || "",
    [getSessionChannelName]
  );

  // Transaction ID único para este pago específico
  const transactionId = useMemo(
    () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setPaymentStatus("idle");
      setErrors([]);
    }
  }, [isOpen]);

  const convertCartToAutomateOrder = () => {
    const items = cartStore.items.map((item: ICartItem) => ({
      id: item.menuItem.dish_id?.toString() || "1768",
      name: item.menuItem.dish_name,
      unit_price: (item.menuItem.dish_price || "0").toString(),
      quantity: item.quantity.toString(),
      price: item.totalPrice.toFixed(0),
      modificadores:
        item.modifiers?.map((mod: any) => ({
          name: mod.modifierName,
          price: mod.priceAdjustment,
          qty: 1,
          sku: "",
          modifier_id: mod.modifierId,
        })) || [],
      mod_price: (
        item.modifiers?.reduce(
          (sum: number, mod: any) => sum + mod.priceAdjustment,
          0
        ) || 0
      ).toFixed(2),
    }));
    const sessionData = getSessionData();
    const cartId = sessionData?.cart.id || null;

    // Armar address desde deliveryStore
    const address = {
      status: "pending",
      user_mobile: deliveryStore.address?.phoneNumber || "",
      street: deliveryStore.address?.street || "",
      ext: deliveryStore.address?.streetNumber || "",
      int: "",
      neighborhood: deliveryStore.address?.neighborhood || "",
      county: deliveryStore.address?.county || "",
      city: deliveryStore.address?.city || "",
      state: deliveryStore.address?.state || "",
      zip: deliveryStore.address?.zip || "",
      lat: deliveryStore.address?.latitude || 0,
      lng: deliveryStore.address?.longitude || 0,
      special_instructions: deliveryStore.address?.references || null,
      comment: null,
      quote: deliveryStore.quoteData?.overloadAmountFee || 0,
      expires: null,
      shipping_method: "DELIVERY_BY_PLATFORM",
      quoteUUID: deliveryStore.quoteData?.quoteUUID || null,
      quoteId: null,
    };

    if (!cartId) return null;
    const order = {
      cart_id: cartId,
      items,
      address,
    };

    return order;
  };

  const sendOrderToAutomate = async () => {
    const cartoAutomate = convertCartToAutomateOrder();
    if (cartoAutomate) {
      console.log("cartoAutomate", cartoAutomate);

      // Llamada directa al endpoint de la API
      const response = await ApiCallSendOrder(cartoAutomate);

      return {
        success: [200, 201].includes(response.status),
        data: response.data,
      };
    }
    return null;
  };

  async function handleProcess(e: any): Promise<void> {
    setDisable(true);
    setErrors([]);
    setPaymentStatus("processing");

    let sync = syncCart;
    if (!syncCart) {
      const sendResponse = await sendOrderToAutomate();
      console.log("sendResponse", sendResponse);
      setSyncCart(sendResponse != null && sendResponse.success);
      sync = sendResponse != null && sendResponse.success;
    }

    if (sync) {
      try {
        const emailResult: any = EmailSchema.validate(email, {
          abortEarly: false,
        });

        if (emailResult.error == null) {
          console.log("Procesando cobro .... espere porfavor");

          let token = null;
          if (paymentMethod == "credit_card") {
            token = await createTokenOfcard();
            console.log("token", token);
            if (token == null || token == undefined) {
              setDisable(false);
              setPaymentStatus("idle");
              console.log("La tarjeta no se pudo tokenizar");
              console.warn(
                `La tarjeta presenta inconvenientes para tokenizar, revisa que los datos ingresados sean correctos.`
              );
              setErrors((prev) => [
                ...prev,
                "La tarjeta presenta inconvenientes para tokenizar, revisa que los datos ingresados sean correctos.",
              ]);

              return;
            }
          }

          const sessionData = getSessionData();
          const cartId = sessionData?.cart.id || null;
          const restName = sessionData?.rest.title || null;
          const restId = sessionData?.rest.rest_id || null;
          const restEmail = sessionData?.rest.email || "operaciones@appio.ai";

          if (!cartId) {
            setErrors((prev) => [...prev, "Error: faltan datos del carrito."]);
            setDisable(false);
            setPaymentStatus("idle");
            return;
          }

          if (paymentMethod == "credit_card" && token) {
            const miliseconds = new Date().getTime();

            let payPayload = {
              customer: {
                name: clientName || "Cliente",
                mobile: clientPhone,
                email: email,
                token_card: token ? token.id : null,
              },
              reference: parseInt(`${miliseconds}0${cartId}`),
              concept: "ORDER_PAYMENT",
              description: "Pago de pedido vía IA",
              currency: "MXN",
              receipt_amount: parseFloat(
                parseFloat(
                  deliveryStore.quoteData?.overloadAmountFee.toString() || "0.0"
                ).toFixed(2)
              ),
              type_charge: "direct",
              payment_method: "card",
              service: "PAYMENT",
              cashOnHand: 1,
              receipt_details: [],
              receipt_charges: [],
              receipt_owner: {
                name: restName || "Restaurante",
                email: restEmail || "",
                mobile: restPhone,
                owner_id: restId,
              },
              metadata: {
                action: "CREATE-ORDERING-IA",
                order_id: cartId,
                customerAmount: 35,
                storeAmount: 24,
                deliveryFeeAmount: parseFloat(
                  deliveryStore.quoteData?.overloadAmountFee.toString() || "0.0"
                ).toFixed(2),
                // Ably real-time configuration
                ably_channel: channelName, // payment-{clientPhone}-{restPhone}
                ably_event: "payment-response",
                transaction_id: transactionId, // Generado en este momento
              },
            };

            console.log("💳 Procesando pago con Ably channel:", channelName);
            console.log("Payload:", payPayload);

            const paymentResponse = await ApiCallProcessPayment({
              cart_id: cartId,
              payload: payPayload,
            });
            let processPaymentResponse = {
              success: [200, 201].includes(paymentResponse.status),
              data: paymentResponse.data,
            };
            console.log(
              "Respuesta inicial del backend:",
              processPaymentResponse
            );

            let { data } = processPaymentResponse;

            if (data && data.status == 201) {
              console.log("✅ Tu pago ha sido procesado exitosamente");
              setPaymentStatus("success");

              useChatStore.getState().addMessage({
                id: generateUUID(),
                text: "¡Tu pago está siendo procesado! ✅ aguarde unos minutos que ya vamos a confirmar tu pedido.",
                sender: "assistant",
                timestamp: new Date(),
              });
              // Guardar pago pendiente en el store de Ably
              addPendingPayment({
                transactionId,
                cartId,
                channelName,
                amount: parseFloat(
                  parseFloat(
                    deliveryStore.quoteData?.overloadAmountFee.toString() ||
                      "0.0"
                  ).toFixed(2)
                ),
                timestamp: Date.now(),
                metadata: payPayload,
              });

              // Llamar a onConfirm inmediatamente para continuar el flujo
              setTimeout(() => {
                onConfirm("credit_card");
              }, 1000); // Breve delay para mostrar animación de éxito
            } else {
              // Error inmediato
              console.error("❌ Error en el pago");
              setPaymentStatus("failed");
              setErrors([data?.message || "Error al procesar el pago"]);
              setDisable(false);
            }
          } else {
            // pago en efectivo
            console.log("✅ Tu pago ha sido procesado exitosamente");
            setPaymentStatus("success");

            useChatStore.getState().addMessage({
              id: generateUUID(),
              text: "¡Tu orden ya está siendo procesada! ✅",
              sender: "assistant",
              timestamp: new Date(),
            });

            // Llamar a onConfirm inmediatamente para continuar el flujo
            setTimeout(() => {
              onConfirm("cash");
            }, 1000);
          }

          console.log("token", token);
        } else {
          setDisable(false);
          setPaymentStatus("idle");
          // Extraer mensajes de error del email
          const emailErrors = emailResult.error?.details?.map(
            (detail: any) => detail.message
          ) || ["Email inválido o incompleto"];
          setErrors((prev) => [...prev, ...emailErrors]);

          console.log(`${emailResult.error.message}`);
        }
      } catch (error: any) {
        console.log(error);
        console.error(
          "Error cobro no pudo ser relizado, no se puede obtener la causa del error."
        );
        setErrors((prev) => [
          ...prev,
          "Error: No se puede obtener la causa del error.",
        ]);
        setDisable(false);
        setPaymentStatus("idle");
      }
    }
  }

  async function createTokenOfcard() {
    try {
      const response = await ApiCallGetPaymentGateway("CNKT");
      console.log("response", response);
      const gateway = { success: true, data: response.data };
      console.log(gateway);

      if (typeof Conekta !== "undefined" && gateway.success) {
        await Conekta.setPublicKey(gateway.data.publicKey);

        const cardClean = cardNumber.replace(/\s/g, "");
        const cvcClean = cvv.replace(/\s/g, "");
        let exp_month = expiryDate.substring(0, 2);
        let exp_year = expiryDate.substring(3, 5);

        let info = {
          card: {
            number: cardClean,
            name: cardholderName,
            exp_month: exp_month,
            exp_year: exp_year,
            cvc: cvcClean,
            address: false,
          },
        };

        const creditCardResult: any = CreditCardSchema.validate(
          {
            number: cardClean,
            name: cardholderName,
            expirationDate: expiryDate,
            cvv: cvcClean,
          },
          {
            abortEarly: false,
          }
        );

        if (creditCardResult.error == null) {
          const token: any = await new Promise((resolve, reject) => {
            Conekta.Token.create(info, (response: any) => {
              if (response.object === "token") {
                resolve(response);
              } else {
                reject(new Error("Error al crear el token"));
              }
            });
          });

          return token;
        } else {
          if (creditCardResult.error) {
            let validationErrors = [...creditCardResult.error?.details];
            console.error("Validation errors:", validationErrors);
          }
        }
      }
    } catch (error: any) {
      console.log(error);
      if (error.object && error.object === "error") {
        console.error("Error al tokenizar la tarjeta:", error);
      } else {
        console.error("Error con la tarjeta:", error);
      }
    }
  }

  // Validar número de tarjeta con algoritmo de Luhn
  const luhnCheck = (num: string): boolean => {
    let sum = 0;
    let isEven = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  // Validar que la fecha no sea expirada
  const isExpired = (expiryString: string): boolean => {
    const [month, year] = expiryString.split("/");
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expYear = parseInt(year, 10);
    const expMonth = parseInt(month, 10);

    if (expYear < currentYear) return true;
    if (expYear === currentYear && expMonth < currentMonth) return true;
    return false;
  };

  const handleFormatCardNumber = (value: string) => {
    // Remover espacios y caracteres no numéricos
    const cleaned = value.replace(/\D/g, "");
    // Limitar a 16 dígitos
    const limited = cleaned.slice(0, 16);
    // Agregar espacios cada 4 dígitos
    const formatted = limited.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
    // Limpiar error cuando el usuario empieza a escribir
    if (cardErrors.cardNumber) {
      setCardErrors({ ...cardErrors, cardNumber: undefined });
    }
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
    // Limpiar error cuando el usuario empieza a escribir
    if (cardErrors.expiryDate) {
      setCardErrors({ ...cardErrors, expiryDate: undefined });
    }
  };

  const handleFormatCvv = (value: string) => {
    // Solo números, máximo 4 dígitos
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    setCvv(cleaned);
    // Limpiar error cuando el usuario empieza a escribir
    if (cardErrors.cvv) {
      setCardErrors({ ...cardErrors, cvv: undefined });
    }
  };

  const validateCardData = (): boolean => {
    const newErrors: CardErrors = {};

    // Validar número de tarjeta
    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (!cleanCardNumber) {
      newErrors.cardNumber = "El número de tarjeta es requerido";
    } else if (cleanCardNumber.length !== 16) {
      newErrors.cardNumber = "El número de tarjeta debe tener 16 dígitos";
    } else if (!luhnCheck(cleanCardNumber)) {
      newErrors.cardNumber = "El número de tarjeta no es válido";
    }

    // Validar fecha de vencimiento
    if (!expiryDate) {
      newErrors.expiryDate = "La fecha de vencimiento es requerida";
    } else if (expiryDate.length !== 5) {
      newErrors.expiryDate = "La fecha debe estar en formato MM/AA";
    } else {
      const [month] = expiryDate.split("/");
      const monthNum = parseInt(month, 10);
      if (monthNum < 1 || monthNum > 12) {
        newErrors.expiryDate = "El mes debe estar entre 01 y 12";
      } else if (isExpired(expiryDate)) {
        newErrors.expiryDate = "La tarjeta está expirada";
      }
    }

    // Validar CVV
    if (!cvv) {
      newErrors.cvv = "El CVV es requerido";
    } else if (cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = "El CVV debe tener 3 o 4 dígitos";
    }

    // Validar nombre del titular
    if (!cardholderName.trim()) {
      newErrors.cardholderName = "El nombre del titular es requerido";
    } else if (cardholderName.trim().length < 3) {
      newErrors.cardholderName = "El nombre debe tener al menos 3 caracteres";
    } else if (!/^[a-záéíóúñ\s]+$/i.test(cardholderName)) {
      newErrors.cardholderName =
        "El nombre solo puede contener letras y espacios";
    }

    if (Object.keys(newErrors).length > 0) {
      setCardErrors(newErrors);
      return false;
    }

    setCardErrors({});
    return true;
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === "credit_card") {
      if (!validateCardData()) return;
      onConfirm("credit_card");
    } else {
      onConfirm("cash");
    }
  };

  const testTokenization = async () => {
    try {
      const response = await fetch(
        "/api/delivery/getPaymentGateway?signature=CNKT",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      const gateway = { success: response.ok, data: result.data };
      console.log(gateway);

      if (typeof Conekta !== "undefined" && gateway.success) {
        await Conekta.setPublicKey(gateway.data.publicKey);

        const cardClean = "4242424242424242";
        const cvcClean = "123";
        let exp_month = "12";
        let exp_year = "26";
        const cardholderNameTest = "Juan Perez";
        const expiryDateTest = "12/26";

        let info = {
          card: {
            number: cardClean,
            name: cardholderNameTest,
            exp_month: exp_month,
            exp_year: exp_year,
            cvc: cvcClean,
            address: false,
          },
        };

        const creditCardResult: any = CreditCardSchema.validate(
          {
            number: cardClean,
            name: cardholderNameTest,
            expirationDate: expiryDateTest,
            cvv: cvcClean,
          },
          {
            abortEarly: false,
          }
        );

        console.log("info", info);
        console.log("creditCardResult", creditCardResult);

        if (creditCardResult.error == null) {
          const token: any = await new Promise((resolve, reject) => {
            Conekta.Token.create(info, (response: any) => {
              if (response.object === "token") {
                resolve(response);
              } else {
                reject(new Error("Error al crear el token"));
              }
            });
          });
          console.log("token", token);
          return token;
        } else {
          if (creditCardResult.error) {
            let validationErrors = [...creditCardResult.error?.details];
            console.error("Validation errors:", validationErrors);
          }
        }
      }
    } catch (error: any) {
      console.log(error);
      if (error.object && error.object === "error") {
        console.error("Error al tokenizar la tarjeta:", error);
      } else {
        console.error("Error con la tarjeta:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <Script src="https://cdn.conekta.io/js/latest/conekta.js" />

      {/* Spinner overlay durante procesamiento */}
      {(paymentStatus === "processing" || paymentStatus === "success") && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-white/95 p-8 shadow-2xl dark:bg-slate-900/95">
            {paymentStatus === "success" ? (
              <>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400">
                    check_circle
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    ¡Pago Exitoso!
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Tu pedido ha sido confirmado
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="relative h-20 w-20">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-gray-200 border-t-[#8E2653] dark:border-gray-700 dark:border-t-[#8E2653]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-[#8E2653]">
                      credit_card
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Procesando Pago
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Enviando información al banco...
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                    Por favor no cierres esta ventana
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <div
        className="absolute inset-0 z-0 h-full w-full bg-cover bg-center"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 32 32%22 fill=%22none%22%3e%3cpath d=%22M0 .5H31.5V32%22 stroke=%22%23e1e6db%22/%3e%3c/svg%3e")',
        }}
      >
        <div className="absolute inset-0 bg-[#f3f4f6]/90 dark:bg-[#0b141a]/90" />
      </div>

      <div className="relative flex h-full w-full max-w-[450px] max-h-[90vh] flex-col overflow-hidden rounded-xl border border-gray-200/50 bg-white/30 shadow-xl dark:border-[#2a3942] dark:bg-[#111b21]/95">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-2 px-4 py-3 dark:bg-[#202c33] border-b border-transparent dark:border-[#2a3942]">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8E2653] dark:bg-[#00a884] text-white transition-transform hover:scale-105"
            style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#e9edef]">
            Ingresar Pago
          </h1>
          <div className="w-10"></div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 py-4 sm:px-4">
          {/* Errores generales */}
          {errors.length > 0 && (
            <div className="flex flex-col gap-2 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-950/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">
                  error
                </span>
                <p className="font-semibold text-red-800 dark:text-red-300">
                  Errores detectados:
                </p>
              </div>
              <ul className="space-y-1 ml-8">
                {errors.map((error, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-red-700 dark:text-red-200 flex items-start gap-2"
                  >
                    <span className="text-red-600 dark:text-red-400 mt-0.5">
                      •
                    </span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Email Section */}
          <div className="flex flex-col gap-4 rounded-lg p-4 shadow-lg bg-white/60 dark:bg-[#1f2c33] backdrop-blur-[12px] border border-white/20 dark:border-[#2a3942]">
            <label className="flex flex-col">
              <p className="pb-2 text-base font-medium text-slate-900 dark:text-[#e9edef]">
                Correo Electrónico *
              </p>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Limpiar errores cuando el usuario empieza a escribir
                  setErrors([]);
                }}
                className={`h-14 w-full rounded-lg border bg-white/80 dark:bg-[#2a3942] px-4 py-3 text-base font-normal placeholder:text-gray-500 dark:placeholder:text-[#8696a0] focus:outline-none focus:ring-2 text-slate-900 dark:text-[#e9edef] transition-colors ${
                  !email
                    ? "border-gray-300 focus:border-primary focus:ring-primary/50 dark:border-gray-600"
                    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                    ? "border-green-500 focus:border-green-600 focus:ring-green-500/50"
                    : "border-red-500 focus:border-red-600 focus:ring-red-500/50"
                }`}
              />
              {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">
                    error
                  </span>
                  Email inválido. Usa el formato: ejemplo@dominio.com
                </p>
              )}
            </label>
          </div>

          {/* Payment Method Section */}
          <div className="flex flex-col gap-4 rounded-lg p-4 shadow-lg bg-white/60 dark:bg-[#1f2c33] backdrop-blur-[12px] border border-white/20 dark:border-[#2a3942]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#e9edef]">
              Método de Pago
            </h3>

            <fieldset className="grid grid-cols-2 gap-3">
              <legend className="sr-only">Seleccione un método de pago</legend>

              {/* Cash Option */}
              <label
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-white/80 dark:bg-[#2a3942] p-3 transition-all hover:border-primary/50"
                style={{
                  borderColor:
                    paymentMethod === "cash" ? "#8E2653" : "transparent",
                  backgroundColor:
                    paymentMethod === "cash"
                      ? "rgba(142, 38, 83, 0.2)"
                      : undefined,
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 dark:bg-[#1f2c33]">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{
                      color:
                        paymentMethod === "cash" ? "#8E2653" : "text-slate-600",
                    }}
                  >
                    payments
                  </span>
                </div>
                <span className="text-xs font-medium text-center text-slate-800 dark:text-[#e9edef]">
                  Efectivo
                </span>
              </label>
              {/* Credit Card Option */}
              <label
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all dark:bg-[#2a3942]"
                style={{
                  borderColor:
                    paymentMethod === "credit_card" ? "#8E2653" : "transparent",
                  backgroundColor:
                    paymentMethod === "credit_card"
                      ? "rgba(142, 38, 83, 0.2)"
                      : undefined,
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 dark:bg-[#1f2c33]">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ color: "#8E2653" }}
                  >
                    credit_card
                  </span>
                </div>
                <span className="text-xs font-medium text-center text-slate-800 dark:text-[#e9edef]">
                  Tarjeta
                </span>
              </label>
            </fieldset>

            {/* Card Form - Only shown when credit_card is selected */}
            {paymentMethod === "credit_card" && (
              <div className="flex flex-col gap-4 pt-4">
                {/* Card Number */}
                <label className="flex flex-col">
                  <p className="pb-2 text-base font-medium text-slate-900 dark:text-[#e9edef]">
                    Número de Tarjeta
                  </p>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => handleFormatCardNumber(e.target.value)}
                    className={`h-14 w-full rounded-lg border px-4 py-3 text-base font-normal bg-white/80 dark:bg-[#2a3942] placeholder:text-gray-500 dark:placeholder:text-[#8696a0] focus:outline-none focus:ring-2 text-slate-900 dark:text-[#e9edef] transition-colors ${
                      cardErrors.cardNumber
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-gray-300 focus:border-primary focus:ring-primary/50 dark:border-gray-600"
                    } text-slate-900 dark:text-slate-200`}
                  />
                  {cardErrors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">
                        error
                      </span>
                      {cardErrors.cardNumber}
                    </p>
                  )}
                </label>

                {/* Expiry and CVV */}
                <div className="flex flex-row gap-4">
                  <label className="flex flex-col flex-1 min-w-0">
                    <p className="pb-2 text-base font-medium text-slate-900 dark:text-[#e9edef]">
                      Vencimiento
                    </p>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={expiryDate}
                      onChange={(e) => handleFormatExpiryDate(e.target.value)}
                      className={`h-14 w-full rounded-lg border px-4 py-3 text-base font-normal bg-white/80 dark:bg-[#2a3942] placeholder:text-gray-500 dark:placeholder:text-[#8696a0] focus:outline-none focus:ring-2 text-slate-900 dark:text-[#e9edef] transition-colors ${
                        cardErrors.expiryDate
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                          : "border-gray-300 focus:border-primary focus:ring-primary/50 dark:border-gray-600"
                      } text-slate-900 dark:text-slate-200`}
                    />
                    {cardErrors.expiryDate && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">
                          error
                        </span>
                        {cardErrors.expiryDate}
                      </p>
                    )}
                  </label>

                  <label className="flex flex-col flex-1 min-w-0">
                    <p className="pb-2 text-base font-medium text-slate-900 dark:text-[#e9edef]">
                      CVV
                    </p>
                    <input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => handleFormatCvv(e.target.value)}
                      className={`h-14 w-full rounded-lg border px-4 py-3 text-base font-normal bg-white/80 dark:bg-[#2a3942] placeholder:text-gray-500 dark:placeholder:text-[#8696a0] focus:outline-none focus:ring-2 text-slate-900 dark:text-[#e9edef] transition-colors ${
                        cardErrors.cvv
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                          : "border-gray-300 focus:border-primary focus:ring-primary/50 dark:border-gray-600"
                      } text-slate-900 dark:text-slate-200`}
                    />
                    {cardErrors.cvv && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">
                          error
                        </span>
                        {cardErrors.cvv}
                      </p>
                    )}
                  </label>
                </div>

                {/* Cardholder Name */}
                <label className="flex flex-col">
                  <p className="pb-2 text-base font-medium text-slate-900 dark:text-[#e9edef]">
                    Nombre del Titular
                  </p>
                  <input
                    type="text"
                    placeholder="Nombre como aparece en la tarjeta"
                    value={cardholderName}
                    onChange={(e) => {
                      setCardholderName(e.target.value);
                      if (cardErrors.cardholderName) {
                        setCardErrors({
                          ...cardErrors,
                          cardholderName: undefined,
                        });
                      }
                    }}
                    className={`h-14 w-full rounded-lg border px-4 py-3 text-base font-normal bg-white/80 dark:bg-[#2a3942] placeholder:text-gray-500 dark:placeholder:text-[#8696a0] focus:outline-none focus:ring-2 text-slate-900 dark:text-[#e9edef] transition-colors ${
                      cardErrors.cardholderName
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-gray-300 focus:border-primary focus:ring-primary/50 dark:border-gray-600"
                    } text-slate-900 dark:text-slate-200`}
                  />
                  {cardErrors.cardholderName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">
                        error
                      </span>
                      {cardErrors.cardholderName}
                    </p>
                  )}
                </label>
              </div>
            )}

            {/* Cash Option Message */}
            {paymentMethod === "cash" && (
              <div className="flex flex-col gap-3 rounded-lg border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-950/20 p-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Efectivo
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Pagarás en efectivo al momento de la entrega.
                </p>
              </div>
            )}
          </div>

          {/* Total Amount Section */}
          <div className="flex flex-col gap-4 rounded-lg p-4 shadow-lg bg-white/60 dark:bg-[#1f2c33] backdrop-blur-[12px] border border-white/20 dark:border-[#2a3942]">
            {/* Row 1: Orden */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-300/50 dark:border-[#2a3942]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-600 dark:text-[#8696a0] text-lg">
                  shopping_cart
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-[#e9edef]">
                  Subtotal
                </span>
              </div>
              <span className="text-base font-semibold text-slate-900 dark:text-[#e9edef]">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Row 2: Delivery */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-300/50 dark:border-[#2a3942]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-600 dark:text-[#8696a0] text-lg">
                  local_shipping
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-[#e9edef]">
                  Envío
                </span>
              </div>
              <span className="text-base font-semibold text-slate-900 dark:text-[#e9edef]">
                $
                {parseFloat(
                  deliveryStore.quoteData?.overloadAmountFee.toString() || "0.0"
                ).toFixed(2)}
              </span>
            </div>

            {/* Row 3: Total */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8E2653] dark:text-[#00a884] text-lg">
                  account_balance_wallet
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-[#e9edef]">
                  Total a Pagar
                </span>
              </div>
              <span className="text-xl font-bold text-[#8E2653] dark:text-[#00a884]">
                $
                {(
                  (totalAmount || 0) +
                  parseFloat(
                    deliveryStore.quoteData?.overloadAmountFee.toString() ||
                      "0.0"
                  )
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </main>

        {/* Footer with Confirm Button */}
        <footer className="shrink-0 border-t border-gray-200/50 dark:border-[#2a3942] bg-white/30 dark:bg-[#202c33] px-2 py-4 sm:px-4">
          {paymentMethod === "credit_card" &&
            Object.keys(cardErrors).length > 0 && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 px-4 py-2">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                  warning
                </span>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Por favor revisa los errores en el formulario
                </p>
              </div>
            )}
          <button
            onClick={handleProcess}
            disabled={
              disable ||
              !email ||
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
              (paymentMethod === "credit_card" &&
                Object.keys(cardErrors).length > 0)
            }
            className="flex h-16 w-full items-center justify-center rounded-lg text-lg font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-[#8E2653] dark:bg-[#00a884]"
            style={{
              boxShadow: "0 8px 16px rgba(142, 38, 83, 0.3)",
            }}
          >
            {paymentStatus === "processing" && "Procesando pago..."}
            {paymentStatus === "success" && "✓ Pago Enviado"}
            {paymentStatus === "failed" && "Pago Rechazado"}
            {paymentStatus === "idle" && "Confirmar Pago"}
          </button>
          {/* <button
            onClick={testTokenization}
            className="mt-3 w-full text-center text-sm text-slate-600 hover:underline dark:text-slate-400"
          >
            test tokenization
          </button> */}
        </footer>
      </div>
    </div>
  );
}
