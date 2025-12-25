import { StateCreator } from "zustand";
import type { DynamicIslandState, WindowSize, ResponsiveMode } from "../types";

export interface UISlice {
  // State
  dynamicIsland: DynamicIslandState;
  mobileDrawerOpen: boolean;
  windowSize: WindowSize;
  responsiveMode: ResponsiveMode;

  // System Prompt UI State
  isSystemPromptPanelExpanded: boolean;
  isSaveTemplateDialogOpen: boolean;
  isDeleteConfirmDialogOpen: boolean;
  targetTemplateId: string | null;

  // Actions
  showDynamicIsland: (
    status: "processing" | "completed",
    message: string,
  ) => void;
  hideDynamicIsland: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;
  setWindowSize: (size: WindowSize) => void;

  // System Prompt UI Actions
  toggleSystemPromptPanel: () => void;
  openSaveTemplateDialog: () => void;
  closeSaveTemplateDialog: () => void;
  openDeleteConfirmDialog: (templateId: string) => void;
  closeDeleteConfirmDialog: () => void;
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

  // System Prompt UI Initial State
  isSystemPromptPanelExpanded: false,
  isSaveTemplateDialogOpen: false,
  isDeleteConfirmDialogOpen: false,
  targetTemplateId: null,

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

  // System Prompt UI Actions
  toggleSystemPromptPanel: () => {
    set((state) => ({
      isSystemPromptPanelExpanded: !state.isSystemPromptPanelExpanded,
    }));
  },

  openSaveTemplateDialog: () => {
    set({ isSaveTemplateDialogOpen: true });
  },

  closeSaveTemplateDialog: () => {
    set({ isSaveTemplateDialogOpen: false });
  },

  openDeleteConfirmDialog: (templateId) => {
    set({
      isDeleteConfirmDialogOpen: true,
      targetTemplateId: templateId,
    });
  },

  closeDeleteConfirmDialog: () => {
    set({
      isDeleteConfirmDialogOpen: false,
      targetTemplateId: null,
    });
  },
});
