import { useState } from "react";
import { useChatStore } from "@/stores/chatStore";
import { IMenuItem, IModifier, IModifierOption } from "@/types/menu";
import { generateUUID, sleep } from "@/utils";

interface ModifierChatProps {
  item: IMenuItem;
  modifiers: IModifier[];
  action: string;
}

interface SelectedModifier {
  modifierId: string;
  selectedOptions: IModifierOption[];
}

export default function ModifierChatCard({
  item,
  modifiers,
  action,
}: ModifierChatProps) {
  const { messages, addMessage, setShowListModifiers, showListModifiers } =
    useChatStore();
  const [selectedModifiers, setSelectedModifiers] = useState<
    SelectedModifier[]
  >(
    modifiers.map((modifier) => ({
      modifierId: modifier.modifierId,
      selectedOptions: [],
    }))
  );

  const handleOptionClick = (modifierId: string, option: IModifierOption) => {
    setSelectedModifiers((prev) =>
      prev.map((selected) => {
        if (selected.modifierId === modifierId) {
          const modifier = modifiers.find((m) => m.modifierId === modifierId);
          const isOptionSelected = selected.selectedOptions.some(
            (opt) => opt.name === option.name
          );

          if (isOptionSelected) {
            // Deseleccionar opción
            return {
              ...selected,
              selectedOptions: selected.selectedOptions.filter(
                (opt) => opt.name !== option.name
              ),
            };
          } else {
            // Seleccionar opción
            const newOptions = [...selected.selectedOptions];

            // Si es de selección única (maxOptions = 1), reemplazar
            if (modifier?.maxOptions === 1) {
              return {
                ...selected,
                selectedOptions: [option],
              };
            }

            // Si alcanzó el máximo, no agregar más
            if (modifier && newOptions.length >= modifier.maxOptions) {
              return selected;
            }

            newOptions.push(option);
            return {
              ...selected,
              selectedOptions: newOptions,
            };
          }
        }
        return selected;
      })
    );
  };

  const isOptionSelected = (modifierId: string, option: IModifierOption) => {
    const selected = selectedModifiers.find((s) => s.modifierId === modifierId);
    return (
      selected?.selectedOptions.some((opt) => opt.name === option.name) || false
    );
  };

  const canAddToCart = () => {
    return modifiers.every((modifier) => {
      const selected = selectedModifiers.find(
        (s) => s.modifierId === modifier.modifierId
      );
      if (modifier.isRequired) {
        return selected && selected.selectedOptions.length > 0;
      }
      return true;
    });
  };

  const handleAddToCart = async () => {
    if (!canAddToCart()) return;

    const config = {
      item: item,
      selectedModifiers: selectedModifiers.filter(
        (s) => s.selectedOptions.length > 0
      ),
      action: action,
    };

    console.log("Configuración de modificadores:", config);
    setShowListModifiers(false);
    addMessage({
      id: generateUUID(),
      text: `He agregardo los adicionales a tu ${item.name}. Puedo ayudarte con algo más?`,
      sender: "user",
      timestamp: new Date(),
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
      {/* Header del producto */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-slate-600">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {item.name}
          </h4>
          <p className="text-sm font-semibold text-[#65A30D]">
            ${item.price.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Lista de modificadores */}
      {modifiers.map((modifier) => {
        const selected = selectedModifiers.find(
          (s) => s.modifierId === modifier.modifierId
        );
        const selectedCount = selected?.selectedOptions.length || 0;

        return (
          <div
            key={modifier.modifierId}
            className="flex flex-col gap-2"
            style={{ width: "291px" }}
          >
            {/* Título del modificador */}
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                {modifier.name}
                {modifier.isRequired && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </h5>
              {modifier.maxOptions > 1 && (
                <span className="text-xs text-gray-500">
                  {selectedCount}/{modifier.maxOptions} máximo
                </span>
              )}
            </div>

            {/* Opciones del modificador */}
            <div className="grid grid-cols-1 gap-2">
              {modifier.options.map((option) => {
                const isSelected = isOptionSelected(
                  modifier.modifierId,
                  option
                );
                const canSelect =
                  !isSelected &&
                  (modifier.maxOptions === 1 ||
                    selectedCount < modifier.maxOptions);

                return (
                  <button
                    key={option.name}
                    onClick={() =>
                      handleOptionClick(modifier.modifierId, option)
                    }
                    disabled={!canSelect && !isSelected}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left
                      ${
                        isSelected
                          ? "border-[#65A30D] bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-slate-600 hover:border-gray-300"
                      }
                      ${
                        !canSelect && !isSelected
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {option.imageUrl && (
                        <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                          <img
                            src={option.imageUrl}
                            alt={option.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#65A30D]">
                        {option.priceAdjustment > 0
                          ? `+$${option.priceAdjustment.toLocaleString()}`
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

            {/* Indicador de requerido */}
            {modifier.isRequired && selectedCount === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Este modificador es requerido
              </p>
            )}
          </div>
        );
      })}

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
