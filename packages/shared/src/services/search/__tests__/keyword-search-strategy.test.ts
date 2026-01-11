/**
 * KeywordSearchStrategy ユニットテスト
 *
 * @module @repo/shared/services/search/__tests__/keyword-search-strategy
 * @description TDD Red Phase - テストファースト実装
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { KeywordSearchStrategy } from "../keyword-search-strategy";
import { isOk, isErr } from "../../../types/rag/result";
import type {
  SearchQuery,
  SearchFilters,
  SearchOptions,
} from "../../../types/rag/search/types";
import type { SearchResponse } from "../../../db/queries/chunks-search";

// ============================================
// モック設定
// ============================================

vi.mock("../../../db/queries/chunks-search", () => ({
  searchChunksByKeyword: vi.fn(),
  searchChunksByPhrase: vi.fn(),
  searchChunksByNear: vi.fn(),
  normalizeBm25Score: vi.fn((score: number) => 1 / (1 + Math.exp(score * 0.5))),
  escapeFts5Query: vi.fn((query: string) => {
    const escaped = query.replace(/["*^()\-+:{}]/g, "\\$&");
    return escaped.replace(/\b(AND|OR|NOT|NEAR)\b/gi, '"$1"');
  }),
}));

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

/**
 * テスト用SearchResponseを生成
 */
function createMockSearchResponse(
  results: Array<{ id: string; content: string; score: number }>,
): SearchResponse {
  return {
    results: results.map((r) => ({
      id: r.id,
      fileId: "file-001",
      content: r.content,
      contextualContent: null,
      parentHeader: null,
      chunkIndex: 0,
      score: r.score,
      highlightedContent: "<mark>" + r.content + "</mark>",
    })),
    totalCount: results.length,
    query: "test",
    pagination: {
      limit: 20,
      offset: 0,
      hasMore: false,
    },
  };
}

// ============================================
// テストスイート
// ============================================

describe("KeywordSearchStrategy", () => {
  let strategy: KeywordSearchStrategy;
  let mockDb: unknown;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {};
    strategy = new KeywordSearchStrategy(mockDb as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================
  // search() メソッドのテスト
  // ============================================

  describe("search()", () => {
    it("UT-001: キーワード検索で関連するチャンクを返す", async () => {
      // Given: テストデータが投入されている
      const { searchChunksByKeyword } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByKeyword).mockResolvedValue(
        createMockSearchResponse([
          { id: "chunk-001", content: "TypeScript is great", score: 0.85 },
        ]),
      );

      const query = createTestSearchQuery("TypeScript");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: 関連するSearchResultItem[]が返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].content.text).toContain("TypeScript");
        expect(result.data[0].score).toBeGreaterThan(0);
        expect(result.data[0].score).toBeLessThanOrEqual(1);
      }
    });

    it("UT-002: 複数キーワードOR検索", async () => {
      // Given: 複数キーワードで検索
      const { searchChunksByKeyword } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByKeyword).mockResolvedValue(
        createMockSearchResponse([
          { id: "chunk-001", content: "React components", score: 0.8 },
          { id: "chunk-002", content: "Vue framework", score: 0.75 },
        ]),
      );

      const query = createTestSearchQuery("React Vue");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: 両方にマッチするチャンクが返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("UT-003: フレーズ検索（完全一致）", async () => {
      // Given: フレーズ検索モード
      const { searchChunksByPhrase } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByPhrase).mockResolvedValue(
        createMockSearchResponse([
          { id: "chunk-001", content: "full text search", score: 0.9 },
        ]),
      );

      const query = createTestSearchQuery('"full text search"');

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: 完全一致のみ返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(1);
      }
    });

    it("UT-005: 空のクエリでは空配列を返す", async () => {
      // Given: 空のSearchQuery
      const query = createTestSearchQuery("");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: 空配列が返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(0);
      }
    });

    it("UT-006: 空白のみクエリでは空配列を返す", async () => {
      // Given: 空白のみのクエリ
      const query = createTestSearchQuery("   ");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: 空配列が返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(0);
      }
    });

    it("UT-007: マッチするチャンクがない場合は空配列を返す", async () => {
      // Given: マッチしないクエリ
      const { searchChunksByKeyword } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByKeyword).mockResolvedValue(
        createMockSearchResponse([]),
      );

      const query = createTestSearchQuery("xyznonexistent12345");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: 空配列が返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(0);
      }
    });

    it("UT-008: limit/offsetによるページネーション", async () => {
      // Given: limit/offset指定
      const { searchChunksByKeyword } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByKeyword).mockResolvedValue({
        ...createMockSearchResponse([
          { id: "chunk-010", content: "Result 10", score: 0.7 },
          { id: "chunk-011", content: "Result 11", score: 0.65 },
        ]),
        pagination: { limit: 5, offset: 10, hasMore: true },
      });

      const query = createTestSearchQuery("test", {
        options: {
          limit: 5,
          offset: 10,
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

      // Then: 指定件数のみ返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBeLessThanOrEqual(5);
      }
    });

    it("UT-009: fileIdフィルタで特定ファイルのみ検索", async () => {
      // Given: fileIdフィルタ指定
      const { searchChunksByKeyword } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByKeyword).mockResolvedValue(
        createMockSearchResponse([
          { id: "chunk-001", content: "File 1 content", score: 0.8 },
        ]),
      );

      const query = createTestSearchQuery("test", {
        filters: {
          fileIds: ["file-001" as never],
          entityTypes: null,
          dateRange: null,
          minRelevance: 0,
        },
      });

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: 特定ファイルのチャンクのみ
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.every((r) => r.sources.fileId === "file-001")).toBe(
          true,
        );
      }
    });

    it("UT-010: 日本語キーワード検索", async () => {
      // Given: 日本語クエリ
      const { searchChunksByKeyword } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByKeyword).mockResolvedValue(
        createMockSearchResponse([
          { id: "chunk-003", content: "日本語の検索テスト", score: 0.85 },
        ]),
      );

      const query = createTestSearchQuery("検索クエリ");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: 日本語コンテンツがマッチ
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  // ============================================
  // normalizeScore() メソッドのテスト
  // ============================================

  describe("normalizeScore()", () => {
    it("UT-011: BM25スコア0を中央値付近に正規化", () => {
      // Given: BM25スコア0（中程度の関連性）
      // When: normalizeScore()を呼び出す
      const score = strategy.normalizeScore(0);

      // Then: 0.5付近の値
      expect(score).toBeCloseTo(0.5, 1);
    });

    it("UT-012: 負のBM25スコアを高い正規化スコアに変換", () => {
      // Given: 負のBM25スコア（高い関連性）
      // When: normalizeScore()を呼び出す
      const score = strategy.normalizeScore(-10);

      // Then: 0.5より大きい値
      expect(score).toBeGreaterThan(0.5);
    });

    it("UT-013: 大きい負のBM25スコアは1に近づく", () => {
      // Given: 大きい負のBM25スコア（非常に高い関連性）
      // When: normalizeScore()を呼び出す
      const score = strategy.normalizeScore(-20);

      // Then: 1に近い値
      expect(score).toBeGreaterThan(0.9);
    });

    it("UT-014: scaleFactor=0.5でシグモイド正規化", () => {
      // Given: BM25スコア-2.5
      const rawScore = -2.5;
      const scaleFactor = 0.5;

      // When: normalizeScore()を呼び出す
      const score = strategy.normalizeScore(rawScore, scaleFactor);

      // Then: シグモイド関数の結果
      const expected = 1 / (1 + Math.exp(rawScore * scaleFactor));
      expect(score).toBeCloseTo(expected, 4);
    });
  });

  // ============================================
  // buildFTS5Query() メソッドのテスト
  // ============================================

  describe("buildFTS5Query()", () => {
    it("UT-015: 単一キーワードをFTS5クエリに変換", () => {
      // Given: 単一キーワード
      // When: buildFTS5Query()を呼び出す
      const fts5Query = strategy.buildFTS5Query("TypeScript");

      // Then: そのまま返される
      expect(fts5Query).toBe("TypeScript");
    });

    it("UT-016: 複数キーワードをOR検索クエリに変換", () => {
      // Given: 複数キーワード
      // When: buildFTS5Query()を呼び出す
      const fts5Query = strategy.buildFTS5Query("React Vue");

      // Then: OR検索形式
      expect(fts5Query).toContain("React");
      expect(fts5Query).toContain("Vue");
    });

    it("UT-017: FTS5特殊文字をエスケープ", () => {
      // Given: 特殊文字を含むクエリ
      // When: buildFTS5Query()を呼び出す
      const fts5Query = strategy.buildFTS5Query('hello "world"');

      // Then: エスケープされる
      expect(fts5Query).not.toContain('"world"');
    });

    it("UT-018: SQLインジェクション文字をエスケープ", () => {
      // Given: SQLインジェクション文字
      // When: buildFTS5Query()を呼び出す
      const fts5Query = strategy.buildFTS5Query("'; DROP TABLE --");

      // Then: 特殊文字がエスケープされる（シングルクォートとダッシュ）
      // FTS5では "DROP" は予約語ではないので変換されない
      expect(fts5Query).toContain("\\-\\-"); // ダッシュがエスケープされる
    });

    it("UT-019: FTS5予約語をクォート", () => {
      // Given: FTS5予約語
      // When: buildFTS5Query()を呼び出す
      const fts5Query = strategy.buildFTS5Query("AND OR NOT");

      // Then: クォートされる
      expect(fts5Query).toMatch(/"AND"|"OR"|"NOT"/);
    });
  });

  // ============================================
  // toSearchResultItem() メソッドのテスト
  // ============================================

  describe("toSearchResultItem()", () => {
    it("UT-020: FtsSearchResultをSearchResultItemに正しく変換", () => {
      // Given: FtsSearchResult
      const ftsResult = {
        id: "chunk-001",
        fileId: "file-001",
        content: "Test content",
        contextualContent: "Context",
        parentHeader: "Header",
        chunkIndex: 0,
        score: 0.85,
        highlightedContent: "<mark>Test</mark> content",
      };

      // When: toSearchResultItem()を呼び出す
      const item = strategy.toSearchResultItem(ftsResult);

      // Then: 正しく変換される
      expect(item.id).toBe("chunk-001");
      expect(item.type).toBe("chunk");
      expect(item.score).toBe(0.85);
      expect(item.content.text).toBe("Test content");
    });

    it("UT-021: スコアが0-1範囲に収まる", () => {
      // Given: 任意のFtsSearchResult
      const ftsResult = {
        id: "chunk-001",
        fileId: "file-001",
        content: "Test",
        contextualContent: null,
        parentHeader: null,
        chunkIndex: 0,
        score: 0.95,
        highlightedContent: "Test",
      };

      // When: toSearchResultItem()を呼び出す
      const item = strategy.toSearchResultItem(ftsResult);

      // Then: スコアは0-1範囲
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(1);
    });

    it("UT-022: ハイライト情報が正しく変換される", () => {
      // Given: ハイライト付きFtsSearchResult
      const ftsResult = {
        id: "chunk-001",
        fileId: "file-001",
        content: "Test content with highlight",
        contextualContent: null,
        parentHeader: null,
        chunkIndex: 0,
        score: 0.8,
        highlightedContent: "<mark>Test</mark> content with highlight",
      };

      // When: toSearchResultItem()を呼び出す
      const item = strategy.toSearchResultItem(ftsResult);

      // Then: ハイライト情報が存在する
      expect(item.highlights).toBeDefined();
      expect(item.highlights.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // 境界値テスト
  // ============================================

  describe("境界値テスト", () => {
    it("UT-023: 1文字クエリ", async () => {
      // Given: 1文字クエリ
      const { searchChunksByKeyword } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByKeyword).mockResolvedValue(
        createMockSearchResponse([
          { id: "chunk-001", content: "a test", score: 0.5 },
        ]),
      );

      const query = createTestSearchQuery("a");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: 正常に検索される
      expect(isOk(result)).toBe(true);
    });

    it("UT-024: 最大長（1000文字）クエリ", async () => {
      // Given: 1000文字のクエリ
      const { searchChunksByKeyword } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByKeyword).mockResolvedValue(
        createMockSearchResponse([]),
      );

      const longQuery = "a".repeat(1000);
      const query = createTestSearchQuery(longQuery);

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: 正常に検索される
      expect(isOk(result)).toBe(true);
    });

    it("UT-025: 超過（1001文字）クエリでバリデーションエラー", async () => {
      // Given: 1001文字のクエリ
      const longQuery = "a".repeat(1001);
      const query = createTestSearchQuery(longQuery);

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: バリデーションエラー
      expect(isErr(result)).toBe(true);
    });

    it("UT-026: 特殊文字のみ", async () => {
      // Given: 特殊文字のみ
      const { searchChunksByKeyword } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByKeyword).mockResolvedValue(
        createMockSearchResponse([]),
      );

      const query = createTestSearchQuery("!@#$%^&*");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: エスケープされて検索（空配列も許容）
      expect(isOk(result)).toBe(true);
    });

    it("UT-027: Unicode絵文字", async () => {
      // Given: Unicode絵文字を含むクエリ
      const { searchChunksByKeyword } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByKeyword).mockResolvedValue(
        createMockSearchResponse([]),
      );

      const query = createTestSearchQuery("検索🔍テスト");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: 正常に検索される
      expect(isOk(result)).toBe(true);
    });
  });

  // ============================================
  // エラーハンドリングテスト
  // ============================================

  describe("エラーハンドリング", () => {
    it("UT-028: DB接続エラー時にResult.errを返す", async () => {
      // Given: DBエラー
      const { searchChunksByKeyword } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByKeyword).mockRejectedValue(
        new Error("Connection failed"),
      );

      const query = createTestSearchQuery("test");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });

    it("UT-029: タイムアウト時にResult.errを返す", async () => {
      // Given: タイムアウト
      const { searchChunksByKeyword } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByKeyword).mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 100),
          ),
      );

      const query = createTestSearchQuery("test");

      // When: search()を呼び出す
      const result = await strategy.search(query);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });
  });

  // ============================================
  // メタ情報メソッドのテスト
  // ============================================

  describe("getStrategyName()", () => {
    it("戦略名'keyword'を返す", () => {
      expect(strategy.getStrategyName()).toBe("keyword");
    });
  });

  describe("getMetrics()", () => {
    it("メトリクスオブジェクトを返す", () => {
      const metrics = strategy.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.enabled).toBeDefined();
      expect(metrics.resultCount).toBeDefined();
      expect(metrics.processingTime).toBeDefined();
    });
  });
  // ============================================
  // searchNear() メソッドのテスト
  // ============================================

  describe("searchNear()", () => {
    it("UT-004: NEAR検索で近接キーワードを返す", async () => {
      // Given: 2つ以上のキーワード
      const { searchChunksByNear } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByNear).mockResolvedValue({
        results: [
          {
            id: "chunk-001",
            fileId: "file-001",
            content: "Near search finds words within proximity",
            contextualContent: null,
            parentHeader: null,
            chunkIndex: 0,
            score: 0.85,
            highlightedContent:
              "<mark>Near</mark> search finds <mark>words</mark> within proximity",
          },
        ],
        totalCount: 1,
        query: 'NEAR("search" "words", 5)',
        pagination: { limit: 20, offset: 0, hasMore: false },
      });

      // When: searchNear()を呼び出す
      const result = await strategy.searchNear(["search", "words"], {
        nearDistance: 5,
      });

      // Then: 近接するチャンクが返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("NEAR検索: キーワードが2つ未満の場合はエラー", async () => {
      // Given: キーワード1つのみ
      // When: searchNear()を呼び出す
      const result = await strategy.searchNear(["only_one"]);

      // Then: バリデーションエラー
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe("validation");
      }
    });

    it("NEAR検索: DB接続エラー時にResult.errを返す", async () => {
      // Given: DBエラー
      const { searchChunksByNear } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByNear).mockRejectedValue(
        new Error("Connection failed"),
      );

      // When: searchNear()を呼び出す
      const result = await strategy.searchNear(["word1", "word2"]);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe("database");
      }
    });

    it("NEAR検索: オプションのデフォルト値を適用", async () => {
      // Given: オプション未指定
      const { searchChunksByNear } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByNear).mockResolvedValue({
        results: [],
        totalCount: 0,
        query: 'NEAR("word1" "word2", 5)',
        pagination: { limit: 20, offset: 0, hasMore: false },
      });

      // When: searchNear()をオプション無しで呼び出す
      const result = await strategy.searchNear(["word1", "word2"]);

      // Then: 成功
      expect(isOk(result)).toBe(true);
      expect(searchChunksByNear).toHaveBeenCalledWith(
        expect.anything(),
        ["word1", "word2"],
        expect.objectContaining({
          nearDistance: 5,
          limit: 20,
          offset: 0,
        }),
      );
    });

    it("NEAR検索: カスタムオプションを適用", async () => {
      // Given: カスタムオプション
      const { searchChunksByNear } =
        await import("../../../db/queries/chunks-search");
      vi.mocked(searchChunksByNear).mockResolvedValue({
        results: [],
        totalCount: 0,
        query: 'NEAR("word1" "word2", 10)',
        pagination: { limit: 10, offset: 5, hasMore: false },
      });

      // When: searchNear()をカスタムオプション付きで呼び出す
      const result = await strategy.searchNear(["word1", "word2"], {
        nearDistance: 10,
        limit: 10,
        offset: 5,
        fileId: "file-001",
      });

      // Then: 成功
      expect(isOk(result)).toBe(true);
      expect(searchChunksByNear).toHaveBeenCalledWith(
        expect.anything(),
        ["word1", "word2"],
        expect.objectContaining({
          nearDistance: 10,
          limit: 10,
          offset: 5,
          fileId: "file-001",
        }),
      );
    });
  });
});
