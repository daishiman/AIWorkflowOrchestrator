/**
 * @file JSONコンバーター
 * @module @repo/shared/services/conversion/converters/json-converter
 * @description JSONファイルを読みやすいテキスト形式に変換するコンバーター
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
// 型定義
// =============================================================================

/**
 * JSON固有のメタデータ
 */
interface JSONMetadata {
  /** トップレベルのキー一覧 */
  topLevelKeys: string[];
  /** ネストの最大深度 */
  nestingDepth: number;
  /** オブジェクト数 */
  objectCount: number;
  /** 配列数 */
  arrayCount: number;
  /** データサイズ（バイト） */
  dataSize: number;
}

/**
 * JSON値の型
 */
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

// =============================================================================
// JSONConverterクラス
// =============================================================================

/**
 * JSONコンバーター
 *
 * JSONファイルを読みやすいテキスト形式に変換する。
 * 標準のJSON.parseを使用してJSONを解析し、
 * 人間が読みやすい形式に整形する。
 *
 * @example
 * ```typescript
 * const converter = new JSONConverter();
 * const result = await converter.convert({
 *   fileId: createFileId("file-1"),
 *   filePath: "/path/to/file.json",
 *   mimeType: "application/json",
 *   content: '{"name": "Alice", "age": 30}',
 *   encoding: "utf-8"
 * });
 * ```
 */
export class JSONConverter extends BaseConverter {
  // ========================================
  // プロパティ
  // ========================================

  readonly id = "json-converter";
  readonly name = "JSON Converter";
  readonly supportedMimeTypes = ["application/json"] as const;
  readonly priority = 5;

  // ========================================
  // 抽象メソッドの実装
  // ========================================

  /**
   * JSON→読みやすいテキスト変換を実行
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

      // JSONをパース
      let parsed: JSONValue;
      try {
        parsed = JSON.parse(textContent.trim()) as JSONValue;
      } catch (parseError) {
        return err(
          createRAGError(
            ErrorCodes.CONVERSION_FAILED,
            `Failed to parse JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
            {
              converterId: this.id,
              fileId: input.fileId,
              mimeType: input.mimeType,
            },
          ),
        );
      }

      // JSONメタデータを抽出
      const jsonMetadata = this.extractJSONMetadata(parsed, textContent);

      // 読みやすいテキスト形式に変換
      const readableText = this.jsonToReadableText(parsed, 0);

      // 最大長でトリミング
      const trimmedContent = this.trimContent(
        readableText,
        options.maxContentLength,
      );

      // 変換後のテキストからメタデータを抽出
      const baseMetadata = MetadataExtractor.extractFromText(
        trimmedContent,
        options,
      );

      // メタデータをマージ
      const extractedMetadata = this.mergeMetadata(baseMetadata, jsonMetadata);

      return ok({
        convertedContent: trimmedContent,
        extractedMetadata,
        processingTime: 0, // BaseConverterが自動設定
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          `Failed to convert JSON: ${error instanceof Error ? error.message : String(error)}`,
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
    return "Converts JSON files to human-readable text format for RAG processing";
  }

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * JSONを読みやすいテキスト形式に変換
   *
   * @param value - JSON値
   * @param depth - 現在のネスト深度
   * @returns 読みやすいテキスト
   */
  private jsonToReadableText(value: JSONValue, depth: number): string {
    const _indent = "  ".repeat(depth);

    if (value === null) {
      return "null";
    }

    if (typeof value === "boolean" || typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      return this.arrayToReadableText(value, depth);
    }

    if (typeof value === "object") {
      return this.objectToReadableText(value, depth);
    }

    return String(value);
  }

  /**
   * 配列を読みやすいテキスト形式に変換
   *
   * @param arr - 配列
   * @param depth - 現在のネスト深度
   * @returns 読みやすいテキスト
   */
  private arrayToReadableText(arr: JSONValue[], depth: number): string {
    if (arr.length === 0) {
      return "(empty array)";
    }

    const lines: string[] = [];
    const indent = "  ".repeat(depth);

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      const itemText = this.jsonToReadableText(item, depth + 1);

      // 複雑なオブジェクトの場合は改行を含める
      if (this.isComplexValue(item)) {
        lines.push(`${indent}- [${i}]:`);
        lines.push(
          itemText
            .split("\n")
            .map((line) => `${indent}  ${line}`)
            .join("\n"),
        );
      } else {
        lines.push(`${indent}- ${itemText}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * オブジェクトを読みやすいテキスト形式に変換
   *
   * @param obj - オブジェクト
   * @param depth - 現在のネスト深度
   * @returns 読みやすいテキスト
   */
  private objectToReadableText(
    obj: { [key: string]: JSONValue },
    depth: number,
  ): string {
    const keys = Object.keys(obj);

    if (keys.length === 0) {
      return "(empty object)";
    }

    const lines: string[] = [];
    const indent = "  ".repeat(depth);

    for (const key of keys) {
      const value = obj[key];
      const valueText = this.jsonToReadableText(value, depth + 1);

      // 複雑な値の場合は改行を含める
      if (this.isComplexValue(value)) {
        lines.push(`${indent}${key}:`);
        lines.push(
          valueText
            .split("\n")
            .map((line) => `${indent}  ${line}`)
            .join("\n"),
        );
      } else {
        lines.push(`${indent}${key}: ${valueText}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * 値が複雑（オブジェクトまたは配列）かどうかを判定
   *
   * @param value - JSON値
   * @returns 複雑な値の場合はtrue
   */
  private isComplexValue(value: JSONValue): boolean {
    if (value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return false;
  }

  /**
   * JSONメタデータを抽出
   *
   * @param value - パースされたJSON値
   * @param originalContent - 元のJSONコンテンツ
   * @returns JSONメタデータ
   */
  private extractJSONMetadata(
    value: JSONValue,
    originalContent: string,
  ): JSONMetadata {
    const topLevelKeys = this.extractTopLevelKeys(value);
    const nestingDepth = this.calculateNestingDepth(value);
    const { objectCount, arrayCount } = this.countStructures(value);
    const dataSize = originalContent.length;

    return {
      topLevelKeys,
      nestingDepth,
      objectCount,
      arrayCount,
      dataSize,
    };
  }

  /**
   * トップレベルのキーを抽出
   *
   * @param value - JSON値
   * @returns トップレベルキーの配列
   */
  private extractTopLevelKeys(value: JSONValue): string[] {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return [];
    }
    return Object.keys(value);
  }

  /**
   * ネストの最大深度を計算
   *
   * @param value - JSON値
   * @param currentDepth - 現在の深度
   * @returns 最大深度
   */
  private calculateNestingDepth(value: JSONValue, currentDepth = 0): number {
    if (value === null || typeof value !== "object") {
      return currentDepth;
    }

    let maxDepth = currentDepth;

    if (Array.isArray(value)) {
      for (const item of value) {
        const itemDepth = this.calculateNestingDepth(item, currentDepth + 1);
        maxDepth = Math.max(maxDepth, itemDepth);
      }
    } else {
      for (const key of Object.keys(value)) {
        const itemDepth = this.calculateNestingDepth(
          value[key],
          currentDepth + 1,
        );
        maxDepth = Math.max(maxDepth, itemDepth);
      }
    }

    return maxDepth;
  }

  /**
   * オブジェクトと配列の数をカウント
   *
   * @param value - JSON値
   * @returns オブジェクト数と配列数
   */
  private countStructures(value: JSONValue): {
    objectCount: number;
    arrayCount: number;
  } {
    let objectCount = 0;
    let arrayCount = 0;

    const count = (v: JSONValue) => {
      if (v === null || typeof v !== "object") {
        return;
      }

      if (Array.isArray(v)) {
        arrayCount++;
        for (const item of v) {
          count(item);
        }
      } else {
        objectCount++;
        for (const key of Object.keys(v)) {
          count(v[key]);
        }
      }
    };

    count(value);
    return { objectCount, arrayCount };
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
        jsonTopLevelKeys: [],
        jsonNestingDepth: 0,
        jsonObjectCount: 0,
        jsonArrayCount: 0,
        jsonDataSize: 0,
      },
    };
  }

  /**
   * 基本メタデータとJSONメタデータをマージ
   *
   * @param base - 基本メタデータ
   * @param json - JSONメタデータ
   * @returns マージされたメタデータ
   */
  private mergeMetadata(
    base: ExtractedMetadata,
    json: JSONMetadata,
  ): ExtractedMetadata {
    return {
      ...base,
      custom: {
        ...base.custom,
        jsonTopLevelKeys: json.topLevelKeys,
        jsonNestingDepth: json.nestingDepth,
        jsonObjectCount: json.objectCount,
        jsonArrayCount: json.arrayCount,
        jsonDataSize: json.dataSize,
      },
    };
  }
}
