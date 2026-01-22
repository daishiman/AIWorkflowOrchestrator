/**
 * SystemPromptRepository Integration Tests
 *
 * @see docs/30-workflows/system-prompt-db/outputs/phase-2/repository-interface-design.md
 * @see docs/30-workflows/system-prompt-db/outputs/phase-3/integration-test-review.md
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { SystemPromptRepository } from "../system-prompt-repository.js";

describe("SystemPromptRepository Integration Tests", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let repository: SystemPromptRepository;

  beforeEach(() => {
    // In-memory SQLite database for testing
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

    // Create system_prompt_templates table
    sqlite.exec(`
      CREATE TABLE system_prompt_templates (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 50),
        content TEXT NOT NULL CHECK(length(content) BETWEEN 1 AND 4000),
        is_preset INTEGER NOT NULL DEFAULT 0 CHECK(is_preset IN (0, 1)),
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE INDEX system_prompt_templates_user_id_idx ON system_prompt_templates(user_id);
      CREATE INDEX system_prompt_templates_name_idx ON system_prompt_templates(name);
      CREATE INDEX system_prompt_templates_is_preset_idx ON system_prompt_templates(is_preset);
      CREATE UNIQUE INDEX system_prompt_templates_user_name_unq ON system_prompt_templates(user_id, name);
    `);

    db = drizzle(sqlite);
    repository = new SystemPromptRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  // ===========================================================================
  // Full CRUD workflow
  // ===========================================================================

  describe("Full CRUD workflow", () => {
    it("テンプレート作成 → 更新 → 一覧取得 → 削除の流れ", async () => {
      // Create
      const created = await repository.create("user-001", {
        name: "テスト",
        content: "コンテンツ",
      });
      expect(created.id).toBeDefined();
      expect(created.name).toBe("テスト");

      // Update
      const updated = await repository.update(created.id, {
        name: "更新後",
        content: "新しいコンテンツ",
      });
      expect(updated.name).toBe("更新後");
      expect(updated.content).toBe("新しいコンテンツ");

      // List
      const list = await repository.findAllByUserId("user-001");
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe("更新後");

      // Delete
      await repository.delete(created.id);
      const afterDelete = await repository.findById(created.id);
      expect(afterDelete).toBeNull();
    });

    it("複数テンプレートの作成と一覧取得", async () => {
      // Create multiple templates
      await repository.create("user-001", {
        name: "テンプレート1",
        content: "コンテンツ1",
      });
      await repository.create("user-001", {
        name: "テンプレート2",
        content: "コンテンツ2",
      });
      await repository.create("user-001", {
        name: "テンプレート3",
        content: "コンテンツ3",
      });

      const list = await repository.findAllByUserId("user-001");
      expect(list).toHaveLength(3);
    });
  });

  // ===========================================================================
  // Multi-user isolation
  // ===========================================================================

  describe("Multi-user isolation", () => {
    it("ユーザーAのテンプレートがユーザーBに見えない", async () => {
      await repository.create("user-A", {
        name: "ユーザーAのテンプレート",
        content: "コンテンツA",
      });

      const userBList = await repository.findAllByUserId("user-B", {
        includePresets: false,
      });
      expect(userBList).toHaveLength(0);
    });

    it("同名テンプレートをユーザーごとに作成できる", async () => {
      const templateA = await repository.create("user-A", {
        name: "共通名",
        content: "コンテンツA",
      });

      const templateB = await repository.create("user-B", {
        name: "共通名",
        content: "コンテンツB",
      });

      expect(templateA.userId).toBe("user-A");
      expect(templateB.userId).toBe("user-B");
      expect(templateA.name).toBe(templateB.name);
    });

    it("全ユーザーがプリセットを参照できる", async () => {
      // Insert preset directly
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('preset-001', '__SYSTEM__', 'プリセット', 'コンテンツ', 1, ${now}, ${now})
      `);

      const userAList = await repository.findAllByUserId("user-A", {
        includePresets: true,
      });
      const userBList = await repository.findAllByUserId("user-B", {
        includePresets: true,
      });

      expect(userAList.some((t) => t.isPreset)).toBe(true);
      expect(userBList.some((t) => t.isPreset)).toBe(true);
    });
  });

  // ===========================================================================
  // Preset protection
  // ===========================================================================

  describe("Preset protection", () => {
    beforeEach(() => {
      // Insert preset directly
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES
          ('preset-001', '__SYSTEM__', 'デフォルトプリセット', 'プリセットコンテンツ', 1, ${now}, ${now}),
          ('preset-002', '__SYSTEM__', '翻訳プリセット', '翻訳用プリセット', 1, ${now}, ${now})
      `);
    });

    it("プリセットテンプレートの一覧が取得できる", async () => {
      const presets = await repository.findAllPresets();
      expect(presets).toHaveLength(2);
      expect(presets.every((p) => p.isPreset)).toBe(true);
    });

    it("プリセットはfindByIdで取得できる", async () => {
      const preset = await repository.findById("preset-001");
      expect(preset).not.toBeNull();
      expect(preset?.isPreset).toBe(true);
      expect(preset?.name).toBe("デフォルトプリセット");
    });

    it("isPresetメソッドでプリセット判定ができる", async () => {
      const isPreset1 = await repository.isPreset("preset-001");
      expect(isPreset1).toBe(true);

      // Create a custom template
      const custom = await repository.create("user-001", {
        name: "カスタム",
        content: "コンテンツ",
      });
      const isPreset2 = await repository.isPreset(custom.id);
      expect(isPreset2).toBe(false);
    });

    it("プリセット名と同名のテンプレートは作成できない", async () => {
      await expect(
        repository.create("user-001", {
          name: "デフォルトプリセット",
          content: "コンテンツ",
        }),
      ).rejects.toThrow(/プリセット.*存在/);
    });
  });

  // ===========================================================================
  // Error handling
  // ===========================================================================

  describe("Error handling", () => {
    it("存在しないテンプレートの更新でエラー", async () => {
      await expect(
        repository.update("non-existent", { name: "新しい名前" }),
      ).rejects.toThrow(/見つかりません/);
    });

    it("存在しないテンプレートの削除でエラー", async () => {
      await expect(repository.delete("non-existent")).rejects.toThrow(
        /見つかりません/,
      );
    });

    it("名前のバリデーションエラー（空文字）", async () => {
      await expect(
        repository.create("user-001", {
          name: "",
          content: "コンテンツ",
        }),
      ).rejects.toThrow(/必須/);
    });

    it("名前のバリデーションエラー（50文字超過）", async () => {
      const longName = "あ".repeat(51);
      await expect(
        repository.create("user-001", {
          name: longName,
          content: "コンテンツ",
        }),
      ).rejects.toThrow(/50文字/);
    });

    it("コンテンツのバリデーションエラー（4000文字超過）", async () => {
      const longContent = "あ".repeat(4001);
      await expect(
        repository.create("user-001", {
          name: "テスト",
          content: longContent,
        }),
      ).rejects.toThrow(/4000文字/);
    });
  });

  // ===========================================================================
  // Concurrency
  // ===========================================================================

  describe("Concurrency", () => {
    it("同時作成で名前重複エラーが発生する", async () => {
      // First creation should succeed
      await repository.create("user-001", {
        name: "同名テンプレート",
        content: "コンテンツ1",
      });

      // Second creation with same name should fail
      await expect(
        repository.create("user-001", {
          name: "同名テンプレート",
          content: "コンテンツ2",
        }),
      ).rejects.toThrow(/同名.*既に存在/);
    });
  });
});
