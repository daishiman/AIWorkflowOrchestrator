/**
 * 履歴/ログ表示UIコンポーネント 型定義
 *
 * @module @repo/desktop/renderer/components/history/types
 */

// =============================================================================
// バージョン履歴関連型
// =============================================================================

/**
 * バージョン履歴アイテム
 */
export interface VersionHistoryItem {
  /** 変換ID */
  conversionId: string;
  /** ファイルID */
  fileId: string;
  /** バージョン番号 */
  version: number;
  /** 作成日時 (ISO 8601形式) */
  createdAt: string;
  /** ファイルサイズ (bytes) */
  size: number;
  /** MIMEタイプ */
  mimeType: string;
  /** コンテンツハッシュ */
  hash: string;
  /** 最新バージョンフラグ */
  isLatest: boolean;
  /** メタデータ (オプション) */
  metadata?: Record<string, unknown>;
}

// =============================================================================
// 変換ログ関連型
// =============================================================================

/**
 * ログレベル
 */
export type LogLevel = "info" | "warn" | "error" | "debug";

/**
 * 変換ログエントリ
 */
export interface ConversionLog {
  /** タイムスタンプ (ISO 8601形式) */
  timestamp: string;
  /** ログレベル */
  level: LogLevel;
  /** ログメッセージ */
  message: string;
  /** 詳細情報 (オプション) */
  details?: Record<string, unknown>;
}

// =============================================================================
// ページネーション関連型
// =============================================================================

/**
 * ページネーション結果
 */
export interface PaginatedResult<T> {
  /** アイテム配列 */
  items: T[];
  /** 総件数 */
  total: number;
  /** 追加データの有無 */
  hasMore: boolean;
}

/**
 * ページネーションオプション
 */
export interface PaginationOptions {
  /** 取得件数 (デフォルト: 20) */
  limit?: number;
  /** オフセット (デフォルト: 0) */
  offset?: number;
}

// =============================================================================
// フィルタ関連型
// =============================================================================

/**
 * ログフィルタオプション
 */
export interface LogFilterOptions extends PaginationOptions {
  /** ログレベルフィルタ */
  level?: LogLevel;
}

// =============================================================================
// API結果型
// =============================================================================

/**
 * 成功結果
 */
export interface SuccessResult<T> {
  success: true;
  data: T;
}

/**
 * 失敗結果
 */
export interface ErrorResult {
  success: false;
  error: Error;
}

/**
 * API結果型
 */
export type Result<T> = SuccessResult<T> | ErrorResult;

// =============================================================================
// バージョン詳細データ
// =============================================================================

/**
 * バージョン詳細データ
 */
export interface VersionDetailData {
  version: VersionHistoryItem;
  logs: ConversionLog[];
}

// =============================================================================
// History API インターフェース
// =============================================================================

/**
 * History API (window.historyAPI)
 */
export interface HistoryAPI {
  /** 履歴一覧取得 */
  getFileHistory(
    fileId: string,
    options?: PaginationOptions,
  ): Promise<Result<PaginatedResult<VersionHistoryItem>>>;

  /** バージョン詳細取得 */
  getVersionDetail(conversionId: string): Promise<Result<VersionDetailData>>;

  /** 変換ログ取得 */
  getConversionLogs(
    conversionId: string,
    options?: LogFilterOptions,
  ): Promise<Result<PaginatedResult<ConversionLog>>>;

  /** バージョン復元 */
  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem>>;
}

// =============================================================================
// Window拡張
// =============================================================================

declare global {
  interface Window {
    historyAPI?: HistoryAPI;
  }
}
