"use client";

import { useState, useEffect } from "react";
import { IMenuItem, IModifier, IModifierGroup } from "@/types/menu";
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

interface SelectedModifier {
  groupCode: string;
  selectedModifier: IModifier | null;
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
  const [selectedModifiers, setSelectedModifiers] = useState<
    SelectedModifier[]
  >(
    item.modifiers?.map((group) => ({
      groupCode: group.group_code,
      selectedModifier: null,
    })) || []
  );

  const addItem = useCartStore((state) => state.addItem);

  // Actualizar valores cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity);
      setSelectedModifiers(
        item.modifiers?.map((group) => ({
          groupCode: group.group_code,
          selectedModifier: null,
        })) || []
      );
    }
  }, [isOpen]);

  // Calcular precio total basado en modificadores seleccionados
  const calculateTotalPrice = () => {
    let price = parseFloat(item.dish_price);

    // Agregar precios de modificadores seleccionados
    selectedModifiers.forEach((selected) => {
      if (selected.selectedModifier) {
        price += selected.selectedModifier.mod_price;
      }
    });

    return price * quantity;
  };

  const handleModifierClick = (groupCode: string, modifier: IModifier) => {
    setSelectedModifiers((prev) =>
      prev.map((selected) => {
        if (selected.groupCode === groupCode) {
          return {
            ...selected,
            selectedModifier:
              selected.selectedModifier?.modifier_id === modifier.modifier_id
                ? null
                : modifier,
          };
        }
        return selected;
      })
    );
  };

  const isModifierSelected = (groupCode: string, modifier: IModifier) => {
    const groupSelection = selectedModifiers.find(
      (s) => s.groupCode === groupCode
    );
    return (
      groupSelection?.selectedModifier?.modifier_id === modifier.modifier_id
    );
  };

  const handleAddToCart = () => {
    // Convertir selectedModifiers al formato ICartModifier
    const cartModifiers: ICartModifier[] = [];

    selectedModifiers.forEach((selected) => {
      if (selected.selectedModifier) {
        cartModifiers.push({
          modifierId: selected.selectedModifier.modifier_id.toString(),
          modifierName: selected.selectedModifier.group_code,
          optionName: selected.selectedModifier.mod_name,
          priceAdjustment: selected.selectedModifier.mod_price,
        });
      }
    });

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

          {/* Modifiers Section */}
          {item.modifiers && item.modifiers.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Adicionales
              </h2>

              <div className="space-y-5">
                {item.modifiers.map((group) => (
                  <div key={group.group_code} className="flex flex-col gap-3">
                    {/* Group Title */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {group.group_code}
                      </h3>
                      <span className="text-xs text-gray-500">Opcional</span>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {group.options?.map((modifier) => {
                        const isSelected = isModifierSelected(
                          group.group_code,
                          modifier
                        );

                        return (
                          <button
                            key={modifier.modifier_id}
                            onClick={() =>
                              handleModifierClick(group.group_code, modifier)
                            }
                            className={`
                              w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200
                              ${
                                isSelected
                                  ? "border-[#65A30D] bg-green-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`
                                  w-5 h-5 rounded border-2 flex items-center justify-center
                                  ${
                                    isSelected
                                      ? "border-[#65A30D] bg-[#65A30D]"
                                      : "border-gray-300"
                                  }
                                `}
                              >
                                {isSelected && (
                                  <span className="text-white text-xs">✓</span>
                                )}
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">
                                  {modifier.mod_name}
                                </p>
                                {modifier.mod_description && (
                                  <p className="text-xs text-gray-500">
                                    {modifier.mod_description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-[#65A30D]">
                              {modifier.mod_price > 0
                                ? `+$${modifier.mod_price.toFixed(2)}`
                                : "Gratis"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
