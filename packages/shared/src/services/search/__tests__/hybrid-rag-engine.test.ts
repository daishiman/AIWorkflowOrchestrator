/**
 * @file HybridRAGEngine ユニットテスト
 * @description CONV-07-07 Phase 4: TDD Red - HybridRAGEngineのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createChunkId } from "../../../types/rag/branded";
import { ok, err } from "../../../types/rag/result";
import type { SearchWeights, QueryType } from "../types";
import type { SearchResult, FusedSearchResult } from "../fusion/types";

// =============================================================================
// モック型定義（実装クラスのインターフェースと互換）
// =============================================================================

import type { IQueryClassifier } from "../types";
import type { IFusionStrategy } from "../fusion/types";
import type { IReranker } from "../reranking/types";
import type { ICorrectiveRAG } from "../crag/types";
import type { ISearchStrategy } from "../strategies/types";
import type {
  SearchResultItem,
  StrategyMetric,
} from "../../../types/rag/search/types";

// モック用の簡略化した型定義（テストでの使いやすさのため）
interface MockQueryClassifier extends IQueryClassifier {}

interface MockSearchStrategy extends ISearchStrategy {}

interface MockFusion extends IFusionStrategy {}

interface MockReranker extends IReranker {}

interface MockCorrectiveRAG extends ICorrectiveRAG {}

// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * モック検索結果を生成（SearchResult型 - Fusionで使用）
 * NOTE: 将来のテスト拡張用に保持
 */
function _createMockResults(
  strategy: "keyword" | "semantic" | "graph",
  count: number,
  startScore = 0.9,
): SearchResult[] {
  return Array.from({ length: count }, (_, i) => ({
    chunkId: createChunkId(`${strategy}-chunk-${i}`),
    content: `Content from ${strategy} strategy, item ${i}`,
    score: startScore - i * 0.1,
    source: strategy,
    metadata: { strategy, rank: i + 1 },
  }));
}

/**
 * モック検索結果アイテムを生成（SearchResultItem型 - ISearchStrategy用）
 */
function createMockSearchResultItems(
  strategy: "keyword" | "semantic" | "graph",
  count: number,
  startScore = 0.9,
): SearchResultItem[] {
  return Array.from({ length: count }, (_, i) => ({
    chunkId: createChunkId(`${strategy}-chunk-${i}`),
    content: `Content from ${strategy} strategy, item ${i}`,
    score: startScore - i * 0.1,
    metadata: { strategy, rank: i + 1 },
  }));
}

/**
 * モックFusion結果を生成
 */
function createMockFusedResults(count: number): FusedSearchResult[] {
  return Array.from({ length: count }, (_, i) => ({
    chunkId: createChunkId(`fused-chunk-${i}`),
    content: `Fused content ${i}`,
    fusedScore: 0.9 - i * 0.1,
    sources: [
      { strategy: "keyword" as const, rank: i + 1, score: 0.85 - i * 0.05 },
      { strategy: "semantic" as const, rank: i + 2, score: 0.8 - i * 0.05 },
    ],
    metadata: { fusedRank: i + 1 },
  }));
}

/**
 * デフォルトの検索重み
 */
const DEFAULT_WEIGHTS: Record<QueryType, SearchWeights> = {
  local: { keyword: 0.35, semantic: 0.35, graph: 0.3 },
  global: { keyword: 0.2, semantic: 0.3, graph: 0.5 },
  relationship: { keyword: 0.2, semantic: 0.2, graph: 0.6 },
  hybrid: { keyword: 0.33, semantic: 0.33, graph: 0.34 },
};

/**
 * モックQueryClassifierを生成
 */
function createMockQueryClassifier(
  queryType: QueryType = "local",
  weights?: SearchWeights,
): MockQueryClassifier {
  const resolvedWeights = weights ?? DEFAULT_WEIGHTS[queryType];

  return {
    classify: vi.fn().mockResolvedValue(
      ok({
        type: queryType,
        confidence: 0.9,
        extractedEntities: [],
        keywords: [],
        intent: "test",
      }),
    ),
    getSearchWeights: vi.fn().mockReturnValue(resolvedWeights),
  };
}

/**
 * デフォルトのStrategyMetricを生成
 */
function createDefaultMetric(_name: string): StrategyMetric {
  return {
    searchCount: 0,
    totalDuration: 0,
    averageDuration: 0,
    errorCount: 0,
    lastSearchAt: undefined,
  };
}

/**
 * モックKeywordStrategyを生成
 */
function createMockKeywordStrategy(
  resultCount = 5,
  shouldFail = false,
): MockSearchStrategy {
  return {
    name: "keyword",
    search: vi
      .fn()
      .mockResolvedValue(
        shouldFail
          ? err(new Error("Keyword search failed"))
          : ok(createMockSearchResultItems("keyword", resultCount)),
      ),
    getMetrics: vi.fn().mockReturnValue(createDefaultMetric("keyword")),
  };
}

/**
 * モックSemanticStrategyを生成
 */
function createMockSemanticStrategy(
  resultCount = 5,
  shouldFail = false,
): MockSearchStrategy {
  return {
    name: "semantic",
    search: vi
      .fn()
      .mockResolvedValue(
        shouldFail
          ? err(new Error("Semantic search failed"))
          : ok(createMockSearchResultItems("semantic", resultCount)),
      ),
    getMetrics: vi.fn().mockReturnValue(createDefaultMetric("semantic")),
  };
}

/**
 * モックGraphStrategyを生成
 */
function createMockGraphStrategy(
  resultCount = 5,
  shouldFail = false,
): MockSearchStrategy {
  return {
    name: "graph",
    search: vi
      .fn()
      .mockResolvedValue(
        shouldFail
          ? err(new Error("Graph search failed"))
          : ok(createMockSearchResultItems("graph", resultCount)),
      ),
    getMetrics: vi.fn().mockReturnValue(createDefaultMetric("graph")),
  };
}

/**
 * モックFusionを生成
 */
function createMockFusion(resultCount = 10): MockFusion {
  return {
    fuse: vi.fn().mockReturnValue(createMockFusedResults(resultCount)),
  };
}

/**
 * モックRerankerを生成
 */
function createMockReranker(shouldFail = false): MockReranker {
  return {
    rerank: vi.fn().mockImplementation(async (query, results, limit) => {
      if (shouldFail) {
        return err(new Error("Reranking failed"));
      }
      const reranked = results.slice(0, limit).map((r, i) => ({
        ...r,
        rerankedScore: 0.95 - i * 0.05,
      }));
      return ok(reranked);
    }),
  };
}

/**
 * モックCorrectiveRAGを生成
 */
function createMockCorrectiveRAG(
  action: "correct" | "incorrect" | "ambiguous" = "correct",
  shouldFail = false,
): MockCorrectiveRAG {
  return {
    process: vi.fn().mockImplementation(async (query, results) => {
      if (shouldFail) {
        return err(new Error("CRAG processing failed"));
      }
      return ok({
        results: results.slice(0, 5),
        evaluation: {
          relevanceScore: action === "correct" ? 0.85 : 0.4,
          action,
          corrections: [],
        },
        augmentedContext:
          action === "incorrect"
            ? "Augmented context from web search"
            : undefined,
      });
    }),
  };
}

// =============================================================================
// テスト対象（実装済み）
// =============================================================================

import { HybridRAGEngine } from "../hybrid-rag-engine";
import { HybridRAGFactory } from "../hybrid-rag-factory";

// =============================================================================
// HybridRAGEngine テスト
// =============================================================================

describe("HybridRAGEngine", () => {
  let mockQueryClassifier: MockQueryClassifier;
  let mockKeywordStrategy: MockSearchStrategy;
  let mockSemanticStrategy: MockSearchStrategy;
  let mockGraphStrategy: MockSearchStrategy;
  let mockFusion: MockFusion;
  let mockReranker: MockReranker;
  let mockCRAG: MockCorrectiveRAG;
  let engine: HybridRAGEngine;

  beforeEach(() => {
    mockQueryClassifier = createMockQueryClassifier();
    mockKeywordStrategy = createMockKeywordStrategy();
    mockSemanticStrategy = createMockSemanticStrategy();
    mockGraphStrategy = createMockGraphStrategy();
    mockFusion = createMockFusion();
    mockReranker = createMockReranker();
    mockCRAG = createMockCorrectiveRAG();

    engine = new HybridRAGEngine(
      mockQueryClassifier,
      {
        keyword: mockKeywordStrategy,
        semantic: mockSemanticStrategy,
        graph: mockGraphStrategy,
      },
      mockFusion,
      mockReranker,
      mockCRAG,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("search", () => {
    it("4ステージパイプラインが正常に動作する", async () => {
      // Given: モックが設定されたエンジン

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 成功し、4ステージすべてが実行される
      expect(result.success).toBe(true);
      if (result.success) {
        expect(mockQueryClassifier.classify).toHaveBeenCalledWith("test query");
        expect(mockKeywordStrategy.search).toHaveBeenCalled();
        expect(mockSemanticStrategy.search).toHaveBeenCalled();
        expect(mockGraphStrategy.search).toHaveBeenCalled();
        expect(mockFusion.fuse).toHaveBeenCalled();
        expect(mockReranker.rerank).toHaveBeenCalled();
      }
    });

    it("クエリタイプに応じた重みが適用される", async () => {
      // Given: globalクエリタイプを返すモック
      mockQueryClassifier = createMockQueryClassifier("global");
      engine = new HybridRAGEngine(
        mockQueryClassifier,
        {
          keyword: mockKeywordStrategy,
          semantic: mockSemanticStrategy,
          graph: mockGraphStrategy,
        },
        mockFusion,
        mockReranker,
        mockCRAG,
      );

      // When: 検索を実行
      const result = await engine.search("全体のテーマは？", 10);

      // Then: global用の重みがFusionに渡される
      expect(result.success).toBe(true);
      if (result.success) {
        expect(mockFusion.fuse).toHaveBeenCalledWith(
          expect.any(Map),
          expect.objectContaining({
            keyword: 0.2,
            semantic: 0.3,
            graph: 0.5,
          }),
        );
      }
    });

    it("部分的な検索失敗でも結果を返す", async () => {
      // Given: Keyword検索が失敗するモック
      mockKeywordStrategy = createMockKeywordStrategy(5, true);
      engine = new HybridRAGEngine(
        mockQueryClassifier,
        {
          keyword: mockKeywordStrategy,
          semantic: mockSemanticStrategy,
          graph: mockGraphStrategy,
        },
        mockFusion,
        mockReranker,
        mockCRAG,
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: Semantic/Graphの結果で成功
      expect(result.success).toBe(true);
      expect(mockKeywordStrategy.search).toHaveBeenCalled();
      expect(mockSemanticStrategy.search).toHaveBeenCalled();
      expect(mockGraphStrategy.search).toHaveBeenCalled();
    });

    it("すべての検索が失敗した場合はエラーを返す", async () => {
      // Given: すべての検索戦略が失敗
      mockKeywordStrategy = createMockKeywordStrategy(5, true);
      mockSemanticStrategy = createMockSemanticStrategy(5, true);
      mockGraphStrategy = createMockGraphStrategy(5, true);
      engine = new HybridRAGEngine(
        mockQueryClassifier,
        {
          keyword: mockKeywordStrategy,
          semantic: mockSemanticStrategy,
          graph: mockGraphStrategy,
        },
        mockFusion,
        mockReranker,
        mockCRAG,
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: エラーを返す
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("All search strategies failed");
      }
    });

    it("CRAGが有効な場合は補正が適用される", async () => {
      // Given: CRAG有効のエンジン

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: CRAGが呼び出される
      expect(result.success).toBe(true);
      if (result.success) {
        expect(mockCRAG.process).toHaveBeenCalled();
      }
    });

    it("パイプラインのパフォーマンスメトリクスが記録される", async () => {
      // Given: モックが設定されたエンジン

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: メタデータにパイプラインステージの情報が含まれる
      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as {
          metadata: {
            pipelineStages: Array<{
              stage: string;
              duration: number;
              inputCount: number;
              outputCount: number;
            }>;
            totalDuration: number;
          };
        };
        expect(data.metadata.pipelineStages).toBeDefined();
        expect(data.metadata.pipelineStages.length).toBeGreaterThan(0);
        expect(data.metadata.totalDuration).toBeDefined();
      }
    });
  });

  describe("検索オプション", () => {
    it("limitが正しく適用される", async () => {
      // Given: limit=5で検索

      // When: 検索を実行
      const result = await engine.search("test query", 5);

      // Then: 結果が5件以下
      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as { results: unknown[] };
        expect(data.results.length).toBeLessThanOrEqual(5);
      }
    });

    it("フィルタが検索戦略に渡される", async () => {
      // Given: フィルタ付きの検索
      const filters = { fileIds: ["file-1", "file-2"] };

      // When: 検索を実行
      const result = await engine.search("test query", 10, filters);

      // Then: 各検索戦略にフィルタが渡される（ISearchStrategyは3引数）
      expect(result.success).toBe(true);
      expect(mockKeywordStrategy.search).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        filters,
      );
      expect(mockSemanticStrategy.search).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        filters,
      );
      expect(mockGraphStrategy.search).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        filters,
      );
    });

    it("enableCRAGがfalseの場合CRAGをスキップする", async () => {
      // Given: enableCRAG=falseでの検索

      // When: 検索を実行
      const result = await engine.search("test query", 10, undefined, {
        enableCRAG: false,
      });

      // Then: CRAGが呼び出されない
      expect(result.success).toBe(true);
      expect(mockCRAG.process).not.toHaveBeenCalled();
    });
  });

  describe("境界値テスト", () => {
    it("空のクエリ文字列でエラーを返す", async () => {
      // When: 空文字で検索
      const result = await engine.search("", 10);

      // Then: エラーを返す
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("empty");
      }
    });

    it("limitが0の場合は空の結果を返す", async () => {
      // When: limit=0で検索
      const result = await engine.search("test query", 0);

      // Then: 空の結果
      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as { results: unknown[] };
        expect(data.results).toEqual([]);
      }
    });

    it("limitが100を超える場合は100に制限される", async () => {
      // When: limit=200で検索
      const result = await engine.search("test query", 200);

      // Then: 結果が100件以下
      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as { results: unknown[] };
        expect(data.results.length).toBeLessThanOrEqual(100);
      }
    });

    it("searchLimitMultiplierが0以下の場合はデフォルト値を使用", async () => {
      // When: searchLimitMultiplier=0で検索
      const result = await engine.search("test query", 10, undefined, {
        searchLimitMultiplier: 0,
      });

      // Then: デフォルト倍率（3）で検索が実行される（ISearchStrategyは3引数）
      expect(result.success).toBe(true);
      expect(mockKeywordStrategy.search).toHaveBeenCalledWith(
        expect.any(String),
        30, // 10 * 3 = 30
        undefined,
      );
    });
  });

  describe("null/undefined入力", () => {
    it("filtersがundefinedでも正常動作する", async () => {
      // When: filters=undefinedで検索
      const result = await engine.search("test query", 10, undefined);

      // Then: 正常に動作
      expect(result.success).toBe(true);
    });

    it("searchOptionsがundefinedでも正常動作する", async () => {
      // When: searchOptions=undefinedで検索
      const result = await engine.search(
        "test query",
        10,
        undefined,
        undefined,
      );

      // Then: 正常に動作
      expect(result.success).toBe(true);
    });

    it("cragがnullの場合はCRAGステージをスキップする", async () => {
      // Given: crag=nullのエンジン
      engine = new HybridRAGEngine(
        mockQueryClassifier,
        {
          keyword: mockKeywordStrategy,
          semantic: mockSemanticStrategy,
          graph: mockGraphStrategy,
        },
        mockFusion,
        mockReranker,
        null, // CRAG無効
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: CRAGがスキップされる
      expect(result.success).toBe(true);
    });
  });

  describe("エラーハンドリング", () => {
    it("QueryClassifier失敗時はエラーを返す", async () => {
      // Given: QueryClassifierが失敗
      mockQueryClassifier = {
        classify: vi
          .fn()
          .mockResolvedValue(err(new Error("Classification failed"))),
      };
      engine = new HybridRAGEngine(
        mockQueryClassifier,
        {
          keyword: mockKeywordStrategy,
          semantic: mockSemanticStrategy,
          graph: mockGraphStrategy,
        },
        mockFusion,
        mockReranker,
        mockCRAG,
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: エラーを返す
      expect(result.success).toBe(false);
    });

    it("Reranker失敗時はFusion結果でフォールバック", async () => {
      // Given: Rerankerが失敗
      mockReranker = createMockReranker(true);
      engine = new HybridRAGEngine(
        mockQueryClassifier,
        {
          keyword: mockKeywordStrategy,
          semantic: mockSemanticStrategy,
          graph: mockGraphStrategy,
        },
        mockFusion,
        mockReranker,
        mockCRAG,
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 成功（フォールバック）
      expect(result.success).toBe(true);
    });

    it("CRAG失敗時はReranking結果でフォールバック", async () => {
      // Given: CRAGが失敗
      mockCRAG = createMockCorrectiveRAG("correct", true);
      engine = new HybridRAGEngine(
        mockQueryClassifier,
        {
          keyword: mockKeywordStrategy,
          semantic: mockSemanticStrategy,
          graph: mockGraphStrategy,
        },
        mockFusion,
        mockReranker,
        mockCRAG,
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 成功（フォールバック）
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// HybridRAGFactory テスト
// =============================================================================

describe("HybridRAGFactory", () => {
  describe("createFull", () => {
    it("createFullは依存モジュール未実装のためエラーを投げる", () => {
      // Given: 任意の設定
      const config = {
        db: {},
        embeddingProvider: {},
        graphStore: {},
        llmClient: {},
        rerankerType: "cohere" as const,
      };

      // When/Then: 未実装エラーがスローされる
      expect(() => HybridRAGFactory.createFull(config)).toThrow(
        "createFull() is not yet implemented",
      );
    });
  });

  describe("createLite", () => {
    it("createLiteは依存モジュール未実装のためエラーを投げる", () => {
      // Given: 任意の設定
      const config = {
        db: {},
        embeddingProvider: {},
        graphStore: {},
      };

      // When/Then: 未実装エラーがスローされる
      expect(() => HybridRAGFactory.createLite(config)).toThrow(
        "createLite() is not yet implemented",
      );
    });
  });

  describe("createForTesting", () => {
    it("createForTestingでテスト用エンジンを作成する", () => {
      // Given: モック設定
      const mocks = {
        queryClassifier: createMockQueryClassifier(),
        keywordStrategy: createMockKeywordStrategy(),
        semanticStrategy: createMockSemanticStrategy(),
        graphStrategy: createMockGraphStrategy(),
      };

      // When: createForTestingを呼び出し
      const engine = HybridRAGFactory.createForTesting(mocks);

      // Then: HybridRAGEngineインスタンスが返される
      expect(engine).toBeInstanceOf(HybridRAGEngine);
    });

    it("オプションのモックが指定されない場合はデフォルトを使用", () => {
      // Given: 最小限のモック設定
      const mocks = {
        queryClassifier: createMockQueryClassifier(),
        keywordStrategy: createMockKeywordStrategy(),
        semanticStrategy: createMockSemanticStrategy(),
        graphStrategy: createMockGraphStrategy(),
        // fusion, reranker, crag は指定なし
      };

      // When: createForTestingを呼び出し
      const engine = HybridRAGFactory.createForTesting(mocks);

      // Then: HybridRAGEngineインスタンスが返される
      expect(engine).toBeInstanceOf(HybridRAGEngine);
    });
  });
});
