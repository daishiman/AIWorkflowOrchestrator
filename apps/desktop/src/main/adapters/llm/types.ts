/**
 * @file LLMアダプター型定義
 * @description LLMアダプターのインターフェースと関連型
 * @feature chat-multi-llm-switching
 */

import type {
  LLMProviderId,
  LLMChatRequestInput,
  HealthCheckResult,
} from "@repo/shared/types/llm/schemas";

/**
 * トークン使用量（アダプター内部用）
 */
export interface AdapterTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * アダプターチャットレスポンス
 * sendChat()が直接返すレスポンス形式
 */
export interface AdapterChatResponse {
  /** 生成されたコンテンツ */
  content: string;
  /** 使用されたモデル */
  model: string;
  /** トークン使用量 */
  usage: AdapterTokenUsage;
  /** 終了理由 */
  finishReason?: string;
}

/**
 * ストリーミングチャンクの差分情報
 */
export interface StreamChunkDelta {
  /** コンテンツ差分 */
  content?: string;
  /** ロール（通常は最初のチャンクのみ） */
  role?: string;
}

/**
 * ストリーミングチャンク
 */
export interface StreamChunk {
  /** チャンクID */
  id: string;
  /** 差分コンテンツ */
  delta?: StreamChunkDelta;
  /** 完了フラグ */
  done: boolean;
  /** メタデータ */
  metadata?: {
    model?: string;
    finishReason?: string;
    usage?: AdapterTokenUsage;
  };
}

/**
 * LLMアダプター設定
 */
export interface LLMAdapterConfig {
  /** APIキー */
  apiKey: string;
  /** ベースURL（オプション） */
  baseUrl?: string;
  /** タイムアウト（ミリ秒） */
  timeout?: number;
  /** 最大リトライ回数 */
  maxRetries?: number;
}

/**
 * LLMアダプターインターフェース
 */
export interface ILLMAdapter {
  /** プロバイダーID */
  readonly providerId: LLMProviderId;

  /**
   * チャットメッセージ送信（非ストリーミング）
   * @param request チャットリクエスト
   * @returns チャットレスポンス
   * @throws LLMError エラー発生時
   */
  sendChat(request: LLMChatRequestInput): Promise<AdapterChatResponse>;

  /**
   * ストリーミングチャット
   * @param request チャットリクエスト
   * @yields ストリームチャンク
   */
  streamChat(request: LLMChatRequestInput): AsyncGenerator<StreamChunk>;

  /**
   * ヘルスチェック
   * @returns ヘルスチェック結果
   */
  checkHealth(): Promise<HealthCheckResult>;
}
