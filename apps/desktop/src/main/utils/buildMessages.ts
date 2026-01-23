/**
 * @file buildMessages関数
 * @description システムプロンプト + ユーザーメッセージからLLMメッセージ配列を構築
 * @feature system-prompt-llm-api
 */

import type { LLMMessage } from "@repo/shared/types/llm/schemas";

/**
 * ユーザーメッセージとシステムプロンプトからメッセージ配列を構築する
 * @param userMessage ユーザーのメッセージ
 * @param systemPrompt システムプロンプト（オプション）
 * @returns メッセージ配列
 */
export function buildMessages(
  userMessage: string,
  systemPrompt?: string,
): LLMMessage[] {
  const messages: LLMMessage[] = [];

  // システムプロンプトがあり、空白以外の文字を含む場合のみ追加
  if (systemPrompt && systemPrompt.trim()) {
    messages.push({
      role: "system",
      content: systemPrompt.trim(),
    });
  }

  messages.push({
    role: "user",
    content: userMessage,
  });

  return messages;
}
