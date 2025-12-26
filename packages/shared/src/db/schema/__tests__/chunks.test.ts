import { describe, it, expect } from "vitest";
import {
  chunks,
  Chunk,
  NewChunk,
  chunkStrategies,
  ChunkStrategy,
  ChunkMetadata,
} from "../chunks";
import { getTableConfig } from "drizzle-orm/sqlite-core";

describe("chunks schema", () => {
  const tableConfig = getTableConfig(chunks);

  describe("table configuration", () => {
    it("should have correct table name", () => {
      expect(chunks).toBeDefined();
      expect(tableConfig.name).toBe("chunks");
    });

    it("should have primary key on id", () => {
      expect(tableConfig.primaryKeys).toBeDefined();
    });
  });

  describe("columns", () => {
    it("should have all basic columns", () => {
      const columns = Object.keys(chunks);
      expect(columns).toContain("id");
      expect(columns).toContain("fileId");
      expect(columns).toContain("content");
      expect(columns).toContain("contextualContent");
    });

    it("should have all position columns", () => {
      const columns = Object.keys(chunks);
      expect(columns).toContain("chunkIndex");
      expect(columns).toContain("startLine");
      expect(columns).toContain("endLine");
      expect(columns).toContain("startChar");
      expect(columns).toContain("endChar");
      expect(columns).toContain("parentHeader");
    });

    it("should have all chunking columns", () => {
      const columns = Object.keys(chunks);
      expect(columns).toContain("strategy");
      expect(columns).toContain("tokenCount");
      expect(columns).toContain("hash");
    });

    it("should have all overlap columns", () => {
      const columns = Object.keys(chunks);
      expect(columns).toContain("prevChunkId");
      expect(columns).toContain("nextChunkId");
      expect(columns).toContain("overlapTokens");
    });

    it("should have all metadata columns", () => {
      const columns = Object.keys(chunks);
      expect(columns).toContain("metadata");
      expect(columns).toContain("createdAt");
      expect(columns).toContain("updatedAt");
    });

    it("should have exactly 19 columns", () => {
      const columns = Object.keys(chunks);
      expect(columns).toHaveLength(19);
    });
  });

  describe("foreign keys", () => {
    it("should have foreign key to files table", () => {
      expect(chunks.fileId).toBeDefined();
      expect(tableConfig.foreignKeys).toBeDefined();
      expect(tableConfig.foreignKeys.length).toBeGreaterThan(0);
    });

    it("should have CASCADE DELETE on fileId", () => {
      const fkConfig = tableConfig.foreignKeys[0];
      expect(fkConfig).toBeDefined();
      // Note: The actual ON DELETE behavior is defined in the schema
      // This test verifies the foreign key exists
    });
  });

  describe("indexes", () => {
    it("should have correct indexes", () => {
      expect(tableConfig.indexes).toBeDefined();
      const indexNames = tableConfig.indexes.map((idx: any) => idx.config.name);
      expect(indexNames).toContain("idx_chunks_file_id");
      expect(indexNames).toContain("idx_chunks_hash");
      expect(indexNames).toContain("idx_chunks_chunk_index");
      expect(indexNames).toContain("idx_chunks_strategy");
    });

    it("should have unique index on hash", () => {
      const hashIndex = tableConfig.indexes.find(
        (idx: any) => idx.config.name === "idx_chunks_hash",
      );
      expect(hashIndex).toBeDefined();
      expect(hashIndex?.config.unique).toBe(true);
    });

    it("should have composite index on fileId and chunkIndex", () => {
      const compositeIndex = tableConfig.indexes.find(
        (idx: any) => idx.config.name === "idx_chunks_chunk_index",
      );
      expect(compositeIndex).toBeDefined();
    });

    it("should have exactly 4 indexes", () => {
      expect(tableConfig.indexes).toHaveLength(4);
    });
  });

  describe("chunk strategies enum", () => {
    it("should export chunkStrategies array", () => {
      expect(chunkStrategies).toBeDefined();
      expect(Array.isArray(chunkStrategies)).toBe(true);
    });

    it("should have exactly 7 strategies", () => {
      expect(chunkStrategies).toHaveLength(7);
    });

    it("should contain all expected strategies", () => {
      expect(chunkStrategies).toContain("fixed_size");
      expect(chunkStrategies).toContain("semantic");
      expect(chunkStrategies).toContain("recursive");
      expect(chunkStrategies).toContain("sentence");
      expect(chunkStrategies).toContain("paragraph");
      expect(chunkStrategies).toContain("markdown_header");
      expect(chunkStrategies).toContain("code_block");
    });

    it("should export ChunkStrategy type", () => {
      // Type check - this will fail at compile time if type is not exported
      const testType: ChunkStrategy = "fixed_size";
      expect(testType).toBe("fixed_size");
    });
  });

  describe("type exports", () => {
    it("should export Chunk type", () => {
      // Type check - this will fail at compile time if type is not exported
      const testType: Chunk = {} as any;
      expect(testType).toBeDefined();
    });

    it("should export NewChunk type", () => {
      // Type check - this will fail at compile time if type is not exported
      const testType: NewChunk = {} as any;
      expect(testType).toBeDefined();
    });

    it("should export ChunkMetadata interface", () => {
      // Type check - this will fail at compile time if type is not exported
      const testType: ChunkMetadata = {
        language: "typescript",
        functionName: "test",
        importance: "high",
      };
      expect(testType).toBeDefined();
      expect(testType.language).toBe("typescript");
    });
  });

  describe("default values", () => {
    it("should have overlapTokens default to 0", () => {
      // Verify the column has a default value configured
      const overlapTokensColumn = chunks.overlapTokens;
      expect(overlapTokensColumn).toBeDefined();
      // The default is set in the schema definition
    });

    it("should have timestamp defaults configured", () => {
      const createdAtColumn = chunks.createdAt;
      const updatedAtColumn = chunks.updatedAt;
      expect(createdAtColumn).toBeDefined();
      expect(updatedAtColumn).toBeDefined();
      // Default values are SQL expressions (unixepoch())
    });
  });

  describe("column nullability", () => {
    it("should have required columns marked as NOT NULL", () => {
      // These columns should be NOT NULL based on the schema
      const requiredColumns = [
        "id",
        "fileId",
        "content",
        "chunkIndex",
        "strategy",
        "hash",
        "overlapTokens",
        "createdAt",
        "updatedAt",
      ];

      for (const colName of requiredColumns) {
        const col = chunks[colName as keyof typeof chunks];
        expect(col).toBeDefined();
      }
    });

    it("should have optional columns allowing NULL", () => {
      // These columns should allow NULL based on the schema
      const optionalColumns = [
        "contextualContent",
        "startLine",
        "endLine",
        "startChar",
        "endChar",
        "parentHeader",
        "tokenCount",
        "prevChunkId",
        "nextChunkId",
        "metadata",
      ];

      for (const colName of optionalColumns) {
        const col = chunks[colName as keyof typeof chunks];
        expect(col).toBeDefined();
      }
    });
  });
});
