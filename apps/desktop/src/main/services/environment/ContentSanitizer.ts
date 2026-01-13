/**
 * ContentSanitizer - HTMLコンテンツのサニタイズ
 * @module environment
 */

import type {
  ExtractedContent,
  SanitizedContent,
} from "@repo/shared/types/agent";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

/**
 * コンテンツサニタイズクラス
 */
export class ContentSanitizer {
  /** DOMPurifyインスタンス */
  private readonly purify: typeof DOMPurify;

  /** 危険なタグリスト */
  private readonly dangerousTags = [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "base",
  ];

  /** 危険な属性リスト */
  private readonly dangerousAttrs = [
    "onclick",
    "onerror",
    "onload",
    "onmouseover",
    "onfocus",
  ];

  constructor() {
    // Node.js環境でDOMPurifyを使用するためにJSDOMを使用
    const jsdomWindow = new JSDOM("").window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.purify = DOMPurify(jsdomWindow as any);
  }

  /**
   * コンテンツをサニタイズ
   * @param content - 抽出されたコンテンツ
   * @returns サニタイズされたコンテンツ
   */
  sanitize(content: ExtractedContent): SanitizedContent {
    // HTMLタイプ以外はそのまま通過
    if (content.type !== "html") {
      return {
        id: content.id,
        type: content.type,
        originalContent: content.content,
        sanitizedContent: content.content,
        removedElements: [],
        sanitizedAt: new Date(),
      };
    }

    // HTMLをサニタイズ
    return this.sanitizeHtml(content);
  }

  /**
   * HTMLコンテンツをサニタイズ
   * @param content - 抽出されたコンテンツ
   * @returns サニタイズされたコンテンツ
   */
  private sanitizeHtml(content: ExtractedContent): SanitizedContent {
    // 除去された要素を検出
    const removedElements = this.detectRemovedElements(content.content);

    const sanitizedContent = this.purify.sanitize(content.content, {
      FORBID_TAGS: this.dangerousTags,
      FORBID_ATTR: this.dangerousAttrs,
      ALLOW_DATA_ATTR: false,
      SAFE_FOR_TEMPLATES: true,
    });

    return {
      id: content.id,
      type: content.type,
      originalContent: content.content,
      sanitizedContent,
      removedElements,
      sanitizedAt: new Date(),
    };
  }

  /**
   * 元のコンテンツから除去される要素を検出
   * @param originalContent - 元のコンテンツ
   * @returns 除去された要素のリスト
   */
  private detectRemovedElements(originalContent: string): string[] {
    const removed: string[] = [];
    const lowerContent = originalContent.toLowerCase();

    // 危険なタグを検出
    for (const tag of this.dangerousTags) {
      const tagPattern = new RegExp(`<${tag}[\\s>]`, "i");
      if (tagPattern.test(lowerContent)) {
        removed.push(tag);
      }
    }

    // 危険な属性を検出
    for (const attr of this.dangerousAttrs) {
      const attrPattern = new RegExp(`\\s${attr}\\s*=`, "i");
      if (attrPattern.test(lowerContent)) {
        removed.push(`${attr} attribute`);
      }
    }

    return removed;
  }
}
