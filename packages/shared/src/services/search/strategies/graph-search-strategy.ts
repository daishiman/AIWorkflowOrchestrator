/**
 * @file GraphSearchStrategy実装
 * @description Knowledge Graphを活用したグラフ検索戦略
 * CONV-07-04: HybridRAGグラフ検索
 */

import type { IEmbeddingProvider } from "../../embedding/providers/interfaces";
import type {
  SearchResultItem,
  SearchFilters,
  StrategyMetric,
} from "../../../types/rag/search/types";
import type {
  ChunkId,
  EntityId,
  CommunityId,
} from "../../../types/rag/branded";
import type { IKnowledgeGraphStore } from "../../graph/knowledge-graph-store";
import type { StoredEntity, TraversalOptions } from "../../graph/types";
import type { ICommunitySummarizer } from "../../graph/interfaces/community-summarizer.interface";
import type { CommunitySummary } from "../../graph/types";
import {
  type ISearchStrategy,
  type Result,
  ok,
  err,
  MAX_QUERY_LENGTH,
  MIN_LIMIT,
  MAX_LIMIT,
} from "./types";

// ==========================================
// Constants
// ==========================================

/** デフォルトエンティティ類似度閾値 */
const DEFAULT_ENTITY_THRESHOLD = 0.5;

/** 最大トラバーサル深度 */
const MAX_TRAVERSAL_DEPTH = 5;

/** デフォルトトラバーサル深度 */
const DEFAULT_TRAVERSAL_DEPTH = 3;

/** ローカルスコアの重み: エンティティ類似度 */
const LOCAL_ENTITY_WEIGHT = 0.6;

/** ローカルスコアの重み: チャンク関連度 */
const LOCAL_CHUNK_WEIGHT = 0.4;

/** パススコアの重み: パス距離 */
const PATH_DISTANCE_WEIGHT = 0.5;

/** パススコアの重み: チャンク関連度 */
const PATH_CHUNK_WEIGHT = 0.5;

// ==========================================
// Types
// ==========================================

/**
 * グラフ検索オプション
 */
export interface GraphSearchOptions {
  /** クエリタイプ */
  queryType?: "local" | "global" | "relationship";
  /** エンティティ類似度閾値 */
  entityThreshold?: number;
  /** コミュニティ類似度閾値 */
  communityThreshold?: number;
  /** トラバーサル深度 */
  traversalDepth?: number;
  /** 関係タイプフィルタ */
  relationTypes?: string[];
}

/**
 * 内部検索結果
 */
interface GraphSearchResultInternal {
  id: string;
  type: "chunk" | "entity" | "community";
  content: string;
  contextualContent: string | null;
  score: number;
  entitySimilarity: number;
  chunkRelevance: number;
  entityIds: EntityId[];
  communityId: CommunityId | null;
  relationIds: string[];
  chunkId: ChunkId | null;
}

// ==========================================
// GraphSearchStrategy Implementation
// ==========================================

/**
 * グラフ検索戦略
 * Knowledge Graphを活用した検索機能を提供
 */
export class GraphSearchStrategy implements ISearchStrategy {
  // ========================================
  // プロパティ
  // ========================================

  /** 戦略名 */
  readonly name = "graph";

  /** 最後の検索メトリクス */
  private lastMetric: StrategyMetric = {
    enabled: true,
    resultCount: 0,
    processingTime: 0,
    topScore: 0,
  };

  // ========================================
  // コンストラクタ
  // ========================================

  constructor(
    private readonly graphStore: IKnowledgeGraphStore,
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly communitySummarizer?: ICommunitySummarizer,
  ) {}

  // ========================================
  // パブリックメソッド
  // ========================================

  /**
   * グラフ検索を実行する
   *
   * @param query - 検索クエリテキスト
   * @param limit - 取得件数
   * @param filters - 検索フィルター
   * @param options - グラフ検索オプション
   * @returns 検索結果
   */
  async search(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions,
  ): Promise<Result<SearchResultItem[], Error>> {
    const startTime = performance.now();

    try {
      // 1. 入力バリデーション
      const validationResult = this.validateInput(query, limit);
      if (validationResult.isErr()) {
        return validationResult;
      }

      // 2. クエリタイプに応じて検索を実行
      const queryType = options?.queryType ?? "local";
      let searchResult: Result<SearchResultItem[], Error>;

      switch (queryType) {
        case "global":
          searchResult = await this.globalSearch(
            query,
            limit,
            filters,
            options,
          );
          break;
        case "relationship":
          searchResult = await this.relationshipSearch(
            query,
            limit,
            filters,
            options,
          );
          break;
        case "local":
        default:
          searchResult = await this.localSearch(query, limit, filters, options);
          break;
      }

      // 3. メトリクス更新
      const processingTime = performance.now() - startTime;
      if (searchResult.isOk()) {
        this.lastMetric = {
          enabled: true,
          resultCount: searchResult.value.length,
          processingTime,
          topScore:
            searchResult.value.length > 0 ? searchResult.value[0].score : 0,
        };
      }

      return searchResult;
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Graph search failed"),
      );
    }
  }

  /**
   * 検索メトリクスを取得する
   */
  getMetrics(): StrategyMetric {
    return { ...this.lastMetric };
  }

  // ========================================
  // プライベート検索メソッド
  // ========================================

  /**
   * ローカル検索（エンティティベース）
   */
  private async localSearch(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions,
  ): Promise<Result<SearchResultItem[], Error>> {
    // 1. クエリ埋め込み生成
    const embeddingResult = await this.generateQueryEmbedding(query);
    if (embeddingResult.isErr()) {
      return embeddingResult;
    }
    const queryEmbedding = embeddingResult.value;

    // 2. 類似エンティティを検索
    const threshold = options?.entityThreshold ?? DEFAULT_ENTITY_THRESHOLD;
    const entitiesResult = await this.graphStore.findSimilarEntities(
      Array.from(queryEmbedding),
      limit * 2, // 多めに取得してフィルタ後にlimit適用
      threshold,
    );

    if (!entitiesResult.success) {
      return err(entitiesResult.error);
    }

    const entities = entitiesResult.data;
    if (entities.length === 0) {
      return ok([]);
    }

    // 3. エンティティに関連するチャンクを取得し、結果を構築
    const results: GraphSearchResultInternal[] = [];

    for (const entity of entities) {
      // エンティティの類似度（仮想的に計算、実際はfindSimilarEntitiesから取得すべき）
      const entitySimilarity = entity.importance ?? 0.7;

      // エンティティに関連するチャンクIDを取得
      const chunkIds = entity.chunkIds || [];
      if (chunkIds.length > 0) {
        // チャンク関連度（簡易計算）
        const chunkRelevance = 0.8;
        const score = this.calculateLocalScore(
          entitySimilarity,
          chunkRelevance,
        );

        results.push({
          id: entity.id,
          type: "entity",
          content: entity.description || entity.name,
          contextualContent: `Entity: ${entity.name} (${entity.type})`,
          score,
          entitySimilarity,
          chunkRelevance,
          entityIds: [entity.id],
          communityId: null,
          relationIds: [],
          chunkId: chunkIds[0] ?? null,
        });
      } else {
        // チャンクがない場合はエンティティ情報のみ
        const score = entitySimilarity * LOCAL_ENTITY_WEIGHT;
        results.push({
          id: entity.id,
          type: "entity",
          content: entity.description || entity.name,
          contextualContent: `Entity: ${entity.name} (${entity.type})`,
          score,
          entitySimilarity,
          chunkRelevance: 0,
          entityIds: [entity.id],
          communityId: null,
          relationIds: [],
          chunkId: null,
        });
      }
    }

    // 4. 結果を整形して返却
    return ok(this.finalizeResults(results, limit));
  }

  /**
   * グローバル検索（コミュニティサマリベース）
   */
  private async globalSearch(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions,
  ): Promise<Result<SearchResultItem[], Error>> {
    // CommunitySummarizer未設定時はlocalSearchにフォールバック
    if (!this.communitySummarizer) {
      return this.localSearch(query, limit, filters, options);
    }

    // 1. コミュニティサマリを検索
    const summariesResult = await this.communitySummarizer.searchSummaries(
      query,
      { limit },
    );

    if (!summariesResult.success) {
      return err(summariesResult.error);
    }

    const summaries = summariesResult.data;
    if (summaries.length === 0) {
      return ok([]);
    }

    // 2. 結果を構築
    const results: GraphSearchResultInternal[] = summaries.map(
      (summary: CommunitySummary) => ({
        id: summary.communityId,
        type: "community" as const,
        content: summary.summary,
        contextualContent: `Community Level ${summary.level}: ${summary.keywords.slice(0, 3).join(", ")}`,
        score: summary.confidence,
        entitySimilarity: 0,
        chunkRelevance: 0,
        entityIds: [] as EntityId[],
        communityId: summary.communityId,
        relationIds: [],
        chunkId: null,
      }),
    );

    // 3. 結果を整形して返却
    return ok(this.finalizeResults(results, limit));
  }

  /**
   * 関係検索（パスベース）
   */
  private async relationshipSearch(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions,
  ): Promise<Result<SearchResultItem[], Error>> {
    // 1. クエリからエンティティを抽出
    const entitiesResult = await this.extractQueryEntities(
      query,
      options?.entityThreshold ?? DEFAULT_ENTITY_THRESHOLD,
    );

    if (entitiesResult.isErr()) {
      return entitiesResult;
    }

    const queryEntities = entitiesResult.value;

    // 0エンティティの場合は空配列を返す
    if (queryEntities.length === 0) {
      return ok([]);
    }

    // 1エンティティの場合はlocalSearchにフォールバック
    if (queryEntities.length < 2) {
      return this.localSearch(query, limit, filters, options);
    }

    const results: GraphSearchResultInternal[] = [];
    const depth = Math.min(
      options?.traversalDepth ?? DEFAULT_TRAVERSAL_DEPTH,
      MAX_TRAVERSAL_DEPTH,
    );

    // 2. エンティティ間の最短経路を検索
    const sourceEntity = queryEntities[0];
    const targetEntity = queryEntities[1];

    const pathResult = await this.graphStore.findShortestPath(
      sourceEntity.id,
      targetEntity.id,
      depth,
    );

    if (pathResult.success && pathResult.data) {
      const path = pathResult.data;
      const pathDistance = path.entities.length - 1;
      const chunkRelevance = 0.7; // 仮の関連度

      const score = this.calculatePathScore(pathDistance, chunkRelevance);

      results.push({
        id: `path-${sourceEntity.id}-${targetEntity.id}`,
        type: "entity",
        content: `Path: ${path.entities.map((e) => e.name).join(" -> ")}`,
        contextualContent: `Relationship path with ${pathDistance} hops`,
        score,
        entitySimilarity: 0,
        chunkRelevance,
        entityIds: path.entities.map((e) => e.id),
        communityId: null,
        relationIds: path.relations.map((r) => r.id),
        chunkId: null,
      });
    }

    // 3. トラバーサルで関連コンテンツを取得
    const traversalOptions: TraversalOptions = {
      maxDepth: depth,
      direction: "both",
      relationTypes: options?.relationTypes as
        | readonly import("../../../types/rag/graph/types").RelationType[]
        | undefined,
    };

    const traversalResult = await this.graphStore.traverse(
      sourceEntity.id,
      traversalOptions,
    );

    if (traversalResult.success) {
      const traversal = traversalResult.data;

      for (const visitedEntity of traversal.visitedEntities.slice(0, limit)) {
        if (visitedEntity.id === sourceEntity.id) continue;

        const chunkRelevance = 0.6;
        const traversalDepth =
          traversal.paths.find((p) =>
            p.entities.some((e) => e.id === visitedEntity.id),
          )?.entities.length ?? 1;
        const score = this.calculateTraversalScore(
          traversalDepth,
          chunkRelevance,
        );

        results.push({
          id: visitedEntity.id,
          type: "entity",
          content: visitedEntity.description || visitedEntity.name,
          contextualContent: `Related entity: ${visitedEntity.name}`,
          score,
          entitySimilarity: 0,
          chunkRelevance,
          entityIds: [visitedEntity.id],
          communityId: null,
          relationIds: [],
          chunkId: visitedEntity.chunkIds?.[0] ?? null,
        });
      }
    }

    // 4. 結果を整形して返却
    return ok(this.finalizeResults(results, limit));
  }

  // ========================================
  // プライベートユーティリティメソッド
  // ========================================

  /**
   * 入力バリデーション
   */
  private validateInput(query: string, limit: number): Result<void, Error> {
    // クエリバリデーション
    if (!query || query.trim().length === 0) {
      return err(new Error("Query cannot be empty"));
    }
    if (query.length > MAX_QUERY_LENGTH) {
      return err(
        new Error(
          `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`,
        ),
      );
    }

    // limitバリデーション
    if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
      return err(
        new Error(`Limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`),
      );
    }

    return ok(undefined);
  }

  /**
   * クエリ埋め込みを生成
   */
  private async generateQueryEmbedding(
    query: string,
  ): Promise<Result<Float32Array, Error>> {
    try {
      const result = await this.embeddingProvider.embed(query);
      const vector = new Float32Array(result.embedding);
      return ok(vector);
    } catch (error) {
      return err(
        new Error(
          `Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  }

  /**
   * クエリからエンティティを抽出
   */
  private async extractQueryEntities(
    query: string,
    threshold: number,
  ): Promise<Result<StoredEntity[], Error>> {
    // 埋め込みを生成して類似エンティティを検索
    const embeddingResult = await this.generateQueryEmbedding(query);
    if (embeddingResult.isErr()) {
      return embeddingResult;
    }

    const entitiesResult = await this.graphStore.findSimilarEntities(
      Array.from(embeddingResult.value),
      10, // 上位10件を抽出
      threshold,
    );

    if (!entitiesResult.success) {
      return err(entitiesResult.error);
    }

    return ok(entitiesResult.data);
  }

  /**
   * 結果をスコア順でソートし、limitを適用してSearchResultItem形式に変換
   */
  private finalizeResults(
    results: GraphSearchResultInternal[],
    limit: number,
  ): SearchResultItem[] {
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit).map((r) => this.toSearchResultItem(r));
  }

  /**
   * スコアを0-1の範囲にクランプする
   */
  private clampScore(score: number): number {
    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * 距離ベースのスコアを計算する
   * スコア = (1/(1+distance)) × distanceWeight + relevance × relevanceWeight
   */
  private calculateDistanceBasedScore(
    distance: number,
    relevance: number,
    distanceWeight: number,
    relevanceWeight: number,
  ): number {
    const distanceScore = 1 / (1 + distance);
    const score = distanceScore * distanceWeight + relevance * relevanceWeight;
    return this.clampScore(score);
  }

  /**
   * ローカル検索スコアを計算
   * スコア = エンティティ類似度 × 0.6 + チャンク関連度 × 0.4
   */
  private calculateLocalScore(
    entitySimilarity: number,
    chunkRelevance: number,
  ): number {
    const score =
      entitySimilarity * LOCAL_ENTITY_WEIGHT +
      chunkRelevance * LOCAL_CHUNK_WEIGHT;
    return this.clampScore(score);
  }

  /**
   * パス検索スコアを計算
   * スコア = (1/(1+distance)) × 0.5 + チャンク関連度 × 0.5
   */
  private calculatePathScore(
    pathDistance: number,
    chunkRelevance: number,
  ): number {
    return this.calculateDistanceBasedScore(
      pathDistance,
      chunkRelevance,
      PATH_DISTANCE_WEIGHT,
      PATH_CHUNK_WEIGHT,
    );
  }

  /**
   * トラバーサル検索スコアを計算
   */
  private calculateTraversalScore(
    traversalDepth: number,
    chunkRelevance: number,
  ): number {
    return this.calculateDistanceBasedScore(
      traversalDepth,
      chunkRelevance,
      PATH_DISTANCE_WEIGHT,
      PATH_CHUNK_WEIGHT,
    );
  }

  /**
   * 内部結果をSearchResultItem形式に変換
   */
  private toSearchResultItem(
    result: GraphSearchResultInternal,
  ): SearchResultItem {
    return {
      id: result.id,
      type: result.type,
      score: result.score,
      relevance: {
        combined: result.score,
        keyword: 0,
        semantic: 0,
        graph: result.score,
        rerank: null,
        crag: null,
      },
      content: {
        text: result.content,
        summary: result.contextualContent,
        contextBefore: null,
        contextAfter: null,
      },
      highlights: [],
      sources: {
        chunkId: result.chunkId as ChunkId,
        fileId: null,
        entityIds: result.entityIds,
        communityId: result.communityId,
        relationIds: result.relationIds,
      },
    };
  }
}
