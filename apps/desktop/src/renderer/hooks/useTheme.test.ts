import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock Zustand store BEFORE any imports
const mockThemeMode = vi.fn();
const mockResolvedTheme = vi.fn();
const mockSetThemeMode = vi.fn();
const mockSetResolvedTheme = vi.fn();

vi.mock("../store", () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      themeMode: mockThemeMode(),
      resolvedTheme: mockResolvedTheme(),
      setThemeMode: mockSetThemeMode,
      setResolvedTheme: mockSetResolvedTheme,
    };
    return selector(state);
  }),
}));

// Mock window.electronAPI
const mockOnSystemChanged = vi.fn();
const mockUnsubscribe = vi.fn();

let systemChangedCallback:
  | ((event: { isDark: boolean; resolvedTheme: "light" | "dark" }) => void)
  | null = null;

// Store original electronAPI
const originalElectronAPI = (globalThis as { electronAPI?: unknown })
  .electronAPI;

beforeEach(() => {
  vi.clearAllMocks();
  systemChangedCallback = null;

  // Default mock values
  mockThemeMode.mockReturnValue("system");
  mockResolvedTheme.mockReturnValue("dark");
  mockSetThemeMode.mockResolvedValue(undefined);
  mockSetResolvedTheme.mockReturnValue(undefined);

  mockOnSystemChanged.mockImplementation((callback) => {
    systemChangedCallback = callback;
    return mockUnsubscribe;
  });

  // Extend window.electronAPI instead of replacing window entirely
  Object.defineProperty(globalThis, "electronAPI", {
    value: {
      theme: {
        onSystemChanged: mockOnSystemChanged,
      },
    },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  // Restore original electronAPI
  if (originalElectronAPI !== undefined) {
    Object.defineProperty(globalThis, "electronAPI", {
      value: originalElectronAPI,
      configurable: true,
      writable: true,
    });
  } else {
    delete (globalThis as any).electronAPI;
  }
  vi.resetModules();
});

// Import hook after mocks are setup
import { useTheme } from "./useTheme";

describe("useTheme", () => {
  describe("初期状態", () => {
    it("should return theme state from Zustand store", () => {
      mockThemeMode.mockReturnValue("dark");
      mockResolvedTheme.mockReturnValue("dark");

      const { result } = renderHook(() => useTheme());

      expect(result.current.themeMode).toBe("dark");
      expect(result.current.resolvedTheme).toBe("dark");
    });

    it("should have system as default theme mode", () => {
      mockThemeMode.mockReturnValue("system");

      const { result } = renderHook(() => useTheme());

      expect(result.current.themeMode).toBe("system");
    });

    it("should derive isDark from resolvedTheme", () => {
      mockResolvedTheme.mockReturnValue("dark");

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(true);
    });

    it("should return isDark false when resolvedTheme is light", () => {
      mockResolvedTheme.mockReturnValue("light");

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);
    });
  });

  describe("setTheme", () => {
    it("should call setThemeMode from store", async () => {
      const { result } = renderHook(() => useTheme());

      await act(async () => {
        await result.current.setTheme("dark");
      });

      expect(mockSetThemeMode).toHaveBeenCalledWith("dark");
    });

    it("should set theme to light", async () => {
      const { result } = renderHook(() => useTheme());

      await act(async () => {
        await result.current.setTheme("light");
      });

      expect(mockSetThemeMode).toHaveBeenCalledWith("light");
    });

    it("should set theme to system", async () => {
      const { result } = renderHook(() => useTheme());

      await act(async () => {
        await result.current.setTheme("system");
      });

      expect(mockSetThemeMode).toHaveBeenCalledWith("system");
    });
  });

  describe("システムテーマ監視", () => {
    it("should register system theme change listener on mount", () => {
      renderHook(() => useTheme());

      expect(mockOnSystemChanged).toHaveBeenCalled();
    });

    it("should unsubscribe on unmount", () => {
      const { unmount } = renderHook(() => useTheme());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should update resolvedTheme when system theme changes (in system mode)", () => {
      mockThemeMode.mockReturnValue("system");

      renderHook(() => useTheme());

      // Simulate OS theme change
      act(() => {
        if (systemChangedCallback) {
          systemChangedCallback({ isDark: false, resolvedTheme: "light" });
        }
      });

      expect(mockSetResolvedTheme).toHaveBeenCalledWith("light");
    });

    it("should NOT update resolvedTheme when NOT in system mode", () => {
      mockThemeMode.mockReturnValue("dark");

      renderHook(() => useTheme());

      // Simulate OS theme change
      act(() => {
        if (systemChangedCallback) {
          systemChangedCallback({ isDark: false, resolvedTheme: "light" });
        }
      });

      // Should not call setResolvedTheme because we're not in system mode
      expect(mockSetResolvedTheme).not.toHaveBeenCalled();
    });

    it("should NOT update resolvedTheme when in light mode", () => {
      mockThemeMode.mockReturnValue("light");

      renderHook(() => useTheme());

      // Simulate OS theme change
      act(() => {
        if (systemChangedCallback) {
          systemChangedCallback({ isDark: true, resolvedTheme: "dark" });
        }
      });

      // Should not call setResolvedTheme because we're not in system mode
      expect(mockSetResolvedTheme).not.toHaveBeenCalled();
    });
  });

  describe("isDark ヘルパー", () => {
    it("should return true when resolvedTheme is dark", () => {
      mockResolvedTheme.mockReturnValue("dark");

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(true);
    });

    it("should return false when resolvedTheme is light", () => {
      mockResolvedTheme.mockReturnValue("light");

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);
    });
  });

  describe("パフォーマンス", () => {
    it("should memoize setTheme function", () => {
      const { result, rerender } = renderHook(() => useTheme());

      const firstSetTheme = result.current.setTheme;
      rerender();
      const secondSetTheme = result.current.setTheme;

      // setTheme should be memoized (same reference)
      expect(firstSetTheme).toBe(secondSetTheme);
    });
  });
});
