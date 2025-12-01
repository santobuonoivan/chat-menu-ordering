"use client";

import { useChatStore } from "@/stores/chatStore";
import { useCartStore } from "@/stores/cartStore";
import { IMessage } from "@/types/chat";
import { generateUUID } from "@/utils";
import { useState } from "react";

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

  const handleSend = () => {
    const mockBody: IMessage = {
      id: generateUUID(),
      text: "He encontrado esto para ti.",
      sender: "assistant",
      timestamp: new Date(),
      data: {
        items: [
          {
            id: "f9142e98-7172-4ad2-b41b-25eb8b080d1c",
            name: "Salmón a la Parrilla",
            price: 18.5,
            description: "Salmón fresco con espárragos y salsa de limón.",
            category: "Platos Fuertes",
            isAvailable: true,
            imageUrl:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCvYGJAsGSsMXelXCgui7uQzH1JYO1t-LB6YrLR7T3IzYCFp55ZG4GNsUa_2JFa3q_dQyDdEgicei5SZe9U8RmlWBimHudvg2z5zMyXDXR201RVEM7izDJxR2WDRqEek8-OlrAKXIgA_g3Gfay7dOJJkv1aRTZWHhuQmwfbZg7zCbaxU40tON486ptZZn8McWeLke-Vjpn646eEkwBNU4mPEygHJbUcgdxHlcgdxJ2ljMwq7QPlSPNvdo9t5YpOaz-Iq3CmGLU5HUBR",
            modifiers: [
              {
                modifierId: "b64ce0cc-fd07-4000-bae3-1e9c13fb8ac8",
                name: "Adicionales",
                options: [
                  {
                    name: "Extra Queso",
                    priceAdjustment: 3.08,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Extra_Queso",
                  },
                  {
                    name: "Aguacate",
                    priceAdjustment: 0.56,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Aguacate",
                  },
                  {
                    name: "Tocino",
                    priceAdjustment: 0.58,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Tocino",
                  },
                  {
                    name: "Huevo Frito",
                    priceAdjustment: 0.56,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Huevo_Frito",
                  },
                ],
                isRequired: false,
                maxOptions: 2,
              },
              {
                modifierId: "85a95a5c-5b99-4397-b31d-0dfdc7c38991",
                name: "Tamaño",
                options: [
                  {
                    name: "Pequeño",
                    priceAdjustment: 0.81,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Peque%C3%B1o",
                  },
                  {
                    name: "Mediano",
                    priceAdjustment: 1.21,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Mediano",
                  },
                  {
                    name: "Grande",
                    priceAdjustment: 1.67,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Grande",
                  },
                ],
                isRequired: true,
                maxOptions: 1,
              },
            ],
          },
          {
            id: "ca0772a8-a41f-4ff7-a599-0a8f24a64ed8",
            name: "Aros de Cebolla #2",
            price: 5.08,
            description: "Aperitivo o acompañamiento ligero.",
            category: "Ensaladas",
            isAvailable: true,
            imageUrl:
              "https://placehold.co/400x200/2563eb/ffffff?text=Aros_de_Cebolla_%232",
            modifiers: [
              {
                modifierId: "1e9e69a5-e808-4f28-9344-27078ec35598",
                name: "Adicionales",
                options: [
                  {
                    name: "Extra Queso",
                    priceAdjustment: 3.02,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Extra_Queso",
                  },
                  {
                    name: "Aguacate",
                    priceAdjustment: 0.67,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Aguacate",
                  },
                  {
                    name: "Tocino",
                    priceAdjustment: 1.24,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Tocino",
                  },
                  {
                    name: "Huevo Frito",
                    priceAdjustment: 1.38,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Huevo_Frito",
                  },
                ],
                isRequired: false,
                maxOptions: 2,
              },
              {
                modifierId: "5178e67b-a073-476b-b19c-6756246240af",
                name: "Nivel de Picante",
                options: [
                  {
                    name: "Suave",
                    priceAdjustment: 1.05,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Suave",
                  },
                  {
                    name: "Medio",
                    priceAdjustment: 0.61,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Medio",
                  },
                  {
                    name: "Picante",
                    priceAdjustment: 1.4,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Picante",
                  },
                  {
                    name: "Infierno",
                    priceAdjustment: 0.44,
                    imageUrl:
                      "https://placehold.co/100x100/2563eb/ffffff?text=Infierno",
                  },
                ],
                isRequired: false,
                maxOptions: 1,
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
        onSendMessage?.(message, mockBody);
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
