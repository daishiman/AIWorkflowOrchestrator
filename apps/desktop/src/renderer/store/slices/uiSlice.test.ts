import { describe, it, expect, beforeEach } from "vitest";
import { createUISlice, type UISlice } from "./uiSlice";

describe("uiSlice", () => {
  let store: UISlice;
  let mockSet: (
    fn: ((state: UISlice) => Partial<UISlice>) | Partial<UISlice>,
  ) => void;

  beforeEach(() => {
    const state: Partial<UISlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<UISlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    store = createUISlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );
  });

  describe("初期状態", () => {
    it("dynamicIslandが非表示状態である", () => {
      expect(store.dynamicIsland.visible).toBe(false);
    });

    it("mobileDrawerOpenがfalseである", () => {
      expect(store.mobileDrawerOpen).toBe(false);
    });

    it("windowSizeがデフォルト値である", () => {
      expect(store.windowSize).toEqual({ width: 1200, height: 800 });
    });

    it("responsiveModeがdesktopである", () => {
      expect(store.responsiveMode).toBe("desktop");
    });
  });

  describe("showDynamicIsland", () => {
    it("Dynamic Islandを表示する", () => {
      store.showDynamicIsland("processing", "Loading...");
      expect(store.dynamicIsland.visible).toBe(true);
    });

    it("ステータスを設定する", () => {
      store.showDynamicIsland("processing", "Loading...");
      expect(store.dynamicIsland.status).toBe("processing");
    });

    it("メッセージを設定する", () => {
      store.showDynamicIsland("processing", "Loading...");
      expect(store.dynamicIsland.message).toBe("Loading...");
    });

    it("completedステータスを設定できる", () => {
      store.showDynamicIsland("completed", "Done!");
      expect(store.dynamicIsland.status).toBe("completed");
      expect(store.dynamicIsland.message).toBe("Done!");
    });
  });

  describe("hideDynamicIsland", () => {
    it("Dynamic Islandを非表示にする", () => {
      store.showDynamicIsland("processing", "Loading...");
      store.hideDynamicIsland();
      expect(store.dynamicIsland.visible).toBe(false);
    });

    it("ステータスとメッセージは保持される", () => {
      store.showDynamicIsland("processing", "Loading...");
      store.hideDynamicIsland();
      expect(store.dynamicIsland.status).toBe("processing");
      expect(store.dynamicIsland.message).toBe("Loading...");
    });
  });

  describe("setMobileDrawerOpen", () => {
    it("ドロワーを開く", () => {
      store.setMobileDrawerOpen(true);
      expect(store.mobileDrawerOpen).toBe(true);
    });

    it("ドロワーを閉じる", () => {
      store.setMobileDrawerOpen(true);
      store.setMobileDrawerOpen(false);
      expect(store.mobileDrawerOpen).toBe(false);
    });
  });

  describe("toggleMobileDrawer", () => {
    it("閉じた状態から開く", () => {
      store.toggleMobileDrawer();
      expect(store.mobileDrawerOpen).toBe(true);
    });

    it("開いた状態から閉じる", () => {
      store.setMobileDrawerOpen(true);
      store.toggleMobileDrawer();
      expect(store.mobileDrawerOpen).toBe(false);
    });
  });

  describe("setWindowSize", () => {
    it("ウィンドウサイズを設定する", () => {
      store.setWindowSize({ width: 1024, height: 768 });
      expect(store.windowSize).toEqual({ width: 1024, height: 768 });
    });

    it("768px未満でmobileモードに変更", () => {
      store.setWindowSize({ width: 500, height: 800 });
      expect(store.responsiveMode).toBe("mobile");
    });

    it("768px-1023pxでtabletモードに変更", () => {
      store.setWindowSize({ width: 800, height: 600 });
      expect(store.responsiveMode).toBe("tablet");
    });

    it("1024px以上でdesktopモードに変更", () => {
      store.setWindowSize({ width: 500, height: 800 });
      store.setWindowSize({ width: 1440, height: 900 });
      expect(store.responsiveMode).toBe("desktop");
    });
  });
});
