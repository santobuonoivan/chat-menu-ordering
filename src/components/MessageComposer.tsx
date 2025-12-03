"use client";

import { useChatStore } from "@/stores/chatStore";
import { useCartStore } from "@/stores/cartStore";
import { IMessage } from "@/types/chat";
import { generateUUID } from "@/utils";
import { useState } from "react";
import { getDishesByInput } from "@/services";
import { useMenuStore } from "@/stores/menuStore";

interface MessageComposerProps {
  onSendMessage?: (message: string, messageBody?: IMessage | null) => void;
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
  const { setShowListMenuItems, resetToInitial } = useChatStore();
  const { resetCart } = useCartStore();
  const { menuData } = useMenuStore();

  const searchDishesByInput = async (input: string) => {
    // Lógica para buscar platos por entrada de usuario
    const dishList: string[] =
      menuData?.menu.map((item) => item.dish_name) || [];
    console.log("Dish List:", dishList);
    console.log("Input:", input);
    getDishesByInput(input, dishList).then((response) => {
      if (response.success) {
        console.log("Dishes by Input:", response.data);
        const dishesFound = menuData?.menu.filter((item) =>
          response.data.includes(item.dish_name)
        );
        if (dishesFound && dishesFound.length > 0) {
          setShowListMenuItems(true);
          onSendMessage?.(
            `He encontrado ${dishesFound.length} plato(s) que coinciden con tu búsqueda.`,
            {
              id: generateUUID(),
              text: "He encontrado esto para ti.",
              sender: "assistant",
              timestamp: new Date(),
              data: {
                items: dishesFound,
                action: "add_dish",
              },
            }
          );
        } else {
          onSendMessage?.(
            `Lo siento, no he encontrado ningún plato que coincida con "${input}". ¿Quieres intentar con otro nombre?`,
            null
          );
        }
      }
    });
  };
  const handleSend = () => {
    // Mock data temporalmente deshabilitado para compatibilidad v2
    const mockBody: IMessage = {
      id: generateUUID(),
      text: "He encontrado esto para ti.",
      sender: "assistant",
      timestamp: new Date(),
      data: {
        items: [
          {
            dish_id: 637,
            dish_sku: "ARROZ-2|1",
            dish_name: "Gohan Express Especial",
            description:
              "Arroz al vapor estilo japonés, acompañado de surimi en láminas, queso philadelphia, aguacate, tampico y ajonjolí mixto.",
            category: "ARROZ GOHAN",
            category_order: 80,
            dish_price: "99.00",
            min_quantity: 1,
            max_quantity: 10,
            image:
              "https://appio-cdn.s3.us-west-1.amazonaws.com/07ac97bb-f096-42e1-b14e-9dc6b975bf2c/7ea3054a-bf34-43d4-90c3-d445b29e9ea9.jpg",
            external_id: "ARROZ-2|1",
            modifiers: [
              {
                mod_sku: "Aguacate",
                mod_name: "Aguacate",
                mod_price: 15,
                group_code: "Elige tus Extras",
                modifier_id: 2367,
                max_quantity: 5,
                min_quantity: 1,
                mod_description: "",
              },
              {
                mod_sku: "Queso Philadelphia",
                mod_name: "Queso Philadelphia",
                mod_price: 15,
                group_code: "Elige tus Extras",
                modifier_id: 2368,
                max_quantity: 5,
                min_quantity: 1,
                mod_description: "",
              },
              {
                mod_sku: "Salsa Tampico",
                mod_name: "Salsa Tampico",
                mod_price: 15,
                group_code: "Elige tus Extras",
                modifier_id: 2369,
                max_quantity: 5,
                min_quantity: 1,
                mod_description: "",
              },
              {
                mod_sku: "Salsa de Chipotle",
                mod_name: "Salsa de Chipotle",
                mod_price: 15,
                group_code: "Elige tus Extras",
                modifier_id: 2370,
                max_quantity: 5,
                min_quantity: 1,
                mod_description: "",
              },
            ],
          },
          {
            dish_id: 639,
            dish_sku: "676",
            dish_name: "Agua de sabor",
            description: "Agua embotellada de sabor natural 500ml",
            category: "Bebidas",
            category_order: 90,
            dish_price: "40.00",
            min_quantity: 1,
            max_quantity: 10,
            image: null,
            external_id: "676",
            modifiers: [
              {
                mod_sku: "m,",
                mod_name: "Maracuya",
                mod_price: 0,
                group_code: "Elige tu sabor",
                modifier_id: 2375,
                max_quantity: 5,
                min_quantity: 1,
                mod_description: "",
              },
              {
                mod_sku: "th",
                mod_name: "Te helado",
                mod_price: 0,
                group_code: "Elige tu sabor",
                modifier_id: 2376,
                max_quantity: 5,
                min_quantity: 1,
                mod_description: "",
              },
              {
                mod_sku: "lcc",
                mod_name: "Limon con chia",
                mod_price: 0,
                group_code: "Elige tu sabor",
                modifier_id: 2377,
                max_quantity: 5,
                min_quantity: 1,
                mod_description: "",
              },
              {
                mod_sku: "fcc",
                mod_name: "Fresa con chia",
                mod_price: 0,
                group_code: "Elige tu sabor",
                modifier_id: 2378,
                max_quantity: 5,
                min_quantity: 1,
                mod_description: "",
              },
            ],
          },
        ],
        action: "add_dish",
      },
    };
    if (message.trim()) {
      if (message.toLowerCase() === "cancelar") {
        // Resetear chat y carrito
        resetToInitial();
        resetCart();
      } else if (message.toLowerCase() != "ver menú digital") {
        setShowListMenuItems(true);
        searchDishesByInput(message);
        //onSendMessage?.(message, mockBody);
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
          className="flex items-center justify-center size-12 cursor-pointer overflow-hidden rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">
            arrow_upward
          </span>
        </button>
      </div>
    </div>
  );
}
