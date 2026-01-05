/**
 * @file Zodスキーマ定義
 * @module @repo/shared/types/rag/schemas
 * @description ランタイム検証と型推論の統合
 */

import { z } from "zod";
import { ErrorCodes } from "./errors";

// =============================================================================
// UUID スキーマ
// =============================================================================

/**
 * UUID v4形式のバリデーションスキーマ
 * @example
 * const id = uuidSchema.parse("550e8400-e29b-41d4-a716-446655440000");
 */
export const uuidSchema = z.string().uuid({
  message: "有効なUUID形式である必要があります",
});

/** UUID型（スキーマから推論） */
export type UUID = z.infer<typeof uuidSchema>;

// =============================================================================
// タイムスタンプ スキーマ
// =============================================================================

/**
 * 日付のバリデーションスキーマ（DateまたはISO文字列を受け入れ）
 * @internal モジュール内部でのみ使用
 */
const dateSchema = z.coerce.date({
  message: "有効な日付形式である必要があります",
});

/**
 * タイムスタンプを持つエンティティのスキーマ
 * @example
 * const entity = timestampedSchema.parse({
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 */
export const timestampedSchema = z.object({
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

/** Timestamped型（スキーマから推論） */
export type TimestampedSchema = z.infer<typeof timestampedSchema>;

// =============================================================================
// メタデータ スキーマ
// =============================================================================

/**
 * 任意のメタデータを持つスキーマ
 * @example
 * const metadata = metadataSchema.parse({ key: "value", count: 42 });
 */
export const metadataSchema = z.record(z.string(), z.unknown());

/** Metadata型（スキーマから推論） */
export type MetadataSchema = z.infer<typeof metadataSchema>;

// =============================================================================
// ページネーション スキーマ
// =============================================================================

/**
 * ページネーションパラメータのスキーマ
 * - limit: 1以上の整数（デフォルト: 20）
 * - offset: 0以上の整数（デフォルト: 0）
 * @example
 * const params = paginationParamsSchema.parse({ limit: 10, offset: 20 });
 */
export const paginationParamsSchema = z.object({
  limit: z
    .number()
    .int({ message: "limitは整数である必要があります" })
    .min(1, { message: "limitは1以上である必要があります" })
    .default(20),
  offset: z
    .number()
    .int({ message: "offsetは整数である必要があります" })
    .min(0, { message: "offsetは0以上である必要があります" })
    .default(0),
});

/** PaginationParams型（スキーマから推論） */
export type PaginationParamsSchema = z.infer<typeof paginationParamsSchema>;

// =============================================================================
// 非同期ステータス スキーマ
// =============================================================================

/**
 * 非同期処理のステータススキーマ
 * @example
 * const status = asyncStatusSchema.parse("processing");
 */
export const asyncStatusSchema = z.enum(
  ["pending", "processing", "completed", "failed"],
  {
    message:
      "ステータスは pending, processing, completed, failed のいずれかである必要があります",
  },
);

/** AsyncStatus型（スキーマから推論） */
export type AsyncStatusSchema = z.infer<typeof asyncStatusSchema>;

// =============================================================================
// エラーコード スキーマ
// =============================================================================

/**
 * ErrorCodesの値からZodのenumスキーマを作成
 * @internal モジュール内部でのみ使用
 */
const errorCodeValues = Object.values(ErrorCodes) as [string, ...string[]];

/**
 * エラーコードのスキーマ
 * @example
 * const code = errorCodeSchema.parse("FILE_NOT_FOUND");
 */
export const errorCodeSchema = z.enum(errorCodeValues, {
  message: "有効なエラーコードである必要があります",
});

/** ErrorCode型（スキーマから推論） */
export type ErrorCodeSchema = z.infer<typeof errorCodeSchema>;

// =============================================================================
// RAGエラー スキーマ
// =============================================================================

/**
 * RAGエラーのスキーマ
 * @example
 * const error = ragErrorSchema.parse({
 *   code: "FILE_NOT_FOUND",
 *   message: "File not found",
 *   timestamp: new Date()
 * });
 */
export const ragErrorSchema = z.object({
  code: errorCodeSchema,
  message: z.string().min(1, { message: "メッセージは必須です" }),
  timestamp: dateSchema,
  context: metadataSchema.optional(),
});

/** RAGError型（スキーマから推論） */
export type RAGErrorSchema = z.infer<typeof ragErrorSchema>;
