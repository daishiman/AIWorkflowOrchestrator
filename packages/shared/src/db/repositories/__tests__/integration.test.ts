/**
 * @file Repository統合テスト
 * @module @repo/shared/db/repositories/__tests__/integration.test
 * @description 複数Repositoryを組み合わせた実際の使用シナリオの検証
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { createRepositories, type Repositories } from "../index";
import { isOk, isErr } from "../../../types/rag/result";
import { createFileId } from "../../../types/rag/branded";

// =============================================================================
// 統合テストスイート
// =============================================================================

describe("Repository統合テスト", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let repos: Repositories;

  beforeEach(() => {
    // In-memory SQLite database for testing
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

    // Create all tables - 実際のスキーマに合わせた定義
    sqlite.exec(`
      -- Files table
      CREATE TABLE files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        category TEXT NOT NULL,
        size INTEGER NOT NULL,
        hash TEXT NOT NULL,
        encoding TEXT NOT NULL DEFAULT 'utf-8',
        last_modified INTEGER NOT NULL,
        metadata TEXT NOT NULL DEFAULT '{}',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        deleted_at INTEGER
      );
      CREATE UNIQUE INDEX files_hash_idx ON files(hash);
      CREATE INDEX files_path_idx ON files(path);

      -- Chunks table - 実際のスキーマに合わせた定義
      CREATE TABLE chunks (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL,
        content TEXT NOT NULL,
        contextual_content TEXT,
        chunk_index INTEGER NOT NULL,
        start_line INTEGER,
        end_line INTEGER,
        start_char INTEGER,
        end_char INTEGER,
        parent_header TEXT,
        strategy TEXT NOT NULL,
        token_count INTEGER,
        hash TEXT NOT NULL,
        prev_chunk_id TEXT,
        next_chunk_id TEXT,
        overlap_tokens INTEGER NOT NULL DEFAULT 0,
        metadata TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
      );
      CREATE INDEX idx_chunks_file_id ON chunks(file_id);
      CREATE UNIQUE INDEX idx_chunks_hash ON chunks(hash);
      CREATE INDEX idx_chunks_chunk_index ON chunks(file_id, chunk_index);

      -- Entities table
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
      CREATE UNIQUE INDEX entities_name_type_idx ON entities(normalized_name, type);
    `);

    db = drizzle(sqlite);
    repos = createRepositories(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  // ===========================================================================
  // シナリオ1: エンティティ管理フロー
  // ===========================================================================
  describe("シナリオ1: エンティティ管理フロー", () => {
    it("エンティティのupsertで新規作成と更新を行える", async () => {
      // Step 1: 新規エンティティ作成
      const entity1 = {
        id: "entity-001",
        name: "TypeScript",
        normalizedName: "typescript",
        type: "technology",
        aliases: ["TS"],
        importance: 0.7,
        mentionCount: 1,
      };

      const createResult = await repos.entities.upsert(entity1);
      expect(isOk(createResult)).toBe(true);
      if (!isOk(createResult)) return;
      expect(createResult.data.name).toBe("TypeScript");
      expect(createResult.data.mentionCount).toBe(1);

      // Step 2: 同じnormalizedName+typeでupsert（更新）
      const entity1Updated = {
        id: "entity-001-updated",
        name: "TypeScript Language",
        normalizedName: "typescript",
        type: "technology",
        aliases: ["TS", "TypeScript"],
        importance: 0.9,
        mentionCount: 5,
      };

      const updateResult = await repos.entities.upsert(entity1Updated);
      expect(isOk(updateResult)).toBe(true);
      if (!isOk(updateResult)) return;
      expect(updateResult.data.name).toBe("TypeScript Language");
      expect(updateResult.data.mentionCount).toBe(5);

      // Step 3: 件数確認（重複作成されていないこと）
      const countResult = await repos.entities.count();
      expect(isOk(countResult)).toBe(true);
      if (isOk(countResult)) {
        expect(countResult.data).toBe(1);
      }
    });

    it("エンティティの検索と重要度ランキングが機能する", async () => {
      // Arrange: 複数エンティティを作成
      const entities = [
        {
          id: "ent-1",
          name: "React Framework",
          normalizedName: "react framework",
          type: "technology",
          aliases: [],
          importance: 0.8,
          mentionCount: 10,
        },
        {
          id: "ent-2",
          name: "React Native",
          normalizedName: "react native",
          type: "technology",
          aliases: [],
          importance: 0.6,
          mentionCount: 5,
        },
        {
          id: "ent-3",
          name: "Vue.js",
          normalizedName: "vue.js",
          type: "technology",
          aliases: [],
          importance: 0.7,
          mentionCount: 8,
        },
        {
          id: "ent-4",
          name: "Dan Abramov",
          normalizedName: "dan abramov",
          type: "person",
          aliases: [],
          importance: 0.5,
          mentionCount: 3,
        },
      ];

      for (const entity of entities) {
        await repos.entities.upsert(entity);
      }

      // Act & Assert: 名前検索
      const searchResult = await repos.entities.searchByName("React");
      expect(isOk(searchResult)).toBe(true);
      if (isOk(searchResult)) {
        expect(searchResult.data.length).toBe(2);
        // 重要度順でソートされている
        expect(searchResult.data[0].name).toBe("React Framework");
      }

      // Act & Assert: タイプ検索
      const typeResult = await repos.entities.findByType("technology");
      expect(isOk(typeResult)).toBe(true);
      if (isOk(typeResult)) {
        expect(typeResult.data.length).toBe(3);
      }

      // Act & Assert: 重要度上位
      const topResult = await repos.entities.findTopByImportance(2);
      expect(isOk(topResult)).toBe(true);
      if (isOk(topResult)) {
        expect(topResult.data.length).toBe(2);
        expect(topResult.data[0].importance).toBeGreaterThanOrEqual(
          topResult.data[1].importance,
        );
      }
    });
  });

  // ===========================================================================
  // シナリオ2: ファイルの論理削除と重複検出フロー
  // ===========================================================================
  describe("シナリオ2: ファイルの論理削除と重複検出フロー", () => {
    it("論理削除後、ファイルが検索結果から除外される", async () => {
      const now = new Date();

      // Step 1: ファイルを作成
      const createResult = await repos.files.create({
        id: "original-file",
        name: "document.md",
        path: "/docs/document.md",
        mimeType: "text/markdown",
        category: "document",
        size: 1000,
        hash: "same-hash-value",
        encoding: "utf-8",
        lastModified: now,
        metadata: "{}",
        createdAt: now,
        updatedAt: now,
      });
      expect(isOk(createResult)).toBe(true);

      // Step 2: ハッシュで重複検出
      const duplicateCheck1 = await repos.files.findByHash("same-hash-value");
      expect(isOk(duplicateCheck1)).toBe(true);
      if (isOk(duplicateCheck1)) {
        expect(duplicateCheck1.data).not.toBeNull();
        expect(duplicateCheck1.data?.id).toBe("original-file");
      }

      // Step 3: 論理削除
      const softDeleteResult = await repos.files.softDelete(
        createFileId("original-file"),
      );
      expect(isOk(softDeleteResult)).toBe(true);

      // Step 4: 論理削除後はハッシュ検索で見つからない
      const duplicateCheck2 = await repos.files.findByHash("same-hash-value");
      expect(isOk(duplicateCheck2)).toBe(true);
      if (isOk(duplicateCheck2)) {
        expect(duplicateCheck2.data).toBeNull();
      }
    });

    it("複数IDでの一括取得が正常に動作する", async () => {
      const now = new Date();

      // Arrange: 複数ファイルを作成
      for (let i = 1; i <= 5; i++) {
        await repos.files.create({
          id: `batch-file-${i}`,
          name: `file-${i}.md`,
          path: `/docs/file-${i}.md`,
          mimeType: "text/markdown",
          category: "document",
          size: 1000 * i,
          hash: `batch-hash-${i}`,
          encoding: "utf-8",
          lastModified: now,
          metadata: "{}",
          createdAt: now,
          updatedAt: now,
        });
      }

      // 1つを論理削除
      await repos.files.softDelete(createFileId("batch-file-3"));

      // Act: 一括取得
      const ids = [
        createFileId("batch-file-1"),
        createFileId("batch-file-2"),
        createFileId("batch-file-3"), // 削除済み
        createFileId("batch-file-4"),
        createFileId("batch-file-999"), // 存在しない
      ];

      const result = await repos.files.findByIds(ids);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(3); // 1, 2, 4のみ
        const foundIds = result.data.map((f) => f.id).sort();
        expect(foundIds).toEqual([
          "batch-file-1",
          "batch-file-2",
          "batch-file-4",
        ]);
      }
    });
  });

  // ===========================================================================
  // シナリオ3: ページネーション
  // ===========================================================================
  describe("シナリオ3: ページネーション", () => {
    it("ファイル一覧のページネーションが正常に動作する", async () => {
      const now = new Date();

      // Arrange: 25件のファイルを作成
      for (let i = 1; i <= 25; i++) {
        await repos.files.create({
          id: `page-file-${String(i).padStart(3, "0")}`,
          name: `file-${i}.md`,
          path: `/docs/file-${i}.md`,
          mimeType: "text/markdown",
          category: "document",
          size: 1000,
          hash: `page-hash-${i}`,
          encoding: "utf-8",
          lastModified: now,
          metadata: "{}",
          createdAt: now,
          updatedAt: now,
        });
      }

      // Act: 1ページ目（10件）
      const page1 = await repos.files.findAll({ limit: 10, offset: 0 });
      expect(isOk(page1)).toBe(true);
      if (isOk(page1)) {
        expect(page1.data.items.length).toBe(10);
        expect(page1.data.total).toBe(25);
        expect(page1.data.hasMore).toBe(true);
      }

      // Act: 2ページ目（10件）
      const page2 = await repos.files.findAll({ limit: 10, offset: 10 });
      expect(isOk(page2)).toBe(true);
      if (isOk(page2)) {
        expect(page2.data.items.length).toBe(10);
        expect(page2.data.hasMore).toBe(true);
      }

      // Act: 3ページ目（残り5件）
      const page3 = await repos.files.findAll({ limit: 10, offset: 20 });
      expect(isOk(page3)).toBe(true);
      if (isOk(page3)) {
        expect(page3.data.items.length).toBe(5);
        expect(page3.data.hasMore).toBe(false);
      }
    });
  });

  // ===========================================================================
  // シナリオ4: Factory関数の検証
  // ===========================================================================
  describe("シナリオ4: Factory関数の検証", () => {
    it("createRepositoriesで全てのRepositoryが取得できる", () => {
      expect(repos.files).toBeDefined();
      expect(repos.chunks).toBeDefined();
      expect(repos.entities).toBeDefined();
    });

    it("各Repositoryが独立して動作する", async () => {
      // ファイル作成
      const now = new Date();
      const fileResult = await repos.files.create({
        id: "factory-test-file",
        name: "test.md",
        path: "/test.md",
        mimeType: "text/markdown",
        category: "document",
        size: 100,
        hash: "factory-hash",
        encoding: "utf-8",
        lastModified: now,
        metadata: "{}",
        createdAt: now,
        updatedAt: now,
      });
      expect(isOk(fileResult)).toBe(true);

      // エンティティ作成
      const entityResult = await repos.entities.upsert({
        id: "factory-test-entity",
        name: "Test Entity",
        normalizedName: "test entity",
        type: "concept",
        aliases: [],
        importance: 0.5,
        mentionCount: 1,
      });
      expect(isOk(entityResult)).toBe(true);

      // 各カウント確認
      const fileCount = await repos.files.count();
      const entityCount = await repos.entities.count();

      expect(isOk(fileCount)).toBe(true);
      expect(isOk(entityCount)).toBe(true);
      if (isOk(fileCount) && isOk(entityCount)) {
        expect(fileCount.data).toBe(1);
        expect(entityCount.data).toBe(1);
      }
    });
  });

  // ===========================================================================
  // シナリオ5: エラーハンドリング
  // ===========================================================================
  describe("シナリオ5: エラーハンドリング", () => {
    it("存在しないIDでの更新はエラーを返す", async () => {
      const result = await repos.files.update(createFileId("non-existent"), {
        name: "updated.md",
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe("RECORD_NOT_FOUND");
      }
    });

    it("存在しないIDでの論理削除はエラーを返す", async () => {
      const result = await repos.files.softDelete(createFileId("non-existent"));

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe("RECORD_NOT_FOUND");
      }
    });
  });
});
