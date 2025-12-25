/**
 * @file CSVコンバーター
 * @module @repo/shared/services/conversion/converters/csv-converter
 * @description CSV/TSVファイルをMarkdownテーブル形式に変換するコンバーター
 */

// =============================================================================
// インポート
// =============================================================================

import Papa from "papaparse";
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
// 型定義
// =============================================================================

/**
 * CSV固有のメタデータ
 */
interface CSVMetadata {
  /** 行数（ヘッダー除く） */
  rowCount: number;
  /** カラム数 */
  columnCount: number;
  /** カラム名一覧 */
  columns: string[];
  /** デリミタ */
  delimiter: string;
  /** ヘッダー行の有無 */
  hasHeader: boolean;
}

// =============================================================================
// CSVConverterクラス
// =============================================================================

/**
 * CSVコンバーター
 *
 * CSV/TSVファイルをMarkdownテーブル形式に変換する。
 * papeparseライブラリを使用してCSV解析を行う。
 *
 * @example
 * ```typescript
 * const converter = new CSVConverter();
 * const result = await converter.convert({
 *   fileId: createFileId("file-1"),
 *   filePath: "/path/to/file.csv",
 *   mimeType: "text/csv",
 *   content: "name,age\nAlice,30\nBob,25",
 *   encoding: "utf-8"
 * });
 * ```
 */
export class CSVConverter extends BaseConverter {
  // ========================================
  // プロパティ
  // ========================================

  readonly id = "csv-converter";
  readonly name = "CSV Converter";
  readonly supportedMimeTypes = [
    "text/csv",
    "text/tab-separated-values",
  ] as const;
  readonly priority = 5;

  // ========================================
  // 抽象メソッドの実装
  // ========================================

  /**
   * CSV→Markdownテーブル変換を実行
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
      const { mimeType } = input;

      // テキストコンテンツを取得
      const textContent = this.getTextContent(input);

      // 空のコンテンツ処理
      if (!textContent || textContent.trim() === "") {
        return ok({
          convertedContent: "",
          extractedMetadata: this.createEmptyMetadata(),
          processingTime: 0,
        });
      }

      // デリミタを決定
      const delimiter = this.determineDelimiter(mimeType);

      // CSVをパース
      const parseResult = this.parseCSV(textContent, delimiter);

      if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
        return err(
          createRAGError(
            ErrorCodes.CONVERSION_FAILED,
            `Failed to parse CSV: ${parseResult.errors[0]?.message || "Unknown error"}`,
            {
              converterId: this.id,
              fileId: input.fileId,
              mimeType: input.mimeType,
            },
          ),
        );
      }

      // CSVメタデータを抽出
      const csvMetadata = this.extractCSVMetadata(
        parseResult.data,
        delimiter,
        parseResult.meta.fields,
      );

      // Markdownテーブルに変換
      const markdownTable = this.csvToMarkdownTable(
        parseResult.data,
        parseResult.meta.fields || [],
      );

      // 最大長でトリミング
      const trimmedContent = this.trimContent(
        markdownTable,
        options.maxContentLength,
      );

      // 変換後のMarkdownからメタデータを抽出
      const baseMetadata = MetadataExtractor.extractFromText(
        trimmedContent,
        options,
      );

      // メタデータをマージ
      const extractedMetadata = this.mergeMetadata(baseMetadata, csvMetadata);

      return ok({
        convertedContent: trimmedContent,
        extractedMetadata,
        processingTime: 0, // BaseConverterが自動設定
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          `Failed to convert CSV: ${error instanceof Error ? error.message : String(error)}`,
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
  // 説明オーバーライド
  // ========================================

  protected getDescription(): string {
    return "Converts CSV/TSV files to Markdown table format for RAG processing";
  }

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * MIMEタイプからデリミタを決定
   *
   * @param mimeType - MIMEタイプ
   * @returns デリミタ文字
   */
  private determineDelimiter(mimeType: string): string {
    if (mimeType === "text/tab-separated-values") {
      return "\t";
    }
    return ",";
  }

  /**
   * CSVをパース
   *
   * @param content - CSVコンテンツ
   * @param delimiter - デリミタ
   * @returns パース結果
   */
  private parseCSV(
    content: string,
    delimiter: string,
  ): Papa.ParseResult<Record<string, string>> {
    return Papa.parse<Record<string, string>>(content, {
      delimiter,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
    });
  }

  /**
   * CSVデータからMarkdownテーブルを生成
   *
   * @param data - パースされたCSVデータ
   * @param fields - カラム名配列
   * @returns Markdownテーブル文字列
   */
  private csvToMarkdownTable(
    data: Record<string, string>[],
    fields: string[],
  ): string {
    if (fields.length === 0) {
      return "";
    }

    const lines: string[] = [];

    // ヘッダー行
    const headerRow = this.createTableRow(fields);
    lines.push(headerRow);

    // セパレーター行
    const separatorRow = this.createSeparatorRow(fields.length);
    lines.push(separatorRow);

    // データ行
    for (const row of data) {
      const values = fields.map((field) => row[field] ?? "");
      const dataRow = this.createTableRow(values);
      lines.push(dataRow);
    }

    return lines.join("\n");
  }

  /**
   * Markdownテーブル行を作成
   *
   * @param cells - セルの値配列
   * @returns Markdownテーブル行
   */
  private createTableRow(cells: string[]): string {
    const escapedCells = cells.map((cell) =>
      this.escapeMarkdownTableCell(cell),
    );
    return `| ${escapedCells.join(" | ")} |`;
  }

  /**
   * Markdownテーブルのセパレーター行を作成
   *
   * @param columnCount - カラム数
   * @returns セパレーター行
   */
  private createSeparatorRow(columnCount: number): string {
    const separators = Array(columnCount).fill("---");
    return `| ${separators.join(" | ")} |`;
  }

  /**
   * Markdownテーブルセル内の特殊文字をエスケープ
   *
   * @param cell - セルの値
   * @returns エスケープされた値
   */
  private escapeMarkdownTableCell(cell: string): string {
    // パイプ文字をエスケープ
    return cell.replace(/\|/g, "\\|");
  }

  /**
   * CSVメタデータを抽出
   *
   * @param data - パースされたCSVデータ
   * @param delimiter - 使用されたデリミタ
   * @param fields - カラム名配列
   * @returns CSVメタデータ
   */
  private extractCSVMetadata(
    data: Record<string, string>[],
    delimiter: string,
    fields: string[] | undefined,
  ): CSVMetadata {
    const columns = fields || [];
    return {
      rowCount: data.length,
      columnCount: columns.length,
      columns,
      delimiter,
      hasHeader: true, // パース時にheader: trueを使用しているため常にtrue
    };
  }

  /**
   * 空のメタデータを作成
   *
   * @returns 空のExtractedMetadata
   */
  private createEmptyMetadata(): ExtractedMetadata {
    return {
      title: null,
      author: null,
      language: "en",
      wordCount: 0,
      lineCount: 0,
      charCount: 0,
      headers: [],
      codeBlocks: 0,
      links: [],
      custom: {
        csvRowCount: 0,
        csvColumnCount: 0,
        csvColumns: [],
        csvDelimiter: ",",
        csvHasHeader: true,
      },
    };
  }

  /**
   * 基本メタデータとCSVメタデータをマージ
   *
   * @param base - 基本メタデータ
   * @param csv - CSVメタデータ
   * @returns マージされたメタデータ
   */
  private mergeMetadata(
    base: ExtractedMetadata,
    csv: CSVMetadata,
  ): ExtractedMetadata {
    return {
      ...base,
      custom: {
        ...base.custom,
        csvRowCount: csv.rowCount,
        csvColumnCount: csv.columnCount,
        csvColumns: csv.columns,
        csvDelimiter: csv.delimiter,
        csvHasHeader: csv.hasHeader,
      },
    };
  }
}
