/**
 * @file プレーンテキストコンバーター
 * @module @repo/shared/services/conversion/converters/plain-text-converter
 * @description プレーンテキストファイル（text/plain）を変換するコンバーター
 *
 * 主な機能:
 * - BOM（Byte Order Mark）の除去
 * - 改行コードの正規化（CRLF/CR → LF）
 * - メタデータ抽出（行数、単語数、文字数）
 */

// =============================================================================
// インポート
// =============================================================================

import { BaseConverter } from "../base-converter";
import { MetadataExtractor } from "../metadata-extractor";
import type {
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
  ExtractedMetadata,
} from "../types";
import type { Result, RAGError } from "../../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../../types/rag";

// =============================================================================
// 定数
// =============================================================================

/**
 * UTF-8 BOMの文字コード（U+FEFF）
 */
const UTF8_BOM = 0xfeff;

// =============================================================================
// PlainTextConverterクラス
// =============================================================================

/**
 * プレーンテキストコンバーター
 *
 * テキストファイルを変換し、以下の処理を行う:
 * 1. BOM（Byte Order Mark）の除去
 * 2. 改行コードの正規化（CRLF/CR → LF）
 * 3. メタデータ抽出（行数、単語数、文字数）
 *
 * @example
 * ```typescript
 * const converter = new PlainTextConverter();
 * const input = {
 *   fileId: createFileId("test"),
 *   filePath: "/path/to/file.txt",
 *   mimeType: "text/plain",
 *   content: "\uFEFFHello\r\nWorld",
 *   encoding: "utf-8"
 * };
 * const result = await converter.convert(input);
 * // result.data.convertedContent === "Hello\nWorld"
 * ```
 */
export class PlainTextConverter extends BaseConverter {
  // ========================================
  // プロパティ（BaseConverter抽象プロパティの実装）
  // ========================================

  /**
   * コンバーターID
   */
  readonly id = "plain-text-converter";

  /**
   * コンバーター名（表示用）
   */
  readonly name = "Plain Text Converter";

  /**
   * サポートするMIMEタイプ
   */
  readonly supportedMimeTypes = ["text/plain"] as const;

  /**
   * 優先度（フォールバック用のため最低）
   */
  readonly priority = 0;

  // ========================================
  // 抽象メソッドの実装
  // ========================================

  /**
   * 実変換処理
   *
   * 処理フロー:
   * 1. テキストコンテンツを取得
   * 2. BOM除去
   * 3. 改行正規化
   * 4. メタデータ抽出
   * 5. 結果を返す
   *
   * @param input - 前処理済みの入力データ
   * @param options - 変換オプション
   * @returns 変換結果またはエラー
   */
  protected async doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    try {
      // 1. テキストコンテンツを取得
      let text = this.getTextContent(input);

      // 2. BOM除去
      text = this.removeBOM(text);

      // 3. 改行正規化
      text = this.normalizeLineEndings(text);

      // 4. メタデータ抽出
      const extractedMetadata = this.extractPlainTextMetadata(text, options);

      // 5. 結果を返す
      return ok({
        convertedContent: text,
        extractedMetadata,
        processingTime: 0, // BaseConverterで上書きされる
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          `Failed to convert plain text: ${error instanceof Error ? error.message : String(error)}`,
          {
            converterId: this.id,
            fileId: input.fileId,
            mimeType: input.mimeType,
          },
          error as Error,
        ),
      );
    }
  }

  // ========================================
  // フックメソッドのオーバーライド
  // ========================================

  /**
   * コンバーターの説明を取得
   *
   * @returns 説明文
   */
  protected getDescription(): string {
    return "Converts plain text files with BOM removal and line ending normalization";
  }

  // ========================================
  // プライベートヘルパーメソッド
  // ========================================

  /**
   * BOM（Byte Order Mark）を除去
   *
   * サポートするBOM:
   * - UTF-8 BOM: U+FEFF
   * - UTF-16 BE/LE BOM: U+FEFF
   *
   * @param text - 処理対象のテキスト
   * @returns BOM除去後のテキスト
   */
  private removeBOM(text: string): string {
    // 文字列の最初の文字がBOMかチェック
    if (text.length > 0 && text.charCodeAt(0) === UTF8_BOM) {
      return text.substring(1);
    }
    return text;
  }

  /**
   * 改行コードを正規化
   *
   * 変換:
   * - CRLF（\r\n）→ LF（\n）
   * - CR（\r）→ LF（\n）
   *
   * 処理順序が重要:
   * 1. CRLFを先に変換（そうしないとCRとLFが別々に処理される）
   * 2. 残りのCRを変換
   *
   * @param text - 処理対象のテキスト
   * @returns 改行正規化後のテキスト
   */
  private normalizeLineEndings(text: string): string {
    return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  /**
   * プレーンテキスト固有のメタデータを抽出
   *
   * 抽出項目:
   * - 行数
   * - 単語数
   * - 文字数
   * - 言語検出
   *
   * @param text - 処理対象のテキスト
   * @param options - 変換オプション
   * @returns 抽出されたメタデータ
   */
  private extractPlainTextMetadata(
    text: string,
    options: ConverterOptions,
  ): ExtractedMetadata {
    // MetadataExtractorを使用して基本メタデータを抽出
    const baseMetadata = MetadataExtractor.extractFromText(text, options);

    // プレーンテキスト固有のカスタムメタデータを追加
    return {
      ...baseMetadata,
      custom: {
        ...baseMetadata.custom,
        encoding: "UTF-8", // 出力は常にUTF-8
      },
    };
  }
}
