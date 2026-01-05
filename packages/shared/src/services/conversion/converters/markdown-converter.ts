/**
 * @file MarkdownConverter - Markdownファイルコンバーター
 * @module @repo/shared/services/conversion/converters/markdown-converter
 * @description Markdownファイルを正規化し、RAG検索に必要な構造情報を抽出
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
// MarkdownConverter実装
// =============================================================================

/**
 * Markdownファイルコンバーター
 *
 * 責務:
 * - Markdownの正規化（BOM除去、改行統一、連続空行制限）
 * - フロントマター抽出・除去
 * - 構造情報抽出（見出し、リンク、コードブロック）
 * - メタデータ生成
 *
 * 正規化処理:
 * - BOM除去
 * - 改行コード統一（CRLF→LF、CR→LF）
 * - 連続空行を2行までに制限
 * - コードブロック内の空白は保持
 * - コードブロック外の行末空白を除去
 */
export class MarkdownConverter extends BaseConverter {
  // ========================================
  // プロパティ
  // ========================================

  readonly id = "markdown-converter";
  readonly name = "Markdown Converter";
  readonly supportedMimeTypes = ["text/markdown", "text/x-markdown"] as const;
  readonly priority = 10;

  // ========================================
  // メイン変換処理
  // ========================================

  /**
   * Markdown変換処理
   *
   * 処理フロー:
   * 1. テキストコンテンツ取得
   * 2. フロントマター抽出・除去
   * 3. Markdown正規化
   * 4. 最大長トリミング
   * 5. メタデータ抽出
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

      // 2. フロントマター抽出・除去
      const { frontmatter, body } = this.extractFrontmatter(rawContent);

      // 3. Markdown正規化
      const normalizedContent = this.normalizeMarkdown(body, options);

      // 4. 最大長トリミング
      const trimmedContent = this.trimContent(
        normalizedContent,
        options.maxContentLength,
      );

      // 5. メタデータ抽出
      const extractedMetadata = this.extractMarkdownMetadata(
        trimmedContent,
        options,
        frontmatter,
      );

      // 6. ConverterOutput生成
      return ok({
        convertedContent: trimmedContent,
        extractedMetadata,
        processingTime: 0, // BaseConverterが自動設定
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          `Failed to convert Markdown: ${error instanceof Error ? error.message : String(error)}`,
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
  // フロントマター処理
  // ========================================

  /**
   * フロントマター抽出
   *
   * YAML形式のフロントマター（---\n...\n---\n）を検出し、
   * 本文から除去する。
   *
   * @param content - Markdownコンテンツ
   * @returns フロントマターと本文
   */
  private extractFrontmatter(content: string): {
    frontmatter: string | null;
    body: string;
  } {
    const match = content.match(/^---\n([\s\S]*?)\n---\n/);

    if (match) {
      return {
        frontmatter: match[1],
        body: content.slice(match[0].length),
      };
    }

    return {
      frontmatter: null,
      body: content,
    };
  }

  // ========================================
  // 正規化処理
  // ========================================

  /**
   * Markdown正規化
   *
   * 処理内容:
   * 1. BOM除去
   * 2. 改行コード統一（CRLF→LF、CR→LF）
   * 3. 連続空行制限（3行以上→2行）
   * 4. コードブロック内外の分離処理
   * 5. 行末空白除去（コードブロック外のみ）
   * 6. 前後の空白トリム
   *
   * @param content - 正規化対象のコンテンツ
   * @param options - 変換オプション
   * @returns 正規化されたコンテンツ
   */
  private normalizeMarkdown(
    content: string,
    options: ConverterOptions,
  ): string {
    let normalized = content;

    // 1. BOM除去
    normalized = normalized.replace(/^\uFEFF/, "");

    // 2. 改行コード統一
    normalized = normalized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // 3. 連続空行制限
    normalized = normalized.replace(/\n{3,}/g, "\n\n");

    // 4. フォーマット保持オプションがtrueの場合、ここで処理を終了
    if (options.preserveFormatting) {
      return normalized.trim();
    }

    // 5. コードブロック内外の分離処理
    const parts: string[] = [];
    const codeBlockRegex = /```[\s\S]*?```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(normalized)) !== null) {
      // コードブロック前のテキスト → normalizeTextPart()
      parts.push(
        this.normalizeTextPart(normalized.slice(lastIndex, match.index)),
      );
      // コードブロックはそのまま
      parts.push(match[0]);
      lastIndex = match.index + match[0].length;
    }

    // 残りのテキスト
    parts.push(this.normalizeTextPart(normalized.slice(lastIndex)));

    return parts.join("").trim();
  }

  /**
   * テキスト部分の正規化
   *
   * コードブロック外のテキストに対して行末空白を除去。
   *
   * @param text - 正規化対象のテキスト
   * @returns 正規化されたテキスト
   */
  private normalizeTextPart(text: string): string {
    // 行末空白除去
    return text
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n");
  }

  // ========================================
  // メタデータ抽出
  // ========================================

  /**
   * Markdownメタデータ抽出
   *
   * ExtractedMetadata型に準拠したメタデータを生成。
   *
   * @param content - コンテンツ
   * @param options - 変換オプション
   * @param frontmatter - フロントマター（nullの場合あり）
   * @returns 抽出されたメタデータ
   */
  private extractMarkdownMetadata(
    content: string,
    options: ConverterOptions,
    frontmatter: string | null,
  ): ExtractedMetadata {
    const lines = content.split("\n");

    // 見出し抽出
    const headers =
      options.extractHeaders !== false ? this.extractHeaders(content) : [];

    // タイトル抽出
    const title = this.extractTitle(headers);

    // リンク抽出
    const links =
      options.extractLinks !== false ? this.extractLinks(content) : [];

    // コードブロックカウント
    const codeBlocks = this.countCodeBlocks(content);

    // 言語検出（オプションで指定されていればそれを優先）
    const language =
      options.language === "ja" || options.language === "en"
        ? options.language
        : this.detectLanguage(content);

    // ワードカウント（コードブロック除外）
    const wordCount = this.countWords(content);

    return {
      title,
      author: null,
      language,
      wordCount,
      lineCount: lines.length,
      charCount: content.length,
      headers,
      codeBlocks,
      links,
      custom: {
        hasFrontmatter: frontmatter !== null,
        hasCodeBlocks: codeBlocks > 0,
        headerCount: headers.length,
      },
    };
  }

  /**
   * 見出し抽出
   *
   * Markdown見出し（h1～h6）を抽出。
   * コードブロック内の見出しは除外。
   *
   * @param content - コンテンツ
   * @returns 見出しの配列
   */
  private extractHeaders(
    content: string,
  ): Array<{ level: number; text: string }> {
    const headers: Array<{ level: number; text: string }> = [];

    // コードブロックを除外したコンテンツで見出しを抽出
    const contentWithoutCode = content.replace(/```[\s\S]*?```/g, "");
    const headerRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;

    while ((match = headerRegex.exec(contentWithoutCode)) !== null) {
      headers.push({
        level: match[1].length,
        text: match[2].trim(),
      });
    }

    return headers;
  }

  /**
   * タイトル抽出
   *
   * 最初のh1見出しをタイトルとする。
   *
   * @param headers - 見出しの配列
   * @returns タイトル（h1がない場合はnull）
   */
  private extractTitle(
    headers: Array<{ level: number; text: string }>,
  ): string | null {
    const h1 = headers.find((h) => h.level === 1);
    return h1 ? h1.text : null;
  }

  /**
   * リンク抽出
   *
   * Markdownリンク形式 [text](url) から外部URLのみを抽出。
   * 重複は除去。
   *
   * @param content - コンテンツ
   * @returns URLの配列
   */
  private extractLinks(content: string): string[] {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: string[] = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const url = match[2];
      if (url.startsWith("http://") || url.startsWith("https://")) {
        links.push(url);
      }
    }

    // 重複除去
    return [...new Set(links)];
  }

  /**
   * コードブロックカウント
   *
   * Markdownコードブロック（```...```）の数を数える。
   *
   * @param content - コンテンツ
   * @returns コードブロック数
   */
  private countCodeBlocks(content: string): number {
    const matches = content.match(/```[\s\S]*?```/g);
    return matches ? matches.length : 0;
  }

  /**
   * 言語検出
   *
   * 日本語文字（ひらがな、カタカナ、漢字）が100文字以上あれば "ja"、
   * それ以外は "en"。
   *
   * @param content - コンテンツ
   * @returns 言語コード（"ja" | "en"）
   */
  private detectLanguage(content: string): "ja" | "en" {
    const japaneseChars = content.match(
      /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g,
    );
    if (japaneseChars && japaneseChars.length > 100) {
      return "ja";
    }
    return "en";
  }

  /**
   * ワードカウント
   *
   * コードブロックを除外してワード数をカウント。
   * 空白で分割し、空文字列を除外。
   *
   * @param content - コンテンツ
   * @returns ワード数
   */
  private countWords(content: string): number {
    // コードブロック除外
    const textWithoutCode = content.replace(/```[\s\S]*?```/g, "");
    // 空白で分割してカウント
    const words = textWithoutCode.split(/\s+/).filter((w) => w.length > 0);
    return words.length;
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
    return "Converts Markdown files to searchable format with structure extraction";
  }
}
