/**
 * @file ヘルスチェック関連のZodスキーマ
 * @description 接続状態とヘルスチェック結果のバリデーションスキーマ
 * @feature chat-multi-llm-switching
 */

import { z } from "zod";
import { LLMProviderIdSchema } from "./provider";

/**
 * 接続状態
 */
export const ConnectionStatusSchema = z.enum([
  "connected",
  "disconnected",
  "error",
]);

export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;

/**
 * ヘルスチェック結果
 * プロバイダーへの接続状態
 */
export const HealthCheckResultSchema = z.object({
  /** 接続状態 */
  status: ConnectionStatusSchema,

  /** プロバイダーID */
  providerId: LLMProviderIdSchema,

  /** レイテンシ（ミリ秒） */
  latency: z.number().int().nonnegative().optional(),

  /** エラーメッセージ（error時） */
  errorMessage: z.string().optional(),

  /** チェック日時 */
  checkedAt: z.coerce.date(),
});

export type HealthCheckResult = z.infer<typeof HealthCheckResultSchema>;
