import { ipcMain, nativeTheme, BrowserWindow } from "electron";
import type { IpcMain, NativeTheme } from "electron";
import Store from "electron-store";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  ThemeMode,
  ResolvedTheme,
  ThemeGetResponse,
  ThemeSetRequest,
  ThemeSetResponse,
  ThemeGetSystemResponse,
  ThemeSystemChangedEvent,
} from "../../preload/types";

// Store schema for theme
interface ThemeStoreSchema {
  "theme.mode": ThemeMode;
}

// Lazy-initialized store instance
let themeStore: Store<ThemeStoreSchema> | null = null;

function getThemeStore(): Store<ThemeStoreSchema> {
  if (!themeStore) {
    themeStore = new Store<ThemeStoreSchema>({
      name: "knowledge-studio-theme",
      defaults: {
        "theme.mode": "system",
      },
    });
  }
  return themeStore;
}

// Valid theme modes
const VALID_THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"];

/**
 * Validate theme mode input
 */
export function validateThemeMode(mode: unknown): mode is ThemeMode {
  if (typeof mode !== "string") {
    return false;
  }
  return VALID_THEME_MODES.includes(mode as ThemeMode);
}

/**
 * Resolve theme mode to actual theme (light or dark)
 */
function resolveTheme(mode: ThemeMode, isDark: boolean): ResolvedTheme {
  if (mode === "system") {
    return isDark ? "dark" : "light";
  }
  return mode;
}

export interface ThemeHandlerDependencies {
  ipcMain: IpcMain;
  nativeTheme: NativeTheme;
  getAllWindows: () => BrowserWindow[];
}

/**
 * Register theme-related IPC handlers
 */
export function registerThemeHandlers(deps?: ThemeHandlerDependencies): void {
  const main = deps?.ipcMain ?? ipcMain;
  const theme = deps?.nativeTheme ?? nativeTheme;

  // THEME_GET: Get current theme settings
  main.handle(IPC_CHANNELS.THEME_GET, async (): Promise<ThemeGetResponse> => {
    try {
      const store = getThemeStore();
      let mode: ThemeMode;

      try {
        mode = store.get("theme.mode", "system") as ThemeMode;
      } catch {
        // Fallback on store read error
        mode = "system";
      }

      // Validate stored mode
      if (!validateThemeMode(mode)) {
        mode = "system";
      }

      const isDark = theme.shouldUseDarkColors;
      const resolvedTheme = resolveTheme(mode, isDark);

      return {
        success: true,
        data: {
          mode,
          resolvedTheme,
        },
      };
    } catch {
      // Return fallback on any error
      return {
        success: true,
        data: {
          mode: "system",
          resolvedTheme: theme.shouldUseDarkColors ? "dark" : "light",
        },
      };
    }
  });

  // THEME_SET: Set theme mode
  main.handle(
    IPC_CHANNELS.THEME_SET,
    async (_event, request: ThemeSetRequest): Promise<ThemeSetResponse> => {
      try {
        const { mode } = request;

        // Validate input
        if (typeof mode !== "string") {
          return {
            success: false,
            error: "Theme mode must be a string",
          };
        }

        if (!validateThemeMode(mode)) {
          return {
            success: false,
            error: `Invalid theme mode: "${mode}". Must be one of: ${VALID_THEME_MODES.join(", ")}`,
          };
        }

        // Save to store
        const store = getThemeStore();
        store.set("theme.mode", mode);

        const isDark = theme.shouldUseDarkColors;
        const resolvedTheme = resolveTheme(mode, isDark);

        return {
          success: true,
          data: {
            mode,
            resolvedTheme,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // THEME_GET_SYSTEM: Get current system theme
  main.handle(
    IPC_CHANNELS.THEME_GET_SYSTEM,
    async (): Promise<ThemeGetSystemResponse> => {
      try {
        const isDark = theme.shouldUseDarkColors;
        return {
          success: true,
          data: {
            isDark,
            resolvedTheme: isDark ? "dark" : "light",
          },
        };
      } catch {
        // Fallback to dark on error
        return {
          success: true,
          data: {
            isDark: true,
            resolvedTheme: "dark",
          },
        };
      }
    },
  );
}

/**
 * Setup system theme change watcher
 * Broadcasts theme changes to all renderer windows
 */
export function setupThemeWatcher(
  theme: NativeTheme,
  getAllWindows: () => BrowserWindow[],
): () => void {
  const handler = () => {
    const isDark = theme.shouldUseDarkColors;
    const event: ThemeSystemChangedEvent = {
      isDark,
      resolvedTheme: isDark ? "dark" : "light",
    };

    // Broadcast to all windows
    const windows = getAllWindows();
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.THEME_SYSTEM_CHANGED, event);
      }
    }
  };

  theme.on("updated", handler);

  // Return unsubscribe function
  return () => {
    theme.removeListener("updated", handler);
  };
}

// Export for testing
export { getThemeStore };
