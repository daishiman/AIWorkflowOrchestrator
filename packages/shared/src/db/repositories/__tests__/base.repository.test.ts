/**
 * @file BaseRepository テスト
 * @module @repo/shared/db/repositories/__tests__/base.repository.test
 * @description BaseRepositoryの基本CRUD操作とページネーションのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { BaseRepository } from "../base.repository";
import { isOk, isErr } from "../../../types/rag/result";
import { ErrorCodes } from "../../../types/rag/errors";
import type { Brand } from "../../../types/rag/branded";

// =============================================================================
// テスト用テーブル・型定義
// =============================================================================

/**
 * テスト用ID型
 */
type TestId = Brand<string, "TestId">;

const createTestId = (id: string): TestId => id as TestId;

/**
 * テスト用テーブル定義
 */
const testTable = sqliteTable("test_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  value: integer("value").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

type TestItem = typeof testTable.$inferSelect;
type NewTestItem = typeof testTable.$inferInsert;

/**
 * テスト用具象Repository
 */
class TestRepository extends BaseRepository<
  typeof testTable,
  TestItem,
  NewTestItem,
  TestId
> {
  constructor(db: ReturnType<typeof drizzle>) {
    super(db, testTable, testTable.id);
  }
}

// =============================================================================
// テストスイート
// =============================================================================

describe("BaseRepository", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let repository: TestRepository;

  beforeEach(() => {
    // In-memory SQLite database for testing
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

    // Create test table
    sqlite.exec(`
      CREATE TABLE test_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        value INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    db = drizzle(sqlite);
    repository = new TestRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  // ===========================================================================
  // AC-B01: findById
  // ===========================================================================
  describe("findById", () => {
    it("存在するIDでレコードを取得できる", async () => {
      // Arrange
      const id = createTestId("test-001");
      sqlite.exec(`
        INSERT INTO test_items (id, name, value) VALUES ('test-001', 'Test Item', 100);
      `);

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).not.toBeNull();
        expect(result.data?.id).toBe("test-001");
        expect(result.data?.name).toBe("Test Item");
        expect(result.data?.value).toBe(100);
      }
    });

    it("存在しないIDではnullを返す", async () => {
      // Arrange
      const id = createTestId("non-existent");

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBeNull();
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      sqlite.close(); // DBを閉じてエラーを発生させる
      const id = createTestId("test-001");

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-B02: findAll
  // ===========================================================================
  describe("findAll", () => {
    beforeEach(() => {
      // テストデータ挿入
      for (let i = 1; i <= 25; i++) {
        sqlite.exec(`
          INSERT INTO test_items (id, name, value)
          VALUES ('item-${String(i).padStart(3, "0")}', 'Item ${i}', ${i * 10});
        `);
      }
    });

    it("デフォルトパラメータで全件取得できる", async () => {
      // Act
      const result = await repository.findAll();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.items.length).toBeGreaterThan(0);
        expect(result.data.total).toBe(25);
      }
    });

    it("ページネーションパラメータで取得件数を制限できる", async () => {
      // Act
      const result = await repository.findAll({ limit: 10, offset: 0 });

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.items.length).toBe(10);
        expect(result.data.limit).toBe(10);
        expect(result.data.offset).toBe(0);
        expect(result.data.total).toBe(25);
        expect(result.data.hasMore).toBe(true);
      }
    });

    it("offsetで取得開始位置を指定できる", async () => {
      // Act
      const result = await repository.findAll({ limit: 10, offset: 20 });

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.items.length).toBe(5);
        expect(result.data.offset).toBe(20);
        expect(result.data.hasMore).toBe(false);
      }
    });

    it("空のテーブルでは空の結果を返す", async () => {
      // Arrange
      sqlite.exec("DELETE FROM test_items;");

      // Act
      const result = await repository.findAll();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.items).toEqual([]);
        expect(result.data.total).toBe(0);
        expect(result.data.hasMore).toBe(false);
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.findAll();

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-B03: create
  // ===========================================================================
  describe("create", () => {
    it("新規レコードを作成できる", async () => {
      // Arrange
      const newItem: NewTestItem = {
        id: "new-item-001",
        name: "New Item",
        value: 999,
      };

      // Act
      const result = await repository.create(newItem);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.id).toBe("new-item-001");
        expect(result.data.name).toBe("New Item");
        expect(result.data.value).toBe(999);
      }

      // Verify in DB
      const row = sqlite
        .prepare("SELECT * FROM test_items WHERE id = ?")
        .get("new-item-001") as TestItem;
      expect(row).toBeDefined();
      expect(row.name).toBe("New Item");
    });

    it("重複IDでDBエラーを返す", async () => {
      // Arrange
      sqlite.exec(`
        INSERT INTO test_items (id, name, value) VALUES ('dup-001', 'Existing', 100);
      `);
      const newItem: NewTestItem = {
        id: "dup-001",
        name: "Duplicate",
        value: 200,
      };

      // Act
      const result = await repository.create(newItem);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-B04: createMany
  // ===========================================================================
  describe("createMany", () => {
    it("複数レコードを一括作成できる", async () => {
      // Arrange
      const newItems: NewTestItem[] = [
        { id: "batch-001", name: "Batch 1", value: 100 },
        { id: "batch-002", name: "Batch 2", value: 200 },
        { id: "batch-003", name: "Batch 3", value: 300 },
      ];

      // Act
      const result = await repository.createMany(newItems);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(3);
      }

      // Verify in DB
      const count = sqlite
        .prepare("SELECT COUNT(*) as cnt FROM test_items")
        .get() as { cnt: number };
      expect(count.cnt).toBe(3);
    });

    it("空配列では空の結果を返す", async () => {
      // Act
      const result = await repository.createMany([]);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toEqual([]);
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      sqlite.close(); // DBを閉じてエラーを発生させる
      const newItems: NewTestItem[] = [
        { id: "batch-001", name: "Batch 1", value: 100 },
      ];

      // Act
      const result = await repository.createMany(newItems);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-B05: update
  // ===========================================================================
  describe("update", () => {
    beforeEach(() => {
      sqlite.exec(`
        INSERT INTO test_items (id, name, value) VALUES ('update-001', 'Original', 100);
      `);
    });

    it("既存レコードを更新できる", async () => {
      // Arrange
      const id = createTestId("update-001");

      // Act
      const result = await repository.update(id, {
        name: "Updated",
        value: 200,
      });

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.name).toBe("Updated");
        expect(result.data.value).toBe(200);
      }
    });

    it("部分更新ができる", async () => {
      // Arrange
      const id = createTestId("update-001");

      // Act
      const result = await repository.update(id, { name: "Partial Update" });

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.name).toBe("Partial Update");
        expect(result.data.value).toBe(100); // 変更なし
      }
    });

    it("存在しないIDではRECORD_NOT_FOUNDエラーを返す", async () => {
      // Arrange
      const id = createTestId("non-existent");

      // Act
      const result = await repository.update(id, { name: "New Name" });

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.RECORD_NOT_FOUND);
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      const id = createTestId("update-001");
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.update(id, { name: "Updated" });

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-B06: delete
  // ===========================================================================
  describe("delete", () => {
    beforeEach(() => {
      sqlite.exec(`
        INSERT INTO test_items (id, name, value) VALUES ('delete-001', 'To Delete', 100);
      `);
    });

    it("既存レコードを削除できる", async () => {
      // Arrange
      const id = createTestId("delete-001");

      // Act
      const result = await repository.delete(id);

      // Assert
      expect(isOk(result)).toBe(true);

      // Verify deletion
      const row = sqlite
        .prepare("SELECT * FROM test_items WHERE id = ?")
        .get("delete-001");
      expect(row).toBeUndefined();
    });

    it("存在しないIDではRECORD_NOT_FOUNDエラーを返す", async () => {
      // Arrange
      const id = createTestId("non-existent");

      // Act
      const result = await repository.delete(id);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.RECORD_NOT_FOUND);
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      const id = createTestId("delete-001");
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.delete(id);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-B07: exists
  // ===========================================================================
  describe("exists", () => {
    beforeEach(() => {
      sqlite.exec(`
        INSERT INTO test_items (id, name, value) VALUES ('exists-001', 'Existing', 100);
      `);
    });

    it("存在するIDではtrueを返す", async () => {
      // Arrange
      const id = createTestId("exists-001");

      // Act
      const result = await repository.exists(id);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(true);
      }
    });

    it("存在しないIDではfalseを返す", async () => {
      // Arrange
      const id = createTestId("non-existent");

      // Act
      const result = await repository.exists(id);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(false);
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      const id = createTestId("exists-001");
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.exists(id);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-B08: count
  // ===========================================================================
  describe("count", () => {
    it("レコード件数を取得できる", async () => {
      // Arrange
      for (let i = 1; i <= 5; i++) {
        sqlite.exec(`
          INSERT INTO test_items (id, name, value) VALUES ('count-${i}', 'Item ${i}', ${i});
        `);
      }

      // Act
      const result = await repository.count();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(5);
      }
    });

    it("空のテーブルでは0を返す", async () => {
      // Act
      const result = await repository.count();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(0);
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.count();

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });
});
