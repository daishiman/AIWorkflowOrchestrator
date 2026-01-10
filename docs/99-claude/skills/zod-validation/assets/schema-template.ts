/**
 * {{FEATURE_NAME}} スキーマ定義
 *
 * @description {{DESCRIPTION}}
 * @see {{SPEC_DOC_PATH}}
 */
import { z } from 'zod';

// ============================================================
// 共通スキーマパーツ（再利用可能な基本型）
// ============================================================

/** UUID形式のID */
const uuidSchema = z.string().uuid('有効なUUID形式で入力してください');

/** タイムスタンプ（ISO 8601形式の文字列から日付に変換） */
const timestampSchema = z.coerce.date();

/** 非空文字列 */
const nonEmptyStringSchema = z.string().min(1, '必須項目です');

// ============================================================
// 入力スキーマ（外部からの入力用）
// ============================================================

/**
 * {{FEATURE_NAME}}作成入力スキーマ
 */
export const create{{FEATURE_NAME}}InputSchema = z.object({
  // 必須フィールド
  name: nonEmptyStringSchema
    .max(100, '100文字以内で入力してください')
    .describe('名前'),

  // オプショナルフィールド
  description: z.string()
    .max(500, '500文字以内で入力してください')
    .optional()
    .describe('説明'),

  // 列挙型フィールド
  status: z.enum(['active', 'inactive', 'pending'], {
    errorMap: () => ({ message: 'active, inactive, pending のいずれかを指定してください' }),
  }).default('pending').describe('ステータス'),

  // 配列フィールド
  tags: z.array(z.string().max(50))
    .max(10, 'タグは10個まで設定可能です')
    .default([])
    .describe('タグ'),
});

/**
 * {{FEATURE_NAME}}作成入力型
 */
export type Create{{FEATURE_NAME}}Input = z.infer<typeof create{{FEATURE_NAME}}InputSchema>;

/**
 * {{FEATURE_NAME}}更新入力スキーマ（部分更新）
 */
export const update{{FEATURE_NAME}}InputSchema = create{{FEATURE_NAME}}InputSchema
  .partial()
  .extend({
    id: uuidSchema.describe('更新対象のID'),
  });

/**
 * {{FEATURE_NAME}}更新入力型
 */
export type Update{{FEATURE_NAME}}Input = z.infer<typeof update{{FEATURE_NAME}}InputSchema>;

// ============================================================
// 出力スキーマ（レスポンス用）
// ============================================================

/**
 * {{FEATURE_NAME}}出力スキーマ
 */
export const {{featureName}}OutputSchema = z.object({
  id: uuidSchema.describe('ID'),
  name: z.string().describe('名前'),
  description: z.string().nullable().describe('説明'),
  status: z.enum(['active', 'inactive', 'pending']).describe('ステータス'),
  tags: z.array(z.string()).describe('タグ'),
  createdAt: timestampSchema.describe('作成日時'),
  updatedAt: timestampSchema.describe('更新日時'),
});

/**
 * {{FEATURE_NAME}}出力型
 */
export type {{FEATURE_NAME}}Output = z.infer<typeof {{featureName}}OutputSchema>;

/**
 * {{FEATURE_NAME}}リスト出力スキーマ
 */
export const {{featureName}}ListOutputSchema = z.object({
  items: z.array({{featureName}}OutputSchema).describe('{{FEATURE_NAME}}リスト'),
  total: z.number().int().nonnegative().describe('総件数'),
  page: z.number().int().positive().describe('現在のページ'),
  pageSize: z.number().int().positive().describe('ページサイズ'),
  hasMore: z.boolean().describe('次のページの有無'),
});

/**
 * {{FEATURE_NAME}}リスト出力型
 */
export type {{FEATURE_NAME}}ListOutput = z.infer<typeof {{featureName}}ListOutputSchema>;

// ============================================================
// クエリスキーマ（検索・フィルタリング用）
// ============================================================

/**
 * {{FEATURE_NAME}}検索クエリスキーマ
 */
export const {{featureName}}QuerySchema = z.object({
  // 検索条件
  q: z.string().max(100).optional().describe('検索キーワード'),

  // フィルター
  status: z.enum(['active', 'inactive', 'pending']).optional().describe('ステータスフィルター'),
  tags: z.array(z.string()).optional().describe('タグフィルター'),

  // ページネーション
  page: z.coerce.number().int().positive().default(1).describe('ページ番号'),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).describe('ページサイズ'),

  // ソート
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt').describe('ソートフィールド'),
  sortOrder: z.enum(['asc', 'desc']).default('desc').describe('ソート順'),
});

/**
 * {{FEATURE_NAME}}検索クエリ型
 */
export type {{FEATURE_NAME}}Query = z.infer<typeof {{featureName}}QuerySchema>;

// ============================================================
// IDパラメータスキーマ（パスパラメータ用）
// ============================================================

/**
 * {{FEATURE_NAME}} IDパラメータスキーマ
 */
export const {{featureName}}IdParamSchema = z.object({
  id: uuidSchema.describe('{{FEATURE_NAME}} ID'),
});

/**
 * {{FEATURE_NAME}} IDパラメータ型
 */
export type {{FEATURE_NAME}}IdParam = z.infer<typeof {{featureName}}IdParamSchema>;

// ============================================================
// バリデーションヘルパー
// ============================================================

/**
 * 入力データのバリデーション
 */
export function validateCreate{{FEATURE_NAME}}Input(data: unknown): Create{{FEATURE_NAME}}Input {
  return create{{FEATURE_NAME}}InputSchema.parse(data);
}

/**
 * 入力データの安全なバリデーション
 */
export function safeValidateCreate{{FEATURE_NAME}}Input(
  data: unknown
): z.SafeParseReturnType<unknown, Create{{FEATURE_NAME}}Input> {
  return create{{FEATURE_NAME}}InputSchema.safeParse(data);
}
