/**
 * KeywordSearchStrategy - FTS5/BM25ベースのキーワード検索戦略
 *
 * @module @repo/shared/services/search/keyword-search-strategy
 * @description CONV-07-02: キーワード検索戦略（FTS5/BM25）
 */

import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { type Result, ok, err, isErr } from "../../types/rag/result";
import type {
  SearchQuery,
  SearchResultItem,
  SearchResultType,
  SearchResultContent,
  SearchResultSources,
  Highlight,
  HighlightOffset,
  RelevanceScore,
  StrategyMetric,
} from "../../types/rag/search/types";
import type { ChunkId, FileId } from "../../types/rag/branded";
import {
  searchChunksByKeyword,
  searchChunksByPhrase,
  searchChunksByNear,
  escapeFts5Query,
  type FtsSearchResult,
  type SearchOptions as ChunkSearchOptions,
  type NearSearchOptions,
} from "../../db/queries/chunks-search";

// ============================================
// 型定義
// ============================================

/**
 * 検索エラー型
 */
export type KeywordSearchError =
  | { type: "validation"; message: string }
  | { type: "database"; message: string; cause?: Error }
  | { type: "timeout"; message: string };

/**
 * NEAR検索オプション
 */
export interface KeywordNearOptions {
  nearDistance?: number;
  limit?: number;
  offset?: number;
  fileId?: string;
}

/**
 * 検索戦略インターフェース
 */
export interface IKeywordSearchStrategy {
  search(
    query: SearchQuery,
  ): Promise<Result<readonly SearchResultItem[], KeywordSearchError>>;
  searchNear(
    terms: string[],
    options?: KeywordNearOptions,
  ): Promise<Result<readonly SearchResultItem[], KeywordSearchError>>;
  getStrategyName(): string;
  getMetrics(): StrategyMetric;
  normalizeScore(rawScore: number, scaleFactor?: number): number;
  buildFTS5Query(text: string): string;
  toSearchResultItem(ftsResult: FtsSearchResult): SearchResultItem;
}

// ============================================
// 定数
// ============================================

/** クエリ最大長（外部からも参照可能） */
export const MAX_QUERY_LENGTH = 1000;

/** デフォルトのBM25スケールファクター（外部からも参照可能） */
export const DEFAULT_SCALE_FACTOR = 0.5;

/** 検索タイムアウト（ms）（外部からも参照可能） */
export const SEARCH_TIMEOUT_MS = 10000;

// ============================================
// KeywordSearchStrategy クラス
// ============================================

/**
 * FTS5/BM25ベースのキーワード検索戦略
 *
 * @description
 * SQLite FTS5のBM25スコアリングを使用した全文検索を提供。
 * 3つの検索モード（keyword/phrase/near）をサポート。
 *
 * @example
 * ```typescript
 * const strategy = new KeywordSearchStrategy(db);
 * const result = await strategy.search(query);
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export class KeywordSearchStrategy implements IKeywordSearchStrategy {
  /** 戦略名 */
  private readonly strategyName = "keyword";

  /** メトリクス */
  private metrics: StrategyMetric = {
    enabled: true,
    resultCount: 0,
    processingTime: 0,
    topScore: 0,
  };

  /**
   * コンストラクタ
   * @param db - LibSQLデータベースインスタンス
   */
  constructor(private readonly db: LibSQLDatabase<Record<string, never>>) {}

  // ============================================
  // Public Methods
  // ============================================

  /**
   * キーワード検索を実行
   *
   * @param query - 検索クエリ
   * @returns 検索結果またはエラー
   */
  async search(
    query: SearchQuery,
  ): Promise<Result<readonly SearchResultItem[], KeywordSearchError>> {
    const startTime = performance.now();

    try {
      // バリデーション
      const validationResult = this.validateQuery(query);
      if (isErr(validationResult)) {
        return validationResult;
      }

      // 空クエリチェック
      const trimmedText = query.text.trim();
      if (!trimmedText) {
        this.updateMetrics(0, 0, startTime);
        return ok([]);
      }

      // 検索モード判定
      const searchMode = this.detectSearchMode(trimmedText);

      // 検索オプション構築
      const searchOptions = this.buildSearchOptions(query);

      // 検索実行（タイムアウト付き）
      const searchPromise =
        searchMode === "phrase"
          ? searchChunksByPhrase(this.db, {
              ...searchOptions,
              query: trimmedText.replace(/^"|"$/g, ""),
            })
          : searchChunksByKeyword(this.db, {
              ...searchOptions,
              query: trimmedText,
            });

      const response = await Promise.race([
        searchPromise,
        this.createTimeoutPromise(),
      ]);

      // 結果変換
      const results = response.results.map((r) => this.toSearchResultItem(r));

      // メトリクス更新
      const topScore = results.length > 0 ? results[0].score : 0;
      this.updateMetrics(results.length, topScore, startTime);

      return ok(results);
    } catch (error) {
      this.updateMetricsOnError(startTime);

      if (error instanceof Error && error.message === "Search timeout") {
        return err({
          type: "timeout",
          message: "検索がタイムアウトしました（" + SEARCH_TIMEOUT_MS + "ms）",
        });
      }

      return err({
        type: "database",
        message: "データベースエラーが発生しました",
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * NEAR検索を実行
   *
   * @param terms - 検索キーワード配列（2つ以上）
   * @param options - NEAR検索オプション
   * @returns 検索結果またはエラー
   */
  async searchNear(
    terms: string[],
    options: KeywordNearOptions = {},
  ): Promise<Result<readonly SearchResultItem[], KeywordSearchError>> {
    const startTime = performance.now();

    try {
      // バリデーション
      if (terms.length < 2) {
        return err({
          type: "validation",
          message: "NEAR検索には2つ以上のキーワードが必要です",
        });
      }

      const nearOptions: NearSearchOptions = {
        nearDistance: options.nearDistance ?? 5,
        limit: options.limit ?? 20,
        offset: options.offset ?? 0,
        fileId: options.fileId,
        highlightTags: ["<mark>", "</mark>"],
        bm25ScaleFactor: DEFAULT_SCALE_FACTOR,
      };

      const response = await Promise.race([
        searchChunksByNear(this.db, terms, nearOptions),
        this.createTimeoutPromise(),
      ]);

      // 結果変換
      const results = response.results.map((r) => this.toSearchResultItem(r));

      // メトリクス更新
      const topScore = results.length > 0 ? results[0].score : 0;
      this.updateMetrics(results.length, topScore, startTime);

      return ok(results);
    } catch (error) {
      this.updateMetricsOnError(startTime);

      if (error instanceof Error && error.message === "Search timeout") {
        return err({
          type: "timeout",
          message: "検索がタイムアウトしました（" + SEARCH_TIMEOUT_MS + "ms）",
        });
      }

      return err({
        type: "database",
        message: "データベースエラーが発生しました",
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * 戦略名を取得
   */
  getStrategyName(): string {
    return this.strategyName;
  }

  /**
   * メトリクスを取得
   */
  getMetrics(): StrategyMetric {
    return { ...this.metrics };
  }

  /**
   * BM25スコアを0-1に正規化
   *
   * @description
   * FTS5のbm25()関数は負の値を返す（小さいほど関連性が高い）
   * シグモイド関数で0-1に変換し、1が最も関連性が高いスコアとする
   *
   * @param rawScore - BM25生スコア（負の値）
   * @param scaleFactor - スケールファクター（デフォルト: 0.5）
   * @returns 正規化されたスコア（0-1、1が最高）
   */
  normalizeScore(
    rawScore: number,
    scaleFactor: number = DEFAULT_SCALE_FACTOR,
  ): number {
    // シグモイド関数: 1 / (1 + exp(rawScore * scaleFactor))
    const normalized = 1 / (1 + Math.exp(rawScore * scaleFactor));
    // 小数点4桁で丸める
    return Math.round(normalized * 10000) / 10000;
  }

  /**
   * FTS5クエリを構築
   *
   * @param text - 検索テキスト
   * @returns FTS5クエリ文字列
   */
  buildFTS5Query(text: string): string {
    return escapeFts5Query(text);
  }

  /**
   * FtsSearchResultをSearchResultItemに変換
   *
   * @param ftsResult - FTS5検索結果
   * @returns SearchResultItem
   */
  toSearchResultItem(ftsResult: FtsSearchResult): SearchResultItem {
    const highlights = this.extractHighlights(ftsResult.highlightedContent);

    const content: SearchResultContent = {
      text: ftsResult.content,
      summary: ftsResult.contextualContent,
      contextBefore: null,
      contextAfter: null,
    };

    const sources: SearchResultSources = {
      chunkId: ftsResult.id as ChunkId,
      fileId: ftsResult.fileId as FileId,
      entityIds: [],
      communityId: null,
      relationIds: [],
    };

    const relevance: RelevanceScore = {
      combined: ftsResult.score,
      keyword: ftsResult.score,
      semantic: 0,
      graph: 0,
      rerank: null,
      crag: null,
    };

    return {
      id: ftsResult.id,
      type: "chunk" as SearchResultType,
      score: ftsResult.score,
      relevance,
      content,
      highlights,
      sources,
    };
  }

  // ============================================
  // Private Methods
  // ============================================

  /**
   * クエリバリデーション
   */
  private validateQuery(query: SearchQuery): Result<void, KeywordSearchError> {
    if (!query || typeof query.text !== "string") {
      return err({
        type: "validation",
        message: "無効なクエリ形式です",
      });
    }

    if (query.text.length > MAX_QUERY_LENGTH) {
      return err({
        type: "validation",
        message: "クエリ長は" + MAX_QUERY_LENGTH + "文字以内にしてください",
      });
    }

    return ok(undefined);
  }

  /**
   * 検索モードを判定
   */
  private detectSearchMode(text: string): "keyword" | "phrase" {
    // ダブルクォートで囲まれていればフレーズ検索
    if (text.startsWith('"') && text.endsWith('"')) {
      return "phrase";
    }
    return "keyword";
  }

  /**
   * 検索オプションを構築
   */
  private buildSearchOptions(query: SearchQuery): ChunkSearchOptions {
    const fileId = query.filters.fileIds?.[0] as string | undefined;

    return {
      query: query.text,
      limit: query.options.limit,
      offset: query.options.offset,
      fileId,
      highlightTags: ["<mark>", "</mark>"],
      bm25ScaleFactor: DEFAULT_SCALE_FACTOR,
    };
  }

  /**
   * タイムアウトPromiseを作成
   */
  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Search timeout")), SEARCH_TIMEOUT_MS),
    );
  }

  /**
   * ハイライト情報を抽出
   */
  private extractHighlights(highlightedContent: string): readonly Highlight[] {
    const highlights: Highlight[] = [];
    const regex = /<mark>(.*?)<\/mark>/g;
    let match;

    while ((match = regex.exec(highlightedContent)) !== null) {
      const fragment = match[1];
      const start = match.index;
      const end = start + match[0].length;

      const offset: HighlightOffset = { start, end };

      highlights.push({
        field: "content",
        fragment,
        offsets: [offset],
      });
    }

    return highlights;
  }

  /**
   * メトリクスを更新
   */
  private updateMetrics(
    resultCount: number,
    topScore: number,
    startTime: number,
  ): void {
    this.metrics = {
      enabled: true,
      resultCount,
      processingTime: performance.now() - startTime,
      topScore,
    };
  }

  /**
   * エラー時のメトリクス更新
   */
  private updateMetricsOnError(startTime: number): void {
    this.metrics = {
      ...this.metrics,
      processingTime: performance.now() - startTime,
    };
  }
}
