import { useState } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useCartStore } from "@/stores/cartStore";
import { IMenuItem, IModifier } from "@/types/menu";
import { ICartModifier } from "@/types/cart";
import { generateUUID } from "@/utils";

interface ModifierChatProps {
  item: IMenuItem;
  modifiers: IModifier[];
  action: string;
}

interface SelectedModifier {
  modifierId: number;
  selectedModifier: IModifier | null;
}

export default function ModifierChatCard({
  item,
  modifiers,
  action,
}: ModifierChatProps) {
  const { addMessage, setShowListModifiers } = useChatStore();
  const { addItem } = useCartStore();

  // Agrupar modificadores por group_code
  const modifierGroups = modifiers.reduce((groups, modifier) => {
    if (!modifier) return groups;
    const groupKey = modifier.group_code;
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(modifier);
    return groups;
  }, {} as Record<string, IModifier[]>);

  const [selectedModifiers, setSelectedModifiers] = useState<
    SelectedModifier[]
  >(
    Object.keys(modifierGroups).map((groupCode) => ({
      modifierId: modifierGroups[groupCode][0]?.modifier_id || 0,
      selectedModifier: null,
    }))
  );

  const handleOptionClick = (groupCode: string, modifier: IModifier) => {
    setSelectedModifiers((prev) =>
      prev.map((selected) => {
        const groupModifiers = modifierGroups[groupCode];
        const isInGroup = groupModifiers.some(
          (m) => m.modifier_id === selected.modifierId
        );

        if (isInGroup) {
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

  const isOptionSelected = (modifier: IModifier) => {
    return selectedModifiers.some(
      (selected) =>
        selected.selectedModifier?.modifier_id === modifier.modifier_id
    );
  };

  const canAddToCart = () => {
    return true; // En v2 no hay modificadores obligatorios definidos
  };

  const handleAddToCart = async () => {
    if (!canAddToCart()) return;

    setShowListModifiers(false);

    // Convertir modificadores seleccionados al formato del carrito
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

    // Agregar al carrito con los modificadores seleccionados
    addItem(item, cartModifiers, 1);

    addMessage({
      id: generateUUID(),
      text: `He agregado ${
        cartModifiers.length > 0 ? "los adicionales a tu" : ""
      } ${item.dish_name} al carrito. ¿Puedo ayudarte con algo más?`,
      sender: "assistant",
      timestamp: new Date(),
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
      {/* Header del producto */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-slate-600">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0">
          <img
            src={item.image || "/placeholder-image.jpg"}
            alt={item.dish_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {item.dish_name}
          </h4>
          <p className="text-sm font-semibold text-[#65A30D]">
            ${parseFloat(item.dish_price).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Lista de grupos de modificadores */}
      {Object.entries(modifierGroups).map(([groupCode, groupModifiers]) => (
        <div key={groupCode} className="flex flex-col gap-2">
          {/* Título del grupo */}
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
              {groupCode}
            </h5>
            <span className="text-xs text-gray-500">Opcional</span>
          </div>

          {/* Lista de opciones del grupo */}
          <div className="flex flex-col gap-2">
            {groupModifiers.map((modifier) => {
              const isSelected = isOptionSelected(modifier);

              return (
                <button
                  key={modifier.modifier_id}
                  onClick={() => handleOptionClick(groupCode, modifier)}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                    ${
                      isSelected
                        ? "border-[#65A30D] bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 cursor-pointer"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {modifier.mod_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#65A30D]">
                      {modifier.mod_price > 0
                        ? `+$${modifier.mod_price.toLocaleString()}`
                        : "Gratis"}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[#65A30D] text-lg">
                        check_circle
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Botón agregar */}
      <button
        onClick={handleAddToCart}
        disabled={!canAddToCart()}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold text-white 
          ${
            canAddToCart()
              ? "bg-[#65A30D] hover:bg-green-600 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          }
        `}
      >
        Agregar al Carrito
      </button>
    </div>
  );
}
