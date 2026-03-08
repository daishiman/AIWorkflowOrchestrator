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

  describe("setCurrentSkillName", () => {
    it("スキル名を設定する", () => {
      store.setCurrentSkillName("test-skill");
      expect(store.currentSkillName).toBe("test-skill");
    });

    it("nullでリセットする", () => {
      store.setCurrentSkillName("test-skill");
      store.setCurrentSkillName(null);
      expect(store.currentSkillName).toBeNull();
    });
  });

  describe("persist corruption hardening (07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001)", () => {
    // viewHistory が破損した状態を再現するヘルパー
    const corruptViewHistory = (value: unknown) => {
      // 内部stateを直接上書き
      Object.assign(store, { viewHistory: value });
    };

    describe("setCurrentView with corrupted viewHistory", () => {
      it("viewHistory が null でも settings 遷移が例外なく継続する", () => {
        corruptViewHistory(null);
        expect(() => store.setCurrentView("settings")).not.toThrow();
        expect(store.currentView).toBe("settings");
      });

      it("viewHistory が undefined でも settings 遷移が例外なく継続する", () => {
        corruptViewHistory(undefined);
        expect(() => store.setCurrentView("settings")).not.toThrow();
        expect(store.currentView).toBe("settings");
      });

      it("viewHistory が数値でも settings 遷移が例外なく継続する", () => {
        corruptViewHistory(42);
        expect(() => store.setCurrentView("settings")).not.toThrow();
        expect(store.currentView).toBe("settings");
      });

      it("viewHistory が文字列でも settings 遷移が例外なく継続する", () => {
        corruptViewHistory("corrupted");
        expect(() => store.setCurrentView("settings")).not.toThrow();
        expect(store.currentView).toBe("settings");
      });

      it("viewHistory がオブジェクトでも settings 遷移が例外なく継続する", () => {
        corruptViewHistory({ broken: true });
        expect(() => store.setCurrentView("settings")).not.toThrow();
        expect(store.currentView).toBe("settings");
      });
    });

    describe("goBack with corrupted viewHistory", () => {
      it("viewHistory が null でも goBack が例外なく継続する", () => {
        corruptViewHistory(null);
        expect(() => store.goBack()).not.toThrow();
      });

      it("viewHistory がオブジェクトでも goBack が例外なく継続する", () => {
        corruptViewHistory({ broken: true });
        expect(() => store.goBack()).not.toThrow();
      });
    });

    describe("canGoBack with corrupted viewHistory", () => {
      it("viewHistory が null でも canGoBack が false を返す", () => {
        corruptViewHistory(null);
        expect(store.canGoBack()).toBe(false);
      });

      it("viewHistory がオブジェクトでも canGoBack が false を返す", () => {
        corruptViewHistory({ broken: true });
        expect(store.canGoBack()).toBe(false);
      });
    });

    describe("recovery after corruption", () => {
      it("破損 viewHistory から復旧後に navigation が継続できる", () => {
        corruptViewHistory(null);
        store.setCurrentView("settings");
        store.setCurrentView("editor");
        expect(store.viewHistory).toEqual(
          expect.arrayContaining(["settings", "editor"]),
        );
        expect(Array.isArray(store.viewHistory)).toBe(true);
      });
    });
  });
});
