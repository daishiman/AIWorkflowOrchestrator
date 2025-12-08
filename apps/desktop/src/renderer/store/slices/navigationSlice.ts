import { StateCreator } from "zustand";
import type { ViewType } from "../types";

export interface NavigationSlice {
  // State
  currentView: ViewType;
  viewHistory: ViewType[];

  // Actions
  setCurrentView: (view: ViewType) => void;
  goBack: () => void;
  canGoBack: () => boolean;
}

export const createNavigationSlice: StateCreator<
  NavigationSlice,
  [],
  [],
  NavigationSlice
> = (set, get) => ({
  // Initial state
  currentView: "dashboard",
  viewHistory: ["dashboard"],

  // Actions
  setCurrentView: (view) => {
    const current = get().currentView;
    if (current === view) return;

    set((state) => ({
      currentView: view,
      viewHistory: [...state.viewHistory, view],
    }));
  },

  goBack: () => {
    const history = get().viewHistory;
    if (history.length <= 1) return;

    const newHistory = history.slice(0, -1);
    const previousView = newHistory[newHistory.length - 1];

    set({
      currentView: previousView,
      viewHistory: newHistory,
    });
  },

  canGoBack: () => {
    return get().viewHistory.length > 1;
  },
});
