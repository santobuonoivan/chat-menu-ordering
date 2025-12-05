"use client";

import { useEffect } from "react";
import { useOrderStore, Order } from "@/stores/orderStore";
import { useCartStore } from "@/stores/cartStore";

interface OrderConfirmationScreenProps {
  onClose: () => void;
}

export default function OrderConfirmationScreen({
  onClose,
}: OrderConfirmationScreenProps) {
  const order = useOrderStore((state) => state.getOrder());
  const resetCart = useCartStore((state) => state.resetCart);

  useEffect(() => {
    // Limpiar el carrito cuando se muestra la confirmación
    resetCart();
  }, [resetCart]);

  if (!order) {
    return null;
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleViewOrderStatus = () => {
    // TODO: Navegar a página de estado del pedido
    console.log("Ver estado del pedido:", order.orderNumber);
  };

  const handleBackToChat = () => {
    onClose();
  };

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark group/design-root overflow-hidden p-4 sm:p-6"
      style={{
        backgroundImage:
          "radial-gradient(circle at top left, hsla(90, 70%, 80%, 0.2), transparent 40%), radial-gradient(circle at bottom right, hsla(90, 70%, 80%, 0.2), transparent 40%)",
      }}
    >
      <div className="layout-container flex h-full grow w-full max-w-[450px] flex-col">
        <div className="flex flex-1 flex-col items-center justify-center py-5">
          <div className="layout-content-container flex w-full flex-col items-center gap-6">
            {/* Confirmation Icon */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/30">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <span className="material-symbols-outlined text-4xl text-white">
                  check
                </span>
              </div>
            </div>

            {/* Headline & Body Text */}
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-[#151811] dark:text-white tracking-tight text-[32px] font-bold leading-tight">
                ¡Tu pedido está confirmado!
              </h1>
              <p className="text-[#151811]/80 dark:text-white/80 text-base font-normal leading-normal max-w-sm">
                Gracias por tu compra. Te mantendremos informado sobre el estado
                de tu envío.
              </p>
            </div>

            {/* Order Details Card */}
            <div
              className="w-full rounded-xl border border-black/5 dark:border-white/10 p-6 soft-shadow"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-x-6">
                  <p className="text-[#798961] dark:text-gray-300 text-sm font-normal leading-normal">
                    Número de pedido
                  </p>
                  <p className="text-[#151811] dark:text-white text-sm font-medium leading-normal text-right">
                    {order.orderNumber}
                  </p>
                </div>
                <div className="flex justify-between gap-x-6">
                  <p className="text-[#798961] dark:text-gray-300 text-sm font-normal leading-normal">
                    Total pagado
                  </p>
                  <p className="text-[#151811] dark:text-white text-sm font-medium leading-normal text-right">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between gap-x-6">
                  <p className="text-[#798961] dark:text-gray-300 text-sm font-normal leading-normal">
                    Entrega estimada
                  </p>
                  <p className="text-[#151811] dark:text-white text-sm font-medium leading-normal text-right">
                    {formatDate(order.estimatedDeliveryDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Item Summary Card */}
            <div
              className="w-full rounded-xl border border-black/5 dark:border-white/10 p-6 flex flex-col gap-4 soft-shadow"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <h3 className="text-[#151811] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                Resumen de artículos
              </h3>
              <div className="flex flex-col gap-2">
                {order.items.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-center gap-4 min-h-[72px] py-2 justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-14"
                          style={{
                            backgroundImage: `url("${
                              item.menuItem.image || "/placeholder-image.jpg"
                            }")`,
                          }}
                        />
                        <div className="flex flex-col justify-center">
                          <p className="text-[#151811] dark:text-white text-base font-medium leading-normal line-clamp-1">
                            {item.menuItem.dish_name}
                          </p>
                          <p className="text-[#798961] dark:text-gray-300 text-sm font-normal leading-normal line-clamp-2">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <p className="text-[#151811] dark:text-white text-base font-normal leading-normal">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {index < order.items.length - 1 && (
                      <div className="w-full h-px bg-black/10 dark:bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address Card */}
            <div
              className="w-full rounded-xl border border-black/5 dark:border-white/10 p-6 flex flex-col gap-3 soft-shadow"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <h3 className="text-[#151811] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                Dirección de entrega
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">
                    phone
                  </span>
                  <p className="text-[#151811] dark:text-white text-sm font-medium">
                    {order.deliveryAddress.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[#151811] dark:text-white text-sm font-medium">
                    {order.deliveryAddress.street}{" "}
                    {order.deliveryAddress.streetNumber}
                  </p>
                  {order.deliveryAddress.references && (
                    <p className="text-[#798961] dark:text-gray-300 text-xs font-normal">
                      Apto/Depto: {order.deliveryAddress.references}
                    </p>
                  )}
                </div>
                <p className="text-[#798961] dark:text-gray-300 text-sm font-normal">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                  {order.deliveryAddress.zip}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div
              className="w-full rounded-xl border border-black/5 dark:border-white/10 p-6 flex flex-col gap-2 soft-shadow"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p className="text-[#798961] dark:text-gray-300 text-sm font-normal">
                Método de pago
              </p>
              <p className="text-[#151811] dark:text-white text-sm font-medium">
                {order.paymentMethod === "credit_card"
                  ? "Tarjeta de Crédito"
                  : "Efectivo"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-3 pt-4">
              <button
                onClick={handleViewOrderStatus}
                className="flex items-center justify-center gap-2 h-14 w-full rounded-full bg-primary text-white font-bold text-base leading-normal transition-transform duration-200 ease-in-out hover:scale-[1.02] active:scale-95"
              >
                Ver Estado del Pedido
              </button>
              <button
                onClick={handleBackToChat}
                className="flex items-center justify-center gap-2 h-14 w-full rounded-full bg-primary/20 dark:bg-primary/30 text-primary dark:text-green-200 font-bold text-base leading-normal transition-colors duration-200 hover:bg-primary/30 dark:hover:bg-primary/40"
              >
                Volver al Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
