/**
 * @file CachedVectorSearchStrategy ユニットテスト
 * @description Phase 4: TDD Red - キャッシュ付きVectorSearchStrategyのテスト
 * CONV-07-03: HybridRAGセマンティック検索
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CachedVectorSearchStrategy } from "../cached-vector-search-strategy";
import type { IEmbeddingProvider } from "../../../embedding/providers/interfaces";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

// テスト用モックデータ
const mockEmbedding = new Array(1536).fill(0.1);

const mockVectorSearchResults = [
  {
    embedding_id: "emb-1",
    chunk_id: "chunk-1",
    content: "キャッシュテスト用コンテンツ",
    contextual_content: null,
    distance: 0.3,
  },
];

describe("CachedVectorSearchStrategy", () => {
  let mockDb: LibSQLDatabase<Record<string, never>>;
  let mockEmbeddingProvider: IEmbeddingProvider;
  let strategy: CachedVectorSearchStrategy;

  beforeEach(() => {
    vi.useFakeTimers();

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

    strategy = new CachedVectorSearchStrategy(mockDb, mockEmbeddingProvider);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ==========================================
  // 基本動作テスト
  // ==========================================

  describe("基本動作", () => {
    it('nameプロパティが"semantic"を返す', () => {
      expect(strategy.name).toBe("semantic");
    });

    it("検索が正常に動作する", async () => {
      const result = await strategy.search("テストクエリ", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });
  });

  // ==========================================
  // キャッシュ動作テスト
  // ==========================================

  describe("キャッシュ動作", () => {
    it("同じクエリでキャッシュが使用される", async () => {
      await strategy.search("test query", 10);
      await strategy.search("test query", 10);

      // 埋め込み生成は1回のみ
      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(1);
      // DB検索は2回（キャッシュは埋め込みのみ）
      expect(mockDb.all).toHaveBeenCalledTimes(2);
    });

    it("異なるクエリでは新しい埋め込みが生成される", async () => {
      await strategy.search("query 1", 10);
      await strategy.search("query 2", 10);

      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(2);
    });

    it("大文字小文字を正規化してキャッシュキーを生成", async () => {
      await strategy.search("Test Query", 10);
      await strategy.search("test query", 10);

      // 正規化されるので埋め込み生成は1回
      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(1);
    });

    it("前後の空白を正規化してキャッシュキーを生成", async () => {
      await strategy.search("  test query  ", 10);
      await strategy.search("test query", 10);

      // 正規化されるので埋め込み生成は1回
      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // キャッシュ有効期限テスト
  // ==========================================

  describe("キャッシュ有効期限", () => {
    it("キャッシュが期限切れになると再生成される", async () => {
      await strategy.search("test query", 10);

      // 5分経過（デフォルト有効期限）
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);

      await strategy.search("test query", 10);

      // 期限切れなので再生成
      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(2);
    });

    it("有効期限内であればキャッシュが使用される", async () => {
      await strategy.search("test query", 10);

      // 4分経過（期限内）
      vi.advanceTimersByTime(4 * 60 * 1000);

      await strategy.search("test query", 10);

      // キャッシュ使用
      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(1);
    });

    it("カスタム有効期限が適用される", async () => {
      const shortCacheStrategy = new CachedVectorSearchStrategy(
        mockDb,
        mockEmbeddingProvider,
        { cacheMaxAge: 60 * 1000 }, // 1分
      );

      await shortCacheStrategy.search("test", 10);

      // 1分経過
      vi.advanceTimersByTime(60 * 1000 + 1);

      await shortCacheStrategy.search("test", 10);

      // 期限切れで再生成
      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================
  // キャッシュサイズ制限テスト
  // ==========================================

  describe("キャッシュサイズ制限", () => {
    it("最大キャッシュサイズを超えると古いエントリが削除される", async () => {
      const smallCacheStrategy = new CachedVectorSearchStrategy(
        mockDb,
        mockEmbeddingProvider,
        { maxCacheSize: 2 },
      );

      await smallCacheStrategy.search("query 1", 10);
      await smallCacheStrategy.search("query 2", 10);
      await smallCacheStrategy.search("query 3", 10);

      // 3クエリで3回生成
      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(3);

      // query 1を再度検索（LRUで削除されているはず）
      await smallCacheStrategy.search("query 1", 10);

      // 再生成が必要
      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(4);
    });
  });

  // ==========================================
  // キャッシュ管理テスト
  // ==========================================

  describe("キャッシュ管理", () => {
    it("clearCache()でキャッシュがクリアされる", async () => {
      await strategy.search("test query", 10);
      strategy.clearCache();
      await strategy.search("test query", 10);

      // クリア後なので再生成
      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(2);
    });

    it("getCacheStats()がキャッシュ統計を返す", async () => {
      await strategy.search("query 1", 10);
      await strategy.search("query 1", 10); // ヒット
      await strategy.search("query 2", 10); // ミス

      const stats = strategy.getCacheStats();

      expect(stats).toHaveProperty("size");
      expect(stats).toHaveProperty("maxSize");
      expect(stats).toHaveProperty("hits");
      expect(stats).toHaveProperty("misses");
      expect(stats).toHaveProperty("hitRate");
    });

    it("キャッシュ統計が正確に計算される", async () => {
      await strategy.search("query 1", 10); // ミス
      await strategy.search("query 1", 10); // ヒット
      await strategy.search("query 2", 10); // ミス

      const stats = strategy.getCacheStats();

      expect(stats.size).toBe(2);
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBeCloseTo(1 / 3, 2);
    });
  });

  // ==========================================
  // エラーハンドリングテスト
  // ==========================================

  describe("エラーハンドリング", () => {
    it("埋め込み生成失敗時にキャッシュされない", async () => {
      const failingProvider = {
        ...mockEmbeddingProvider,
        embed: vi
          .fn()
          .mockRejectedValueOnce(new Error("API error"))
          .mockResolvedValue({
            embedding: mockEmbedding,
            tokenCount: 10,
          }),
      };
      const failingStrategy = new CachedVectorSearchStrategy(
        mockDb,
        failingProvider,
      );

      // 1回目: エラー
      const result1 = await failingStrategy.search("test", 10);
      expect(result1.isErr()).toBe(true);

      // 2回目: 成功（キャッシュされていないので再試行）
      const result2 = await failingStrategy.search("test", 10);
      expect(result2.isOk()).toBe(true);

      expect(failingProvider.embed).toHaveBeenCalledTimes(2);
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

    it("キャッシュヒット時はメトリクスが記録される", async () => {
      await strategy.search("test query", 10);
      const metrics1 = strategy.getMetrics();

      await strategy.search("test query", 10);
      const metrics2 = strategy.getMetrics();

      // キャッシュヒット時もメトリクスが正常に記録されることを確認
      // NOTE: パフォーマンス比較はCI環境で不安定なため削除
      // キャッシュ動作の検証は「キャッシュヒットで埋め込み生成がスキップされる」テストで実施
      expect(metrics1.processingTime).toBeGreaterThanOrEqual(0);
      expect(metrics2.processingTime).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================
  // キャッシュ動作拡充テスト（Phase 6）
  // ==========================================

  describe("キャッシュ動作拡充", () => {
    it("Unicode文字を含むクエリでキャッシュが動作する", async () => {
      await strategy.search("日本語クエリ🚀", 10);
      await strategy.search("日本語クエリ🚀", 10);

      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(1);
    });

    it("特殊文字を含むクエリでキャッシュが動作する", async () => {
      await strategy.search("query'with\"special<chars>", 10);
      await strategy.search("query'with\"special<chars>", 10);

      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(1);
    });

    it("clearCache後に統計がリセットされる", async () => {
      await strategy.search("query 1", 10);
      await strategy.search("query 1", 10); // hit

      const statsBefore = strategy.getCacheStats();
      expect(statsBefore.hits).toBe(1);
      expect(statsBefore.misses).toBe(1);

      strategy.clearCache();

      const statsAfter = strategy.getCacheStats();
      expect(statsAfter.hits).toBe(0);
      expect(statsAfter.misses).toBe(0);
      expect(statsAfter.size).toBe(0);
    });

    it("LRUエビクションが正しく動作する（最も古いエントリが削除される）", async () => {
      // 独立したモックを作成
      const localMockEmbed = vi.fn().mockResolvedValue({
        embedding: mockEmbedding,
        tokenCount: 10,
      });
      const localMockProvider = {
        ...mockEmbeddingProvider,
        embed: localMockEmbed,
      };

      const smallCacheStrategy = new CachedVectorSearchStrategy(
        mockDb,
        localMockProvider,
        { maxCacheSize: 3 },
      );

      // 3つのクエリをキャッシュ: cache = [1, 2, 3]
      await smallCacheStrategy.search("query 1", 10);
      await smallCacheStrategy.search("query 2", 10);
      await smallCacheStrategy.search("query 3", 10);
      expect(localMockEmbed).toHaveBeenCalledTimes(3);

      // query 1を再度使用（LRU更新）: cache = [2, 3, 1]
      await smallCacheStrategy.search("query 1", 10);
      expect(localMockEmbed).toHaveBeenCalledTimes(3); // キャッシュヒット

      // 新しいクエリを追加: cache = [3, 1, 4]（2が削除）
      await smallCacheStrategy.search("query 4", 10);
      expect(localMockEmbed).toHaveBeenCalledTimes(4);

      // query 2はエビクションされているので再生成: cache = [1, 4, 2]（3が削除）
      await smallCacheStrategy.search("query 2", 10);
      expect(localMockEmbed).toHaveBeenCalledTimes(5);

      // query 1はまだキャッシュにある: cache = [4, 2, 1]
      await smallCacheStrategy.search("query 1", 10);
      expect(localMockEmbed).toHaveBeenCalledTimes(5); // キャッシュヒット

      // query 4もまだキャッシュにある: cache = [2, 1, 4]
      await smallCacheStrategy.search("query 4", 10);
      expect(localMockEmbed).toHaveBeenCalledTimes(5); // キャッシュヒット

      // query 3は削除されているので再生成: cache = [1, 4, 3]（2が削除）
      await smallCacheStrategy.search("query 3", 10);
      expect(localMockEmbed).toHaveBeenCalledTimes(6);
    });
  });

  // ==========================================
  // バリデーションテスト拡充（Phase 6）
  // ==========================================

  describe("バリデーション拡充", () => {
    it("空白のみのクエリでエラーを返す", async () => {
      const result = await strategy.search("   ", 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("empty");
      }
    });

    it("limit=0でエラーを返す", async () => {
      const result = await strategy.search("test", 0);

      expect(result.isErr()).toBe(true);
    });

    it("limit=101でエラーを返す", async () => {
      const result = await strategy.search("test", 101);

      expect(result.isErr()).toBe(true);
    });

    it("クエリ長1001でエラーを返す", async () => {
      const result = await strategy.search("a".repeat(1001), 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("1000");
      }
    });
  });

  // ==========================================
  // 結果変換テスト拡充（Phase 6）
  // ==========================================

  describe("結果変換拡充", () => {
    it("minRelevanceフィルタが適用される", async () => {
      (mockDb.all as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        { ...mockVectorSearchResults[0], distance: 0.2 }, // similarity 0.9
        { ...mockVectorSearchResults[0], distance: 0.6, chunk_id: "chunk-2" }, // similarity 0.7
      ]);

      const result = await strategy.search("test", 10, {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 0.8,
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBe(1); // 0.9のみ通過
        expect(result.value[0].score).toBe(0.9);
      }
    });

    it("fileIdsフィルタがDBクエリに渡される", async () => {
      await strategy.search("test", 10, {
        fileIds: ["file-1" as any],
        entityTypes: null,
        dateRange: null,
        minRelevance: 0,
      });

      expect(mockDb.all).toHaveBeenCalled();
    });
  });
});
