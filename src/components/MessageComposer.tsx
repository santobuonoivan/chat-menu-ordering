"use client";

import { useChatStore } from "@/stores/chatStore";
import { useCartStore } from "@/stores/cartStore";
import { IMessage } from "@/types/chat";
import { generateUUID, rankAndFilterDishes } from "@/utils";
import { useState } from "react";
import { useMenuStore } from "@/stores/menuStore";

interface MessageComposerProps {
  onSendMessage?: (
    message: string,
    sender: "user" | "assistant",
    messageBody?: IMessage | null
  ) => void;
  onMicClick?: () => void;
  onAttachClick?: () => void;
  placeholder?: string;
}

export default function MessageComposer({
  onSendMessage,
  onMicClick,
  onAttachClick,
  placeholder = "Escribe tu mensaje aquí...",
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const { resetToInitial, setItemListUUID } = useChatStore();
  const { resetCart } = useCartStore();
  const { menuData } = useMenuStore();

  const searchDishesByInput = async (input: string) => {
    // Lógica para buscar platos por entrada de usuario
    const dishList: string[] =
      menuData?.menu.map((item) => item.dish_name) || [];

    // Filtrar localmente primero
    const filteredDishes = rankAndFilterDishes(dishList, input);
    console.log("Filtered Dishes:", filteredDishes);

    // Si solo hay uno, devolver directamente
    if (filteredDishes.length === 1) {
      const response = { success: true, data: filteredDishes };
      handleDishesResponse(response);
      return;
    }

    // Si hay más, consultar al agente AI
    const payload = {
      type: "FIND_DISH_BY_NAME",
      data: { DISH_LIST: filteredDishes, INPUT: input },
    };

    fetch("/api/agentAI/findDishesByName", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const result = await res.json();
        return { success: res.ok, data: result.data?.output };
      })
      .then((response) => {
        handleDishesResponse(response);
      });
  };

  const handleDishesResponse = (response: {
    success: boolean;
    data: string[];
  }) => {
    if (response.success) {
      console.log("Dishes by Input:", response.data);
      const dishesFound = menuData?.menu.filter((item) =>
        response.data.includes(item.dish_name)
      );
      if (dishesFound && dishesFound.length > 0) {
        const newListDishes: IMessage = {
          id: generateUUID(),
          text: "", //"He encontrado esto para ti.",
          sender: "assistant",
          timestamp: new Date(),
          data: {
            items: dishesFound,
            action: "add_dish",
          },
        };
        setItemListUUID?.(newListDishes.id);
        onSendMessage?.(
          `He encontrado ${dishesFound.length} plato(s) que coinciden con tu búsqueda.`,
          "assistant",
          newListDishes
        );
      } else {
        onSendMessage?.(
          `Lo siento, no he encontrado ningún plato que coincida con tu búsqueda. ¿Quieres intentar con otro nombre?`,
          "assistant",
          null
        );
      }
    }
  };
  const handleSend = () => {
    // Mock data temporalmente deshabilitado para compatibilidad v2

    if (message.trim()) {
      if (message.toLowerCase() === "cancelar") {
        // Resetear chat y carrito
        resetToInitial();
        resetCart();
      } else if (message.toLowerCase() != "ver menú digital") {
        onSendMessage?.(message, "user", null);
        searchDishesByInput(message);
      }
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-slate-200/80 dark:border-slate-700/80 shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-full text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border-none bg-slate-200/70 dark:bg-slate-900/50 h-12 placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark pl-12 pr-24 text-sm font-normal"
            placeholder={placeholder}
          />
          <div className="absolute left-0 top-0 h-full flex items-center pl-3">
            <button
              onClick={onMicClick}
              className="flex items-center justify-center p-1.5 rounded-full hover:bg-slate-300/50 dark:hover:bg-slate-600/50 text-text-muted-light dark:text-text-muted-dark transition-colors"
            >
              <span className="material-symbols-outlined text-xl">mic</span>
            </button>
          </div>
          <div className="absolute right-0 top-0 h-full flex items-center pr-12">
            <button
              onClick={onAttachClick}
              className="flex items-center justify-center p-1.5 rounded-full hover:bg-slate-300/50 dark:hover:bg-slate-600/50 text-text-muted-light dark:text-text-muted-dark transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                attach_file
              </span>
            </button>
          </div>
        </div>
        <button
          onClick={handleSend}
          className="flex items-center justify-center size-12 cursor-pointer overflow-hidden rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">
            arrow_upward
          </span>
        </button>
      </div>
    </div>
  );
}
