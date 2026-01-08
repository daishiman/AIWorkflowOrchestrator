/**
 * @file LLMリクエスト関連のZodスキーマ
 * @description チャットリクエストのバリデーションスキーマ
 * @feature chat-multi-llm-switching
 */

import { z } from "zod";
import { LLMMessageSchema, MessageRoleSchema } from "./message";
import { LLMProviderIdSchema } from "./provider";

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

  /** プロバイダーID（省略時はmodelIdから推論） */
  providerId: LLMProviderIdSchema.optional(),

  /** システムプロンプト */
  systemPrompt: z.string().optional(),

  /** 温度（0.0-2.0）- デフォルト1.0 */
  temperature: z.number().min(0).max(2).optional().default(1.0),

  /** 最大トークン数 */
  maxTokens: z.number().int().positive().optional(),

  /** ストリーミング有効 - デフォルトfalse */
  stream: z.boolean().optional().default(false),
});

/** LLMChatRequest入力型（テストやAPI呼び出し時に使用） */
export type LLMChatRequestInput = z.input<typeof LLMChatRequestSchema>;

/** LLMChatRequest出力型（パース後、デフォルト適用済み） */
export type LLMChatRequest = z.infer<typeof LLMChatRequestSchema>;
