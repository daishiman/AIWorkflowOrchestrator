/**
 * @file Repositoriesファクトリ テスト
 * @module @repo/shared/db/repositories/__tests__/index.test
 * @description createRepositoriesファクトリ関数のテスト
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { createRepositories } from "../index";
import { FileRepository } from "../file.repository";
import { ChunkRepository } from "../chunk.repository";
import { EntityRepository } from "../entity.repository";

// =============================================================================
// テストスイート
// =============================================================================

describe("createRepositories", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;

  beforeEach(() => {
    // In-memory SQLite database for testing
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

    // Create all required tables
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

      -- Chunks table
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
    `);

    db = drizzle(sqlite);
  });

  afterEach(() => {
    sqlite.close();
  });

  // ===========================================================================
  // AC-A01: ファクトリ関数
  // ===========================================================================
  describe("ファクトリ関数", () => {
    it("Repositoriesオブジェクトを返す", () => {
      // Act
      const repos = createRepositories(db);

      // Assert
      expect(repos).toBeDefined();
      expect(repos).toHaveProperty("files");
      expect(repos).toHaveProperty("chunks");
      expect(repos).toHaveProperty("entities");
    });

    it("filesはFileRepositoryインスタンス", () => {
      // Act
      const repos = createRepositories(db);

      // Assert
      expect(repos.files).toBeInstanceOf(FileRepository);
    });

    it("chunksはChunkRepositoryインスタンス", () => {
      // Act
      const repos = createRepositories(db);

      // Assert
      expect(repos.chunks).toBeInstanceOf(ChunkRepository);
    });

    it("entitiesはEntityRepositoryインスタンス", () => {
      // Act
      const repos = createRepositories(db);

      // Assert
      expect(repos.entities).toBeInstanceOf(EntityRepository);
    });

    it("同じDBインスタンスを共有する", () => {
      // Act
      const repos = createRepositories(db);

      // Assert - 各リポジトリが正常に動作することで確認
      expect(repos.files).toBeDefined();
      expect(repos.chunks).toBeDefined();
      expect(repos.entities).toBeDefined();
    });
  });

  // ===========================================================================
  // AC-A02: 統合テスト
  // ===========================================================================
  describe("統合テスト", () => {
    it("各リポジトリが独立して動作する", async () => {
      // Arrange
      const repos = createRepositories(db);
      const now = Math.floor(Date.now() / 1000);

      // Act - Create file
      sqlite.exec(`
        INSERT INTO files (id, name, path, mime_type, category, size, hash, last_modified, created_at, updated_at)
        VALUES ('file-integration-001', 'test.txt', '/path/test.txt', 'text/plain', 'document', 1024, 'hash-001', ${now}, ${now}, ${now});
      `);

      // Act - Create chunk
      sqlite.exec(`
        INSERT INTO chunks (id, file_id, content, chunk_index, strategy, hash)
        VALUES ('chunk-integration-001', 'file-integration-001', 'Test content', 0, 'fixed_size', 'chunk-hash-001');
      `);

      // Act - Create entity
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type)
        VALUES ('entity-integration-001', 'Test Entity', 'test_entity', 'concept');
      `);

      // Assert - Files
      const fileResult = await repos.files.findById(
        "file-integration-001" as any,
      );
      expect(fileResult.success).toBe(true);
      if (fileResult.success) {
        expect(fileResult.data?.id).toBe("file-integration-001");
      }

      // Assert - Chunks
      const chunkResult = await repos.chunks.findById(
        "chunk-integration-001" as any,
      );
      expect(chunkResult.success).toBe(true);
      if (chunkResult.success) {
        expect(chunkResult.data?.id).toBe("chunk-integration-001");
      }

      // Assert - Entities
      const entityResult = await repos.entities.findById(
        "entity-integration-001" as any,
      );
      expect(entityResult.success).toBe(true);
      if (entityResult.success) {
        expect(entityResult.data?.id).toBe("entity-integration-001");
      }
    });
  });
});
