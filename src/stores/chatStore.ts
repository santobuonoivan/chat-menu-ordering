import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IMessage } from "@/types/chat";
import { generateUUID } from "@/utils";

interface ChatState {
  messages: IMessage[];
  showListMenuItems: boolean;
  setShowListMenuItems: (show: boolean) => void;
  addMessage: (message: IMessage) => void;
  setMessages: (messages: IMessage[]) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [
        {
          id: generateUUID(),
          text: "¡Hola! ¿Cómo estás? Soy tu Asistente Digital. ¿En qué te puedo ayudar hoy?",
          sender: "assistant",
          timestamp: new Date(),
        },
        {
          id: generateUUID(),
          text: "Puedes hablar conmigo para pedir algo delicioso o puedes acceder a la gestión por menú digital.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ],

      addMessage: (message: IMessage) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      setMessages: (messages: IMessage[]) => {
        set({ messages });
      },

      clearMessages: () => {
        set({ messages: [] });
      },
      showListMenuItems: false,
      setShowListMenuItems: (show: boolean) => {
        set({ showListMenuItems: show });
      },
    }),
    {
      name: "chat-store",
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
