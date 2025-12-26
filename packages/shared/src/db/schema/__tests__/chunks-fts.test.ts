/**
 * chunks_fts FTS5仮想テーブル テスト
 *
 * @see docs/30-workflows/rag-conversion-system/design-chunks-fts5.md
 */

import { describe, it, expect } from "vitest";
import {
  FTS5_CONFIG,
  initializeChunksFts,
  createChunksFtsTable,
  createChunksFtsTriggers,
  optimizeChunksFts,
  rebuildChunksFts,
  checkChunksFtsIntegrity,
  dropChunksFts,
} from "../chunks-fts";

describe("chunks-fts module", () => {
  describe("FTS5_CONFIG", () => {
    it("should have correct table name", () => {
      expect(FTS5_CONFIG.tableName).toBe("chunks_fts");
    });

    it("should have correct source table", () => {
      expect(FTS5_CONFIG.sourceTable).toBe("chunks");
    });

    it("should have unicode61 tokenizer with diacritics removal", () => {
      expect(FTS5_CONFIG.tokenizer).toBe("unicode61 remove_diacritics 2");
    });

    it("should have 3 indexed columns", () => {
      expect(FTS5_CONFIG.indexedColumns).toHaveLength(3);
      expect(FTS5_CONFIG.indexedColumns).toContain("content");
      expect(FTS5_CONFIG.indexedColumns).toContain("contextual_content");
      expect(FTS5_CONFIG.indexedColumns).toContain("parent_header");
    });
  });

  describe("function exports", () => {
    it("should export initializeChunksFts", () => {
      expect(initializeChunksFts).toBeDefined();
      expect(typeof initializeChunksFts).toBe("function");
    });

    it("should export createChunksFtsTable", () => {
      expect(createChunksFtsTable).toBeDefined();
      expect(typeof createChunksFtsTable).toBe("function");
    });

    it("should export createChunksFtsTriggers", () => {
      expect(createChunksFtsTriggers).toBeDefined();
      expect(typeof createChunksFtsTriggers).toBe("function");
    });

    it("should export optimizeChunksFts", () => {
      expect(optimizeChunksFts).toBeDefined();
      expect(typeof optimizeChunksFts).toBe("function");
    });

    it("should export rebuildChunksFts", () => {
      expect(rebuildChunksFts).toBeDefined();
      expect(typeof rebuildChunksFts).toBe("function");
    });

    it("should export checkChunksFtsIntegrity", () => {
      expect(checkChunksFtsIntegrity).toBeDefined();
      expect(typeof checkChunksFtsIntegrity).toBe("function");
    });

    it("should export dropChunksFts", () => {
      expect(dropChunksFts).toBeDefined();
      expect(typeof dropChunksFts).toBe("function");
    });
  });

  // Note: Integration tests with actual DB would go here
  // These require a test database setup with better-sqlite3 or libsql
  describe("integration tests", () => {
    // モックDB作成ヘルパー
    const createMockDb = () => {
      return {
        run: vi.fn().mockResolvedValue(undefined),
        all: vi.fn().mockResolvedValue([]),
        get: vi.fn().mockResolvedValue(undefined),
      } as any;
    };

    it("initializeChunksFts creates FTS5 table", async () => {
      const mockDb = createMockDb();
      await initializeChunksFts(mockDb);

      // run()が呼ばれたことを確認（テーブルとトリガー作成）
      expect(mockDb.run).toHaveBeenCalled();
      expect(mockDb.run.mock.calls.length).toBeGreaterThan(0);
    });

    it("initializeChunksFts creates triggers and table", async () => {
      const mockDb = createMockDb();
      await initializeChunksFts(mockDb);

      // FTS5テーブルと3つのトリガーが作成される（合計4回のSQL実行）
      expect(mockDb.run).toHaveBeenCalled();
      expect(mockDb.run.mock.calls.length).toBeGreaterThanOrEqual(4);
    });

    it("initializeChunksFts is idempotent", async () => {
      const mockDb = createMockDb();

      // 2回呼び出しても成功する
      await initializeChunksFts(mockDb);
      await initializeChunksFts(mockDb);

      expect(mockDb.run).toHaveBeenCalled();
    });

    it("createChunksFtsTable creates virtual table", async () => {
      const mockDb = createMockDb();
      await createChunksFtsTable(mockDb);

      // FTS5テーブル作成のSQL実行を確認
      expect(mockDb.run).toHaveBeenCalledTimes(1);
    });

    it("createChunksFtsTriggers creates all triggers", async () => {
      const mockDb = createMockDb();
      await createChunksFtsTriggers(mockDb);

      // 3つのトリガーが作成されることを確認
      expect(mockDb.run).toHaveBeenCalledTimes(3);
    });

    it("checkChunksFtsIntegrity returns status", async () => {
      const mockDb = {
        ...createMockDb(),
        all: vi.fn().mockResolvedValue([{ chunks_count: 10, fts_count: 10 }]),
      } as any;

      const result = await checkChunksFtsIntegrity(mockDb);

      expect(result).toBeDefined();
      expect(result.chunksCount).toBe(10);
      expect(result.chunksFtsCount).toBe(10);
      expect(result.isConsistent).toBe(true);
    });

    it("checkChunksFtsIntegrity detects inconsistency", async () => {
      const mockDb = {
        ...createMockDb(),
        all: vi.fn().mockResolvedValue([{ chunks_count: 10, fts_count: 8 }]),
      } as any;

      const result = await checkChunksFtsIntegrity(mockDb);

      expect(result.isConsistent).toBe(false);
      expect(result.chunksCount).not.toBe(result.chunksFtsCount);
    });

    it("rebuildChunksFts executes rebuild steps", async () => {
      const mockDb = createMockDb();
      await rebuildChunksFts(mockDb);

      // rebuildコマンドが実行されることを確認
      expect(mockDb.run).toHaveBeenCalledTimes(1);
    });

    it("optimizeChunksFts completes without error", async () => {
      const mockDb = createMockDb();
      await optimizeChunksFts(mockDb);

      expect(mockDb.run).toHaveBeenCalled();
    });

    it("dropChunksFts removes table and triggers", async () => {
      const mockDb = createMockDb();
      await dropChunksFts(mockDb);

      // 4回のDROP実行（3つのトリガー + 1つのテーブル）を確認
      expect(mockDb.run).toHaveBeenCalledTimes(4);
    });
  });
});
