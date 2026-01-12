/**
 * @file CachedVectorSearchStrategy実装
 * @description 埋め込みキャッシュ付きVectorSearchStrategy
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
// キャッシュ設定型
// ==========================================

/**
 * CachedVectorSearchStrategyオプション
 */
export interface CachedVectorSearchOptions {
  /** キャッシュ最大有効期限（ミリ秒） デフォルト: 5分 */
  cacheMaxAge?: number;
  /** 最大キャッシュサイズ デフォルト: 1000 */
  maxCacheSize?: number;
}

/**
 * キャッシュエントリ
 */
interface CacheEntry {
  embedding: Float32Array;
  timestamp: number;
}

/**
 * キャッシュ統計
 */
export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
}

// ==========================================
// CachedVectorSearchStrategy実装
// ==========================================

/**
 * キャッシュ付きベクトル検索戦略
 * クエリ埋め込みをLRUキャッシュして効率化
 */
export class CachedVectorSearchStrategy implements ISearchStrategy {
  // ========================================
  // プロパティ
  // ========================================

  /** 戦略名 */
  readonly name = "semantic";

  /** 埋め込みキャッシュ（LRU） */
  private readonly cache = new Map<string, CacheEntry>();

  /** キャッシュ有効期限（ミリ秒） */
  private readonly cacheMaxAge: number;

  /** 最大キャッシュサイズ */
  private readonly maxCacheSize: number;

  /** キャッシュヒット数 */
  private cacheHits = 0;

  /** キャッシュミス数 */
  private cacheMisses = 0;

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
    options?: CachedVectorSearchOptions,
  ) {
    this.cacheMaxAge = options?.cacheMaxAge ?? 5 * 60 * 1000; // 5分
    this.maxCacheSize = options?.maxCacheSize ?? 1000;
  }

  // ========================================
  // パブリックメソッド
  // ========================================

  /**
   * ベクトル検索を実行する（キャッシュ付き）
   *
   * クエリ埋め込みをLRUキャッシュして、同一クエリの再検索を高速化する。
   * キャッシュミス時はembeddingProviderから新規生成し、キャッシュに保存する。
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

    // 2. キャッシュからクエリ埋め込みを取得（またはミスで生成）
    const embeddingResult = await this.getOrGenerateEmbedding(query);
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

  /**
   * 埋め込みキャッシュを全クリアし、統計をリセットする
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * キャッシュ統計を取得する
   *
   * @returns CacheStats - サイズ、ヒット数、ミス数、ヒット率を含む統計
   */
  getCacheStats(): CacheStats {
    const total = this.cacheHits + this.cacheMisses;
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: total > 0 ? this.cacheHits / total : 0,
    };
  }

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * キャッシュキーを生成
   */
  private getCacheKey(query: string): string {
    return query.toLowerCase().trim();
  }

  /**
   * キャッシュから取得または新規生成
   */
  private async getOrGenerateEmbedding(
    query: string,
  ): Promise<Result<Float32Array, Error>> {
    const cacheKey = this.getCacheKey(query);
    const now = Date.now();

    // キャッシュチェック
    const cached = this.cache.get(cacheKey);
    if (cached && now - cached.timestamp < this.cacheMaxAge) {
      // キャッシュヒット
      this.cacheHits++;
      // LRU: 最近使用されたエントリを後方に移動
      this.cache.delete(cacheKey);
      this.cache.set(cacheKey, cached);
      return ok(cached.embedding);
    }

    // キャッシュミス - 新規生成
    this.cacheMisses++;
    try {
      const result = await this.embeddingProvider.embed(query);
      const vector = new Float32Array(result.embedding);

      // キャッシュに保存
      this.cache.set(cacheKey, {
        embedding: vector,
        timestamp: now,
      });

      // キャッシュサイズ制限
      this.evictIfNeeded();

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
   * キャッシュサイズ超過時に古いエントリを削除（LRU）
   */
  private evictIfNeeded(): void {
    while (this.cache.size > this.maxCacheSize) {
      // Mapは挿入順を保持するので、最初のエントリが最も古い
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      } else {
        break;
      }
    }
  }

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
