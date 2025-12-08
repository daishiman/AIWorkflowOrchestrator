import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  createNavigationSlice,
  type NavigationSlice,
} from "./slices/navigationSlice";
import { createEditorSlice, type EditorSlice } from "./slices/editorSlice";
import { createChatSlice, type ChatSlice } from "./slices/chatSlice";
import { createGraphSlice, type GraphSlice } from "./slices/graphSlice";
import {
  createSettingsSlice,
  type SettingsSlice,
} from "./slices/settingsSlice";
import { createUISlice, type UISlice } from "./slices/uiSlice";
import {
  createDashboardSlice,
  type DashboardSlice,
} from "./slices/dashboardSlice";

// Combined store type
export type AppStore = NavigationSlice &
  EditorSlice &
  ChatSlice &
  GraphSlice &
  SettingsSlice &
  UISlice &
  DashboardSlice;

// Custom storage for Set serialization
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    const parsed = JSON.parse(str);
    // Convert expandedFolders array back to Set
    if (parsed.state?.expandedFolders) {
      parsed.state.expandedFolders = new Set(parsed.state.expandedFolders);
    }
    return parsed;
  },
  setItem: (name: string, value: unknown) => {
    const valueWithSerializedSet = {
      ...(value as Record<string, unknown>),
      state: {
        ...((value as Record<string, unknown>).state as Record<
          string,
          unknown
        >),
        // Convert Set to array for JSON serialization
        expandedFolders: Array.from(
          ((value as Record<string, unknown>).state as Record<string, unknown>)
            .expandedFolders as Set<string>,
        ),
      },
    };
    localStorage.setItem(name, JSON.stringify(valueWithSerializedSet));
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

// Create the combined store
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createNavigationSlice(...args),
        ...createEditorSlice(...args),
        ...createChatSlice(...args),
        ...createGraphSlice(...args),
        ...createSettingsSlice(...args),
        ...createUISlice(...args),
        ...createDashboardSlice(...args),
      }),
      {
        name: "knowledge-studio-store",
        storage: customStorage,
        partialize: (state) => ({
          // Only persist these fields
          currentView: state.currentView,
          selectedFile: state.selectedFile,
          expandedFolders: state.expandedFolders,
          userProfile: state.userProfile,
          autoSyncEnabled: state.autoSyncEnabled,
          windowSize: state.windowSize,
        }),
      },
    ),
    { name: "KnowledgeStudio" },
  ),
);

// Export types
export * from "./types";

// Selector hooks for better performance
export const useCurrentView = () => useAppStore((state) => state.currentView);
export const useSelectedFile = () => useAppStore((state) => state.selectedFile);
export const useFileTree = () => useAppStore((state) => state.fileTree);
export const useExpandedFolders = () =>
  useAppStore((state) => state.expandedFolders);
export const useChatMessages = () => useAppStore((state) => state.chatMessages);
export const useIsSending = () => useAppStore((state) => state.isSending);
export const useGraphNodes = () => useAppStore((state) => state.graphNodes);
export const useGraphLinks = () => useAppStore((state) => state.graphLinks);
export const useIsAnimating = () => useAppStore((state) => state.isAnimating);
export const useDynamicIsland = () =>
  useAppStore((state) => state.dynamicIsland);
export const useResponsiveMode = () =>
  useAppStore((state) => state.responsiveMode);
export const useMobileDrawerOpen = () =>
  useAppStore((state) => state.mobileDrawerOpen);
export const useDashboardStats = () =>
  useAppStore((state) => state.dashboardStats);
export const useActivityFeed = () => useAppStore((state) => state.activityFeed);

// Computed selectors
export const useIsDesktop = () =>
  useAppStore((state) => state.responsiveMode === "desktop");
export const useIsMobile = () =>
  useAppStore((state) => state.responsiveMode === "mobile");
export const useStoragePercentage = () =>
  useAppStore((state) =>
    state.dashboardStats.storageTotal > 0
      ? (state.dashboardStats.storageUsed / state.dashboardStats.storageTotal) *
        100
      : 0,
  );
