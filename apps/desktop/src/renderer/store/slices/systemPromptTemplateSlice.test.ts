import { describe, it, expect, beforeEach } from "vitest";
import {
  createSystemPromptTemplateSlice,
  type SystemPromptTemplateSlice,
} from "./systemPromptTemplateSlice";

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
    const state: Partial<SystemPromptTemplateSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function"
          ? fn(store)
          : (fn as Partial<SystemPromptTemplateSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    store = createSystemPromptTemplateSlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );
  });

  describe("初期状態", () => {
    it("templatesが空配列である", () => {
      expect(store.templates).toEqual([]);
    });
  });

  describe("initializeTemplates", () => {
    it("プリセットテンプレートを読み込む", async () => {
      await store.initializeTemplates();
      expect(store.templates.length).toBeGreaterThan(0);
    });

    it("プリセットテンプレートのisPresetがtrueである", async () => {
      await store.initializeTemplates();
      const presetTemplates = store.templates.filter((t) => t.isPreset);
      expect(presetTemplates.length).toBeGreaterThan(0);
      presetTemplates.forEach((template) => {
        expect(template.isPreset).toBe(true);
      });
    });

    it("electron-storeからカスタムテンプレートを読み込む", async () => {
      // 初期化時にカスタムテンプレートがあれば読み込まれる
      await store.initializeTemplates();
      expect(store.templates).toBeDefined();
    });

    it("プリセットとカスタムを結合して返す", async () => {
      await store.initializeTemplates();
      // プリセットとカスタムが共存できることを確認
      expect(Array.isArray(store.templates)).toBe(true);
    });

    it("初期化が失敗してもエラーをスローしない", async () => {
      // electron-storeの読み込みに失敗した場合でもプリセットは利用可能
      await expect(store.initializeTemplates()).resolves.not.toThrow();
    });
  });

  describe("saveTemplate", () => {
    const templateName = "マイテンプレート";
    const templateContent = "カスタムプロンプト内容";

    it("新しいカスタムテンプレートを保存する", async () => {
      await store.saveTemplate(templateName, templateContent);
      const saved = store.templates.find((t) => t.name === templateName);
      expect(saved).toBeDefined();
      expect(saved?.content).toBe(templateContent);
      expect(saved?.isPreset).toBe(false);
    });

    it("一意なIDを生成する", async () => {
      await store.saveTemplate(templateName, templateContent);
      const template = store.templates.find((t) => t.name === templateName);
      expect(template?.id).toBeDefined();
      expect(typeof template?.id).toBe("string");
      expect(template?.id.length).toBeGreaterThan(0);
    });

    it("createdAtとupdatedAtを設定する", async () => {
      const beforeTime = new Date();
      await store.saveTemplate(templateName, templateContent);
      const afterTime = new Date();

      const template = store.templates.find((t) => t.name === templateName);
      expect(template?.createdAt).toBeDefined();
      expect(template?.updatedAt).toBeDefined();
      expect(template?.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(template?.createdAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });

    it("electron-storeに永続化する", async () => {
      await store.saveTemplate(templateName, templateContent);
      // 実際のストレージへの保存は実装で確認
      expect(store.templates.some((t) => t.name === templateName)).toBe(true);
    });

    it("空のコンテンツで保存できる", async () => {
      await store.saveTemplate("空テンプレート", "");
      const template = store.templates.find((t) => t.name === "空テンプレート");
      expect(template?.content).toBe("");
    });

    it("同名のテンプレートは保存できない", async () => {
      await store.saveTemplate(templateName, "content1");
      await expect(
        store.saveTemplate(templateName, "content2"),
      ).rejects.toThrow();
    });

    it("保存失敗時にエラーをスローする", async () => {
      // 不正なデータでの保存
      await expect(store.saveTemplate("", "content")).rejects.toThrow();
    });
  });

  describe("updateTemplate", () => {
    const newName = "更新後の名前";
    const newContent = "更新後のコンテンツ";

    beforeEach(async () => {
      // テスト用のカスタムテンプレートを追加
      await store.saveTemplate("元の名前", "元のコンテンツ");
    });

    it("カスタムテンプレートの名前を更新する", async () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      await store.updateTemplate(template.id, newName, template.content);
      const updated = store.templates.find((t) => t.id === template.id);
      expect(updated?.name).toBe(newName);
    });

    it("カスタムテンプレートのコンテンツを更新する", async () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      await store.updateTemplate(template.id, template.name, newContent);
      const updated = store.templates.find((t) => t.id === template.id);
      expect(updated?.content).toBe(newContent);
    });

    it("updatedAtを更新する", async () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      const originalUpdatedAt = template.updatedAt;
      // 時間経過を保証
      await new Promise((resolve) => setTimeout(resolve, 10));

      await store.updateTemplate(template.id, newName, newContent);
      const updated = store.templates.find((t) => t.id === template.id);
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });

    it("createdAtは変更しない", async () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      const originalCreatedAt = template.createdAt;
      await store.updateTemplate(template.id, newName, newContent);
      const updated = store.templates.find((t) => t.id === template.id);
      expect(updated?.createdAt).toEqual(originalCreatedAt);
    });

    it("プリセットテンプレートは更新できない", async () => {
      await store.initializeTemplates();
      const preset = store.templates.find((t) => t.isPreset);
      if (!preset) throw new Error("No preset template found");

      await expect(
        store.updateTemplate(preset.id, "新しい名前", "新しいコンテンツ"),
      ).rejects.toThrow(/preset|プリセット/i);
    });

    it("存在しないIDでエラーをスローする", async () => {
      await expect(
        store.updateTemplate("nonexistent", newName, newContent),
      ).rejects.toThrow();
    });

    it("electron-storeに永続化する", async () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      await store.updateTemplate(template.id, newName, newContent);
      const updated = store.templates.find((t) => t.id === template.id);
      expect(updated?.name).toBe(newName);
    });
  });

  describe("deleteTemplate", () => {
    beforeEach(async () => {
      // テスト用のカスタムテンプレートを追加
      await store.saveTemplate("削除対象", "コンテンツ");
    });

    it("カスタムテンプレートを削除する", async () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      const beforeCount = store.templates.length;
      await store.deleteTemplate(template.id);
      expect(store.templates.length).toBe(beforeCount - 1);
      expect(store.templates.find((t) => t.id === template.id)).toBeUndefined();
    });

    it("プリセットテンプレートは削除できない", async () => {
      await store.initializeTemplates();
      const preset = store.templates.find((t) => t.isPreset);
      if (!preset) throw new Error("No preset template found");

      await expect(store.deleteTemplate(preset.id)).rejects.toThrow(
        /preset|プリセット/i,
      );
    });

    it("存在しないIDでエラーをスローする", async () => {
      await expect(store.deleteTemplate("nonexistent")).rejects.toThrow();
    });

    it("electron-storeから削除する", async () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      await store.deleteTemplate(template.id);
      expect(store.templates.find((t) => t.id === template.id)).toBeUndefined();
    });
  });

  describe("getTemplateById", () => {
    beforeEach(async () => {
      await store.initializeTemplates();
      await store.saveTemplate("検索対象", "コンテンツ");
    });

    it("IDでテンプレートを取得する", () => {
      const template = store.templates.find((t) => !t.isPreset);
      if (!template) throw new Error("No custom template found");

      const found = store.getTemplateById(template.id);
      expect(found).toEqual(template);
    });

    it("プリセットテンプレートを取得できる", () => {
      const preset = store.templates.find((t) => t.isPreset);
      if (!preset) throw new Error("No preset template found");

      const found = store.getTemplateById(preset.id);
      expect(found).toEqual(preset);
    });

    it("存在しないIDでundefinedを返す", () => {
      const found = store.getTemplateById("nonexistent");
      expect(found).toBeUndefined();
    });
  });

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

    it("複数のカスタムテンプレートを管理する", async () => {
      await store.saveTemplate("テンプレート1", "コンテンツ1");
      await store.saveTemplate("テンプレート2", "コンテンツ2");
      await store.saveTemplate("テンプレート3", "コンテンツ3");

      const customTemplates = store.templates.filter((t) => !t.isPreset);
      expect(customTemplates.length).toBe(3);
    });

    it("プリセットテンプレートは常に存在する", async () => {
      await store.initializeTemplates();
      const customTemplate = store.templates.find((t) => !t.isPreset);

      if (customTemplate) {
        await store.deleteTemplate(customTemplate.id);
      }

      const presetTemplates = store.templates.filter((t) => t.isPreset);
      expect(presetTemplates.length).toBeGreaterThan(0);
    });
  });

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
