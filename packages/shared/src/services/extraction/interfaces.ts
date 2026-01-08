/**
 * エンティティ抽出サービスのインターフェース定義
 * @description 依存性逆転のための抽象化
 */

import type { Result } from "../../types/rag/result";
import type { Chunk } from "../chunking/types";
import type {
  EntityExtractionOptionsInput,
  ExtractionResult,
  BatchExtractionResult,
  ExtractedEntity,
  RelationExtractionOptionsInput,
  RelationExtractionResult,
  BatchRelationExtractionResult,
  ExtractedRelation,
} from "./types";

// =============================================================================
// LLM Provider Interface
// =============================================================================

export interface LLMGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "text" | "json";
}

export interface LLMGenerateResult {
  text: string;
  tokensUsed: number;
}

/**
 * LLMプロバイダーインターフェース
 * @description LLMとの通信を抽象化
 */
export interface ILLMProvider {
  readonly modelId: string;
  generate(
    prompt: string,
    options?: LLMGenerateOptions,
  ): Promise<Result<LLMGenerateResult, Error>>;
}

// =============================================================================
// Entity Extractor Interface
// =============================================================================

/**
 * エンティティ抽出インターフェース
 * @description Strategy Pattern for different extraction methods
 */
export interface IEntityExtractor {
  /**
   * 単一チャンクからエンティティを抽出
   */
  extract(
    chunk: Chunk,
    options?: EntityExtractionOptionsInput,
  ): Promise<Result<ExtractionResult, Error>>;

  /**
   * 複数チャンクからバッチ抽出
   */
  extractBatch(
    chunks: Chunk[],
    options?: EntityExtractionOptionsInput,
  ): Promise<Result<BatchExtractionResult, Error>>;

  /**
   * 複数結果のエンティティをマージ
   */
  mergeEntities(results: ExtractionResult[]): ExtractedEntity[];
}

// =============================================================================
// Relation Extractor Interface (CONV-06-05)
// =============================================================================

/**
 * 関係抽出インターフェース
 * @description エンティティ間の関係を抽出するStrategy Pattern
 */
export interface IRelationExtractor {
  /**
   * 単一チャンクからエンティティ間の関係を抽出
   * @param chunk 処理対象のチャンク
   * @param entities チャンクから抽出済みのエンティティ
   * @param options 抽出オプション
   * @returns 抽出された関係を含む結果
   */
  extract(
    chunk: Chunk,
    entities: ExtractedEntity[],
    options?: RelationExtractionOptionsInput,
  ): Promise<Result<RelationExtractionResult, Error>>;

  /**
   * 複数チャンクからバッチで関係を抽出
   * @param chunks 処理対象のチャンク配列
   * @param entitiesByChunk チャンクIDとエンティティのマップ
   * @param options 抽出オプション
   * @returns バッチ抽出結果
   */
  extractBatch(
    chunks: Chunk[],
    entitiesByChunk: Map<string, ExtractedEntity[]>,
    options?: RelationExtractionOptionsInput,
  ): Promise<Result<BatchRelationExtractionResult, Error>>;

  /**
   * 複数結果の関係をマージ（重複統合）
   * @param results 各チャンクからの抽出結果
   * @returns マージされた関係の配列
   */
  mergeRelations(results: RelationExtractionResult[]): ExtractedRelation[];
}
