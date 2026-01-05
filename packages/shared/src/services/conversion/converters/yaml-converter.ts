/**
 * @file YAMLConverter - YAMLファイルコンバーター
 * @module @repo/shared/services/conversion/converters/yaml-converter
 * @description YAMLファイルを処理し、構造情報を抽出してMarkdown形式で出力
 */

// =============================================================================
// インポート
// =============================================================================

import { BaseConverter } from "../base-converter";
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
 * YAML構造
 *
 * YAMLファイルから抽出された構造情報を格納。
 */
interface YAMLStructure {
  /** トップレベルキーの配列 */
  topLevelKeys: string[];

  /** コメントの有無 */
  hasComments: boolean;

  /** 最大インデント深さ（スペース数） */
  maxIndentDepth: number;

  /** 総行数（空行を除く） */
  totalLines: number;
}

// =============================================================================
// YAMLConverter実装
// =============================================================================

/**
 * YAMLファイルコンバーター
 *
 * 責務:
 * - YAML構造解析（トップレベルキー、コメント、インデント深さ）
 * - Markdown形式整形（構造サマリー + YAML本体）
 * - メタデータ生成
 *
 * 対応MIMEタイプ:
 * - application/x-yaml
 * - text/yaml
 * - text/x-yaml
 */
export class YAMLConverter extends BaseConverter {
  // ========================================
  // プロパティ
  // ========================================

  readonly id = "yaml-converter";
  readonly name = "YAML Converter";
  readonly supportedMimeTypes = [
    "application/x-yaml",
    "text/yaml",
    "text/x-yaml",
  ] as const;
  readonly priority = 10;

  // ========================================
  // メイン変換処理
  // ========================================

  /**
   * YAML変換処理
   *
   * 処理フロー:
   * 1. テキストコンテンツ取得
   * 2. YAML正規化
   * 3. YAML構造抽出
   * 4. Markdown形式で整形
   * 5. 最大長トリミング
   * 6. メタデータ生成
   *
   * @param input - 変換対象の入力データ
   * @param options - 変換オプション
   * @returns 変換結果またはエラー
   */
  protected async doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    try {
      // 1. テキストコンテンツ取得
      const rawContent = this.getTextContent(input);

      // 2. YAML正規化
      const normalizedContent = this.normalizeYAML(rawContent);

      // 3. YAML構造抽出
      const yamlStructure = this.extractYAMLStructure(normalizedContent);

      // 4. Markdown形式で整形
      const markdownContent = this.formatAsMarkdown(
        normalizedContent,
        yamlStructure,
      );

      // 5. 最大長トリミング
      const trimmedContent = this.trimContent(
        markdownContent,
        options.maxContentLength,
      );

      // 6. メタデータ生成
      const extractedMetadata = this.extractYAMLMetadata(
        normalizedContent,
        yamlStructure,
        options,
      );

      // 7. ConverterOutput生成
      return ok({
        convertedContent: trimmedContent,
        extractedMetadata,
        processingTime: 0, // BaseConverterが自動設定
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          `YAML conversion failed: ${error instanceof Error ? error.message : String(error)}`,
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
  // YAML正規化
  // ========================================

  /**
   * YAML正規化
   *
   * 処理内容:
   * 1. BOM除去
   * 2. 行末正規化（CRLF→LF）
   * 3. 末尾空白除去
   * 4. 連続空行削減（3行以上→2行）
   *
   * @param content - 正規化対象のコンテンツ
   * @returns 正規化されたコンテンツ
   */
  private normalizeYAML(content: string): string {
    let normalized = content;

    // 1. BOM除去
    if (normalized.charCodeAt(0) === 0xfeff) {
      normalized = normalized.slice(1);
    }

    // 2. 行末正規化
    normalized = normalized.replace(/\r\n/g, "\n");

    // 3. 末尾空白除去
    normalized = normalized.replace(/[ \t]+$/gm, "");

    // 4. 連続空行削減
    normalized = normalized.replace(/\n{3,}/g, "\n\n");

    return normalized;
  }

  // ========================================
  // YAML構造抽出
  // ========================================

  /**
   * YAML構造抽出
   *
   * 処理内容:
   * 1. トップレベルキー検出
   * 2. コメント検出
   * 3. インデント深さ計算
   * 4. 行数カウント
   *
   * @param content - YAMLコンテンツ
   * @returns YAML構造情報
   */
  private extractYAMLStructure(content: string): YAMLStructure {
    const lines = content.split("\n");
    const topLevelKeys: string[] = [];
    let hasComments = false;
    let maxIndentDepth = 0;
    let totalLines = 0;

    for (const line of lines) {
      if (line.trim() === "") continue;
      totalLines++;

      // トップレベルキー検出
      const topKeyMatch = line.match(/^([a-zA-Z_][\w-]*?):\s*/);
      if (topKeyMatch) {
        topLevelKeys.push(topKeyMatch[1]);
      }

      // コメント検出
      if (line.includes("#")) {
        hasComments = true;
      }

      // インデント深さ計算
      const indentMatch = line.match(/^(\s+)/);
      if (indentMatch) {
        const depth = indentMatch[1].length;
        maxIndentDepth = Math.max(maxIndentDepth, depth);
      }
    }

    return {
      topLevelKeys,
      hasComments,
      maxIndentDepth,
      totalLines,
    };
  }

  // ========================================
  // Markdown整形
  // ========================================

  /**
   * Markdown形式で整形
   *
   * 出力フォーマット:
   * - YAML Structure セクション（構造サマリー）
   * - YAML Content セクション（YAML本体）
   *
   * @param yamlContent - YAMLコンテンツ
   * @param structure - YAML構造情報
   * @returns Markdown形式の文字列
   */
  private formatAsMarkdown(
    yamlContent: string,
    structure: YAMLStructure,
  ): string {
    const parts: string[] = [];

    // 構造サマリー
    parts.push("## YAML Structure\n");
    parts.push(
      `- **Top-level keys**: ${structure.topLevelKeys.join(", ") || "None"}`,
    );
    parts.push(`- **Has comments**: ${structure.hasComments ? "Yes" : "No"}`);
    parts.push(`- **Max indent depth**: ${structure.maxIndentDepth} spaces`);
    parts.push(`- **Total lines**: ${structure.totalLines}`);
    parts.push("");

    // YAML本体
    parts.push("## YAML Content\n");
    parts.push("```yaml");
    parts.push(yamlContent);
    parts.push("```");

    return parts.join("\n");
  }

  // ========================================
  // メタデータ生成
  // ========================================

  /**
   * メタデータ生成
   *
   * ExtractedMetadata型に準拠したメタデータを生成。
   *
   * @param content - YAMLコンテンツ
   * @param structure - YAML構造情報
   * @param options - 変換オプション
   * @returns 抽出されたメタデータ
   */
  private extractYAMLMetadata(
    content: string,
    structure: YAMLStructure,
    options: ConverterOptions,
  ): ExtractedMetadata {
    const lines = content.split("\n");

    return {
      title: null, // YAMLファイルにはタイトル概念なし
      author: null,
      language: (options.language as "ja" | "en") ?? "ja",
      wordCount: content.split(/\s+/).filter((w) => w.length > 0).length,
      lineCount: lines.length,
      charCount: content.length,
      headers: [], // YAML にヘッダー概念なし
      codeBlocks: 1, // YAML全体を1ブロックとして扱う
      links: [],
      custom: {
        hasComments: structure.hasComments,
        maxIndentDepth: structure.maxIndentDepth,
        topLevelKeys: structure.topLevelKeys,
        totalLines: structure.totalLines,
      },
    };
  }

  // ========================================
  // メタデータ（オーバーライド）
  // ========================================

  /**
   * コンバーターの説明を取得
   *
   * @returns 説明文
   */
  protected getDescription(): string {
    return "Converts YAML files to searchable format with structure extraction";
  }
}
