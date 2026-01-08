/**
 * @file LLMレスポンス関連のZodスキーマ
 * @description チャットレスポンス、ストリームチャンクのバリデーションスキーマ
 * @feature chat-multi-llm-switching
 */

import { z } from "zod";
import { LLMProviderIdSchema } from "./provider";
import { LLMErrorSchema } from "./error";

/**
 * トークン使用量
 */
export const TokenUsageSchema = z.object({
  /** プロンプトトークン数 */
  promptTokens: z.number().int().nonnegative(),

  /** 完了トークン数 */
  completionTokens: z.number().int().nonnegative(),

  /** 合計トークン数 */
  totalTokens: z.number().int().nonnegative(),
});

export type TokenUsage = z.infer<typeof TokenUsageSchema>;

/**
 * 終了理由
 */
export const FinishReasonSchema = z.enum([
  "stop",
  "length",
  "content_filter",
  "tool_calls",
]);

export type FinishReason = z.infer<typeof FinishReasonSchema>;

/**
 * LLMレスポンスデータ
 * 成功時のレスポンス内容
 */
export const LLMResponseDataSchema = z.object({
  /** 生成メッセージ */
  message: z.string(),

  /** モデルID */
  modelId: z.string(),

  /** プロバイダーID */
  providerId: LLMProviderIdSchema,

  /** トークン使用量 */
  usage: TokenUsageSchema.optional(),

  /** 終了理由 */
  finishReason: FinishReasonSchema.optional(),
});

export type LLMResponseData = z.infer<typeof LLMResponseDataSchema>;

/**
 * LLMチャットレスポンス
 * 成功/失敗のDiscriminated Union
 */
export const LLMChatResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: LLMResponseDataSchema,
  }),
  z.object({
    success: z.literal(false),
    error: LLMErrorSchema,
  }),
]);

export type LLMChatResponse = z.infer<typeof LLMChatResponseSchema>;

/**
 * LLMストリームチャンク
 * ストリーミングレスポンスの1チャンク
 */
export const LLMStreamChunkSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("content"),
    content: z.string(),
  }),
  z.object({
    type: z.literal("done"),
    response: LLMChatResponseSchema,
  }),
  z.object({
    type: z.literal("error"),
    error: LLMErrorSchema,
  }),
]);

export type LLMStreamChunk = z.infer<typeof LLMStreamChunkSchema>;
