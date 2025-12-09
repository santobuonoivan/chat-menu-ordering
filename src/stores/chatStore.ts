import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IMessage } from "@/types/chat";
import { generateUUID } from "@/utils";

interface ChatState {
  messages: IMessage[];
  showListMenuItems: boolean;
  setShowListMenuItems: (show: boolean) => void;
  showListModifiers: boolean;
  setShowListModifiers: (show: boolean) => void;
  addMessage: (message: IMessage) => void;
  setMessages: (messages: IMessage[]) => void;
  clearMessages: () => void;
  resetToInitial: () => void;
  setItemListUUID: (uuid: string | undefined) => void;
  itemListUUID: string | undefined;
  setModifierListUUID: (uuid: string | undefined) => void;
  modifierListUUID: string | undefined;
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

      resetToInitial: () => {
        const initialMessages = [
          {
            id: generateUUID(),
            text: "¡Hola! ¿Cómo estás? Soy tu Asistente Digital. ¿En qué te puedo ayudar hoy?",
            sender: "assistant" as const,
            timestamp: new Date(),
          },
          {
            id: generateUUID(),
            text: "Puedes hablar conmigo para pedir algo delicioso o puedes acceder a la gestión por menú digital.",
            sender: "assistant" as const,
            timestamp: new Date(),
          },
        ];
        set({ messages: initialMessages });
      },
      showListMenuItems: false,
      setShowListMenuItems: (show: boolean) => {
        set({ showListMenuItems: show });
      },
      showListModifiers: false,
      setShowListModifiers: (show: boolean) => {
        set({ showListModifiers: show });
      },
      setItemListUUID: (uuid: string | undefined) => {
        set({ itemListUUID: uuid });
      },
      setModifierListUUID: (uuid: string | undefined) => {
        set({ modifierListUUID: uuid });
      },
      modifierListUUID: undefined,
      itemListUUID: undefined,
    }),
    {
      name: "chat-store",
      partialize: (state) => ({ 
        messages: state.messages,
        itemListUUID: state.itemListUUID,
        modifierListUUID: state.modifierListUUID,
      }),
    }
  )
);
