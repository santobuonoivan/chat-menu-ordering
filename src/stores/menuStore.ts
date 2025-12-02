import { create } from "zustand";
import { IMenuData } from "@/types/menu";

interface MenuState {
  menuData: IMenuData | null;
  setMenuData: (data: IMenuData) => void;
  getMenuData: () => IMenuData | null;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menuData: null,

  setMenuData: (data: IMenuData) => {
    set({ menuData: data });
  },

  getMenuData: () => {
    return get().menuData;
  },
}));
