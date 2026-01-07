/**
 * @file LLMメッセージ関連のZodスキーマ
 * @description チャットメッセージのバリデーションスキーマ
 * @feature chat-multi-llm-switching
 */

import { z } from "zod";

/**
 * メッセージロール
 */
export const MessageRoleSchema = z.enum(["user", "assistant", "system"]);

export type MessageRole = z.infer<typeof MessageRoleSchema>;

/**
 * LLMメッセージ
 * チャット履歴の1メッセージ
 */
export const LLMMessageSchema = z.object({
  /** ロール（user/assistant/system） */
  role: MessageRoleSchema,

  /** メッセージ内容 */
  content: z.string(),
});

export type LLMMessage = z.infer<typeof LLMMessageSchema>;
