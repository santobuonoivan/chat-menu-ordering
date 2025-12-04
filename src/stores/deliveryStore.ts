import { create } from "zustand";
import { DeliveryAddress } from "@/components/DeliveryAddressModal";

interface DeliveryState {
  address: DeliveryAddress | null;
  setAddress: (address: DeliveryAddress) => void;
  clearAddress: () => void;
  getAddress: () => DeliveryAddress | null;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  address: null,

  setAddress: (address: DeliveryAddress) => {
    set({ address });
    // Persistir en localStorage
    localStorage.setItem("deliveryAddress", JSON.stringify(address));
  },

  clearAddress: () => {
    set({ address: null });
    localStorage.removeItem("deliveryAddress");
  },

  getAddress: () => get().address,

  // Inicializar desde localStorage (se llama en useEffect)
  initializeFromStorage: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("deliveryAddress");
      if (stored) {
        try {
          const address = JSON.parse(stored);
          set({ address });
        } catch (error) {
          console.error("Error al parsear dirección guardada:", error);
        }
      }
    }
  },
}));

// Inicializar desde localStorage cuando el store se crea
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("deliveryAddress");
  if (stored) {
    try {
      const address = JSON.parse(stored);
      useDeliveryStore.setState({ address });
    } catch (error) {
      console.error("Error al cargar dirección guardada:", error);
    }
  }
}
