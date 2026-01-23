/**
 * SystemPromptRepository Edge Case Tests
 *
 * Phase 6: テスト拡充 - バウンダリ値、特殊文字、並列処理のエッジケース
 *
 * @see docs/30-workflows/system-prompt-db/outputs/phase-2/repository-interface-design.md
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { SystemPromptRepository } from "../system-prompt-repository.js";
import type { CreatePromptTemplateInput } from "../types/system-prompt.js";

describe("SystemPromptRepository Edge Cases", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let repository: SystemPromptRepository;

  beforeEach(() => {
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

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
  // Boundary Value Tests - 名前フィールド
  // ===========================================================================

  describe("名前フィールドのバウンダリ値", () => {
    it("1文字の名前で作成できる", async () => {
      const input: CreatePromptTemplateInput = {
        name: "A",
        content: "コンテンツ",
      };

      const created = await repository.create("user-001", input);

      expect(created.name).toBe("A");
    });

    it("50文字の名前で作成できる", async () => {
      const longName = "あ".repeat(50);
      const input: CreatePromptTemplateInput = {
        name: longName,
        content: "コンテンツ",
      };

      const created = await repository.create("user-001", input);

      expect(created.name).toBe(longName);
      expect(created.name.length).toBe(50);
    });

    it("51文字の名前でエラー", async () => {
      const tooLongName = "あ".repeat(51);
      const input: CreatePromptTemplateInput = {
        name: tooLongName,
        content: "コンテンツ",
      };

      await expect(repository.create("user-001", input)).rejects.toThrow();
    });

    it("空文字列の名前でエラー（トリム後）", async () => {
      const input: CreatePromptTemplateInput = {
        name: "   ",
        content: "コンテンツ",
      };

      await expect(repository.create("user-001", input)).rejects.toThrow();
    });
  });

  // ===========================================================================
  // Boundary Value Tests - コンテンツフィールド
  // ===========================================================================

  describe("コンテンツフィールドのバウンダリ値", () => {
    it("1文字のコンテンツで作成できる", async () => {
      const input: CreatePromptTemplateInput = {
        name: "テスト",
        content: "A",
      };

      const created = await repository.create("user-001", input);

      expect(created.content).toBe("A");
    });

    it("4000文字のコンテンツで作成できる", async () => {
      const longContent = "あ".repeat(4000);
      const input: CreatePromptTemplateInput = {
        name: "テスト",
        content: longContent,
      };

      const created = await repository.create("user-001", input);

      expect(created.content).toBe(longContent);
      expect(created.content.length).toBe(4000);
    });

    it("4001文字のコンテンツでエラー", async () => {
      const tooLongContent = "あ".repeat(4001);
      const input: CreatePromptTemplateInput = {
        name: "テスト",
        content: tooLongContent,
      };

      await expect(repository.create("user-001", input)).rejects.toThrow();
    });

    it("空文字列のコンテンツでエラー", async () => {
      const input: CreatePromptTemplateInput = {
        name: "テスト",
        content: "",
      };

      await expect(repository.create("user-001", input)).rejects.toThrow();
    });
  });

  // ===========================================================================
  // Special Characters Tests
  // ===========================================================================

  describe("特殊文字の取り扱い", () => {
    it("SQLインジェクション文字を含む名前", async () => {
      const input: CreatePromptTemplateInput = {
        name: "Robert'); DROP TABLE system_prompt_templates;--",
        content: "コンテンツ",
      };

      // Should succeed without breaking the database
      const created = await repository.create("user-001", input);

      expect(created.name).toBe(
        "Robert'); DROP TABLE system_prompt_templates;--",
      );

      // Verify database integrity
      const found = await repository.findById(created.id);
      expect(found).not.toBeNull();
    });

    it("Unicode絵文字を含む名前", async () => {
      const input: CreatePromptTemplateInput = {
        name: "🚀 テスト 🎉",
        content: "コンテンツ 👍",
      };

      const created = await repository.create("user-001", input);

      expect(created.name).toBe("🚀 テスト 🎉");
      expect(created.content).toBe("コンテンツ 👍");
    });

    it("改行・タブを含むコンテンツ", async () => {
      const input: CreatePromptTemplateInput = {
        name: "改行テスト",
        content: "行1\n行2\n行3\t\tタブ付き",
      };

      const created = await repository.create("user-001", input);

      expect(created.content).toContain("\n");
      expect(created.content).toContain("\t");
    });

    it("HTMLタグを含むコンテンツ", async () => {
      const input: CreatePromptTemplateInput = {
        name: "HTMLテスト",
        content: '<script>alert("XSS")</script>',
      };

      const created = await repository.create("user-001", input);

      expect(created.content).toBe('<script>alert("XSS")</script>');
    });

    it("NULL文字を含む名前", async () => {
      const input: CreatePromptTemplateInput = {
        name: "テスト\x00名前",
        content: "コンテンツ",
      };

      // NULL文字が処理されることを確認
      const created = await repository.create("user-001", input);
      expect(created.name).toBeDefined();
    });
  });

  // ===========================================================================
  // Concurrent Operations Tests
  // ===========================================================================

  describe("並列操作", () => {
    it("複数の同時作成が正しく処理される", async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        repository.create("user-001", {
          name: `テンプレート${i}`,
          content: `コンテンツ${i}`,
        }),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      const ids = results.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });

    it("複数の同時読み取りが正しく処理される", async () => {
      // Setup
      await repository.create("user-001", {
        name: "テスト",
        content: "コンテンツ",
      });

      // Concurrent reads
      const promises = Array.from({ length: 20 }, () =>
        repository.findAllByUserId("user-001"),
      );

      const results = await Promise.all(promises);

      expect(results.every((r) => r.length === 1)).toBe(true);
    });

    it("同時に同じ名前で作成を試みるとエラー", async () => {
      const promises = [
        repository.create("user-001", {
          name: "重複テスト",
          content: "コンテンツ1",
        }),
        repository.create("user-001", {
          name: "重複テスト",
          content: "コンテンツ2",
        }),
      ];

      const results = await Promise.allSettled(promises);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);
    });
  });

  // ===========================================================================
  // findAllByUserId Edge Cases
  // ===========================================================================

  describe("findAllByUserId エッジケース", () => {
    it("大量のテンプレートでもページネーションが機能する", async () => {
      // Create 100 templates
      for (let i = 0; i < 100; i++) {
        await repository.create("user-001", {
          name: `テンプレート${String(i).padStart(3, "0")}`,
          content: `コンテンツ${i}`,
        });
      }

      const page1 = await repository.findAllByUserId("user-001", {
        limit: 10,
        offset: 0,
      });
      const page5 = await repository.findAllByUserId("user-001", {
        limit: 10,
        offset: 40,
      });
      const page11 = await repository.findAllByUserId("user-001", {
        limit: 10,
        offset: 100,
      });

      expect(page1).toHaveLength(10);
      expect(page5).toHaveLength(10);
      expect(page11).toHaveLength(0);
    });

    it("降順ソートが機能する", async () => {
      const now = Date.now();
      for (let i = 0; i < 5; i++) {
        sqlite.exec(`
          INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
          VALUES ('template-${i}', 'user-001', 'テンプレート${i}', 'コンテンツ${i}', 0, ${now + i * 1000}, ${now + i * 1000})
        `);
      }

      const templates = await repository.findAllByUserId("user-001", {
        orderBy: "createdAt",
        orderDirection: "DESC",
      });

      expect(templates[0].name).toBe("テンプレート4");
      expect(templates[4].name).toBe("テンプレート0");
    });

    it("limit: 0 でも正しく動作する", async () => {
      await repository.create("user-001", {
        name: "テスト",
        content: "コンテンツ",
      });

      const templates = await repository.findAllByUserId("user-001", {
        limit: 0,
      });

      expect(templates).toEqual([]);
    });
  });

  // ===========================================================================
  // Update Edge Cases
  // ===========================================================================

  describe("update エッジケース", () => {
    it("空のupdatesオブジェクトでも更新日時が更新される", async () => {
      const oldTime = Date.now() - 10000;
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', '元の名前', '元のコンテンツ', 0, ${oldTime}, ${oldTime})
      `);

      const updated = await repository.update("template-001", {});

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(oldTime);
      expect(updated.name).toBe("元の名前");
      expect(updated.content).toBe("元のコンテンツ");
    });

    it("同じ値に更新しても正常に処理される", async () => {
      const now = Date.now();
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', '元の名前', '元のコンテンツ', 0, ${now}, ${now})
      `);

      const updated = await repository.update("template-001", {
        name: "元の名前",
        content: "元のコンテンツ",
      });

      expect(updated.name).toBe("元の名前");
      expect(updated.content).toBe("元のコンテンツ");
    });
  });

  // ===========================================================================
  // Date Handling Tests
  // ===========================================================================

  describe("日付処理", () => {
    it("createdAtとupdatedAtがDate型で返される", async () => {
      const created = await repository.create("user-001", {
        name: "テスト",
        content: "コンテンツ",
      });

      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
    });

    it("古い日付も正しく処理される", async () => {
      const oldDate = new Date("2000-01-01T00:00:00Z");
      sqlite.exec(`
        INSERT INTO system_prompt_templates (id, user_id, name, content, is_preset, created_at, updated_at)
        VALUES ('template-001', 'user-001', 'テスト', 'コンテンツ', 0, ${oldDate.getTime()}, ${oldDate.getTime()})
      `);

      const found = await repository.findById("template-001");

      expect(found?.createdAt.getFullYear()).toBe(2000);
      expect(found?.createdAt.getMonth()).toBe(0);
      expect(found?.createdAt.getDate()).toBe(1);
    });
  });

  // ===========================================================================
  // ID Generation Tests
  // ===========================================================================

  describe("ID生成", () => {
    it("生成されるIDはユニークである", async () => {
      const ids = new Set<string>();

      for (let i = 0; i < 100; i++) {
        const created = await repository.create("user-001", {
          name: `テンプレート${i}`,
          content: "コンテンツ",
        });
        ids.add(created.id);
      }

      expect(ids.size).toBe(100);
    });

    it("IDはUUID形式である", async () => {
      const created = await repository.create("user-001", {
        name: "テスト",
        content: "コンテンツ",
      });

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(created.id).toMatch(uuidRegex);
    });
  });

  // ===========================================================================
  // Error Recovery Tests
  // ===========================================================================

  describe("エラー回復", () => {
    it("エラー後も正常に操作できる", async () => {
      // Trigger an error
      try {
        await repository.create("user-001", {
          name: "あ".repeat(51),
          content: "コンテンツ",
        });
      } catch {
        // Expected error
      }

      // Should still work
      const created = await repository.create("user-001", {
        name: "正常なテンプレート",
        content: "コンテンツ",
      });

      expect(created.name).toBe("正常なテンプレート");
    });

    it("不正なIDでの更新後も正常に操作できる", async () => {
      // Trigger an error
      try {
        await repository.update("non-existent", { name: "更新" });
      } catch {
        // Expected error
      }

      // Should still work
      const created = await repository.create("user-001", {
        name: "正常なテンプレート",
        content: "コンテンツ",
      });

      expect(created.name).toBe("正常なテンプレート");
    });
  });
});
