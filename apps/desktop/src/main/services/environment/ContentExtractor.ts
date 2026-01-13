/**
 * ContentExtractor - エージェント出力からコードブロックを抽出
 * @module environment
 */

import type { ContentType, ExtractedContent } from "@repo/shared/types/agent";
import { randomUUID } from "node:crypto";

/**
 * コードブロック抽出クラス
 */
export class ContentExtractor {
  /** コードブロック正規表現 */
  private readonly codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

  /** 言語からコンテンツタイプへのマッピング */
  private readonly languageMap: Record<string, ContentType> = {
    html: "html",
    htm: "html",
    markdown: "markdown",
    md: "markdown",
    css: "css",
    javascript: "javascript",
    js: "javascript",
    text: "text",
  };

  /**
   * テキストからコードブロックを抽出
   * @param text - エージェント出力テキスト
   * @returns 抽出されたコンテンツ配列
   */
  extractCodeBlocks(text: string): ExtractedContent[] {
    const contents: ExtractedContent[] = [];
    let match: RegExpExecArray | null;
    let order = 0;

    // 正規表現をリセット
    this.codeBlockRegex.lastIndex = 0;

    while ((match = this.codeBlockRegex.exec(text)) !== null) {
      const language = match[1]?.toLowerCase() || "";
      const content = match[2]?.trim() || "";

      contents.push({
        id: randomUUID(),
        type: this.detectContentType(language),
        content,
        language: language || undefined,
        order: order++,
        extractedAt: new Date(),
      });
    }

    return contents;
  }

  /**
   * プレビュー可能なコンテンツを取得（最後のHTML/Markdown）
   * @param contents - 抽出されたコンテンツ配列
   * @returns プレビュー可能なコンテンツ、またはnull
   */
  getPreviewableContent(contents: ExtractedContent[]): ExtractedContent | null {
    if (contents.length === 0) {
      return null;
    }

    // 後ろから検索して最後のプレビュー可能なコンテンツを取得
    for (let i = contents.length - 1; i >= 0; i--) {
      const content = contents[i];
      if (content.type === "html" || content.type === "markdown") {
        return content;
      }
    }

    return null;
  }

  /**
   * 言語からコンテンツタイプを検出
   * @param language - コードブロックの言語指定
   * @returns コンテンツタイプ
   */
  private detectContentType(language: string): ContentType {
    if (!language) {
      return "text";
    }

    return this.languageMap[language] || "text";
  }
}
