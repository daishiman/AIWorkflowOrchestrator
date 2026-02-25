import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createSettingsSlice, type SettingsSlice } from "./settingsSlice";
import type { UserProfile } from "../types";

const mockElectronAPI = {
  theme: {
    get: vi.fn(),
    set: vi.fn(),
    getSystem: vi.fn(),
  },
};

describe("settingsSlice", () => {
  let store: SettingsSlice;
  let mockSet: (
    fn:
      | ((state: SettingsSlice) => Partial<SettingsSlice>)
      | Partial<SettingsSlice>,
  ) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal("electronAPI", mockElectronAPI);
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

    const state: Partial<SettingsSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<SettingsSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    store = createSettingsSlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );

    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("theme-transition");
    document.documentElement.style.colorScheme = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const mockProfile: UserProfile = {
    name: "Test User",
    email: "test@example.com",
    avatar: "https://example.com/avatar.jpg",
    plan: "pro",
  };

  describe("初期状態", () => {
    it("userProfileがデフォルト値である", () => {
      expect(store.userProfile).toEqual({
        name: "ユーザー",
        email: "",
        avatar: "",
        plan: "free",
      });
    });

    it("themeMode/resolvedThemeの初期値がkanagawa-dragonである", () => {
      expect(store.themeMode).toBe("kanagawa-dragon");
      expect(store.resolvedTheme).toBe("kanagawa-dragon");
    });
  });

  describe("setUserProfile", () => {
    it("プロフィールを完全に置き換える", () => {
      store.setUserProfile(mockProfile);
      expect(store.userProfile).toEqual(mockProfile);
    });
  });

  describe("updateUserProfile", () => {
    it("プロフィールの一部を更新する", () => {
      store.updateUserProfile({ name: "New Name" });
      expect(store.userProfile.name).toBe("New Name");
      expect(store.userProfile.email).toBe("");
    });
  });

  describe("setApiKey", () => {
    it("APIキーを設定する", () => {
      store.setApiKey("sk-test-key");
      expect(store.apiKey).toBe("sk-test-key");
    });
  });

  describe("setAutoSyncEnabled", () => {
    it("自動同期を切り替える", () => {
      store.setAutoSyncEnabled(false);
      expect(store.autoSyncEnabled).toBe(false);
    });
  });

  describe("setThemeMode", () => {
    it("darkを設定すると状態とDOMが更新される", async () => {
      mockElectronAPI.theme.set.mockResolvedValue({
        success: true,
        data: { mode: "dark", resolvedTheme: "dark" },
      });

      await store.setThemeMode("dark");

      expect(mockElectronAPI.theme.set).toHaveBeenCalledWith({ mode: "dark" });
      expect(store.themeMode).toBe("dark");
      expect(store.resolvedTheme).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });

    it("lightを設定するとcolor-schemeがlightになる", async () => {
      mockElectronAPI.theme.set.mockResolvedValue({
        success: true,
        data: { mode: "light", resolvedTheme: "light" },
      });

      await store.setThemeMode("light");

      expect(store.themeMode).toBe("light");
      expect(store.resolvedTheme).toBe("light");
      expect(document.documentElement.style.colorScheme).toBe("light");
    });

    it("kanagawa-dragonを設定できる", async () => {
      mockElectronAPI.theme.set.mockResolvedValue({
        success: true,
        data: { mode: "kanagawa-dragon", resolvedTheme: "kanagawa-dragon" },
      });

      await store.setThemeMode("kanagawa-dragon");

      expect(store.themeMode).toBe("kanagawa-dragon");
      expect(store.resolvedTheme).toBe("kanagawa-dragon");
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });

    it("system設定時はgetSystemの値でresolvedThemeを決定する", async () => {
      mockElectronAPI.theme.set.mockResolvedValue({
        success: true,
        data: { mode: "system", resolvedTheme: "light" },
      });
      mockElectronAPI.theme.getSystem.mockResolvedValue({
        success: true,
        data: { isDark: false, resolvedTheme: "light" },
      });

      await store.setThemeMode("system");

      expect(store.themeMode).toBe("system");
      expect(store.resolvedTheme).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("electronAPIが利用不可でもsystemを解決できる", async () => {
      vi.stubGlobal("electronAPI", undefined);

      await store.setThemeMode("system");

      expect(store.themeMode).toBe("system");
      expect(store.resolvedTheme).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
  });

  describe("setResolvedTheme", () => {
    it("resolvedThemeを直接更新しDOMへ反映する", () => {
      store.setResolvedTheme("light");
      expect(store.resolvedTheme).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      expect(document.documentElement.style.colorScheme).toBe("light");
    });
  });

  describe("initializeTheme", () => {
    it("electronAPI.theme.getの取得値で初期化する", async () => {
      mockElectronAPI.theme.get.mockResolvedValue({
        success: true,
        data: { mode: "system", resolvedTheme: "dark" },
      });

      await store.initializeTheme();

      expect(mockElectronAPI.theme.get).toHaveBeenCalledTimes(1);
      expect(store.themeMode).toBe("system");
      expect(store.resolvedTheme).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it("取得失敗時はkanagawa-dragonにフォールバックする", async () => {
      mockElectronAPI.theme.get.mockRejectedValue(new Error("get failed"));

      await store.initializeTheme();

      expect(store.themeMode).toBe("kanagawa-dragon");
      expect(store.resolvedTheme).toBe("kanagawa-dragon");
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "kanagawa-dragon",
      );
    });

    it("レスポンスが不正なmodeでも安全に初期化する", async () => {
      mockElectronAPI.theme.get.mockResolvedValue({
        success: true,
        data: { mode: "invalid", resolvedTheme: "dark" },
      });

      await store.initializeTheme();

      expect(store.themeMode).toBe("kanagawa-dragon");
      expect(store.resolvedTheme).toBe("kanagawa-dragon");
    });
  });
});
