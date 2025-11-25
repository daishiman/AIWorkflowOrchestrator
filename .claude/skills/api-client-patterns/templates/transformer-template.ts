/**
 * Data Transformer Template
 *
 * 外部APIデータと内部ドメイン型の変換を行うテンプレート
 * 使用方法: このテンプレートをコピーし、プレースホルダーを実装してください
 *
 * 含まれる機能:
 * - 双方向変換（Inbound/Outbound）
 * - Zodによる実行時検証
 * - エラー変換
 * - 部分変換サポート
 */

import { z } from "zod";

// ============================================
// 1. 外部スキーマ定義
// ============================================

/**
 * 外部APIレスポンススキーマ
 * 実行時検証に使用
 */
export const External{{EntityName}}Schema = z.object({
  // 外部フィールド（snake_case）
  {{external_id}}: z.string(),
  {{external_name}}: z.string(),
  {{external_email}}: z.string().email().nullable(),
  {{external_status}}: z.enum(["active", "inactive", "pending"]),
  {{external_created_at}}: z.number(), // Unix timestamp (seconds)
  {{external_metadata}}: z
    .object({
      tags: z.array(z.string()).default([]),
      extra: z.record(z.unknown()).optional(),
    })
    .optional(),
});

export type External{{EntityName}} = z.infer<typeof External{{EntityName}}Schema>;

/**
 * 外部APIリクエストスキーマ（作成/更新用）
 */
export const External{{EntityName}}RequestSchema = z.object({
  {{external_name}}: z.string().min(1),
  {{external_email}}: z.string().email().nullable(),
  {{external_status}}: z.enum(["active", "inactive", "pending"]).optional(),
  {{external_metadata}}: z
    .object({
      tags: z.array(z.string()).optional(),
    })
    .optional(),
});

export type External{{EntityName}}Request = z.infer<
  typeof External{{EntityName}}RequestSchema
>;

// ============================================
// 2. 内部型定義
// ============================================

/**
 * 内部ドメインモデル（camelCase）
 */
export interface {{EntityName}} {
  id: string;
  name: string;
  email: string | undefined;
  status: {{EntityName}}Status;
  createdAt: Date;
  tags: string[];
}

export enum {{EntityName}}Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
}

// ============================================
// 3. マッピング定義
// ============================================

/**
 * ステータス値のマッピング
 */
const STATUS_MAPPING: Record<string, {{EntityName}}Status> = {
  active: {{EntityName}}Status.ACTIVE,
  inactive: {{EntityName}}Status.INACTIVE,
  pending: {{EntityName}}Status.PENDING,
};

const REVERSE_STATUS_MAPPING: Record<{{EntityName}}Status, string> = {
  [{{EntityName}}Status.ACTIVE]: "active",
  [{{EntityName}}Status.INACTIVE]: "inactive",
  [{{EntityName}}Status.PENDING]: "pending",
};

// ============================================
// 4. Inbound変換（外部 → 内部）
// ============================================

/**
 * 外部レスポンスを内部型に変換
 * @param data 外部APIからの生データ
 * @returns 内部ドメインモデル
 * @throws {z.ZodError} 検証失敗時
 */
export function transformTo{{EntityName}}(data: unknown): {{EntityName}} {
  // 1. 実行時検証
  const external = External{{EntityName}}Schema.parse(data);

  // 2. フィールド変換
  return {
    id: external.{{external_id}},
    name: external.{{external_name}},
    email: external.{{external_email}} ?? undefined,
    status: transformStatus(external.{{external_status}}),
    createdAt: transformTimestamp(external.{{external_created_at}}),
    tags: external.{{external_metadata}}?.tags ?? [],
  };
}

/**
 * 外部配列レスポンスを内部型配列に変換
 */
export function transformTo{{EntityName}}List(data: unknown): {{EntityName}}[] {
  const array = z.array(External{{EntityName}}Schema).parse(data);
  return array.map((item) => transformTo{{EntityName}}(item));
}

/**
 * 安全な変換（Result型を返す）
 */
export function safeTransformTo{{EntityName}}(
  data: unknown
): { success: true; data: {{EntityName}} } | { success: false; error: Error } {
  try {
    const result = transformTo{{EntityName}}(data);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// ============================================
// 5. Outbound変換（内部 → 外部）
// ============================================

/**
 * 内部型を外部リクエスト形式に変換
 * @param entity 内部ドメインモデル
 * @returns 外部APIリクエスト形式
 */
export function transformToExternal(
  entity: Omit<{{EntityName}}, "id" | "createdAt">
): External{{EntityName}}Request {
  return {
    {{external_name}}: entity.name,
    {{external_email}}: entity.email ?? null,
    {{external_status}}: REVERSE_STATUS_MAPPING[entity.status],
    {{external_metadata}}: entity.tags.length > 0 ? { tags: entity.tags } : undefined,
  };
}

/**
 * 部分更新用の変換
 * 設定されたフィールドのみを含む
 */
export function transformToPartialExternal(
  partial: Partial<{{EntityName}}>
): Partial<External{{EntityName}}Request> {
  const result: Partial<External{{EntityName}}Request> = {};

  if (partial.name !== undefined) {
    result.{{external_name}} = partial.name;
  }

  if (partial.email !== undefined) {
    result.{{external_email}} = partial.email ?? null;
  }

  if (partial.status !== undefined) {
    result.{{external_status}} = REVERSE_STATUS_MAPPING[partial.status];
  }

  if (partial.tags !== undefined) {
    result.{{external_metadata}} = { tags: partial.tags };
  }

  return result;
}

// ============================================
// 6. フィールド変換ヘルパー
// ============================================

/**
 * Unix timestamp (秒) → Date
 */
function transformTimestamp(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * Date → Unix timestamp (秒)
 */
function transformToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * 外部ステータス → 内部ステータス
 */
function transformStatus(externalStatus: string): {{EntityName}}Status {
  const status = STATUS_MAPPING[externalStatus];
  if (!status) {
    throw new Error(`Unknown status: ${externalStatus}`);
  }
  return status;
}

// ============================================
// 7. エラー変換
// ============================================

/**
 * 外部エラーコードのマッピング
 */
export const ERROR_CODE_MAPPING: Record<string, string> = {
  NOT_FOUND: "{{EntityName}}NotFound",
  INVALID_REQUEST: "ValidationError",
  UNAUTHORIZED: "AuthenticationError",
  FORBIDDEN: "AuthorizationError",
  RATE_LIMITED: "RateLimitError",
  SERVER_ERROR: "ExternalServiceError",
};

/**
 * 外部エラーを内部エラーに変換
 */
export function transformError(
  externalError: { code: string; message: string }
): Error {
  const errorName = ERROR_CODE_MAPPING[externalError.code] ?? "UnknownError";

  const error = new Error(externalError.message);
  error.name = errorName;
  return error;
}

// ============================================
// 8. バリデーションヘルパー
// ============================================

/**
 * 外部データの検証のみ（変換なし）
 */
export function validateExternal(data: unknown): External{{EntityName}} {
  return External{{EntityName}}Schema.parse(data);
}

/**
 * 外部データの安全な検証
 */
export function safeValidateExternal(
  data: unknown
): z.SafeParseReturnType<unknown, External{{EntityName}}> {
  return External{{EntityName}}Schema.safeParse(data);
}

// ============================================
// 9. 型ガード
// ============================================

/**
 * 内部型かどうかを判定
 */
export function is{{EntityName}}(value: unknown): value is {{EntityName}} {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    obj.createdAt instanceof Date &&
    Object.values({{EntityName}}Status).includes(obj.status as {{EntityName}}Status)
  );
}
