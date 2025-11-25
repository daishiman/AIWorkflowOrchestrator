/**
 * {{SCHEMA_NAME}} - Zodスキーマテンプレート
 *
 * 使用方法:
 * 1. このテンプレートをコピー
 * 2. {{PLACEHOLDER}} を実際の値に置換
 * 3. 必要なフィールドを追加・削除
 */

import { z } from "zod";

// ============================================
// 基本スキーマ
// ============================================

/**
 * メインスキーマ
 */
export const {{SchemaName}}Schema = z.object({
  // 識別子
  id: z.string().uuid().describe("一意識別子"),

  // 必須フィールド
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以内です")
    .describe("名前"),

  // オプショナルフィールド
  description: z
    .string()
    .max(500)
    .optional()
    .describe("説明（任意）"),

  // 数値フィールド
  count: z
    .number()
    .int()
    .min(0)
    .max(1000)
    .default(0)
    .describe("カウント"),

  // Enum フィールド
  status: z
    .enum(["pending", "processing", "completed", "failed"])
    .describe("ステータス"),

  // ブール値
  isActive: z
    .boolean()
    .default(true)
    .describe("有効フラグ"),

  // 日時
  createdAt: z
    .string()
    .datetime()
    .describe("作成日時（ISO 8601形式）"),

  // ネストオブジェクト
  metadata: z
    .object({
      version: z.string(),
      tags: z.array(z.string()).max(10),
    })
    .optional()
    .describe("メタデータ"),

  // 配列
  items: z
    .array(
      z.object({
        key: z.string(),
        value: z.unknown(),
      })
    )
    .max(50)
    .default([])
    .describe("アイテムリスト"),
});

// ============================================
// 型推論
// ============================================

/**
 * スキーマから推論された型
 */
export type {{TypeName}} = z.infer<typeof {{SchemaName}}Schema>;

/**
 * 入力用の型（デフォルト値を持つフィールドを除外）
 */
export type {{TypeName}}Input = z.input<typeof {{SchemaName}}Schema>;

// ============================================
// 派生スキーマ
// ============================================

/**
 * 作成用スキーマ（idを除外）
 */
export const Create{{SchemaName}}Schema = {{SchemaName}}Schema.omit({
  id: true,
  createdAt: true,
});

/**
 * 更新用スキーマ（部分更新可能）
 */
export const Update{{SchemaName}}Schema = {{SchemaName}}Schema.partial().omit({
  id: true,
  createdAt: true,
});

/**
 * クエリ用スキーマ
 */
export const Query{{SchemaName}}Schema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
  isActive: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// ============================================
// バリデーション関数
// ============================================

/**
 * スキーマを検証（例外をスロー）
 */
export function validate{{SchemaName}}(data: unknown): {{TypeName}} {
  return {{SchemaName}}Schema.parse(data);
}

/**
 * スキーマを安全に検証（Result型を返す）
 */
export function safeValidate{{SchemaName}}(
  data: unknown
): z.SafeParseReturnType<unknown, {{TypeName}}> {
  return {{SchemaName}}Schema.safeParse(data);
}

/**
 * エラーを人間が読める形式に変換
 */
export function formatValidationErrors(
  result: z.SafeParseError<unknown>
): Array<{ path: string; message: string }> {
  return result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
