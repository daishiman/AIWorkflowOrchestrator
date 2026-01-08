/**
 * @file LLMエラー関連のZodスキーマ
 * @description エラーコードとエラー情報のバリデーションスキーマ
 * @feature chat-multi-llm-switching
 */

import { z } from "zod";

/**
 * LLMエラーコード
 * 発生可能なエラーの種別
 */
export const LLMErrorCodeSchema = z.enum([
  "API_KEY_MISSING",
  "API_KEY_INVALID",
  "NETWORK_ERROR",
  "TIMEOUT",
  "RATE_LIMIT",
  "CONTEXT_LENGTH_EXCEEDED",
  "CONTENT_FILTER",
  "MODEL_NOT_FOUND",
  "SERVICE_UNAVAILABLE",
  "UNKNOWN",
]);

export type LLMErrorCode = z.infer<typeof LLMErrorCodeSchema>;

/**
 * LLMエラー
 * エラー発生時の詳細情報
 */
export const LLMErrorSchema = z.object({
  /** エラーコード */
  code: LLMErrorCodeSchema,

  /** エラーメッセージ */
  message: z.string(),

  /** 元のエラー（デバッグ用） */
  originalError: z.unknown().optional(),

  /** リトライ可能フラグ */
  retryable: z.boolean(),

  /** 推奨待機時間（秒）- レート制限時など */
  retryAfter: z.number().int().positive().optional(),
});

export type LLMError = z.infer<typeof LLMErrorSchema>;
