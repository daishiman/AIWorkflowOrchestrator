import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create mutable mock functions that can be accessed after resetModules
const mockStoreGet = vi.fn();
const mockStoreSet = vi.fn();

// Mock electron-store BEFORE any imports
vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: mockStoreGet,
    set: mockStoreSet,
  })),
}));

// Store nativeTheme callbacks for testing
let nativeThemeUpdatedCallback: (() => void) | null = null;
let mockShouldUseDarkColors = false;

// Mock webContents.send for testing broadcast
const mockWebContentsSend = vi.fn();

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  nativeTheme: {
    get shouldUseDarkColors() {
      return mockShouldUseDarkColors;
    },
    on: vi.fn((event: string, callback: () => void) => {
      if (event === "updated") {
        nativeThemeUpdatedCallback = callback;
      }
    }),
  },
  BrowserWindow: {
    getAllWindows: vi.fn(() => [
      {
        isDestroyed: () => false,
        webContents: {
          send: mockWebContentsSend,
        },
      },
    ]),
  },
  app: {
    getPath: vi.fn((name: string) => {
      const paths: Record<string, string> = {
        documents: "/Users/test/Documents",
        userData: "/Users/test/Library/Application Support",
        home: "/Users/test",
      };
      return paths[name] || "";
    }),
  },
}));

// Import after mocks are set up
import { ipcMain, nativeTheme, BrowserWindow } from "electron";
import type { ThemeMode, ResolvedTheme } from "../../preload/types";

// Note: themeHandlers.ts does not exist yet - this is TDD Red phase
// These tests will fail until the implementation is created

describe("themeHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  let IPC_CHANNELS: Record<string, string>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();
    nativeThemeUpdatedCallback = null;
    mockShouldUseDarkColors = false;

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Dynamic import to get IPC_CHANNELS
    const channelsModule = await import("../../preload/channels");
    IPC_CHANNELS = channelsModule.IPC_CHANNELS as Record<string, string>;

    // Try to import and register handlers (will fail in Red phase)
    try {
      const { registerThemeHandlers } = await import("./themeHandlers");
      registerThemeHandlers();
    } catch {
      // Expected in Red phase - module doesn't exist or throws
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("registerThemeHandlers", () => {
    it("should register THEME_GET handler", () => {
      expect(handlers.has(IPC_CHANNELS.THEME_GET)).toBe(true);
    });

    it("should register THEME_SET handler", () => {
      expect(handlers.has(IPC_CHANNELS.THEME_SET)).toBe(true);
    });

    it("should register THEME_GET_SYSTEM handler", () => {
      expect(handlers.has(IPC_CHANNELS.THEME_GET_SYSTEM)).toBe(true);
    });
  });

  describe("THEME_GET handler", () => {
    it("should return saved theme mode with resolved theme", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_GET);
      if (!handler) {
        throw new Error("THEME_GET handler not registered");
      }

      mockStoreGet.mockReturnValue("dark");

      const result = (await handler({})) as {
        success: boolean;
        data: { mode: ThemeMode; resolvedTheme: ResolvedTheme };
      };

      expect(result).toEqual({
        success: true,
        data: {
          mode: "dark",
          resolvedTheme: "dark",
        },
      });
    });

    it("should return default theme (system) when no saved value", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_GET);
      if (!handler) {
        throw new Error("THEME_GET handler not registered");
      }

      mockStoreGet.mockReturnValue(undefined);
      // Mock system theme as dark
      mockShouldUseDarkColors = true;

      const result = (await handler({})) as {
        success: boolean;
        data: { mode: ThemeMode; resolvedTheme: ResolvedTheme };
      };

      expect(result.success).toBe(true);
      expect(result.data?.mode).toBe("system");
      expect(result.data?.resolvedTheme).toBe("dark");
    });

    it("should resolve system theme to light when OS is in light mode", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_GET);
      if (!handler) {
        throw new Error("THEME_GET handler not registered");
      }

      mockStoreGet.mockReturnValue("system");
      mockShouldUseDarkColors = false;

      const result = (await handler({})) as {
        success: boolean;
        data: { mode: ThemeMode; resolvedTheme: ResolvedTheme };
      };

      expect(result.data?.mode).toBe("system");
      expect(result.data?.resolvedTheme).toBe("light");
    });

    it("should resolve system theme to dark when OS is in dark mode", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_GET);
      if (!handler) {
        throw new Error("THEME_GET handler not registered");
      }

      mockStoreGet.mockReturnValue("system");
      mockShouldUseDarkColors = true;

      const result = (await handler({})) as {
        success: boolean;
        data: { mode: ThemeMode; resolvedTheme: ResolvedTheme };
      };

      expect(result.data?.mode).toBe("system");
      expect(result.data?.resolvedTheme).toBe("dark");
    });

    it("should return fallback on store error", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_GET);
      if (!handler) {
        throw new Error("THEME_GET handler not registered");
      }

      mockStoreGet.mockImplementation(() => {
        throw new Error("Store read error");
      });

      const result = (await handler({})) as {
        success: boolean;
        data: { mode: ThemeMode; resolvedTheme: ResolvedTheme };
      };

      // Should return success with fallback values
      expect(result.success).toBe(true);
      expect(result.data?.mode).toBe("system");
    });
  });

  describe("THEME_SET handler", () => {
    it("should save theme mode and return success", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      const result = (await handler({}, { mode: "dark" })) as {
        success: boolean;
        data: { mode: ThemeMode; resolvedTheme: ResolvedTheme };
      };

      expect(result).toEqual({
        success: true,
        data: {
          mode: "dark",
          resolvedTheme: "dark",
        },
      });
      expect(mockStoreSet).toHaveBeenCalledWith("theme.mode", "dark");
    });

    it("should save light theme", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      const result = (await handler({}, { mode: "light" })) as {
        success: boolean;
        data: { mode: ThemeMode; resolvedTheme: ResolvedTheme };
      };

      expect(result.success).toBe(true);
      expect(result.data?.mode).toBe("light");
      expect(result.data?.resolvedTheme).toBe("light");
      expect(mockStoreSet).toHaveBeenCalledWith("theme.mode", "light");
    });

    it("should save system theme and resolve based on OS", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      mockShouldUseDarkColors = true;

      const result = (await handler({}, { mode: "system" })) as {
        success: boolean;
        data: { mode: ThemeMode; resolvedTheme: ResolvedTheme };
      };

      expect(result.success).toBe(true);
      expect(result.data?.mode).toBe("system");
      expect(result.data?.resolvedTheme).toBe("dark");
      expect(mockStoreSet).toHaveBeenCalledWith("theme.mode", "system");
    });

    it("should reject invalid theme mode (not a string)", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      const result = (await handler({}, { mode: 123 })) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("must be a string");
      expect(mockStoreSet).not.toHaveBeenCalled();
    });

    it("should reject invalid theme mode value", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      const result = (await handler({}, { mode: "invalid" })) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid theme mode");
      expect(mockStoreSet).not.toHaveBeenCalled();
    });

    it("should reject empty string theme mode", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      const result = (await handler({}, { mode: "" })) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid theme mode");
    });

    it("should return error on store write failure", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      mockStoreSet.mockImplementation(() => {
        throw new Error("Store write error");
      });

      const result = (await handler({}, { mode: "dark" })) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe("THEME_GET_SYSTEM handler", () => {
    it("should return dark when OS is in dark mode", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_GET_SYSTEM);
      if (!handler) {
        throw new Error("THEME_GET_SYSTEM handler not registered");
      }

      mockShouldUseDarkColors = true;

      const result = (await handler({})) as {
        success: boolean;
        data: { isDark: boolean; resolvedTheme: ResolvedTheme };
      };

      expect(result).toEqual({
        success: true,
        data: {
          isDark: true,
          resolvedTheme: "dark",
        },
      });
    });

    it("should return light when OS is in light mode", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_GET_SYSTEM);
      if (!handler) {
        throw new Error("THEME_GET_SYSTEM handler not registered");
      }

      mockShouldUseDarkColors = false;

      const result = (await handler({})) as {
        success: boolean;
        data: { isDark: boolean; resolvedTheme: ResolvedTheme };
      };

      expect(result).toEqual({
        success: true,
        data: {
          isDark: false,
          resolvedTheme: "light",
        },
      });
    });
  });

  describe("setupThemeWatcher", () => {
    it("should register nativeTheme updated listener", async () => {
      try {
        const { setupThemeWatcher } = await import("./themeHandlers");
        setupThemeWatcher(nativeTheme, () => BrowserWindow.getAllWindows());

        expect(nativeTheme.on).toHaveBeenCalledWith(
          "updated",
          expect.any(Function),
        );
      } catch {
        // Expected in Red phase - check that the error is "Not implemented"
        throw new Error("setupThemeWatcher not implemented");
      }
    });

    it("should broadcast to all windows on theme change", async () => {
      try {
        const { setupThemeWatcher } = await import("./themeHandlers");
        setupThemeWatcher(nativeTheme, () => BrowserWindow.getAllWindows());

        // Trigger the callback
        if (nativeThemeUpdatedCallback) {
          mockShouldUseDarkColors = true;
          nativeThemeUpdatedCallback();

          expect(mockWebContentsSend).toHaveBeenCalledWith(
            IPC_CHANNELS.THEME_SYSTEM_CHANGED,
            expect.objectContaining({
              isDark: true,
              resolvedTheme: "dark",
            }),
          );
        }
      } catch {
        // Expected in Red phase
        throw new Error("setupThemeWatcher not implemented");
      }
    });

    it("should not send to destroyed windows", async () => {
      // Setup mock with destroyed window
      (BrowserWindow.getAllWindows as ReturnType<typeof vi.fn>).mockReturnValue(
        [
          {
            isDestroyed: () => true,
            webContents: {
              send: mockWebContentsSend,
            },
          },
        ],
      );

      try {
        const { setupThemeWatcher } = await import("./themeHandlers");
        setupThemeWatcher(nativeTheme, () => BrowserWindow.getAllWindows());

        if (nativeThemeUpdatedCallback) {
          nativeThemeUpdatedCallback();
          expect(mockWebContentsSend).not.toHaveBeenCalled();
        }
      } catch {
        // Expected in Red phase
        throw new Error("setupThemeWatcher not implemented");
      }
    });

    it("should return unsubscribe function", async () => {
      try {
        const { setupThemeWatcher } = await import("./themeHandlers");
        const unsubscribe = setupThemeWatcher(nativeTheme, () =>
          BrowserWindow.getAllWindows(),
        );

        expect(typeof unsubscribe).toBe("function");
      } catch {
        // Expected in Red phase
        throw new Error("setupThemeWatcher not implemented");
      }
    });
  });

  describe("validateThemeMode", () => {
    beforeEach(() => {
      // Reset mock store to default state for validation tests
      mockStoreGet.mockReturnValue("system");
      mockStoreSet.mockReturnValue(undefined);
    });

    it("should accept 'light' as valid", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      const result = (await handler({}, { mode: "light" })) as {
        success: boolean;
      };
      expect(result.success).toBe(true);
    });

    it("should accept 'dark' as valid", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      const result = (await handler({}, { mode: "dark" })) as {
        success: boolean;
      };
      expect(result.success).toBe(true);
    });

    it("should accept 'system' as valid", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      const result = (await handler({}, { mode: "system" })) as {
        success: boolean;
      };
      expect(result.success).toBe(true);
    });

    it("should reject null", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      const result = (await handler({}, { mode: null })) as {
        success: boolean;
        error?: string;
      };
      expect(result.success).toBe(false);
    });

    it("should reject undefined", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      const result = (await handler({}, { mode: undefined })) as {
        success: boolean;
        error?: string;
      };
      expect(result.success).toBe(false);
    });

    it("should reject object", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      const result = (await handler({}, { mode: { value: "dark" } })) as {
        success: boolean;
        error?: string;
      };
      expect(result.success).toBe(false);
    });

    it("should reject array", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_SET);
      if (!handler) {
        throw new Error("THEME_SET handler not registered");
      }

      const result = (await handler({}, { mode: ["dark"] })) as {
        success: boolean;
        error?: string;
      };
      expect(result.success).toBe(false);
    });
  });

  describe("resolveTheme helper", () => {
    it("should resolve light mode to light", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_GET);
      if (!handler) {
        throw new Error("THEME_GET handler not registered");
      }

      mockStoreGet.mockReturnValue("light");

      const result = (await handler({})) as {
        success: boolean;
        data: { mode: ThemeMode; resolvedTheme: ResolvedTheme };
      };

      expect(result.data?.resolvedTheme).toBe("light");
    });

    it("should resolve dark mode to dark", async () => {
      const handler = handlers.get(IPC_CHANNELS.THEME_GET);
      if (!handler) {
        throw new Error("THEME_GET handler not registered");
      }

      mockStoreGet.mockReturnValue("dark");

      const result = (await handler({})) as {
        success: boolean;
        data: { mode: ThemeMode; resolvedTheme: ResolvedTheme };
      };

      expect(result.data?.resolvedTheme).toBe("dark");
    });
  });
});
