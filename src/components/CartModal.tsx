import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useDeliveryStore } from "@/stores/deliveryStore";
import { useOrderStore } from "@/stores/orderStore";
import { ICartItem } from "@/types/cart";
import ProductModal from "./menuDigital/ProductModal";
import DeliveryAddressModal, { DeliveryAddress } from "./DeliveryAddressModal";
import PaymentModal, { PaymentData } from "./PaymentModal";
import OrderConfirmationScreen from "./OrderConfirmationScreen";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } =
    useCartStore();
  const { address: deliveryAddress } = useDeliveryStore();
  const { setOrder } = useOrderStore();
  const [editingItem, setEditingItem] = useState<ICartItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleEditItem = (item: ICartItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  // Convertir modificadores del carrito al formato del ProductModal
  const getInitialModifiers = (cartItem: ICartItem) => {
    const modifiers: { [key: string]: string | string[] } = {};

    // TODO: Actualizar cuando se implemente la nueva estructura de modificadores v2
    // cartItem.menuItem.modifiers?.forEach((modifier) => {
    //   const cartModifiers = cartItem.modifiers.filter(
    //     (mod) => mod.modifierId === modifier.modifier_id.toString()
    //   );

    //   if (cartModifiers.length > 0) {
    //     modifiers[modifier.modifier_id.toString()] = cartModifiers.map(
    //       (mod) => mod.optionName
    //     );
    //   }
    // });

    return modifiers;
  };

  const handleDeleteItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleFinalizePurchase = () => {
    setIsAddressModalOpen(true);
  };

  const handleAddressConfirm = (address: DeliveryAddress) => {
    console.log("Dirección confirmada:", address);
    // Pasar a la pantalla de pago
    setIsAddressModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = (paymentData: PaymentData) => {
    console.log("Pago confirmado:", paymentData);
    console.log("Dirección de entrega:", deliveryAddress);
    console.log("Productos del pedido:", items);

    if (!deliveryAddress) {
      alert("Error: No hay dirección de entrega");
      return;
    }

    // Generar número de pedido único
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Calcular fechas
    const now = new Date();
    const estimatedDeliveryDate = new Date(
      now.getTime() + 3 * 24 * 60 * 60 * 1000
    ); // 3 días

    // Calcular totales
    const subtotal = getTotalPrice();
    const taxes = subtotal * 0.08;
    const total = subtotal + taxes;

    // Crear el orden
    const order = {
      orderNumber,
      items,
      deliveryAddress,
      subtotal,
      taxes,
      total,
      paymentMethod: paymentData.paymentMethod,
      createdAt: now,
      estimatedDeliveryDate,
    };

    // Guardar orden en store
    setOrder(order);

    // Mostrar pantalla de confirmación
    setIsPaymentModalOpen(false);
    setShowConfirmation(true);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    onClose();
  };

  const formatModifiers = (modifiers: any[]) => {
    return modifiers.map((mod) => mod.optionName).join(", ");
  };

  const subtotal = getTotalPrice();
  const taxes = subtotal * 0.08;
  const total = subtotal + taxes;

  if (!isOpen) return null;

  // Si está mostrando la confirmación, mostrar esa pantalla en lugar del carrito
  if (showConfirmation) {
    return <OrderConfirmationScreen onClose={handleConfirmationClose} />;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className="relative flex h-full max-h-[900px] w-full max-w-[450px] flex-col overflow-hidden rounded-xl soft-shadow"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-2 p-4">
          <button
            onClick={onClose}
            className="bg-[#8E2653] flex h-12 w-12 items-center justify-center rounded-full text-white dark:text-white soft-shadow transition-all active:soft-shadow-inset"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-2xl font-black tracking-tight text-text-light dark:text-text-dark">
            Tu Pedido
          </h1>
          <div className="w-12"></div>
        </header>

        {/* Order Items List */}
        <main className="flex-1 overflow-y-auto p-4 pt-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="material-symbols-outlined text-6xl text-text-muted-light dark:text-text-muted-dark mb-4">
                shopping_cart
              </span>
              <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-text-muted-light dark:text-text-muted-dark">
                Agrega algunos productos para comenzar tu pedido
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-lg p-4"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="h-[70px] w-[70px] shrink-0 rounded-lg bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url("${
                          item.menuItem.image || "/placeholder-image.jpg"
                        }")`,
                      }}
                    />
                    <div className="flex flex-1 flex-col justify-center">
                      <p
                        className="text-base font-bold leading-normal"
                        style={{ color: "#151811" }}
                      >
                        {item.menuItem.dish_name}
                      </p>
                      <p
                        className="text-sm font-normal leading-normal"
                        style={{ color: "#6b7280" }}
                      >
                        Cantidad: {item.quantity}
                        {item.modifiers.length > 0 &&
                          `, ${formatModifiers(item.modifiers)}`}
                      </p>
                      <p
                        className="mt-1 text-sm font-medium"
                        style={{ color: "#151811" }}
                      >
                        ${item.totalPrice.toLocaleString()}
                        {item.quantity > 1 && (
                          <span style={{ color: "#6b7280" }}>
                            {` ($${(
                              item.totalPrice / item.quantity
                            ).toLocaleString()} c/u)`}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex justify-end gap-3 border-t pt-3"
                    style={{ borderTopColor: "rgba(255, 255, 255, 0.2)" }}
                  >
                    <button
                      onClick={() => handleEditItem(item)}
                      className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold soft-shadow transition-all active:soft-shadow-inset"
                      style={{
                        color: "#6b7280",
                        backgroundColor: "rgba(255, 255, 255, 0.6)",
                      }}
                    >
                      <span className="material-symbols-outlined text-base">
                        edit
                      </span>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold soft-shadow transition-all active:soft-shadow-inset"
                      style={{
                        color: "#6b7280",
                        backgroundColor: "rgba(255, 255, 255, 0.6)",
                      }}
                    >
                      <span className="material-symbols-outlined text-base">
                        delete
                      </span>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Footer with Summary and CTA */}
        {items.length > 0 && (
          <footer className="shrink-0 space-y-4 p-4">
            <div
              className="space-y-2 rounded-lg p-4 soft-shadow-inset"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              <div
                className="flex justify-between text-sm"
                style={{ color: "#6b7280" }}
              >
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div
                className="flex justify-between text-sm"
                style={{ color: "#6b7280" }}
              >
                <span>Impuestos (8%)</span>
                <span>${taxes.toLocaleString()}</span>
              </div>
              <div
                className="flex justify-between text-lg font-bold"
                style={{ color: "#151811" }}
              >
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleFinalizePurchase}
              className="h-14 w-full rounded-lg text-lg font-bold text-white shadow-[0_4px_14px_0_rgb(101,163,13,0.39)] transition-all hover:shadow-[0_6px_20px_0_rgb(101,163,13,0.23)]"
              style={{ backgroundColor: "#65A30D" }}
            >
              Ordenar
            </button>
          </footer>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingItem && (
        <ProductModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          item={editingItem.menuItem}
          initialQuantity={editingItem.quantity}
          initialModifiers={getInitialModifiers(editingItem)}
          isEditing={true}
        />
      )}

      {/* Delivery Address Modal */}
      <DeliveryAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handleAddressConfirm}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={total}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}
