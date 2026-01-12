/**
 * @file VectorSearchStrategy ユニットテスト
 * @description Phase 4: TDD Red - VectorSearchStrategyのテスト
 * CONV-07-03: HybridRAGセマンティック検索
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { VectorSearchStrategy } from "../vector-search-strategy";
import type { IEmbeddingProvider } from "../../../embedding/providers/interfaces";
import type { SearchFilters } from "../../../../types/rag/search/types";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { ChunkId } from "../../../../types/rag/branded";

// Branded Type Creator (unused but kept for future use)
const _createChunkId = (id: string): ChunkId => id as ChunkId;

// テスト用モックデータ
const mockEmbedding = new Array(1536).fill(0.1);

const mockVectorSearchResult = {
  embedding_id: "emb-1",
  chunk_id: "chunk-1",
  content: "TypeScriptの型安全性について解説します。",
  contextual_content: "プログラミング言語の型システム",
  distance: 0.3,
};

const mockVectorSearchResults = [
  mockVectorSearchResult,
  {
    embedding_id: "emb-2",
    chunk_id: "chunk-2",
    content: "静的型付けのメリットとデメリット",
    contextual_content: null,
    distance: 0.5,
  },
  {
    embedding_id: "emb-3",
    chunk_id: "chunk-3",
    content: "型推論の仕組み",
    contextual_content: "コンパイラの動作",
    distance: 0.7,
  },
];

describe("VectorSearchStrategy", () => {
  let mockDb: LibSQLDatabase<Record<string, never>>;
  let mockEmbeddingProvider: IEmbeddingProvider;
  let strategy: VectorSearchStrategy;

  beforeEach(() => {
    // LibSQLDatabase モック
    mockDb = {
      all: vi.fn().mockResolvedValue(mockVectorSearchResults),
    } as unknown as LibSQLDatabase<Record<string, never>>;

    // IEmbeddingProvider モック
    mockEmbeddingProvider = {
      modelId: "text-embedding-3-small" as any,
      providerName: "openai" as any,
      dimensions: 1536,
      maxTokens: 8192,
      embed: vi.fn().mockResolvedValue({
        embedding: mockEmbedding,
        tokenCount: 10,
      }),
      embedBatch: vi.fn(),
      countTokens: vi.fn().mockReturnValue(10),
      healthCheck: vi.fn().mockResolvedValue(true),
    };

    strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
  });

  // ==========================================
  // Task 2: 基本検索テスト
  // ==========================================

  describe("基本検索", () => {
    it('nameプロパティが"semantic"を返す', () => {
      expect(strategy.name).toBe("semantic");
    });

    it("基本的なセマンティック検索が動作する", async () => {
      const result = await strategy.search("型安全なプログラミング", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value[0].type).toBe("chunk");
      }
    });

    it("limit件数以下の結果を返す", async () => {
      const limit = 2;
      const result = await strategy.search("テストクエリ", limit);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBeLessThanOrEqual(limit);
      }
    });

    it("検索結果がSearchResultItem形式で返される", async () => {
      const result = await strategy.search("テスト", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        const item = result.value[0];
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("type");
        expect(item).toHaveProperty("score");
        expect(item).toHaveProperty("relevance");
        expect(item).toHaveProperty("content");
        expect(item).toHaveProperty("highlights");
        expect(item).toHaveProperty("sources");
      }
    });
  });

  // ==========================================
  // Task 3: スコア計算テスト
  // ==========================================

  describe("スコア計算", () => {
    it("類似度スコアが0-1の範囲", async () => {
      const result = await strategy.search("test query", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        for (const item of result.value) {
          expect(item.score).toBeGreaterThanOrEqual(0);
          expect(item.score).toBeLessThanOrEqual(1);
        }
      }
    });

    it("relevance.semanticが0-1の範囲", async () => {
      const result = await strategy.search("test query", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        for (const item of result.value) {
          expect(item.relevance.semantic).toBeGreaterThanOrEqual(0);
          expect(item.relevance.semantic).toBeLessThanOrEqual(1);
        }
      }
    });

    it("結果が類似度順でソートされる", async () => {
      const result = await strategy.search("test", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        for (let i = 1; i < result.value.length; i++) {
          expect(result.value[i].score).toBeLessThanOrEqual(
            result.value[i - 1].score,
          );
        }
      }
    });

    it("距離0.0が類似度1.0に変換される", async () => {
      (mockDb.all as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        { ...mockVectorSearchResult, distance: 0.0 },
      ]);

      const result = await strategy.search("完全一致", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        expect(result.value[0].score).toBe(1.0);
      }
    });

    it("距離2.0が類似度0.0に変換される", async () => {
      (mockDb.all as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        { ...mockVectorSearchResult, distance: 2.0 },
      ]);

      const result = await strategy.search("正反対", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        expect(result.value[0].score).toBe(0.0);
      }
    });
  });

  // ==========================================
  // Task 4: フィルタリングテスト
  // ==========================================

  describe("フィルタリング", () => {
    it("minRelevance閾値でフィルタリングされる", async () => {
      const filters: SearchFilters = {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 0.7,
      };

      const result = await strategy.search("test query", 10, filters);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        for (const item of result.value) {
          expect(item.score).toBeGreaterThanOrEqual(0.7);
        }
      }
    });

    it("fileIdsフィルタが適用される", async () => {
      const filters: SearchFilters = {
        fileIds: ["file-1" as any, "file-2" as any],
        entityTypes: null,
        dateRange: null,
        minRelevance: 0,
      };

      const result = await strategy.search("test", 10, filters);

      expect(result.isOk()).toBe(true);
      // フィルタがDBクエリに渡されることを検証
      expect(mockDb.all).toHaveBeenCalled();
    });

    it("フィルタなしで全結果が返される", async () => {
      const result = await strategy.search("test", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBe(mockVectorSearchResults.length);
      }
    });

    it("空のフィルタで全結果が返される", async () => {
      const filters: SearchFilters = {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 0,
      };

      const result = await strategy.search("test", 10, filters);

      expect(result.isOk()).toBe(true);
    });
  });

  // ==========================================
  // Task 5: エラーハンドリングテスト
  // ==========================================

  describe("エラーハンドリング", () => {
    it("埋め込みプロバイダーエラー時にResult.errを返す", async () => {
      const failingProvider = {
        ...mockEmbeddingProvider,
        embed: vi.fn().mockRejectedValue(new Error("API connection failed")),
      };
      const failingStrategy = new VectorSearchStrategy(mockDb, failingProvider);

      const result = await failingStrategy.search("test", 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("Failed to generate embedding");
      }
    });

    it("データベースエラー時にResult.errを返す", async () => {
      const failingDb = {
        all: vi.fn().mockRejectedValue(new Error("Database connection failed")),
      } as unknown as LibSQLDatabase<Record<string, never>>;
      const failingStrategy = new VectorSearchStrategy(
        failingDb,
        mockEmbeddingProvider,
      );

      const result = await failingStrategy.search("test", 10);

      expect(result.isErr()).toBe(true);
    });

    it("空のクエリでエラーを返す", async () => {
      const result = await strategy.search("", 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("empty");
      }
    });

    it("クエリが長すぎる場合にエラーを返す", async () => {
      const longQuery = "a".repeat(1001);
      const result = await strategy.search(longQuery, 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("1000");
      }
    });

    it("無効なlimitでエラーを返す（0以下）", async () => {
      const result = await strategy.search("test", 0);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("Limit");
      }
    });

    it("無効なlimitでエラーを返す（100超）", async () => {
      const result = await strategy.search("test", 101);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("Limit");
      }
    });
  });

  // ==========================================
  // メトリクステスト
  // ==========================================

  describe("メトリクス", () => {
    it("getMetrics()がStrategyMetricを返す", async () => {
      await strategy.search("test", 10);
      const metrics = strategy.getMetrics();

      expect(metrics).toHaveProperty("enabled");
      expect(metrics).toHaveProperty("resultCount");
      expect(metrics).toHaveProperty("processingTime");
      expect(metrics).toHaveProperty("topScore");
    });

    it("メトリクスに正しい結果件数が記録される", async () => {
      await strategy.search("test", 10);
      const metrics = strategy.getMetrics();

      expect(metrics.resultCount).toBe(mockVectorSearchResults.length);
    });

    it("メトリクスに処理時間が記録される", async () => {
      await strategy.search("test", 10);
      const metrics = strategy.getMetrics();

      expect(metrics.processingTime).toBeGreaterThanOrEqual(0);
    });

    it("空結果時のtopScoreが0", async () => {
      (mockDb.all as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await strategy.search("no match", 10);
      const metrics = strategy.getMetrics();

      expect(metrics.topScore).toBe(0);
    });
  });

  // ==========================================
  // 境界値テスト
  // ==========================================

  describe("境界値", () => {
    it("limit=1で1件の結果を返す", async () => {
      const result = await strategy.search("test", 1);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBeLessThanOrEqual(1);
      }
    });

    it("limit=100で最大100件の結果を返す", async () => {
      const result = await strategy.search("test", 100);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBeLessThanOrEqual(100);
      }
    });

    it("結果が0件の場合に空配列を返す", async () => {
      (mockDb.all as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await strategy.search("no match", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual([]);
      }
    });
  });

  // ==========================================
  // 境界値テスト拡充（Phase 6）
  // ==========================================

  describe("境界値テスト拡充", () => {
    it("空白のみのクエリでエラーを返す", async () => {
      const result = await strategy.search("   ", 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("empty");
      }
    });

    it("タブ・改行のみのクエリでエラーを返す", async () => {
      const result = await strategy.search("\t\n\r", 10);

      expect(result.isErr()).toBe(true);
    });

    it("日本語クエリで正常に動作する", async () => {
      const result = await strategy.search("日本語でのテストクエリ", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    it("絵文字を含むクエリで正常に動作する", async () => {
      const result = await strategy.search("テスト🚀クエリ👍", 10);

      expect(result.isOk()).toBe(true);
    });

    it("特殊文字を含むクエリで正常に動作する", async () => {
      const result = await strategy.search(
        "test'query\"with<special>chars",
        10,
      );

      expect(result.isOk()).toBe(true);
    });

    it("SQLインジェクション風クエリでも安全に動作する", async () => {
      const result = await strategy.search("'; DROP TABLE chunks; --", 10);

      expect(result.isOk()).toBe(true);
    });

    it("クエリ長1000文字（最大値）で正常に動作する", async () => {
      const maxLengthQuery = "a".repeat(1000);
      const result = await strategy.search(maxLengthQuery, 10);

      expect(result.isOk()).toBe(true);
    });
  });

  // ==========================================
  // エラーハンドリング拡充（Phase 6）
  // ==========================================

  describe("エラーハンドリング拡充", () => {
    it("非Error型の例外がErrorに変換される", async () => {
      const stringErrorDb = {
        all: vi.fn().mockRejectedValue("String error message"),
      } as unknown as LibSQLDatabase<Record<string, never>>;
      const failingStrategy = new VectorSearchStrategy(
        stringErrorDb,
        mockEmbeddingProvider,
      );

      const result = await failingStrategy.search("test", 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it("埋め込みプロバイダーからの非Error型例外がErrorに変換される", async () => {
      const stringErrorProvider = {
        ...mockEmbeddingProvider,
        embed: vi.fn().mockRejectedValue("String error from provider"),
      };
      const failingStrategy = new VectorSearchStrategy(
        mockDb,
        stringErrorProvider,
      );

      const result = await failingStrategy.search("test", 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toContain("Failed to generate embedding");
      }
    });

    it("minRelevanceが負の値でもフィルタリングが動作する", async () => {
      const filters: SearchFilters = {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: -0.5,
      };

      const result = await strategy.search("test", 10, filters);

      expect(result.isOk()).toBe(true);
      // 負の閾値なので全結果が通過
      if (result.isOk()) {
        expect(result.value.length).toBe(mockVectorSearchResults.length);
      }
    });

    it("minRelevanceが1を超える値で結果が0件になる", async () => {
      const filters: SearchFilters = {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 1.5,
      };

      const result = await strategy.search("test", 10, filters);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // similarity最大は1なので全て除外される
        expect(result.value.length).toBe(0);
      }
    });
  });

  // ==========================================
  // 結果変換テスト（Phase 6）
  // ==========================================

  describe("結果変換テスト", () => {
    it("contextual_contentがnullの場合summaryもnullになる", async () => {
      (mockDb.all as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        {
          ...mockVectorSearchResult,
          contextual_content: null,
        },
      ]);

      const result = await strategy.search("test", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value[0].content.summary).toBeNull();
      }
    });

    it("sourcesにchunkIdが正しく設定される", async () => {
      const result = await strategy.search("test", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        expect(result.value[0].sources.chunkId).toBe("chunk-1");
        expect(result.value[0].sources.fileId).toBeNull();
        expect(result.value[0].sources.entityIds).toEqual([]);
      }
    });

    it("highlightsが空配列で初期化される", async () => {
      const result = await strategy.search("test", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        expect(result.value[0].highlights).toEqual([]);
      }
    });

    it("relevance.keywordとrelevance.graphが0になる", async () => {
      const result = await strategy.search("test", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        expect(result.value[0].relevance.keyword).toBe(0);
        expect(result.value[0].relevance.graph).toBe(0);
        expect(result.value[0].relevance.rerank).toBeNull();
        expect(result.value[0].relevance.crag).toBeNull();
      }
    });
  });
});
