/**
 * @file settingsSlice.kanagawa.test.ts
 * @description Kanagawaテーマ切り替えのテスト（TDD: Red）
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAppStore } from "../index";
import type { ThemeMode } from "../types";

describe("settingsSlice - Kanagawa Theme", () => {
  beforeEach(() => {
    // Reset store to initial state
    useAppStore.setState({
      themeMode: "kanagawa-dragon",
      resolvedTheme: "kanagawa-dragon",
    });

    // DOM環境のセットアップ
    vi.stubGlobal("document", {
      documentElement: {
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
        style: {
          colorScheme: "",
        },
      },
    });

    // window.matchMediaのモック
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Electron APIのモック
    vi.stubGlobal("electronAPI", {
      theme: {
        get: vi.fn().mockResolvedValue({
          mode: "kanagawa-dragon",
          resolvedTheme: "kanagawa-dragon",
        }),
        set: vi.fn().mockResolvedValue({
          mode: "kanagawa-dragon",
          resolvedTheme: "kanagawa-dragon",
        }),
        onChange: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe("デフォルト状態", () => {
    it("should have kanagawa-dragon as default themeMode", () => {
      const state = useAppStore.getState();
      expect(state.themeMode).toBe("kanagawa-dragon");
    });

    it("should have kanagawa-dragon as default resolvedTheme", () => {
      const state = useAppStore.getState();
      expect(state.resolvedTheme).toBe("kanagawa-dragon");
    });
  });

  describe("Kanagawaテーマ固定", () => {
    it("should always be kanagawa-dragon regardless of setThemeMode call", async () => {
      const { setThemeMode } = useAppStore.getState();

      // setThemeModeを呼んでもkanagawa-dragonのまま
      await setThemeMode("kanagawa-wave");
      expect(useAppStore.getState().themeMode).toBe("kanagawa-dragon");
      expect(useAppStore.getState().resolvedTheme).toBe("kanagawa-dragon");

      await setThemeMode("kanagawa-lotus");
      expect(useAppStore.getState().themeMode).toBe("kanagawa-dragon");
      expect(useAppStore.getState().resolvedTheme).toBe("kanagawa-dragon");

      await setThemeMode("light");
      expect(useAppStore.getState().themeMode).toBe("kanagawa-dragon");
      expect(useAppStore.getState().resolvedTheme).toBe("kanagawa-dragon");
    });

    it("should keep kanagawa-dragon when trying to set dragon", async () => {
      const { setThemeMode } = useAppStore.getState();
      await setThemeMode("kanagawa-dragon");

      const state = useAppStore.getState();
      expect(state.themeMode).toBe("kanagawa-dragon");
      expect(state.resolvedTheme).toBe("kanagawa-dragon");
    });
  });

  describe("systemモード時もKanagawa Dragon固定", () => {
    it("should always resolve to kanagawa-dragon even when system mode is requested", async () => {
      const { setThemeMode } = useAppStore.getState();
      await setThemeMode("system");

      const state = useAppStore.getState();
      // systemを指定してもkanagawa-dragon固定
      expect(state.themeMode).toBe("kanagawa-dragon");
      expect(state.resolvedTheme).toBe("kanagawa-dragon");
    });
  });

  describe("applyThemeToDOM", () => {
    it("should always set data-theme attribute to kanagawa-dragon", async () => {
      const { setThemeMode } = useAppStore.getState();
      await setThemeMode("kanagawa-dragon");

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        "data-theme",
        "kanagawa-dragon",
      );
    });

    it("should set data-theme to kanagawa-dragon even when other theme requested", async () => {
      const { setThemeMode } = useAppStore.getState();
      await setThemeMode("kanagawa-wave");

      // wave を指定しても dragon が設定される
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        "data-theme",
        "kanagawa-dragon",
      );
    });

    it("should always set color-scheme to dark (kanagawa-dragon)", async () => {
      const { setThemeMode } = useAppStore.getState();
      await setThemeMode("kanagawa-dragon");

      expect(document.documentElement.style.colorScheme).toBe("dark");
    });
  });

  describe("エッジケース: ElectronAPI不可時", () => {
    it("should always be kanagawa-dragon when electronAPI is undefined", async () => {
      vi.stubGlobal("electronAPI", undefined);

      const { setThemeMode } = useAppStore.getState();
      await setThemeMode("system");

      const state = useAppStore.getState();
      // テーマは常にkanagawa-dragon固定
      expect(state.resolvedTheme).toBe("kanagawa-dragon");
    });

    it("should handle missing matchMedia gracefully", async () => {
      vi.stubGlobal("electronAPI", undefined);
      // matchMedia をundefinedにモック
      vi.stubGlobal("matchMedia", undefined);

      const { setThemeMode } = useAppStore.getState();
      await setThemeMode("system");

      const state = useAppStore.getState();
      // テーマは常にkanagawa-dragon固定
      expect(state.resolvedTheme).toBe("kanagawa-dragon");
    });
  });

  describe("型安全性", () => {
    it("should only accept valid ThemeMode values", async () => {
      const { setThemeMode } = useAppStore.getState();
      const validThemes: ThemeMode[] = [
        "light",
        "dark",
        "system",
        "kanagawa-dragon",
        "kanagawa-wave",
        "kanagawa-lotus",
      ];

      for (const theme of validThemes) {
        await expect(setThemeMode(theme)).resolves.not.toThrow();
      }
    });
  });
});
