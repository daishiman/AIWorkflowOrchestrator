import { describe, it, expect, beforeEach } from "vitest";
import { createNavigationSlice, type NavigationSlice } from "./navigationSlice";

describe("navigationSlice", () => {
  let store: NavigationSlice;
  let mockSet: (
    fn: (state: NavigationSlice) => Partial<NavigationSlice>,
  ) => void;
  let mockGet: () => NavigationSlice;

  beforeEach(() => {
    // Create a simple mock store
    const state: Partial<NavigationSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<NavigationSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };
    mockGet = () => store;

    // Initialize the slice
    store = createNavigationSlice(
      mockSet as never,
      mockGet as never,
      {} as never,
    );
  });

  describe("初期状態", () => {
    it("currentViewがdashboardである", () => {
      expect(store.currentView).toBe("dashboard");
    });

    it("viewHistoryにdashboardが含まれる", () => {
      expect(store.viewHistory).toEqual(["dashboard"]);
    });
  });

  describe("setCurrentView", () => {
    it("ビューを変更する", () => {
      store.setCurrentView("editor");
      expect(store.currentView).toBe("editor");
    });

    it("履歴に追加する", () => {
      store.setCurrentView("editor");
      expect(store.viewHistory).toEqual(["dashboard", "editor"]);
    });

    it("同じビューには変更しない", () => {
      store.setCurrentView("dashboard");
      expect(store.viewHistory).toEqual(["dashboard"]);
    });

    it("複数回の変更で履歴が増える", () => {
      store.setCurrentView("editor");
      store.setCurrentView("chat");
      store.setCurrentView("graph");
      expect(store.viewHistory).toEqual([
        "dashboard",
        "editor",
        "chat",
        "graph",
      ]);
    });
  });

  describe("goBack", () => {
    it("前のビューに戻る", () => {
      store.setCurrentView("editor");
      store.setCurrentView("chat");
      store.goBack();
      expect(store.currentView).toBe("editor");
    });

    it("履歴から最後の項目を削除する", () => {
      store.setCurrentView("editor");
      store.setCurrentView("chat");
      store.goBack();
      expect(store.viewHistory).toEqual(["dashboard", "editor"]);
    });

    it("履歴が1つの場合は何もしない", () => {
      store.goBack();
      expect(store.currentView).toBe("dashboard");
      expect(store.viewHistory).toEqual(["dashboard"]);
    });
  });

  describe("canGoBack", () => {
    it("履歴が1つの場合はfalseを返す", () => {
      expect(store.canGoBack()).toBe(false);
    });

    it("履歴が複数ある場合はtrueを返す", () => {
      store.setCurrentView("editor");
      expect(store.canGoBack()).toBe(true);
    });

    it("goBack後に履歴が1つになるとfalseを返す", () => {
      store.setCurrentView("editor");
      store.goBack();
      expect(store.canGoBack()).toBe(false);
    });
  });
});
