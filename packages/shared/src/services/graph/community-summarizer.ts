/**
 * @file コミュニティ要約サービス実装
 * @module @repo/shared/services/graph/community-summarizer
 * @description LLMを使用したコミュニティ要約生成サービス
 */

import type { Result } from "../../types/rag/result";
import { ok, err } from "../../types/rag/result";
import type { CommunityId } from "../../types/rag/branded";
import type {
  ICommunitySummarizer,
  CommunitySummarySearchOptions,
} from "./interfaces/community-summarizer.interface";
import type { ICommunityRepository } from "./interfaces/community-repository.interface";
import type { IKnowledgeGraphStore } from "./knowledge-graph-store";
import type { ILLMProvider } from "../extraction/interfaces";
import type { IEmbeddingProvider } from "../embedding/providers/interfaces";
import type {
  Community,
  CommunityStructure,
  StoredEntity,
  StoredRelation,
  CommunitySummary,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
} from "./types";
import {
  CommunitySummarizationError,
  CommunitySummarizationErrorCode,
} from "./types";
import { buildCommunitySummaryPrompt } from "./prompts/community-summary-prompt";

/**
 * デフォルトオプション
 */
const DEFAULT_OPTIONS: Required<CommunitySummarizationOptions> = {
  maxSummaryTokens: 200,
  maxKeywords: 10,
  useChildSummaries: true,
  generateEmbedding: true,
  maxConcurrency: 5,
  summaryStyle: "concise",
};

/**
 * LLMレスポンスのJSON構造
 */
interface LLMSummaryResponse {
  summary: string;
  keywords: string[];
  mainEntities: string[];
  mainRelations: string[];
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
}

/**
 * コミュニティ要約サービス
 *
 * @description
 * Leidenアルゴリズムで検出されたコミュニティに対してLLMで要約を生成する。
 * 埋め込みも生成してセマンティック検索を可能にする。
 */
export class CommunitySummarizer implements ICommunitySummarizer {
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly graphStore: IKnowledgeGraphStore,
    private readonly communityRepository: ICommunityRepository,
  ) {}

  /**
   * 単一コミュニティの要約を生成
   */
  async summarize(
    community: Community,
    entities: readonly StoredEntity[],
    relations: readonly StoredRelation[],
    options?: CommunitySummarizationOptions,
  ): Promise<Result<CommunitySummary, Error>> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // 子コミュニティの要約を取得
    const childSummaries: CommunitySummary[] = [];
    if (opts.useChildSummaries && community.childCommunityIds.length > 0) {
      for (const childId of community.childCommunityIds) {
        const childResult = await this.communityRepository.getSummary(childId);
        if (childResult.success && childResult.data) {
          childSummaries.push(childResult.data);
        }
      }
    }

    // プロンプトを構築
    const prompt = buildCommunitySummaryPrompt(
      entities,
      relations,
      childSummaries,
      opts,
    );

    // LLMで要約生成
    const llmResult = await this.llmProvider.generate(prompt, {
      temperature: 0.3,
      responseFormat: "json",
      maxTokens: opts.maxSummaryTokens * 2,
    });

    if (!llmResult.success) {
      return err(
        new CommunitySummarizationError(
          `LLM generation failed: ${llmResult.error.message}`,
          CommunitySummarizationErrorCode.LLM_GENERATION_FAILED,
          llmResult.error,
        ),
      );
    }

    // JSONをパース
    const parseResult = this.parseJsonResponse(llmResult.data.text);
    if (!parseResult.success) {
      return err(parseResult.error);
    }

    const llmResponse = parseResult.data;

    // 埋め込みを生成（オプション）
    let embedding: number[] | undefined;
    if (opts.generateEmbedding) {
      try {
        const embedResult = await this.embeddingProvider.embed(
          llmResponse.summary,
        );
        embedding = embedResult.embedding;
      } catch (error) {
        // SF-09: 埋め込み失敗は警告のみで続行（embedding なしで summary は保存）
        console.warn(
          `[CommunitySummarizer] Embedding generation failed for community ${community.id}:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    // CommunitySummaryを構築
    const summary: CommunitySummary = {
      communityId: community.id,
      level: community.level,
      summary: llmResponse.summary,
      keywords: llmResponse.keywords,
      mainEntities: llmResponse.mainEntities.slice(0, 5),
      mainRelations: llmResponse.mainRelations.slice(0, 5),
      sentiment: llmResponse.sentiment,
      confidence: llmResponse.confidence,
      tokenCount: llmResult.data.tokensUsed,
      embedding,
      createdAt: new Date(),
    };

    // DB保存
    const saveResult = await this.communityRepository.updateSummary(
      community.id,
      summary,
    );
    if (!saveResult.success) {
      return err(
        new CommunitySummarizationError(
          `Failed to save summary: ${saveResult.error.message}`,
          CommunitySummarizationErrorCode.DB_SAVE_FAILED,
          saveResult.error,
        ),
      );
    }

    return ok(summary);
  }

  /**
   * 全コミュニティの要約を生成（階層順）
   */
  async summarizeAll(
    communityStructure: CommunityStructure,
    options?: CommunitySummarizationOptions,
  ): Promise<Result<CommunitySummarizationResult, Error>> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const startTime = Date.now();

    // レベル降順でソート（子から親へ）
    const sortedCommunities = [...communityStructure.communities].sort(
      (a, b) => a.level - b.level,
    );

    const summaries: CommunitySummary[] = [];
    const failedCommunities: CommunityId[] = [];
    let totalTokensUsed = 0;

    // 同じレベルの処理を並列で実行
    const levelGroups = this.groupByLevel(sortedCommunities);

    for (const communities of levelGroups) {
      // チャンク分割して並列処理
      const chunks = this.chunkArray(communities, opts.maxConcurrency);

      for (const chunk of chunks) {
        const results = await Promise.all(
          chunk.map((community) =>
            this.summarizeCommunityWithData(community, opts),
          ),
        );

        for (const result of results) {
          if (result.success) {
            summaries.push(result.data);
            totalTokensUsed += result.data.tokenCount;
          } else {
            const communityId = this.extractCommunityIdFromError(result.error);
            if (communityId) {
              failedCommunities.push(communityId);
            }
          }
        }
      }
    }

    const processingTimeMs = Date.now() - startTime;

    return ok({
      summaries,
      failedCommunities,
      totalTokensUsed,
      processingTimeMs,
    });
  }

  /**
   * コミュニティ要約をセマンティック検索
   */
  async searchSummaries(
    query: string,
    options?: CommunitySummarySearchOptions,
  ): Promise<Result<CommunitySummary[], Error>> {
    const limit = options?.limit ?? 10;

    // クエリの埋め込みを生成
    let queryEmbedding: number[];
    try {
      const embedResult = await this.embeddingProvider.embed(query);
      queryEmbedding = embedResult.embedding;
    } catch (error) {
      return err(
        new CommunitySummarizationError(
          `Failed to embed query: ${error instanceof Error ? error.message : String(error)}`,
          CommunitySummarizationErrorCode.EMBEDDING_FAILED,
          error instanceof Error ? error : undefined,
        ),
      );
    }

    // リポジトリで検索
    return this.communityRepository.searchSummariesByEmbedding(queryEmbedding, {
      level: options?.level,
      limit,
    });
  }

  /**
   * 要約を更新
   */
  async updateSummary(
    communityId: CommunityId,
  ): Promise<Result<CommunitySummary, Error>> {
    // コミュニティを取得
    const communityResult =
      await this.communityRepository.findById(communityId);
    if (!communityResult.success) {
      return err(communityResult.error);
    }

    if (!communityResult.data) {
      return err(
        new CommunitySummarizationError(
          `Community not found: ${communityId}`,
          CommunitySummarizationErrorCode.COMMUNITY_NOT_FOUND,
        ),
      );
    }

    const community = communityResult.data;

    // エンティティと関係を取得
    const dataResult = await this.getCommunityData(community);
    if (!dataResult.success) {
      return err(dataResult.error);
    }

    const { entities, relations } = dataResult.data;

    // 要約を再生成
    return this.summarize(community, entities, relations);
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * JSONレスポンスをパース
   */
  private parseJsonResponse(
    text: string,
  ): Result<LLMSummaryResponse, CommunitySummarizationError> {
    // JSON部分を抽出（```json...```や```...```を除去）
    let jsonText = text;
    const jsonMatch =
      text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
      text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      jsonText = jsonMatch[1] ?? jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(jsonText) as LLMSummaryResponse;

      // 必須フィールドのバリデーション
      if (!parsed.summary || typeof parsed.summary !== "string") {
        throw new Error("Missing or invalid 'summary' field");
      }

      return ok({
        summary: parsed.summary,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        mainEntities: Array.isArray(parsed.mainEntities)
          ? parsed.mainEntities
          : [],
        mainRelations: Array.isArray(parsed.mainRelations)
          ? parsed.mainRelations
          : [],
        sentiment: this.validateSentiment(parsed.sentiment),
        confidence: this.validateConfidence(parsed.confidence),
      });
    } catch (error) {
      return err(
        new CommunitySummarizationError(
          `No JSON found in response: ${error instanceof Error ? error.message : String(error)}`,
          CommunitySummarizationErrorCode.JSON_PARSE_FAILED,
          error instanceof Error ? error : undefined,
        ),
      );
    }
  }

  /**
   * sentimentを検証
   */
  private validateSentiment(
    value: unknown,
  ): "positive" | "negative" | "neutral" {
    if (value === "positive" || value === "negative" || value === "neutral") {
      return value;
    }
    return "neutral";
  }

  /**
   * confidenceを検証
   */
  private validateConfidence(value: unknown): number {
    if (typeof value === "number" && value >= 0 && value <= 1) {
      return value;
    }
    return 0.5;
  }

  /**
   * コミュニティのエンティティと関係を取得して要約を生成
   */
  private async summarizeCommunityWithData(
    community: Community,
    options: Required<CommunitySummarizationOptions>,
  ): Promise<Result<CommunitySummary, Error>> {
    const dataResult = await this.getCommunityData(community);
    if (!dataResult.success) {
      return err(dataResult.error);
    }

    const { entities, relations } = dataResult.data;
    return this.summarize(community, entities, relations, options);
  }

  /**
   * コミュニティのエンティティと関係を取得
   */
  private async getCommunityData(community: Community): Promise<
    Result<
      {
        entities: StoredEntity[];
        relations: StoredRelation[];
      },
      Error
    >
  > {
    // エンティティを取得
    const entities: StoredEntity[] = [];
    for (const entityId of community.memberEntityIds) {
      const entityResult = await this.graphStore.getEntity(entityId);
      if (entityResult.success && entityResult.data) {
        entities.push(entityResult.data);
      }
    }

    // 関係を取得（コミュニティ内のエンティティ間のみ）
    const memberSet = new Set(community.memberEntityIds);
    const relations: StoredRelation[] = [];

    for (const entity of entities) {
      const relResult = await this.graphStore.getRelations(entity.id, {
        direction: "both",
      });
      if (relResult.success) {
        for (const rel of relResult.data) {
          // コミュニティ内の関係のみ追加（重複を避ける）
          if (
            memberSet.has(rel.sourceEntityId) &&
            memberSet.has(rel.targetEntityId)
          ) {
            if (!relations.some((r) => r.id === rel.id)) {
              relations.push(rel);
            }
          }
        }
      }
    }

    return ok({ entities, relations });
  }

  /**
   * コミュニティをレベルでグループ化
   */
  private groupByLevel(communities: readonly Community[]): Community[][] {
    const groups = new Map<number, Community[]>();

    for (const community of communities) {
      const existing = groups.get(community.level) ?? [];
      existing.push(community);
      groups.set(community.level, existing);
    }

    // レベル昇順でソートして返す
    return [...groups.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, communities]) => communities);
  }

  /**
   * 配列をチャンク分割
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * エラーからコミュニティIDを抽出
   */
  private extractCommunityIdFromError(_error: Error): CommunityId | null {
    // エラーメッセージからコミュニティIDを抽出する試み
    // 実装は簡略化
    return null;
  }
}
