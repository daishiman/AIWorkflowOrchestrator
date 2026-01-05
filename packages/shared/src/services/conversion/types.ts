/**
 * @file ファイル変換基盤 - 型定義
 * @module @repo/shared/services/conversion/types
 * @description コンバーターインターフェース、入出力型、メタデータ型の定義
 */

// =============================================================================
// 外部依存のインポート
// =============================================================================

import type { FileId } from "../../types/rag/branded";
import type { Result } from "../../types/rag/result";
import type { RAGError } from "../../types/rag/errors";
import { ok } from "../../types/rag/result";

// =============================================================================
// 型定義
// =============================================================================

/**
 * 抽出されたメタデータ
 *
 * テキストから自動抽出される構造化情報。
 * MetadataExtractorが生成する。
 */
export interface ExtractedMetadata {
  /**
   * タイトル
   *
   * 最初の見出しから抽出。見出しがない場合はnull。
   */
  readonly title: string | null;

  /**
   * 著者
   *
   * テキストからの自動抽出は困難なため、通常null。
   * ファイルメタデータから設定される場合あり。
   */
  readonly author: string | null;

  /**
   * 言語コード（ISO 639-1形式）
   *
   * 簡易的な判定（日本語/英語）。
   * 値: "ja" | "en"
   */
  readonly language: "ja" | "en";

  /**
   * 単語数
   *
   * - 日本語: 文字数（形態素解析なし）
   * - 英語: 空白区切りの単語数
   */
  readonly wordCount: number;

  /**
   * 行数
   */
  readonly lineCount: number;

  /**
   * 文字数
   */
  readonly charCount: number;

  /**
   * 見出しの配列
   *
   * Markdown形式の見出し（h1～h6）。
   * extractHeaders オプションがfalseの場合は空配列。
   */
  readonly headers: Array<{ level: number; text: string }>;

  /**
   * コードブロック数
   *
   * Markdown形式のコードブロック（```...```）の数。
   */
  readonly codeBlocks: number;

  /**
   * リンクの配列
   *
   * URLまたは相対パス。重複なし、ソート済み。
   * extractLinks オプションがfalseの場合は空配列。
   */
  readonly links: string[];

  /**
   * カスタムメタデータ
   *
   * コンバーター固有の追加メタデータを格納。
   */
  readonly custom: Record<string, unknown>;
}

/**
 * コンバーターへの入力データ
 *
 * ファイル変換に必要なすべての情報を含むイミュータブルなオブジェクト。
 * すべてのプロパティはreadonlyで、変更不可。
 */
export interface ConverterInput {
  /**
   * ファイルの一意識別子
   *
   * Branded Typeとして定義され、通常の文字列と区別される。
   * RAGシステム全体で一意性が保証される。
   */
  readonly fileId: FileId;

  /**
   * ファイルの絶対パス
   *
   * 制約:
   * - 空文字列不可
   * - 有効なファイルパス形式
   *
   * 例: "/Users/user/documents/file.md"
   */
  readonly filePath: string;

  /**
   * MIMEタイプ
   *
   * 制約:
   * - RFC 6838形式: "type/subtype"
   * - 空文字列不可
   *
   * 例: "text/plain", "text/markdown", "application/pdf"
   */
  readonly mimeType: string;

  /**
   * ファイルの内容
   *
   * - テキストファイル: string型
   * - バイナリファイル: ArrayBuffer型
   *
   * 変換処理で適切に型判定して処理する必要がある。
   */
  readonly content: ArrayBuffer | string;

  /**
   * 文字エンコーディング
   *
   * 制約:
   * - WHATWG Encoding Standard準拠
   * - 空文字列不可
   *
   * 例: "utf-8", "shift-jis", "iso-8859-1"
   * デフォルト: "utf-8"
   */
  readonly encoding: string;

  /**
   * 追加メタデータ（オプション）
   *
   * ファイルシステムから取得したメタデータや、
   * ユーザー定義のカスタム情報を格納。
   *
   * 例:
   * {
   *   author: "John Doe",
   *   createdAt: "2025-12-20T00:00:00Z",
   *   tags: ["important", "draft"]
   * }
   */
  readonly metadata?: Record<string, unknown>;
}

/**
 * コンバーターからの出力データ
 *
 * 変換後のテキストコンテンツと抽出されたメタデータ、
 * 処理時間を含むイミュータブルなオブジェクト。
 */
export interface ConverterOutput {
  /**
   * 変換後のテキストコンテンツ
   *
   * すべてのコンバーターは最終的にプレーンテキストを出力する。
   * 空文字列可（空ファイルの場合）。
   *
   * 制約:
   * - 必ずstring型
   * - 改行・空白文字を保持
   */
  readonly convertedContent: string;

  /**
   * 抽出されたメタデータ
   *
   * タイトル、見出し、リンク等、RAG検索に必要な構造化情報。
   * ExtractedMetadata型に準拠。
   */
  readonly extractedMetadata: ExtractedMetadata;

  /**
   * 処理時間（ミリ秒）
   *
   * 実際の変換処理にかかった時間。
   * BaseConverterが自動計測する。
   *
   * 制約:
   * - 0以上の数値
   * - 小数点含む（高精度計測）
   */
  readonly processingTime: number;
}

/**
 * コンバーターの動作をカスタマイズするオプション
 *
 * すべてのフィールドはオプショナルで、デフォルト値が定義される。
 * コンバーター実装は必要なオプションのみを参照する。
 */
export interface ConverterOptions {
  /**
   * フォーマットを保持するか
   *
   * true: 空白・改行・インデントを可能な限り保持
   * false: 余分な空白を削除し、正規化
   *
   * デフォルト: false
   */
  readonly preserveFormatting?: boolean;

  /**
   * リンクを抽出するか
   *
   * true: URL、相対パスを抽出してメタデータに含める
   * false: リンク抽出をスキップ
   *
   * デフォルト: true
   */
  readonly extractLinks?: boolean;

  /**
   * 見出しを抽出するか
   *
   * true: Markdown見出し、HTML h1-h6等を抽出
   * false: 見出し抽出をスキップ
   *
   * デフォルト: true
   */
  readonly extractHeaders?: boolean;

  /**
   * コンテンツの最大長（文字数）
   *
   * 指定された文字数を超える場合、切り詰める。
   * undefinedの場合、制限なし。
   *
   * 制約: 1以上の整数
   */
  readonly maxContentLength?: number;

  /**
   * 言語ヒント（ISO 639-1形式）
   *
   * メタデータ抽出や言語検出の精度向上に使用。
   *
   * 例: "ja", "en", "fr"
   * デフォルト: undefined（自動検出）
   */
  readonly language?: string;

  /**
   * タイムアウト時間（ミリ秒）
   *
   * 指定された時間内に変換が完了しない場合、タイムアウトエラーを返す。
   * 未指定の場合、ConversionServiceのデフォルトタイムアウトを使用。
   *
   * 制約: 1000以上の整数（1秒以上）
   */
  readonly timeout?: number;

  /**
   * カスタムオプション
   *
   * コンバーター固有のオプションを格納。
   * 型安全性は失われるが、柔軟な拡張が可能。
   *
   * 例:
   * {
   *   // PDFコンバーター専用
   *   extractImages: true,
   *   ocrEnabled: false,
   *   // Markdownコンバーター専用
   *   gfmMode: true,
   *   mathSupport: true
   * }
   */
  readonly custom?: Record<string, unknown>;
}

/**
 * コンバーターの静的メタデータ
 *
 * コンバーターの識別情報と能力を表す。
 * 各コンバーター実装で定義され、実行時に変更されない。
 */
export interface ConverterMetadata {
  /**
   * コンバーターID（一意）
   *
   * 制約:
   * - 英数字、ハイフン、アンダースコアのみ
   * - 空文字列不可
   * - ケバブケース推奨
   *
   * 例: "plain-text-converter", "markdown-converter"
   */
  readonly id: string;

  /**
   * コンバーター名（表示用）
   *
   * UI等で表示される人間可読な名前。
   *
   * 例: "Plain Text Converter", "Markdown Converter"
   */
  readonly name: string;

  /**
   * コンバーターの説明
   *
   * 機能と用途を簡潔に説明。
   *
   * 例: "Converts plain text files to searchable format"
   */
  readonly description: string;

  /**
   * バージョン（SemVer形式）
   *
   * 制約:
   * - Semantic Versioning 2.0.0準拠
   * - 形式: "major.minor.patch"
   *
   * 例: "1.0.0", "2.1.3"
   */
  readonly version: string;

  /**
   * サポートするMIMEタイプのリスト
   *
   * 制約:
   * - 最低1つ以上のMIMEタイプを含む
   * - RFC 6838形式
   * - readonly配列（イミュータブル）
   *
   * 例: ["text/plain"], ["text/markdown", "text/x-markdown"]
   */
  readonly supportedMimeTypes: readonly string[];

  /**
   * 優先度（高いほど優先）
   *
   * 複数のコンバーターが同じMIMEタイプをサポートする場合、
   * 優先度が高いものが選択される。
   *
   * 制約:
   * - 整数
   * - 推奨範囲: 0～100
   *
   * 例:
   * - 0: 標準優先度
   * - 10: 高優先度
   * - -10: 低優先度（フォールバック用）
   */
  readonly priority: number;
}

/**
 * コンバーターインターフェース
 *
 * すべてのコンバーター実装が準拠すべき共通インターフェース。
 * BaseConverterが基本実装を提供し、サブクラスで拡張する。
 */
export interface IConverter {
  /**
   * コンバーターID
   *
   * ConverterMetadata.idと同じ値を返す。
   */
  readonly id: string;

  /**
   * コンバーター名
   *
   * ConverterMetadata.nameと同じ値を返す。
   */
  readonly name: string;

  /**
   * サポートするMIMEタイプ
   *
   * ConverterMetadata.supportedMimeTypesと同じ値を返す。
   */
  readonly supportedMimeTypes: readonly string[];

  /**
   * 優先度
   *
   * ConverterMetadata.priorityと同じ値を返す。
   */
  readonly priority: number;

  /**
   * このコンバーターで変換可能か判定
   *
   * 基本実装:
   * - supportedMimeTypesにinput.mimeTypeが含まれるかチェック
   *
   * カスタム実装:
   * - ファイルサイズ、エンコーディング等の追加条件チェック可能
   *
   * @param input - 変換対象の入力データ
   * @returns 変換可能な場合true、不可能な場合false
   */
  canConvert(input: ConverterInput): boolean;

  /**
   * ファイルを変換
   *
   * 実装ガイドライン:
   * 1. 入力バリデーション
   * 2. 前処理（preprocess）
   * 3. 実変換処理（doConvert）
   * 4. 後処理（postprocess）
   * 5. Result型でラップして返す
   *
   * エラーケース:
   * - CONVERSION_FAILED: 変換処理中のエラー
   * - VALIDATION_ERROR: 入力データが不正
   * - UNSUPPORTED_FILE_TYPE: サポートされていない形式
   *
   * @param input - 変換対象の入力データ
   * @param options - 変換オプション（省略可）
   * @returns 変換結果またはエラー
   */
  convert(
    input: ConverterInput,
    options?: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>>;

  /**
   * 推定処理時間を取得（ミリ秒）
   *
   * デフォルト実装:
   * - コンテンツサイズに基づく線形推定（1KB = 1ms）
   *
   * カスタム実装:
   * - ファイル形式の複雑さを考慮した推定
   *
   * @param input - 変換対象の入力データ
   * @returns 推定処理時間（ミリ秒）
   */
  estimateProcessingTime(input: ConverterInput): number;
}

/**
 * バッチ変換の個別結果
 */
export type BatchConversionResult =
  | {
      input: ConverterInput;
      status: "success";
      output: ConverterOutput;
    }
  | {
      input: ConverterInput;
      status: "error";
      error: RAGError;
    };

/**
 * バッチ変換の集計情報
 */
export interface BatchConversionSummary {
  readonly total: number;
  readonly success: number;
  readonly failed: number;
  readonly totalProcessingTime: number;
  readonly errors: Array<{ fileId: FileId; error: RAGError }>;
}

/**
 * ConversionServiceのコンストラクタオプション
 */
export interface ConversionServiceOptions {
  /**
   * デフォルトタイムアウト（ミリ秒）
   *
   * 個別の変換でタイムアウトが指定されない場合に使用。
   *
   * デフォルト: 60000（60秒）
   * 推奨範囲: 10000～300000（10秒～5分）
   */
  readonly defaultTimeout?: number;

  /**
   * 最大同時実行数
   *
   * 同時に実行できる変換処理の最大数。
   * これを超える変換要求はエラーを返す。
   *
   * デフォルト: 5
   * 推奨範囲: 1～10
   */
  readonly maxConcurrentConversions?: number;
}

/**
 * ConversionServiceの設定情報
 */
export interface ConversionServiceSettings {
  readonly defaultTimeout: number;
  readonly maxConcurrentConversions: number;
  readonly currentConversions: number;
}

// =============================================================================
// 定数
// =============================================================================

/**
 * ConverterOptionsのデフォルト値
 */
export const DEFAULT_CONVERTER_OPTIONS: Required<
  Omit<ConverterOptions, "maxContentLength" | "language" | "custom" | "timeout">
> &
  Pick<ConverterOptions, "custom"> = {
  preserveFormatting: false,
  extractLinks: true,
  extractHeaders: true,
  custom: {},
};

// =============================================================================
// 型ガード関数
// =============================================================================

/**
 * contentがstring型か判定
 *
 * @param input - 判定対象の入力データ
 * @returns contentがstring型の場合true
 */
export function isTextContent(
  input: ConverterInput,
): input is ConverterInput & { content: string } {
  return typeof input.content === "string";
}

/**
 * contentがArrayBuffer型か判定
 *
 * @param input - 判定対象の入力データ
 * @returns contentがArrayBuffer型の場合true
 */
export function isBinaryContent(
  input: ConverterInput,
): input is ConverterInput & { content: ArrayBuffer } {
  return input.content instanceof ArrayBuffer;
}

// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * オプションをデフォルト値とマージ
 *
 * @param options - カスタムオプション
 * @returns デフォルト値とマージされたオプション
 */
export function mergeConverterOptions(
  options?: ConverterOptions,
): ConverterOptions {
  if (!options) {
    return DEFAULT_CONVERTER_OPTIONS;
  }

  return {
    ...DEFAULT_CONVERTER_OPTIONS,
    ...options,
    custom: {
      ...DEFAULT_CONVERTER_OPTIONS.custom,
      ...options.custom,
    },
  };
}

// =============================================================================
// ファクトリ関数
// =============================================================================

/**
 * ConverterInputを生成するファクトリ関数
 *
 * バリデーションを行い、Result型で返す。
 *
 * @param params - 入力パラメータ
 * @returns ConverterInput または エラー
 */
export function createConverterInput(params: {
  fileId: FileId;
  filePath: string;
  mimeType: string;
  content: ArrayBuffer | string;
  encoding: string;
  metadata?: Record<string, unknown>;
}): Result<ConverterInput, RAGError> {
  // 現時点では簡易実装（バリデーションは将来追加）
  return ok(params);
}

/**
 * ConverterOutputを生成するファクトリ関数
 *
 * @param convertedContent - 変換後のコンテンツ
 * @param extractedMetadata - 抽出されたメタデータ
 * @param processingTime - 処理時間（ミリ秒）
 * @returns ConverterOutput
 */
export function createConverterOutput(
  convertedContent: string,
  extractedMetadata: ExtractedMetadata,
  processingTime: number,
): ConverterOutput {
  return {
    convertedContent,
    extractedMetadata,
    processingTime,
  };
}
