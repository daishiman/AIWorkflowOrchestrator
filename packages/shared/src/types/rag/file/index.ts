/**
 * ファイル・変換ドメインモジュール
 *
 * @description RAGパイプラインにおけるファイル選択・変換処理の型定義、
 *              Zodスキーマ、ユーティリティ関数を提供
 * @module @repo/shared/types/rag/file
 *
 * @example
 * ```typescript
 * import {
 *   // 型
 *   FileType, FileCategory, FileEntity, ConversionEntity,
 *   // 定数
 *   FileTypes, FileCategories,
 *   // スキーマ
 *   fileEntitySchema, conversionEntitySchema,
 *   // ユーティリティ
 *   getFileTypeFromExtension, calculateFileHash, formatFileSize,
 * } from "@repo/shared/types/rag/file";
 * ```
 */

// ========================================
// 型定義 (types.ts)
// ========================================

export {
  // Branded Types
  type FileId,
  type ConversionId,
  // 定数オブジェクト
  FileTypes,
  FileCategories,
  // 共有定数
  DEFAULT_MAX_FILE_SIZE,
  SHA256_HASH_PATTERN,
  // ユニオン型
  type FileType,
  type FileCategory,
  type AsyncStatus,
  // エンティティ型
  type FileEntity,
  type ConversionEntity,
  // 値オブジェクト型
  type ExtractedMetadata,
  type ConversionResult,
  // 入出力型
  type FileSelectionInput,
  type FileSelectionResult,
  type SkippedFile,
} from "./types";

// ========================================
// Zodスキーマ (schemas.ts)
// ========================================

export {
  // 列挙型スキーマ
  fileTypeSchema,
  fileCategorySchema,
  // エンティティスキーマ
  fileEntitySchema,
  conversionEntitySchema,
  conversionEntityWithValidationSchema,
  // 値オブジェクトスキーマ
  extractedMetadataSchema,
  conversionResultSchema,
  // 入出力スキーマ
  skippedFileSchema,
  fileSelectionInputSchema,
  fileSelectionResultSchema,
  // パーシャルスキーマ（更新用）
  partialFileEntitySchema,
  partialConversionEntitySchema,
  // 作成用スキーマ
  createFileEntitySchema,
  createConversionEntitySchema,
  // 型推論用エクスポート
  type FileTypeSchema,
  type FileCategorySchema,
  type FileEntitySchema,
  type ConversionEntitySchema,
  type ExtractedMetadataSchema,
  type ConversionResultSchema,
  type SkippedFileSchema,
  type FileSelectionInputSchema,
  type FileSelectionResultSchema,
  type PartialFileEntitySchema,
  type PartialConversionEntitySchema,
  type CreateFileEntitySchema,
  type CreateConversionEntitySchema,
} from "./schemas";

// ========================================
// ユーティリティ関数 (utils.ts)
// ========================================

export {
  // Result型
  type Result,
  type SuccessResult,
  type FailureResult,
  // ファイルタイプ関連
  getFileTypeFromExtension,
  getFileTypeFromPath,
  getFileCategoryFromType,
  // ハッシュ計算
  calculateFileHash,
  calculateFileHashSync,
  // ファイルサイズ
  formatFileSize,
  parseFileSize,
  // バリデーション
  isValidFileExtension,
  isValidHash,
  validateFileSize,
  // ファイル名・パス操作
  extractFileName,
  extractFileExtension,
} from "./utils";
