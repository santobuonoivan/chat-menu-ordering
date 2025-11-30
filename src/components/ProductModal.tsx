"use client";

import { useState } from "react";
import { MenuItem, Modifier, ModifierOption } from "@/types/menu";
import { CartModifier } from "@/types/cart";
import { useCartStore } from "@/stores/cartStore";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
}

export default function ProductModal({
  isOpen,
  onClose,
  item,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<{
    [key: string]: string | string[];
  }>({});
  
  const addItem = useCartStore((state) => state.addItem);

  // Calcular precio total basado en modificadores seleccionados
  const calculateTotalPrice = () => {
    let price = item.price;

    item.modifiers?.forEach((modifier) => {
      if (selectedModifiers[modifier.modifierId]) {
        const selected = selectedModifiers[modifier.modifierId];

        if (Array.isArray(selected)) {
          // Para checkboxes (múltiples selecciones)
          selected.forEach((optionName) => {
            const option = modifier.options.find(
              (opt) => opt.name === optionName
            );
            if (option) price += option.priceAdjustment;
          });
        } else {
          // Para radio buttons (una sola selección)
          const option = modifier.options.find((opt) => opt.name === selected);
          if (option) price += option.priceAdjustment;
        }
      }
    });

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
    // Convertir selectedModifiers al formato CartModifier
    const cartModifiers: CartModifier[] = [];
    
    item.modifiers?.forEach((modifier) => {
      const selected = selectedModifiers[modifier.modifierId];
      if (selected) {
        if (Array.isArray(selected)) {
          // Para checkboxes (múltiples selecciones)
          selected.forEach((optionName) => {
            const option = modifier.options.find(opt => opt.name === optionName);
            if (option) {
              cartModifiers.push({
                modifierId: modifier.modifierId,
                modifierName: modifier.name,
                optionName: option.name,
                priceAdjustment: option.priceAdjustment
              });
            }
          });
        } else {
          // Para radio buttons (una sola selección)
          const option = modifier.options.find(opt => opt.name === selected);
          if (option) {
            cartModifiers.push({
              modifierId: modifier.modifierId,
              modifierName: modifier.name,
              optionName: option.name,
              priceAdjustment: option.priceAdjustment
            });
          }
        }
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
      className="fixed inset-0 z-50 flex items-start justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className="relative w-full max-w-[450px] overflow-hidden rounded-xl pb-20 mt-8"
        style={{
          backgroundColor: "#f7f8f6",
        }}
      >
        {/* Header Image */}
        <div
          className="w-full h-48 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: `url("${item.imageUrl}")` }}
        />

        <div className="p-6">
          {/* Product Info */}
          <div className="mb-6">
            <h1 className="text-gray-900 text-2xl font-bold mb-2">
              {item.name}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {item.description}
            </p>
            <p className="text-gray-900 text-2xl font-bold">
              ${item.price.toFixed(2)}
            </p>
          </div>

          {/* Modifiers */}
          {item.modifiers?.map((modifier, modifierIndex) => (
            <div key={modifier.modifierId} className="mb-6">
              {/* Modifier Header */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-gray-900 text-lg font-semibold">
                  {modifier.name}
                </h2>
                <span
                  className="text-xs font-medium px-2 py-1 rounded text-gray-600"
                  style={{ backgroundColor: "#e5e7eb" }}
                >
                  {modifier.isRequired ? "Obligatorio" : "Opcional"}
                </span>
              </div>

              {/* Modifier Options */}
              <div className="space-y-2">
                {modifier.options.map((option) => {
                  const isSelected =
                    modifier.maxOptions === 1
                      ? selectedModifiers[modifier.modifierId] === option.name
                      : (
                          selectedModifiers[modifier.modifierId] as string[]
                        )?.includes(option.name) || false;

                  return (
                    <label
                      key={option.name}
                      className="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all"
                      style={{
                        borderColor: isSelected ? "#65A30D" : "#e5e7eb",
                        backgroundColor: isSelected
                          ? "rgba(101, 163, 13, 0.1)"
                          : "#ffffff",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {option.imageUrl && (
                          <img
                            className="h-8 w-8 rounded object-cover"
                            src={option.imageUrl}
                            alt={option.name}
                          />
                        )}
                        <div>
                          <p className="text-gray-900 text-sm font-medium">
                            {option.name}
                          </p>
                          {option.priceAdjustment > 0 && (
                            <p className="text-gray-600 text-xs">
                              +${option.priceAdjustment.toFixed(2)}
                            </p>
                          )}
                          {option.priceAdjustment === 0 && (
                            <p className="text-gray-600 text-xs">Base</p>
                          )}
                        </div>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: isSelected ? "#65A30D" : "#d1d5db",
                          backgroundColor: isSelected
                            ? "#65A30D"
                            : "transparent",
                        }}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <input
                        type={modifier.maxOptions === 1 ? "radio" : "checkbox"}
                        name={
                          modifier.maxOptions === 1
                            ? `modifier-${modifier.modifierId}`
                            : undefined
                        }
                        checked={isSelected}
                        onChange={(e) =>
                          handleModifierChange(
                            modifier.modifierId,
                            option.name,
                            modifier.maxOptions === 1,
                            e.target.checked
                          )
                        }
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
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
