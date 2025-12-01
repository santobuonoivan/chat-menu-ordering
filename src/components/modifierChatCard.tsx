import { useChatStore } from "@/stores/chatStore";
import { IMenuItem, IModifier } from "@/types/menu";
import { generateUUID, sleep } from "@/utils";

interface ModifierChatProps {
  item: IMenuItem;
  modifiers: IModifier[];
  action: string;
}

export default function ModifierChat({
  item,
  modifiers,
  action,
}: ModifierChatProps) {
  const { messages, addMessage } = useChatStore();

  const handleActionClick = async () => {
    // Esta función será utilizada más adelante para manejar acciones del carrito

    addMessage({
      id: generateUUID(),
      text: `Puedes agregar a tu ${item.name} :`,
      sender: "user",
      timestamp: new Date(),
    });
    await sleep(100);
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 hover:shadow-sm transition-shadow">
      {/* Imagen del producto */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {item.name}
        </h4>
        <p className="text-sm font-semibold text-[#65A30D]">
          ${item.price.toLocaleString()}
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
