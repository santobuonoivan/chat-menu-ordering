import { create } from "zustand";
import { DeliveryAddress } from "@/components/DeliveryAddressModal";

interface QuoteData {
  quoteUUID: string;
  overloadAmountFee: number;
}

interface DeliveryState {
  address: DeliveryAddress | null;
  setAddress: (address: DeliveryAddress) => void;
  clearAddress: () => void;
  getAddress: () => DeliveryAddress | null;
  quoteData: QuoteData | null;
  setQuoteData: (quoteData: QuoteData) => void;
  clearQuoteData: () => void;
  getQuoteData: () => QuoteData | null;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  address: null,
  quoteData: null,

  setAddress: (address: DeliveryAddress) => {
    set({ address });
    // Persistir en localStorage
    localStorage.setItem("deliveryAddress", JSON.stringify(address));
  },

  clearAddress: () => {
    set({ address: null });
    localStorage.removeItem("deliveryAddress");
    get().clearQuoteData();
  },

  getAddress: () => get().address,

  setQuoteData: (quoteData: QuoteData) => {
    set({ quoteData });
    // Persistir en localStorage
    localStorage.setItem("quoteData", JSON.stringify(quoteData));
  },

  clearQuoteData: () => {
    set({ quoteData: null });
    localStorage.removeItem("quoteData");
  },

  getQuoteData: () => get().quoteData,

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

      const storedQuote = localStorage.getItem("quoteData");
      if (storedQuote) {
        try {
          const quoteData = JSON.parse(storedQuote);
          set({ quoteData });
        } catch (error) {
          console.error(
            "Error al parsear datos de cotización guardados:",
            error
          );
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

  const storedQuote = localStorage.getItem("quoteData");
  if (storedQuote) {
    try {
      const quoteData = JSON.parse(storedQuote);
      useDeliveryStore.setState({ quoteData });
    } catch (error) {
      console.error("Error al cargar datos de cotización guardados:", error);
    }
  }
}
