import { StateCreator } from "zustand";
import type { DynamicIslandState, WindowSize, ResponsiveMode } from "../types";

export interface UISlice {
  // State
  dynamicIsland: DynamicIslandState;
  mobileDrawerOpen: boolean;
  windowSize: WindowSize;
  responsiveMode: ResponsiveMode;

  // Actions
  showDynamicIsland: (
    status: "processing" | "completed",
    message: string,
  ) => void;
  hideDynamicIsland: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;
  setWindowSize: (size: WindowSize) => void;
}

// Helper to calculate responsive mode
const calculateResponsiveMode = (width: number): ResponsiveMode => {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  // Initial state
  dynamicIsland: {
    visible: false,
    status: "completed",
    message: "",
  },
  mobileDrawerOpen: false,
  windowSize: { width: 1200, height: 800 },
  responsiveMode: "desktop",

  // Actions
  showDynamicIsland: (status, message) => {
    set({
      dynamicIsland: {
        visible: true,
        status,
        message,
      },
    });
  },

  hideDynamicIsland: () => {
    set((state) => ({
      dynamicIsland: {
        ...state.dynamicIsland,
        visible: false,
      },
    }));
  },

  setMobileDrawerOpen: (open) => {
    set({ mobileDrawerOpen: open });
  },

  toggleMobileDrawer: () => {
    set((state) => ({ mobileDrawerOpen: !state.mobileDrawerOpen }));
  },

  setWindowSize: (size) => {
    set({
      windowSize: size,
      responsiveMode: calculateResponsiveMode(size.width),
    });
  },
});
