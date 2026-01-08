/**
 * @file LLMリクエスト関連のZodスキーマ
 * @description チャットリクエストのバリデーションスキーマ
 * @feature chat-multi-llm-switching
 */

import { z } from "zod";
import { LLMMessageSchema, MessageRoleSchema } from "./message";

// Re-export for convenience
export { MessageRoleSchema, LLMMessageSchema };
export type { LLMMessage } from "./message";

/**
 * LLMチャットリクエスト
 * LLMへの送信リクエスト
 */
export const LLMChatRequestSchema = z.object({
  /** 会話履歴 */
  messages: z.array(LLMMessageSchema),

  /** モデルID */
  modelId: z.string().min(1),

  /** システムプロンプト */
  systemPrompt: z.string().optional(),

  /** 温度（0.0-2.0）- デフォルト1.0 */
  temperature: z.number().min(0).max(2).default(1.0),

  /** 最大トークン数 */
  maxTokens: z.number().int().positive().optional(),

  /** ストリーミング有効 - デフォルトfalse */
  stream: z.boolean().default(false),
});

export type LLMChatRequest = z.infer<typeof LLMChatRequestSchema>;
