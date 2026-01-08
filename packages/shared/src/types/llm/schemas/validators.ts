/**
 * @file バリデーションユーティリティ
 * @description Zodスキーマを使用したバリデーション関数
 * @feature chat-multi-llm-switching
 */

import { LLMChatRequestSchema, type LLMChatRequest } from "./request";
import { LLMChatResponseSchema, type LLMChatResponse } from "./response";
import { IPCChatRequestSchema, type IPCChatRequest } from "./ipc";
import { LLMErrorSchema, type LLMError } from "./error";

/**
 * チャットリクエストをバリデート
 * @param data 未検証のリクエストデータ
 * @returns パース済みのLLMChatRequest
 * @throws ZodError バリデーション失敗時
 */
export function validateChatRequest(data: unknown): LLMChatRequest {
  return LLMChatRequestSchema.parse(data);
}

/**
 * チャットレスポンスをバリデート
 * @param data 未検証のレスポンスデータ
 * @returns パース済みのLLMChatResponse
 * @throws ZodError バリデーション失敗時
 */
export function validateChatResponse(data: unknown): LLMChatResponse {
  return LLMChatResponseSchema.parse(data);
}

/**
 * IPCリクエストをバリデート
 * @param data 未検証のIPCリクエストデータ
 * @returns パース済みのIPCChatRequest
 * @throws ZodError バリデーション失敗時
 */
export function validateIPCRequest(data: unknown): IPCChatRequest {
  return IPCChatRequestSchema.parse(data);
}

/**
 * エラーをバリデート
 * @param data 未検証のエラーデータ
 * @returns パース済みのLLMError
 * @throws ZodError バリデーション失敗時
 */
export function validateError(data: unknown): LLMError {
  return LLMErrorSchema.parse(data);
}

/**
 * 安全なチャットレスポンスパース
 * @param data 未検証のレスポンスデータ
 * @returns パース済みのLLMChatResponse、失敗時はundefined
 */
export function safeParseChatResponse(
  data: unknown,
): LLMChatResponse | undefined {
  const result = LLMChatResponseSchema.safeParse(data);
  return result.success ? result.data : undefined;
}
