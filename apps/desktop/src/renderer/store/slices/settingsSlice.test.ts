import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createSettingsSlice, type SettingsSlice } from "./settingsSlice";
import type { UserProfile, ThemeMode, ResolvedTheme } from "../types";

// Mock window.electronAPI
const mockElectronAPI = {
  theme: {
    get: vi.fn(),
    set: vi.fn(),
    getSystem: vi.fn(),
  },
};

vi.stubGlobal("electronAPI", mockElectronAPI);

describe("settingsSlice", () => {
  let store: SettingsSlice;
  let mockSet: (
    fn:
      | ((state: SettingsSlice) => Partial<SettingsSlice>)
      | Partial<SettingsSlice>,
  ) => void;

  beforeEach(() => {
    vi.clearAllMocks();
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

    // Reset document state
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("theme-transition");
  });

  afterEach(() => {
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

    it("apiKeyが空文字列である", () => {
      expect(store.apiKey).toBe("");
    });

    it("autoSyncEnabledがtrueである", () => {
      expect(store.autoSyncEnabled).toBe(true);
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

    it("複数のフィールドを更新できる", () => {
      store.updateUserProfile({
        name: "New Name",
        email: "new@example.com",
      });
      expect(store.userProfile.name).toBe("New Name");
      expect(store.userProfile.email).toBe("new@example.com");
    });

    it("他のフィールドは保持される", () => {
      store.setUserProfile(mockProfile);
      store.updateUserProfile({ name: "Updated" });
      expect(store.userProfile.email).toBe("test@example.com");
      expect(store.userProfile.plan).toBe("pro");
    });
  });

  describe("setApiKey", () => {
    it("APIキーを設定する", () => {
      store.setApiKey("sk-test-key");
      expect(store.apiKey).toBe("sk-test-key");
    });

    it("空のAPIキーを設定できる", () => {
      store.setApiKey("sk-test-key");
      store.setApiKey("");
      expect(store.apiKey).toBe("");
    });
  });

  describe("setAutoSyncEnabled", () => {
    it("自動同期を無効にする", () => {
      store.setAutoSyncEnabled(false);
      expect(store.autoSyncEnabled).toBe(false);
    });

    it("自動同期を有効にする", () => {
      store.setAutoSyncEnabled(false);
      store.setAutoSyncEnabled(true);
      expect(store.autoSyncEnabled).toBe(true);
    });
  });

  describe("setThemeMode", () => {
    it("electronAPIが利用不可の場合、フォールバックで動作する", async () => {
      vi.stubGlobal("electronAPI", undefined);
      const newStore = createSettingsSlice(
        mockSet as never,
        (() => store) as never,
        {} as never,
      );

      await newStore.setThemeMode("dark");
      expect(store.themeMode).toBe("dark");
      expect(store.resolvedTheme).toBe("dark");

      vi.stubGlobal("electronAPI", mockElectronAPI);
    });

    it("electronAPI.theme.setが利用不可の場合、フォールバックで動作する", async () => {
      vi.stubGlobal("electronAPI", { theme: {} });
      const newStore = createSettingsSlice(
        mockSet as never,
        (() => store) as never,
        {} as never,
      );

      await newStore.setThemeMode("light");
      expect(store.themeMode).toBe("light");
      expect(store.resolvedTheme).toBe("light");

      vi.stubGlobal("electronAPI", mockElectronAPI);
    });

    it("systemモードの場合、resolvedThemeはdarkにフォールバックする", async () => {
      vi.stubGlobal("electronAPI", { theme: {} });
      const newStore = createSettingsSlice(
        mockSet as never,
        (() => store) as never,
        {} as never,
      );

      await newStore.setThemeMode("system");
      expect(store.themeMode).toBe("system");
      expect(store.resolvedTheme).toBe("dark");

      vi.stubGlobal("electronAPI", mockElectronAPI);
    });

    it("IPC成功時にテーマを設定する", async () => {
      mockElectronAPI.theme.set.mockResolvedValue({
        success: true,
        data: {
          mode: "dark" as ThemeMode,
          resolvedTheme: "dark" as ResolvedTheme,
        },
      });

      await store.setThemeMode("dark");
      expect(store.themeMode).toBe("dark");
      expect(store.resolvedTheme).toBe("dark");
    });

    it("IPC失敗時にフォールバック処理を行う", async () => {
      mockElectronAPI.theme.set.mockRejectedValue(new Error("IPC error"));
      mockElectronAPI.theme.getSystem.mockRejectedValue(
        new Error("System error"),
      );

      await store.setThemeMode("system");
      expect(store.themeMode).toBe("system");
      expect(store.resolvedTheme).toBe("dark");
    });

    it("IPC失敗時にシステムテーマを取得して設定する", async () => {
      mockElectronAPI.theme.set.mockRejectedValue(new Error("IPC error"));
      mockElectronAPI.theme.getSystem.mockResolvedValue({
        data: { resolvedTheme: "light" as ResolvedTheme },
      });

      await store.setThemeMode("system");
      expect(store.resolvedTheme).toBe("light");
    });

    it("IPC失敗かつlight/darkモードの場合、直接設定する", async () => {
      mockElectronAPI.theme.set.mockRejectedValue(new Error("IPC error"));

      await store.setThemeMode("light");
      expect(store.themeMode).toBe("light");
      expect(store.resolvedTheme).toBe("light");
    });
  });

  describe("setResolvedTheme", () => {
    it("resolvedThemeを直接設定する", () => {
      store.setResolvedTheme("light");
      expect(store.resolvedTheme).toBe("light");
    });

    it("DOMにテーマを適用する", () => {
      store.setResolvedTheme("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
  });

  describe("initializeTheme", () => {
    it("electronAPIが利用不可の場合、デフォルトを使用する", async () => {
      vi.stubGlobal("electronAPI", undefined);
      const newStore = createSettingsSlice(
        mockSet as never,
        (() => store) as never,
        {} as never,
      );

      await newStore.initializeTheme();
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

      vi.stubGlobal("electronAPI", mockElectronAPI);
    });

    it("electronAPI.theme.getが利用不可の場合、デフォルトを使用する", async () => {
      vi.stubGlobal("electronAPI", { theme: {} });
      const newStore = createSettingsSlice(
        mockSet as never,
        (() => store) as never,
        {} as never,
      );

      await newStore.initializeTheme();
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

      vi.stubGlobal("electronAPI", mockElectronAPI);
    });

    it("IPC成功時にテーマを初期化する", async () => {
      mockElectronAPI.theme.get.mockResolvedValue({
        success: true,
        data: {
          mode: "light" as ThemeMode,
          resolvedTheme: "light" as ResolvedTheme,
        },
      });

      await store.initializeTheme();
      expect(store.themeMode).toBe("light");
      expect(store.resolvedTheme).toBe("light");
    });

    it("IPC失敗時にデフォルトを使用する", async () => {
      mockElectronAPI.theme.get.mockRejectedValue(new Error("IPC error"));

      await store.initializeTheme();
      expect(store.resolvedTheme).toBe("dark");
    });
  });
});
