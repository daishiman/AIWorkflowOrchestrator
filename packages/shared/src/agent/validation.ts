/**
 * Agent SDK Validation Schemas (Zod)
 * @module @repo/shared/agent/validation
 */

import { z } from "zod";

/**
 * UUID v4形式の正規表現
 */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * クエリオプションスキーマ
 * - timeout: 1000-300000ms
 * - sessionId: UUID v4形式
 * - systemPrompt: 最大5000文字
 */
export const queryOptionsSchema = z
  .object({
    timeout: z.number().min(1000).max(300000).optional(),
    sessionId: z
      .string()
      .regex(UUID_V4_REGEX, "Invalid UUID format")
      .optional(),
    systemPrompt: z.string().max(5000).optional(),
  })
  .strict();

export type QueryOptionsInput = z.input<typeof queryOptionsSchema>;
export type QueryOptionsOutput = z.output<typeof queryOptionsSchema>;

/**
 * クエリリクエストスキーマ
 * - prompt: 1-10000文字（必須）
 * - options: QueryOptions（オプション）
 */
export const queryRequestSchema = z
  .object({
    prompt: z.string().min(1).max(10000),
    options: queryOptionsSchema.optional(),
  })
  .strict();

export type QueryRequestInput = z.input<typeof queryRequestSchema>;
export type QueryRequestOutput = z.output<typeof queryRequestSchema>;

/**
 * セッション再開リクエストスキーマ
 * - sessionId: UUID v4形式（必須）
 */
export const resumeSessionRequestSchema = z
  .object({
    sessionId: z.string().regex(UUID_V4_REGEX, "Invalid UUID format"),
  })
  .strict();

export type ResumeSessionRequestInput = z.input<
  typeof resumeSessionRequestSchema
>;
export type ResumeSessionRequestOutput = z.output<
  typeof resumeSessionRequestSchema
>;

/**
 * セッション破棄リクエストスキーマ
 * - sessionId: UUID v4形式（必須）
 */
export const destroySessionRequestSchema = z
  .object({
    sessionId: z.string().regex(UUID_V4_REGEX, "Invalid UUID format"),
  })
  .strict();

export type DestroySessionRequestInput = z.input<
  typeof destroySessionRequestSchema
>;
export type DestroySessionRequestOutput = z.output<
  typeof destroySessionRequestSchema
>;
