import { MenuItem } from "./menu";

export interface CartModifier {
  modifierId: string;
  modifierName: string;
  optionName: string;
  priceAdjustment: number;
}

export interface CartItem {
  id: string; // Unique ID for cart item
  menuItem: MenuItem;
  modifiers: CartModifier[];
  quantity: number;
  totalPrice: number;
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: Date | null;
  expiresAt: Date | null;
}

export interface CartActions {
  addItem: (
    menuItem: MenuItem,
    modifiers: CartModifier[],
    quantity: number
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  getCart: () => CartItem[];
  getTotalItems: () => number;
  getTotalPrice: () => number;
  resetCart: () => void;
  clearExpiredCart: () => void;
}

export type CartStore = CartState & CartActions;
