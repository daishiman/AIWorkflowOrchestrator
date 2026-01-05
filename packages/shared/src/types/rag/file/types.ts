/**
 * ファイル・変換ドメイン型定義
 *
 * @description RAGパイプラインにおけるファイル選択・変換処理の型定義
 * @module @repo/shared/types/rag/file
 * @see docs/30-workflows/file-conversion-schemas/task-step01-type-design.md
 */

// ========================================
// Branded Types（型安全なID）
// ========================================

/**
 * ファイルID用ブランド型
 * @description 文字列をFileIdとして型安全に扱うためのブランド型
 */
declare const FileIdBrand: unique symbol;

/**
 * ファイルの一意識別子
 * @description UUID形式の文字列にブランドを付与した型
 */
export type FileId = string & { readonly [FileIdBrand]: typeof FileIdBrand };

/**
 * 変換ID用ブランド型
 * @description 文字列をConversionIdとして型安全に扱うためのブランド型
 */
declare const ConversionIdBrand: unique symbol;

/**
 * 変換処理の一意識別子
 * @description UUID形式の文字列にブランドを付与した型
 */
export type ConversionId = string & {
  readonly [ConversionIdBrand]: typeof ConversionIdBrand;
};

// ========================================
// ファイルタイプ定数・型
// ========================================

/**
 * サポートされるファイルタイプ（MIMEタイプ）定数
 *
 * @description
 * RAGパイプラインで処理可能なファイル形式をMIMEタイプで定義。
 * `as const` により各値がリテラル型として推論される。
 *
 * @example
 * ```typescript
 * const mimeType = FileTypes.MARKDOWN; // "text/markdown"
 * ```
 */
export const FileTypes = {
  // テキスト系
  TEXT: "text/plain",
  MARKDOWN: "text/markdown",
  HTML: "text/html",
  CSV: "text/csv",
  TSV: "text/tab-separated-values",
  // コード系
  JAVASCRIPT: "text/javascript",
  TYPESCRIPT: "text/typescript",
  PYTHON: "application/x-python",
  JSON: "application/json",
  YAML: "application/x-yaml",
  XML: "application/xml",
  // ドキュメント系
  PDF: "application/pdf",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  PPTX: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // その他
  UNKNOWN: "application/octet-stream",
} as const;

/**
 * ファイルタイプ（MIMEタイプ）のユニオン型
 * @description FileTypes定数の値から導出されるリテラルユニオン型
 */
export type FileType = (typeof FileTypes)[keyof typeof FileTypes];

// ========================================
// ファイルカテゴリ定数・型
// ========================================

/**
 * ファイルカテゴリ定数
 *
 * @description
 * ファイルの用途に基づく分類カテゴリを定義。
 * MIMEタイプより粗い粒度での分類に使用。
 *
 * @example
 * ```typescript
 * const category = FileCategories.CODE; // "code"
 * ```
 */
export const FileCategories = {
  TEXT: "text",
  CODE: "code",
  DOCUMENT: "document",
  SPREADSHEET: "spreadsheet",
  PRESENTATION: "presentation",
  OTHER: "other",
} as const;

/**
 * ファイルカテゴリのユニオン型
 * @description FileCategories定数の値から導出されるリテラルユニオン型
 */
export type FileCategory = (typeof FileCategories)[keyof typeof FileCategories];

// ========================================
// 非同期処理状態型
// ========================================

/**
 * 非同期処理の状態型
 * @description 変換処理などの非同期操作の進行状態を表す
 */
export type AsyncStatus = "pending" | "processing" | "completed" | "failed";

// ========================================
// 共有定数
// ========================================

/**
 * デフォルトの最大ファイルサイズ（10MB）
 * @description ファイル選択・バリデーションで使用される共通の上限値
 */
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * SHA-256ハッシュの正規表現パターン
 * @description 64文字の小文字16進数文字列を検証
 */
export const SHA256_HASH_PATTERN = /^[0-9a-f]{64}$/;

// ========================================
// エンティティ型
// ========================================

/**
 * ファイルエンティティ
 *
 * @description
 * RAGパイプラインで処理対象となるファイルのドメインモデル。
 * 識別子(id)によって一意に識別され、ライフサイクル全体を通じて追跡される。
 *
 * @example
 * ```typescript
 * const file: FileEntity = {
 *   id: "550e8400-e29b-41d4-a716-446655440000" as FileId,
 *   name: "document.md",
 *   path: "/docs/document.md",
 *   mimeType: FileTypes.MARKDOWN,
 *   category: FileCategories.TEXT,
 *   size: 2048,
 *   hash: "a".repeat(64),
 *   encoding: "utf-8",
 *   lastModified: new Date(),
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 *   metadata: {}
 * };
 * ```
 */
export interface FileEntity {
  /** ファイルの一意識別子（UUID形式） */
  readonly id: FileId;
  /** ファイル名（拡張子を含む、1-255文字） */
  readonly name: string;
  /** ファイルの絶対パスまたは相対パス */
  readonly path: string;
  /** MIMEタイプに基づくファイル種別 */
  readonly mimeType: FileType;
  /** ファイルの用途に基づくカテゴリ */
  readonly category: FileCategory;
  /** ファイルサイズ（バイト単位、0以上） */
  readonly size: number;
  /** 重複検出用SHA-256ハッシュ（64文字の16進数文字列） */
  readonly hash: string;
  /** 文字エンコーディング（デフォルト: utf-8） */
  readonly encoding: string;
  /** ファイルの最終更新日時 */
  readonly lastModified: Date;
  /** レコード作成日時 */
  readonly createdAt: Date;
  /** レコード更新日時 */
  readonly updatedAt: Date;
  /** 拡張可能なメタデータ */
  readonly metadata: Record<string, unknown>;
}

/**
 * 変換エンティティ
 *
 * @description
 * ファイル変換処理の状態と結果を管理するエンティティ。
 * 変換処理のライフサイクル（pending → processing → completed/failed）を追跡。
 *
 * @example
 * ```typescript
 * const conversion: ConversionEntity = {
 *   id: "conv-id" as ConversionId,
 *   fileId: "file-id" as FileId,
 *   status: "pending",
 *   converterId: "markdown-converter",
 *   inputHash: "b".repeat(64),
 *   outputHash: null,
 *   duration: null,
 *   error: null,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 */
export interface ConversionEntity {
  /** 変換処理の一意識別子（UUID形式） */
  readonly id: ConversionId;
  /** 変換対象ファイルへの参照（外部キー） */
  readonly fileId: FileId;
  /** 変換処理の状態 */
  readonly status: AsyncStatus;
  /** 使用されたコンバーターの識別子 */
  readonly converterId: string;
  /** 入力ファイルのハッシュ（キャッシュキー用、64文字） */
  readonly inputHash: string;
  /** 出力コンテンツのハッシュ（変換成功時のみ、64文字） */
  readonly outputHash: string | null;
  /** 処理時間（ミリ秒、変換完了時のみ） */
  readonly duration: number | null;
  /** エラーメッセージ（変換失敗時のみ） */
  readonly error: string | null;
  /** レコード作成日時 */
  readonly createdAt: Date;
  /** レコード更新日時 */
  readonly updatedAt: Date;
}

// ========================================
// 値オブジェクト型
// ========================================

/**
 * 抽出メタデータ
 *
 * @description
 * ファイル変換時にコンテンツから抽出される付随情報。
 * 不変（イミュータブル）な値オブジェクトとして設計。
 *
 * @example
 * ```typescript
 * const metadata: ExtractedMetadata = {
 *   title: "ドキュメントタイトル",
 *   author: "著者名",
 *   language: "ja",
 *   wordCount: 500,
 *   lineCount: 100,
 *   charCount: 2000,
 *   headers: ["概要", "本文", "まとめ"],
 *   codeBlocks: 3,
 *   links: ["https://example.com"],
 *   custom: { customField: "value" }
 * };
 * ```
 */
export interface ExtractedMetadata {
  /** ドキュメントタイトル（Markdownの#等から抽出） */
  readonly title: string | null;
  /** 作成者（PDFメタデータ等から抽出） */
  readonly author: string | null;
  /** 言語コード（ISO 639-1形式、例: ja, en） */
  readonly language: string | null;
  /** 単語数（0以上の整数） */
  readonly wordCount: number;
  /** 行数（0以上の整数） */
  readonly lineCount: number;
  /** 文字数（0以上の整数） */
  readonly charCount: number;
  /** 見出し一覧（階層構造のフラット化） */
  readonly headers: readonly string[];
  /** コードブロック数（Markdownの```等、0以上の整数） */
  readonly codeBlocks: number;
  /** 抽出されたリンクURL一覧 */
  readonly links: readonly string[];
  /** コンバーター固有の追加メタデータ */
  readonly custom: Record<string, unknown>;
}

/**
 * 変換結果
 *
 * @description
 * ファイル変換処理の出力を表す値オブジェクト。
 * 変換前後のコンテンツと抽出されたメタデータを含む。
 */
export interface ConversionResult {
  /** 変換処理のID参照 */
  readonly conversionId: ConversionId;
  /** 変換対象ファイルのID参照 */
  readonly fileId: FileId;
  /** 変換前の元コンテンツ */
  readonly originalContent: string;
  /** 変換後のコンテンツ（プレーンテキストまたはMarkdown） */
  readonly convertedContent: string;
  /** 抽出されたメタデータ */
  readonly extractedMetadata: ExtractedMetadata;
}

// ========================================
// 入出力型
// ========================================

/**
 * ファイル選択入力
 *
 * @description
 * ファイル選択処理のパラメータを定義。
 * ディレクトリやファイルの選択条件を指定する。
 */
export interface FileSelectionInput {
  /** 選択対象のパス（ファイルまたはディレクトリ） */
  readonly paths: readonly string[];
  /** サブディレクトリを再帰的に検索するか */
  readonly recursive: boolean;
  /** 隠しファイル（.で始まる）を含めるか */
  readonly includeHidden: boolean;
  /** 最大ファイルサイズ（バイト） */
  readonly maxFileSize: number;
  /** 許可するファイルタイプ（指定なしは全許可） */
  readonly allowedTypes?: readonly FileType[];
  /** 除外パターン（glob形式） */
  readonly excludePatterns: readonly string[];
}

/**
 * スキップされたファイル情報
 *
 * @description
 * 選択処理でスキップされたファイルとその理由を記録。
 */
export interface SkippedFile {
  /** ファイルパス */
  readonly path: string;
  /** スキップ理由 */
  readonly reason: string;
}

/**
 * ファイル選択結果
 *
 * @description
 * ファイル選択処理の結果を表す。
 * 選択されたファイル、スキップされたファイル、合計サイズを含む。
 */
export interface FileSelectionResult {
  /** 選択されたファイル一覧 */
  readonly selectedFiles: readonly FileEntity[];
  /** スキップされたファイル一覧（理由付き） */
  readonly skippedFiles: readonly SkippedFile[];
  /** 選択されたファイルの合計サイズ（バイト） */
  readonly totalSize: number;
}
