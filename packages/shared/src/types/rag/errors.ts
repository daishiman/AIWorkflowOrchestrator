/**
 * @file エラー型定義
 * @module @repo/shared/types/rag/errors
 * @description 一貫したエラーハンドリングのための共通エラー型
 */

// =============================================================================
// エラーコード定数
// =============================================================================

/**
 * RAGシステムで使用するエラーコードの定義
 * as constによりリテラル型として推論され、型安全性が向上
 *
 * カテゴリ:
 * - FILE_*: ファイル操作関連
 * - CONVERSION_*: 変換処理関連
 * - DB_*: データベース関連
 * - EMBEDDING_*: 埋め込み生成関連
 * - SEARCH_*: 検索関連
 * - *_EXTRACTION_*: 抽出処理関連
 * - COMMUNITY_*: グラフ分析関連
 * - VALIDATION_*, INTERNAL_*: 汎用
 */
export const ErrorCodes = Object.freeze({
  // ファイル関連
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FILE_READ_ERROR: "FILE_READ_ERROR",
  FILE_WRITE_ERROR: "FILE_WRITE_ERROR",
  UNSUPPORTED_FILE_TYPE: "UNSUPPORTED_FILE_TYPE",

  // 変換関連
  CONVERSION_FAILED: "CONVERSION_FAILED",
  CONVERTER_NOT_FOUND: "CONVERTER_NOT_FOUND",

  // データベース関連
  DB_CONNECTION_ERROR: "DB_CONNECTION_ERROR",
  DB_QUERY_ERROR: "DB_QUERY_ERROR",
  DB_TRANSACTION_ERROR: "DB_TRANSACTION_ERROR",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",

  // 埋め込み関連
  EMBEDDING_GENERATION_ERROR: "EMBEDDING_GENERATION_ERROR",
  EMBEDDING_PROVIDER_ERROR: "EMBEDDING_PROVIDER_ERROR",

  // 検索関連
  SEARCH_ERROR: "SEARCH_ERROR",
  QUERY_PARSE_ERROR: "QUERY_PARSE_ERROR",

  // グラフ関連
  ENTITY_EXTRACTION_ERROR: "ENTITY_EXTRACTION_ERROR",
  RELATION_EXTRACTION_ERROR: "RELATION_EXTRACTION_ERROR",
  COMMUNITY_DETECTION_ERROR: "COMMUNITY_DETECTION_ERROR",

  // 汎用
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const);

// =============================================================================
// 型定義
// =============================================================================

/**
 * エラーコード型 - ErrorCodesの値のユニオン型
 * @example
 * const code: ErrorCode = "FILE_NOT_FOUND"; // OK
 * const code: ErrorCode = "INVALID"; // コンパイルエラー
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * 基底エラーインターフェース
 * すべてのエラー型の基盤となる
 */
export interface BaseError {
  /** エラーコード（識別子） */
  readonly code: string;
  /** 人間可読なエラーメッセージ */
  readonly message: string;
  /** エラー発生時刻 */
  readonly timestamp: Date;
  /** エラーに関する追加コンテキスト情報 */
  readonly context?: Record<string, unknown>;
}

/**
 * RAGシステム固有のエラー型
 * BaseErrorを拡張し、ErrorCode型のcodeと原因エラーをサポート
 */
export interface RAGError extends BaseError {
  /** ErrorCodesで定義されたエラーコード */
  readonly code: ErrorCode;
  /** このエラーの原因となったエラー */
  readonly cause?: Error;
}

// =============================================================================
// ファクトリ関数
// =============================================================================

/**
 * RAGErrorを生成する
 * @param code エラーコード
 * @param message エラーメッセージ
 * @param context 追加コンテキスト情報（オプション）
 * @param cause 原因エラー（オプション）
 * @returns RAGError
 * @example
 * // 基本的な使用
 * const error = createRAGError(ErrorCodes.FILE_NOT_FOUND, "File not found: input.pdf");
 *
 * // コンテキスト付き
 * const error = createRAGError(
 *   ErrorCodes.DB_QUERY_ERROR,
 *   "Query failed",
 *   { query: "SELECT * FROM files", params: [] }
 * );
 *
 * // 原因エラー付き
 * try {
 *   await readFile(path);
 * } catch (e) {
 *   throw createRAGError(ErrorCodes.FILE_READ_ERROR, "Failed to read file", { path }, e as Error);
 * }
 */
export const createRAGError = (
  code: ErrorCode,
  message: string,
  context?: Record<string, unknown>,
  cause?: Error,
): RAGError => ({
  code,
  message,
  timestamp: new Date(),
  context,
  cause,
});
