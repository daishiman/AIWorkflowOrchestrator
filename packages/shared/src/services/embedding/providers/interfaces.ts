/**
 * 埋め込みプロバイダーインターフェース
 *
 * @description すべての埋め込みプロバイダーが実装するインターフェース
 */

import type {
  EmbeddingModelId,
  ProviderName,
  EmbedOptions,
  BatchEmbedOptions,
  EmbeddingResult,
  BatchEmbeddingResult,
} from "../types/embedding.types";

/**
 * 埋め込みプロバイダーインターフェース
 */
export interface IEmbeddingProvider {
  /**
   * モデルID
   */
  readonly modelId: EmbeddingModelId;

  /**
   * プロバイダー名
   */
  readonly providerName: ProviderName;

  /**
   * 埋め込みベクトルの次元数
   */
  readonly dimensions: number;

  /**
   * 最大トークン数
   */
  readonly maxTokens: number;

  /**
   * テキストの埋め込みベクトルを生成する
   *
   * @param text - 埋め込み対象テキスト
   * @param options - 埋め込みオプション
   * @returns 埋め込み結果
   * @throws {EmbeddingError} 埋め込み生成でエラーが発生した場合
   */
  embed(text: string, options?: EmbedOptions): Promise<EmbeddingResult>;

  /**
   * 複数テキストの埋め込みベクトルをバッチ生成する
   *
   * @param texts - 埋め込み対象テキスト配列
   * @param options - バッチ埋め込みオプション
   * @returns バッチ埋め込み結果
   * @throws {EmbeddingError} 埋め込み生成でエラーが発生した場合
   */
  embedBatch(
    texts: string[],
    options?: BatchEmbedOptions,
  ): Promise<BatchEmbeddingResult>;

  /**
   * テキストのトークン数をカウントする
   *
   * @param text - カウント対象テキスト
   * @returns トークン数
   */
  countTokens(text: string): number;

  /**
   * ヘルスチェックを実行する
   *
   * @returns ヘルスチェック成功時true
   */
  healthCheck(): Promise<boolean>;
}
