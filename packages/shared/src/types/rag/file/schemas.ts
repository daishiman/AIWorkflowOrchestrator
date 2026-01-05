/**
 * ファイル・変換ドメインZodスキーマ
 *
 * @description RAGパイプラインにおけるファイル選択・変換処理のランタイムバリデーション
 * @module @repo/shared/types/rag/file/schemas
 * @see docs/30-workflows/file-conversion-schemas/task-step01-schema-design.md
 */

import { z } from "zod";
import { DEFAULT_MAX_FILE_SIZE, SHA256_HASH_PATTERN } from "./types";

// ========================================
// 共通スキーマ
// ========================================

/**
 * UUIDスキーマ
 * @description UUID v4形式の文字列バリデーション
 */
const uuidSchema = z.string().uuid("有効なUUID形式である必要があります");

/**
 * SHA-256ハッシュスキーマ
 * @description 64文字の16進数文字列（小文字）
 */
const hashSchema = z
  .string()
  .length(64, "ハッシュは64文字（SHA-256形式）である必要があります")
  .regex(
    SHA256_HASH_PATTERN,
    "ハッシュは小文字の16進数文字列である必要があります",
  );

/**
 * 非同期処理状態スキーマ
 * @description 変換処理の進行状態
 */
const asyncStatusSchema = z.enum(
  ["pending", "processing", "completed", "failed"],
  {
    error:
      "無効なステータスです。pending, processing, completed, failed のいずれかを指定してください。",
  },
);

// ========================================
// 列挙型スキーマ
// ========================================

/**
 * ファイルタイプスキーマ
 *
 * @description MIMEタイプに基づくファイル種別のバリデーション
 * @validation 定義済みのMIMEタイプのいずれかであること
 */
export const fileTypeSchema = z.enum(
  [
    // テキスト系
    "text/plain",
    "text/markdown",
    "text/html",
    "text/csv",
    "text/tab-separated-values",
    // コード系
    "text/javascript",
    "text/typescript",
    "application/x-python",
    "application/json",
    "application/x-yaml",
    "application/xml",
    // ドキュメント系
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // その他
    "application/octet-stream",
  ],
  {
    error:
      "無効なファイルタイプです。サポートされているMIMEタイプを指定してください。",
  },
);

/** 型推論用エクスポート */
export type FileTypeSchema = z.infer<typeof fileTypeSchema>;

/**
 * ファイルカテゴリスキーマ
 *
 * @description ファイルの用途に基づく分類のバリデーション
 */
export const fileCategorySchema = z.enum(
  ["text", "code", "document", "spreadsheet", "presentation", "other"],
  {
    error:
      "無効なファイルカテゴリです。text, code, document, spreadsheet, presentation, other のいずれかを指定してください。",
  },
);

/** 型推論用エクスポート */
export type FileCategorySchema = z.infer<typeof fileCategorySchema>;

// ========================================
// エンティティスキーマ
// ========================================

/**
 * ファイルエンティティスキーマ
 *
 * @description RAGパイプラインで処理対象となるファイルのバリデーション
 */
export const fileEntitySchema = z.object({
  /** ファイルID（UUID形式） */
  id: uuidSchema.describe("ファイルの一意識別子"),

  /** ファイル名 */
  name: z
    .string()
    .min(1, "ファイル名は1文字以上である必要があります")
    .max(255, "ファイル名は255文字以下である必要があります")
    .describe("ファイル名（拡張子を含む）"),

  /** ファイルパス */
  path: z
    .string()
    .min(1, "ファイルパスは必須です")
    .describe("ファイルの絶対パスまたは相対パス"),

  /** MIMEタイプ */
  mimeType: fileTypeSchema.describe("MIMEタイプに基づくファイル種別"),

  /** ファイルカテゴリ */
  category: fileCategorySchema.describe("ファイルの用途に基づくカテゴリ"),

  /** ファイルサイズ */
  size: z
    .number()
    .int("ファイルサイズは整数である必要があります")
    .nonnegative("ファイルサイズは0以上である必要があります")
    .max(DEFAULT_MAX_FILE_SIZE, "ファイルサイズは10MB以下である必要があります")
    .describe("ファイルサイズ（バイト単位）"),

  /** SHA-256ハッシュ */
  hash: hashSchema.describe("重複検出用SHA-256ハッシュ"),

  /** 文字エンコーディング */
  encoding: z
    .string()
    .min(1, "エンコーディングは必須です")
    .describe("文字エンコーディング"),

  /** 最終更新日時 */
  lastModified: z.date().describe("ファイルの最終更新日時"),

  /** レコード作成日時 */
  createdAt: z.date().describe("レコード作成日時"),

  /** レコード更新日時 */
  updatedAt: z.date().describe("レコード更新日時"),

  /** 拡張可能なメタデータ */
  metadata: z.record(z.string(), z.unknown()).describe("拡張可能なメタデータ"),
});

/** 型推論用エクスポート */
export type FileEntitySchema = z.infer<typeof fileEntitySchema>;

/**
 * 変換エンティティスキーマ
 *
 * @description ファイル変換処理の状態と結果のバリデーション
 */
export const conversionEntitySchema = z.object({
  /** 変換ID */
  id: uuidSchema.describe("変換処理の一意識別子"),

  /** ファイルID参照 */
  fileId: uuidSchema.describe("変換対象ファイルへの参照"),

  /** 変換状態 */
  status: asyncStatusSchema.describe("変換処理の状態"),

  /** コンバーターID */
  converterId: z
    .string()
    .min(1, "コンバーターIDは必須です")
    .describe("使用されたコンバーターの識別子"),

  /** 入力ハッシュ */
  inputHash: hashSchema.describe("入力ファイルのハッシュ（キャッシュキー用）"),

  /** 出力ハッシュ（変換成功時のみ） */
  outputHash: hashSchema
    .nullable()
    .describe("出力コンテンツのハッシュ（変換成功時）"),

  /** 処理時間（変換完了時のみ） */
  duration: z
    .number()
    .int("処理時間は整数である必要があります")
    .nonnegative("処理時間は0以上である必要があります")
    .nullable()
    .describe("処理時間（ミリ秒、変換完了時）"),

  /** エラーメッセージ（変換失敗時のみ） */
  error: z.string().nullable().describe("エラーメッセージ（変換失敗時）"),

  /** レコード作成日時 */
  createdAt: z.date().describe("レコード作成日時"),

  /** レコード更新日時 */
  updatedAt: z.date().describe("レコード更新日時"),
});

/** 型推論用エクスポート */
export type ConversionEntitySchema = z.infer<typeof conversionEntitySchema>;

/**
 * 変換エンティティの状態整合性検証スキーマ
 *
 * @description 状態に応じた必須フィールドの検証
 */
export const conversionEntityWithValidationSchema = conversionEntitySchema
  .refine(
    (data) => {
      // completed 状態では outputHash と duration が必須
      if (data.status === "completed") {
        return data.outputHash !== null && data.duration !== null;
      }
      return true;
    },
    {
      message: "完了状態では outputHash と duration が必須です",
      path: ["status"],
    },
  )
  .refine(
    (data) => {
      // failed 状態では error が必須
      if (data.status === "failed") {
        return data.error !== null;
      }
      return true;
    },
    {
      message: "失敗状態では error が必須です",
      path: ["status"],
    },
  );

// ========================================
// 値オブジェクトスキーマ
// ========================================

/**
 * 抽出メタデータスキーマ
 *
 * @description ファイル変換時に抽出される付随情報のバリデーション
 */
export const extractedMetadataSchema = z.object({
  /** ドキュメントタイトル */
  title: z
    .string()
    .max(500, "タイトルは500文字以下である必要があります")
    .nullable()
    .describe("ドキュメントタイトル（Markdownの#等から抽出）"),

  /** 作成者 */
  author: z
    .string()
    .max(200, "作成者名は200文字以下である必要があります")
    .nullable()
    .describe("作成者（PDFメタデータ等から抽出）"),

  /** 言語コード */
  language: z
    .string()
    .length(2, "言語コードはISO 639-1形式（2文字）である必要があります")
    .regex(/^[a-z]{2}$/, "言語コードは小文字のアルファベット2文字です")
    .nullable()
    .describe("言語コード（ISO 639-1形式、例: ja, en）"),

  /** 単語数 */
  wordCount: z
    .number()
    .int("単語数は整数である必要があります")
    .nonnegative("単語数は0以上である必要があります")
    .describe("単語数"),

  /** 行数 */
  lineCount: z
    .number()
    .int("行数は整数である必要があります")
    .nonnegative("行数は0以上である必要があります")
    .describe("行数"),

  /** 文字数 */
  charCount: z
    .number()
    .int("文字数は整数である必要があります")
    .nonnegative("文字数は0以上である必要があります")
    .describe("文字数"),

  /** 見出し一覧 */
  headers: z
    .array(z.string().max(500, "見出しは500文字以下である必要があります"))
    .describe("見出し一覧（階層構造のフラット化）"),

  /** コードブロック数 */
  codeBlocks: z
    .number()
    .int("コードブロック数は整数である必要があります")
    .nonnegative("コードブロック数は0以上である必要があります")
    .describe("コードブロック数（Markdownの```等）"),

  /** リンク一覧 */
  links: z
    .array(z.string().url("有効なURL形式である必要があります"))
    .describe("抽出されたリンクURL一覧"),

  /** カスタムメタデータ */
  custom: z
    .record(z.string(), z.unknown())
    .describe("コンバーター固有の追加メタデータ"),
});

/** 型推論用エクスポート */
export type ExtractedMetadataSchema = z.infer<typeof extractedMetadataSchema>;

/**
 * 変換結果スキーマ
 *
 * @description ファイル変換処理の出力のバリデーション
 */
export const conversionResultSchema = z.object({
  /** 変換ID参照 */
  conversionId: uuidSchema.describe("変換処理のID参照"),

  /** ファイルID参照 */
  fileId: uuidSchema.describe("変換対象ファイルのID参照"),

  /** 元コンテンツ */
  originalContent: z.string().describe("変換前の元コンテンツ"),

  /** 変換後コンテンツ */
  convertedContent: z
    .string()
    .describe("変換後のコンテンツ（プレーンテキストまたはMarkdown）"),

  /** 抽出メタデータ */
  extractedMetadata: extractedMetadataSchema.describe("抽出されたメタデータ"),
});

/** 型推論用エクスポート */
export type ConversionResultSchema = z.infer<typeof conversionResultSchema>;

// ========================================
// 入出力スキーマ
// ========================================

/**
 * スキップファイルスキーマ
 *
 * @description スキップされたファイル情報のバリデーション
 */
export const skippedFileSchema = z.object({
  /** ファイルパス */
  path: z.string().min(1, "パスは必須です").describe("ファイルパス"),

  /** スキップ理由 */
  reason: z.string().min(1, "スキップ理由は必須です").describe("スキップ理由"),
});

/** 型推論用エクスポート */
export type SkippedFileSchema = z.infer<typeof skippedFileSchema>;

/**
 * ファイル選択入力スキーマ
 *
 * @description ファイル選択処理のパラメータバリデーション
 */
export const fileSelectionInputSchema = z.object({
  /** 選択対象パス */
  paths: z
    .array(z.string().min(1, "パスは空文字列にできません"))
    .min(1, "少なくとも1つのパスを指定してください")
    .describe("選択対象のパス（ファイルまたはディレクトリ）"),

  /** 再帰検索フラグ */
  recursive: z
    .boolean()
    .default(false)
    .describe("サブディレクトリを再帰的に検索するか"),

  /** 隠しファイル含有フラグ */
  includeHidden: z
    .boolean()
    .default(false)
    .describe("隠しファイル（.で始まる）を含めるか"),

  /** 最大ファイルサイズ */
  maxFileSize: z
    .number()
    .int("最大ファイルサイズは整数である必要があります")
    .positive("最大ファイルサイズは正の整数である必要があります")
    .default(DEFAULT_MAX_FILE_SIZE)
    .describe("最大ファイルサイズ（バイト）"),

  /** 許可ファイルタイプ */
  allowedTypes: z
    .array(fileTypeSchema)
    .optional()
    .describe("許可するファイルタイプ（指定なしは全許可）"),

  /** 除外パターン */
  excludePatterns: z
    .array(z.string())
    .default([])
    .describe("除外パターン（glob形式）"),
});

/** 型推論用エクスポート */
export type FileSelectionInputSchema = z.infer<typeof fileSelectionInputSchema>;

/**
 * ファイル選択結果スキーマ
 *
 * @description ファイル選択処理の結果バリデーション
 */
export const fileSelectionResultSchema = z.object({
  /** 選択されたファイル一覧 */
  selectedFiles: z.array(fileEntitySchema).describe("選択されたファイル一覧"),

  /** スキップされたファイル一覧 */
  skippedFiles: z
    .array(skippedFileSchema)
    .describe("スキップされたファイル一覧（理由付き）"),

  /** 合計サイズ */
  totalSize: z
    .number()
    .int("合計サイズは整数である必要があります")
    .nonnegative("合計サイズは0以上である必要があります")
    .describe("選択されたファイルの合計サイズ"),
});

/** 型推論用エクスポート */
export type FileSelectionResultSchema = z.infer<
  typeof fileSelectionResultSchema
>;

// ========================================
// パーシャルスキーマ（更新用）
// ========================================

/**
 * ファイルエンティティ部分更新スキーマ
 *
 * @description ファイルエンティティの部分更新用バリデーション
 */
export const partialFileEntitySchema = fileEntitySchema.partial().omit({
  id: true,
  createdAt: true,
});

/** 型推論用エクスポート */
export type PartialFileEntitySchema = z.infer<typeof partialFileEntitySchema>;

/**
 * 変換エンティティ部分更新スキーマ
 *
 * @description 変換エンティティの部分更新用バリデーション
 */
export const partialConversionEntitySchema = conversionEntitySchema
  .partial()
  .omit({
    id: true,
    fileId: true,
    createdAt: true,
  });

/** 型推論用エクスポート */
export type PartialConversionEntitySchema = z.infer<
  typeof partialConversionEntitySchema
>;

// ========================================
// 作成用スキーマ（ID自動生成）
// ========================================

/**
 * ファイルエンティティ作成スキーマ
 *
 * @description 新規ファイル作成時のバリデーション（ID, timestamp自動生成）
 */
export const createFileEntitySchema = fileEntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/** 型推論用エクスポート */
export type CreateFileEntitySchema = z.infer<typeof createFileEntitySchema>;

/**
 * 変換エンティティ作成スキーマ
 *
 * @description 新規変換処理作成時のバリデーション
 */
export const createConversionEntitySchema = conversionEntitySchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    status: true,
    outputHash: true,
    duration: true,
    error: true,
  })
  .extend({
    status: z.literal("pending").default("pending"),
  });

/** 型推論用エクスポート */
export type CreateConversionEntitySchema = z.infer<
  typeof createConversionEntitySchema
>;
