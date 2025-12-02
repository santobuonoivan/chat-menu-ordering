import { useChatStore } from "@/stores/chatStore";
import { IMenuItem, IModifier } from "@/types/menu";
import { generateUUID, sleep } from "@/utils";

interface ItemChatProps {
  item: IMenuItem;
  action: string;
}

export default function ItemChatCard({ item, action }: ItemChatProps) {
  const { addMessage } = useChatStore();
  const { setShowListMenuItems, setShowListModifiers } = useChatStore();
  const handleActionClick = async () => {
    // Esta función será utilizada más adelante para manejar acciones del carrito
    console.log("Action clicked:", action, "for item:", item);

    addMessage({
      id: generateUUID(),
      text: `Agrega ${item.dish_name} a tu pedido.`,
      sender: "user",
      timestamp: new Date(),
    });
    setShowListMenuItems(false);

    await sleep(100);
    if (item.modifiers && item.modifiers.length > 0) {
      setShowListModifiers(true);
      addMessage({
        id: generateUUID(),
        text: `Puedo agregarle a tu ${item.dish_name} :`,
        sender: "assistant",
        timestamp: new Date(),
        data: {
          modifiers:
            item.modifiers?.filter(
              (modifier): modifier is IModifier => modifier !== null
            ) || [],
          itemSelected: item,
          action: "add_modifier",
        },
      });
    } else {
      addMessage({
        id: generateUUID(),
        text: `He agregado ${item.dish_name} a tu pedido. Puedo ayudarte con algo más?`,
        sender: "assistant",
        timestamp: new Date(),
      });
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 hover:shadow-sm transition-shadow">
      {/* Imagen del producto */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0">
        <img
          src={item.image || ""}
          alt={item.dish_name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {item.dish_name}
        </h4>
        <p className="text-sm font-semibold text-[#65A30D]">
          ${item.dish_price.toLocaleString()}
        </p>
      </div>

      {/* Botón de acción */}
      <button
        onClick={handleActionClick}
        className="flex items-center justify-center w-8 h-8 bg-[#65A30D] hover:bg-green-600 text-white rounded-full transition-colors"
        title="Agregar al carrito"
      >
        <span className="material-symbols-outlined text-sm">add</span>
      </button>
    </div>
  );
}
