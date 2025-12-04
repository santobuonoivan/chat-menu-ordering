import { create } from "zustand";
import { ICartItem } from "@/types/cart";
import { DeliveryAddress } from "@/components/DeliveryAddressModal";

export interface Order {
  orderNumber: string;
  items: ICartItem[];
  deliveryAddress: DeliveryAddress;
  subtotal: number;
  taxes: number;
  total: number;
  paymentMethod: "credit_card" | "cash";
  createdAt: Date;
  estimatedDeliveryDate: Date;
}

interface OrderStore {
  order: Order | null;
  setOrder: (order: Order) => void;
  getOrder: () => Order | null;
  clearOrder: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  order: null,

  setOrder: (order: Order) => {
    set({ order });
  },

  getOrder: () => {
    return get().order;
  },

  clearOrder: () => {
    set({ order: null });
  },
}));
