/**
 * ReplaceEngine - テキスト置換処理を担当
 *
 * 機能:
 * - 単一/全置換
 * - 正規表現キャプチャグループのサポート
 * - 置換位置のトラッキング
 */

import type { ReplaceResult, Replacement, SearchOptions } from "./types";
import { PatternMatcher } from "./PatternMatcher";

/**
 * 置換エンジン
 */
export class ReplaceEngine {
  /**
   * コンテンツ内のパターンを置換
   *
   * @param content - 置換対象のテキスト
   * @param pattern - 検索パターン
   * @param replacement - 置換文字列
   * @param options - 検索オプション
   * @returns 置換結果
   */
  replace(
    content: string,
    pattern: string,
    replacement: string,
    options: SearchOptions,
  ): ReplaceResult {
    // 空のコンテンツまたはパターンの場合
    if (!content || !pattern) {
      return {
        content,
        count: 0,
        replacements: [],
      };
    }

    const matcher = new PatternMatcher(pattern, options);
    if (!matcher.isValid()) {
      return {
        content,
        count: 0,
        replacements: [],
      };
    }

    // 行に分割
    const lines = content.split("\n");

    // 各行の開始位置を計算
    const lineOffsets = this.calculateLineOffsets(lines);

    // マッチを検索
    const rawMatches = matcher.findMatches(content);

    if (rawMatches.length === 0) {
      return {
        content,
        count: 0,
        replacements: [],
      };
    }

    // 置換情報を収集
    const replacements: Replacement[] = rawMatches.map((match) => {
      const { line, column } = this.getLineAndColumn(match.index, lineOffsets);

      // 置換後のテキストを計算（キャプチャグループを考慮）
      const replacedText = this.computeReplacement(
        match.text,
        pattern,
        replacement,
        options,
        match.groups,
      );

      return {
        line,
        column,
        originalText: match.text,
        replacedText,
      };
    });

    // 置換を実行
    const newContent = matcher.replace(content, replacement);

    return {
      content: newContent,
      count: replacements.length,
      replacements,
    };
  }

  /**
   * 各行の開始位置を計算
   */
  private calculateLineOffsets(lines: string[]): number[] {
    const offsets: number[] = [];
    let offset = 0;

    for (const line of lines) {
      offsets.push(offset);
      offset += line.length + 1; // +1 for newline
    }

    return offsets;
  }

  /**
   * オフセットから行番号と列番号を取得
   */
  private getLineAndColumn(
    offset: number,
    lineOffsets: number[],
  ): { line: number; column: number } {
    let lineIndex = 0;

    for (let i = 0; i < lineOffsets.length; i++) {
      if (lineOffsets[i] > offset) {
        break;
      }
      lineIndex = i;
    }

    const column = offset - lineOffsets[lineIndex] + 1; // 1-indexed

    return {
      line: lineIndex + 1, // 1-indexed
      column,
    };
  }

  /**
   * 置換文字列を計算（キャプチャグループを展開）
   */
  private computeReplacement(
    matchedText: string,
    pattern: string,
    replacement: string,
    options: SearchOptions,
    _groups?: Record<string, string>,
  ): string {
    if (!options.regex) {
      return replacement;
    }

    // 正規表現の場合、キャプチャグループを展開
    try {
      const flags = options.caseSensitive ? "" : "i";
      const regex = new RegExp(pattern, flags);
      return matchedText.replace(regex, replacement);
    } catch {
      return replacement;
    }
  }
}
