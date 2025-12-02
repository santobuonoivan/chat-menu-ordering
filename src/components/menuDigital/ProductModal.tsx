"use client";

import { useState, useEffect } from "react";
import { IMenuItem, IModifier } from "@/types/menu";
import { ICartModifier } from "@/types/cart";
import { useCartStore } from "@/stores/cartStore";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: IMenuItem;
  initialQuantity?: number;
  initialModifiers?: {
    [key: string]: string | string[];
  };
  isEditing?: boolean;
}

export default function ProductModal({
  isOpen,
  onClose,
  item,
  initialQuantity = 1,
  initialModifiers = {},
  isEditing = false,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedModifiers, setSelectedModifiers] = useState<{
    [key: string]: string | string[];
  }>(initialModifiers);

  const addItem = useCartStore((state) => state.addItem);

  // Actualizar valores cuando cambie el modal o los datos iniciales
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity);
      setSelectedModifiers(initialModifiers);
    }
  }, [isOpen, initialQuantity, initialModifiers]);

  // Calcular precio total basado en modificadores seleccionados
  const calculateTotalPrice = () => {
    let price = parseFloat(item.dish_price);

    // TODO: Implementar lógica de modificadores v2 cuando sea necesario
    // item.modifiers?.forEach((modifier) => {
    //   // Nueva lógica para modificadores v2
    // });

    return price * quantity;
  };

  const handleModifierChange = (
    modifierId: string,
    optionName: string,
    isRadio: boolean,
    checked: boolean
  ) => {
    setSelectedModifiers((prev) => {
      const newModifiers = { ...prev };

      if (isRadio) {
        newModifiers[modifierId] = optionName;
      } else {
        // Checkbox
        if (!newModifiers[modifierId]) newModifiers[modifierId] = [];
        const currentArray = newModifiers[modifierId] as string[];

        if (checked) {
          newModifiers[modifierId] = [...currentArray, optionName];
        } else {
          newModifiers[modifierId] = currentArray.filter(
            (name) => name !== optionName
          );
        }
      }

      return newModifiers;
    });
  };

  const handleAddToCart = () => {
    // Convertir selectedModifiers al formato ICartModifier
    const cartModifiers: ICartModifier[] = [];

    // TODO: Implementar lógica de modificadores v2 cuando sea necesario
    // item.modifiers?.forEach((modifier) => {
    //   // Nueva lógica para modificadores v2
    // });

    addItem(item, cartModifiers, quantity);
    onClose();
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  if (!isOpen) return null;

  const finalPrice = calculateTotalPrice();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className="relative w-full max-w-[450px] rounded-xl pb-20 mt-8 mb-8"
        style={{
          backgroundColor: "#f7f8f6",
        }}
      >
        {/* Header Image */}
        <div
          className="w-full h-48 bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url("${item.image || "/placeholder-image.jpg"}")`,
          }}
        />

        <div className="p-6">
          {/* Product Info */}
          <div className="mb-6">
            <h1 className="text-gray-900 text-2xl font-bold mb-2">
              {item.dish_name}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {item.description}
            </p>
            <p className="text-gray-900 text-2xl font-bold">
              ${parseFloat(item.dish_price).toFixed(2)}
            </p>
          </div>

          {/* Modifiers - Temporalmente comentado para v2 */}
          {/* TODO: Implementar modificadores v2 cuando sea necesario */}
        </div>

        {/* Sticky Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between gap-3"
          style={{
            backgroundColor: "#f7f8f6",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {/* Quantity Stepper */}
          <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-1">
            <button
              onClick={decreaseQuantity}
              className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-300"
            >
              <span className="material-symbols-outlined text-lg">remove</span>
            </button>
            <span className="w-8 text-center text-sm font-semibold text-gray-900">
              {quantity}
            </span>
            <button
              onClick={increaseQuantity}
              className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-300"
            >
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex-grow text-white font-semibold py-3 px-4 rounded-lg text-sm"
            style={{ backgroundColor: "#65A30D" }}
          >
            Añadir al Carrito - ${finalPrice.toFixed(2)}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full text-white bg-black bg-opacity-50 hover:bg-opacity-70"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
}
