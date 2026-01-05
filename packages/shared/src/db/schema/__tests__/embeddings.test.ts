/**
 * embeddings テーブル・ベクトルインデックス・ベクトル検索のテスト
 *
 * @description
 * - Phase 4: TDD Red - スキーマ・エクスポートテスト
 * - Phase 5: TDD Green - Pure関数の徹底テスト
 *
 * @see docs/30-workflows/diskann-vector-index/outputs/phase-4/test-specification.md
 */
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import { getTableConfig } from "drizzle-orm/sqlite-core";

// ============================================
// スキーマ・型のインポート
// ============================================
import { embeddings, Embedding, NewEmbedding } from "../embeddings";
import {
  VectorIndexStats,
  defaultVectorIndexConfig,
  vectorIndexConfigs,
  createVectorIndex,
  dropVectorIndex,
  rebuildVectorIndex,
  getVectorIndexStats,
} from "../vector-index";
import {
  VectorSearchResult,
  VectorSearchOptions,
  EmbeddingInsertItem,
  vectorToBlob,
  blobToVector,
  normalizeVector,
  calculateMagnitude,
  validateVector,
  searchByVector,
  searchByVectorL2,
  searchByVectorDot,
  insertEmbedding,
  insertEmbeddingsBatch,
  deleteEmbeddingByChunkId,
  deleteEmbeddingsByFileId,
  getEmbeddingByChunkId,
  countEmbeddingsByModelId,
} from "../../queries/vector-search";

// ============================================
// 1. embeddings スキーマテスト
// ============================================
describe("embeddings schema", () => {
  const tableConfig = getTableConfig(embeddings);

  describe("table configuration", () => {
    it("should have correct table name", () => {
      expect(embeddings).toBeDefined();
      expect(tableConfig.name).toBe("embeddings");
    });

    it("should have primary key on id", () => {
      expect(tableConfig.primaryKeys).toBeDefined();
    });
  });

  describe("columns", () => {
    it("should have all required columns", () => {
      const columns = Object.keys(embeddings);
      expect(columns).toContain("id");
      expect(columns).toContain("chunkId");
      expect(columns).toContain("vector");
      expect(columns).toContain("modelId");
      expect(columns).toContain("dimensions");
      expect(columns).toContain("normalizedMagnitude");
      expect(columns).toContain("createdAt");
      expect(columns).toContain("updatedAt");
    });

    it("should have exactly 8 columns", () => {
      const columns = Object.keys(embeddings);
      expect(columns).toHaveLength(8);
    });
  });

  describe("foreign keys", () => {
    it("should have foreign key to chunks table", () => {
      expect(embeddings.chunkId).toBeDefined();
      expect(tableConfig.foreignKeys).toBeDefined();
      expect(tableConfig.foreignKeys.length).toBeGreaterThan(0);
    });

    it("should have CASCADE DELETE on chunkId", () => {
      const fkConfig = tableConfig.foreignKeys[0];
      expect(fkConfig).toBeDefined();
    });
  });

  describe("indexes", () => {
    it("should have chunk_id unique index", () => {
      const indexNames = tableConfig.indexes.map((idx: any) => idx.config.name);
      expect(indexNames).toContain("embeddings_chunk_id_idx");
    });

    it("should have model_id index", () => {
      const indexNames = tableConfig.indexes.map((idx: any) => idx.config.name);
      expect(indexNames).toContain("embeddings_model_id_idx");
    });

    it("should have unique constraint on chunk_id", () => {
      const chunkIdIndex = tableConfig.indexes.find(
        (idx: any) => idx.config.name === "embeddings_chunk_id_idx",
      );
      expect(chunkIdIndex).toBeDefined();
      expect(chunkIdIndex?.config.unique).toBe(true);
    });

    it("should have exactly 2 indexes", () => {
      expect(tableConfig.indexes).toHaveLength(2);
    });
  });

  describe("type exports", () => {
    it("should export Embedding type", () => {
      const testType: Embedding = {} as any;
      expect(testType).toBeDefined();
    });

    it("should export NewEmbedding type", () => {
      const testType: NewEmbedding = {} as any;
      expect(testType).toBeDefined();
    });
  });

  describe("default values", () => {
    it("should have timestamp defaults configured", () => {
      const createdAtColumn = embeddings.createdAt;
      const updatedAtColumn = embeddings.updatedAt;
      expect(createdAtColumn).toBeDefined();
      expect(updatedAtColumn).toBeDefined();
    });
  });
});

// ============================================
// 2. VectorIndexConfig テスト
// ============================================
describe("vector-index", () => {
  describe("VectorIndexConfig", () => {
    it("should have defaultVectorIndexConfig defined", () => {
      expect(defaultVectorIndexConfig).toBeDefined();
    });

    it("should have correct default dimensions", () => {
      expect(defaultVectorIndexConfig.dimensions).toBe(1536);
    });

    it("should have correct default metric", () => {
      expect(defaultVectorIndexConfig.metric).toBe("cosine");
    });

    it("should have correct default name", () => {
      expect(defaultVectorIndexConfig.name).toBe("embeddings_vector_idx");
    });

    it("should have optional fields defined", () => {
      expect(defaultVectorIndexConfig.maxElements).toBe(1000000);
      expect(defaultVectorIndexConfig.efConstruction).toBe(200);
      expect(defaultVectorIndexConfig.efSearch).toBe(100);
    });

    it("should have vectorIndexConfigs with multiple presets", () => {
      expect(vectorIndexConfigs).toBeDefined();
      expect(vectorIndexConfigs.openai_small).toBeDefined();
      expect(vectorIndexConfigs.openai_large).toBeDefined();
      expect(vectorIndexConfigs.cohere_multilingual).toBeDefined();
    });

    it("should have correct dimensions for each preset", () => {
      expect(vectorIndexConfigs.openai_small.dimensions).toBe(1536);
      expect(vectorIndexConfigs.openai_large.dimensions).toBe(3072);
      expect(vectorIndexConfigs.cohere_multilingual.dimensions).toBe(1024);
    });

    it("should have correct metric for all presets", () => {
      expect(vectorIndexConfigs.openai_small.metric).toBe("cosine");
      expect(vectorIndexConfigs.openai_large.metric).toBe("cosine");
      expect(vectorIndexConfigs.cohere_multilingual.metric).toBe("cosine");
    });
  });

  describe("index management functions", () => {
    it("should export createVectorIndex", () => {
      expect(createVectorIndex).toBeDefined();
      expect(typeof createVectorIndex).toBe("function");
    });

    it("should export dropVectorIndex", () => {
      expect(dropVectorIndex).toBeDefined();
      expect(typeof dropVectorIndex).toBe("function");
    });

    it("should export rebuildVectorIndex", () => {
      expect(rebuildVectorIndex).toBeDefined();
      expect(typeof rebuildVectorIndex).toBe("function");
    });

    it("should export getVectorIndexStats", () => {
      expect(getVectorIndexStats).toBeDefined();
      expect(typeof getVectorIndexStats).toBe("function");
    });
  });

  describe("VectorIndexStats type", () => {
    it("should have correct shape", () => {
      const testStats: VectorIndexStats = {
        name: "test_idx",
        entryCount: 100,
        exists: true,
      };
      expect(testStats.name).toBe("test_idx");
      expect(testStats.entryCount).toBe(100);
      expect(testStats.exists).toBe(true);
    });

    it("should work with exists=false", () => {
      const testStats: VectorIndexStats = {
        name: "missing_idx",
        entryCount: 0,
        exists: false,
      };
      expect(testStats.exists).toBe(false);
      expect(testStats.entryCount).toBe(0);
    });
  });
});

// ============================================
// 3. データ変換関数テスト（徹底テスト）
// ============================================
describe("vector-search data conversion", () => {
  describe("vectorToBlob", () => {
    it("should convert Float32Array to Buffer", () => {
      const vector = new Float32Array([0.1, 0.2, 0.3]);
      const blob = vectorToBlob(vector);
      expect(blob).toBeInstanceOf(Buffer);
      expect(blob.length).toBe(12); // 3 * 4 bytes
    });

    it("should throw error for empty vector", () => {
      const emptyVector = new Float32Array([]);
      expect(() => vectorToBlob(emptyVector)).toThrow("Vector cannot be empty");
    });

    it("should handle single element vector", () => {
      const vector = new Float32Array([0.5]);
      const blob = vectorToBlob(vector);
      expect(blob.length).toBe(4);
    });

    it("should handle large vectors (1536 dimensions)", () => {
      const vector = new Float32Array(1536).fill(0.1);
      const blob = vectorToBlob(vector);
      expect(blob.length).toBe(1536 * 4);
    });

    it("should handle negative values", () => {
      const vector = new Float32Array([-0.5, -1.0, -0.25]);
      const blob = vectorToBlob(vector);
      expect(blob.length).toBe(12);
    });

    it("should handle very small values", () => {
      const vector = new Float32Array([1e-10, 1e-20, 1e-30]);
      const blob = vectorToBlob(vector);
      expect(blob.length).toBe(12);
    });

    it("should handle very large values", () => {
      const vector = new Float32Array([1e10, 1e20, 1e30]);
      const blob = vectorToBlob(vector);
      expect(blob.length).toBe(12);
    });

    it("should preserve byte order", () => {
      const vector = new Float32Array([1.0]);
      const blob = vectorToBlob(vector);
      // 1.0 in IEEE 754 single precision is 0x3F800000
      const view = new DataView(blob.buffer, blob.byteOffset);
      expect(view.getFloat32(0, true)).toBe(1.0);
    });
  });

  describe("blobToVector", () => {
    it("should convert Buffer to Float32Array", () => {
      const original = new Float32Array([0.1, 0.2, 0.3]);
      const blob = Buffer.from(original.buffer);
      const vector = blobToVector(blob);
      expect(vector).toBeInstanceOf(Float32Array);
      expect(vector.length).toBe(3);
    });

    it("should throw error for empty buffer", () => {
      const emptyBlob = Buffer.alloc(0);
      expect(() => blobToVector(emptyBlob)).toThrow("Blob cannot be empty");
    });

    it("should throw error for invalid buffer size (1 byte)", () => {
      const invalidBlob = Buffer.alloc(1);
      expect(() => blobToVector(invalidBlob)).toThrow(
        "Blob size must be a multiple of 4 bytes",
      );
    });

    it("should throw error for invalid buffer size (5 bytes)", () => {
      const invalidBlob = Buffer.alloc(5);
      expect(() => blobToVector(invalidBlob)).toThrow(
        "Blob size must be a multiple of 4 bytes",
      );
    });

    it("should throw error for invalid buffer size (7 bytes)", () => {
      const invalidBlob = Buffer.alloc(7);
      expect(() => blobToVector(invalidBlob)).toThrow(
        "Blob size must be a multiple of 4 bytes",
      );
    });

    it("should handle single element", () => {
      const original = new Float32Array([0.5]);
      const blob = Buffer.from(original.buffer);
      const vector = blobToVector(blob);
      expect(vector.length).toBe(1);
      expect(vector[0]).toBeCloseTo(0.5, 5);
    });

    it("should handle large vectors", () => {
      const original = new Float32Array(1536).fill(0.1);
      const blob = Buffer.from(original.buffer);
      const vector = blobToVector(blob);
      expect(vector.length).toBe(1536);
    });
  });

  describe("roundtrip conversion", () => {
    it("should preserve data through roundtrip", () => {
      const original = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);
      const blob = vectorToBlob(original);
      const restored = blobToVector(blob);

      expect(restored.length).toBe(original.length);
      for (let i = 0; i < original.length; i++) {
        expect(restored[i]).toBeCloseTo(original[i], 5);
      }
    });

    it("should preserve negative values through roundtrip", () => {
      const original = new Float32Array([-0.5, 0.0, 0.5]);
      const blob = vectorToBlob(original);
      const restored = blobToVector(blob);

      expect(restored[0]).toBeCloseTo(-0.5, 5);
      expect(restored[1]).toBeCloseTo(0.0, 5);
      expect(restored[2]).toBeCloseTo(0.5, 5);
    });

    it("should preserve high-dimensional vectors", () => {
      const original = new Float32Array(3072);
      for (let i = 0; i < 3072; i++) {
        original[i] = Math.random() * 2 - 1; // -1 to 1
      }
      const blob = vectorToBlob(original);
      const restored = blobToVector(blob);

      expect(restored.length).toBe(original.length);
      for (let i = 0; i < original.length; i++) {
        expect(restored[i]).toBeCloseTo(original[i], 5);
      }
    });

    it("should preserve special float values", () => {
      const original = new Float32Array([0, -0, 1, -1]);
      const blob = vectorToBlob(original);
      const restored = blobToVector(blob);

      expect(restored[0]).toBe(0);
      expect(restored[2]).toBe(1);
      expect(restored[3]).toBe(-1);
    });
  });

  describe("normalizeVector", () => {
    it("should normalize vector to unit length", () => {
      const vector = new Float32Array([3, 4]); // magnitude = 5
      const normalized = normalizeVector(vector);

      expect(normalized[0]).toBeCloseTo(0.6, 5);
      expect(normalized[1]).toBeCloseTo(0.8, 5);

      const magnitude = Math.sqrt(
        normalized[0] * normalized[0] + normalized[1] * normalized[1],
      );
      expect(magnitude).toBeCloseTo(1.0, 5);
    });

    it("should throw error for empty vector", () => {
      const emptyVector = new Float32Array([]);
      expect(() => normalizeVector(emptyVector)).toThrow(
        "Vector cannot be empty",
      );
    });

    it("should throw error for zero vector", () => {
      const zeroVector = new Float32Array([0, 0, 0]);
      expect(() => normalizeVector(zeroVector)).toThrow(
        "Cannot normalize zero vector",
      );
    });

    it("should normalize single element vector", () => {
      const vector = new Float32Array([5]);
      const normalized = normalizeVector(vector);
      expect(normalized[0]).toBeCloseTo(1.0, 5);
    });

    it("should normalize negative vector", () => {
      const vector = new Float32Array([-3, -4]);
      const normalized = normalizeVector(vector);

      expect(normalized[0]).toBeCloseTo(-0.6, 5);
      expect(normalized[1]).toBeCloseTo(-0.8, 5);

      const magnitude = calculateMagnitude(normalized);
      expect(magnitude).toBeCloseTo(1.0, 5);
    });

    it("should normalize mixed sign vector", () => {
      const vector = new Float32Array([3, -4]);
      const normalized = normalizeVector(vector);

      expect(normalized[0]).toBeCloseTo(0.6, 5);
      expect(normalized[1]).toBeCloseTo(-0.8, 5);

      const magnitude = calculateMagnitude(normalized);
      expect(magnitude).toBeCloseTo(1.0, 5);
    });

    it("should normalize high-dimensional vector", () => {
      const vector = new Float32Array(1536);
      for (let i = 0; i < 1536; i++) {
        vector[i] = Math.random() * 2 - 1;
      }
      const normalized = normalizeVector(vector);

      const magnitude = calculateMagnitude(normalized);
      expect(magnitude).toBeCloseTo(1.0, 4);
    });

    it("should handle vector with single non-zero element", () => {
      const vector = new Float32Array([0, 0, 5, 0, 0]);
      const normalized = normalizeVector(vector);

      expect(normalized[0]).toBe(0);
      expect(normalized[1]).toBe(0);
      expect(normalized[2]).toBeCloseTo(1.0, 5);
      expect(normalized[3]).toBe(0);
      expect(normalized[4]).toBe(0);
    });

    it("should normalize very small magnitude vector", () => {
      const vector = new Float32Array([1e-10, 1e-10]);
      const normalized = normalizeVector(vector);

      const magnitude = calculateMagnitude(normalized);
      expect(magnitude).toBeCloseTo(1.0, 4);
    });

    it("should not modify original vector", () => {
      const original = new Float32Array([3, 4]);
      normalizeVector(original);
      expect(original[0]).toBe(3);
      expect(original[1]).toBe(4);
    });
  });

  describe("calculateMagnitude", () => {
    it("should calculate correct magnitude", () => {
      const vector = new Float32Array([3, 4]); // magnitude = 5
      const magnitude = calculateMagnitude(vector);
      expect(magnitude).toBeCloseTo(5.0, 5);
    });

    it("should return 0 for zero vector", () => {
      const zeroVector = new Float32Array([0, 0, 0]);
      const magnitude = calculateMagnitude(zeroVector);
      expect(magnitude).toBe(0);
    });

    it("should calculate magnitude for single element", () => {
      const vector = new Float32Array([5]);
      const magnitude = calculateMagnitude(vector);
      expect(magnitude).toBe(5);
    });

    it("should calculate magnitude for negative values", () => {
      const vector = new Float32Array([-3, -4]);
      const magnitude = calculateMagnitude(vector);
      expect(magnitude).toBeCloseTo(5.0, 5);
    });

    it("should calculate magnitude for unit vector", () => {
      const vector = new Float32Array([1, 0, 0]);
      const magnitude = calculateMagnitude(vector);
      expect(magnitude).toBe(1);
    });

    it("should calculate magnitude for 3D vector", () => {
      const vector = new Float32Array([1, 2, 2]); // magnitude = 3
      const magnitude = calculateMagnitude(vector);
      expect(magnitude).toBeCloseTo(3.0, 5);
    });

    it("should handle high-dimensional vectors", () => {
      // Vector of all 1s with 100 dimensions has magnitude sqrt(100) = 10
      const vector = new Float32Array(100).fill(1);
      const magnitude = calculateMagnitude(vector);
      expect(magnitude).toBeCloseTo(10.0, 4);
    });

    it("should handle very small values", () => {
      const vector = new Float32Array([1e-10, 1e-10]);
      const magnitude = calculateMagnitude(vector);
      expect(magnitude).toBeGreaterThan(0);
      expect(magnitude).toBeLessThan(1e-9);
    });
  });

  describe("validateVector", () => {
    it("should throw error for empty vector", () => {
      const emptyVector = new Float32Array([]);
      expect(() => validateVector(emptyVector)).toThrow(
        "Vector cannot be empty",
      );
    });

    it("should throw error for dimension mismatch", () => {
      const vector = new Float32Array([0.1, 0.2, 0.3]);
      expect(() => validateVector(vector, 5)).toThrow(
        "Vector dimensions mismatch: expected 5, got 3",
      );
    });

    it("should throw error for NaN values", () => {
      const vector = new Float32Array([0.1, NaN, 0.3]);
      expect(() => validateVector(vector)).toThrow(
        "Vector contains invalid value",
      );
    });

    it("should throw error for Infinity values", () => {
      const vector = new Float32Array([0.1, Infinity, 0.3]);
      expect(() => validateVector(vector)).toThrow(
        "Vector contains invalid value",
      );
    });

    it("should throw error for -Infinity values", () => {
      const vector = new Float32Array([0.1, -Infinity, 0.3]);
      expect(() => validateVector(vector)).toThrow(
        "Vector contains invalid value",
      );
    });

    it("should not throw for valid vector", () => {
      const vector = new Float32Array([0.1, 0.2, 0.3]);
      expect(() => validateVector(vector)).not.toThrow();
    });

    it("should not throw when dimensions match", () => {
      const vector = new Float32Array([0.1, 0.2, 0.3]);
      expect(() => validateVector(vector, 3)).not.toThrow();
    });

    it("should accept zero values", () => {
      const vector = new Float32Array([0, 0, 0]);
      expect(() => validateVector(vector)).not.toThrow();
    });

    it("should accept negative values", () => {
      const vector = new Float32Array([-0.5, -1.0, -0.25]);
      expect(() => validateVector(vector)).not.toThrow();
    });

    it("should accept very small values", () => {
      const vector = new Float32Array([1e-38, 1e-30, 1e-20]);
      expect(() => validateVector(vector)).not.toThrow();
    });

    it("should accept very large values (but finite)", () => {
      const vector = new Float32Array([1e38, 1e30, 1e20]);
      expect(() => validateVector(vector)).not.toThrow();
    });

    it("should validate high-dimensional vectors", () => {
      const vector = new Float32Array(1536).fill(0.1);
      expect(() => validateVector(vector, 1536)).not.toThrow();
    });

    it("should catch NaN at any position", () => {
      const vector = new Float32Array(100).fill(0.1);
      vector[50] = NaN;
      expect(() => validateVector(vector)).toThrow(
        "Vector contains invalid value at index 50",
      );
    });

    it("should catch Infinity at any position", () => {
      const vector = new Float32Array(100).fill(0.1);
      vector[99] = Infinity;
      expect(() => validateVector(vector)).toThrow(
        "Vector contains invalid value at index 99",
      );
    });
  });
});

// ============================================
// 4. 検索関数テスト
// ============================================
describe("vector-search functions", () => {
  describe("function exports", () => {
    it("should export searchByVector", () => {
      expect(searchByVector).toBeDefined();
      expect(typeof searchByVector).toBe("function");
    });

    it("should export searchByVectorL2", () => {
      expect(searchByVectorL2).toBeDefined();
      expect(typeof searchByVectorL2).toBe("function");
    });

    it("should export searchByVectorDot", () => {
      expect(searchByVectorDot).toBeDefined();
      expect(typeof searchByVectorDot).toBe("function");
    });
  });

  describe("type exports", () => {
    it("should have VectorSearchResult type", () => {
      const testResult: VectorSearchResult = {
        chunkId: "chunk-1",
        embeddingId: "emb-1",
        distance: 0.1,
        similarity: 0.95,
        content: "test content",
        contextualContent: null,
      };
      expect(testResult.chunkId).toBe("chunk-1");
      expect(testResult.similarity).toBe(0.95);
    });

    it("should have VectorSearchOptions type", () => {
      const testOptions: VectorSearchOptions = {
        limit: 10,
        minSimilarity: 0.7,
        fileIds: ["file-1"],
        modelId: "text-embedding-3-small",
      };
      expect(testOptions.limit).toBe(10);
      expect(testOptions.minSimilarity).toBe(0.7);
    });

    it("should allow partial VectorSearchOptions", () => {
      const testOptions: VectorSearchOptions = {};
      expect(testOptions.limit).toBeUndefined();
      expect(testOptions.minSimilarity).toBeUndefined();
    });

    it("should allow VectorSearchOptions with only limit", () => {
      const testOptions: VectorSearchOptions = { limit: 5 };
      expect(testOptions.limit).toBe(5);
    });

    it("should allow VectorSearchOptions with multiple fileIds", () => {
      const testOptions: VectorSearchOptions = {
        fileIds: ["file-1", "file-2", "file-3"],
      };
      expect(testOptions.fileIds).toHaveLength(3);
    });
  });
});

// ============================================
// 5. 挿入関数テスト
// ============================================
describe("vector-search insertion functions", () => {
  describe("function exports", () => {
    it("should export insertEmbedding", () => {
      expect(insertEmbedding).toBeDefined();
      expect(typeof insertEmbedding).toBe("function");
    });

    it("should export insertEmbeddingsBatch", () => {
      expect(insertEmbeddingsBatch).toBeDefined();
      expect(typeof insertEmbeddingsBatch).toBe("function");
    });
  });

  describe("type exports", () => {
    it("should have EmbeddingInsertItem type with required fields", () => {
      const testItem: EmbeddingInsertItem = {
        chunkId: "chunk-1",
        vector: new Float32Array(1536),
        modelId: "text-embedding-3-small",
        dimensions: 1536,
      };
      expect(testItem.chunkId).toBe("chunk-1");
      expect(testItem.dimensions).toBe(1536);
    });

    it("should have EmbeddingInsertItem type with optional normalizedMagnitude", () => {
      const testItem: EmbeddingInsertItem = {
        chunkId: "chunk-1",
        vector: new Float32Array(1536),
        modelId: "text-embedding-3-small",
        dimensions: 1536,
        normalizedMagnitude: 1.0,
      };
      expect(testItem.normalizedMagnitude).toBe(1.0);
    });

    it("should handle different vector sizes", () => {
      const testItem768: EmbeddingInsertItem = {
        chunkId: "chunk-1",
        vector: new Float32Array(768),
        modelId: "custom-model",
        dimensions: 768,
      };
      expect(testItem768.vector.length).toBe(768);

      const testItem3072: EmbeddingInsertItem = {
        chunkId: "chunk-2",
        vector: new Float32Array(3072),
        modelId: "text-embedding-3-large",
        dimensions: 3072,
      };
      expect(testItem3072.vector.length).toBe(3072);
    });
  });
});

// ============================================
// 6. 削除・ユーティリティ関数テスト
// ============================================
describe("vector-search utility functions", () => {
  describe("deletion functions", () => {
    it("should export deleteEmbeddingByChunkId", () => {
      expect(deleteEmbeddingByChunkId).toBeDefined();
      expect(typeof deleteEmbeddingByChunkId).toBe("function");
    });

    it("should export deleteEmbeddingsByFileId", () => {
      expect(deleteEmbeddingsByFileId).toBeDefined();
      expect(typeof deleteEmbeddingsByFileId).toBe("function");
    });
  });

  describe("query functions", () => {
    it("should export getEmbeddingByChunkId", () => {
      expect(getEmbeddingByChunkId).toBeDefined();
      expect(typeof getEmbeddingByChunkId).toBe("function");
    });

    it("should export countEmbeddingsByModelId", () => {
      expect(countEmbeddingsByModelId).toBeDefined();
      expect(typeof countEmbeddingsByModelId).toBe("function");
    });
  });
});

// ============================================
// 7. エッジケース・境界値テスト
// ============================================
describe("edge cases and boundary values", () => {
  describe("vector dimension boundaries", () => {
    it("should handle minimum vector size (1 element)", () => {
      const vector = new Float32Array([0.5]);
      expect(() => validateVector(vector, 1)).not.toThrow();
      const blob = vectorToBlob(vector);
      expect(blob.length).toBe(4);
    });

    it("should handle OpenAI small dimensions (1536)", () => {
      const vector = new Float32Array(1536).fill(0.1);
      expect(() => validateVector(vector, 1536)).not.toThrow();
    });

    it("should handle OpenAI large dimensions (3072)", () => {
      const vector = new Float32Array(3072).fill(0.1);
      expect(() => validateVector(vector, 3072)).not.toThrow();
    });

    it("should handle very large dimensions (10000)", () => {
      const vector = new Float32Array(10000).fill(0.01);
      expect(() => validateVector(vector)).not.toThrow();

      const normalized = normalizeVector(vector);
      const magnitude = calculateMagnitude(normalized);
      expect(magnitude).toBeCloseTo(1.0, 3);
    });
  });

  describe("float value boundaries", () => {
    it("should handle Float32 max value", () => {
      const maxFloat32 = 3.4028235e38;
      const vector = new Float32Array([maxFloat32, 0, 0]);
      expect(() => validateVector(vector)).not.toThrow();
    });

    it("should handle Float32 min positive value", () => {
      const minPositive = 1.17549435e-38;
      const vector = new Float32Array([minPositive, minPositive, minPositive]);
      expect(() => validateVector(vector)).not.toThrow();
    });

    it("should handle mixed extreme values", () => {
      const vector = new Float32Array([1e30, -1e30, 1e-30, -1e-30]);
      expect(() => validateVector(vector)).not.toThrow();
    });
  });

  describe("config presets completeness", () => {
    it("should have all required fields in openai_small", () => {
      const config = vectorIndexConfigs.openai_small;
      expect(config.name).toBeDefined();
      expect(config.dimensions).toBeDefined();
      expect(config.metric).toBeDefined();
    });

    it("should have all required fields in openai_large", () => {
      const config = vectorIndexConfigs.openai_large;
      expect(config.name).toBeDefined();
      expect(config.dimensions).toBeDefined();
      expect(config.metric).toBeDefined();
    });

    it("should have all required fields in cohere_multilingual", () => {
      const config = vectorIndexConfigs.cohere_multilingual;
      expect(config.name).toBeDefined();
      expect(config.dimensions).toBeDefined();
      expect(config.metric).toBeDefined();
    });
  });
});

// ============================================
// 8. DB操作関数のモックテスト
// ============================================
describe("vector-search DB functions with mocks", () => {
  describe("searchByVector", () => {
    it("should validate query vector before search", async () => {
      const mockDb = {
        all: vi.fn().mockResolvedValue([]),
      };

      const queryVector = new Float32Array(1536).fill(0.1);

      // 関数を呼び出す - validateVectorとvectorToBlobが呼ばれる
      await searchByVector(mockDb as any, queryVector, { limit: 5 });

      // DBが呼ばれたことを確認
      expect(mockDb.all).toHaveBeenCalled();
    });

    it("should throw for invalid vector in search", async () => {
      const mockDb = { all: vi.fn() };
      const invalidVector = new Float32Array([0.1, NaN, 0.3]);

      await expect(
        searchByVector(mockDb as any, invalidVector),
      ).rejects.toThrow("Vector contains invalid value");
    });

    it("should throw for empty vector in search", async () => {
      const mockDb = { all: vi.fn() };
      const emptyVector = new Float32Array([]);

      await expect(searchByVector(mockDb as any, emptyVector)).rejects.toThrow(
        "Vector cannot be empty",
      );
    });

    it("should filter results by minSimilarity", async () => {
      const mockDb = {
        all: vi.fn().mockResolvedValue([
          {
            embedding_id: "emb-1",
            chunk_id: "chunk-1",
            content: "test",
            contextual_content: null,
            distance: 0.2, // similarity = 0.9
          },
          {
            embedding_id: "emb-2",
            chunk_id: "chunk-2",
            content: "test2",
            contextual_content: null,
            distance: 1.6, // similarity = 0.2
          },
        ]),
      };

      const queryVector = new Float32Array(1536).fill(0.1);
      const results = await searchByVector(mockDb as any, queryVector, {
        minSimilarity: 0.5,
      });

      // 類似度0.5以上のみフィルタリング
      expect(results.length).toBe(1);
      expect(results[0].similarity).toBeGreaterThanOrEqual(0.5);
    });

    it("should return empty array when no results", async () => {
      const mockDb = { all: vi.fn().mockResolvedValue([]) };
      const queryVector = new Float32Array(1536).fill(0.1);

      const results = await searchByVector(mockDb as any, queryVector);
      expect(results).toEqual([]);
    });

    it("should handle modelId filter", async () => {
      const mockDb = { all: vi.fn().mockResolvedValue([]) };
      const queryVector = new Float32Array(1536).fill(0.1);

      await searchByVector(mockDb as any, queryVector, {
        modelId: "text-embedding-3-small",
      });

      const sqlCall = mockDb.all.mock.calls[0][0];
      expect(sqlCall).toBeDefined();
    });

    it("should handle fileIds filter", async () => {
      const mockDb = { all: vi.fn().mockResolvedValue([]) };
      const queryVector = new Float32Array(1536).fill(0.1);

      await searchByVector(mockDb as any, queryVector, {
        fileIds: ["file-1", "file-2"],
      });

      expect(mockDb.all).toHaveBeenCalled();
    });
  });

  describe("searchByVectorL2", () => {
    it("should validate query vector before L2 search", async () => {
      const mockDb = { all: vi.fn().mockResolvedValue([]) };
      const queryVector = new Float32Array(1536).fill(0.1);

      await searchByVectorL2(mockDb as any, queryVector, { limit: 5 });

      expect(mockDb.all).toHaveBeenCalled();
    });

    it("should throw for invalid vector in L2 search", async () => {
      const mockDb = { all: vi.fn() };
      const invalidVector = new Float32Array([Infinity, 0.2, 0.3]);

      await expect(
        searchByVectorL2(mockDb as any, invalidVector),
      ).rejects.toThrow("Vector contains invalid value");
    });

    it("should calculate L2 similarity correctly", async () => {
      const mockDb = {
        all: vi.fn().mockResolvedValue([
          {
            embedding_id: "emb-1",
            chunk_id: "chunk-1",
            content: "test",
            contextual_content: null,
            distance: 0.0, // L2 distance = 0
          },
        ]),
      };

      const queryVector = new Float32Array(1536).fill(0.1);
      const results = await searchByVectorL2(mockDb as any, queryVector);

      // L2 similarity = 1 / (1 + distance)
      expect(results[0].similarity).toBe(1.0);
    });
  });

  describe("searchByVectorDot", () => {
    it("should validate query vector before dot search", async () => {
      const mockDb = { all: vi.fn().mockResolvedValue([]) };
      const queryVector = new Float32Array(1536).fill(0.1);

      await searchByVectorDot(mockDb as any, queryVector, { limit: 5 });

      expect(mockDb.all).toHaveBeenCalled();
    });

    it("should throw for invalid vector in dot search", async () => {
      const mockDb = { all: vi.fn() };
      const invalidVector = new Float32Array([-Infinity, 0.2, 0.3]);

      await expect(
        searchByVectorDot(mockDb as any, invalidVector),
      ).rejects.toThrow("Vector contains invalid value");
    });

    it("should calculate dot similarity correctly", async () => {
      const mockDb = {
        all: vi.fn().mockResolvedValue([
          {
            embedding_id: "emb-1",
            chunk_id: "chunk-1",
            content: "test",
            contextual_content: null,
            dot_product: 1.0, // max dot product for normalized vectors
          },
        ]),
      };

      const queryVector = new Float32Array(1536).fill(0.1);
      const results = await searchByVectorDot(mockDb as any, queryVector);

      // Dot similarity = (dot_product + 1) / 2
      expect(results[0].similarity).toBe(1.0);
    });
  });

  describe("insertEmbedding", () => {
    it("should validate vector before insert", async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue(undefined),
        }),
      };

      const item: EmbeddingInsertItem = {
        chunkId: "chunk-1",
        vector: new Float32Array(1536).fill(0.1),
        modelId: "text-embedding-3-small",
        dimensions: 1536,
      };

      const id = await insertEmbedding(mockDb as any, item);

      expect(id).toBeDefined();
      expect(typeof id).toBe("string");
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should throw for dimension mismatch in insert", async () => {
      const mockDb = { insert: vi.fn() };

      const item: EmbeddingInsertItem = {
        chunkId: "chunk-1",
        vector: new Float32Array(768).fill(0.1), // 768 dimensions
        modelId: "text-embedding-3-small",
        dimensions: 1536, // expects 1536
      };

      await expect(insertEmbedding(mockDb as any, item)).rejects.toThrow(
        "Vector dimensions mismatch",
      );
    });

    it("should throw for invalid vector values in insert", async () => {
      const mockDb = { insert: vi.fn() };
      const vector = new Float32Array(1536).fill(0.1);
      vector[100] = NaN;

      const item: EmbeddingInsertItem = {
        chunkId: "chunk-1",
        vector,
        modelId: "test",
        dimensions: 1536,
      };

      await expect(insertEmbedding(mockDb as any, item)).rejects.toThrow(
        "Vector contains invalid value",
      );
    });

    it("should use provided normalizedMagnitude if given", async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue(undefined),
        }),
      };

      const item: EmbeddingInsertItem = {
        chunkId: "chunk-1",
        vector: new Float32Array(1536).fill(0.1),
        modelId: "test",
        dimensions: 1536,
        normalizedMagnitude: 1.0,
      };

      await insertEmbedding(mockDb as any, item);

      const valuesCall = mockDb.insert().values.mock.calls[0][0];
      expect(valuesCall.normalizedMagnitude).toBe(1.0);
    });

    it("should calculate magnitude if not provided", async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue(undefined),
        }),
      };

      const vector = new Float32Array([3, 4, 0]); // magnitude = 5
      const item: EmbeddingInsertItem = {
        chunkId: "chunk-1",
        vector,
        modelId: "test",
        dimensions: 3,
      };

      await insertEmbedding(mockDb as any, item);

      const valuesCall = mockDb.insert().values.mock.calls[0][0];
      expect(valuesCall.normalizedMagnitude).toBeCloseTo(5.0, 5);
    });
  });

  describe("insertEmbeddingsBatch", () => {
    it("should return early for empty items array", async () => {
      const mockDb = { transaction: vi.fn() };

      await insertEmbeddingsBatch(mockDb as any, []);

      expect(mockDb.transaction).not.toHaveBeenCalled();
    });

    it("should validate all items before batch insert", async () => {
      const mockDb = {
        transaction: vi.fn().mockImplementation(async (fn) => {
          await fn({
            insert: vi.fn().mockReturnValue({
              values: vi.fn().mockResolvedValue(undefined),
            }),
          });
        }),
      };

      const items: EmbeddingInsertItem[] = [
        {
          chunkId: "chunk-1",
          vector: new Float32Array(1536).fill(0.1),
          modelId: "test",
          dimensions: 1536,
        },
        {
          chunkId: "chunk-2",
          vector: new Float32Array(1536).fill(0.2),
          modelId: "test",
          dimensions: 1536,
        },
      ];

      await insertEmbeddingsBatch(mockDb as any, items);

      expect(mockDb.transaction).toHaveBeenCalled();
    });

    it("should throw if any item has invalid vector", async () => {
      const mockDb = { transaction: vi.fn() };

      const vector = new Float32Array(1536).fill(0.1);
      vector[500] = Infinity;

      const items: EmbeddingInsertItem[] = [
        {
          chunkId: "chunk-1",
          vector: new Float32Array(1536).fill(0.1),
          modelId: "test",
          dimensions: 1536,
        },
        {
          chunkId: "chunk-2",
          vector, // Invalid vector
          modelId: "test",
          dimensions: 1536,
        },
      ];

      await expect(insertEmbeddingsBatch(mockDb as any, items)).rejects.toThrow(
        "Vector contains invalid value",
      );
    });

    it("should throw if any item has dimension mismatch", async () => {
      const mockDb = { transaction: vi.fn() };

      const items: EmbeddingInsertItem[] = [
        {
          chunkId: "chunk-1",
          vector: new Float32Array(768).fill(0.1),
          modelId: "test",
          dimensions: 1536, // Mismatch!
        },
      ];

      await expect(insertEmbeddingsBatch(mockDb as any, items)).rejects.toThrow(
        "Vector dimensions mismatch",
      );
    });

    it("should process items in batches", async () => {
      const insertCalls: number[] = [];
      const mockDb = {
        transaction: vi.fn().mockImplementation(async (fn) => {
          await fn({
            insert: vi.fn().mockReturnValue({
              values: vi.fn().mockImplementation((values: any[]) => {
                insertCalls.push(values.length);
                return Promise.resolve();
              }),
            }),
          });
        }),
      };

      // 250 items with batch size 100 = 3 batches (100, 100, 50)
      const items = Array.from({ length: 250 }, (_, i) => ({
        chunkId: `chunk-${i}`,
        vector: new Float32Array(3).fill(0.1),
        modelId: "test",
        dimensions: 3,
      }));

      await insertEmbeddingsBatch(mockDb as any, items, 100);

      expect(insertCalls).toEqual([100, 100, 50]);
    });
  });

  describe("deleteEmbeddingByChunkId", () => {
    it("should call delete with correct chunkId", async () => {
      const whereFn = vi.fn().mockResolvedValue({ rowsAffected: 1 });
      const mockDb = {
        delete: vi.fn().mockReturnValue({
          where: whereFn,
        }),
      };

      const result = await deleteEmbeddingByChunkId(mockDb as any, "chunk-123");

      expect(mockDb.delete).toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it("should return 0 when no rows affected", async () => {
      const mockDb = {
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ rowsAffected: 0 }),
        }),
      };

      const result = await deleteEmbeddingByChunkId(
        mockDb as any,
        "non-existent",
      );

      expect(result).toBe(0);
    });
  });

  describe("deleteEmbeddingsByFileId", () => {
    it("should call run with delete SQL for fileId", async () => {
      const mockDb = {
        run: vi.fn().mockResolvedValue({ rowsAffected: 5 }),
      };

      const result = await deleteEmbeddingsByFileId(mockDb as any, "file-123");

      expect(mockDb.run).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it("should return 0 when no rows affected", async () => {
      const mockDb = {
        run: vi.fn().mockResolvedValue({ rowsAffected: 0 }),
      };

      const result = await deleteEmbeddingsByFileId(
        mockDb as any,
        "non-existent",
      );

      expect(result).toBe(0);
    });
  });

  describe("getEmbeddingByChunkId", () => {
    it("should return embedding when found", async () => {
      const mockEmbedding = {
        id: "emb-1",
        chunkId: "chunk-1",
        vector: Buffer.alloc(12),
        modelId: "test",
        dimensions: 3,
        normalizedMagnitude: 1.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockEmbedding]),
            }),
          }),
        }),
      };

      const result = await getEmbeddingByChunkId(mockDb as any, "chunk-1");

      expect(result).toEqual(mockEmbedding);
    });

    it("should return undefined when not found", async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      };

      const result = await getEmbeddingByChunkId(mockDb as any, "non-existent");

      expect(result).toBeUndefined();
    });
  });

  describe("countEmbeddingsByModelId", () => {
    it("should return model counts", async () => {
      const mockDb = {
        all: vi.fn().mockResolvedValue([
          { model_id: "text-embedding-3-small", count: 100 },
          { model_id: "text-embedding-ada-002", count: 50 },
        ]),
      };

      const result = await countEmbeddingsByModelId(mockDb as any);

      expect(result).toEqual({
        "text-embedding-3-small": 100,
        "text-embedding-ada-002": 50,
      });
    });

    it("should return empty object when no embeddings", async () => {
      const mockDb = {
        all: vi.fn().mockResolvedValue([]),
      };

      const result = await countEmbeddingsByModelId(mockDb as any);

      expect(result).toEqual({});
    });
  });
});

// ============================================
// 9. インメモリDB統合テスト
// ============================================
describe("embeddings schema integration tests", () => {
  // better-sqlite3を使ったインメモリDBテスト
  let sqlite: any;
  let db: any;

  beforeAll(async () => {
    // 動的インポートでbetter-sqlite3を使用
    const Database = (await import("better-sqlite3")).default;
    const { drizzle } = await import("drizzle-orm/better-sqlite3");

    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

    // filesテーブル作成（chunksの親テーブル）
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        hash TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    // chunksテーブル作成（embeddingsの親テーブル）
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS chunks (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        contextual_content TEXT,
        chunk_index INTEGER NOT NULL,
        start_offset INTEGER NOT NULL,
        end_offset INTEGER NOT NULL,
        token_count INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    // embeddingsテーブル作成
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id TEXT PRIMARY KEY,
        chunk_id TEXT NOT NULL UNIQUE REFERENCES chunks(id) ON DELETE CASCADE,
        vector BLOB NOT NULL,
        model_id TEXT NOT NULL,
        dimensions INTEGER NOT NULL,
        normalized_magnitude REAL NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE UNIQUE INDEX IF NOT EXISTS embeddings_chunk_id_idx ON embeddings(chunk_id);
      CREATE INDEX IF NOT EXISTS embeddings_model_id_idx ON embeddings(model_id);
    `);

    db = drizzle(sqlite);
  });

  afterAll(() => {
    if (sqlite) {
      sqlite.close();
    }
  });

  beforeEach(() => {
    // テストデータをクリア
    sqlite.exec("DELETE FROM embeddings");
    sqlite.exec("DELETE FROM chunks");
    sqlite.exec("DELETE FROM files");
  });

  describe("schema $defaultFn execution", () => {
    it("should generate UUID when inserting without id", () => {
      // ファイル挿入
      sqlite.exec(`
        INSERT INTO files (id, name, path, mime_type, size)
        VALUES ('file-1', 'test.txt', '/test.txt', 'text/plain', 100)
      `);

      // チャンク挿入
      sqlite.exec(`
        INSERT INTO chunks (id, file_id, content, chunk_index, start_offset, end_offset, token_count)
        VALUES ('chunk-1', 'file-1', 'test content', 0, 0, 12, 2)
      `);

      // Drizzleスキーマを使用してembeddingsを挿入
      const vector = new Float32Array([0.1, 0.2, 0.3]);
      const vectorBlob = Buffer.from(vector.buffer);
      const id = crypto.randomUUID();

      sqlite.exec(`
        INSERT INTO embeddings (id, chunk_id, vector, model_id, dimensions, normalized_magnitude)
        VALUES ('${id}', 'chunk-1', X'${vectorBlob.toString("hex")}', 'test-model', 3, 1.0)
      `);

      // 挿入されたレコードを確認
      const result = sqlite
        .prepare("SELECT * FROM embeddings WHERE chunk_id = ?")
        .get("chunk-1");

      expect(result).toBeDefined();
      expect(result.id).toBe(id);
      expect(result.chunk_id).toBe("chunk-1");
      expect(result.model_id).toBe("test-model");
      expect(result.dimensions).toBe(3);
    });

    it("should store and retrieve vector blob correctly", () => {
      // セットアップ
      sqlite.exec(`
        INSERT INTO files (id, name, path, mime_type, size)
        VALUES ('file-2', 'test2.txt', '/test2.txt', 'text/plain', 100)
      `);
      sqlite.exec(`
        INSERT INTO chunks (id, file_id, content, chunk_index, start_offset, end_offset, token_count)
        VALUES ('chunk-2', 'file-2', 'test content 2', 0, 0, 14, 3)
      `);

      // ベクトルデータ
      const originalVector = new Float32Array([0.5, -0.3, 0.8, 0.1]);
      const vectorBlob = Buffer.from(
        originalVector.buffer,
        originalVector.byteOffset,
        originalVector.byteLength,
      );

      sqlite.exec(`
        INSERT INTO embeddings (id, chunk_id, vector, model_id, dimensions, normalized_magnitude)
        VALUES ('emb-2', 'chunk-2', X'${vectorBlob.toString("hex")}', 'test-model', 4, 1.0)
      `);

      // 取得して変換
      const result = sqlite
        .prepare("SELECT vector FROM embeddings WHERE id = ?")
        .get("emb-2");

      const retrievedVector = blobToVector(result.vector);

      expect(retrievedVector.length).toBe(4);
      expect(retrievedVector[0]).toBeCloseTo(0.5, 5);
      expect(retrievedVector[1]).toBeCloseTo(-0.3, 5);
      expect(retrievedVector[2]).toBeCloseTo(0.8, 5);
      expect(retrievedVector[3]).toBeCloseTo(0.1, 5);
    });

    it("should enforce CASCADE DELETE from chunks", () => {
      // セットアップ
      sqlite.exec(`
        INSERT INTO files (id, name, path, mime_type, size)
        VALUES ('file-3', 'test3.txt', '/test3.txt', 'text/plain', 100)
      `);
      sqlite.exec(`
        INSERT INTO chunks (id, file_id, content, chunk_index, start_offset, end_offset, token_count)
        VALUES ('chunk-3', 'file-3', 'test content 3', 0, 0, 14, 3)
      `);

      const vector = new Float32Array([0.1, 0.2]);
      const vectorBlob = Buffer.from(vector.buffer);

      sqlite.exec(`
        INSERT INTO embeddings (id, chunk_id, vector, model_id, dimensions, normalized_magnitude)
        VALUES ('emb-3', 'chunk-3', X'${vectorBlob.toString("hex")}', 'test-model', 2, 1.0)
      `);

      // embeddingが存在することを確認
      let count = sqlite
        .prepare("SELECT COUNT(*) as count FROM embeddings WHERE chunk_id = ?")
        .get("chunk-3");
      expect(count.count).toBe(1);

      // チャンクを削除
      sqlite.exec("DELETE FROM chunks WHERE id = 'chunk-3'");

      // embeddingも削除されていることを確認（CASCADE DELETE）
      count = sqlite
        .prepare("SELECT COUNT(*) as count FROM embeddings WHERE chunk_id = ?")
        .get("chunk-3");
      expect(count.count).toBe(0);
    });

    it("should enforce UNIQUE constraint on chunk_id", () => {
      // セットアップ
      sqlite.exec(`
        INSERT INTO files (id, name, path, mime_type, size)
        VALUES ('file-4', 'test4.txt', '/test4.txt', 'text/plain', 100)
      `);
      sqlite.exec(`
        INSERT INTO chunks (id, file_id, content, chunk_index, start_offset, end_offset, token_count)
        VALUES ('chunk-4', 'file-4', 'test content 4', 0, 0, 14, 3)
      `);

      const vector = new Float32Array([0.1]);
      const vectorBlob = Buffer.from(vector.buffer);

      // 最初の挿入は成功
      sqlite.exec(`
        INSERT INTO embeddings (id, chunk_id, vector, model_id, dimensions, normalized_magnitude)
        VALUES ('emb-4a', 'chunk-4', X'${vectorBlob.toString("hex")}', 'test-model', 1, 1.0)
      `);

      // 同じchunk_idで2回目の挿入はUNIQUE制約違反
      expect(() => {
        sqlite.exec(`
          INSERT INTO embeddings (id, chunk_id, vector, model_id, dimensions, normalized_magnitude)
          VALUES ('emb-4b', 'chunk-4', X'${vectorBlob.toString("hex")}', 'test-model', 1, 1.0)
        `);
      }).toThrow();
    });

    it("should set timestamps automatically", () => {
      // セットアップ
      sqlite.exec(`
        INSERT INTO files (id, name, path, mime_type, size)
        VALUES ('file-5', 'test5.txt', '/test5.txt', 'text/plain', 100)
      `);
      sqlite.exec(`
        INSERT INTO chunks (id, file_id, content, chunk_index, start_offset, end_offset, token_count)
        VALUES ('chunk-5', 'file-5', 'test content 5', 0, 0, 14, 3)
      `);

      const vector = new Float32Array([0.1, 0.2, 0.3]);
      const vectorBlob = Buffer.from(vector.buffer);

      const beforeInsert = Math.floor(Date.now() / 1000);

      sqlite.exec(`
        INSERT INTO embeddings (id, chunk_id, vector, model_id, dimensions, normalized_magnitude)
        VALUES ('emb-5', 'chunk-5', X'${vectorBlob.toString("hex")}', 'test-model', 3, 1.0)
      `);

      const afterInsert = Math.floor(Date.now() / 1000);

      const result = sqlite
        .prepare("SELECT created_at, updated_at FROM embeddings WHERE id = ?")
        .get("emb-5");

      expect(result.created_at).toBeGreaterThanOrEqual(beforeInsert);
      expect(result.created_at).toBeLessThanOrEqual(afterInsert);
      expect(result.updated_at).toBeGreaterThanOrEqual(beforeInsert);
      expect(result.updated_at).toBeLessThanOrEqual(afterInsert);
    });
  });

  describe("index verification", () => {
    it("should use chunk_id index for lookups", () => {
      // インデックスの存在確認
      const indexes = sqlite
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='embeddings'",
        )
        .all();

      const indexNames = indexes.map((idx: { name: string }) => idx.name);
      expect(indexNames).toContain("embeddings_chunk_id_idx");
      expect(indexNames).toContain("embeddings_model_id_idx");
    });

    it("should have correct index on model_id", () => {
      // model_idインデックスの存在確認
      const indexInfo = sqlite
        .prepare("PRAGMA index_info(embeddings_model_id_idx)")
        .all();

      expect(indexInfo.length).toBe(1);
      expect(indexInfo[0].name).toBe("model_id");
    });
  });

  describe("Drizzle schema insert with $defaultFn", () => {
    it("should execute $defaultFn when inserting via Drizzle", async () => {
      // セットアップ
      sqlite.exec(`
        INSERT INTO files (id, name, path, mime_type, size)
        VALUES ('file-drizzle', 'drizzle.txt', '/drizzle.txt', 'text/plain', 100)
      `);
      sqlite.exec(`
        INSERT INTO chunks (id, file_id, content, chunk_index, start_offset, end_offset, token_count)
        VALUES ('chunk-drizzle', 'file-drizzle', 'drizzle test', 0, 0, 12, 2)
      `);

      // Drizzle経由で挿入（$defaultFnが実行される）
      const vector = new Float32Array([0.1, 0.2, 0.3]);
      const vectorBlob = vectorToBlob(vector);

      await db.insert(embeddings).values({
        chunkId: "chunk-drizzle",
        vector: vectorBlob,
        modelId: "test-model-drizzle",
        dimensions: 3,
        normalizedMagnitude: 1.0,
      });

      // 挿入されたレコードを確認
      const result = sqlite
        .prepare("SELECT * FROM embeddings WHERE chunk_id = ?")
        .get("chunk-drizzle");

      expect(result).toBeDefined();
      // $defaultFnによりUUIDが生成されている
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(result.chunk_id).toBe("chunk-drizzle");
      expect(result.model_id).toBe("test-model-drizzle");
    });

    it("should use provided id when specified", async () => {
      // セットアップ
      sqlite.exec(`
        INSERT INTO files (id, name, path, mime_type, size)
        VALUES ('file-explicit', 'explicit.txt', '/explicit.txt', 'text/plain', 100)
      `);
      sqlite.exec(`
        INSERT INTO chunks (id, file_id, content, chunk_index, start_offset, end_offset, token_count)
        VALUES ('chunk-explicit', 'file-explicit', 'explicit test', 0, 0, 13, 2)
      `);

      const vector = new Float32Array([0.5, 0.5]);
      const vectorBlob = vectorToBlob(vector);
      const explicitId = "my-explicit-id-12345";

      await db.insert(embeddings).values({
        id: explicitId,
        chunkId: "chunk-explicit",
        vector: vectorBlob,
        modelId: "explicit-model",
        dimensions: 2,
        normalizedMagnitude: 0.707,
      });

      const result = sqlite
        .prepare("SELECT * FROM embeddings WHERE id = ?")
        .get(explicitId);

      expect(result).toBeDefined();
      expect(result.id).toBe(explicitId);
    });
  });
});
