import { create } from "zustand";
import { eventTracker } from "@/services/eventTracker";
import { TrackingConfig } from "@/types/tracking";

interface TrackingState {
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
  config: TrackingConfig;
  updateConfig: (config: Partial<TrackingConfig>) => void;
  getStats: () => {
    sessionId: string;
    journeyLength: number;
    bufferSize: number;
  };
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  isEnabled: true,
  debugMode: process.env.NODE_ENV === "development",
  config: eventTracker.getConfig(),

  setEnabled: (enabled: boolean) => {
    set({ isEnabled: enabled });
    eventTracker.updateConfig({ enabled });
  },

  setDebugMode: (debug: boolean) => {
    set({ debugMode: debug });
    eventTracker.updateConfig({ debugMode: debug });
  },

  updateConfig: (newConfig: Partial<TrackingConfig>) => {
    eventTracker.updateConfig(newConfig);
    set({ config: eventTracker.getConfig() });
  },

  getStats: () => {
    return {
      sessionId: eventTracker["sessionId"],
      journeyLength: eventTracker.getUserJourney().length,
      bufferSize: eventTracker["eventBuffer"].length,
    };
  },
}));
