/**
 * @file GraphRAGクエリサービス
 * @description CONV-08-04: コミュニティ要約統合によるGraphRAGクエリ処理
 */

import { z } from "zod";
import type { Result } from "../../types/rag/result";
import { ok, err } from "../../types/rag/result";
import type { CommunityId } from "../../types/rag/branded";
import type { CommunitySummary } from "../graph/types";
import type { ICommunitySummarizer } from "../graph/interfaces/community-summarizer.interface";
import type { IQueryClassifier, QueryType, SearchWeights } from "./types";
import type { ILLMProvider } from "../extraction/interfaces";
import type { IEmbeddingProvider } from "../embedding/providers/interfaces";

// =============================================================================
// Types
// =============================================================================

/**
 * GraphRAGクエリオプション
 */
export interface GraphRAGQueryOptions {
  /** 最大検索結果数 (1-20, デフォルト: 10) */
  limit?: number;
  /** コミュニティ階層レベル（指定時はそのレベルのみ検索） */
  communityLevel?: number;
  /** 要約のconfidence閾値（これ未満は除外, デフォルト: 0.5） */
  confidenceThreshold?: number;
  /** 検索戦略の重み */
  searchWeights?: SearchWeights;
  /** コミュニティ要約検索を有効化（デフォルト: true） */
  enableCommunitySummary?: boolean;
}

/**
 * コミュニティ要約参照
 */
export interface CommunitySummaryReference {
  /** コミュニティID */
  readonly communityId: CommunityId;
  /** 階層レベル */
  readonly level: number;
  /** 要約テキスト */
  readonly summary: string;
  /** 要約の信頼度 */
  readonly confidence: number;
  /** クエリとの関連度スコア */
  readonly relevanceScore: number;
}

/**
 * チャンク参照（将来拡張用）
 */
export interface ChunkReference {
  readonly chunkId: string;
  readonly content: string;
  readonly relevanceScore: number;
}

/**
 * エンティティ参照（将来拡張用）
 */
export interface EntityReference {
  readonly entityId: string;
  readonly name: string;
  readonly type: string;
  readonly relevanceScore: number;
}

/**
 * 検索戦略
 */
export interface SearchStrategy {
  /** コミュニティ要約を使用したか */
  readonly usedCommunitySummary: boolean;
  /** フォールバックが発生したか */
  readonly fallbackOccurred: boolean;
  /** フォールバック理由（該当時） */
  readonly fallbackReason?: string;
}

/**
 * クエリメタデータ
 */
export interface QueryMetadata {
  /** 判定されたクエリタイプ */
  readonly queryType: QueryType;
  /** 処理時間（ミリ秒） */
  readonly processingTimeMs: number;
  /** 使用された検索戦略 */
  readonly searchStrategy: SearchStrategy;
  /** コミュニティ要約検索が実行されたか */
  readonly communitySummarySearchExecuted: boolean;
}

/**
 * GraphRAGクエリレスポンス
 */
export interface GraphRAGQueryResponse {
  /** 生成された回答テキスト */
  readonly answer: string;
  /** 参照したコミュニティ要約 */
  readonly communitySummaries: readonly CommunitySummaryReference[];
  /** 参照したチャンク（将来拡張用） */
  readonly chunks: readonly ChunkReference[];
  /** 参照したエンティティ（将来拡張用） */
  readonly entities: readonly EntityReference[];
  /** 処理メタデータ */
  readonly metadata: QueryMetadata;
}

/**
 * GraphRAGクエリエラー型
 */
export type GraphRAGQueryError =
  | {
      code: "INVALID_QUERY";
      message: string;
      details?: { field: string; reason: string };
    }
  | { code: "CLASSIFICATION_FAILED"; message: string; cause?: Error }
  | { code: "COMMUNITY_SEARCH_FAILED"; message: string; cause?: Error }
  | { code: "LLM_GENERATION_FAILED"; message: string; cause?: Error };

// =============================================================================
// Validation Schema
// =============================================================================

const graphRAGQueryOptionsSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1, "limitは1以上である必要があります")
    .max(20, "limitは20以下である必要があります")
    .optional()
    .default(10),
  communityLevel: z
    .number()
    .int()
    .min(0, "communityLevelは0以上である必要があります")
    .max(5, "communityLevelは5以下である必要があります")
    .optional(),
  confidenceThreshold: z
    .number()
    .min(0, "confidenceThresholdは0以上である必要があります")
    .max(1, "confidenceThresholdは1以下である必要があります")
    .optional()
    .default(0.5),
  enableCommunitySummary: z.boolean().optional().default(true),
});

// =============================================================================
// Constants
// =============================================================================

const MAX_QUERY_LENGTH = 10000;

// =============================================================================
// Dependencies Interface
// =============================================================================

/**
 * GraphRAGQueryServiceの依存関係
 */
export interface GraphRAGQueryServiceDependencies {
  /** クエリ分類器 */
  queryClassifier: IQueryClassifier;
  /** コミュニティ要約サービス */
  communitySummarizer: ICommunitySummarizer;
  /** 埋め込みプロバイダー */
  embeddingProvider: IEmbeddingProvider;
  /** LLMプロバイダー */
  llmProvider: ILLMProvider;
}

// =============================================================================
// Service Interface
// =============================================================================

/**
 * GraphRAGクエリサービスインターフェース
 */
export interface IGraphRAGQueryService {
  /**
   * GraphRAGクエリを実行し、コミュニティ要約を含む回答を生成
   * @param query ユーザークエリ（空文字不可）
   * @param options クエリオプション
   * @returns 回答とメタデータを含むResult
   */
  query(
    query: string,
    options?: GraphRAGQueryOptions,
  ): Promise<Result<GraphRAGQueryResponse, GraphRAGQueryError>>;
}

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * GraphRAGクエリサービス
 *
 * @description
 * コミュニティ要約を活用したGraphRAGクエリ処理を実行する。
 * クエリを分類し、関連するコミュニティ要約を検索し、LLMで回答を生成する。
 */
export class GraphRAGQueryService implements IGraphRAGQueryService {
  private readonly queryClassifier: IQueryClassifier;
  private readonly communitySummarizer: ICommunitySummarizer;
  private readonly embeddingProvider: IEmbeddingProvider;
  private readonly llmProvider: ILLMProvider;

  constructor(dependencies: GraphRAGQueryServiceDependencies) {
    this.queryClassifier = dependencies.queryClassifier;
    this.communitySummarizer = dependencies.communitySummarizer;
    this.embeddingProvider = dependencies.embeddingProvider;
    this.llmProvider = dependencies.llmProvider;
  }

  /**
   * GraphRAGクエリを実行
   */
  async query(
    query: string,
    options?: GraphRAGQueryOptions,
  ): Promise<Result<GraphRAGQueryResponse, GraphRAGQueryError>> {
    const startTime = performance.now();

    // 1. 入力バリデーション
    const validationResult = this.validateInput(query, options);
    if (!validationResult.success) {
      return validationResult;
    }
    const validatedOptions = validationResult.data;

    // 2. クエリ分類とコミュニティ要約検索を並列実行（パフォーマンス改善）
    const [classificationResult, searchResult] = await Promise.all([
      this.classifyQuery(query),
      this.searchWithFallback(query, validatedOptions),
    ]);

    // クエリタイプの決定（分類失敗時はhybridにフォールバック）
    const queryType = classificationResult.success
      ? classificationResult.data.type
      : ("hybrid" as QueryType);

    // 4. プロンプト構築
    const prompt = this.buildPrompt(query, searchResult.summaries, queryType);

    // 5. LLM回答生成
    const llmResult = await this.llmProvider.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    if (!llmResult.success) {
      return err({
        code: "LLM_GENERATION_FAILED",
        message: `LLM generation failed: ${llmResult.error.message}`,
        cause: llmResult.error,
      });
    }

    // 6. レスポンス構築
    const processingTimeMs = performance.now() - startTime;

    return ok({
      answer: llmResult.data.text,
      communitySummaries: searchResult.summaries,
      chunks: [], // 将来拡張用
      entities: [], // 将来拡張用
      metadata: {
        queryType,
        processingTimeMs,
        searchStrategy: {
          usedCommunitySummary: searchResult.summaries.length > 0,
          fallbackOccurred: searchResult.fallbackOccurred,
          fallbackReason: searchResult.fallbackReason,
        },
        communitySummarySearchExecuted: validatedOptions.enableCommunitySummary,
      },
    });
  }

  /**
   * 入力をバリデーション
   */
  private validateInput(
    query: string,
    options?: GraphRAGQueryOptions,
  ): Result<
    {
      limit: number;
      communityLevel?: number;
      confidenceThreshold: number;
      enableCommunitySummary: boolean;
    },
    GraphRAGQueryError
  > {
    // クエリ検証
    if (!query || query.trim().length === 0) {
      return err({
        code: "INVALID_QUERY",
        message: "クエリは空にできません",
        details: { field: "query", reason: "空文字です" },
      });
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return err({
        code: "INVALID_QUERY",
        message: `クエリは${MAX_QUERY_LENGTH}文字以下である必要があります`,
        details: { field: "query", reason: "文字数超過" },
      });
    }

    // オプション検証
    const parseResult = graphRAGQueryOptionsSchema.safeParse(options ?? {});
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return err({
        code: "INVALID_QUERY",
        message: firstIssue?.message ?? "オプションが無効です",
        details: {
          field: firstIssue?.path.join(".") ?? "options",
          reason: firstIssue?.message ?? "不明なバリデーションエラー",
        },
      });
    }

    return ok(parseResult.data);
  }

  /**
   * クエリを分類
   */
  private async classifyQuery(query: string) {
    return this.queryClassifier.classify(query);
  }

  /**
   * コミュニティ要約検索のフォールバック処理
   */
  private async searchWithFallback(
    query: string,
    options: {
      limit: number;
      communityLevel?: number;
      confidenceThreshold: number;
      enableCommunitySummary: boolean;
    },
  ): Promise<{
    summaries: CommunitySummaryReference[];
    fallbackOccurred: boolean;
    fallbackReason?: string;
  }> {
    // コミュニティ要約検索が無効の場合
    if (!options.enableCommunitySummary) {
      return {
        summaries: [],
        fallbackOccurred: false,
      };
    }

    const result = await this.searchCommunitySummaries(query, options);

    if (!result.success) {
      // SF-05: silent fallback を明示化 — 空配列 fallback は維持するが警告をログに記録
      console.warn(
        "[GraphRAGQueryService] community search failed, falling back to empty results:",
        result.error.message,
      );
      return {
        summaries: [],
        fallbackOccurred: true,
        fallbackReason: result.error.message,
      };
    }

    const filtered = this.filterAndTransformSummaries(
      result.data,
      options.confidenceThreshold,
    );

    return {
      summaries: filtered,
      fallbackOccurred: false,
    };
  }

  /**
   * コミュニティ要約を検索
   */
  private async searchCommunitySummaries(
    query: string,
    options: {
      limit: number;
      communityLevel?: number;
    },
  ): Promise<Result<CommunitySummary[], Error>> {
    return this.communitySummarizer.searchSummaries(query, {
      limit: options.limit,
      level: options.communityLevel,
    });
  }

  /**
   * 検索結果をフィルタリングして変換
   */
  private filterAndTransformSummaries(
    summaries: CommunitySummary[],
    confidenceThreshold: number,
  ): CommunitySummaryReference[] {
    return summaries
      .filter((summary) => summary.confidence >= confidenceThreshold)
      .map((summary) => ({
        communityId: summary.communityId,
        level: summary.level,
        summary: summary.summary,
        confidence: summary.confidence,
        relevanceScore: summary.confidence, // 初期実装ではconfidenceをスコアとして使用
      }));
  }

  /**
   * プロンプトを構築
   */
  private buildPrompt(
    query: string,
    communitySummaries: CommunitySummaryReference[],
    _queryType: QueryType,
  ): string {
    let prompt = `あなたはナレッジベースに基づいて質問に回答するアシスタントです。\n\n`;

    if (communitySummaries.length > 0) {
      prompt += `以下のコミュニティ要約は、質問に関連するトピックの概要です。\n`;
      prompt += `回答を生成する際の参考にしてください。\n\n`;
      prompt += `## コミュニティ要約\n\n`;

      for (const summary of communitySummaries) {
        prompt += `### レベル ${summary.level} コミュニティ\n`;
        prompt += `${summary.summary}\n`;
        prompt += `信頼度: ${summary.confidence}\n\n`;
      }
    }

    prompt += `## ユーザーの質問\n\n`;
    prompt += `${this.escapeForPrompt(query)}\n\n`;
    prompt += `## 回答指示\n\n`;
    prompt += `- 提供されたコンテキスト情報に基づいて回答してください\n`;
    prompt += `- コンテキストに含まれない情報は推測しないでください\n`;
    prompt += `- 回答は簡潔かつ正確に行ってください\n`;
    prompt += `- 日本語で回答してください\n`;

    return prompt;
  }

  /**
   * ユーザー入力をエスケープ
   */
  private escapeForPrompt(input: string): string {
    return input.replace(/{{/g, "{ {").replace(/}}/g, "} }");
  }
}
