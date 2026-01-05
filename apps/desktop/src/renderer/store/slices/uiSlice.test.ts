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

  describe("システムプロンプトパネル - 初期状態", () => {
    it("isSystemPromptPanelExpandedがfalseである", () => {
      expect(store.isSystemPromptPanelExpanded).toBe(false);
    });

    it("isSaveTemplateDialogOpenがfalseである", () => {
      expect(store.isSaveTemplateDialogOpen).toBe(false);
    });

    it("isDeleteConfirmDialogOpenがfalseである", () => {
      expect(store.isDeleteConfirmDialogOpen).toBe(false);
    });

    it("targetTemplateIdがnullである", () => {
      expect(store.targetTemplateId).toBeNull();
    });
  });

  describe("toggleSystemPromptPanel", () => {
    it("閉じた状態から開く", () => {
      store.toggleSystemPromptPanel();
      expect(store.isSystemPromptPanelExpanded).toBe(true);
    });

    it("開いた状態から閉じる", () => {
      store.toggleSystemPromptPanel(); // 開く
      store.toggleSystemPromptPanel(); // 閉じる
      expect(store.isSystemPromptPanelExpanded).toBe(false);
    });

    it("複数回のトグルが正しく動作する", () => {
      expect(store.isSystemPromptPanelExpanded).toBe(false);
      store.toggleSystemPromptPanel();
      expect(store.isSystemPromptPanelExpanded).toBe(true);
      store.toggleSystemPromptPanel();
      expect(store.isSystemPromptPanelExpanded).toBe(false);
      store.toggleSystemPromptPanel();
      expect(store.isSystemPromptPanelExpanded).toBe(true);
    });
  });

  describe("openSaveTemplateDialog", () => {
    it("保存ダイアログを開く", () => {
      store.openSaveTemplateDialog();
      expect(store.isSaveTemplateDialogOpen).toBe(true);
    });

    it("既に開いている場合も状態を維持する", () => {
      store.openSaveTemplateDialog();
      store.openSaveTemplateDialog();
      expect(store.isSaveTemplateDialogOpen).toBe(true);
    });
  });

  describe("closeSaveTemplateDialog", () => {
    it("保存ダイアログを閉じる", () => {
      store.openSaveTemplateDialog();
      store.closeSaveTemplateDialog();
      expect(store.isSaveTemplateDialogOpen).toBe(false);
    });

    it("既に閉じている場合も状態を維持する", () => {
      store.closeSaveTemplateDialog();
      expect(store.isSaveTemplateDialogOpen).toBe(false);
    });
  });

  describe("openDeleteConfirmDialog", () => {
    it("削除確認ダイアログを開く", () => {
      const templateId = "template-1";
      store.openDeleteConfirmDialog(templateId);
      expect(store.isDeleteConfirmDialogOpen).toBe(true);
    });

    it("対象テンプレートIDを設定する", () => {
      const templateId = "template-1";
      store.openDeleteConfirmDialog(templateId);
      expect(store.targetTemplateId).toBe(templateId);
    });

    it("異なるテンプレートIDで上書きする", () => {
      store.openDeleteConfirmDialog("template-1");
      store.openDeleteConfirmDialog("template-2");
      expect(store.targetTemplateId).toBe("template-2");
    });
  });

  describe("closeDeleteConfirmDialog", () => {
    it("削除確認ダイアログを閉じる", () => {
      store.openDeleteConfirmDialog("template-1");
      store.closeDeleteConfirmDialog();
      expect(store.isDeleteConfirmDialogOpen).toBe(false);
    });

    it("targetTemplateIdをnullにリセットする", () => {
      store.openDeleteConfirmDialog("template-1");
      store.closeDeleteConfirmDialog();
      expect(store.targetTemplateId).toBeNull();
    });

    it("既に閉じている場合も状態を維持する", () => {
      store.closeDeleteConfirmDialog();
      expect(store.isDeleteConfirmDialogOpen).toBe(false);
      expect(store.targetTemplateId).toBeNull();
    });
  });

  describe("ダイアログ - 統合テスト", () => {
    it("保存ダイアログの開閉フロー", () => {
      // 開く
      store.openSaveTemplateDialog();
      expect(store.isSaveTemplateDialogOpen).toBe(true);

      // 閉じる
      store.closeSaveTemplateDialog();
      expect(store.isSaveTemplateDialogOpen).toBe(false);
    });

    it("削除確認ダイアログの開閉フロー", () => {
      // 開く
      store.openDeleteConfirmDialog("template-1");
      expect(store.isDeleteConfirmDialogOpen).toBe(true);
      expect(store.targetTemplateId).toBe("template-1");

      // 閉じる
      store.closeDeleteConfirmDialog();
      expect(store.isDeleteConfirmDialogOpen).toBe(false);
      expect(store.targetTemplateId).toBeNull();
    });

    it("複数のダイアログを独立して管理する", () => {
      store.openSaveTemplateDialog();
      store.openDeleteConfirmDialog("template-1");

      expect(store.isSaveTemplateDialogOpen).toBe(true);
      expect(store.isDeleteConfirmDialogOpen).toBe(true);

      store.closeSaveTemplateDialog();
      expect(store.isSaveTemplateDialogOpen).toBe(false);
      expect(store.isDeleteConfirmDialogOpen).toBe(true); // 維持される
    });

    it("システムプロンプトパネルとダイアログの独立性", () => {
      store.toggleSystemPromptPanel();
      store.openSaveTemplateDialog();

      expect(store.isSystemPromptPanelExpanded).toBe(true);
      expect(store.isSaveTemplateDialogOpen).toBe(true);

      store.closeSaveTemplateDialog();
      expect(store.isSystemPromptPanelExpanded).toBe(true); // 維持される
      expect(store.isSaveTemplateDialogOpen).toBe(false);
    });
  });

  describe("UI状態の一貫性", () => {
    it("パネルを閉じてもダイアログ状態は維持される", () => {
      store.toggleSystemPromptPanel(); // 開く
      store.openSaveTemplateDialog();
      store.toggleSystemPromptPanel(); // 閉じる

      expect(store.isSaveTemplateDialogOpen).toBe(true);
    });

    it("他のUI状態に影響を与えない", () => {
      // 他のUI要素を設定
      store.showDynamicIsland("processing", "Test");
      store.setMobileDrawerOpen(true);

      // システムプロンプト関連のUI操作
      store.toggleSystemPromptPanel();
      store.openSaveTemplateDialog();

      // 他のUI状態が維持されている
      expect(store.dynamicIsland.visible).toBe(true);
      expect(store.mobileDrawerOpen).toBe(true);
    });
  });
});
