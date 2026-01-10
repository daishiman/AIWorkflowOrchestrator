/**
 * {{ENDPOINT_NAME}} API スキーマ定義
 *
 * @description {{DESCRIPTION}}
 * @endpoint {{HTTP_METHOD}} {{ENDPOINT_PATH}}
 * @see {{API_DOC_PATH}}
 */
import { z } from 'zod';

// ============================================================
// 共通定義
// ============================================================

/** 標準エラーレスポンススキーマ */
export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string().describe('エラーコード（例: ERR_1001_INVALID_EMAIL）'),
    message: z.string().describe('ユーザー向けエラーメッセージ'),
    details: z.array(z.object({
      field: z.string().describe('エラーが発生したフィールド'),
      message: z.string().describe('フィールド固有のエラーメッセージ'),
    })).optional().describe('フィールドごとの詳細エラー'),
    retryable: z.boolean().default(false).describe('リトライ可能か'),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

/** 標準成功レスポンススキーマのファクトリ */
export function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
  });
}

// ============================================================
// リクエストスキーマ
// ============================================================

/**
 * リクエストボディスキーマ
 */
export const {{endpointName}}RequestBodySchema = z.object({
  // === 必須フィールド ===
  name: z.string()
    .min(1, '名前は必須です')
    .max(100, '名前は100文字以内で入力してください')
    .describe('名前'),

  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .describe('メールアドレス'),

  // === オプショナルフィールド ===
  phone: z.string()
    .regex(/^[0-9-]+$/, '電話番号は数字とハイフンのみ使用可能です')
    .optional()
    .describe('電話番号'),

  // === 列挙型 ===
  type: z.enum(['individual', 'corporate'], {
    errorMap: () => ({ message: 'individual または corporate を指定してください' }),
  }).describe('顧客タイプ'),

  // === ネストされたオブジェクト ===
  address: z.object({
    street: z.string().min(1, '住所は必須です'),
    city: z.string().min(1, '市区町村は必須です'),
    postalCode: z.string().regex(/^\d{3}-\d{4}$/, '郵便番号はXXX-XXXX形式で入力してください'),
    country: z.string().length(2, '国コードは2文字で入力してください').default('JP'),
  }).optional().describe('住所'),

  // === 配列 ===
  tags: z.array(z.string().max(50))
    .max(10, 'タグは10個まで設定可能です')
    .default([])
    .describe('タグ'),
});

export type {{ENDPOINT_NAME}}RequestBody = z.infer<typeof {{endpointName}}RequestBodySchema>;

/**
 * クエリパラメータスキーマ
 */
export const {{endpointName}}QuerySchema = z.object({
  // 検索
  q: z.string().max(100).optional().describe('検索キーワード'),

  // フィルター
  type: z.enum(['individual', 'corporate']).optional().describe('タイプフィルター'),
  status: z.enum(['active', 'inactive']).optional().describe('ステータスフィルター'),

  // 日付範囲
  from: z.string().datetime().optional().describe('開始日時（ISO 8601）'),
  to: z.string().datetime().optional().describe('終了日時（ISO 8601）'),

  // ページネーション
  page: z.coerce.number().int().positive().default(1).describe('ページ番号'),
  limit: z.coerce.number().int().min(1).max(100).default(20).describe('取得件数'),

  // ソート
  sort: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt').describe('ソートフィールド'),
  order: z.enum(['asc', 'desc']).default('desc').describe('ソート順'),
});

export type {{ENDPOINT_NAME}}Query = z.infer<typeof {{endpointName}}QuerySchema>;

/**
 * パスパラメータスキーマ
 */
export const {{endpointName}}ParamsSchema = z.object({
  id: z.string().uuid('有効なIDを指定してください').describe('リソースID'),
});

export type {{ENDPOINT_NAME}}Params = z.infer<typeof {{endpointName}}ParamsSchema>;

// ============================================================
// レスポンススキーマ
// ============================================================

/**
 * 単一リソースレスポンススキーマ
 */
export const {{endpointName}}ResponseSchema = z.object({
  id: z.string().uuid().describe('ID'),
  name: z.string().describe('名前'),
  email: z.string().email().describe('メールアドレス'),
  phone: z.string().nullable().describe('電話番号'),
  type: z.enum(['individual', 'corporate']).describe('タイプ'),
  address: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).nullable().describe('住所'),
  tags: z.array(z.string()).describe('タグ'),
  createdAt: z.string().datetime().describe('作成日時'),
  updatedAt: z.string().datetime().describe('更新日時'),
});

export type {{ENDPOINT_NAME}}Response = z.infer<typeof {{endpointName}}ResponseSchema>;

/**
 * リスト取得レスポンススキーマ
 */
export const {{endpointName}}ListResponseSchema = z.object({
  items: z.array({{endpointName}}ResponseSchema).describe('リソースリスト'),
  pagination: z.object({
    total: z.number().int().nonnegative().describe('総件数'),
    page: z.number().int().positive().describe('現在のページ'),
    limit: z.number().int().positive().describe('1ページあたりの件数'),
    pages: z.number().int().positive().describe('総ページ数'),
    hasNext: z.boolean().describe('次のページの有無'),
    hasPrev: z.boolean().describe('前のページの有無'),
  }).describe('ページネーション情報'),
});

export type {{ENDPOINT_NAME}}ListResponse = z.infer<typeof {{endpointName}}ListResponseSchema>;

/**
 * 作成レスポンススキーマ
 */
export const {{endpointName}}CreateResponseSchema = createSuccessResponseSchema(
  {{endpointName}}ResponseSchema
);

export type {{ENDPOINT_NAME}}CreateResponse = z.infer<typeof {{endpointName}}CreateResponseSchema>;

/**
 * 削除レスポンススキーマ
 */
export const {{endpointName}}DeleteResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid().describe('削除されたリソースのID'),
    deletedAt: z.string().datetime().describe('削除日時'),
  }),
});

export type {{ENDPOINT_NAME}}DeleteResponse = z.infer<typeof {{endpointName}}DeleteResponseSchema>;

// ============================================================
// バリデーションヘルパー
// ============================================================

/**
 * リクエストボディのバリデーション
 */
export function validate{{ENDPOINT_NAME}}RequestBody(data: unknown): {{ENDPOINT_NAME}}RequestBody {
  return {{endpointName}}RequestBodySchema.parse(data);
}

/**
 * リクエストボディの安全なバリデーション
 */
export function safeValidate{{ENDPOINT_NAME}}RequestBody(
  data: unknown
): z.SafeParseReturnType<unknown, {{ENDPOINT_NAME}}RequestBody> {
  return {{endpointName}}RequestBodySchema.safeParse(data);
}

/**
 * クエリパラメータのバリデーション
 */
export function validate{{ENDPOINT_NAME}}Query(data: unknown): {{ENDPOINT_NAME}}Query {
  return {{endpointName}}QuerySchema.parse(data);
}

/**
 * ZodErrorを標準エラーレスポンスに変換
 */
export function formatZodError(error: z.ZodError): ApiError {
  return {
    success: false,
    error: {
      code: 'ERR_VALIDATION',
      message: 'バリデーションエラーが発生しました',
      details: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
      retryable: false,
    },
  };
}
