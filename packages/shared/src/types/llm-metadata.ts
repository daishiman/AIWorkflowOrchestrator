/**
 * LLMメタデータ型定義
 *
 * @see docs/30-workflows/chat-history-persistence/metadata-specification.md
 */

/**
 * LLMプロバイダー
 */
export type LlmProvider = "openai" | "anthropic" | "google" | "xai";

/**
 * トークン使用量
 */
export interface TokenUsage {
  /**
   * 入力トークン数
   */
  inputTokens: number;

  /**
   * 出力トークン数
   */
  outputTokens: number;

  /**
   * 合計トークン数
   */
  totalTokens?: number;
}

/**
 * LLMメタデータ
 *
 * アシスタント応答に使用されたLLMの詳細情報。
 */
export interface LlmMetadata {
  /**
   * プロバイダー名
   */
  provider: LlmProvider | string;

  /**
   * モデル名
   */
  model: string;

  /**
   * モデルバージョン
   */
  version?: string;

  /**
   * 温度パラメータ（0.0〜2.0）
   */
  temperature?: number;

  /**
   * 最大トークン数
   */
  maxTokens?: number;

  /**
   * Top-pサンプリング（0.0〜1.0）
   */
  topP?: number;

  /**
   * ストリーミングモードの有無
   */
  stream?: boolean;

  /**
   * 応答時間（ミリ秒）
   */
  responseTimeMs?: number;

  /**
   * トークン使用量
   */
  tokenUsage?: TokenUsage;

  /**
   * エラー発生フラグ
   */
  error?: boolean;

  /**
   * エラーメッセージ
   */
  errorMessage?: string;
}
