import { useState, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useCartStore } from "@/stores/cartStore";
import { IMenuItem, IModifier, IModifierGroup } from "@/types/menu";
import { ICartModifier } from "@/types/cart";
import { generateUUID } from "@/utils";

interface ModifierChatProps {
  items: IMenuItem[];
  action: string;
}

interface SelectedModifiersPerItem {
  [itemIndex: number]: {
    groupCode: string;
    selectedModifier: IModifier | null;
  }[];
}

export default function ModifierChatCard({ items, action }: ModifierChatProps) {
  const { addMessage, setModifierListUUID } = useChatStore();
  const { addItem } = useCartStore();
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(0);
  const [selectedModifiersPerItem, setSelectedModifiersPerItem] =
    useState<SelectedModifiersPerItem>({});
  console.log("ModifierChatCard items:", items);

  // Inicializar modificadores del primer item automáticamente
  useEffect(() => {
    if (items.length > 0 && items[0].modifiers) {
      setSelectedModifiersPerItem({
        0: items[0].modifiers.map((group) => ({
          groupCode: group.group_code,
          selectedModifier: null,
        })),
      });
    }
  }, []);
  // Inicializar modificadores para cada item
  const initializeModifiers = (itemIndex: number, item: IMenuItem) => {
    if (!selectedModifiersPerItem[itemIndex] && item.modifiers) {
      setSelectedModifiersPerItem((prev) => ({
        ...prev,
        [itemIndex]: item.modifiers!.map((group) => ({
          groupCode: group.group_code,
          selectedModifier: null,
        })),
      }));
    }
  };

  const handleOptionClick = (
    itemIndex: number,
    groupCode: string,
    modifier: IModifier
  ) => {
    setSelectedModifiersPerItem((prev) => {
      const itemMods = prev[itemIndex] || [];
      // Si no hay modificadores inicializados, inicializar ahora
      if (itemMods.length === 0 && items[itemIndex].modifiers) {
        const initialized = items[itemIndex].modifiers!.map((group) => ({
          groupCode: group.group_code,
          selectedModifier: null,
        }));
        return {
          ...prev,
          [itemIndex]: initialized.map((selected) => {
            if (selected.groupCode === groupCode) {
              return {
                ...selected,
                selectedModifier: modifier,
              };
            }
            return selected;
          }),
        };
      }

      return {
        ...prev,
        [itemIndex]: itemMods.map((selected) => {
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
        }),
      };
    });
  };

  const isOptionSelected = (
    itemIndex: number,
    groupCode: string,
    modifier: IModifier
  ) => {
    const itemMods = selectedModifiersPerItem[itemIndex] || [];
    const groupSelection = itemMods.find((s) => s.groupCode === groupCode);
    return (
      groupSelection?.selectedModifier?.modifier_id === modifier.modifier_id
    );
  };

  const handleItemClick = (index: number, item: IMenuItem) => {
    // No colapsar si ya está expandido, solo permitir expandir otros
    if (expandedItemIndex !== index) {
      setExpandedItemIndex(index);
      initializeModifiers(index, item);
    }
  };

  const handleSkipModifiers = (itemIndex: number) => {
    // Solo marcar como procesado, no agregar al carrito aún
    // Si hay más items, pasar al siguiente
    if (itemIndex < items.length - 1) {
      setExpandedItemIndex(itemIndex + 1);
      initializeModifiers(itemIndex + 1, items[itemIndex + 1]);
    } else {
      // Finalizar y agregar todos al carrito
      finalizarYAgregarTodos();
    }
  };

  const handleAddToCart = async (itemIndex: number) => {
    // Solo avanzar al siguiente item, no agregar al carrito aún
    if (itemIndex < items.length - 1) {
      setExpandedItemIndex(itemIndex + 1);
      initializeModifiers(itemIndex + 1, items[itemIndex + 1]);
    } else {
      // Finalizar y agregar todos al carrito
      finalizarYAgregarTodos();
    }
  };

  const finalizarYAgregarTodos = () => {
    const itemsAgregados: string[] = [];
    const itemsAgregadosByClient: string[] = [];

    // Procesar todos los items y agregar al carrito
    items.forEach((item, itemIndex) => {
      const itemMods = selectedModifiersPerItem[itemIndex] || [];

      // Convertir modificadores seleccionados
      const cartModifiers: ICartModifier[] = [];
      itemMods.forEach((selected) => {
        if (selected.selectedModifier) {
          cartModifiers.push({
            modifierId: selected.selectedModifier.modifier_id.toString(),
            modifierName: selected.selectedModifier.group_code,
            optionName: selected.selectedModifier.mod_name,
            priceAdjustment: selected.selectedModifier.mod_price,
          });
        }
      });

      // Agregar al carrito
      addItem(item, cartModifiers, 1);

      // Construir texto para el mensaje final
      if (cartModifiers.length > 0) {
        itemsAgregados.push(
          `${item.dish_name} con ${cartModifiers
            .map((m) => m.optionName)
            .join(", ")}`
        );
        itemsAgregadosByClient.push(
          ` ${cartModifiers.map((m) => m.optionName).join(", ")} para mi ${
            item.dish_name
          }  `
        );
      } else {
        itemsAgregadosByClient.push(` ${item.dish_name} sin adicionales `);
        itemsAgregados.push(`${item.dish_name}`);
      }
    });

    // Mensaje del usuario describiendo lo que pidió
    addMessage({
      id: generateUUID(),
      text: `Quiero agregar ${itemsAgregadosByClient.join(" y ")} a mi pedido.`,
      sender: "user",
      timestamp: new Date(),
    });

    // Cerrar modal
    setModifierListUUID?.(undefined);

    // Mensaje final único
    addMessage({
      id: generateUUID(),
      text: `He agregado ${itemsAgregados.join(
        ", "
      )} a tu carrito. ¿Puedo ayudarte con algo más?`,
      sender: "assistant",
      timestamp: new Date(),
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {items.map((item, itemIndex) => {
        const isExpanded = expandedItemIndex === itemIndex;
        const modifiers = item.modifiers || [];

        return (
          <div
            key={itemIndex}
            className="flex flex-col bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden"
          >
            {/* Header del item - siempre visible y clickeable */}
            <button
              onClick={() => handleItemClick(itemIndex, item)}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0">
                <img
                  src={item.image || "/placeholder-image.jpg"}
                  alt={item.dish_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.dish_name}
                </h4>
                <p className="text-sm font-semibold text-[#8E2653]">
                  ${parseFloat(item.dish_price).toLocaleString()}
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-400">
                {isExpanded ? "expand_less" : "expand_more"}
              </span>
            </button>

            {/* Contenido expandible - modificadores */}
            {isExpanded && (
              <div className="flex flex-col gap-3 p-4 pt-0 border-t border-gray-200 dark:border-slate-600">
                {/* Opción sin modificadores */}
                <button
                  onClick={() => handleSkipModifiers(itemIndex)}
                  className="w-full py-2 px-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-[#8E2653] hover:text-[#8E2653] transition-colors"
                >
                  Sin adicionales
                </button>

                {/* Lista de grupos de modificadores */}
                {modifiers.map((group, groupIndex) => (
                  <div key={groupIndex} className="flex flex-col gap-2">
                    {/* Título del grupo */}
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {group.group_code}
                      </h5>
                      <span className="text-xs text-gray-500">Opcional</span>
                    </div>

                    {/* Lista de opciones del grupo */}
                    <div className="flex flex-col gap-2">
                      {group.options?.map((modifier) => {
                        const isSelected = isOptionSelected(
                          itemIndex,
                          group.group_code,
                          modifier
                        );

                        return (
                          <button
                            key={modifier.modifier_id}
                            onClick={() =>
                              handleOptionClick(
                                itemIndex,
                                group.group_code,
                                modifier
                              )
                            }
                            className={`
                              flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                              ${
                                isSelected
                                  ? "border-[#8E2653] bg-green-50 dark:bg-green-900/20"
                                  : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 cursor-pointer"
                              }
                            `}
                          >
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {modifier.mod_name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#8E2653]">
                                {modifier.mod_price > 0
                                  ? `+$${modifier.mod_price.toLocaleString()}`
                                  : "Gratis"}
                              </span>
                              {isSelected && (
                                <span className="material-symbols-outlined text-[#8E2653] text-lg">
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
                  onClick={() => handleAddToCart(itemIndex)}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-[#8E2653] hover:bg-[#7A2347] transition-colors"
                >
                  {itemIndex < items.length - 1
                    ? "Continuar"
                    : "Agregar al Carrito"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
