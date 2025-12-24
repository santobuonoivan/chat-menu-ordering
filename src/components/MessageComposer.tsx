"use client";

import { useChatStore } from "@/stores/chatStore";
import { useCartStore } from "@/stores/cartStore";
import { IMessage } from "@/types/chat";
import { generateUUID, rankAndFilterDishes, sleep } from "@/utils";
import { useState, useRef, useEffect } from "react";
import { useMenuStore } from "@/stores/menuStore";
import { ApiCallFindDishesByName } from "@/handlers/agentAI/findDishes";
import { ApiCallAgentWorkflow } from "@/handlers/agentAI/callAgentWorkflow";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { resetToInitial, setItemListUUID, setIsAssistantTyping } =
    useChatStore();
  const { resetCart, setIsCartOpen } = useCartStore();
  const { menuData } = useMenuStore();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const searchDishesByInput = async (input: string) => {
    // Lógica para buscar platos por entrada de usuario
    const dishList: string[] =
      menuData?.menu.map((item) => item.dish_name) || [];
    console.log("Dish List:", dishList);
    // Filtrar localmente primero
    const filteredDishes = rankAndFilterDishes(dishList, input);
    console.log("Filtered Dishes:", filteredDishes);

    let payload = {};

    if (filteredDishes.length === 0) {
      // Si no hay ninguno, devolver vacío
      payload = { type: "CATEGORIZED", data: { INPUT: input } };
      console.log(
        "No dishes found locally, calling Agent Workflow with payload:",
        payload
      );
      await ApiCallAgentWorkflow(payload)
        .then(async (res) => {
          console.log("Agent Workflow Response Status:", res);
          return { success: res.status === 200, action: res.data?.action };
        })
        .then((response) => {
          handleCategorizedResponse(response);
        })
        .catch((error) => {
          console.error("Error calling Agent Workflow:", error);
          setIsAssistantTyping(false);
        });

      return;
    }
    // Si solo hay uno, devolver directamente
    if (filteredDishes.length === 1) {
      const response = { success: true, data: filteredDishes };
      handleDishesResponse(response);
      return;
    }
    // Si hay más, consultar al agente AI
    payload = {
      type: "FIND_DISH_BY_NAME",
      data: { DISH_LIST: filteredDishes, INPUT: input },
    };

    ApiCallFindDishesByName(payload)
      .then(async (res) => {
        console.log("Find Dishes Response Status:", res);
        return { success: res.status === 200, data: res.data?.output };
      })
      .then((response) => {
        handleDishesResponse(response);
      })
      .catch((error) => {
        console.error("Error calling Find Dishes API:", error);
        setIsAssistantTyping(false);
      });
  };

  const handleCategorizedResponse = (response: {
    success: boolean;
    action: string;
  }) => {
    if (response.success) {
      console.log("Categorized Action:", response.action);
      const action = response.action.toUpperCase();
      if (action === "SHOW_MENU") {
        onSendMessage?.(
          `He encontrado varios platos que podrían interesarte. Aquí tienes el menú completo para que puedas elegir.`,
          "assistant",
          null
        );

        sleep(500).then(() => {
          router.push(`/menu${window.location.search}`);
        });
      }

      if (action === "SHOW_CART") {
        onSendMessage?.(
          `Aquí tienes el contenido de tu carrito.`,
          "assistant",
          null
        );
        sleep(500).then(() => {
          setIsCartOpen(true);
        });
      }

      if (action === "USER_LOCATION") {
        onSendMessage?.(
          `Por favor, indícame tu ubicación para poder ofrecerte el mejor servicio.`,
          "assistant",
          null
        );
      }

      if (action === "CANCEL_ORDER") {
        onSendMessage?.(
          `He cancelado tu pedido. Si necesitas algo más, no dudes en decírmelo.`,
          "assistant",
          null
        );
      }

      if (action === "CONFIRM_ORDER") {
        onSendMessage?.(
          `Tu pedido ha sido confirmado. ¡Gracias por confiar en nosotros!`,
          "assistant",
          null
        );
      }

      if (action === "SELECT_PAYMENT_METHOD") {
        onSendMessage?.(
          `Por favor, selecciona tu método de pago preferido.`,
          "assistant",
          null
        );
      }

      if (action === "ERROR") {
        onSendMessage?.(
          `Lo siento, no he podido entender tu solicitud. ¿Podrías reformularla?`,
          "assistant",
          null
        );
      }
    }
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
      <div className="flex items-end gap-3">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-[20px] text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border-none bg-slate-200/70 dark:bg-slate-900/50 min-h-[48px] max-h-[120px] placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark pl-12 pr-24 py-3 text-sm font-normal"
            placeholder={placeholder}
            style={{ overflow: message ? "auto" : "hidden" }}
          />
          <div className="absolute left-0 bottom-0 h-12 flex items-center pl-3">
            <button
              onClick={onMicClick}
              className="flex items-center justify-center p-1.5 rounded-full hover:bg-slate-300/50 dark:hover:bg-slate-600/50 text-text-muted-light dark:text-text-muted-dark transition-colors"
            >
              <span className="material-symbols-outlined text-xl">mic</span>
            </button>
          </div>
          <div className="absolute right-0 bottom-0 h-12 flex items-center pr-12">
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
          className="flex items-center justify-center size-12 cursor-pointer overflow-hidden rounded-full bg-[#8E2653] text-white shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">
            arrow_upward
          </span>
        </button>
      </div>
    </div>
  );
}
