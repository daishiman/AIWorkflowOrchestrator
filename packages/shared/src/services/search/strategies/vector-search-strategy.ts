/**
 * @file VectorSearchStrategy実装
 * @description libSQLのDiskANNベクトルインデックスを使用したセマンティック検索
 * CONV-07-03: HybridRAGセマンティック検索
 */

import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { IEmbeddingProvider } from "../../embedding/providers/interfaces";
import type {
  SearchResultItem,
  SearchFilters,
  StrategyMetric,
} from "../../../types/rag/search/types";
import type { ChunkId } from "../../../types/rag/branded";
import {
  searchByVector,
  type VectorSearchOptions,
  type VectorSearchResult,
} from "../../../db/queries/vector-search";
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
// VectorSearchStrategy実装
// ==========================================

/**
 * ベクトル検索戦略
 * libSQLのDiskANNベクトルインデックスを使用したセマンティック検索
 */
export class VectorSearchStrategy implements ISearchStrategy {
  // ========================================
  // プロパティ
  // ========================================

  /** 戦略名 */
  readonly name = "semantic";

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
    private readonly db: LibSQLDatabase<Record<string, never>>,
    private readonly embeddingProvider: IEmbeddingProvider,
  ) {}

  // ========================================
  // パブリックメソッド
  // ========================================

  /**
   * ベクトル検索を実行する
   *
   * クエリテキストから埋め込みを生成し、libSQLのDiskANNベクトルインデックスを使用して
   * セマンティックに類似したチャンクを検索する。
   *
   * @param query - 検索クエリテキスト（1〜1000文字）
   * @param limit - 取得件数（1〜100）
   * @param filters - 検索フィルター（fileIds, minRelevance等）
   * @returns 成功時: SearchResultItem配列、失敗時: Errorを含むResult
   */
  async search(
    query: string,
    limit: number,
    filters?: SearchFilters,
  ): Promise<Result<SearchResultItem[], Error>> {
    const startTime = performance.now();

    // 1. 入力バリデーション
    const validationResult = this.validateInput(query, limit);
    if (validationResult.isErr()) {
      return validationResult;
    }

    // 2. クエリ埋め込み生成
    const embeddingResult = await this.generateQueryEmbedding(query);
    if (embeddingResult.isErr()) {
      return embeddingResult;
    }
    const queryVector = embeddingResult.value;

    // 3. ベクトル検索実行
    try {
      const vectorResults = await this.executeVectorSearch(
        queryVector,
        limit,
        filters,
      );

      // 4. 結果変換（limitを適用）
      let results = vectorResults
        .slice(0, limit)
        .map((r) => this.toSearchResultItem(r));

      // 5. minRelevanceでフィルタリング
      if (filters?.minRelevance && filters.minRelevance > 0) {
        results = results.filter((item) => item.score >= filters.minRelevance);
      }

      // 6. メトリクス更新
      const processingTime = performance.now() - startTime;
      this.lastMetric = {
        enabled: true,
        resultCount: results.length,
        processingTime,
        topScore: results.length > 0 ? results[0].score : 0,
      };

      return ok(results);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * 最後の検索実行のメトリクスを取得する
   *
   * @returns StrategyMetric - 結果数、処理時間、最高スコア等を含むメトリクス
   */
  getMetrics(): StrategyMetric {
    return { ...this.lastMetric };
  }

  // ========================================
  // プライベートメソッド
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
   * ベクトル検索を実行
   */
  private async executeVectorSearch(
    queryVector: Float32Array,
    limit: number,
    filters?: SearchFilters,
  ): Promise<VectorSearchResult[]> {
    // SearchFilters → VectorSearchOptions 変換
    const options: VectorSearchOptions = {
      limit,
      minSimilarity: filters?.minRelevance,
      fileIds: filters?.fileIds?.map((id) => id.toString()) ?? undefined,
    };

    return searchByVector(this.db, queryVector, options);
  }

  /**
   * VectorSearchResult → SearchResultItem 変換
   */
  private toSearchResultItem(result: VectorSearchResult): SearchResultItem {
    return {
      id: result.chunkId,
      type: "chunk",
      score: result.similarity,
      relevance: {
        combined: result.similarity,
        keyword: 0,
        semantic: result.similarity,
        graph: 0,
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
        entityIds: [],
        communityId: null,
        relationIds: [],
      },
    };
  }
}
