/**
 * 履歴取得サービス 型定義
 *
 * @module @repo/shared/services/history/types
 * @description ファイルバージョン履歴管理のための型定義とZodスキーマ
 */

import { z } from "zod";

// =============================================================================
// Zodスキーマ定義
// =============================================================================

/**
 * バージョン履歴アイテムスキーマ
 */
export const versionHistoryItemSchema = z.object({
  /** 変換ID */
  conversionId: z.string(),

  /** ファイルID */
  fileId: z.string(),

  /** ファイル名 */
  fileName: z.string().min(1),

  /** バージョン番号 */
  version: z.number().int().min(0),

  /** 作成日時 */
  createdAt: z.date(),

  /** MIMEタイプ */
  mimeType: z.string().min(1),

  /** コンテンツハッシュ */
  contentHash: z.string().min(1),

  /** ファイルサイズ */
  sizeBytes: z.number().int().nonnegative(),

  /** メタデータ */
  metadata: z.record(z.string(), z.unknown()).optional(),

  /** 現在のバージョンか */
  isCurrentVersion: z.boolean(),
});

/**
 * 履歴フィルタスキーマ
 */
export const historyFilterSchema = z.object({
  /** 開始日 */
  dateFrom: z.date().optional(),

  /** 終了日 */
  dateTo: z.date().optional(),

  /** 対象MIMEタイプ */
  mimeTypes: z.array(z.string()).optional(),
});

/**
 * ページネーションスキーマ
 */
export const paginationOptionsSchema = z.object({
  /** 取得件数 */
  limit: z.number().int().min(1).max(100).default(20),

  /** オフセット */
  offset: z.number().int().min(0).default(0),
});

/**
 * メタデータ変更スキーマ
 */
export const metadataChangeSchema = z.object({
  key: z.string(),
  oldValue: z.unknown(),
  newValue: z.unknown(),
});

/**
 * バージョン差分スキーマ
 */
export const versionDiffSchema = z.object({
  conversionIdA: z.string(),
  conversionIdB: z.string(),
  sizeChange: z.number().int(),
  metadataChanges: z.array(metadataChangeSchema),
  contentChanged: z.boolean(),
});

// =============================================================================
// 型定義（Zodから推論）
// =============================================================================

/**
 * バージョン履歴アイテム
 */
export type VersionHistoryItem = z.infer<typeof versionHistoryItemSchema>;

/**
 * 履歴フィルタ
 */
export type HistoryFilter = z.infer<typeof historyFilterSchema>;

/**
 * ページネーションオプション
 */
export type PaginationOptions = z.infer<typeof paginationOptionsSchema>;

/**
 * メタデータ変更情報
 */
export type MetadataChange = z.infer<typeof metadataChangeSchema>;

/**
 * バージョン差分情報
 */
export type VersionDiff = z.infer<typeof versionDiffSchema>;

// =============================================================================
// 追加の型定義
// =============================================================================

/**
 * 履歴取得オプション
 */
export interface HistoryOptions {
  filter?: HistoryFilter;
  pagination?: PaginationOptions;
}

/**
 * ページネーション結果
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

/**
 * 変換データ（Repository層）
 */
export interface Conversion {
  id: string;
  fileId: string;
  fileName: string;
  createdAt: Date;
  mimeType: string;
  contentHash: string;
  sizeBytes: number;
  metadata?: Record<string, unknown>;
  content?: Buffer | string;
}

/**
 * 変換作成入力
 */
export interface CreateConversionInput {
  fileId: string;
  fileName: string;
  mimeType: string;
  content: Buffer | string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// リポジトリインターフェース
// =============================================================================

/**
 * ConversionRepository インターフェース
 */
export interface ConversionRepository {
  findByFileId(
    fileId: string,
    options?: {
      orderBy?: "createdAt";
      orderDirection?: "asc" | "desc";
      limit?: number;
      offset?: number;
      filter?: HistoryFilter;
    },
  ): Promise<import("../../types/rag/result").Result<Conversion[], Error>>;

  findById(
    conversionId: string,
  ): Promise<import("../../types/rag/result").Result<Conversion | null, Error>>;

  create(
    data: CreateConversionInput,
  ): Promise<import("../../types/rag/result").Result<Conversion, Error>>;

  countByFileId(
    fileId: string,
  ): Promise<import("../../types/rag/result").Result<number, Error>>;
}

/**
 * FileRepository インターフェース（将来拡張用）
 */
export interface FileRepository {
  findById(
    fileId: string,
  ): Promise<import("../../types/rag/result").Result<unknown | null, Error>>;
}

// =============================================================================
// サービスインターフェース
// =============================================================================

/**
 * IHistoryService インターフェース
 */
export interface IHistoryService {
  getFileHistory(
    fileId: string,
    options?: HistoryOptions,
  ): Promise<
    import("../../types/rag/result").Result<
      PaginatedResult<VersionHistoryItem>,
      Error
    >
  >;

  getVersionDetail(
    conversionId: string,
  ): Promise<
    import("../../types/rag/result").Result<VersionHistoryItem, Error>
  >;

  getVersionDiff(
    conversionIdA: string,
    conversionIdB: string,
  ): Promise<import("../../types/rag/result").Result<VersionDiff, Error>>;

  restoreToVersion(
    fileId: string,
    conversionId: string,
  ): Promise<
    import("../../types/rag/result").Result<VersionHistoryItem, Error>
  >;

  getLatestVersion(
    fileId: string,
  ): Promise<
    import("../../types/rag/result").Result<VersionHistoryItem | null, Error>
  >;

  getVersionCount(
    fileId: string,
  ): Promise<import("../../types/rag/result").Result<number, Error>>;
}
