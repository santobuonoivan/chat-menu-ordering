import { IMenuItem } from "@/types/menu";
import ItemChatCard from "./ItemChatCard";
import { useState } from "react";
import { useChatStore } from "@/stores/chatStore";
import { generateUUID, sleep } from "@/utils";

interface ItemChatCardListProps {
  items: IMenuItem[];
  action: string;
}

interface SelectedItem {
  item: IMenuItem;
  quantity: number;
}

export default function ItemChatCardList({
  items,
  action,
}: ItemChatCardListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<
    Record<number, SelectedItem>
  >({});
  const itemsPerPage = 3;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);
  const {
    setTriggerScrollToBottom,
    addMessage,
    setItemListUUID,
    setModifierListUUID,
  } = useChatStore();

  const handleAddItem = (item: IMenuItem) => {
    setSelectedItems((prev) => ({
      ...prev,
      [item.dish_id]: { item, quantity: 1 },
    }));
  };

  const handleRemoveItem = (dishId: number) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      delete updated[dishId];
      return updated;
    });
  };

  const handleUpdateQuantity = (dishId: number, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[dishId];
      if (!current) return prev;

      const newQuantity = current.quantity + delta;

      if (newQuantity <= 0) {
        const updated = { ...prev };
        delete updated[dishId];
        return updated;
      }

      return {
        ...prev,
        [dishId]: { ...current, quantity: newQuantity },
      };
    });
  };

  const handleAddToCart = async () => {
    // Expandir items con quantity > 1 en el array
    const selectedArray: IMenuItem[] = [];
    Object.values(selectedItems).forEach((sel) => {
      for (let i = 0; i < sel.quantity; i++) {
        selectedArray.push(sel.item);
      }
    });

    if (selectedArray.length === 0) return;

    // Cerrar la lista de items
    setItemListUUID?.(undefined);

    // Crear mensaje del usuario con todos los items
    const itemsText = selectedArray.map((item) => item.dish_name).join(", ");

    addMessage({
      id: generateUUID(),
      text: `Quiero ${itemsText}`,
      sender: "user",
      timestamp: new Date(),
    });
    const modMsgUUID = generateUUID();
    setModifierListUUID?.(modMsgUUID);
    await sleep(500);

    addMessage({
      id: modMsgUUID,
      text:
        selectedArray.length == 1
          ? "Puedo agregarle algo a tu platillo"
          : "Puedo agregarle algo a tus platillos",
      sender: "assistant",
      timestamp: new Date(),
      data: {
        itemSelected: selectedArray,
        action: "add_modifier",
      },
    });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setTriggerScrollToBottom(true);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setTriggerScrollToBottom(true);
    }
  };

  const selectedCount = Object.keys(selectedItems).length;

  return (
    <div className="flex flex-col gap-2 mt-2 w-[90%] max-w-[90%] min-w-[90%]">
      {currentItems.map((item: IMenuItem, index: number) => (
        <ItemChatCard
          key={item.dish_id || index}
          item={item}
          action={action}
          selectedQuantity={selectedItems[item.dish_id]?.quantity || 0}
          onAdd={handleAddItem}
          onRemove={handleRemoveItem}
          onUpdateQuantity={handleUpdateQuantity}
        />
      ))}

      {/* Paginador - solo si hay más de 5 items */}
      {items.length > itemsPerPage && (
        <div className="flex items-center justify-between gap-2 mt-2 px-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex items-center justify-center px-1 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              chevron_left
            </span>
          </button>

          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center px-1 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              chevron_right
            </span>
          </button>
        </div>
      )}

      {/* Botón Agregar al carrito - solo si hay items seleccionados */}
      <button
        disabled={selectedCount === 0}
        onClick={handleAddToCart}
        className="w-full mt-3 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-98"
        style={{ backgroundColor: selectedCount !== 0 ? "#8E2653" : "#ccc" }}
      >
        pedir ({selectedCount} {selectedCount === 1 ? "item" : "items"})
      </button>
    </div>
  );
}
