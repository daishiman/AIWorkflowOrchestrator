/**
 * @file HybridRAGEngine実装
 * @description CONV-07-07: HybridRAG統合 - 4ステージパイプライン検索エンジン
 */

import { ok, err, type Result } from "../../types/rag/result";
import type { ChunkId } from "../../types/rag/branded";
import type { SearchFilters } from "../../types/rag/search/types";
import type { QueryType, SearchWeights, IQueryClassifier } from "./types";
import type {
  SearchResult,
  FusedSearchResult,
  IFusionStrategy,
} from "./fusion/types";
import type { IReranker } from "./reranking/types";
import type { ICorrectiveRAG, RelevanceAction } from "./crag/types";
import type { ISearchStrategy } from "./strategies/types";

// =============================================================================
// 型定義
// =============================================================================

/**
 * パイプラインステージの実行結果
 */
export interface PipelineStageResult {
  /** ステージ名 */
  stage:
    | "query_classification"
    | "triple_search"
    | "rrf_fusion"
    | "reranking"
    | "crag";
  /** 実行時間（ミリ秒） */
  duration: number;
  /** 入力件数 */
  inputCount: number;
  /** 出力件数 */
  outputCount: number;
}

/**
 * 検索結果アイテム
 */
export interface HybridRAGResult {
  /** チャンクID */
  chunkId: ChunkId;
  /** コンテンツ本文 */
  content: string;
  /** 総合スコア（0.0-1.0） */
  score: number;
  /** ソース情報（どの検索戦略から来たか） */
  sources: Array<{
    /** 検索戦略 */
    strategy: "keyword" | "semantic" | "graph";
    /** 元のランク順位 */
    rank: number;
    /** 元のスコア */
    score: number;
  }>;
  /** メタデータ */
  metadata: Record<string, unknown>;
}

/**
 * HybridRAG検索のレスポンス
 */
export interface HybridRAGResponse {
  /** 最終検索結果 */
  results: HybridRAGResult[];
  /** パイプライン実行メタデータ */
  metadata: {
    /** クエリタイプ（local/global/relationship/hybrid） */
    queryType: QueryType;
    /** 検索戦略の重み */
    searchWeights: SearchWeights;
    /** 各パイプラインステージの実行結果 */
    pipelineStages: PipelineStageResult[];
    /** 全体の処理時間（ミリ秒） */
    totalDuration: number;
    /** CRAGの評価アクション（オプション） */
    cragAction?: RelevanceAction;
  };
  /** 拡張コンテキスト（CRAGによるWeb検索結果等） */
  augmentedContext?: string;
}

/**
 * HybridRAG検索オプション
 */
export interface SearchOptions {
  /**
   * CRAGを有効にするか
   * @default undefined (Engineの設定に従う)
   */
  enableCRAG?: boolean;
  /**
   * 各検索戦略の結果数倍率
   * 最終結果数 × 倍率 = 各戦略の取得数
   * @default 3
   */
  searchLimitMultiplier?: number;
  /**
   * ベクトル検索の類似度閾値
   * @default undefined (戦略のデフォルトに従う)
   */
  vectorThreshold?: number;
  /**
   * グラフ検索のトラバーサル深度
   * @default undefined (戦略のデフォルトに従う)
   */
  graphDepth?: number;
}

/**
 * HybridRAGEngineの設定オプション
 */
export interface HybridRAGOptions {
  /**
   * デフォルトでCRAGを有効にするか
   * @default true (cragが設定されている場合)
   */
  defaultEnableCRAG?: boolean;
  /**
   * タイムアウト（ミリ秒）
   * @default undefined (タイムアウトなし)
   */
  timeout?: number;
}

// =============================================================================
// 定数
// =============================================================================

/** デフォルトの検索結果数 */
const DEFAULT_LIMIT = 10;

/** 最大の検索結果数 */
const MAX_LIMIT = 100;

/** デフォルトの検索結果数倍率 */
const DEFAULT_SEARCH_LIMIT_MULTIPLIER = 3;

// =============================================================================
// HybridRAGEngine
// =============================================================================

/**
 * HybridRAG統合検索エンジン
 *
 * @description
 * 4ステージパイプラインを統合した検索エンジン:
 * 1. Query Classification - クエリを分類し、検索戦略の重みを決定
 * 2. Triple Search - キーワード/セマンティック/グラフ検索を並列実行
 * 3a. RRF Fusion - 検索結果を統合
 * 3b. Reranking - 再ランキング
 * 4. CRAG (Optional) - 結果の評価・補正
 */
export class HybridRAGEngine {
  private readonly defaultEnableCRAG: boolean;

  constructor(
    private readonly queryClassifier: IQueryClassifier,
    private readonly searchStrategies: {
      keyword: ISearchStrategy;
      semantic: ISearchStrategy;
      graph: ISearchStrategy;
    },
    private readonly fusion: IFusionStrategy,
    private readonly reranker: IReranker,
    private readonly crag: ICorrectiveRAG | null,
    private readonly options: HybridRAGOptions = {},
  ) {
    this.defaultEnableCRAG = options.defaultEnableCRAG ?? crag !== null;
  }

  /**
   * HybridRAG検索を実行
   *
   * @param query - 検索クエリ文字列
   * @param limit - 最大結果数（デフォルト: 10）
   * @param filters - 検索フィルター（オプション）
   * @param searchOptions - 検索オプション（オプション）
   * @returns 検索結果またはエラー
   */
  async search(
    query: string,
    limit: number = DEFAULT_LIMIT,
    filters?: SearchFilters,
    searchOptions?: SearchOptions,
  ): Promise<Result<HybridRAGResponse, Error>> {
    const startTime = performance.now();
    const pipelineStages: PipelineStageResult[] = [];

    // 入力バリデーション
    if (!query || query.trim().length === 0) {
      return err(new Error("Query cannot be empty"));
    }

    // limit 0の場合は空の結果を返す
    if (limit === 0) {
      return ok({
        results: [],
        metadata: {
          queryType: "hybrid",
          searchWeights: { keyword: 0.33, semantic: 0.33, graph: 0.34 },
          pipelineStages: [],
          totalDuration: 0,
        },
      });
    }

    // limitを最大100に制限
    const effectiveLimit = Math.min(limit, MAX_LIMIT);

    // searchLimitMultiplierの検証
    const multiplier =
      searchOptions?.searchLimitMultiplier &&
      searchOptions.searchLimitMultiplier > 0
        ? searchOptions.searchLimitMultiplier
        : DEFAULT_SEARCH_LIMIT_MULTIPLIER;

    const searchLimit = Math.ceil(effectiveLimit * multiplier);

    // =======================================================================
    // Stage 1: Query Classification
    // =======================================================================
    const classificationStart = performance.now();
    const classificationResult = await this.queryClassifier.classify(query);

    if (!classificationResult.success) {
      return err(classificationResult.error);
    }

    const { type: queryType } = classificationResult.data;
    const weights = this.queryClassifier.getSearchWeights(queryType);

    pipelineStages.push({
      stage: "query_classification",
      duration: performance.now() - classificationStart,
      inputCount: 1,
      outputCount: 1,
    });

    // =======================================================================
    // Stage 2: Triple Search (並列実行)
    // =======================================================================
    const tripleSearchStart = performance.now();

    const searchPromises = [
      this.searchStrategies.keyword.search(query, searchLimit, filters),
      this.searchStrategies.semantic.search(query, searchLimit, filters),
      this.searchStrategies.graph.search(query, searchLimit, filters),
    ];

    const [keywordResult, semanticResult, graphResult] =
      await Promise.all(searchPromises);

    // 検索結果をMapに集約
    const resultSets = new Map<string, SearchResult[]>();
    let totalSearchResults = 0;

    // NOTE: 2つのResult型を処理:
    // 1. テストモック: { success: true, data: [...] }
    // 2. 実際の実装: { isOk(): boolean, value: [...] }
    if (this.isResultOk(keywordResult)) {
      const results = this.convertToSearchResults(
        this.getResultValue(keywordResult),
        "keyword",
      );
      resultSets.set("keyword", results);
      totalSearchResults += results.length;
    }

    if (this.isResultOk(semanticResult)) {
      const results = this.convertToSearchResults(
        this.getResultValue(semanticResult),
        "semantic",
      );
      resultSets.set("semantic", results);
      totalSearchResults += results.length;
    }

    if (this.isResultOk(graphResult)) {
      const results = this.convertToSearchResults(
        this.getResultValue(graphResult),
        "graph",
      );
      resultSets.set("graph", results);
      totalSearchResults += results.length;
    }

    // すべての検索が失敗した場合
    if (resultSets.size === 0) {
      return err(new Error("All search strategies failed"));
    }

    pipelineStages.push({
      stage: "triple_search",
      duration: performance.now() - tripleSearchStart,
      inputCount: 1,
      outputCount: totalSearchResults,
    });

    // =======================================================================
    // Stage 3a: RRF Fusion
    // =======================================================================
    const fusionStart = performance.now();
    const fusedResults = this.fusion.fuse(resultSets, weights);

    pipelineStages.push({
      stage: "rrf_fusion",
      duration: performance.now() - fusionStart,
      inputCount: totalSearchResults,
      outputCount: fusedResults.length,
    });

    // =======================================================================
    // Stage 3b: Reranking
    // =======================================================================
    const rerankingStart = performance.now();
    const rerankLimit = this.shouldEnableCRAG(searchOptions)
      ? effectiveLimit * 2
      : effectiveLimit;

    const rerankResult = await this.reranker.rerank(
      query,
      fusedResults,
      Math.min(rerankLimit, fusedResults.length),
    );

    let rerankedResults: FusedSearchResult[];
    if (rerankResult.success) {
      rerankedResults = rerankResult.data;
    } else {
      // フォールバック: Fusion結果をそのまま使用
      rerankedResults = fusedResults.slice(0, rerankLimit);
    }

    pipelineStages.push({
      stage: "reranking",
      duration: performance.now() - rerankingStart,
      inputCount: fusedResults.length,
      outputCount: rerankedResults.length,
    });

    // =======================================================================
    // Stage 4: CRAG (Optional)
    // =======================================================================
    let finalResults: FusedSearchResult[] = rerankedResults;
    let cragAction: RelevanceAction | undefined;
    let augmentedContext: string | undefined;

    if (this.shouldEnableCRAG(searchOptions) && this.crag) {
      const cragStart = performance.now();
      const cragResult = await this.crag.process(query, rerankedResults);

      if (cragResult.success) {
        finalResults = cragResult.data.results;
        cragAction = cragResult.data.evaluation.action;
        augmentedContext = cragResult.data.augmentedContext;

        pipelineStages.push({
          stage: "crag",
          duration: performance.now() - cragStart,
          inputCount: rerankedResults.length,
          outputCount: finalResults.length,
        });
      } else {
        // CRAGが失敗した場合はReranking結果をそのまま使用
        pipelineStages.push({
          stage: "crag",
          duration: performance.now() - cragStart,
          inputCount: rerankedResults.length,
          outputCount: rerankedResults.length,
        });
      }
    }

    // =======================================================================
    // Final Mapping
    // =======================================================================
    const results: HybridRAGResult[] = finalResults
      .slice(0, effectiveLimit)
      .map((r) => ({
        chunkId: r.chunkId,
        content: r.content,
        score: r.rerankedScore ?? r.fusedScore,
        sources: r.sources.map((s) => ({
          strategy: s.strategy,
          rank: s.rank,
          score: s.score,
        })),
        metadata: r.metadata,
      }));

    const totalDuration = performance.now() - startTime;

    return ok({
      results,
      metadata: {
        queryType,
        searchWeights: weights,
        pipelineStages,
        totalDuration,
        ...(cragAction && { cragAction }),
      },
      ...(augmentedContext && { augmentedContext }),
    });
  }

  /**
   * CRAGを有効にするかどうかを判定
   */
  private shouldEnableCRAG(searchOptions?: SearchOptions): boolean {
    if (searchOptions?.enableCRAG !== undefined) {
      return searchOptions.enableCRAG;
    }
    return this.defaultEnableCRAG;
  }

  /**
   * Result型が成功かどうかを判定
   * NOTE: 2つのResult型を処理:
   * - インターフェース型: { success: true, data: T }
   * - クラス型: { isOk(): boolean, value: T }
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isResultOk(result: any): boolean {
    // クラス型（isOkメソッドを持つ）
    if (typeof result.isOk === "function") {
      return result.isOk();
    }
    // インターフェース型（successプロパティを持つ）
    return result.success === true;
  }

  /**
   * Result型から値を取得
   * NOTE: 2つのResult型を処理
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getResultValue(result: any): any[] {
    // クラス型（valueプロパティを持つ）
    if ("value" in result) {
      return result.value;
    }
    // インターフェース型（dataプロパティを持つ）
    return result.data;
  }

  /**
   * 検索結果アイテムをSearchResultに変換
   *
   * NOTE: 2つの型を処理:
   * 1. テストモック: { chunkId, content: string, score, metadata }
   * 2. 実際の実装: { id, content: { text }, score, ... }
   */
  private convertToSearchResults(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[],
    source: "keyword" | "semantic" | "graph",
  ): SearchResult[] {
    return items.map((item) => {
      // テストモック型（chunkIdを持つ）
      if ("chunkId" in item) {
        return {
          chunkId: item.chunkId as ChunkId,
          content:
            typeof item.content === "string"
              ? item.content
              : (item.content?.text ?? ""),
          score: item.score,
          source,
          metadata: item.metadata ?? {},
        };
      }
      // 実際の実装型（idを持つ）
      return {
        chunkId: item.id as ChunkId,
        content:
          typeof item.content === "string"
            ? item.content
            : (item.content?.text ?? ""),
        score: item.score,
        source,
        metadata: {},
      };
    });
  }
}
