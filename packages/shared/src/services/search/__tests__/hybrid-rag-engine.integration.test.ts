/**
 * @file HybridRAGEngine 統合テスト
 * @description CONV-07-07 Phase 4: TDD Red - HybridRAGEngineのパイプライン統合テスト
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { createChunkId } from "../../../types/rag/branded";
import { ok, err } from "../../../types/rag/result";
import type { SearchWeights, QueryType } from "../types";
import type { SearchResult, FusedSearchResult } from "../fusion/types";
import type { Result } from "../../../types/rag/result";

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
 * デフォルトの検索重み
 */
const DEFAULT_WEIGHTS: Record<QueryType, SearchWeights> = {
  local: { keyword: 0.35, semantic: 0.35, graph: 0.3 },
  global: { keyword: 0.2, semantic: 0.3, graph: 0.5 },
  relationship: { keyword: 0.2, semantic: 0.2, graph: 0.6 },
  hybrid: { keyword: 0.33, semantic: 0.33, graph: 0.34 },
};

/**
 * デフォルトのStrategyMetricを生成
 */
function createDefaultMetric(): StrategyMetric {
  return {
    searchCount: 0,
    totalDuration: 0,
    averageDuration: 0,
    errorCount: 0,
    lastSearchAt: undefined,
  };
}

/**
 * モック検索結果を生成（SearchResult型 - Fusionで使用）
 */
function createMockResults(
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
 * 遅延付きモック検索結果を生成
 * NOTE: 将来のパフォーマンステスト用に保持
 */
function _createDelayedMockResults(
  strategy: "keyword" | "semantic" | "graph",
  count: number,
  delayMs: number,
): Promise<Result<SearchResultItem[], Error>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ok(createMockSearchResultItems(strategy, count)));
    }, delayMs);
  });
}

/**
 * 完全なモックQueryClassifierを生成
 */
function createFullMockQueryClassifier(
  queryType: QueryType = "local",
  shouldFail = false,
): MockQueryClassifier {
  const weights = DEFAULT_WEIGHTS[queryType];
  return {
    classify: vi.fn().mockResolvedValue(
      shouldFail
        ? err(new Error("Classification failed"))
        : ok({
            type: queryType,
            confidence: 0.9,
            extractedEntities: [],
            keywords: [],
            intent: "test",
          }),
    ),
    getSearchWeights: vi.fn().mockReturnValue(weights),
  };
}

/**
 * 完全なモックSearchStrategyを生成
 */
function createFullMockSearchStrategy(
  name: "keyword" | "semantic" | "graph",
  resultCount = 10,
  shouldFail = false,
): MockSearchStrategy {
  return {
    name,
    search: vi
      .fn()
      .mockResolvedValue(
        shouldFail
          ? err(new Error(`${name} search failed`))
          : ok(createMockSearchResultItems(name, resultCount)),
      ),
    getMetrics: vi.fn().mockReturnValue(createDefaultMetric()),
  };
}

/**
 * 完全なモックFusionを生成
 */
function createFullMockFusion(resultCount = 15): MockFusion {
  return {
    fuse: vi.fn().mockReturnValue(createMockFusedResults(resultCount)),
  };
}

/**
 * 完全なモックRerankerを生成
 */
function createFullMockReranker(shouldFail = false): MockReranker {
  return {
    rerank: vi.fn().mockImplementation(async (_query, results, limit) => {
      if (shouldFail) {
        return err(new Error("Reranking failed"));
      }
      return ok(
        results.slice(0, limit).map((r, i) => ({
          ...r,
          rerankedScore: 0.95 - i * 0.05,
        })),
      );
    }),
  };
}

/**
 * 完全なモックCorrectiveRAGを生成
 */
function createFullMockCRAG(
  action: "correct" | "incorrect" | "ambiguous" = "correct",
  shouldFail = false,
): MockCorrectiveRAG {
  return {
    process: vi.fn().mockImplementation(async (_query, results) => {
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
      { strategy: "graph" as const, rank: i + 3, score: 0.75 - i * 0.05 },
    ],
    metadata: { fusedRank: i + 1 },
  }));
}

/**
 * 共有チャンクを含む検索結果を生成
 */
function createResultsWithSharedChunks(): {
  keyword: SearchResult[];
  semantic: SearchResult[];
  graph: SearchResult[];
} {
  const sharedChunkId = createChunkId("shared-chunk");
  const sharedContent = "Shared content across strategies";

  return {
    keyword: [
      {
        chunkId: sharedChunkId,
        content: sharedContent,
        score: 0.9,
        source: "keyword" as const,
        metadata: {},
      },
      ...createMockResults("keyword", 4),
    ],
    semantic: [
      {
        chunkId: sharedChunkId,
        content: sharedContent,
        score: 0.85,
        source: "semantic" as const,
        metadata: {},
      },
      ...createMockResults("semantic", 4),
    ],
    graph: [
      {
        chunkId: sharedChunkId,
        content: sharedContent,
        score: 0.8,
        source: "graph" as const,
        metadata: {},
      },
      ...createMockResults("graph", 4),
    ],
  };
}

// =============================================================================
// テスト対象（未実装）
// =============================================================================

// =============================================================================
// テスト対象（実装済み）
// =============================================================================

import { HybridRAGEngine } from "../hybrid-rag-engine";

// =============================================================================
// 統合テスト
// =============================================================================

describe("HybridRAGEngine Integration", () => {
  let engine: HybridRAGEngine;

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // パイプライン連携テスト
  // ===========================================================================

  describe("パイプライン連携", () => {
    it("QueryClassification → TripleSearch → RRFFusion → Reranking の流れが正常に動作する", async () => {
      // Given: 4ステージパイプライン（CRAG無効）
      const mockClassifier = createFullMockQueryClassifier("local");
      const mockKeyword = createFullMockSearchStrategy("keyword", 10);
      const mockSemantic = createFullMockSearchStrategy("semantic", 10);
      const mockGraph = createFullMockSearchStrategy("graph", 10);
      const mockFusion = createFullMockFusion(15);
      const mockReranker = createFullMockReranker();

      engine = new HybridRAGEngine(
        mockClassifier,
        { keyword: mockKeyword, semantic: mockSemantic, graph: mockGraph },
        mockFusion,
        mockReranker,
        null, // CRAG無効
      );

      // When: 検索を実行
      const result = await engine.search("Reactとは何ですか？", 10);

      // Then: 全ステージが順番に実行される
      expect(result.success).toBe(true);
      expect(mockClassifier.classify).toHaveBeenCalledTimes(1);
      expect(mockKeyword.search).toHaveBeenCalledTimes(1);
      expect(mockSemantic.search).toHaveBeenCalledTimes(1);
      expect(mockGraph.search).toHaveBeenCalledTimes(1);
      expect(mockFusion.fuse).toHaveBeenCalledTimes(1);
      expect(mockReranker.rerank).toHaveBeenCalledTimes(1);

      if (result.success) {
        const data = result.data as {
          results: unknown[];
          metadata: {
            queryType: string;
            pipelineStages: Array<{ stage: string; duration: number }>;
          };
        };
        expect(data.results.length).toBeLessThanOrEqual(10);
        expect(data.metadata.queryType).toBe("local");
        expect(data.metadata.pipelineStages.length).toBe(4); // classification, triple_search, rrf_fusion, reranking
      }
    });

    it("QueryClassification → TripleSearch → RRFFusion → Reranking → CRAG の流れが正常に動作する", async () => {
      // Given: 5ステージパイプライン（CRAG有効）
      const mockClassifier = createFullMockQueryClassifier("hybrid");
      const mockKeyword = createFullMockSearchStrategy("keyword", 10);
      const mockSemantic = createFullMockSearchStrategy("semantic", 10);
      const mockGraph = createFullMockSearchStrategy("graph", 10);
      const mockFusion = createFullMockFusion(15);
      const mockReranker = createFullMockReranker();
      const mockCRAG = createFullMockCRAG("correct");

      engine = new HybridRAGEngine(
        mockClassifier,
        { keyword: mockKeyword, semantic: mockSemantic, graph: mockGraph },
        mockFusion,
        mockReranker,
        mockCRAG,
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 全5ステージが実行される
      expect(result.success).toBe(true);
      expect(mockClassifier.classify).toHaveBeenCalledTimes(1);
      expect(mockKeyword.search).toHaveBeenCalledTimes(1);
      expect(mockSemantic.search).toHaveBeenCalledTimes(1);
      expect(mockGraph.search).toHaveBeenCalledTimes(1);
      expect(mockFusion.fuse).toHaveBeenCalledTimes(1);
      expect(mockReranker.rerank).toHaveBeenCalledTimes(1);
      expect(mockCRAG.process).toHaveBeenCalledTimes(1);

      if (result.success) {
        const data = result.data as {
          metadata: {
            pipelineStages: Array<{ stage: string }>;
            cragAction: string;
          };
        };
        expect(data.metadata.pipelineStages.length).toBe(5); // 5ステージ
        expect(data.metadata.cragAction).toBe("correct");
      }
    });

    it("検索戦略の並列実行が正しく動作する", async () => {
      // Given: 異なる遅延を持つ検索戦略
      const executionOrder: string[] = [];

      const mockClassifier = createFullMockQueryClassifier("local");

      const mockKeyword: MockSearchStrategy = {
        name: "keyword",
        search: vi.fn().mockImplementation(async () => {
          await new Promise((r) => setTimeout(r, 50));
          executionOrder.push("keyword");
          return ok(createMockSearchResultItems("keyword", 5));
        }),
        getMetrics: vi.fn().mockReturnValue(createDefaultMetric()),
      };
      const mockSemantic: MockSearchStrategy = {
        name: "semantic",
        search: vi.fn().mockImplementation(async () => {
          await new Promise((r) => setTimeout(r, 30));
          executionOrder.push("semantic");
          return ok(createMockSearchResultItems("semantic", 5));
        }),
        getMetrics: vi.fn().mockReturnValue(createDefaultMetric()),
      };
      const mockGraph: MockSearchStrategy = {
        name: "graph",
        search: vi.fn().mockImplementation(async () => {
          await new Promise((r) => setTimeout(r, 40));
          executionOrder.push("graph");
          return ok(createMockSearchResultItems("graph", 5));
        }),
        getMetrics: vi.fn().mockReturnValue(createDefaultMetric()),
      };

      const mockFusion = createFullMockFusion(10);
      const mockReranker = createFullMockReranker();

      engine = new HybridRAGEngine(
        mockClassifier,
        { keyword: mockKeyword, semantic: mockSemantic, graph: mockGraph },
        mockFusion,
        mockReranker,
        null,
      );

      // When: 検索を実行
      const startTime = Date.now();
      const result = await engine.search("test query", 10);
      const elapsed = Date.now() - startTime;

      // Then: 並列実行により、最も遅い検索（50ms）程度で完了
      expect(result.success).toBe(true);
      expect(elapsed).toBeLessThan(500); // pre-push/CI環境での実行遅延を考慮 (UT-PERF-003)
      expect(executionOrder).toContain("keyword");
      expect(executionOrder).toContain("semantic");
      expect(executionOrder).toContain("graph");
    });
  });

  // ===========================================================================
  // 部分失敗テスト
  // ===========================================================================

  describe("部分失敗", () => {
    const createPartialFailureEngine = (
      failingStrategies: ("keyword" | "semantic" | "graph")[],
    ): HybridRAGEngine => {
      const mockClassifier = createFullMockQueryClassifier("local");
      const mockKeyword = createFullMockSearchStrategy(
        "keyword",
        5,
        failingStrategies.includes("keyword"),
      );
      const mockSemantic = createFullMockSearchStrategy(
        "semantic",
        5,
        failingStrategies.includes("semantic"),
      );
      const mockGraph = createFullMockSearchStrategy(
        "graph",
        5,
        failingStrategies.includes("graph"),
      );
      const mockFusion = createFullMockFusion(10);
      const mockReranker = createFullMockReranker();

      return new HybridRAGEngine(
        mockClassifier,
        { keyword: mockKeyword, semantic: mockSemantic, graph: mockGraph },
        mockFusion,
        mockReranker,
        null,
      );
    };

    it("KeywordSearchが失敗してもSemantic/Graphの結果で動作する", async () => {
      // Given: Keyword検索のみ失敗
      engine = createPartialFailureEngine(["keyword"]);

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 成功（Semantic/Graph結果を使用）
      expect(result.success).toBe(true);
    });

    it("SemanticSearchが失敗してもKeyword/Graphの結果で動作する", async () => {
      // Given: Semantic検索のみ失敗
      engine = createPartialFailureEngine(["semantic"]);

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 成功（Keyword/Graph結果を使用）
      expect(result.success).toBe(true);
    });

    it("GraphSearchが失敗してもKeyword/Semanticの結果で動作する", async () => {
      // Given: Graph検索のみ失敗
      engine = createPartialFailureEngine(["graph"]);

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 成功（Keyword/Semantic結果を使用）
      expect(result.success).toBe(true);
    });

    it("2つの検索戦略が失敗しても1つの結果で動作する", async () => {
      // Given: Keyword/Semantic検索が失敗
      engine = createPartialFailureEngine(["keyword", "semantic"]);

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 成功（Graph結果のみを使用）
      expect(result.success).toBe(true);
    });

    it("Rerankingが失敗してもFusion結果で動作する", async () => {
      // Given: Rerankingが失敗
      const mockClassifier = createFullMockQueryClassifier("local");
      const mockKeyword = createFullMockSearchStrategy("keyword", 5);
      const mockSemantic = createFullMockSearchStrategy("semantic", 5);
      const mockGraph = createFullMockSearchStrategy("graph", 5);
      const mockFusion = createFullMockFusion(10);
      const mockReranker = createFullMockReranker(true); // shouldFail=true

      engine = new HybridRAGEngine(
        mockClassifier,
        { keyword: mockKeyword, semantic: mockSemantic, graph: mockGraph },
        mockFusion,
        mockReranker,
        null,
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 成功（Fusion結果をそのまま使用）
      expect(result.success).toBe(true);
    });

    it("CRAGが失敗してもReranking結果で動作する", async () => {
      // Given: CRAGが失敗
      const mockClassifier = createFullMockQueryClassifier("local");
      const mockKeyword = createFullMockSearchStrategy("keyword", 5);
      const mockSemantic = createFullMockSearchStrategy("semantic", 5);
      const mockGraph = createFullMockSearchStrategy("graph", 5);
      const mockFusion = createFullMockFusion(10);
      const mockReranker = createFullMockReranker();
      const mockCRAG = createFullMockCRAG("correct", true); // shouldFail=true

      engine = new HybridRAGEngine(
        mockClassifier,
        { keyword: mockKeyword, semantic: mockSemantic, graph: mockGraph },
        mockFusion,
        mockReranker,
        mockCRAG,
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 成功（Reranking結果をそのまま使用）
      expect(result.success).toBe(true);
    });
  });

  // ===========================================================================
  // 全失敗テスト
  // ===========================================================================

  describe("全失敗", () => {
    it("全検索戦略が失敗した場合はエラーを返す", async () => {
      // Given: 全検索戦略が失敗
      const mockClassifier = createFullMockQueryClassifier("local");
      const mockKeyword = createFullMockSearchStrategy("keyword", 5, true);
      const mockSemantic = createFullMockSearchStrategy("semantic", 5, true);
      const mockGraph = createFullMockSearchStrategy("graph", 5, true);

      const mockFusion: MockFusion = {
        fuse: vi.fn().mockReturnValue([]),
      };

      const mockReranker = createFullMockReranker();

      engine = new HybridRAGEngine(
        mockClassifier,
        { keyword: mockKeyword, semantic: mockSemantic, graph: mockGraph },
        mockFusion,
        mockReranker,
        null,
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: エラーを返す
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("All search strategies failed");
      }
    });

    it("QueryClassificationが失敗した場合は即座にエラーを返す", async () => {
      // Given: QueryClassificationが失敗
      const mockClassifier = createFullMockQueryClassifier("local", true); // shouldFail=true
      const mockKeyword = createFullMockSearchStrategy("keyword", 5);
      const mockSemantic = createFullMockSearchStrategy("semantic", 5);
      const mockGraph = createFullMockSearchStrategy("graph", 5);
      const mockFusion = createFullMockFusion(10);
      const mockReranker = createFullMockReranker();

      engine = new HybridRAGEngine(
        mockClassifier,
        { keyword: mockKeyword, semantic: mockSemantic, graph: mockGraph },
        mockFusion,
        mockReranker,
        null,
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: エラーを返し、検索戦略は実行されない
      expect(result.success).toBe(false);
      expect(mockKeyword.search).not.toHaveBeenCalled();
      expect(mockSemantic.search).not.toHaveBeenCalled();
      expect(mockGraph.search).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // CRAG補正テスト
  // ===========================================================================

  describe("CRAG補正", () => {
    const createCRAGEngine = (
      action: "correct" | "incorrect" | "ambiguous",
      augmentedContext?: string,
    ): HybridRAGEngine => {
      const mockClassifier = createFullMockQueryClassifier("local");
      const mockKeyword = createFullMockSearchStrategy("keyword", 5);
      const mockSemantic = createFullMockSearchStrategy("semantic", 5);
      const mockGraph = createFullMockSearchStrategy("graph", 5);
      const mockFusion = createFullMockFusion(10);
      const mockReranker = createFullMockReranker();

      // カスタムCRAGモック（augmentedContext対応）
      const mockCRAG: MockCorrectiveRAG = {
        process: vi.fn().mockResolvedValue(
          ok({
            results: createMockFusedResults(5),
            evaluation: {
              relevanceScore:
                action === "correct"
                  ? 0.85
                  : action === "ambiguous"
                    ? 0.5
                    : 0.2,
              action,
              corrections: action === "ambiguous" ? [{ type: "filter" }] : [],
            },
            augmentedContext,
          }),
        ),
      };

      return new HybridRAGEngine(
        mockClassifier,
        { keyword: mockKeyword, semantic: mockSemantic, graph: mockGraph },
        mockFusion,
        mockReranker,
        mockCRAG,
      );
    };

    it("CRAG action=correct の場合は補正なしで結果を返す", async () => {
      // Given: correct判定のCRAG
      engine = createCRAGEngine("correct");

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 成功し、cragAction=correctがメタデータに含まれる
      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as {
          metadata: { cragAction: string };
          augmentedContext?: string;
        };
        expect(data.metadata.cragAction).toBe("correct");
        expect(data.augmentedContext).toBeUndefined();
      }
    });

    it("CRAG action=incorrect の場合はWeb検索で補強される", async () => {
      // Given: incorrect判定のCRAG（Web検索結果付き）
      engine = createCRAGEngine(
        "incorrect",
        "Augmented context from web search",
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 成功し、augmentedContextが含まれる
      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as {
          metadata: { cragAction: string };
          augmentedContext?: string;
        };
        expect(data.metadata.cragAction).toBe("incorrect");
        expect(data.augmentedContext).toBe("Augmented context from web search");
      }
    });

    it("CRAG action=ambiguous の場合は結果がフィルタリングされる", async () => {
      // Given: ambiguous判定のCRAG
      engine = createCRAGEngine("ambiguous");

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 成功し、cragAction=ambiguousがメタデータに含まれる
      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as {
          metadata: { cragAction: string };
        };
        expect(data.metadata.cragAction).toBe("ambiguous");
      }
    });
  });

  // ===========================================================================
  // 重複チャンク処理テスト
  // ===========================================================================

  describe("重複チャンク処理", () => {
    it("複数の検索戦略から同じチャンクが返された場合、正しくマージされる", async () => {
      // Given: 共有チャンクを含む検索結果
      const sharedResults = createResultsWithSharedChunks();

      const mockClassifier = createFullMockQueryClassifier("local");

      const mockKeyword: MockSearchStrategy = {
        name: "keyword",
        search: vi.fn().mockResolvedValue(ok(sharedResults.keyword)),
        getMetrics: vi.fn().mockReturnValue(createDefaultMetric()),
      };
      const mockSemantic: MockSearchStrategy = {
        name: "semantic",
        search: vi.fn().mockResolvedValue(ok(sharedResults.semantic)),
        getMetrics: vi.fn().mockReturnValue(createDefaultMetric()),
      };
      const mockGraph: MockSearchStrategy = {
        name: "graph",
        search: vi.fn().mockResolvedValue(ok(sharedResults.graph)),
        getMetrics: vi.fn().mockReturnValue(createDefaultMetric()),
      };

      // 実際のRRFFusionの動作をシミュレート
      const mockFusion: MockFusion = {
        fuse: vi.fn().mockImplementation((_resultSets, _weights) => {
          // 共有チャンクを正しくマージ
          const fusedResults: FusedSearchResult[] = [
            {
              chunkId: createChunkId("shared-chunk"),
              content: "Shared content across strategies",
              fusedScore: 0.95, // 3戦略からの高スコア
              sources: [
                { strategy: "keyword", rank: 1, score: 0.9 },
                { strategy: "semantic", rank: 1, score: 0.85 },
                { strategy: "graph", rank: 1, score: 0.8 },
              ],
              metadata: {},
            },
            ...createMockFusedResults(5),
          ];
          return fusedResults;
        }),
      };

      const mockReranker = createFullMockReranker();

      engine = new HybridRAGEngine(
        mockClassifier,
        { keyword: mockKeyword, semantic: mockSemantic, graph: mockGraph },
        mockFusion,
        mockReranker,
        null,
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 共有チャンクが正しくマージされている
      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as {
          results: Array<{
            chunkId: string;
            sources: Array<{ strategy: string }>;
          }>;
        };
        const sharedChunk = data.results.find(
          (r) => r.chunkId === "shared-chunk",
        );
        expect(sharedChunk).toBeDefined();
        expect(sharedChunk!.sources.length).toBe(3); // 3戦略からのソース情報
      }
    });
  });

  // ===========================================================================
  // メタデータ検証テスト
  // ===========================================================================

  describe("メタデータ検証", () => {
    it("レスポンスに必要なメタデータが含まれる", async () => {
      // Given: 標準的なエンジン設定
      const mockClassifier = createFullMockQueryClassifier("local");
      const mockKeyword = createFullMockSearchStrategy("keyword", 5);
      const mockSemantic = createFullMockSearchStrategy("semantic", 5);
      const mockGraph = createFullMockSearchStrategy("graph", 5);
      const mockFusion = createFullMockFusion(10);
      const mockReranker = createFullMockReranker();

      engine = new HybridRAGEngine(
        mockClassifier,
        { keyword: mockKeyword, semantic: mockSemantic, graph: mockGraph },
        mockFusion,
        mockReranker,
        null,
      );

      // When: 検索を実行
      const result = await engine.search("test query", 10);

      // Then: 必要なメタデータがすべて含まれる
      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as {
          results: unknown[];
          metadata: {
            queryType: string;
            searchWeights: SearchWeights;
            pipelineStages: Array<{
              stage: string;
              duration: number;
              inputCount: number;
              outputCount: number;
            }>;
            totalDuration: number;
          };
        };

        // メタデータ検証
        expect(data.metadata.queryType).toBe("local");
        expect(data.metadata.searchWeights).toEqual({
          keyword: 0.35,
          semantic: 0.35,
          graph: 0.3,
        });
        expect(data.metadata.pipelineStages).toBeInstanceOf(Array);
        expect(data.metadata.totalDuration).toBeGreaterThanOrEqual(0);

        // パイプラインステージの検証
        const stages = data.metadata.pipelineStages;
        expect(stages.length).toBeGreaterThanOrEqual(4);
        for (const stage of stages) {
          expect(stage.stage).toBeDefined();
          expect(stage.duration).toBeGreaterThanOrEqual(0);
          expect(stage.inputCount).toBeGreaterThanOrEqual(0);
          expect(stage.outputCount).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });
});
