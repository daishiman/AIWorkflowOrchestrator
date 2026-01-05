/**
 * @file CodeConverter - ソースコードファイルコンバーター
 * @module @repo/shared/services/conversion/converters/code-converter
 * @description TypeScript、JavaScript、Pythonのソースコードを処理し、コード構造を抽出
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
 * コード構造
 *
 * ソースコードから抽出された構造情報を格納。
 * 正規表現ベースの簡易抽出のため、完全性は保証しない。
 */
interface CodeStructure {
  /** 関数名の配列（通常関数、アロー関数含む） */
  functions: string[];

  /** クラス名の配列 */
  classes: string[];

  /** インポート元モジュール名の配列 */
  imports: string[];

  /** エクスポート名の配列 */
  exports: string[];

  /** コメント（将来拡張用、現在は未使用） */
  comments: string[];
}

// =============================================================================
// CodeConverter実装
// =============================================================================

/**
 * ソースコードファイルコンバーター
 *
 * 責務:
 * - TypeScript、JavaScript、Pythonのソースコードを処理
 * - コード構造抽出（関数、クラス、インポート、エクスポート）
 * - Markdown形式で出力（構造サマリー + ソースコード）
 *
 * 対応言語:
 * - TypeScript (.ts, .tsx, .mts, .cts)
 * - JavaScript (.js, .jsx, .mjs, .cjs)
 * - Python (.py)
 */
export class CodeConverter extends BaseConverter {
  // ========================================
  // プロパティ
  // ========================================

  readonly id = "code-converter";
  readonly name = "Code File Converter";
  readonly supportedMimeTypes = [
    // TypeScript
    "text/x-typescript",
    "text/typescript",
    "application/typescript",
    // JavaScript
    "text/javascript",
    "application/javascript",
    // Python
    "text/x-python",
    "text/x-python-script",
    "application/x-python",
  ] as const;
  readonly priority = 10;

  // ========================================
  // メイン変換処理
  // ========================================

  /**
   * コード変換処理
   *
   * 処理フロー:
   * 1. テキストコンテンツ取得
   * 2. 言語判定
   * 3. コード構造抽出
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
      const content = this.getTextContent(input);

      // 2. 言語判定
      const language = this.detectLanguage(input.mimeType, input.filePath);

      // 3. コード構造抽出
      const structure = this.extractCodeStructure(content, language);

      // 4. Markdown形式で整形
      const formattedContent = this.formatAsMarkdown(
        content,
        language,
        structure,
      );

      // 5. 最大長トリミング
      const trimmedContent = this.trimContent(
        formattedContent,
        options.maxContentLength,
      );

      // 6. メタデータ生成
      const extractedMetadata = this.createMetadata(
        content,
        language,
        structure,
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
          `Failed to convert code: ${error instanceof Error ? error.message : String(error)}`,
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
  // 言語判定
  // ========================================

  /**
   * 言語判定
   *
   * ファイルパスの拡張子から言語を判定。
   *
   * @param mimeType - MIMEタイプ（現在は未使用）
   * @param filePath - ファイルパス
   * @returns 言語名（typescript, javascript, python, text）
   */
  private detectLanguage(mimeType: string, filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase();

    const languageMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      mts: "typescript",
      cts: "typescript",
      js: "javascript",
      jsx: "javascript",
      mjs: "javascript",
      cjs: "javascript",
      py: "python",
    };

    return languageMap[ext ?? ""] ?? "text";
  }

  // ========================================
  // コード構造抽出
  // ========================================

  /**
   * コード構造抽出
   *
   * 言語に応じて構造抽出メソッドを呼び出す。
   *
   * @param content - ソースコード
   * @param language - 言語名
   * @returns コード構造
   */
  private extractCodeStructure(
    content: string,
    language: string,
  ): CodeStructure {
    const structure: CodeStructure = {
      functions: [],
      classes: [],
      imports: [],
      exports: [],
      comments: [],
    };

    if (language === "typescript" || language === "javascript") {
      this.extractJSStructure(content, structure);
    } else if (language === "python") {
      this.extractPythonStructure(content, structure);
    }

    return structure;
  }

  /**
   * JavaScript/TypeScript構造抽出
   *
   * 正規表現を使用して関数、クラス、インポート、エクスポートを抽出。
   *
   * @param content - ソースコード
   * @param structure - 抽出結果を格納する構造体
   */
  private extractJSStructure(content: string, structure: CodeStructure): void {
    let match;

    // 関数定義
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
    while ((match = functionRegex.exec(content)) !== null) {
      structure.functions.push(match[1]);
    }

    // アロー関数
    const arrowRegex = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/g;
    while ((match = arrowRegex.exec(content)) !== null) {
      structure.functions.push(match[1]);
    }

    // クラス定義
    const classRegex = /(?:export\s+)?class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      structure.classes.push(match[1]);
    }

    // インポート
    const importRegex = /import\s+(?:.*?from\s+)?['"]([^'"]+)['"]/g;
    while ((match = importRegex.exec(content)) !== null) {
      structure.imports.push(match[1]);
    }

    // エクスポート
    const exportRegex =
      /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
    while ((match = exportRegex.exec(content)) !== null) {
      structure.exports.push(match[1]);
    }
  }

  /**
   * Python構造抽出
   *
   * 正規表現を使用して関数、クラス、インポートを抽出。
   *
   * @param content - ソースコード
   * @param structure - 抽出結果を格納する構造体
   */
  private extractPythonStructure(
    content: string,
    structure: CodeStructure,
  ): void {
    let match;

    // 関数定義
    const functionRegex = /def\s+(\w+)\s*\(/g;
    while ((match = functionRegex.exec(content)) !== null) {
      structure.functions.push(match[1]);
    }

    // クラス定義
    const classRegex = /class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      structure.classes.push(match[1]);
    }

    // インポート
    const importRegex = /(?:from\s+(\S+)\s+)?import\s+(.+)/g;
    while ((match = importRegex.exec(content)) !== null) {
      // from X import Y の場合は X を、import X の場合は X を取得
      const module = match[1] || match[2].split(",")[0].trim();
      structure.imports.push(module);
    }
  }

  // ========================================
  // Markdown整形
  // ========================================

  /**
   * Markdown形式で整形
   *
   * コード構造サマリーとソースコードをMarkdown形式で出力。
   *
   * @param content - ソースコード
   * @param language - 言語名
   * @param structure - コード構造
   * @returns Markdown形式の文字列
   */
  private formatAsMarkdown(
    content: string,
    language: string,
    structure: CodeStructure,
  ): string {
    const parts: string[] = [];

    // 構造情報サマリー
    if (structure.classes.length > 0 || structure.functions.length > 0) {
      parts.push("## Code Structure\n");

      if (structure.classes.length > 0) {
        parts.push("### Classes");
        parts.push(structure.classes.map((c) => `- \`${c}\``).join("\n"));
        parts.push("");
      }

      if (structure.functions.length > 0) {
        parts.push("### Functions");
        parts.push(structure.functions.map((f) => `- \`${f}\``).join("\n"));
        parts.push("");
      }
    }

    // コード本体
    parts.push("## Source Code\n");
    parts.push(`\`\`\`${language}`);
    parts.push(content);
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
   * @param content - ソースコード
   * @param language - 言語名
   * @param structure - コード構造
   * @returns 抽出されたメタデータ
   */
  private createMetadata(
    content: string,
    language: string,
    structure: CodeStructure,
  ): ExtractedMetadata {
    const lines = content.split("\n");

    // クラスと関数を見出しとして扱う
    const headers: Array<{ level: number; text: string }> = [
      ...structure.classes.map((c) => ({ level: 2, text: `class ${c}` })),
      ...structure.functions.map((f) => ({ level: 2, text: `function ${f}` })),
    ];

    return {
      title: null,
      author: null,
      language: "en", // コードは通常英語（型定義に準拠: "ja" | "en"）
      wordCount: content.split(/\s+/).filter((w) => w.length > 0).length,
      lineCount: lines.length,
      charCount: content.length,
      headers,
      codeBlocks: 1, // ソースコード全体を1つのコードブロックとして扱う
      links: [],
      custom: {
        language, // 実際の言語名
        classCount: structure.classes.length,
        functionCount: structure.functions.length,
        importCount: structure.imports.length,
        exportCount: structure.exports.length,
        classes: structure.classes,
        functions: structure.functions,
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
    return "Converts TypeScript, JavaScript, and Python source code files with structure extraction";
  }
}
