/**
 * SystemPromptRepository Unit Tests
 *
 * @see docs/30-workflows/system-prompt-db/outputs/phase-2/repository-interface-design.md
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { SystemPromptRepository } from "../system-prompt-repository.js";
import type {
  CreatePromptTemplateInput,
  UpdatePromptTemplateInput,
} from "../types/system-prompt.js";

describe("SystemPromptRepository", () => {
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
  // findAllByUserId
  // ===========================================================================

  describe("findAllByUserId", () => {
    it("ユーザーIDに紐づくテンプレート一覧を取得できる", async () => {
      // Arrange
      const userId = "user-001";
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES
          ('template-001', 'user-001', 'テスト1', 'コンテンツ1', 0, ${Date.now()}, ${Date.now()}),
          ('template-002', 'user-001', 'テスト2', 'コンテンツ2', 0, ${Date.now()}, ${Date.now()})
      `);

      // Act
      const templates = await repository.findAllByUserId(userId);

      // Assert
      expect(templates).toHaveLength(2);
      expect(templates.every((t) => t.userId === userId)).toBe(true);
    });

    it("他ユーザーのテンプレートは取得されない", async () => {
      // Arrange
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES
          ('template-001', 'user-001', 'テスト1', 'コンテンツ1', 0, ${Date.now()}, ${Date.now()}),
          ('template-002', 'user-002', 'テスト2', 'コンテンツ2', 0, ${Date.now()}, ${Date.now()})
      `);

      // Act
      const templates = await repository.findAllByUserId("user-001");

      // Assert
      expect(templates).toHaveLength(1);
      expect(templates[0].id).toBe("template-001");
    });

    it("テンプレートがない場合は空配列を返す", async () => {
      // Act
      const templates = await repository.findAllByUserId("user-001");

      // Assert
      expect(templates).toEqual([]);
    });

    it("プリセットを含める設定でプリセットも取得できる", async () => {
      // Arrange
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES
          ('template-001', 'user-001', 'カスタム', 'コンテンツ1', 0, ${Date.now()}, ${Date.now()}),
          ('preset-001', '__SYSTEM__', 'プリセット', 'コンテンツ2', 1, ${Date.now()}, ${Date.now()})
      `);

      // Act
      const templates = await repository.findAllByUserId("user-001", {
        includePresets: true,
      });

      // Assert
      expect(templates).toHaveLength(2);
    });

    it("プリセットを除外する設定でプリセットが取得されない", async () => {
      // Arrange
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES
          ('template-001', 'user-001', 'カスタム', 'コンテンツ1', 0, ${Date.now()}, ${Date.now()}),
          ('preset-001', '__SYSTEM__', 'プリセット', 'コンテンツ2', 1, ${Date.now()}, ${Date.now()})
      `);

      // Act
      const templates = await repository.findAllByUserId("user-001", {
        includePresets: false,
      });

      // Assert
      expect(templates).toHaveLength(1);
      expect(templates[0].isPreset).toBe(false);
    });

    it("ソート順を指定できる", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES
          ('template-001', 'user-001', 'Aテンプレート', 'コンテンツ1', 0, ${now}, ${now}),
          ('template-002', 'user-001', 'Bテンプレート', 'コンテンツ2', 0, ${now + 1000}, ${now + 1000})
      `);

      // Act
      const templates = await repository.findAllByUserId("user-001", {
        orderBy: "name",
        orderDirection: "ASC",
      });

      // Assert
      expect(templates[0].name).toBe("Aテンプレート");
      expect(templates[1].name).toBe("Bテンプレート");
    });

    it("ページネーションが機能する", async () => {
      // Arrange
      const now = Date.now();
      for (let i = 0; i < 5; i++) {
        sqlite.exec(`
          INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
          VALUES ('template-00${i}', 'user-001', 'テスト${i}', 'コンテンツ${i}', 0, ${now + i * 1000}, ${now + i * 1000})
        `);
      }

      // Act
      const page1 = await repository.findAllByUserId("user-001", {
        limit: 2,
        offset: 0,
      });
      const page2 = await repository.findAllByUserId("user-001", {
        limit: 2,
        offset: 2,
      });

      // Assert
      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1.map((t) => t.id)).not.toContain(page2[0]?.id);
    });
  });

  // ===========================================================================
  // findById
  // ===========================================================================

  describe("findById", () => {
    it("IDでテンプレートを取得できる", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', 'テスト', 'コンテンツ', 0, ${now}, ${now})
      `);

      // Act
      const template = await repository.findById("template-001");

      // Assert
      expect(template).not.toBeNull();
      expect(template?.id).toBe("template-001");
      expect(template?.name).toBe("テスト");
    });

    it("存在しないIDはnullを返す", async () => {
      // Act
      const template = await repository.findById("non-existent");

      // Assert
      expect(template).toBeNull();
    });

    it("プリセットテンプレートも取得できる", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('preset-001', '__SYSTEM__', 'プリセット', 'コンテンツ', 1, ${now}, ${now})
      `);

      // Act
      const template = await repository.findById("preset-001");

      // Assert
      expect(template).not.toBeNull();
      expect(template?.isPreset).toBe(true);
    });
  });

  // ===========================================================================
  // findAllPresets
  // ===========================================================================

  describe("findAllPresets", () => {
    it("全プリセットテンプレートを取得できる", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES
          ('preset-001', '__SYSTEM__', 'プリセット1', 'コンテンツ1', 1, ${now}, ${now}),
          ('preset-002', '__SYSTEM__', 'プリセット2', 'コンテンツ2', 1, ${now}, ${now}),
          ('template-001', 'user-001', 'カスタム', 'コンテンツ3', 0, ${now}, ${now})
      `);

      // Act
      const presets = await repository.findAllPresets();

      // Assert
      expect(presets).toHaveLength(2);
      expect(presets.every((p) => p.isPreset)).toBe(true);
    });

    it("プリセットがない場合は空配列を返す", async () => {
      // Act
      const presets = await repository.findAllPresets();

      // Assert
      expect(presets).toEqual([]);
    });
  });

  // ===========================================================================
  // create
  // ===========================================================================

  describe("create", () => {
    it("新規テンプレートを作成できる", async () => {
      // Arrange
      const input: CreatePromptTemplateInput = {
        name: "新規テンプレート",
        content: "テンプレート内容",
      };

      // Act
      const created = await repository.create("user-001", input);

      // Assert
      expect(created.id).toBeDefined();
      expect(created.name).toBe("新規テンプレート");
      expect(created.content).toBe("テンプレート内容");
      expect(created.userId).toBe("user-001");
      expect(created.isPreset).toBe(false);
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
    });

    it("同じユーザー・名前の組み合わせでエラー", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', '既存テンプレート', 'コンテンツ', 0, ${now}, ${now})
      `);

      const input: CreatePromptTemplateInput = {
        name: "既存テンプレート",
        content: "新しいコンテンツ",
      };

      // Act & Assert
      await expect(repository.create("user-001", input)).rejects.toThrow(
        /同名.*既に存在/,
      );
    });

    it("名前のトリムが機能する", async () => {
      // Arrange
      const input: CreatePromptTemplateInput = {
        name: "  スペース付き  ",
        content: "コンテンツ",
      };

      // Act
      const created = await repository.create("user-001", input);

      // Assert
      expect(created.name).toBe("スペース付き");
    });

    it("異なるユーザーで同名テンプレートを作成できる", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', '共通名', 'コンテンツ1', 0, ${now}, ${now})
      `);

      const input: CreatePromptTemplateInput = {
        name: "共通名",
        content: "コンテンツ2",
      };

      // Act
      const created = await repository.create("user-002", input);

      // Assert
      expect(created.name).toBe("共通名");
      expect(created.userId).toBe("user-002");
    });
  });

  // ===========================================================================
  // update
  // ===========================================================================

  describe("update", () => {
    it("テンプレートを更新できる", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', '元の名前', '元のコンテンツ', 0, ${now}, ${now})
      `);

      const updates: UpdatePromptTemplateInput = {
        name: "更新後の名前",
        content: "更新後のコンテンツ",
      };

      // Act
      const updated = await repository.update("template-001", updates);

      // Assert
      expect(updated.name).toBe("更新後の名前");
      expect(updated.content).toBe("更新後のコンテンツ");
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(now);
    });

    it("存在しないIDでエラー", async () => {
      // Arrange
      const updates: UpdatePromptTemplateInput = {
        name: "更新後の名前",
      };

      // Act & Assert
      await expect(repository.update("non-existent", updates)).rejects.toThrow(
        /見つかりません|not found/i,
      );
    });

    it("名前のみ更新できる", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', '元の名前', '元のコンテンツ', 0, ${now}, ${now})
      `);

      // Act
      const updated = await repository.update("template-001", {
        name: "新しい名前",
      });

      // Assert
      expect(updated.name).toBe("新しい名前");
      expect(updated.content).toBe("元のコンテンツ");
    });

    it("コンテンツのみ更新できる", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', '元の名前', '元のコンテンツ', 0, ${now}, ${now})
      `);

      // Act
      const updated = await repository.update("template-001", {
        content: "新しいコンテンツ",
      });

      // Assert
      expect(updated.name).toBe("元の名前");
      expect(updated.content).toBe("新しいコンテンツ");
    });

    it("名前変更時の重複チェック", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES
          ('template-001', 'user-001', 'テンプレート1', 'コンテンツ1', 0, ${now}, ${now}),
          ('template-002', 'user-001', 'テンプレート2', 'コンテンツ2', 0, ${now}, ${now})
      `);

      // Act & Assert
      await expect(
        repository.update("template-002", { name: "テンプレート1" }),
      ).rejects.toThrow(/同名.*既に存在/);
    });
  });

  // ===========================================================================
  // delete
  // ===========================================================================

  describe("delete", () => {
    it("テンプレートを削除できる", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', 'テスト', 'コンテンツ', 0, ${now}, ${now})
      `);

      // Act
      await repository.delete("template-001");

      // Assert
      const found = await repository.findById("template-001");
      expect(found).toBeNull();
    });

    it("存在しないIDでエラー", async () => {
      // Act & Assert
      await expect(repository.delete("non-existent")).rejects.toThrow(
        /見つかりません|not found/i,
      );
    });
  });

  // ===========================================================================
  // isPreset
  // ===========================================================================

  describe("isPreset", () => {
    it("プリセットIDでtrueを返す", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('preset-001', '__SYSTEM__', 'プリセット', 'コンテンツ', 1, ${now}, ${now})
      `);

      // Act
      const result = await repository.isPreset("preset-001");

      // Assert
      expect(result).toBe(true);
    });

    it("カスタムIDでfalseを返す", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', 'カスタム', 'コンテンツ', 0, ${now}, ${now})
      `);

      // Act
      const result = await repository.isPreset("template-001");

      // Assert
      expect(result).toBe(false);
    });

    it("存在しないIDでfalseを返す", async () => {
      // Act
      const result = await repository.isPreset("non-existent");

      // Assert
      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // existsByUserIdAndName
  // ===========================================================================

  describe("existsByUserIdAndName", () => {
    it("存在する名前でtrueを返す", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', 'テスト', 'コンテンツ', 0, ${now}, ${now})
      `);

      // Act
      const result = await repository.existsByUserIdAndName(
        "user-001",
        "テスト",
      );

      // Assert
      expect(result).toBe(true);
    });

    it("存在しない名前でfalseを返す", async () => {
      // Act
      const result = await repository.existsByUserIdAndName(
        "user-001",
        "存在しない",
      );

      // Assert
      expect(result).toBe(false);
    });

    it("除外IDが機能する", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', 'テスト', 'コンテンツ', 0, ${now}, ${now})
      `);

      // Act - 自身を除外
      const result = await repository.existsByUserIdAndName(
        "user-001",
        "テスト",
        "template-001",
      );

      // Assert
      expect(result).toBe(false);
    });

    it("異なるユーザーの同名テンプレートは検出しない", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-002', 'テスト', 'コンテンツ', 0, ${now}, ${now})
      `);

      // Act - user-001に対してuser-002のテンプレート名を検索
      const result = await repository.existsByUserIdAndName(
        "user-001",
        "テスト",
      );

      // Assert - 異なるユーザーなのでfalse
      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // exists
  // ===========================================================================

  describe("exists", () => {
    it("存在するIDでtrueを返す", async () => {
      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', 'テスト', 'コンテンツ', 0, ${now}, ${now})
      `);

      // Act
      const result = await repository.exists("template-001");

      // Assert
      expect(result).toBe(true);
    });

    it("存在しないIDでfalseを返す", async () => {
      // Act
      const result = await repository.exists("non-existent");

      // Assert
      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // authorization (認可テスト)
  // ===========================================================================

  describe("authorization", () => {
    it("所有者以外はアクセスできない（findByIdは全員アクセス可能だが、これはService層で制御）", async () => {
      // Note: Repository層では認可チェックを行わない設計のため、
      // このテストはService層の認可チェックテストで実施する
      // Repository層はデータアクセスのみを担当

      // Arrange
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', 'テスト', 'コンテンツ', 0, ${now}, ${now})
      `);

      // Act - Repository層はuserIdを検証しない（Service層の責務）
      const template = await repository.findById("template-001");

      // Assert - データは取得できる（認可はService層で行う）
      expect(template).not.toBeNull();
    });
  });
});
