import { describe, it, expect, beforeEach } from "vitest";
import { createSettingsSlice, type SettingsSlice } from "./settingsSlice";
import type { UserProfile } from "../types";

describe("settingsSlice", () => {
  let store: SettingsSlice;
  let mockSet: (
    fn:
      | ((state: SettingsSlice) => Partial<SettingsSlice>)
      | Partial<SettingsSlice>,
  ) => void;

  beforeEach(() => {
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
});
