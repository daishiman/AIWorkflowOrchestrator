/**
 * ファイル・変換ドメインユーティリティ関数
 *
 * @description ファイルタイプ推定、ハッシュ計算、サイズフォーマット等のユーティリティ
 * @module @repo/shared/types/rag/file/utils
 * @see docs/30-workflows/file-conversion-schemas/task-step01-utils-design.md
 */

import {
  FileTypes,
  FileCategories,
  DEFAULT_MAX_FILE_SIZE,
  SHA256_HASH_PATTERN,
  type FileType,
  type FileCategory,
} from "./types";
import { createHash } from "crypto";

// ========================================
// Result型（エクスポート）
// ========================================

/**
 * 成功結果
 */
export interface SuccessResult<T> {
  readonly success: true;
  readonly data: T;
}

/**
 * 失敗結果
 */
export interface FailureResult {
  readonly success: false;
  readonly error: string;
}

/**
 * 結果型（Railway Oriented Programming）
 * @description 成功/失敗を型安全に表現するユニオン型
 */
export type Result<T> = SuccessResult<T> | FailureResult;

// ========================================
// 拡張子マッピング
// ========================================

/**
 * 拡張子からMIMEタイプへのマッピング
 */
const EXTENSION_TO_TYPE_MAP: Record<string, FileType> = {
  // テキスト系
  txt: FileTypes.TEXT,
  text: FileTypes.TEXT,
  md: FileTypes.MARKDOWN,
  markdown: FileTypes.MARKDOWN,
  html: FileTypes.HTML,
  htm: FileTypes.HTML,
  csv: FileTypes.CSV,
  tsv: FileTypes.TSV,
  // コード系 - JavaScript
  js: FileTypes.JAVASCRIPT,
  mjs: FileTypes.JAVASCRIPT,
  cjs: FileTypes.JAVASCRIPT,
  jsx: FileTypes.JAVASCRIPT,
  // コード系 - TypeScript
  ts: FileTypes.TYPESCRIPT,
  mts: FileTypes.TYPESCRIPT,
  cts: FileTypes.TYPESCRIPT,
  tsx: FileTypes.TYPESCRIPT,
  // コード系 - その他
  py: FileTypes.PYTHON,
  pyw: FileTypes.PYTHON,
  json: FileTypes.JSON,
  yaml: FileTypes.YAML,
  yml: FileTypes.YAML,
  xml: FileTypes.XML,
  // ドキュメント系
  pdf: FileTypes.PDF,
  docx: FileTypes.DOCX,
  xlsx: FileTypes.XLSX,
  pptx: FileTypes.PPTX,
};

/**
 * MIMEタイプからカテゴリへのマッピング
 */
const TYPE_TO_CATEGORY_MAP: Record<FileType, FileCategory> = {
  // テキスト系 → text
  [FileTypes.TEXT]: FileCategories.TEXT,
  [FileTypes.MARKDOWN]: FileCategories.TEXT,
  [FileTypes.HTML]: FileCategories.TEXT,
  [FileTypes.CSV]: FileCategories.TEXT,
  [FileTypes.TSV]: FileCategories.TEXT,
  // コード系 → code
  [FileTypes.JAVASCRIPT]: FileCategories.CODE,
  [FileTypes.TYPESCRIPT]: FileCategories.CODE,
  [FileTypes.PYTHON]: FileCategories.CODE,
  [FileTypes.JSON]: FileCategories.CODE,
  [FileTypes.YAML]: FileCategories.CODE,
  [FileTypes.XML]: FileCategories.CODE,
  // ドキュメント系
  [FileTypes.PDF]: FileCategories.DOCUMENT,
  [FileTypes.DOCX]: FileCategories.DOCUMENT,
  [FileTypes.XLSX]: FileCategories.SPREADSHEET,
  [FileTypes.PPTX]: FileCategories.PRESENTATION,
  // その他
  [FileTypes.UNKNOWN]: FileCategories.OTHER,
};

// ========================================
// ファイルタイプ関連関数
// ========================================

/**
 * 拡張子からファイルタイプを取得
 *
 * @param extension - 拡張子（ドットあり/なし、大文字小文字不問）
 * @returns MIMEタイプ（未知の拡張子はUNKNOWN）
 *
 * @example
 * ```typescript
 * getFileTypeFromExtension(".ts") // "text/typescript"
 * getFileTypeFromExtension("md")  // "text/markdown"
 * getFileTypeFromExtension(".XYZ") // "application/octet-stream"
 * ```
 */
export function getFileTypeFromExtension(extension: string): FileType {
  const normalized = normalizeExtension(extension);
  return EXTENSION_TO_TYPE_MAP[normalized] ?? FileTypes.UNKNOWN;
}

/**
 * ファイルパスからファイルタイプを取得
 *
 * @param filePath - ファイルパス（Unix/Windows形式対応）
 * @returns MIMEタイプ
 *
 * @example
 * ```typescript
 * getFileTypeFromPath("/path/to/file.ts") // "text/typescript"
 * getFileTypeFromPath("C:\\Users\\file.md") // "text/markdown"
 * ```
 */
export function getFileTypeFromPath(filePath: string): FileType {
  const extension = extractFileExtension(filePath);
  return getFileTypeFromExtension(extension);
}

/**
 * ファイルタイプからカテゴリを取得
 *
 * @param fileType - MIMEタイプ
 * @returns ファイルカテゴリ
 *
 * @example
 * ```typescript
 * getFileCategoryFromType("text/typescript") // "code"
 * getFileCategoryFromType("application/pdf") // "document"
 * ```
 */
export function getFileCategoryFromType(fileType: FileType): FileCategory {
  return TYPE_TO_CATEGORY_MAP[fileType] ?? FileCategories.OTHER;
}

// ========================================
// ハッシュ関連関数
// ========================================

/**
 * SHA-256ハッシュを非同期で計算
 *
 * @param content - ハッシュ対象（文字列またはバイナリ）
 * @returns Result型でラップされたハッシュ値（64文字の16進数小文字）
 *
 * @example
 * ```typescript
 * const result = await calculateFileHash("Hello, World!");
 * if (result.success) {
 *   console.log(result.data); // 64文字の16進数
 * }
 * ```
 */
export async function calculateFileHash(
  content: string | ArrayBuffer | Uint8Array,
): Promise<Result<string>> {
  try {
    let data: Uint8Array;

    if (typeof content === "string") {
      data = new TextEncoder().encode(content);
    } else if (content instanceof ArrayBuffer) {
      data = new Uint8Array(content);
    } else {
      data = content;
    }

    // Web Crypto API を使用
    if (typeof globalThis.crypto?.subtle !== "undefined") {
      // Uint8Array から ArrayBuffer を取得（SharedArrayBuffer は使用していないため安全）
      const buffer = data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength,
      ) as ArrayBuffer;
      const hashBuffer = await globalThis.crypto.subtle.digest(
        "SHA-256",
        buffer,
      );
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return { success: true, data: hashHex };
    }

    // Node.js crypto fallback
    const hash = createHash("sha256");
    hash.update(Buffer.from(data));
    return { success: true, data: hash.digest("hex") };
  } catch (error) {
    return {
      success: false,
      error: `ハッシュ計算に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * SHA-256ハッシュを同期で計算（Node.js環境専用）
 *
 * @param content - ハッシュ対象の文字列
 * @returns Result型でラップされたハッシュ値
 *
 * @example
 * ```typescript
 * const result = calculateFileHashSync("Hello, World!");
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export function calculateFileHashSync(content: string): Result<string> {
  try {
    const hash = createHash("sha256");
    hash.update(content, "utf8");
    return { success: true, data: hash.digest("hex") };
  } catch (error) {
    return {
      success: false,
      error: `ハッシュ計算に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// ========================================
// ファイルサイズ関連関数
// ========================================

/** サイズ単位 */
const SIZE_UNITS = ["Bytes", "KB", "MB", "GB", "TB", "PB"] as const;

/** 1キロバイト */
const BYTES_PER_KB = 1024;

/** サイズ単位の乗数マッピング */
const SIZE_UNIT_MULTIPLIERS: Readonly<Record<string, number>> = {
  BYTE: 1,
  BYTES: 1,
  KB: BYTES_PER_KB,
  MB: BYTES_PER_KB ** 2,
  GB: BYTES_PER_KB ** 3,
  TB: BYTES_PER_KB ** 4,
  PB: BYTES_PER_KB ** 5,
};

/**
 * バイト数を人間が読みやすい形式にフォーマット
 *
 * @param bytes - バイト数（0以上）
 * @param decimals - 小数点以下の桁数（デフォルト: 2）
 * @returns フォーマットされたサイズ文字列
 * @throws 負の値の場合
 *
 * @example
 * ```typescript
 * formatFileSize(0)        // "0 Bytes"
 * formatFileSize(1024)     // "1.00 KB"
 * formatFileSize(1536, 1)  // "1.5 KB"
 * ```
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes < 0) {
    throw new Error("ファイルサイズは0以上である必要があります");
  }

  if (bytes === 0) {
    return "0 Bytes";
  }

  const unitIndex = Math.floor(Math.log(bytes) / Math.log(BYTES_PER_KB));
  const clampedIndex = Math.min(unitIndex, SIZE_UNITS.length - 1);
  const unit = SIZE_UNITS[clampedIndex];
  const value = bytes / Math.pow(BYTES_PER_KB, clampedIndex);

  // Bytes単位は整数表示
  if (clampedIndex === 0) {
    return `${Math.round(value)} ${unit}`;
  }

  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * サイズ文字列をバイト数にパース
 *
 * @param sizeStr - サイズ文字列（例: "1.5 MB", "512KB"）
 * @returns Result型でラップされたバイト数
 *
 * @example
 * ```typescript
 * parseFileSize("1 KB")   // { success: true, data: 1024 }
 * parseFileSize("1.5 MB") // { success: true, data: 1572864 }
 * ```
 */
export function parseFileSize(sizeStr: string): Result<number> {
  const trimmed = sizeStr.trim();

  // 正規表現でパース: 数値 + オプショナルスペース + 単位
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*(bytes?|kb|mb|gb|tb|pb)$/i);

  if (!match) {
    return {
      success: false,
      error: `無効なファイルサイズ形式です: ${sizeStr}`,
    };
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  if (value < 0) {
    return {
      success: false,
      error: "ファイルサイズは0以上である必要があります",
    };
  }

  const multiplier = SIZE_UNIT_MULTIPLIERS[unit];
  if (multiplier === undefined) {
    return { success: false, error: `不明な単位です: ${unit}` };
  }

  return { success: true, data: Math.round(value * multiplier) };
}

// ========================================
// バリデーション関連関数
// ========================================

// DEFAULT_MAX_FILE_SIZE は types.ts からインポート済み

/**
 * 拡張子がサポートされているか確認
 *
 * @param extension - 拡張子（ドットあり/なし）
 * @returns サポートされている場合true
 *
 * @example
 * ```typescript
 * isValidFileExtension(".ts")  // true
 * isValidFileExtension("xyz")  // false
 * ```
 */
export function isValidFileExtension(extension: string): boolean {
  if (!extension) {
    return false;
  }
  const normalized = normalizeExtension(extension);
  return normalized in EXTENSION_TO_TYPE_MAP;
}

/**
 * SHA-256ハッシュ形式を検証
 *
 * @param hash - 検証対象の文字列
 * @returns 有効なSHA-256形式の場合true
 *
 * @example
 * ```typescript
 * isValidHash("a".repeat(64)) // true
 * isValidHash("A".repeat(64)) // false (大文字)
 * ```
 */
export function isValidHash(hash: string): boolean {
  return SHA256_HASH_PATTERN.test(hash);
}

/**
 * ファイルサイズを検証
 *
 * @param size - バイト数
 * @param maxSize - 最大サイズ（デフォルト: 10MB）
 * @returns Result型の検証結果
 *
 * @example
 * ```typescript
 * validateFileSize(1024)           // { success: true }
 * validateFileSize(-1)             // { success: false, error: "..." }
 * validateFileSize(20_000_000)     // { success: false, error: "..." }
 * ```
 */
export function validateFileSize(
  size: number,
  maxSize: number = DEFAULT_MAX_FILE_SIZE,
): Result<void> {
  if (size < 0) {
    return {
      success: false,
      error: "ファイルサイズは0以上である必要があります",
    };
  }

  if (size > maxSize) {
    return {
      success: false,
      error: `ファイルサイズは${formatFileSize(maxSize)}以下である必要があります`,
    };
  }

  return { success: true, data: undefined };
}

// ========================================
// ファイル名関連関数
// ========================================

/**
 * パスからファイル名を抽出
 *
 * @param filePath - ファイルパス（Unix/Windows形式対応）
 * @returns ファイル名（パス区切り文字後の部分）
 *
 * @example
 * ```typescript
 * extractFileName("/path/to/file.ts")     // "file.ts"
 * extractFileName("C:\\Users\\file.md")   // "file.md"
 * ```
 */
export function extractFileName(filePath: string): string {
  // Unix/Windows両方のパス区切り文字に対応
  const lastSeparator = Math.max(
    filePath.lastIndexOf("/"),
    filePath.lastIndexOf("\\"),
  );

  if (lastSeparator === -1) {
    return filePath;
  }

  return filePath.slice(lastSeparator + 1);
}

/**
 * パスまたはファイル名から拡張子を抽出
 *
 * @param filePath - ファイルパスまたはファイル名
 * @returns 拡張子（ドット付き）、なければ空文字
 *
 * @example
 * ```typescript
 * extractFileExtension("/path/to/file.ts")  // ".ts"
 * extractFileExtension("file.test.ts")      // ".ts"
 * extractFileExtension(".gitignore")        // ""
 * ```
 */
export function extractFileExtension(filePath: string): string {
  const fileName = extractFileName(filePath);
  const lastDot = fileName.lastIndexOf(".");

  // ドットなし、または隠しファイル（.で始まる）の場合
  if (lastDot <= 0) {
    return "";
  }

  return fileName.slice(lastDot);
}

// ========================================
// 内部ヘルパー関数
// ========================================

/**
 * 拡張子を正規化（小文字、ドット除去）
 */
function normalizeExtension(extension: string): string {
  const trimmed = extension.trim().toLowerCase();
  return trimmed.startsWith(".") ? trimmed.slice(1) : trimmed;
}
