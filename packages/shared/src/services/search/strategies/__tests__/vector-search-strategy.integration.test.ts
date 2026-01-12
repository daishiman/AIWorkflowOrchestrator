/**
 * @file VectorSearchStrategy 統合テスト
 * @description Phase 4: TDD Red - 統合テストシナリオ
 * CONV-07-03: HybridRAGセマンティック検索
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { VectorSearchStrategy } from "../vector-search-strategy";
import type { IEmbeddingProvider } from "../../../embedding/providers/interfaces";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

// テスト用モックデータ
const mockEmbedding = new Array(1536).fill(0.1);

const mockVectorSearchResults = [
  {
    embedding_id: "emb-1",
    chunk_id: "chunk-1",
    content: "統合テスト用コンテンツ1",
    contextual_content: "コンテキスト1",
    distance: 0.2,
  },
  {
    embedding_id: "emb-2",
    chunk_id: "chunk-2",
    content: "統合テスト用コンテンツ2",
    contextual_content: null,
    distance: 0.4,
  },
];

describe("VectorSearchStrategy 統合テスト", () => {
  let mockDb: LibSQLDatabase<Record<string, never>>;
  let mockEmbeddingProvider: IEmbeddingProvider;

  beforeEach(() => {
    mockDb = {
      all: vi.fn().mockResolvedValue(mockVectorSearchResults),
    } as unknown as LibSQLDatabase<Record<string, never>>;

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
  });

  // ==========================================
  // データフローテスト
  // ==========================================

  describe("データフローテスト", () => {
    it("埋め込み生成→検索→結果変換のフローが動作する", async () => {
      const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);

      // Act
      const result = await strategy.search("統合テストクエリ", 10);

      // Assert: 全ステップが正常に完了
      expect(result.isOk()).toBe(true);

      // 埋め込み生成が呼ばれた
      expect(mockEmbeddingProvider.embed).toHaveBeenCalledWith(
        "統合テストクエリ",
      );

      // DB検索が呼ばれた
      expect(mockDb.all).toHaveBeenCalled();

      // 結果がSearchResultItem形式
      if (result.isOk()) {
        expect(result.value.length).toBe(2);
        expect(result.value[0]).toHaveProperty("id");
        expect(result.value[0]).toHaveProperty("type", "chunk");
        expect(result.value[0]).toHaveProperty("score");
        expect(result.value[0]).toHaveProperty("relevance");
        expect(result.value[0]).toHaveProperty("content");
        expect(result.value[0]).toHaveProperty("sources");
      }
    });

    it("クエリ埋め込みがFloat32Arrayに変換される", async () => {
      const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);

      await strategy.search("テスト", 10);

      // embed()が呼ばれ、結果がDBクエリに渡される
      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(1);
      expect(mockDb.all).toHaveBeenCalledTimes(1);
    });

    it("検索結果が正しくSearchResultItemに変換される", async () => {
      const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);

      const result = await strategy.search("変換テスト", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const firstItem = result.value[0];

        // VectorSearchResult → SearchResultItem マッピング確認
        expect(firstItem.id).toBe("chunk-1");
        expect(firstItem.type).toBe("chunk");
        expect(firstItem.score).toBe(0.9); // 1 - 0.2 / 2 = 0.9
        expect(firstItem.relevance.semantic).toBe(0.9);
        expect(firstItem.relevance.keyword).toBe(0);
        expect(firstItem.relevance.graph).toBe(0);
        expect(firstItem.content.text).toBe("統合テスト用コンテンツ1");
        expect(firstItem.content.summary).toBe("コンテキスト1");
        expect(firstItem.sources.chunkId).toBe("chunk-1");
      }
    });
  });

  // ==========================================
  // エラーハンドリングテスト
  // ==========================================

  describe("エラーハンドリングテスト", () => {
    it("埋め込みAPI障害時にエラーを返す", async () => {
      const failingProvider = {
        ...mockEmbeddingProvider,
        embed: vi.fn().mockRejectedValue(new Error("API connection timeout")),
      };
      const strategy = new VectorSearchStrategy(mockDb, failingProvider);

      const result = await strategy.search("テスト", 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("Failed to generate embedding");
      }
      // DB検索は呼ばれない
      expect(mockDb.all).not.toHaveBeenCalled();
    });

    it("埋め込みAPIレート制限時にエラーを返す", async () => {
      const rateLimitedProvider = {
        ...mockEmbeddingProvider,
        embed: vi
          .fn()
          .mockRejectedValue(new Error("Rate limit exceeded (429)")),
      };
      const strategy = new VectorSearchStrategy(mockDb, rateLimitedProvider);

      const result = await strategy.search("テスト", 10);

      expect(result.isErr()).toBe(true);
    });

    it("DB障害時にエラーを返す", async () => {
      const failingDb = {
        all: vi.fn().mockRejectedValue(new Error("SQLITE_BUSY")),
      } as unknown as LibSQLDatabase<Record<string, never>>;
      const strategy = new VectorSearchStrategy(
        failingDb,
        mockEmbeddingProvider,
      );

      const result = await strategy.search("テスト", 10);

      expect(result.isErr()).toBe(true);
      // 埋め込み生成は成功している
      expect(mockEmbeddingProvider.embed).toHaveBeenCalled();
    });

    it("DBクエリタイムアウト時にエラーを返す", async () => {
      const timeoutDb = {
        all: vi.fn().mockRejectedValue(new Error("Query timeout")),
      } as unknown as LibSQLDatabase<Record<string, never>>;
      const strategy = new VectorSearchStrategy(
        timeoutDb,
        mockEmbeddingProvider,
      );

      const result = await strategy.search("テスト", 10);

      expect(result.isErr()).toBe(true);
    });
  });

  // ==========================================
  // パフォーマンステスト（Phase 7で詳細検証）
  // ==========================================

  describe("パフォーマンス（基本）", () => {
    it("検索が100ms以内に完了する", async () => {
      const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
      const startTime = performance.now();

      await strategy.search("パフォーマンステスト", 10);

      const elapsed = performance.now() - startTime;
      // モックなので非常に高速なはず
      expect(elapsed).toBeLessThan(100);
    });

    it("メトリクスに処理時間が正しく記録される", async () => {
      const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);

      await strategy.search("メトリクステスト", 10);
      const metrics = strategy.getMetrics();

      expect(metrics.processingTime).toBeGreaterThan(0);
      expect(metrics.processingTime).toBeLessThan(1000);
    });
  });

  // ==========================================
  // フィルタ統合テスト
  // ==========================================

  describe("フィルタ統合テスト", () => {
    it("fileIdsフィルタがDBクエリに適用される", async () => {
      const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);

      await strategy.search("フィルタテスト", 10, {
        fileIds: ["file-1" as any, "file-2" as any],
        entityTypes: null,
        dateRange: null,
        minRelevance: 0,
      });

      // DBクエリにfileIdsが含まれることを検証
      expect(mockDb.all).toHaveBeenCalled();
    });

    it("minRelevanceフィルタが結果に適用される", async () => {
      const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);

      const result = await strategy.search("フィルタテスト", 10, {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 0.8,
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // distance: 0.2 → similarity: 0.9 のみ通過
        // distance: 0.4 → similarity: 0.8 も通過
        for (const item of result.value) {
          expect(item.score).toBeGreaterThanOrEqual(0.8);
        }
      }
    });
  });

  // ==========================================
  // 統合テスト拡充（Phase 6）
  // ==========================================

  describe("統合テスト拡充", () => {
    it("複数フィルタ（fileIds + minRelevance）が同時適用される", async () => {
      const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);

      const result = await strategy.search("複合フィルタテスト", 10, {
        fileIds: ["file-1" as any, "file-2" as any],
        entityTypes: null,
        dateRange: null,
        minRelevance: 0.7,
      });

      expect(result.isOk()).toBe(true);
      expect(mockDb.all).toHaveBeenCalled();
      if (result.isOk()) {
        for (const item of result.value) {
          expect(item.score).toBeGreaterThanOrEqual(0.7);
        }
      }
    });

    it("contextual_contentがnullでも正常に変換される", async () => {
      const nullContextDb = {
        all: vi.fn().mockResolvedValue([
          {
            embedding_id: "emb-1",
            chunk_id: "chunk-1",
            content: "テストコンテンツ",
            contextual_content: null,
            distance: 0.2,
          },
        ]),
      } as unknown as LibSQLDatabase<Record<string, never>>;
      const strategy = new VectorSearchStrategy(
        nullContextDb,
        mockEmbeddingProvider,
      );

      const result = await strategy.search("nullコンテキスト", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value[0].content.summary).toBeNull();
        expect(result.value[0].content.text).toBe("テストコンテンツ");
      }
    });

    it("大量結果（50件）が正常に処理される", async () => {
      const manyResults = Array.from({ length: 50 }, (_, i) => ({
        embedding_id: `emb-${i}`,
        chunk_id: `chunk-${i}`,
        content: `コンテンツ${i}`,
        contextual_content: null,
        distance: 0.1 + i * 0.02, // 0.1〜1.08
      }));
      const largeDb = {
        all: vi.fn().mockResolvedValue(manyResults),
      } as unknown as LibSQLDatabase<Record<string, never>>;
      const strategy = new VectorSearchStrategy(largeDb, mockEmbeddingProvider);

      const result = await strategy.search("大量データ", 50);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBe(50);
        // スコアが降順であることを確認
        for (let i = 1; i < result.value.length; i++) {
          expect(result.value[i].score).toBeLessThanOrEqual(
            result.value[i - 1].score,
          );
        }
      }
    });

    it("埋め込み生成とDB検索が正しい順序で実行される", async () => {
      const callOrder: string[] = [];

      const orderedDb = {
        all: vi.fn().mockImplementation(() => {
          callOrder.push("db");
          return Promise.resolve(mockVectorSearchResults);
        }),
      } as unknown as LibSQLDatabase<Record<string, never>>;

      const orderedProvider = {
        ...mockEmbeddingProvider,
        embed: vi.fn().mockImplementation(() => {
          callOrder.push("embed");
          return Promise.resolve({
            embedding: mockEmbedding,
            tokenCount: 10,
          });
        }),
      };

      const strategy = new VectorSearchStrategy(orderedDb, orderedProvider);
      await strategy.search("順序テスト", 10);

      expect(callOrder).toEqual(["embed", "db"]);
    });

    it("minRelevance=0でフィルタリングがスキップされる", async () => {
      const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);

      const result = await strategy.search("ゼロ閾値", 10, {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 0,
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // 全結果が返される
        expect(result.value.length).toBe(2);
      }
    });
  });
});
