import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RestaurantConfig {
  deliveryByAppio: boolean;
  deliveryByRestaurant: boolean;
  deliveryPickup: boolean;
  cardPaymentEnabled: number;
  cashPaymentEnabled: number;
  sendToAppio: boolean;
  sendGoogleReviewSurvey: boolean;
  deliveryFlatRatePrice: number;
  cookingTime: number;
  foodType: string;
  deliveryQuoteType: string;
  agentName: string;
  locationUUID: string;
  gender: string;
  age: string;
  agentColor: string;
  agentImage: string;
  environment: string;
}

interface Restaurant {
  rest_id: string;
  uuid: string;
  title: string;
  alias: string;
  address: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  lat: string;
  lng: string;
  phone: string | null;
  email: string | null;
  timezone: string;
  config: RestaurantConfig;
  [key: string]: any;
}

interface CartItem {
  id: string;
  session_id: string;
  user_id: string;
  rest_id: string;
  phone_number: string;
  status: string;
  uuid: string;
  [key: string]: any;
}

interface SessionData {
  rest: Restaurant;
  last_cart_completed: CartItem;
  cart_id: string;
  cart: CartItem;
}

interface SessionState {
  clientPhone: string | null;
  setClientPhone: (phone: string) => void;
  restPhone: string | null;
  setRestPhone: (phone: string) => void;
  clientName: string | null;
  setClientName: (name: string) => void;
  sessionData: SessionData | null;
  setSessionData: (data: SessionData) => void;
  getSessionData: () => SessionData | null;
  clearSessionData: () => void;
  sessionChannelName: string | null;
  generateSessionChannel: () => string;
  getSessionChannelName: () => string | null;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      clientPhone: null,
      restPhone: null,
      sessionData: null,
      clientName: null,
      sessionChannelName: null,

      setClientPhone: (phone: string) => {
        set({ clientPhone: phone });
      },

      setRestPhone: (phone: string) => {
        set({ restPhone: phone });
      },

      setSessionData: (data: SessionData) => {
        set({ sessionData: data });
      },

      getSessionData: () => get().sessionData,

      clearSessionData: () => {
        set({
          sessionData: null,
          clientPhone: null,
          restPhone: null,
          sessionChannelName: null,
        });
      },

      setClientName: (name: string) => {
        set({ clientName: name });
      },

      generateSessionChannel: () => {
        const state = get();
        const clientPhone = state.clientPhone || "guest";
        const restPhone = state.restPhone || "unknown";
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const channelName = `session-${clientPhone}-${restPhone}-${timestamp}-${random}`;
        set({ sessionChannelName: channelName });
        return channelName;
      },

      getSessionChannelName: () => {
        const state = get();
        if (!state.sessionChannelName) {
          return state.generateSessionChannel();
        }
        return state.sessionChannelName;
      },
    }),
    {
      name: "session-store",
      partialize: (state) => ({
        clientPhone: state.clientPhone,
        clientName: state.clientName,
        restPhone: state.restPhone,
        sessionData: state.sessionData,
        sessionChannelName: state.sessionChannelName,
      }),
    }
  )
);
