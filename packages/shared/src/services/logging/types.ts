/**
 * ConversionLogger 型定義
 *
 * ファイル変換処理のログ記録サービス用型定義とZodスキーマ
 *
 * @see docs/30-workflows/logging-service/outputs/phase-2/zod-schema-design.md
 */

import { z } from "zod";

// ============================================================================
// Enum Schemas
// ============================================================================

/**
 * ログレベルスキーマ
 * @description ログの重要度を定義
 */
export const logLevelSchema = z.enum(["info", "warn", "error"]);

/**
 * ログアクションスキーマ
 * @description ログが記録する処理種別を定義
 */
export const logActionSchema = z.enum([
  "convert",
  "restore",
  "delete",
  "chunk",
  "embed",
]);

// ============================================================================
// Object Schemas
// ============================================================================

/**
 * 変換ログスキーマ
 * @description ファイル変換処理の単一ログエントリを定義
 */
export const conversionLogSchema = z.object({
  /**
   * 一意識別子（UUID）
   */
  id: z.string().uuid(),

  /**
   * 作成日時
   */
  timestamp: z.date(),

  /**
   * ログレベル
   */
  level: logLevelSchema,

  /**
   * 対象ファイルID
   */
  fileId: z.string().min(1, "fileId cannot be empty"),

  /**
   * 対象ファイル名
   */
  fileName: z.string().min(1, "fileName cannot be empty"),

  /**
   * 変換処理ID（オプション）
   */
  conversionId: z.string().optional(),

  /**
   * アクション種別
   */
  action: logActionSchema,

  /**
   * ログメッセージ
   */
  message: z.string().min(1, "message cannot be empty"),

  /**
   * 追加情報（オプション）
   */
  details: z.record(z.string(), z.unknown()).optional(),

  /**
   * 処理時間（ミリ秒、オプション）
   */
  durationMs: z.number().nonnegative().optional(),

  /**
   * エラースタックトレース（オプション）
   */
  errorStack: z.string().optional(),
});

/**
 * 変換ログ入力スキーマ
 * @description ログ記録時の入力データを定義（id/timestamp/levelは自動付与）
 */
export const conversionLogInputSchema = z.object({
  /**
   * 対象ファイルID
   */
  fileId: z.string().min(1, "fileId cannot be empty"),

  /**
   * 対象ファイル名
   */
  fileName: z.string().min(1, "fileName cannot be empty"),

  /**
   * 変換処理ID（オプション）
   */
  conversionId: z.string().optional(),

  /**
   * アクション種別
   */
  action: logActionSchema,

  /**
   * ログメッセージ
   */
  message: z.string().min(1, "message cannot be empty"),

  /**
   * 追加情報（オプション）
   */
  details: z.record(z.string(), z.unknown()).optional(),

  /**
   * 処理時間（ミリ秒、オプション）
   */
  durationMs: z.number().nonnegative().optional(),
});

// ============================================================================
// Type Inference
// ============================================================================

/**
 * ログレベル型
 */
export type LogLevel = z.infer<typeof logLevelSchema>;

/**
 * ログアクション型
 */
export type LogAction = z.infer<typeof logActionSchema>;

/**
 * 変換ログ型
 */
export type ConversionLog = z.infer<typeof conversionLogSchema>;

/**
 * 変換ログ入力型
 */
export type ConversionLogInput = z.infer<typeof conversionLogInputSchema>;

// ============================================================================
// Result Type (Railway Oriented Programming)
// ============================================================================

/**
 * 成功結果
 */
export type Ok<T> = { success: true; data: T };

/**
 * 失敗結果
 */
export type Err<E = Error> = { success: false; error: E };

/**
 * Result型
 * @description 成功または失敗を表す型
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/**
 * 成功結果を作成
 */
export function ok<T>(data: T): Ok<T> {
  return { success: true, data };
}

/**
 * 失敗結果を作成
 */
export function err<E = Error>(error: E): Err<E> {
  return { success: false, error };
}

// ============================================================================
// Interfaces
// ============================================================================

/**
 * ILogRepository インターフェース
 * @description ログの永続化を担当するリポジトリのインターフェース
 */
export interface ILogRepository {
  /**
   * ログを一括挿入
   */
  bulkInsert(logs: ConversionLog[]): Promise<Result<void>>;

  /**
   * ファイルIDでログを検索
   */
  findByFileId(fileId: string): Promise<Result<ConversionLog[]>>;

  /**
   * ログレベルでログを検索
   */
  findByLevel(level: LogLevel): Promise<Result<ConversionLog[]>>;

  /**
   * 日付範囲でログを検索
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Result<ConversionLog[]>>;
}

/**
 * ConversionLoggerオプション
 */
export interface ConversionLoggerOptions {
  /**
   * バッファサイズ（デフォルト: 100）
   */
  bufferSize?: number;

  /**
   * 自動フラッシュ間隔（ミリ秒、デフォルト: 5000）
   */
  flushIntervalMs?: number;
}

/**
 * IConversionLogger インターフェース
 * @description ログ記録サービスのインターフェース
 */
export interface IConversionLogger {
  /**
   * INFOレベルのログを記録
   */
  info(input: ConversionLogInput): Promise<Result<ConversionLog>>;

  /**
   * WARNレベルのログを記録
   */
  warn(input: ConversionLogInput): Promise<Result<ConversionLog>>;

  /**
   * ERRORレベルのログを記録
   */
  error(
    input: ConversionLogInput,
    error?: Error,
  ): Promise<Result<ConversionLog>>;

  /**
   * 複数のログを一括記録
   */
  batch(
    logs: Array<{ level: LogLevel; input: ConversionLogInput }>,
  ): Promise<Result<ConversionLog[]>>;

  /**
   * バッファ内のログを手動でフラッシュ
   */
  flush(): Promise<Result<void>>;

  /**
   * リソースを解放（タイマー停止、最終フラッシュ）
   */
  dispose(): void;
}
