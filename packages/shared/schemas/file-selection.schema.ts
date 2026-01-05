/**
 * ファイル選択機能Zodスキーマ
 *
 * ファイル選択機能で使用するバリデーションスキーマを型安全に一元管理するモジュール。
 * ランタイムバリデーションとTypeScript型推論を統合して提供する。
 *
 * @see docs/30-workflows/file-selection/step03-type-design.md
 *
 * @example
 * ```typescript
 * import {
 *   filePathSchema,
 *   selectedFileSchema,
 * } from "@repo/shared/schemas";
 *
 * // バリデーション
 * const result = filePathSchema.safeParse("/Users/test/file.pdf");
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */

import { z } from "zod";

// ============================================================================
// 基本スキーマ
// ============================================================================

/**
 * ファイル拡張子エラーメッセージ
 */
export const FILE_EXTENSION_ERRORS = {
  format: "拡張子は「.」で始まり、英小文字・数字のみ使用可能です",
  maxLength: "拡張子は10文字以内です",
} as const;

/**
 * ファイル拡張子パターン
 * - "."で始まる
 * - 英小文字と数字のみ許可（大文字は不可）
 * - 最大10文字
 *
 * @example
 * ```typescript
 * fileExtensionSchema.parse(".pdf"); // ".pdf"
 * fileExtensionSchema.parse(".PDF"); // ZodError: 大文字は不可
 * ```
 */
export const fileExtensionSchema = z
  .string()
  .regex(/^\.[a-z0-9]+$/, {
    message: FILE_EXTENSION_ERRORS.format,
  })
  .max(10, { message: FILE_EXTENSION_ERRORS.maxLength });

/**
 * ファイルパスエラーメッセージ
 */
export const FILE_PATH_ERRORS = {
  required: "ファイルパスは必須です",
  maxLength: "ファイルパスは1000文字以内です",
  traversal: "不正なパスです（ディレクトリトラバーサルは許可されていません）",
} as const;

/**
 * パストラバーサルを検出
 */
function containsPathTraversal(path: string): boolean {
  // Unix形式: ../
  // Windows形式: ..\
  return path.includes("..") || path.includes("..");
}

/**
 * ファイルパススキーマ
 * - 空文字を許可しない
 * - 最大1000文字（クロスプラットフォーム対応）
 * - パストラバーサル（..）を含まない
 *
 * @example
 * ```typescript
 * filePathSchema.parse("/Users/test/file.pdf"); // OK
 * filePathSchema.parse("../etc/passwd"); // ZodError: パストラバーサル
 * ```
 */
export const filePathSchema = z
  .string()
  .min(1, { message: FILE_PATH_ERRORS.required })
  .max(1000, { message: FILE_PATH_ERRORS.maxLength })
  .refine((path) => !containsPathTraversal(path), {
    message: FILE_PATH_ERRORS.traversal,
  });

/**
 * ファイルパススキーマ（バリデーション専用）
 * - IPCハンドラで検証に使用
 * - パストラバーサルチェックはハンドラ側で実施
 *
 * @internal
 */
export const filePathForValidationSchema = z
  .string()
  .min(1, { message: FILE_PATH_ERRORS.required })
  .max(1000, { message: FILE_PATH_ERRORS.maxLength });

/**
 * パストラバーサルチェック関数（エクスポート）
 */
export { containsPathTraversal };

/**
 * MIMEタイプエラーメッセージ
 */
export const MIME_TYPE_ERRORS = {
  format: "不正なMIMEタイプ形式です",
} as const;

/**
 * MIMEタイプスキーマ
 * type/subtype形式を検証
 *
 * @example
 * ```typescript
 * mimeTypeSchema.parse("application/pdf"); // OK
 * mimeTypeSchema.parse("pdf"); // ZodError
 * ```
 */
export const mimeTypeSchema = z.string().regex(/^[\w-]+\/[\w+.-]+$/, {
  message: MIME_TYPE_ERRORS.format,
});

// ============================================================================
// ファイルフィルター
// ============================================================================

/**
 * ファイルフィルターカテゴリ
 */
export const fileFilterCategorySchema = z.enum([
  "all",
  "office",
  "text",
  "media",
  "image",
]);

/**
 * ダイアログファイルフィルターエラーメッセージ
 */
export const DIALOG_FILE_FILTER_ERRORS = {
  nameMaxLength: "フィルター名は50文字以内です",
  extensionsMaxCount: "拡張子は20個までです",
} as const;

/**
 * カスタムファイルフィルター
 * Electron dialog.showOpenDialog の filters に対応
 */
export const dialogFileFilterSchema = z.object({
  /** フィルター名（表示用） */
  name: z
    .string()
    .max(50, { message: DIALOG_FILE_FILTER_ERRORS.nameMaxLength }),
  /** 拡張子リスト（"."なし） */
  extensions: z
    .array(z.string().max(10))
    .max(20, { message: DIALOG_FILE_FILTER_ERRORS.extensionsMaxCount }),
});

// ============================================================================
// 選択されたファイル情報
// ============================================================================

/**
 * 選択されたファイルエラーメッセージ
 */
export const SELECTED_FILE_ERRORS = {
  invalidId: "不正なIDフォーマットです",
  nameRequired: "ファイル名は必須です",
  nameMaxLength: "ファイル名は255文字以内です",
  sizeNonNegative: "ファイルサイズは0以上である必要があります",
  sizeInteger: "ファイルサイズは整数である必要があります",
  invalidDatetime: "日時のフォーマットが不正です",
} as const;

/**
 * 選択されたファイルのメタ情報
 */
export const selectedFileSchema = z.object({
  /** ユニークID（UUID v4） */
  id: z.string().uuid({ message: SELECTED_FILE_ERRORS.invalidId }),
  /** ファイルの絶対パス */
  path: filePathSchema,
  /** ファイル名（拡張子含む） */
  name: z
    .string()
    .min(1, { message: SELECTED_FILE_ERRORS.nameRequired })
    .max(255, { message: SELECTED_FILE_ERRORS.nameMaxLength }),
  /** 拡張子（.pdf形式、小文字に正規化） */
  extension: fileExtensionSchema,
  /** ファイルサイズ（バイト） */
  size: z.number().int().nonnegative(),
  /** MIMEタイプ */
  mimeType: mimeTypeSchema,
  /** ファイルの最終更新日時（ISO文字列） */
  lastModified: z
    .string()
    .datetime({ message: SELECTED_FILE_ERRORS.invalidDatetime }),
  /** 選択日時（ISO文字列） */
  createdAt: z
    .string()
    .datetime({ message: SELECTED_FILE_ERRORS.invalidDatetime }),
});

// ============================================================================
// IPC通信スキーマ
// ============================================================================

/**
 * ダイアログリクエストエラーメッセージ
 */
export const OPEN_FILE_DIALOG_ERRORS = {
  titleMaxLength: "タイトルは100文字以内です",
  customFiltersMaxCount: "カスタムフィルターは10個までです",
} as const;

/**
 * ファイル選択ダイアログリクエスト
 */
export const openFileDialogRequestSchema = z.object({
  /** ダイアログタイトル */
  title: z
    .string()
    .max(100, { message: OPEN_FILE_DIALOG_ERRORS.titleMaxLength })
    .optional(),
  /** 複数選択を許可 */
  multiSelections: z.boolean().optional().default(true),
  /** プリセットフィルターカテゴリ */
  filterCategory: fileFilterCategorySchema.optional(),
  /** カスタムフィルター（filterCategoryより優先） */
  customFilters: z
    .array(dialogFileFilterSchema)
    .max(10, { message: OPEN_FILE_DIALOG_ERRORS.customFiltersMaxCount })
    .optional(),
  /** 初期ディレクトリ */
  defaultPath: filePathSchema.optional(),
});

/**
 * ファイル選択ダイアログレスポンス
 */
export const openFileDialogResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.object({
      /** キャンセルされたか */
      canceled: z.boolean(),
      /** 選択されたファイルパスの配列 */
      filePaths: z.array(filePathSchema),
    }),
  })
  .or(
    z.object({
      success: z.literal(false),
      error: z.string(),
    }),
  );

/**
 * ファイルメタ情報取得リクエスト
 */
export const getFileMetadataRequestSchema = z.object({
  /** ファイルパス */
  filePath: filePathSchema,
});

/**
 * ファイルメタ情報取得レスポンス
 */
export const getFileMetadataResponseSchema = z
  .object({
    success: z.literal(true),
    data: selectedFileSchema,
  })
  .or(
    z.object({
      success: z.literal(false),
      error: z.string(),
    }),
  );

/**
 * 複数ファイルメタ情報取得エラーメッセージ
 */
export const GET_MULTIPLE_FILE_METADATA_ERRORS = {
  maxFiles: "一度に取得できるファイルは100件までです",
} as const;

/**
 * 複数ファイルメタ情報取得リクエスト
 * パストラバーサルチェックはハンドラ側で個別に実施
 */
export const getMultipleFileMetadataRequestSchema = z.object({
  /** ファイルパスの配列 */
  filePaths: z.array(filePathForValidationSchema).max(100, {
    message: GET_MULTIPLE_FILE_METADATA_ERRORS.maxFiles,
  }),
});

/**
 * 複数ファイルメタ情報取得レスポンス
 */
export const getMultipleFileMetadataResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.object({
      /** 成功したファイル */
      files: z.array(selectedFileSchema),
      /** 失敗したファイル */
      errors: z.array(
        z.object({
          filePath: filePathSchema,
          error: z.string(),
        }),
      ),
    }),
  })
  .or(
    z.object({
      success: z.literal(false),
      error: z.string(),
    }),
  );

/**
 * パス検証リクエスト
 * パストラバーサルチェックはハンドラ側で実施
 */
export const validateFilePathRequestSchema = z.object({
  /** 検証するファイルパス */
  filePath: filePathForValidationSchema,
});

/**
 * パス検証レスポンス
 */
export const validateFilePathResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.object({
      valid: z.boolean(),
      exists: z.boolean().optional(),
      isFile: z.boolean().optional(),
      isDirectory: z.boolean().optional(),
      error: z.string().optional(),
    }),
  })
  .or(
    z.object({
      success: z.literal(false),
      error: z.string(),
    }),
  );

// ============================================================================
// 状態管理スキーマ
// ============================================================================

/**
 * ファイル選択状態
 */
export const fileSelectionStateSchema = z.object({
  /** 選択されたファイルリスト */
  files: z.array(selectedFileSchema),
  /** 現在のフィルターカテゴリ */
  filterCategory: fileFilterCategorySchema,
  /** ドラッグ中かどうか */
  isDragging: z.boolean(),
  /** ローディング状態 */
  isLoading: z.boolean(),
  /** エラー情報（null = エラーなし） */
  error: z.string().nullable(),
});

// ============================================================================
// Zodから推論される型
// ============================================================================

/** ファイル拡張子 */
export type FileExtension = z.infer<typeof fileExtensionSchema>;

/** ファイルパス */
export type FilePath = z.infer<typeof filePathSchema>;

/** MIMEタイプ */
export type MimeType = z.infer<typeof mimeTypeSchema>;

/** ファイルフィルターカテゴリ */
export type FileFilterCategory = z.infer<typeof fileFilterCategorySchema>;

/** ダイアログファイルフィルター */
export type DialogFileFilter = z.infer<typeof dialogFileFilterSchema>;

/** 選択されたファイル */
export type SelectedFile = z.infer<typeof selectedFileSchema>;

/** ファイル選択ダイアログリクエスト */
export type OpenFileDialogRequest = z.infer<typeof openFileDialogRequestSchema>;

/** ファイル選択ダイアログレスポンス */
export type OpenFileDialogResponse = z.infer<
  typeof openFileDialogResponseSchema
>;

/** ファイルメタ情報取得リクエスト */
export type GetFileMetadataRequest = z.infer<
  typeof getFileMetadataRequestSchema
>;

/** ファイルメタ情報取得レスポンス */
export type GetFileMetadataResponse = z.infer<
  typeof getFileMetadataResponseSchema
>;

/** 複数ファイルメタ情報取得リクエスト */
export type GetMultipleFileMetadataRequest = z.infer<
  typeof getMultipleFileMetadataRequestSchema
>;

/** 複数ファイルメタ情報取得レスポンス */
export type GetMultipleFileMetadataResponse = z.infer<
  typeof getMultipleFileMetadataResponseSchema
>;

/** パス検証リクエスト */
export type ValidateFilePathRequest = z.infer<
  typeof validateFilePathRequestSchema
>;

/** パス検証レスポンス */
export type ValidateFilePathResponse = z.infer<
  typeof validateFilePathResponseSchema
>;

/** ファイル選択状態 */
export type FileSelectionState = z.infer<typeof fileSelectionStateSchema>;
