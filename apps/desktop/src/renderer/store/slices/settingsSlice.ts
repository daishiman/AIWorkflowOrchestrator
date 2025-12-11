import { StateCreator } from "zustand";
import type { UserProfile, ThemeMode, ResolvedTheme } from "../types";
import { getThemeColorScheme } from "../types";

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

    // Set color-scheme for native elements
    const colorScheme = getThemeColorScheme(resolvedTheme);
    document.documentElement.style.colorScheme = colorScheme;

    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 300);
  }
}

// Helper to resolve theme based on system preference
function resolveSystemTheme(): ResolvedTheme {
  if (typeof window !== "undefined" && window.matchMedia) {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return prefersDark ? "kanagawa-dragon" : "kanagawa-lotus";
  }
  return "kanagawa-dragon"; // Default fallback
}

// Helper to resolve theme mode (unused but kept for future theme switching support)
function _resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") {
    return resolveSystemTheme();
  }
  // Direct theme modes
  return mode as ResolvedTheme;
}

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set, _get) => ({
  // Initial state
  userProfile: defaultProfile,
  apiKey: "",
  autoSyncEnabled: true,
  themeMode: "kanagawa-dragon", // Kanagawa Dragon固定（変更不可）
  resolvedTheme: "kanagawa-dragon", // Default to Kanagawa Dragon

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

  setThemeMode: async (_mode: ThemeMode) => {
    // テーマはKanagawa Dragon固定（変更不可）
    // 変更リクエストを無視し、常にKanagawa Dragonを維持
    const fixedTheme: ResolvedTheme = "kanagawa-dragon";
    set({ themeMode: "kanagawa-dragon", resolvedTheme: fixedTheme });
    applyThemeToDOM(fixedTheme);
  },

  setResolvedTheme: (_theme: ResolvedTheme) => {
    // テーマはKanagawa Dragon固定（変更不可）
    const fixedTheme: ResolvedTheme = "kanagawa-dragon";
    set({ resolvedTheme: fixedTheme });
    applyThemeToDOM(fixedTheme);
  },

  initializeTheme: async () => {
    // テーマはKanagawa Dragon固定（変更不可）
    // 初期化時も常にKanagawa Dragonを適用
    const fixedTheme: ResolvedTheme = "kanagawa-dragon";
    set({ themeMode: "kanagawa-dragon", resolvedTheme: fixedTheme });
    applyThemeToDOM(fixedTheme);
  },
});
