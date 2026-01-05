/**
 * @file EntityRepository テスト
 * @module @repo/shared/db/repositories/__tests__/entity.repository.test
 * @description EntityRepositoryの固有メソッドのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { EntityRepository } from "../entity.repository";
import { isOk, isErr } from "../../../types/rag/result";
import { ErrorCodes } from "../../../types/rag/errors";
import { createEntityId } from "../../../types/rag/branded";

// =============================================================================
// テストスイート
// =============================================================================

describe("EntityRepository", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let repository: EntityRepository;

  beforeEach(() => {
    // In-memory SQLite database for testing
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

    // Create entities table (matching schema/graph/entities.ts)
    sqlite.exec(`
      CREATE TABLE entities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        normalized_name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        aliases TEXT NOT NULL DEFAULT '[]',
        embedding BLOB,
        embedding_model_id TEXT,
        importance REAL NOT NULL DEFAULT 0.5,
        mention_count INTEGER NOT NULL DEFAULT 1,
        metadata TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE INDEX entities_normalized_name_idx ON entities(normalized_name);
      CREATE INDEX entities_type_idx ON entities(type);
      CREATE INDEX entities_importance_idx ON entities(importance);
      CREATE UNIQUE INDEX entities_name_type_idx ON entities(normalized_name, type);
    `);

    db = drizzle(sqlite);
    repository = new EntityRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  // ===========================================================================
  // ヘルパー関数
  // ===========================================================================
  const insertEntity = (
    id: string,
    overrides: Partial<{
      name: string;
      normalizedName: string;
      type: string;
      description: string | null;
      aliases: string;
      importance: number;
      mentionCount: number;
      metadata: string | null;
    }> = {},
  ) => {
    const defaults = {
      name: `Entity ${id}`,
      normalizedName: `entity_${id}`.toLowerCase(),
      type: "concept",
      description: null,
      aliases: "[]",
      importance: 0.5,
      mentionCount: 1,
      metadata: null,
    };
    const data = { ...defaults, ...overrides };

    sqlite.exec(`
      INSERT INTO entities (
        id, name, normalized_name, type, description, aliases,
        importance, mention_count, metadata
      ) VALUES (
        '${id}', '${data.name}', '${data.normalizedName}', '${data.type}',
        ${data.description === null ? "NULL" : `'${data.description}'`},
        '${data.aliases}',
        ${data.importance}, ${data.mentionCount},
        ${data.metadata === null ? "NULL" : `'${data.metadata}'`}
      );
    `);
  };

  // ===========================================================================
  // 基本CRUD操作（BaseRepositoryから継承）
  // ===========================================================================
  describe("基本CRUD操作", () => {
    it("findByIdでエンティティを取得できる", async () => {
      // Arrange
      insertEntity("entity-001", {
        name: "TypeScript",
        normalizedName: "typescript",
      });
      const id = createEntityId("entity-001");

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data?.id).toBe("entity-001");
        expect(result.data?.name).toBe("TypeScript");
      }
    });
  });

  // ===========================================================================
  // AC-E01: findByNormalizedNameAndType
  // ===========================================================================
  describe("findByNormalizedNameAndType", () => {
    beforeEach(() => {
      insertEntity("entity-ts", {
        name: "TypeScript",
        normalizedName: "typescript",
        type: "technology",
      });
      insertEntity("entity-react", {
        name: "React",
        normalizedName: "react",
        type: "technology",
      });
      insertEntity("entity-typescript-doc", {
        name: "TypeScript Documentation",
        normalizedName: "typescript",
        type: "document",
      });
    });

    it("正規化名とタイプでエンティティを取得できる", async () => {
      // Act
      const result = await repository.findByNormalizedNameAndType(
        "typescript",
        "technology",
      );

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).not.toBeNull();
        expect(result.data?.id).toBe("entity-ts");
        expect(result.data?.normalizedName).toBe("typescript");
        expect(result.data?.type).toBe("technology");
      }
    });

    it("同じ正規化名でも異なるタイプは別エンティティ", async () => {
      // Act
      const result = await repository.findByNormalizedNameAndType(
        "typescript",
        "document",
      );

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).not.toBeNull();
        expect(result.data?.id).toBe("entity-typescript-doc");
        expect(result.data?.type).toBe("document");
      }
    });

    it("存在しない組み合わせではnullを返す", async () => {
      // Act
      const result = await repository.findByNormalizedNameAndType(
        "non-existent",
        "technology",
      );

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBeNull();
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.findByNormalizedNameAndType(
        "typescript",
        "technology",
      );

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-E02: findByType
  // ===========================================================================
  describe("findByType", () => {
    beforeEach(() => {
      insertEntity("tech-001", { name: "TypeScript", type: "technology" });
      insertEntity("tech-002", { name: "React", type: "technology" });
      insertEntity("person-001", { name: "Dan Abramov", type: "person" });
      insertEntity("org-001", { name: "Meta", type: "organization" });
    });

    it("タイプでエンティティ一覧を取得できる", async () => {
      // Act
      const result = await repository.findByType("technology");

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(2);
        expect(result.data.every((e) => e.type === "technology")).toBe(true);
      }
    });

    it("存在しないタイプでは空配列を返す", async () => {
      // Act
      const result = await repository.findByType("non-existent-type");

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toEqual([]);
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.findByType("technology");

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-E03: searchByName
  // ===========================================================================
  describe("searchByName", () => {
    beforeEach(() => {
      insertEntity("search-001", {
        name: "TypeScript Programming",
        normalizedName: "typescript programming",
      });
      insertEntity("search-002", {
        name: "JavaScript Basics",
        normalizedName: "javascript basics",
      });
      insertEntity("search-003", {
        name: "TypeScript Advanced",
        normalizedName: "typescript advanced",
      });
      insertEntity("search-004", {
        name: "Python",
        normalizedName: "python",
      });
    });

    it("名前の部分一致で検索できる", async () => {
      // Act
      const result = await repository.searchByName("TypeScript");

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(2);
        expect(result.data.every((e) => e.name.includes("TypeScript"))).toBe(
          true,
        );
      }
    });

    it("大文字小文字を区別しない検索", async () => {
      // Act
      const result = await repository.searchByName("typescript");

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(2);
      }
    });

    it("該当なしでは空配列を返す", async () => {
      // Act
      const result = await repository.searchByName("Rust");

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toEqual([]);
      }
    });

    it("重要度順でソートされる", async () => {
      // Arrange - Update importance
      sqlite.exec(`
        UPDATE entities SET importance = 0.9 WHERE id = 'search-003';
        UPDATE entities SET importance = 0.7 WHERE id = 'search-001';
      `);

      // Act
      const result = await repository.searchByName("TypeScript");

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data[0].id).toBe("search-003"); // Higher importance first
        expect(result.data[1].id).toBe("search-001");
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.searchByName("TypeScript");

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-E04: findTopByImportance
  // ===========================================================================
  describe("findTopByImportance", () => {
    beforeEach(() => {
      insertEntity("imp-001", { name: "Low Importance", importance: 0.2 });
      insertEntity("imp-002", { name: "High Importance", importance: 0.9 });
      insertEntity("imp-003", { name: "Medium Importance", importance: 0.5 });
      insertEntity("imp-004", { name: "Very High", importance: 0.95 });
      insertEntity("imp-005", { name: "Medium High", importance: 0.7 });
    });

    it("重要度上位のエンティティを取得できる", async () => {
      // Act
      const result = await repository.findTopByImportance(3);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(3);
        // 重要度降順でソート
        expect(result.data[0].importance).toBeGreaterThanOrEqual(
          result.data[1].importance,
        );
        expect(result.data[1].importance).toBeGreaterThanOrEqual(
          result.data[2].importance,
        );
      }
    });

    it("デフォルトでは10件取得", async () => {
      // Arrange - Add more entities
      for (let i = 6; i <= 15; i++) {
        insertEntity(`imp-${String(i).padStart(3, "0")}`, {
          name: `Entity ${i}`,
          importance: Math.random(),
        });
      }

      // Act
      const result = await repository.findTopByImportance();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(10);
      }
    });

    it("エンティティ数が少ない場合は全件を返す", async () => {
      // Act
      const result = await repository.findTopByImportance(10);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(5); // Only 5 exist
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.findTopByImportance(3);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-E05: upsert
  // ===========================================================================
  describe("upsert", () => {
    it("新規エンティティを作成できる", async () => {
      // Arrange
      const newEntity = {
        id: "upsert-new-001",
        name: "New Entity",
        normalizedName: "new_entity",
        type: "concept",
        aliases: [] as string[],
        importance: 0.6,
        mentionCount: 1,
      };

      // Act
      const result = await repository.upsert(newEntity);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.id).toBe("upsert-new-001");
        expect(result.data.name).toBe("New Entity");
      }

      // Verify in DB
      const row = sqlite
        .prepare("SELECT * FROM entities WHERE id = ?")
        .get("upsert-new-001");
      expect(row).toBeDefined();
    });

    it("既存エンティティを更新できる（同一normalizedName+type）", async () => {
      // Arrange
      insertEntity("upsert-existing", {
        name: "Original Name",
        normalizedName: "original",
        type: "concept",
        importance: 0.5,
        mentionCount: 1,
      });

      const updateData = {
        id: "upsert-existing-new", // 新しいIDだが、normalizedName+typeが同じ
        name: "Updated Name",
        normalizedName: "original",
        type: "concept",
        aliases: [] as string[],
        importance: 0.8,
        mentionCount: 5,
      };

      // Act
      const result = await repository.upsert(updateData);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.name).toBe("Updated Name");
        expect(result.data.importance).toBe(0.8);
        expect(result.data.mentionCount).toBe(5);
      }
    });

    it("mentionCountをインクリメントできる", async () => {
      // Arrange
      insertEntity("upsert-count", {
        name: "Count Entity",
        normalizedName: "count_entity",
        type: "concept",
        mentionCount: 5,
      });

      const updateData = {
        id: "upsert-count-new",
        name: "Count Entity",
        normalizedName: "count_entity",
        type: "concept",
        aliases: [] as string[],
        importance: 0.5,
        mentionCount: 6, // Incremented
      };

      // Act
      const result = await repository.upsert(updateData);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.mentionCount).toBe(6);
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      sqlite.close(); // DBを閉じてエラーを発生させる

      const newEntity = {
        id: "upsert-error",
        name: "Error Entity",
        normalizedName: "error_entity",
        type: "concept",
        aliases: [] as string[],
        importance: 0.5,
        mentionCount: 1,
      };

      // Act
      const result = await repository.upsert(newEntity);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });
});
