/**
 * KeywordSearchStrategy 統合テスト
 *
 * @module @repo/shared/services/search/__tests__/keyword-search-strategy.integration
 * @description TDD Red Phase - 実際のDB連携をテスト
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { KeywordSearchStrategy } from "../keyword-search-strategy";
import { isOk, isErr } from "../../../types/rag/result";
import type {
  SearchQuery,
  SearchFilters,
  SearchOptions,
} from "../../../types/rag/search/types";

// ============================================
// テストフィクスチャ
// ============================================

/**
 * テスト用チャンクデータ
 */
const _testChunks = [
  {
    id: "chunk-001",
    fileId: "file-001",
    content: "TypeScript is a typed superset of JavaScript",
    contextualContent: "Programming language introduction",
    parentHeader: "TypeScript Basics",
    chunkIndex: 0,
  },
  {
    id: "chunk-002",
    fileId: "file-001",
    content: "React is a JavaScript library for building user interfaces",
    contextualContent: "Frontend framework overview",
    parentHeader: "React Introduction",
    chunkIndex: 1,
  },
  {
    id: "chunk-003",
    fileId: "file-002",
    content: "日本語の全文検索テストデータです",
    contextualContent: "日本語テスト",
    parentHeader: "日本語セクション",
    chunkIndex: 0,
  },
  {
    id: "chunk-004",
    fileId: "file-002",
    content:
      "Full text search with FTS5 extension provides fast keyword lookup",
    contextualContent: "FTS5 documentation",
    parentHeader: "Search Implementation",
    chunkIndex: 1,
  },
  {
    id: "chunk-005",
    fileId: "file-003",
    content: "Near search finds words within proximity distance",
    contextualContent: "Advanced search features",
    parentHeader: "NEAR Search",
    chunkIndex: 0,
  },
];

// ============================================
// テストヘルパー
// ============================================

/**
 * テスト用SearchQueryを生成
 */
function createTestSearchQuery(
  text: string,
  overrides?: Partial<SearchQuery>,
): SearchQuery {
  const defaultFilters: SearchFilters = {
    fileIds: null,
    entityTypes: null,
    dateRange: null,
    minRelevance: 0,
  };

  const defaultOptions: SearchOptions = {
    limit: 20,
    offset: 0,
    includeMetadata: true,
    includeHighlights: true,
    rerankEnabled: false,
    cragEnabled: false,
    strategies: ["keyword"],
    weights: { keyword: 1.0, semantic: 0, graph: 0 },
  };

  return {
    text,
    type: "local",
    embedding: null,
    filters: overrides?.filters ?? defaultFilters,
    options: overrides?.options ?? defaultOptions,
    ...overrides,
  };
}

// ============================================
// 統合テストスイート
// ============================================

describe.skip("KeywordSearchStrategy Integration Tests", () => {
  let strategy: KeywordSearchStrategy;

  let testDb: any;

  beforeAll(async () => {
    // TODO: 実際のテストDBセットアップ
    // テストDBを初期化し、FTS5テーブルを作成
    // testDb = await setupTestDatabase();
  });

  afterAll(async () => {
    // TODO: テストDB クリーンアップ
    // await teardownTestDatabase(testDb);
  });

  beforeEach(async () => {
    // 各テスト前にデータをリセット
    // await resetTestData(testDb, testChunks);
    strategy = new KeywordSearchStrategy(testDb);
  });

  // ============================================
  // API接続テスト
  // ============================================

  describe("API接続テスト", () => {
    it("IT-001: 実際のDB検索でチャンクを返す", async () => {
      // Given: テストDBにデータが投入されている
      const query = createTestSearchQuery("TypeScript");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: データベースからチャンクが取得される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data[0].content.text).toContain("TypeScript");
      }
    });

    it("API-002: getStrategyName()が'keyword'を返す", () => {
      // When: getStrategyName()を呼び出す
      const name = strategy.getStrategyName();

      // Then: 'keyword'が返される
      expect(name).toBe("keyword");
    });

    it("API-003: getMetrics()がStrategyMetricを返す", async () => {
      // Given: 検索を1回実行
      const query = createTestSearchQuery("test");
      await strategy.search(query);

      // When: getMetrics()を呼び出す
      const metrics = strategy.getMetrics();

      // Then: メトリクスオブジェクトが返される
      expect(metrics).toBeDefined();
      expect(typeof metrics.enabled).toBe("boolean");
      expect(typeof metrics.resultCount).toBe("number");
      expect(typeof metrics.processingTime).toBe("number");
    });
  });

  // ============================================
  // データフローテスト
  // ============================================

  describe("データフローテスト", () => {
    it("FLOW-001: キーワード検索完全フロー", async () => {
      // Given: キーワードクエリ
      const query = createTestSearchQuery("JavaScript");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: SearchQuery→FTS5→DB→Resultの変換が正しい
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        // SearchResultItem[]が返される
        result.data.forEach((item) => {
          expect(item.id).toBeDefined();
          expect(item.type).toBe("chunk");
          expect(item.score).toBeGreaterThanOrEqual(0);
          expect(item.score).toBeLessThanOrEqual(1);
          expect(item.content.text).toBeDefined();
        });
      }
    });

    it("FLOW-002: フレーズ検索完全フロー", async () => {
      // Given: フレーズクエリ
      const query = createTestSearchQuery('"JavaScript library"');

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: フレーズ検索結果が正しく変換される
      expect(isOk(result)).toBe(true);
    });

    it("FLOW-003: NEAR検索完全フロー", async () => {
      // Given: NEAR検索用クエリ
      const _query = createTestSearchQuery("search proximity");

      // When: NEARモードでsearch()を呼び出す
      const result = await strategy.searchNear(["search", "proximity"], {
        nearDistance: 5,
      });

      // Then: NEAR検索結果が正しく変換される
      expect(isOk(result)).toBe(true);
    });

    it("FLOW-004: スコア正規化フロー", async () => {
      // Given: 検索クエリ
      const query = createTestSearchQuery("TypeScript");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: すべてのスコアが0-1範囲
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        result.data.forEach((item) => {
          expect(item.score).toBeGreaterThanOrEqual(0);
          expect(item.score).toBeLessThanOrEqual(1);
        });
      }
    });

    it("FLOW-005: ハイライト情報フロー", async () => {
      // Given: ハイライト有効なクエリ
      const query = createTestSearchQuery("TypeScript", {
        options: {
          limit: 20,
          offset: 0,
          includeMetadata: true,
          includeHighlights: true,
          rerankEnabled: false,
          cragEnabled: false,
          strategies: ["keyword"],
          weights: { keyword: 1.0, semantic: 0, graph: 0 },
        },
      });

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: ハイライト情報が含まれる
      expect(isOk(result)).toBe(true);
      if (isOk(result) && result.data.length > 0) {
        expect(result.data[0].highlights).toBeDefined();
      }
    });
  });

  // ============================================
  // エラーハンドリングテスト
  // ============================================

  describe("エラーハンドリングテスト", () => {
    it("ERR-001: DB接続エラーでResult.errを返す", async () => {
      // Given: 壊れたDB接続
      const brokenStrategy = new KeywordSearchStrategy(null as never);
      const query = createTestSearchQuery("test");

      // When: search()を呼び出す
      const result = await brokenStrategy.search(query);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });

    it("ERR-003: 無効なSearchQueryでResult.errを返す", async () => {
      // Given: 無効なクエリ（型を強制的に破壊）
      const invalidQuery = {
        text: null,
        type: "invalid",
      } as unknown as SearchQuery;

      // When: search()を呼び出す
      const result = await strategy.search(invalidQuery);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });
  });

  // ============================================
  // 性能テスト
  // ============================================

  describe("性能テスト", () => {
    it("PT-001: キーワード検索が100ms以内", async () => {
      // Given: 標準的なクエリ
      const query = createTestSearchQuery("TypeScript");

      // When: search()を実行して時間を計測
      const startTime = performance.now();
      await strategy.search(query);
      const endTime = performance.now();

      // Then: 100ms以内
      expect(endTime - startTime).toBeLessThan(100);
    });

    it("PT-002: フレーズ検索が100ms以内", async () => {
      // Given: フレーズクエリ
      const query = createTestSearchQuery('"full text search"');

      // When: search()を実行して時間を計測
      const startTime = performance.now();
      await strategy.search(query);
      const endTime = performance.now();

      // Then: 100ms以内
      expect(endTime - startTime).toBeLessThan(100);
    });

    it("PT-003: NEAR検索が150ms以内", async () => {
      // Given: NEAR検索
      const startTime = performance.now();
      await strategy.searchNear(["search", "text"], { nearDistance: 5 });
      const endTime = performance.now();

      // Then: 150ms以内
      expect(endTime - startTime).toBeLessThan(150);
    });
  });

  // ============================================
  // 並行処理テスト
  // ============================================

  describe("並行処理テスト", () => {
    it("IT-005: 並行検索の動作確認", async () => {
      // Given: 3つの異なるクエリ
      const queries = [
        createTestSearchQuery("TypeScript"),
        createTestSearchQuery("React"),
        createTestSearchQuery("JavaScript"),
      ];

      // When: 並行で検索を実行
      const results = await Promise.all(queries.map((q) => strategy.search(q)));

      // Then: すべて成功し、データ競合なし
      results.forEach((result) => {
        expect(isOk(result)).toBe(true);
      });
    });
  });
});
