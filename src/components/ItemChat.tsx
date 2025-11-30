import { IMessage } from "@/types/chat";
import { IMenuItem } from "@/types/menu";

interface ItemChatProps {
  item: IMenuItem;
  action: string;
}

export default function ItemChat({ item, action }: ItemChatProps) {
  const handleSendMessage = (messageBody: IMessage) => {
    const newMessage: IMessage = {
      id: messages.length + 1,
      text: "agrega " + messageBody.text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    if (message.toLowerCase() == "ver menú digital") {
      // Simular respuesta del asistente después de un breve delay
      setTimeout(() => {
        const assistantResponse: IMessage = {
          id: messages.length + 2,
          text: "Gracias por tu mensaje. Te mostraré el menú digital para que puedas elegir.",
          sender: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantResponse]);
      }, 1000);
    } else if (messageBody) {
      // Simular respuesta genérica del asistente
      setTimeout(() => {
        setMessages((prev) => [...prev, messageBody]);
      }, 1000);
    }
  };

  const handleActionClick = () => {
    // Esta función será utilizada más adelante para manejar acciones del carrito
    console.log(`Acción: ${action} para el ítem: ${item.name}`);
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
