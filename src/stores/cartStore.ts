import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ICartStore, ICartItem, ICartModifier } from "@/types/cart";
import { IMenuItem } from "@/types/menu";

const CART_EXPIRY_MINUTES = 30;
const STORAGE_KEY = "appio-cart";

const generateCartItemId = (
  menuItem: IMenuItem,
  modifiers: ICartModifier[]
): string => {
  const modifierIds = modifiers
    .map((m) => `${m.modifierId}-${m.optionName}`)
    .sort()
    .join("|");
  return `${menuItem.dish_id}-${modifierIds}`;
};

const calculateTotalPrice = (
  menuItem: IMenuItem,
  modifiers: ICartModifier[],
  quantity: number
): number => {
  const basePrice = menuItem.dish_price ? parseFloat(menuItem.dish_price) : 0;
  const modifiersPrice = modifiers.reduce(
    (total, modifier) => total + modifier.priceAdjustment,
    0
  );
  return (basePrice + modifiersPrice) * quantity;
};

const isCartExpired = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
};

export const useCartStore = create<ICartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      lastUpdated: null,
      expiresAt: null,
      isCartOpen: false,
      setIsCartOpen: (isOpen: boolean) => set({ isCartOpen: isOpen }),
      addItem: (
        menuItem: IMenuItem,
        modifiers: ICartModifier[] = [],
        quantity: number = 1
      ) => {
        const state = get();

        // Clear expired cart before adding
        if (isCartExpired(state.expiresAt)) {
          get().resetCart();
        }

        const cartItemId = generateCartItemId(menuItem, modifiers);
        const totalPrice = calculateTotalPrice(menuItem, modifiers, quantity);
        const now = new Date();
        const expiresAt = new Date(
          now.getTime() + CART_EXPIRY_MINUTES * 60 * 1000
        );

        const existingItemIndex = state.items.findIndex(
          (item) => item.id === cartItemId
        );

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
            totalPrice: calculateTotalPrice(
              menuItem,
              modifiers,
              updatedItems[existingItemIndex].quantity + quantity
            ),
            addedAt: now,
          };

          const newTotalItems = updatedItems.reduce(
            (total, item) => total + item.quantity,
            0
          );
          const newTotalPrice = updatedItems.reduce(
            (total, item) => total + item.totalPrice,
            0
          );

          set({
            items: updatedItems,
            totalItems: newTotalItems,
            totalPrice: newTotalPrice,
            lastUpdated: now,
            expiresAt,
          });
        } else {
          // Add new item
          const newItem: ICartItem = {
            id: cartItemId,
            menuItem,
            modifiers,
            quantity,
            totalPrice,
            addedAt: now,
          };

          const updatedItems = [...state.items, newItem];
          const newTotalItems = updatedItems.reduce(
            (total, item) => total + item.quantity,
            0
          );
          const newTotalPrice = updatedItems.reduce(
            (total, item) => total + item.totalPrice,
            0
          );

          set({
            items: updatedItems,
            totalItems: newTotalItems,
            totalPrice: newTotalPrice,
            lastUpdated: now,
            expiresAt,
          });
        }
      },

      removeItem: (cartItemId: string) => {
        const state = get();
        const updatedItems = state.items.filter(
          (item) => item.id !== cartItemId
        );
        const newTotalItems = updatedItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const newTotalPrice = updatedItems.reduce(
          (total, item) => total + item.totalPrice,
          0
        );

        set({
          items: updatedItems,
          totalItems: newTotalItems,
          totalPrice: newTotalPrice,
          lastUpdated: new Date(),
        });
      },

      updateQuantity: (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }

        const state = get();
        const updatedItems = state.items.map((item) => {
          if (item.id === cartItemId) {
            const newTotalPrice = calculateTotalPrice(
              item.menuItem,
              item.modifiers,
              quantity
            );
            return {
              ...item,
              quantity,
              totalPrice: newTotalPrice,
            };
          }
          return item;
        });

        const newTotalItems = updatedItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const newTotalPrice = updatedItems.reduce(
          (total, item) => total + item.totalPrice,
          0
        );

        set({
          items: updatedItems,
          totalItems: newTotalItems,
          totalPrice: newTotalPrice,
          lastUpdated: new Date(),
        });
      },

      getCart: () => {
        const state = get();
        if (isCartExpired(state.expiresAt)) {
          get().resetCart();
          return [];
        }
        return state.items;
      },

      getTotalItems: () => {
        const state = get();
        if (isCartExpired(state.expiresAt)) {
          get().resetCart();
          return 0;
        }
        return state.totalItems;
      },

      getTotalPrice: () => {
        const state = get();
        if (isCartExpired(state.expiresAt)) {
          get().resetCart();
          return 0;
        }
        return state.totalPrice;
      },

      getItemNames: () => {
        const state = get();
        if (isCartExpired(state.expiresAt)) {
          get().resetCart();
          return [];
        }
        return state.items.map((item) => item.menuItem.dish_name);
      },

      resetCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
          lastUpdated: null,
          expiresAt: null,
          isCartOpen: false,
        });
      },

      clearExpiredCart: () => {
        const state = get();
        if (isCartExpired(state.expiresAt)) {
          get().resetCart();
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      onRehydrateStorage: () => (state) => {
        // Check and clear expired cart on rehydration
        if (state && isCartExpired(state.expiresAt)) {
          state.resetCart();
        }
      },
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        lastUpdated: state.lastUpdated,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
