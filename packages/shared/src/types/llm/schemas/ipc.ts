/**
 * @file IPC関連のZodスキーマ
 * @description Electron IPC通信用リクエストのバリデーションスキーマ
 * @feature chat-multi-llm-switching
 */

import { z } from "zod";
import { LLMMessageSchema } from "./message";
import { LLMProviderIdSchema } from "./provider";

/**
 * IPCチャットリクエスト
 * Renderer→MainへのIPC通信用リクエスト
 */
export const IPCChatRequestSchema = z.object({
  /** 会話ID（UUID形式） */
  conversationId: z.string().uuid(),

  /** ユーザーメッセージ */
  message: z.string().min(1),

  /** 会話履歴 */
  history: z.array(LLMMessageSchema),

  /** プロバイダーID */
  providerId: LLMProviderIdSchema,

  /** モデルID */
  modelId: z.string().min(1),

  /** システムプロンプト */
  systemPrompt: z.string().optional(),

  /** RAG有効フラグ - デフォルトfalse */
  ragEnabled: z.boolean().default(false),
});

export type IPCChatRequest = z.infer<typeof IPCChatRequestSchema>;
