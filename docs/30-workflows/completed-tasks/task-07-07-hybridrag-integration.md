# HybridRAG統合 - タスク指示書

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | CONV-07-07                                  |
| タスク名     | HybridRAG統合                               |
| 親タスク     | CONV-07 (HybridRAG検索エンジン)             |
| 依存タスク   | CONV-07-01〜06 (すべての検索コンポーネント) |
| 規模         | 大                                          |
| 見積もり工数 | 1日                                         |
| ステータス   | 未実施                                      |

---

## 1. 目的

Query Classifier → Triple Search → RRF Fusion → Reranking → CRAG の4ステージパイプラインを統合し、HybridRAG検索エンジンとして完成させる。目標精度90%以上。

---

## 2. 成果物

- `packages/shared/src/services/search/hybrid-rag-engine.ts`
- `packages/shared/src/services/search/hybrid-rag-factory.ts`
- `packages/shared/src/services/search/__tests__/hybrid-rag-engine.test.ts`
- `packages/shared/src/services/search/index.ts`（エクスポート）

---

## 3. 入力

- 検索クエリ文字列
- 検索オプション（limit, filters, enableCRAG等）

---

## 4. 出力

```typescript
export interface HybridRAGResponse {
  /** 最終検索結果 */
  results: HybridRAGResult[];

  /** パイプライン実行メタデータ */
  metadata: {
    queryType: QueryType;
    searchWeights: SearchWeights;
    pipelineStages: PipelineStageResult[];
    totalDuration: number;
    cragAction?: "correct" | "incorrect" | "ambiguous";
  };

  /** 拡張コンテキスト（CRAGによるWeb検索結果等） */
  augmentedContext?: string;
}

export interface HybridRAGResult {
  chunkId: ChunkId;
  content: string;
  score: number;
  sources: Array<{
    strategy: "keyword" | "semantic" | "graph";
    rank: number;
    score: number;
  }>;
  metadata: Record<string, unknown>;
}

export interface PipelineStageResult {
  stage: string;
  duration: number;
  inputCount: number;
  outputCount: number;
}
```

---

## 5. 実装仕様

### 5.1 HybridRAGEngine

```typescript
// packages/shared/src/services/search/hybrid-rag-engine.ts
import type {
  QueryClassifier,
  QueryType,
  SearchWeights,
} from "./query-classifier";
import type { ISearchStrategy, SearchFilters, SearchResult } from "./types";
import type { RRFFusion, FusedSearchResult } from "./fusion/rrf-fusion";
import type { IReranker } from "./reranking/cross-encoder-reranker";
import type { CorrectiveRAG, CRAGResult } from "./crag/corrective-rag";
import { ok, err, type Result } from "@/types/result";

/**
 * HybridRAG検索エンジン
 *
 * 4ステージパイプライン:
 * 1. Query Classification - クエリタイプ判定と検索重み決定
 * 2. Triple Search - キーワード/ベクトル/グラフの並列検索
 * 3. RRF Fusion + Reranking - 結果統合と再ランキング
 * 4. CRAG - 関連性評価と補正
 */
export class HybridRAGEngine {
  constructor(
    private readonly queryClassifier: QueryClassifier,
    private readonly searchStrategies: {
      keyword: ISearchStrategy;
      semantic: ISearchStrategy;
      graph: ISearchStrategy;
    },
    private readonly fusion: RRFFusion,
    private readonly reranker: IReranker,
    private readonly crag: CorrectiveRAG | null,
    private readonly options: HybridRAGOptions = {},
  ) {}

  /**
   * HybridRAG検索を実行
   */
  async search(
    query: string,
    limit: number = 10,
    filters?: SearchFilters,
    searchOptions?: SearchOptions,
  ): Promise<Result<HybridRAGResponse, Error>> {
    const startTime = Date.now();
    const pipelineStages: PipelineStageResult[] = [];

    try {
      // ====================================
      // Stage 1: Query Classification
      // ====================================
      const classifyStart = Date.now();
      const classificationResult = await this.queryClassifier.classify(query);

      if (!classificationResult.success) {
        return err(classificationResult.error);
      }

      const { queryType, weights } = classificationResult.data;
      pipelineStages.push({
        stage: "query_classification",
        duration: Date.now() - classifyStart,
        inputCount: 1,
        outputCount: 1,
      });

      // ====================================
      // Stage 2: Triple Search (並列実行)
      // ====================================
      const searchStart = Date.now();
      const searchLimit = this.calculateSearchLimit(limit, searchOptions);

      const [keywordResults, semanticResults, graphResults] = await Promise.all(
        [
          this.searchStrategies.keyword.search(query, searchLimit, filters),
          this.searchStrategies.semantic.search(query, searchLimit, filters, {
            threshold: searchOptions?.vectorThreshold,
          }),
          this.searchStrategies.graph.search(query, searchLimit, filters, {
            queryType,
            traversalDepth: searchOptions?.graphDepth,
          }),
        ],
      );

      // エラーチェック（部分的な失敗は許容）
      const resultSets = new Map<string, SearchResult[]>();
      let totalSearchResults = 0;

      if (keywordResults.success) {
        resultSets.set("keyword", keywordResults.data);
        totalSearchResults += keywordResults.data.length;
      }
      if (semanticResults.success) {
        resultSets.set("semantic", semanticResults.data);
        totalSearchResults += semanticResults.data.length;
      }
      if (graphResults.success) {
        resultSets.set("graph", graphResults.data);
        totalSearchResults += graphResults.data.length;
      }

      if (resultSets.size === 0) {
        return err(new Error("All search strategies failed"));
      }

      pipelineStages.push({
        stage: "triple_search",
        duration: Date.now() - searchStart,
        inputCount: 1,
        outputCount: totalSearchResults,
      });

      // ====================================
      // Stage 3: RRF Fusion + Reranking
      // ====================================
      const fusionStart = Date.now();
      const fusedResults = this.fusion.fuse(resultSets, weights);

      pipelineStages.push({
        stage: "rrf_fusion",
        duration: Date.now() - fusionStart,
        inputCount: totalSearchResults,
        outputCount: fusedResults.length,
      });

      // Reranking
      const rerankStart = Date.now();
      const rerankLimit = searchOptions?.enableCRAG
        ? limit * 2 // CRAGでフィルタされる可能性があるので余裕を持つ
        : limit;

      const rerankedResult = await this.reranker.rerank(
        query,
        fusedResults,
        rerankLimit,
      );

      if (!rerankedResult.success) {
        // リランキング失敗時はfusedResultsをそのまま使用
        console.warn("Reranking failed, using fused results");
      }

      const rerankedResults = rerankedResult.success
        ? rerankedResult.data
        : fusedResults.slice(0, rerankLimit);

      pipelineStages.push({
        stage: "reranking",
        duration: Date.now() - rerankStart,
        inputCount: fusedResults.length,
        outputCount: rerankedResults.length,
      });

      // ====================================
      // Stage 4: CRAG (オプション)
      // ====================================
      let finalResults: FusedSearchResult[] = rerankedResults;
      let augmentedContext: string | undefined;
      let cragAction: "correct" | "incorrect" | "ambiguous" | undefined;

      if (this.crag && searchOptions?.enableCRAG !== false) {
        const cragStart = Date.now();
        const cragResult = await this.crag.process(query, rerankedResults);

        if (cragResult.success) {
          finalResults = cragResult.data.results;
          augmentedContext = cragResult.data.augmentedContext;
          cragAction = cragResult.data.evaluation.action;
        }

        pipelineStages.push({
          stage: "crag",
          duration: Date.now() - cragStart,
          inputCount: rerankedResults.length,
          outputCount: finalResults.length,
        });
      }

      // ====================================
      // 結果を整形して返す
      // ====================================
      const results: HybridRAGResult[] = finalResults
        .slice(0, limit)
        .map((r) => ({
          chunkId: r.chunkId,
          content: r.content,
          score: r.rerankedScore ?? r.fusedScore,
          sources: r.sources,
          metadata: r.metadata,
        }));

      return ok({
        results,
        metadata: {
          queryType,
          searchWeights: weights,
          pipelineStages,
          totalDuration: Date.now() - startTime,
          cragAction,
        },
        augmentedContext,
      });
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("HybridRAG search failed"),
      );
    }
  }

  /**
   * 検索制限数を計算
   * Fusionで統合されることを考慮して多めに取得
   */
  private calculateSearchLimit(
    finalLimit: number,
    options?: SearchOptions,
  ): number {
    const multiplier = options?.searchLimitMultiplier ?? 3;
    return Math.ceil(finalLimit * multiplier);
  }
}

export interface HybridRAGOptions {
  /**
   * デフォルトでCRAGを有効にするか
   */
  defaultEnableCRAG?: boolean;

  /**
   * タイムアウト（ミリ秒）
   */
  timeout?: number;
}

export interface SearchOptions {
  /**
   * CRAGを有効にするか
   */
  enableCRAG?: boolean;

  /**
   * 各検索戦略の結果数倍率
   */
  searchLimitMultiplier?: number;

  /**
   * ベクトル検索の閾値
   */
  vectorThreshold?: number;

  /**
   * グラフ検索の深度
   */
  graphDepth?: number;
}
```

### 5.2 HybridRAGFactory

```typescript
// packages/shared/src/services/search/hybrid-rag-factory.ts
import { HybridRAGEngine } from "./hybrid-rag-engine";
import { QueryClassifier } from "./query-classifier";
import { KeywordSearchStrategy } from "./strategies/keyword-search-strategy";
import { VectorSearchStrategy } from "./strategies/vector-search-strategy";
import { GraphSearchStrategy } from "./strategies/graph-search-strategy";
import { RRFFusion } from "./fusion/rrf-fusion";
import {
  CohereReranker,
  LLMReranker,
  NoOpReranker,
} from "./reranking/cross-encoder-reranker";
import { RelevanceEvaluator } from "./crag/relevance-evaluator";
import { CorrectiveRAG } from "./crag/corrective-rag";
import type { DrizzleClient } from "@/db/client";
import type { IEmbeddingProvider } from "@/services/embedding/provider";
import type { IKnowledgeGraphStore } from "@/services/knowledge-graph/store";
import type { ILLMClient } from "@/services/llm/client";

/**
 * HybridRAGEngineのファクトリ
 * 設定に基づいて適切なコンポーネントを組み立てる
 */
export class HybridRAGFactory {
  /**
   * フル機能のHybridRAGエンジンを作成
   */
  static createFull(config: FullHybridRAGConfig): HybridRAGEngine {
    // Query Classifier
    const queryClassifier = new QueryClassifier(config.llmClient, {
      useLLM: true,
    });

    // Search Strategies
    const keywordStrategy = new KeywordSearchStrategy(config.db);
    const vectorStrategy = new VectorSearchStrategy(
      config.db,
      config.embeddingProvider,
    );
    const graphStrategy = new GraphSearchStrategy(
      config.graphStore,
      config.embeddingProvider,
    );

    // Fusion
    const fusion = new RRFFusion(config.rrfK ?? 60);

    // Reranker
    const reranker = this.createReranker(config);

    // CRAG
    const crag = config.enableCRAG ? this.createCRAG(config) : null;

    return new HybridRAGEngine(
      queryClassifier,
      {
        keyword: keywordStrategy,
        semantic: vectorStrategy,
        graph: graphStrategy,
      },
      fusion,
      reranker,
      crag,
    );
  }

  /**
   * 軽量版のHybridRAGエンジンを作成（CRAG無し、NoOpReranker）
   */
  static createLite(config: LiteHybridRAGConfig): HybridRAGEngine {
    const queryClassifier = new QueryClassifier(null, { useLLM: false });

    const keywordStrategy = new KeywordSearchStrategy(config.db);
    const vectorStrategy = new VectorSearchStrategy(
      config.db,
      config.embeddingProvider,
    );
    const graphStrategy = new GraphSearchStrategy(
      config.graphStore,
      config.embeddingProvider,
    );

    const fusion = new RRFFusion();
    const reranker = new NoOpReranker();

    return new HybridRAGEngine(
      queryClassifier,
      {
        keyword: keywordStrategy,
        semantic: vectorStrategy,
        graph: graphStrategy,
      },
      fusion,
      reranker,
      null,
    );
  }

  /**
   * テスト用のHybridRAGエンジンを作成
   */
  static createForTesting(mocks: TestMocks): HybridRAGEngine {
    return new HybridRAGEngine(
      mocks.queryClassifier,
      {
        keyword: mocks.keywordStrategy,
        semantic: mocks.semanticStrategy,
        graph: mocks.graphStrategy,
      },
      mocks.fusion ?? new RRFFusion(),
      mocks.reranker ?? new NoOpReranker(),
      mocks.crag ?? null,
    );
  }

  /**
   * Rerankerを作成
   */
  private static createReranker(config: FullHybridRAGConfig): IReranker {
    switch (config.rerankerType) {
      case "cohere":
        if (!config.cohereApiKey) {
          throw new Error("Cohere API key required for cohere reranker");
        }
        return new CohereReranker(
          config.cohereApiKey,
          config.cohereModel ?? "rerank-multilingual-v3.0",
        );

      case "voyage":
        if (!config.voyageApiKey) {
          throw new Error("Voyage API key required for voyage reranker");
        }
        return new VoyageReranker(config.voyageApiKey);

      case "llm":
        return new LLMReranker(config.llmClient, {
          batchSize: config.rerankerBatchSize ?? 10,
        });

      case "none":
      default:
        return new NoOpReranker();
    }
  }

  /**
   * CRAGを作成
   */
  private static createCRAG(config: FullHybridRAGConfig): CorrectiveRAG {
    const evaluator = new RelevanceEvaluator(config.llmClient, {
      maxEvaluate: config.cragMaxEvaluate ?? 5,
      correctThreshold: config.cragCorrectThreshold ?? 0.7,
      incorrectThreshold: config.cragIncorrectThreshold ?? 0.3,
    });

    return new CorrectiveRAG(evaluator, config.webSearcher ?? null, {
      enableWebSearch: config.enableWebSearch ?? false,
      enableRefinement: config.enableRefinement ?? true,
      ambiguousFilterThreshold: config.ambiguousFilterThreshold ?? 0.4,
    });
  }
}

export interface FullHybridRAGConfig {
  db: DrizzleClient;
  embeddingProvider: IEmbeddingProvider;
  graphStore: IKnowledgeGraphStore;
  llmClient: ILLMClient;

  // Reranker設定
  rerankerType: "cohere" | "voyage" | "llm" | "none";
  cohereApiKey?: string;
  cohereModel?: string;
  voyageApiKey?: string;
  rerankerBatchSize?: number;

  // RRF設定
  rrfK?: number;

  // CRAG設定
  enableCRAG?: boolean;
  cragMaxEvaluate?: number;
  cragCorrectThreshold?: number;
  cragIncorrectThreshold?: number;
  ambiguousFilterThreshold?: number;

  // Web検索設定
  webSearcher?: IWebSearcher;
  enableWebSearch?: boolean;
  enableRefinement?: boolean;
}

export interface LiteHybridRAGConfig {
  db: DrizzleClient;
  embeddingProvider: IEmbeddingProvider;
  graphStore: IKnowledgeGraphStore;
}

export interface TestMocks {
  queryClassifier: QueryClassifier;
  keywordStrategy: ISearchStrategy;
  semanticStrategy: ISearchStrategy;
  graphStrategy: ISearchStrategy;
  fusion?: RRFFusion;
  reranker?: IReranker;
  crag?: CorrectiveRAG;
}
```

### 5.3 エクスポート

```typescript
// packages/shared/src/services/search/index.ts
export {
  HybridRAGEngine,
  type HybridRAGOptions,
  type SearchOptions,
  type HybridRAGResponse,
  type HybridRAGResult,
} from "./hybrid-rag-engine";
export {
  HybridRAGFactory,
  type FullHybridRAGConfig,
  type LiteHybridRAGConfig,
} from "./hybrid-rag-factory";

// Query Classification
export {
  QueryClassifier,
  type QueryType,
  type SearchWeights,
  type ClassificationResult,
} from "./query-classifier";

// Search Strategies
export {
  type ISearchStrategy,
  type SearchResult,
  type SearchFilters,
} from "./types";
export { KeywordSearchStrategy } from "./strategies/keyword-search-strategy";
export {
  VectorSearchStrategy,
  type VectorSearchOptions,
} from "./strategies/vector-search-strategy";
export {
  GraphSearchStrategy,
  type GraphSearchOptions,
} from "./strategies/graph-search-strategy";

// Fusion
export {
  RRFFusion,
  WeightedScoreFusion,
  type FusedSearchResult,
} from "./fusion/rrf-fusion";

// Reranking
export {
  type IReranker,
  LLMReranker,
  CohereReranker,
  VoyageReranker,
  NoOpReranker,
} from "./reranking/cross-encoder-reranker";

// CRAG
export {
  RelevanceEvaluator,
  type RelevanceEvaluation,
} from "./crag/relevance-evaluator";
export {
  CorrectiveRAG,
  type CRAGResult,
  type CRAGOptions,
} from "./crag/corrective-rag";
```

---

## 6. テストケース

```typescript
describe("HybridRAGEngine", () => {
  describe("search", () => {
    it("4ステージパイプラインが正常に動作する", async () => {
      const engine = HybridRAGFactory.createForTesting({
        queryClassifier: createMockQueryClassifier(),
        keywordStrategy: createMockKeywordStrategy(),
        semanticStrategy: createMockSemanticStrategy(),
        graphStrategy: createMockGraphStrategy(),
      });

      const result = await engine.search("TypeScriptの型安全性について", 10);

      expect(result.success).toBe(true);
      expect(result.data.results.length).toBeGreaterThan(0);
      expect(result.data.metadata.pipelineStages.length).toBe(4); // with no CRAG: 3
      expect(result.data.metadata.queryType).toBeDefined();
      expect(result.data.metadata.searchWeights).toBeDefined();
    });

    it("クエリタイプに応じた重みが適用される", async () => {
      const mockClassifier = {
        classify: vi.fn().mockResolvedValue(
          ok({
            queryType: "global",
            weights: { keyword: 0.2, semantic: 0.3, graph: 0.5 },
          }),
        ),
      };
      const engine = HybridRAGFactory.createForTesting({
        queryClassifier: mockClassifier as any,
        keywordStrategy: createMockKeywordStrategy(),
        semanticStrategy: createMockSemanticStrategy(),
        graphStrategy: createMockGraphStrategy(),
      });

      const result = await engine.search("プロジェクト全体の構造は？", 10);

      expect(result.success).toBe(true);
      expect(result.data.metadata.queryType).toBe("global");
      expect(result.data.metadata.searchWeights.graph).toBe(0.5);
    });

    it("部分的な検索失敗でも結果を返す", async () => {
      const failingKeyword = {
        search: vi.fn().mockResolvedValue(err(new Error("Keyword failed"))),
      };
      const engine = HybridRAGFactory.createForTesting({
        queryClassifier: createMockQueryClassifier(),
        keywordStrategy: failingKeyword as any,
        semanticStrategy: createMockSemanticStrategy(),
        graphStrategy: createMockGraphStrategy(),
      });

      const result = await engine.search("test", 10);

      expect(result.success).toBe(true);
      // semantic と graph の結果のみ
      expect(result.data.results.length).toBeGreaterThan(0);
    });

    it("すべての検索が失敗した場合はエラーを返す", async () => {
      const failingStrategy = {
        search: vi.fn().mockResolvedValue(err(new Error("Failed"))),
      };
      const engine = HybridRAGFactory.createForTesting({
        queryClassifier: createMockQueryClassifier(),
        keywordStrategy: failingStrategy as any,
        semanticStrategy: failingStrategy as any,
        graphStrategy: failingStrategy as any,
      });

      const result = await engine.search("test", 10);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain("All search strategies failed");
    });

    it("CRAGが有効な場合は補正が適用される", async () => {
      const mockCRAG = {
        process: vi.fn().mockResolvedValue(
          ok({
            results: createMockFusedResults(5),
            evaluation: {
              relevanceScore: 0.8,
              action: "correct",
              corrections: [],
            },
          }),
        ),
      };
      const engine = HybridRAGFactory.createForTesting({
        queryClassifier: createMockQueryClassifier(),
        keywordStrategy: createMockKeywordStrategy(),
        semanticStrategy: createMockSemanticStrategy(),
        graphStrategy: createMockGraphStrategy(),
        crag: mockCRAG as any,
      });

      const result = await engine.search("test", 10, undefined, {
        enableCRAG: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.metadata.cragAction).toBe("correct");
      expect(mockCRAG.process).toHaveBeenCalled();
    });

    it("パイプラインのパフォーマンスメトリクスが記録される", async () => {
      const engine = HybridRAGFactory.createForTesting({
        queryClassifier: createMockQueryClassifier(),
        keywordStrategy: createMockKeywordStrategy(),
        semanticStrategy: createMockSemanticStrategy(),
        graphStrategy: createMockGraphStrategy(),
      });

      const result = await engine.search("test", 10);

      expect(result.success).toBe(true);
      expect(result.data.metadata.totalDuration).toBeGreaterThan(0);
      for (const stage of result.data.metadata.pipelineStages) {
        expect(stage.duration).toBeGreaterThanOrEqual(0);
        expect(stage.inputCount).toBeGreaterThanOrEqual(0);
        expect(stage.outputCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("検索オプション", () => {
    it("limitが正しく適用される", async () => {
      const engine = HybridRAGFactory.createForTesting({
        queryClassifier: createMockQueryClassifier(),
        keywordStrategy: createMockKeywordStrategy(20),
        semanticStrategy: createMockSemanticStrategy(20),
        graphStrategy: createMockGraphStrategy(20),
      });

      const result = await engine.search("test", 5);

      expect(result.success).toBe(true);
      expect(result.data.results.length).toBeLessThanOrEqual(5);
    });

    it("フィルタが検索戦略に渡される", async () => {
      const keywordSpy = vi.fn().mockResolvedValue(ok([]));
      const engine = HybridRAGFactory.createForTesting({
        queryClassifier: createMockQueryClassifier(),
        keywordStrategy: { search: keywordSpy } as any,
        semanticStrategy: createMockSemanticStrategy(),
        graphStrategy: createMockGraphStrategy(),
      });

      const filters = { fileTypes: ["text/markdown"] };
      await engine.search("test", 10, filters);

      expect(keywordSpy).toHaveBeenCalledWith(
        "test",
        expect.any(Number),
        filters,
      );
    });
  });
});

describe("HybridRAGFactory", () => {
  it("createFullで全機能エンジンを作成する", () => {
    const engine = HybridRAGFactory.createFull({
      db: mockDb,
      embeddingProvider: mockEmbeddingProvider,
      graphStore: mockGraphStore,
      llmClient: mockLLMClient,
      rerankerType: "none",
      enableCRAG: true,
    });

    expect(engine).toBeInstanceOf(HybridRAGEngine);
  });

  it("createLiteで軽量エンジンを作成する", () => {
    const engine = HybridRAGFactory.createLite({
      db: mockDb,
      embeddingProvider: mockEmbeddingProvider,
      graphStore: mockGraphStore,
    });

    expect(engine).toBeInstanceOf(HybridRAGEngine);
  });

  it("Cohere reranker設定時にAPIキーが必要", () => {
    expect(() =>
      HybridRAGFactory.createFull({
        db: mockDb,
        embeddingProvider: mockEmbeddingProvider,
        graphStore: mockGraphStore,
        llmClient: mockLLMClient,
        rerankerType: "cohere",
        // cohereApiKey missing
      }),
    ).toThrow("Cohere API key required");
  });
});
```

---

## 7. 完了条件

- [ ] `HybridRAGEngine`クラスが実装済み
- [ ] 4ステージパイプラインが正常に動作する
- [ ] Query Classificationが動作する
- [ ] Triple Search（並列検索）が動作する
- [ ] RRF Fusionが動作する
- [ ] Rerankingが動作する
- [ ] CRAGが動作する（オプション）
- [ ] 部分的な検索失敗でも結果を返す
- [ ] `HybridRAGFactory`が実装済み
- [ ] Full/Lite/Testing設定が動作する
- [ ] パイプラインメトリクスが記録される
- [ ] エクスポートが整理されている
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-09: RAGパイプライン統合（変換→検索→生成）

---

## 9. 参照情報

- CONV-07-01〜06: 各コンポーネント
- [HybridRAG Paper](https://arxiv.org/abs/2408.04948)
- [GraphRAG Paper](https://arxiv.org/abs/2404.16130)

---

## 10. パイプラインアーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                    HybridRAGEngine                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                            │
│  │ Query Classifier│ ──→ queryType, weights                     │
│  └─────────────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────┐                    │
│  │           Triple Search (並列)           │                    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │                    │
│  │  │ Keyword │ │ Vector  │ │  Graph  │   │                    │
│  │  │  FTS5   │ │ DiskANN │ │  KG     │   │                    │
│  │  └─────────┘ └─────────┘ └─────────┘   │                    │
│  └─────────────────────────────────────────┘                    │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │   RRF Fusion    │ ──→ fusedResults                           │
│  └─────────────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │    Reranker     │ ──→ rerankedResults                        │
│  └─────────────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │      CRAG       │ ──→ correctedResults + augmentedContext    │
│  └─────────────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│      HybridRAGResponse                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. パフォーマンス目標

| メトリクス     | 目標値   | 備考           |
| -------------- | -------- | -------------- |
| 全体レイテンシ | < 500ms  | CRAG無効時     |
| 全体レイテンシ | < 1000ms | CRAG有効時     |
| 検索精度       | > 90%    | MRR@10基準     |
| Triple Search  | < 200ms  | 並列実行       |
| RRF Fusion     | < 10ms   | インメモリ処理 |
| Reranking      | < 200ms  | 10件リランク時 |
| CRAG           | < 300ms  | 評価+補正      |
