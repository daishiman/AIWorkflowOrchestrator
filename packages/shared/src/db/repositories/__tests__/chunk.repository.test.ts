/**
 * @file ChunkRepository テスト
 * @module @repo/shared/db/repositories/__tests__/chunk.repository.test
 * @description ChunkRepositoryの固有メソッドのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { ChunkRepository } from "../chunk.repository";
import { isOk, isErr } from "../../../types/rag/result";
import { ErrorCodes } from "../../../types/rag/errors";
import {
  createChunkId,
  createFileId,
  type ChunkId,
} from "../../../types/rag/branded";

// =============================================================================
// テストスイート
// =============================================================================

describe("ChunkRepository", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let repository: ChunkRepository;

  beforeEach(() => {
    // In-memory SQLite database for testing
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

    // Create files table first (for foreign key)
    sqlite.exec(`
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

      -- Insert test file for foreign key references
      INSERT INTO files (id, name, path, mime_type, category, size, hash, last_modified, created_at, updated_at)
      VALUES ('file-001', 'test.txt', '/path/test.txt', 'text/plain', 'document', 1024, 'file-hash-001', 0, 0, 0);
      INSERT INTO files (id, name, path, mime_type, category, size, hash, last_modified, created_at, updated_at)
      VALUES ('file-002', 'test2.txt', '/path/test2.txt', 'text/plain', 'document', 2048, 'file-hash-002', 0, 0, 0);
    `);

    // Create chunks table (matching schema/chunks.ts)
    sqlite.exec(`
      CREATE TABLE chunks (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
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
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE INDEX idx_chunks_file_id ON chunks(file_id);
      CREATE UNIQUE INDEX idx_chunks_hash ON chunks(hash);
      CREATE INDEX idx_chunks_chunk_index ON chunks(file_id, chunk_index);
      CREATE INDEX idx_chunks_strategy ON chunks(strategy);
    `);

    db = drizzle(sqlite);
    repository = new ChunkRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  // ===========================================================================
  // ヘルパー関数
  // ===========================================================================
  const insertChunk = (
    id: string,
    fileId: string,
    chunkIndex: number,
    overrides: Partial<{
      content: string;
      contextualContent: string | null;
      startLine: number | null;
      endLine: number | null;
      startChar: number | null;
      endChar: number | null;
      parentHeader: string | null;
      strategy: string;
      tokenCount: number | null;
      hash: string;
      prevChunkId: string | null;
      nextChunkId: string | null;
      overlapTokens: number;
      metadata: string | null;
    }> = {},
  ) => {
    const defaults = {
      content: `Content for chunk ${id}`,
      contextualContent: null,
      startLine: null,
      endLine: null,
      startChar: null,
      endChar: null,
      parentHeader: null,
      strategy: "fixed_size",
      tokenCount: 100,
      hash: `chunk-hash-${id}`,
      prevChunkId: null,
      nextChunkId: null,
      overlapTokens: 0,
      metadata: null,
    };
    const data = { ...defaults, ...overrides };

    const sqlStr = `
      INSERT INTO chunks (
        id, file_id, content, contextual_content, chunk_index,
        start_line, end_line, start_char, end_char, parent_header,
        strategy, token_count, hash, prev_chunk_id, next_chunk_id,
        overlap_tokens, metadata
      ) VALUES (
        '${id}', '${fileId}', '${data.content}',
        ${data.contextualContent === null ? "NULL" : `'${data.contextualContent}'`},
        ${chunkIndex},
        ${data.startLine === null ? "NULL" : data.startLine},
        ${data.endLine === null ? "NULL" : data.endLine},
        ${data.startChar === null ? "NULL" : data.startChar},
        ${data.endChar === null ? "NULL" : data.endChar},
        ${data.parentHeader === null ? "NULL" : `'${data.parentHeader}'`},
        '${data.strategy}',
        ${data.tokenCount === null ? "NULL" : data.tokenCount},
        '${data.hash}',
        ${data.prevChunkId === null ? "NULL" : `'${data.prevChunkId}'`},
        ${data.nextChunkId === null ? "NULL" : `'${data.nextChunkId}'`},
        ${data.overlapTokens},
        ${data.metadata === null ? "NULL" : `'${data.metadata}'`}
      );
    `;
    sqlite.exec(sqlStr);
  };

  // ===========================================================================
  // 基本CRUD操作（BaseRepositoryから継承）
  // ===========================================================================
  describe("基本CRUD操作", () => {
    it("findByIdでチャンクを取得できる", async () => {
      // Arrange
      insertChunk("chunk-001", "file-001", 0);
      const id = createChunkId("chunk-001");

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data?.id).toBe("chunk-001");
        expect(result.data?.fileId).toBe("file-001");
      }
    });
  });

  // ===========================================================================
  // AC-C01: findByFileId
  // ===========================================================================
  describe("findByFileId", () => {
    beforeEach(() => {
      // file-001 has 3 chunks
      insertChunk("chunk-f1-001", "file-001", 0);
      insertChunk("chunk-f1-002", "file-001", 1);
      insertChunk("chunk-f1-003", "file-001", 2);
      // file-002 has 2 chunks
      insertChunk("chunk-f2-001", "file-002", 0);
      insertChunk("chunk-f2-002", "file-002", 1);
    });

    it("ファイルIDでチャンク一覧を取得できる", async () => {
      // Arrange
      const fileId = createFileId("file-001");

      // Act
      const result = await repository.findByFileId(fileId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(3);
        expect(result.data.every((c) => c.fileId === "file-001")).toBe(true);
      }
    });

    it("chunk_index順でソートされる", async () => {
      // Arrange
      const fileId = createFileId("file-001");

      // Act
      const result = await repository.findByFileId(fileId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.map((c) => c.chunkIndex)).toEqual([0, 1, 2]);
      }
    });

    it("存在しないファイルIDでは空配列を返す", async () => {
      // Arrange
      const fileId = createFileId("non-existent");

      // Act
      const result = await repository.findByFileId(fileId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toEqual([]);
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      const fileId = createFileId("file-001");
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.findByFileId(fileId);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-C02: deleteByFileId
  // ===========================================================================
  describe("deleteByFileId", () => {
    beforeEach(() => {
      insertChunk("chunk-del-001", "file-001", 0);
      insertChunk("chunk-del-002", "file-001", 1);
      insertChunk("chunk-del-003", "file-001", 2);
      insertChunk("chunk-keep-001", "file-002", 0);
    });

    it("ファイルIDで一括削除できる", async () => {
      // Arrange
      const fileId = createFileId("file-001");

      // Act
      const result = await repository.deleteByFileId(fileId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(3); // 削除件数
      }

      // Verify: file-001のチャンクは削除されている
      const findResult = await repository.findByFileId(fileId);
      expect(isOk(findResult)).toBe(true);
      if (isOk(findResult)) {
        expect(findResult.data).toEqual([]);
      }

      // Verify: file-002のチャンクは残っている
      const file2Id = createFileId("file-002");
      const file2Result = await repository.findByFileId(file2Id);
      expect(isOk(file2Result)).toBe(true);
      if (isOk(file2Result)) {
        expect(file2Result.data.length).toBe(1);
      }
    });

    it("存在しないファイルIDでは0を返す", async () => {
      // Arrange
      const fileId = createFileId("non-existent");

      // Act
      const result = await repository.deleteByFileId(fileId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(0);
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      const fileId = createFileId("file-001");
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.deleteByFileId(fileId);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-C03: findByHash
  // ===========================================================================
  describe("findByHash", () => {
    it("ハッシュ値でチャンクを取得できる", async () => {
      // Arrange
      insertChunk("chunk-hash-001", "file-001", 0, {
        hash: "unique-chunk-hash",
      });

      // Act
      const result = await repository.findByHash("unique-chunk-hash");

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).not.toBeNull();
        expect(result.data?.id).toBe("chunk-hash-001");
        expect(result.data?.hash).toBe("unique-chunk-hash");
      }
    });

    it("存在しないハッシュ値ではnullを返す", async () => {
      // Act
      const result = await repository.findByHash("non-existent-hash");

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
      const result = await repository.findByHash("unique-chunk-hash");

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-C04: findByIds
  // ===========================================================================
  describe("findByIds", () => {
    beforeEach(() => {
      insertChunk("multi-chunk-001", "file-001", 0);
      insertChunk("multi-chunk-002", "file-001", 1);
      insertChunk("multi-chunk-003", "file-001", 2);
    });

    it("複数のIDで一括取得できる", async () => {
      // Arrange
      const ids: ChunkId[] = [
        createChunkId("multi-chunk-001"),
        createChunkId("multi-chunk-002"),
        createChunkId("multi-chunk-003"),
      ];

      // Act
      const result = await repository.findByIds(ids);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(3);
      }
    });

    it("存在しないIDは結果に含まれない", async () => {
      // Arrange
      const ids: ChunkId[] = [
        createChunkId("multi-chunk-001"),
        createChunkId("non-existent"),
      ];

      // Act
      const result = await repository.findByIds(ids);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].id).toBe("multi-chunk-001");
      }
    });

    it("空配列では空の結果を返す", async () => {
      // Act
      const result = await repository.findByIds([]);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toEqual([]);
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      const ids: ChunkId[] = [createChunkId("multi-chunk-001")];
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.findByIds(ids);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });

  // ===========================================================================
  // AC-C05: findAdjacent
  // ===========================================================================
  describe("findAdjacent", () => {
    beforeEach(() => {
      // Set up linked list of chunks
      insertChunk("adj-chunk-001", "file-001", 0, {
        prevChunkId: null,
        nextChunkId: "adj-chunk-002",
      });
      insertChunk("adj-chunk-002", "file-001", 1, {
        prevChunkId: "adj-chunk-001",
        nextChunkId: "adj-chunk-003",
      });
      insertChunk("adj-chunk-003", "file-001", 2, {
        prevChunkId: "adj-chunk-002",
        nextChunkId: null,
      });
    });

    it("前後のチャンクを取得できる", async () => {
      // Arrange
      const id = createChunkId("adj-chunk-002");

      // Act
      const result = await repository.findAdjacent(id);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.prev).not.toBeNull();
        expect(result.data.prev?.id).toBe("adj-chunk-001");
        expect(result.data.next).not.toBeNull();
        expect(result.data.next?.id).toBe("adj-chunk-003");
      }
    });

    it("最初のチャンクではprevがnull", async () => {
      // Arrange
      const id = createChunkId("adj-chunk-001");

      // Act
      const result = await repository.findAdjacent(id);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.prev).toBeNull();
        expect(result.data.next).not.toBeNull();
        expect(result.data.next?.id).toBe("adj-chunk-002");
      }
    });

    it("最後のチャンクではnextがnull", async () => {
      // Arrange
      const id = createChunkId("adj-chunk-003");

      // Act
      const result = await repository.findAdjacent(id);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.prev).not.toBeNull();
        expect(result.data.prev?.id).toBe("adj-chunk-002");
        expect(result.data.next).toBeNull();
      }
    });

    it("存在しないIDではエラーを返す", async () => {
      // Arrange
      const id = createChunkId("non-existent");

      // Act
      const result = await repository.findAdjacent(id);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.RECORD_NOT_FOUND);
      }
    });

    it("DBエラー時はResult.errを返す", async () => {
      // Arrange
      const id = createChunkId("adj-chunk-002");
      sqlite.close(); // DBを閉じてエラーを発生させる

      // Act
      const result = await repository.findAdjacent(id);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR);
      }
    });
  });
});
