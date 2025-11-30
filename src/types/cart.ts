import { IMenuItem } from "./menu";

export interface ICartModifier {
  modifierId: string;
  modifierName: string;
  optionName: string;
  priceAdjustment: number;
}

export interface ICartItem {
  id: string; // Unique ID for cart item
  menuItem: IMenuItem;
  modifiers: ICartModifier[];
  quantity: number;
  totalPrice: number;
  addedAt: Date;
}

export interface ICartState {
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: Date | null;
  expiresAt: Date | null;
}

export interface ICartActions {
  addItem: (
    menuItem: IMenuItem,
    modifiers: ICartModifier[],
    quantity: number
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  getCart: () => ICartItem[];
  getTotalItems: () => number;
  getTotalPrice: () => number;
  resetCart: () => void;
  clearExpiredCart: () => void;
}

export type ICartStore = ICartState & ICartActions;
