/**
 * systemPromptTemplateSlice Unit Tests
 *
 * Tests for the system prompt template slice with IPC integration.
 *
 * @see docs/30-workflows/system-prompt-db/outputs/phase-2/slice-update-design.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock electron API
const mockElectronAPI = {
  store: {
    get: vi.fn(),
    set: vi.fn(),
  },
};

// Mock System Prompt API
const mockSystemPromptAPI = {
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  migrate: vi.fn(),
  getPresets: vi.fn(),
};

// Mock window
vi.stubGlobal("window", {
  electronAPI: mockElectronAPI,
  systemPromptAPI: mockSystemPromptAPI,
});

// Import the actual slice after mocking
import {
  createSystemPromptTemplateSlice,
  type SystemPromptTemplateSlice,
} from "../systemPromptTemplateSlice.js";

describe("systemPromptTemplateSlice", () => {
  let store: SystemPromptTemplateSlice;
  let mockSet: (
    fn:
      | ((
          state: SystemPromptTemplateSlice,
        ) => Partial<SystemPromptTemplateSlice>)
      | Partial<SystemPromptTemplateSlice>,
  ) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    const state: Partial<SystemPromptTemplateSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function"
          ? fn(store)
          : (fn as Partial<SystemPromptTemplateSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    // Default mock responses
    mockElectronAPI.store.get.mockResolvedValue({ success: true, data: [] });
    mockElectronAPI.store.set.mockResolvedValue({ success: true });
    mockSystemPromptAPI.list.mockResolvedValue({ success: true, data: [] });
    mockSystemPromptAPI.create.mockResolvedValue({ success: true, data: {} });
    mockSystemPromptAPI.update.mockResolvedValue({ success: true, data: {} });
    mockSystemPromptAPI.delete.mockResolvedValue({ success: true });
    mockSystemPromptAPI.getPresets.mockResolvedValue({
      success: true,
      data: [],
    });

    store = createSystemPromptTemplateSlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );
  });

  // ===========================================================================
  // Initial State
  // ===========================================================================

  describe("initial state", () => {
    it("templatesが空配列である", () => {
      expect(store.templates).toEqual([]);
    });

    it("スライスが正しく作成される", () => {
      expect(store).toBeDefined();
      expect(typeof store.initializeTemplates).toBe("function");
      expect(typeof store.saveTemplate).toBe("function");
      expect(typeof store.updateTemplate).toBe("function");
      expect(typeof store.deleteTemplate).toBe("function");
      expect(typeof store.getTemplateById).toBe("function");
    });
  });

  // ===========================================================================
  // initializeTemplates
  // ===========================================================================

  describe("initializeTemplates", () => {
    it("プリセットテンプレートを読み込める", async () => {
      await store.initializeTemplates();
      // プリセットテンプレートが存在すること（既定で3つある）
      expect(store.templates.length).toBeGreaterThan(0);
    });

    it("initializeTemplatesは同期的に完了する", async () => {
      // initializeTemplatesは内部でエラーをキャッチし、プリセットテンプレートを設定する
      mockElectronAPI.store.get.mockResolvedValue({ success: false });

      // Should not throw
      await expect(store.initializeTemplates()).resolves.not.toThrow();
      // プリセットが設定されること
      expect(store.templates.length).toBeGreaterThan(0);
    });

    it("エラー時でもプリセットは利用可能", async () => {
      mockElectronAPI.store.get.mockRejectedValue(new Error("Network error"));

      await store.initializeTemplates();

      // プリセットテンプレートは存在する
      const presets = store.templates.filter((t) => t.isPreset);
      expect(presets.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // saveTemplate
  // ===========================================================================

  describe("saveTemplate", () => {
    it("新しいテンプレートを保存できる", async () => {
      const name = "テストテンプレート";
      const content = "テストコンテンツ";

      await store.saveTemplate(name, content);

      const saved = store.templates.find((t) => t.name === name);
      expect(saved).toBeDefined();
      expect(saved?.content).toBe(content);
      expect(saved?.isPreset).toBe(false);
    });

    it("保存後にtemplates配列が更新される", async () => {
      const initialCount = store.templates.length;

      await store.saveTemplate("新規テンプレート", "コンテンツ");

      expect(store.templates.length).toBe(initialCount + 1);
    });

    it("保存エラー時にエラーをスローする", async () => {
      // 空の名前でバリデーションエラー
      await expect(store.saveTemplate("", "content")).rejects.toThrow();
    });

    it("重複名でエラーをスローする", async () => {
      await store.saveTemplate("テスト", "コンテンツ1");
      await expect(
        store.saveTemplate("テスト", "コンテンツ2"),
      ).rejects.toThrow();
    });
  });

  // ===========================================================================
  // updateTemplate
  // ===========================================================================

  describe("updateTemplate", () => {
    beforeEach(async () => {
      await store.saveTemplate("元の名前", "元のコンテンツ");
    });

    it("テンプレートを更新できる", async () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      await store.updateTemplate(template.id, "新しい名前", template.content);

      const updated = store.templates.find((t) => t.id === template.id);
      expect(updated?.name).toBe("新しい名前");
    });

    it("更新後にtemplates配列が更新される", async () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      await store.updateTemplate(
        template.id,
        template.name,
        "新しいコンテンツ",
      );

      const updated = store.templates.find((t) => t.id === template.id);
      expect(updated?.content).toBe("新しいコンテンツ");
    });

    it("プリセット更新でエラーをスローする", async () => {
      await store.initializeTemplates();
      const preset = store.templates.find((t) => t.isPreset);
      if (!preset) throw new Error("No preset found");

      await expect(
        store.updateTemplate(preset.id, "新しい名前", "新しいコンテンツ"),
      ).rejects.toThrow(/preset|プリセット/i);
    });
  });

  // ===========================================================================
  // deleteTemplate
  // ===========================================================================

  describe("deleteTemplate", () => {
    beforeEach(async () => {
      await store.saveTemplate("削除対象", "コンテンツ");
    });

    it("テンプレートを削除できる", async () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      const beforeCount = store.templates.length;
      await store.deleteTemplate(template.id);

      expect(store.templates.length).toBe(beforeCount - 1);
      expect(store.templates.find((t) => t.id === template.id)).toBeUndefined();
    });

    it("削除後にtemplates配列から削除される", async () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      await store.deleteTemplate(template.id);

      expect(store.templates.find((t) => t.id === template.id)).toBeUndefined();
    });

    it("プリセット削除でエラーをスローする", async () => {
      await store.initializeTemplates();
      const preset = store.templates.find((t) => t.isPreset);
      if (!preset) throw new Error("No preset found");

      await expect(store.deleteTemplate(preset.id)).rejects.toThrow(
        /preset|プリセット/i,
      );
    });
  });

  // ===========================================================================
  // getTemplateById
  // ===========================================================================

  describe("getTemplateById", () => {
    beforeEach(async () => {
      await store.initializeTemplates();
      await store.saveTemplate("検索対象", "コンテンツ");
    });

    it("IDでテンプレートを取得できる", () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      const found = store.getTemplateById(template.id);
      expect(found).toEqual(template);
    });

    it("プリセットテンプレートを取得できる", () => {
      const preset = store.templates.find((t) => t.isPreset);
      if (!preset) throw new Error("No preset found");

      const found = store.getTemplateById(preset.id);
      expect(found).toEqual(preset);
    });

    it("存在しないIDでundefinedを返す", () => {
      const found = store.getTemplateById("non-existent");
      expect(found).toBeUndefined();
    });
  });

  // ===========================================================================
  // Integration Tests
  // ===========================================================================

  describe("統合テスト", () => {
    it("テンプレートのCRUDフロー", async () => {
      // Create
      await store.saveTemplate("統合テスト", "初期コンテンツ");
      let template = store.templates.find((t) => t.name === "統合テスト");
      expect(template).toBeDefined();

      // Read
      const found = store.getTemplateById(template!.id);
      expect(found?.name).toBe("統合テスト");

      // Update
      await store.updateTemplate(template!.id, "更新後", "更新コンテンツ");
      template = store.templates.find((t) => t.id === template!.id);
      expect(template?.name).toBe("更新後");
      expect(template?.content).toBe("更新コンテンツ");

      // Delete
      await store.deleteTemplate(template!.id);
      expect(
        store.templates.find((t) => t.id === template!.id),
      ).toBeUndefined();
    });

    it("複数のカスタムテンプレートを管理できる", async () => {
      await store.saveTemplate("テンプレート1", "コンテンツ1");
      await store.saveTemplate("テンプレート2", "コンテンツ2");
      await store.saveTemplate("テンプレート3", "コンテンツ3");

      const customTemplates = store.templates.filter((t) => !t.isPreset);
      expect(customTemplates.length).toBe(3);
    });

    it("プリセットテンプレートは常に存在する", async () => {
      await store.initializeTemplates();

      const presetTemplates = store.templates.filter((t) => t.isPreset);
      expect(presetTemplates.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Validation Tests
  // ===========================================================================

  describe("バリデーション", () => {
    it("名前が空文字列の場合はエラー", async () => {
      await expect(store.saveTemplate("", "content")).rejects.toThrow();
    });

    it("名前が50文字を超える場合はエラー", async () => {
      const longName = "あ".repeat(51);
      await expect(store.saveTemplate(longName, "content")).rejects.toThrow();
    });

    it("コンテンツが4000文字を超える場合はエラー", async () => {
      const longContent = "あ".repeat(4001);
      await expect(store.saveTemplate("テスト", longContent)).rejects.toThrow();
    });

    it("同名テンプレートのチェック（大文字小文字区別なし）", async () => {
      await store.saveTemplate("MyTemplate", "content");
      await expect(
        store.saveTemplate("mytemplate", "content"),
      ).rejects.toThrow();
    });
  });
});
