import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createSettingsSlice, type SettingsSlice } from "./settingsSlice";
import type { UserProfile } from "../types";

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
      // テーマはKanagawa Dragon固定
      expect(store.themeMode).toBe("kanagawa-dragon");
      expect(store.resolvedTheme).toBe("kanagawa-dragon");

      vi.stubGlobal("electronAPI", mockElectronAPI);
    });

    it("electronAPI.theme.setが利用不可の場合もKanagawa Dragon固定", async () => {
      vi.stubGlobal("electronAPI", { theme: {} });
      const newStore = createSettingsSlice(
        mockSet as never,
        (() => store) as never,
        {} as never,
      );

      await newStore.setThemeMode("light");
      // テーマはKanagawa Dragon固定
      expect(store.themeMode).toBe("kanagawa-dragon");
      expect(store.resolvedTheme).toBe("kanagawa-dragon");

      vi.stubGlobal("electronAPI", mockElectronAPI);
    });

    it("systemモードを指定してもKanagawa Dragon固定", async () => {
      vi.stubGlobal("electronAPI", { theme: {} });
      const newStore = createSettingsSlice(
        mockSet as never,
        (() => store) as never,
        {} as never,
      );

      await newStore.setThemeMode("system");
      // テーマはKanagawa Dragon固定（変更不可）
      expect(store.themeMode).toBe("kanagawa-dragon");
      expect(store.resolvedTheme).toBe("kanagawa-dragon");

      vi.stubGlobal("electronAPI", mockElectronAPI);
    });

    it("テーマは常にKanagawa Dragon固定", async () => {
      // テーマはKanagawa Dragon固定（変更不可）
      await store.setThemeMode("dark");
      expect(store.themeMode).toBe("kanagawa-dragon");
      expect(store.resolvedTheme).toBe("kanagawa-dragon");
    });

    it("任意のテーマを指定してもKanagawa Dragonのまま", async () => {
      await store.setThemeMode("light");
      expect(store.themeMode).toBe("kanagawa-dragon");
      expect(store.resolvedTheme).toBe("kanagawa-dragon");
    });

    it("systemを指定してもKanagawa Dragonのまま", async () => {
      await store.setThemeMode("system");
      expect(store.themeMode).toBe("kanagawa-dragon");
      expect(store.resolvedTheme).toBe("kanagawa-dragon");
    });
  });

  describe("setResolvedTheme", () => {
    it("resolvedThemeは常にKanagawa Dragon固定", () => {
      store.setResolvedTheme("light");
      // テーマは固定なのでkanagawa-dragonのまま
      expect(store.resolvedTheme).toBe("kanagawa-dragon");
    });

    it("DOMにKanagawa Dragonテーマを適用する", () => {
      store.setResolvedTheme("dark");
      // テーマは固定なのでkanagawa-dragonが適用される
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "kanagawa-dragon",
      );
    });
  });

  describe("initializeTheme", () => {
    it("初期化時にKanagawa Dragonテーマが適用される", async () => {
      vi.stubGlobal("electronAPI", undefined);
      const newStore = createSettingsSlice(
        mockSet as never,
        (() => store) as never,
        {} as never,
      );

      await newStore.initializeTheme();
      // テーマは常にKanagawa Dragon固定
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "kanagawa-dragon",
      );

      vi.stubGlobal("electronAPI", mockElectronAPI);
    });

    it("electronAPIの有無に関わらずKanagawa Dragonが適用される", async () => {
      await store.initializeTheme();
      expect(store.themeMode).toBe("kanagawa-dragon");
      expect(store.resolvedTheme).toBe("kanagawa-dragon");
    });
  });
});
