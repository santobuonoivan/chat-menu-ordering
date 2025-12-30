import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IMessage } from "@/types/chat";

interface ChatState {
  messages: IMessage[];
  showListMenuItems: boolean;
  setShowListMenuItems: (show: boolean) => void;
  showListModifiers: boolean;
  setShowListModifiers: (show: boolean) => void;
  isAssistantTyping: boolean;
  setIsAssistantTyping: (typing: boolean) => void;
  triggerScrollToBottom: boolean;
  setTriggerScrollToBottom: (trigger: boolean) => void;
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
      messages: [],

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
        set({
          messages: [],
          itemListUUID: undefined,
          modifierListUUID: undefined,
        });
        // Limpiar también el localStorage
        localStorage.removeItem("chat-store");
      },
      showListMenuItems: false,
      setShowListMenuItems: (show: boolean) => {
        set({ showListMenuItems: show });
      },
      showListModifiers: false,
      setShowListModifiers: (show: boolean) => {
        set({ showListModifiers: show });
      },
      isAssistantTyping: false,
      setIsAssistantTyping: (typing: boolean) => {
        set({ isAssistantTyping: typing });
      },
      triggerScrollToBottom: false,
      setTriggerScrollToBottom: (trigger: boolean) => {
        set({ triggerScrollToBottom: trigger });
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
