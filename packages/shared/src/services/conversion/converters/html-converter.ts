/**
 * @file HTMLコンバーター
 * @module @repo/shared/services/conversion/converters/html-converter
 * @description HTMLファイルをMarkdown形式に変換するコンバーター
 */

// =============================================================================
// インポート
// =============================================================================

import TurndownService from "turndown";
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
 * HTML固有のメタデータ
 */
interface HTMLMetadata {
  /** <title>タグの内容 */
  title: string | null;
  /** meta descriptionの内容 */
  description: string | null;
  /** meta authorの内容 */
  author: string | null;
  /** 見出し構造 */
  headings: Array<{ level: number; text: string }>;
  /** リンク数 */
  linkCount: number;
  /** 画像数 */
  imageCount: number;
}

// =============================================================================
// HTMLConverterクラス
// =============================================================================

/**
 * HTMLコンバーター
 *
 * HTMLファイルをMarkdown形式に変換する。
 * turndownライブラリを使用してHTML→Markdown変換を行う。
 *
 * @example
 * ```typescript
 * const converter = new HTMLConverter();
 * const result = await converter.convert({
 *   fileId: createFileId("file-1"),
 *   filePath: "/path/to/file.html",
 *   mimeType: "text/html",
 *   content: "<h1>Hello</h1><p>World</p>",
 *   encoding: "utf-8"
 * });
 * ```
 */
export class HTMLConverter extends BaseConverter {
  // ========================================
  // プロパティ
  // ========================================

  readonly id = "html-converter";
  readonly name = "HTML Converter";
  readonly supportedMimeTypes = ["text/html", "application/xhtml+xml"] as const;
  readonly priority = 10;

  /**
   * Turndownサービスインスタンス
   */
  private readonly turndownService: TurndownService;

  // ========================================
  // コンストラクタ
  // ========================================

  constructor() {
    super();
    this.turndownService = this.createTurndownService();
  }

  // ========================================
  // 抽象メソッドの実装
  // ========================================

  /**
   * HTML→Markdown変換を実行
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
      // HTMLコンテンツを取得
      const htmlContent = this.getTextContent(input);

      // HTML固有のメタデータを抽出
      const htmlMetadata = this.extractHTMLMetadata(htmlContent);

      // script/styleタグを除去したHTMLを取得
      const cleanedHtml = this.removeScriptAndStyle(htmlContent);

      // HTML→Markdown変換
      const markdownContent = this.htmlToMarkdown(cleanedHtml);

      // Non-breaking spaceを通常のスペースに置換
      const normalizedContent = markdownContent.replace(/\u00A0/g, " ");

      // 最大長でトリミング
      const trimmedContent = this.trimContent(
        normalizedContent,
        options.maxContentLength,
      );

      // 変換後のMarkdownからメタデータを抽出
      const baseMetadata = MetadataExtractor.extractFromText(
        trimmedContent,
        options,
      );

      // メタデータをマージ
      const extractedMetadata = this.mergeMetadata(baseMetadata, htmlMetadata);

      return ok({
        convertedContent: trimmedContent,
        extractedMetadata,
        processingTime: 0, // BaseConverterが自動設定
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          `Failed to convert HTML: ${error instanceof Error ? error.message : String(error)}`,
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
    return "Converts HTML files to Markdown format for RAG processing";
  }

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * Turndownサービスを作成
   *
   * @returns 設定済みのTurndownServiceインスタンス
   */
  private createTurndownService(): TurndownService {
    const service = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
      strongDelimiter: "**",
      emDelimiter: "*",
    });

    // カスタムルールを追加
    this.addCustomRules(service);

    return service;
  }

  /**
   * カスタム変換ルールを追加
   *
   * @param service - Turndownサービス
   */
  private addCustomRules(service: TurndownService): void {
    // 削除するタグのルールを追加
    service.addRule("removeScript", {
      filter: ["script", "noscript"],
      replacement: () => "",
    });

    service.addRule("removeStyle", {
      filter: ["style"],
      replacement: () => "",
    });

    // iframeを除去
    service.addRule("removeIframe", {
      filter: ["iframe"],
      replacement: () => "",
    });

    // コメントを除去（HTMLコメントはturndownでは通常処理されないが念のため）
    service.addRule("removeComment", {
      filter: (node) => node.nodeType === 8, // COMMENT_NODE
      replacement: () => "",
    });
  }

  /**
   * HTML→Markdown変換
   *
   * @param html - HTML文字列
   * @returns Markdown文字列
   */
  private htmlToMarkdown(html: string): string {
    // 空のHTMLの場合
    if (!html.trim()) {
      return "";
    }

    // turndownで変換
    const markdown = this.turndownService.turndown(html);

    // 余分な空行を除去して整形
    return this.normalizeMarkdown(markdown);
  }

  /**
   * Markdownを正規化
   *
   * @param markdown - Markdown文字列
   * @returns 正規化されたMarkdown
   */
  private normalizeMarkdown(markdown: string): string {
    return (
      markdown
        // 3つ以上の連続する改行を2つに圧縮
        .replace(/\n{3,}/g, "\n\n")
        // 行頭・行末の空白を除去
        .trim()
    );
  }

  /**
   * script/styleタグを除去
   *
   * @param html - HTML文字列
   * @returns クリーンなHTML
   */
  private removeScriptAndStyle(html: string): string {
    // script タグとその内容を除去
    let cleaned = html.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    );

    // style タグとその内容を除去
    cleaned = cleaned.replace(
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      "",
    );

    // noscript タグとその内容を除去
    cleaned = cleaned.replace(
      /<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi,
      "",
    );

    // HTMLコメントを除去
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");

    return cleaned;
  }

  /**
   * HTML固有のメタデータを抽出
   *
   * @param html - HTML文字列
   * @returns HTML固有のメタデータ
   */
  private extractHTMLMetadata(html: string): HTMLMetadata {
    return {
      title: this.extractTitle(html),
      description: this.extractMetaContent(html, "description"),
      author: this.extractMetaContent(html, "author"),
      headings: this.extractHeadings(html),
      linkCount: this.countLinks(html),
      imageCount: this.countImages(html),
    };
  }

  /**
   * <title>タグからタイトルを抽出
   *
   * @param html - HTML文字列
   * @returns タイトルまたはnull
   */
  private extractTitle(html: string): string | null {
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (match?.[1]) {
      return this.decodeHTMLEntities(match[1].trim());
    }
    return null;
  }

  /**
   * metaタグからコンテンツを抽出
   *
   * @param html - HTML文字列
   * @param name - metaタグのname属性値
   * @returns コンテンツまたはnull
   */
  private extractMetaContent(html: string, name: string): string | null {
    // name="..." content="..." パターン
    const namePattern = new RegExp(
      `<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`,
      "i",
    );
    const nameMatch = html.match(namePattern);
    if (nameMatch?.[1]) {
      return this.decodeHTMLEntities(nameMatch[1].trim());
    }

    // content="..." name="..." パターン（順序逆）
    const reversePattern = new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${name}["'][^>]*>`,
      "i",
    );
    const reverseMatch = html.match(reversePattern);
    if (reverseMatch?.[1]) {
      return this.decodeHTMLEntities(reverseMatch[1].trim());
    }

    return null;
  }

  /**
   * HTML見出しタグを抽出
   *
   * @param html - HTML文字列
   * @returns 見出しの配列
   */
  private extractHeadings(
    html: string,
  ): Array<{ level: number; text: string }> {
    const headings: Array<{ level: number; text: string }> = [];
    const pattern = /<h([1-6])[^>]*>([^<]*(?:<[^/h][^>]*>[^<]*)*)<\/h\1>/gi;

    let match;
    while ((match = pattern.exec(html)) !== null) {
      const level = parseInt(match[1], 10);
      // HTMLタグを除去してテキストのみ取得
      const text = this.decodeHTMLEntities(
        match[2].replace(/<[^>]+>/g, "").trim(),
      );
      if (text) {
        headings.push({ level, text });
      }
    }

    return headings;
  }

  /**
   * リンク数をカウント
   *
   * @param html - HTML文字列
   * @returns リンク数
   */
  private countLinks(html: string): number {
    const matches = html.match(/<a\s+[^>]*href\s*=/gi);
    return matches ? matches.length : 0;
  }

  /**
   * 画像数をカウント
   *
   * @param html - HTML文字列
   * @returns 画像数
   */
  private countImages(html: string): number {
    const matches = html.match(/<img\s/gi);
    return matches ? matches.length : 0;
  }

  /**
   * HTMLエンティティをデコード
   *
   * @param text - エンコードされたテキスト
   * @returns デコードされたテキスト
   */
  private decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&apos;": "'",
      "&nbsp;": " ",
      "&copy;": "©",
      "&reg;": "®",
      "&trade;": "™",
      "&ndash;": "–",
      "&mdash;": "—",
      "&lsquo;": "'",
      "&rsquo;": "'",
      "&ldquo;": "\u201c",
      "&rdquo;": "\u201d",
      "&hellip;": "…",
      "&bull;": "•",
    };

    let decoded = text;
    for (const [entity, char] of Object.entries(entities)) {
      decoded = decoded.replace(new RegExp(entity, "gi"), char);
    }

    // Non-breaking space文字を通常のスペースに変換
    decoded = decoded.replace(/\u00A0/g, " ");

    // 数値エンティティもデコード
    decoded = decoded.replace(/&#(\d+);/g, (_, num) =>
      String.fromCharCode(parseInt(num, 10)),
    );
    decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );

    return decoded;
  }

  /**
   * メタデータをマージ
   *
   * @param baseMetadata - ベースメタデータ
   * @param htmlMetadata - HTML固有のメタデータ
   * @returns マージされたメタデータ
   */
  private mergeMetadata(
    baseMetadata: ExtractedMetadata,
    htmlMetadata: HTMLMetadata,
  ): ExtractedMetadata {
    return {
      // HTMLのtitleがあればそれを使用、なければbaseMetadataのtitleを使用
      title: htmlMetadata.title ?? baseMetadata.title,
      // HTMLのauthorがあればそれを使用
      author: htmlMetadata.author ?? baseMetadata.author,
      language: baseMetadata.language,
      wordCount: baseMetadata.wordCount,
      lineCount: baseMetadata.lineCount,
      charCount: baseMetadata.charCount,
      // HTMLから抽出した見出しがあればそれを使用
      headers:
        htmlMetadata.headings.length > 0
          ? htmlMetadata.headings
          : baseMetadata.headers,
      codeBlocks: baseMetadata.codeBlocks,
      links: baseMetadata.links,
      custom: {
        ...baseMetadata.custom,
        // HTML固有のメタデータをcustomに格納
        htmlDescription: htmlMetadata.description,
        htmlLinkCount: htmlMetadata.linkCount,
        htmlImageCount: htmlMetadata.imageCount,
      },
    };
  }
}
