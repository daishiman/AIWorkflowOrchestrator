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

const DEFAULT_THEME_MODE: ThemeMode = "kanagawa-dragon";
const DEFAULT_RESOLVED_THEME: ResolvedTheme = "kanagawa-dragon";

const VALID_THEME_MODES: readonly ThemeMode[] = [
  "kanagawa-dragon",
  "light",
  "dark",
  "system",
];
const VALID_RESOLVED_THEMES: readonly ResolvedTheme[] = [
  "kanagawa-dragon",
  "light",
  "dark",
];

type ThemeGetResponse = {
  success: boolean;
  data?: {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
  };
};

type ThemeSetResponse = {
  success: boolean;
  data?: {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
  };
};

type ThemeGetSystemResponse = {
  success: boolean;
  data?: {
    isDark: boolean;
    resolvedTheme: ResolvedTheme;
  };
};

type ThemeApi = {
  get?: () => Promise<ThemeGetResponse>;
  set?: (request: { mode: ThemeMode }) => Promise<ThemeSetResponse>;
  getSystem?: () => Promise<ThemeGetSystemResponse>;
};

type ElectronApiLike = {
  theme?: ThemeApi;
};

function getThemeApi(): ThemeApi | undefined {
  const electronApi = (
    globalThis as typeof globalThis & {
      electronAPI?: ElectronApiLike;
    }
  ).electronAPI;
  return electronApi?.theme;
}

// Helper to apply theme to DOM
function applyThemeToDOM(resolvedTheme: ResolvedTheme): void {
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("theme-transition");
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.style.colorScheme =
      getThemeColorScheme(resolvedTheme);

    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 300);
  }
}

function isThemeMode(value: unknown): value is ThemeMode {
  return (
    typeof value === "string" && VALID_THEME_MODES.includes(value as ThemeMode)
  );
}

function isResolvedTheme(value: unknown): value is ResolvedTheme {
  return (
    typeof value === "string" &&
    VALID_RESOLVED_THEMES.includes(value as ResolvedTheme)
  );
}

function resolveSystemThemeFromMediaQuery(): ResolvedTheme {
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
  ) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark";
}

async function getSystemResolvedTheme(
  themeApi?: ThemeApi,
): Promise<ResolvedTheme> {
  if (themeApi?.getSystem) {
    try {
      const response = await themeApi.getSystem();
      if (response.success && isResolvedTheme(response.data?.resolvedTheme)) {
        // system解決値は light/dark のみを受け付ける
        if (
          response.data?.resolvedTheme === "light" ||
          response.data?.resolvedTheme === "dark"
        ) {
          return response.data.resolvedTheme;
        }
      }
    } catch {
      // fallback to media query
    }
  }

  return resolveSystemThemeFromMediaQuery();
}

function resolveThemeMode(
  mode: ThemeMode,
  systemResolvedTheme: ResolvedTheme,
): ResolvedTheme {
  if (mode === "system") {
    return systemResolvedTheme;
  }
  return mode;
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
  themeMode: DEFAULT_THEME_MODE,
  resolvedTheme: DEFAULT_RESOLVED_THEME,

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

  setThemeMode: async (requestedMode: ThemeMode) => {
    const mode = isThemeMode(requestedMode)
      ? requestedMode
      : DEFAULT_THEME_MODE;
    const themeApi = getThemeApi();

    let themeMode = mode;
    let resolvedTheme = resolveThemeMode(
      mode,
      mode === "system"
        ? await getSystemResolvedTheme(themeApi)
        : DEFAULT_RESOLVED_THEME,
    );

    if (themeApi?.set) {
      try {
        const response = await themeApi.set({ mode });
        if (response.success && response.data) {
          themeMode = isThemeMode(response.data.mode)
            ? response.data.mode
            : mode;

          if (themeMode === "system") {
            const systemResolvedTheme = await getSystemResolvedTheme(themeApi);
            resolvedTheme =
              response.data.resolvedTheme === "light" ||
              response.data.resolvedTheme === "dark"
                ? response.data.resolvedTheme
                : systemResolvedTheme;
          } else {
            resolvedTheme = themeMode;
          }
        }
      } catch {
        // fallback handled by current values
      }
    }

    set({ themeMode, resolvedTheme });
    applyThemeToDOM(resolvedTheme);
  },

  setResolvedTheme: (theme: ResolvedTheme) => {
    const resolvedTheme = isResolvedTheme(theme)
      ? theme
      : DEFAULT_RESOLVED_THEME;
    set({ resolvedTheme });
    applyThemeToDOM(resolvedTheme);
  },

  initializeTheme: async () => {
    const themeApi = getThemeApi();

    if (themeApi?.get) {
      try {
        const response = await themeApi.get();
        if (response.success && response.data) {
          const themeMode = isThemeMode(response.data.mode)
            ? response.data.mode
            : DEFAULT_THEME_MODE;

          const resolvedTheme =
            themeMode === "system"
              ? response.data.resolvedTheme === "light" ||
                response.data.resolvedTheme === "dark"
                ? response.data.resolvedTheme
                : await getSystemResolvedTheme(themeApi)
              : themeMode;

          set({ themeMode, resolvedTheme });
          applyThemeToDOM(resolvedTheme);
          return;
        }
      } catch {
        // fallback below
      }
    }

    const fallbackMode = DEFAULT_THEME_MODE;
    const fallbackResolvedTheme = DEFAULT_RESOLVED_THEME;
    set({ themeMode: fallbackMode, resolvedTheme: fallbackResolvedTheme });
    applyThemeToDOM(fallbackResolvedTheme);
  },
});
