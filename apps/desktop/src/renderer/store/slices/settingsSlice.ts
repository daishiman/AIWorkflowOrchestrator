import { StateCreator } from "zustand";
import type { UserProfile, ThemeMode, ResolvedTheme } from "../types";

export interface SettingsSlice {
  // State
  userProfile: UserProfile;
  apiKey: string;
  autoSyncEnabled: boolean;
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;

  // Actions
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setApiKey: (key: string) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setResolvedTheme: (theme: ResolvedTheme) => void;
  initializeTheme: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: "ユーザー",
  email: "",
  avatar: "",
  plan: "free",
};

// Helper to apply theme to DOM
function applyThemeToDOM(resolvedTheme: ResolvedTheme): void {
  if (typeof document !== "undefined") {
    // Add transition class for smooth animation
    document.documentElement.classList.add("theme-transition");

    // Set data-theme attribute
    document.documentElement.setAttribute("data-theme", resolvedTheme);

    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 300);
  }
}

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set, get) => ({
  // Initial state
  userProfile: defaultProfile,
  apiKey: "",
  autoSyncEnabled: true,
  themeMode: "system",
  resolvedTheme: "dark", // Default to dark

  // Actions
  setUserProfile: (profile) => {
    set({ userProfile: profile });
  },

  updateUserProfile: (updates) => {
    set((state) => ({
      userProfile: { ...state.userProfile, ...updates },
    }));
  },

  setApiKey: (key) => {
    set({ apiKey: key });
  },

  setAutoSyncEnabled: (enabled) => {
    set({ autoSyncEnabled: enabled });
  },

  setThemeMode: async (mode: ThemeMode) => {
    try {
      // Guard: Skip IPC if electronAPI is not available (e.g., browser dev mode)
      if (!window.electronAPI?.theme?.set) {
        // Fallback for browser mode
        const resolvedTheme: ResolvedTheme = mode === "system" ? "dark" : mode;
        set({ themeMode: mode, resolvedTheme });
        applyThemeToDOM(resolvedTheme);
        return;
      }

      // Call IPC to save and get resolved theme
      const response = await window.electronAPI.theme.set({ mode });

      if (response.success && response.data) {
        const { mode: savedMode, resolvedTheme } = response.data;

        // Update state
        set({ themeMode: savedMode, resolvedTheme });

        // Apply to DOM
        applyThemeToDOM(resolvedTheme);
      }
    } catch (error) {
      console.error("[SettingsSlice] Failed to set theme:", error);
      // Fallback: still update local state
      let resolvedTheme: ResolvedTheme;
      if (mode === "system") {
        // Try to get system theme
        try {
          const sysResponse = await window.electronAPI.theme.getSystem();
          resolvedTheme = sysResponse.data?.resolvedTheme ?? "dark";
        } catch {
          resolvedTheme = "dark";
        }
      } else {
        resolvedTheme = mode;
      }

      set({ themeMode: mode, resolvedTheme });
      applyThemeToDOM(resolvedTheme);
    }
  },

  setResolvedTheme: (theme: ResolvedTheme) => {
    set({ resolvedTheme: theme });
    applyThemeToDOM(theme);
  },

  initializeTheme: async () => {
    try {
      // Guard: Skip IPC if electronAPI is not available (e.g., browser dev mode)
      if (!window.electronAPI?.theme?.get) {
        // Use defaults for browser mode
        const state = get();
        applyThemeToDOM(state.resolvedTheme);
        return;
      }

      const response = await window.electronAPI.theme.get();

      if (response.success && response.data) {
        const { mode, resolvedTheme } = response.data;
        set({ themeMode: mode, resolvedTheme });
        applyThemeToDOM(resolvedTheme);
      }
    } catch (error) {
      console.error("[SettingsSlice] Failed to initialize theme:", error);
      // Use defaults
      const state = get();
      applyThemeToDOM(state.resolvedTheme);
    }
  },
});
