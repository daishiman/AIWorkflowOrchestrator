/**
 * FileSearchEngine - 単一ファイル内の検索を担当
 *
 * 機能:
 * - 行番号・列番号付きのマッチ検索
 * - コンテキスト行の取得
 * - 効率的なテキスト処理
 */

import type { SearchMatch, SearchOptions } from "./types";
import { PatternMatcher } from "./PatternMatcher";

/**
 * デフォルトのコンテキスト行数
 */
const DEFAULT_CONTEXT_LINES = 2;

/**
 * ファイル検索エンジン
 */
export class FileSearchEngine {
  /**
   * コンテンツ内を検索
   *
   * @param content - 検索対象のテキスト
   * @param pattern - 検索パターン
   * @param options - 検索オプション
   * @param contextLines - コンテキスト行数
   * @returns マッチ情報の配列
   */
  search(
    content: string,
    pattern: string,
    options: SearchOptions,
    contextLines: number = DEFAULT_CONTEXT_LINES,
  ): SearchMatch[] {
    // 空のコンテンツまたはパターンの場合は空配列を返す
    if (!content || !pattern) {
      return [];
    }

    const matcher = new PatternMatcher(pattern, options);
    if (!matcher.isValid()) {
      return [];
    }

    // 行に分割
    const lines = content.split("\n");

    // 各行の開始位置を計算
    const lineOffsets = this.calculateLineOffsets(lines);

    // マッチを検索
    const rawMatches = matcher.findMatches(content);

    // マッチ情報を構築
    return rawMatches.map((match) => {
      const { line, column } = this.getLineAndColumn(match.index, lineOffsets);
      const lineText = lines[line - 1] || "";

      return {
        line,
        column,
        length: match.text.length,
        text: match.text,
        lineText,
        context: this.getContext(lines, line - 1, contextLines),
      };
    });
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
   * コンテキスト行を取得
   */
  private getContext(
    lines: string[],
    lineIndex: number,
    contextLines: number,
  ): { before: string[]; after: string[] } {
    const beforeStart = Math.max(0, lineIndex - contextLines);
    const afterEnd = Math.min(lines.length, lineIndex + contextLines + 1);

    return {
      before: lines.slice(beforeStart, lineIndex),
      after: lines.slice(lineIndex + 1, afterEnd),
    };
  }
}
