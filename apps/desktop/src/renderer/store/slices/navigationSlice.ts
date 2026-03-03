import { StateCreator } from "zustand";
import type { ViewType } from "../types";

export interface NavigationSlice {
  // State
  currentView: ViewType;
  viewHistory: ViewType[];
  /** UT-UI-05A-006: 現在編集中のスキル名 */
  currentSkillName: string | null;

  // Actions
  setCurrentView: (view: ViewType) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  /** UT-UI-05A-006: 編集中スキル名を設定 */
  setCurrentSkillName: (name: string | null) => void;
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
  currentSkillName: null,

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

  setCurrentSkillName: (name) => {
    set({ currentSkillName: name });
  },
});
