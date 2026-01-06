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
