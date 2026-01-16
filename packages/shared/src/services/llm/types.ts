/**
 * @file LLM Client 型定義
 * @description LLMクライアントの共通インターフェース定義
 */

import type { Result } from "../../types/rag/result";

/**
 * LLM補完オプション
 */
export interface LLMCompletionOptions {
  /** 最大トークン数 */
  maxTokens?: number;
  /** 温度パラメータ */
  temperature?: number;
  /** システムプロンプト */
  systemPrompt?: string;
}

/**
 * LLMクライアントインターフェース
 */
export interface ILLMClient {
  /**
   * テキスト補完を実行
   * @param prompt プロンプト
   * @param options オプション
   * @returns 補完結果
   */
  complete(
    prompt: string,
    options?: LLMCompletionOptions,
  ): Promise<Result<string, Error>>;
}
