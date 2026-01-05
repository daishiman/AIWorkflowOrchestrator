/**
 * @file メタデータ抽出ユーティリティ
 * @module @repo/shared/services/conversion/metadata-extractor
 * @description テキストコンテンツから各種メタデータ（タイトル、見出し、リンク、言語等）を抽出
 */

// =============================================================================
// インポート
// =============================================================================

import type { ExtractedMetadata, ConverterOptions } from "./types";
import { mergeConverterOptions } from "./types";

// =============================================================================
// MetadataExtractorクラス
// =============================================================================

/**
 * メタデータ抽出ユーティリティ
 *
 * テキストコンテンツから各種メタデータを抽出する。
 * すべてのメソッドはstaticで、インスタンス化不要。
 *
 * @example
 * ```typescript
 * const text = "# Hello World\n\nThis is a test.";
 * const metadata = MetadataExtractor.extractFromText(text);
 * console.log(metadata.title); // "Hello World"
 * ```
 */
export class MetadataExtractor {
  // ========================================
  // 正規表現パターン（事前コンパイル）
  // ========================================

  /**
   * Markdown見出しパターン（h1～h6）
   */
  private static readonly HEADING_PATTERN = /^(#{1,6})\s+(.+)$/gm;

  /**
   * URLパターン（http/https）
   */
  private static readonly URL_PATTERN = /https?:\/\/[^\s]+/g;

  /**
   * Markdownリンクパターン（[text](url)）
   */
  private static readonly MD_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

  /**
   * コードブロックパターン（```...```）
   */
  private static readonly CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;

  /**
   * インラインコードパターン（`...`）
   */
  private static readonly INLINE_CODE_PATTERN = /`[^`]+`/g;

  /**
   * 日本語文字パターン（ひらがな、カタカナ、漢字）
   */
  private static readonly JAPANESE_PATTERN =
    /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;

  // ========================================
  // メイン抽出メソッド
  // ========================================

  /**
   * テキストからメタデータを抽出
   *
   * @param text - 抽出対象のテキスト
   * @param options - 抽出オプション
   * @returns 抽出されたメタデータ
   */
  static extractFromText(
    text: string,
    options?: ConverterOptions,
  ): ExtractedMetadata {
    const mergedOptions = mergeConverterOptions(options);

    return {
      title: this.extractTitle(text),
      author: null, // ファイルから抽出不可（メタデータから取得する場合あり）
      language: this.detectLanguage(text),
      wordCount: this.countWords(text),
      lineCount: this.countLines(text),
      charCount: text.length,
      headers: mergedOptions.extractHeaders ? this.extractHeaders(text) : [],
      codeBlocks: this.countCodeBlocks(text),
      links: mergedOptions.extractLinks ? this.extractLinks(text) : [],
      custom: {},
    };
  }

  // ========================================
  // タイトル抽出
  // ========================================

  /**
   * タイトルを抽出
   *
   * アルゴリズム:
   * 1. 最初のh1見出しがあればそれをタイトルとする
   * 2. h1がなければ最初の見出し（h2～h6）をタイトルとする
   * 3. 見出しがなければnull
   *
   * @param text - 抽出対象のテキスト
   * @returns タイトルまたはnull
   */
  static extractTitle(text: string): string | null {
    const headers = this.extractHeaders(text);

    if (headers.length === 0) {
      return null;
    }

    // 最初のh1見出しを探す
    const h1 = headers.find((header) => header.level === 1);
    if (h1) {
      return h1.text;
    }

    // h1がなければ最初の見出しを返す
    return headers[0].text;
  }

  // ========================================
  // 見出し抽出
  // ========================================

  /**
   * 見出しを抽出
   *
   * Markdown形式の見出し（# ～ ######）を抽出。
   *
   * @param text - 抽出対象のテキスト
   * @returns 見出しの配列
   */
  static extractHeaders(text: string): Array<{ level: number; text: string }> {
    const headers: Array<{ level: number; text: string }> = [];
    const matches = text.matchAll(this.HEADING_PATTERN);

    for (const match of matches) {
      const level = match[1].length; // #の数 = レベル
      const text = match[2].trim();
      headers.push({ level, text });
    }

    return headers;
  }

  // ========================================
  // リンク抽出
  // ========================================

  /**
   * リンクを抽出
   *
   * 以下の形式のリンクを抽出:
   * - http/https URL
   * - Markdownリンク: [text](url)
   *
   * @param text - 抽出対象のテキスト
   * @returns リンクの配列（重複なし、ソート済み）
   */
  static extractLinks(text: string): string[] {
    const links = new Set<string>();

    // URL抽出
    const urlMatches = text.matchAll(this.URL_PATTERN);
    for (const match of urlMatches) {
      // 末尾の句読点・括弧を除去（ドメイン内のドットは保持）
      // 英数字/スラッシュの後に句読点や括弧がある場合のみ除去
      const url = match[0].replace(/([a-zA-Z0-9/])[.,;:!?()]+$/, "$1");
      links.add(url);
    }

    // Markdownリンク抽出
    const mdLinkMatches = text.matchAll(this.MD_LINK_PATTERN);
    for (const match of mdLinkMatches) {
      const url = match[2];
      // URLまたは相対パス
      links.add(url);
    }

    // 重複削除、ソート
    return Array.from(links).sort();
  }

  // ========================================
  // コードブロック検出
  // ========================================

  /**
   * コードブロック数をカウント
   *
   * Markdown形式のコードブロック（```...```）をカウント。
   *
   * @param text - 抽出対象のテキスト
   * @returns コードブロック数
   */
  static countCodeBlocks(text: string): number {
    const matches = text.match(this.CODE_BLOCK_PATTERN);
    return matches ? matches.length : 0;
  }

  // ========================================
  // 言語検出
  // ========================================

  /**
   * 言語を検出（簡易版）
   *
   * アルゴリズム:
   * 1. 日本語文字（ひらがな、カタカナ、漢字）を含む場合は"ja"
   * 2. それ以外は"en"
   *
   * 注意: 簡易的な判定のため、多言語ドキュメントでは不正確な場合あり
   *
   * @param text - 判定対象のテキスト
   * @returns 言語コード（"ja" | "en"）
   */
  static detectLanguage(text: string): "ja" | "en" {
    return this.JAPANESE_PATTERN.test(text) ? "ja" : "en";
  }

  // ========================================
  // 統計情報
  // ========================================

  /**
   * 単語数をカウント
   *
   * アルゴリズム:
   * - 日本語の場合: 文字数をカウント（形態素解析なし）
   * - 英語の場合: 空白区切りで単語をカウント
   *
   * @param text - カウント対象のテキスト
   * @returns 単語数
   */
  static countWords(text: string): number {
    const language = this.detectLanguage(text);

    if (language === "ja") {
      // 日本語: 空白・改行・タブを除いた文字数
      const cleaned = text.replace(/[\s\n\r\t]/g, "");
      return cleaned.length;
    } else {
      // 英語: 空白区切りの単語数
      const trimmed = text.trim();
      if (trimmed.length === 0) return 0;

      const words = trimmed.split(/\s+/);
      return words.filter((word) => word.length > 0).length;
    }
  }

  /**
   * 行数をカウント
   *
   * @param text - カウント対象のテキスト
   * @returns 行数
   */
  static countLines(text: string): number {
    if (text.length === 0) return 0;
    return text.split("\n").length;
  }

  /**
   * 文字数をカウント
   *
   * @param text - カウント対象のテキスト
   * @returns 文字数
   */
  static countChars(text: string): number {
    return text.length;
  }

  // ========================================
  // ヘルパーメソッド
  // ========================================

  /**
   * コードブロックを除去
   *
   * メタデータ抽出時にコードブロックを除外したい場合に使用。
   *
   * @param text - 処理対象のテキスト
   * @returns コードブロックを除去したテキスト
   */
  static removeCodeBlocks(text: string): string {
    return text.replace(this.CODE_BLOCK_PATTERN, "").trim();
  }

  /**
   * インラインコードを除去
   *
   * @param text - 処理対象のテキスト
   * @returns インラインコードを除去したテキスト
   */
  static removeInlineCode(text: string): string {
    return text.replace(this.INLINE_CODE_PATTERN, "").trim();
  }

  /**
   * Markdown記法を除去（見出しのみ）
   *
   * @param text - 処理対象のテキスト
   * @returns 見出し記号を除去したテキスト
   */
  static stripHeadingMarkers(text: string): string {
    return text.replace(/^#{1,6}\s+/gm, "");
  }
}
