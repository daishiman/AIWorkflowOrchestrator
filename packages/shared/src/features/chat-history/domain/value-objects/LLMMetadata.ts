/**
 * LLMメタデータ 値オブジェクト
 *
 * アシスタントメッセージのLLM応答に関するメタデータを表す。
 * 不変かつ値による等価性を持つ。
 *
 * @module features/chat-history/domain/value-objects/LLMMetadata
 */

import { type Result, ok, err } from "../../../../core/Result.js";
import { InvalidLLMMetadataError } from "../errors/ValueObjectErrors.js";

/**
 * トークン使用量
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * LLMメタデータ作成パラメータ
 */
export interface CreateLLMMetadataParams {
  provider: string;
  model: string;
  tokenUsage?: TokenUsage;
  responseTime?: number;
  temperature?: number;
  maxTokens?: number;
}

/**
 * LLMメタデータ 値オブジェクト
 */
export class LLMMetadata {
  private constructor(
    private readonly _provider: string,
    private readonly _model: string,
    private readonly _tokenUsage: TokenUsage | null,
    private readonly _responseTime: number | null,
    private readonly _temperature: number | null,
    private readonly _maxTokens: number | null,
  ) {
    Object.freeze(this);
  }

  /**
   * LLMメタデータを作成する
   *
   * @param params 作成パラメータ
   * @returns 成功時: LLMMetadata, 失敗時: InvalidLLMMetadataError
   */
  static create(
    params: CreateLLMMetadataParams,
  ): Result<LLMMetadata, InvalidLLMMetadataError> {
    if (!params.provider || params.provider.trim() === "") {
      return err(new InvalidLLMMetadataError("LLMプロバイダーは必須です"));
    }

    if (!params.model || params.model.trim() === "") {
      return err(new InvalidLLMMetadataError("LLMモデルは必須です"));
    }

    return ok(
      new LLMMetadata(
        params.provider.trim(),
        params.model.trim(),
        params.tokenUsage ?? null,
        params.responseTime ?? null,
        params.temperature ?? null,
        params.maxTokens ?? null,
      ),
    );
  }

  /**
   * DBからの復元用
   */
  static reconstitute(
    provider: string,
    model: string,
    metadata: Record<string, unknown> | null,
  ): LLMMetadata {
    return new LLMMetadata(
      provider,
      model,
      (metadata?.tokenUsage as TokenUsage) ?? null,
      (metadata?.responseTime as number) ?? null,
      (metadata?.temperature as number) ?? null,
      (metadata?.maxTokens as number) ?? null,
    );
  }

  /**
   * プロバイダーを取得する
   */
  get provider(): string {
    return this._provider;
  }

  /**
   * モデルを取得する
   */
  get model(): string {
    return this._model;
  }

  /**
   * トークン使用量を取得する
   */
  get tokenUsage(): TokenUsage | null {
    return this._tokenUsage;
  }

  /**
   * レスポンス時間を取得する
   */
  get responseTime(): number | null {
    return this._responseTime;
  }

  /**
   * temperature設定を取得する
   */
  get temperature(): number | null {
    return this._temperature;
  }

  /**
   * 最大トークン数を取得する
   */
  get maxTokens(): number | null {
    return this._maxTokens;
  }

  /**
   * JSON形式に変換する（永続化用）
   */
  toJSON(): Record<string, unknown> {
    return {
      provider: this._provider,
      model: this._model,
      tokenUsage: this._tokenUsage,
      responseTime: this._responseTime,
      temperature: this._temperature,
      maxTokens: this._maxTokens,
    };
  }

  /**
   * 等価性を判定する
   */
  equals(other: LLMMetadata): boolean {
    return (
      this._provider === other._provider &&
      this._model === other._model &&
      JSON.stringify(this._tokenUsage) === JSON.stringify(other._tokenUsage)
    );
  }
}
