/**
 * ReplaceService - ファイル置換オーケストレーション
 *
 * 機能:
 * - 単一マッチの置換
 * - 複数マッチの一括置換
 * - 正規表現キャプチャグループの展開
 * - 大文字/小文字パターンの保持
 * - プレビュー生成
 */

import type { SearchMatch, SearchOptions } from "../search/types";
import type { ReplaceOptions } from "@repo/shared/types/replace";
import { CaptureExpander } from "./CaptureExpander";
import { PreserveCaseTransformer } from "./PreserveCaseTransformer";

export interface Replacement {
  line: number;
  column: number;
  originalText: string;
  newText: string;
}

export interface ReplaceResult {
  newContent: string;
  replacements: Replacement[];
}

export interface ReplaceDiff {
  removed: {
    text: string;
    start: number;
    end: number;
  };
  added: {
    text: string;
    start: number;
    end: number;
  };
}

export interface ReplacePreview {
  beforeText: string;
  afterText: string;
  diff: ReplaceDiff;
}

export class ReplaceService {
  private captureExpander: CaptureExpander;
  private caseTransformer: PreserveCaseTransformer;

  constructor() {
    this.captureExpander = new CaptureExpander();
    this.caseTransformer = new PreserveCaseTransformer();
  }

  /**
   * 単一マッチを置換
   */
  replaceSingle(
    content: string,
    match: SearchMatch,
    replacement: string,
    searchOptions: SearchOptions,
    replaceOptions: ReplaceOptions,
  ): ReplaceResult {
    const lines = content.split("\n");
    const lineIndex = match.line - 1;

    // 行番号の検証
    if (lineIndex < 0 || lineIndex >= lines.length) {
      throw new Error(
        `Invalid line number: ${match.line} (content has ${lines.length} lines)`,
      );
    }

    const lineText = lines[lineIndex];
    const columnIndex = match.column - 1;

    // 列番号の検証
    if (columnIndex < 0 || columnIndex >= lineText.length) {
      throw new Error(
        `Invalid column position: ${match.column} (line has ${lineText.length} characters)`,
      );
    }

    // 置換テキストを計算
    let finalReplacement = replacement;

    // 正規表現キャプチャグループの展開
    if (searchOptions.useRegex && searchOptions.pattern) {
      const pattern = new RegExp(searchOptions.pattern);
      finalReplacement = this.captureExpander.expand(
        match.text,
        pattern,
        replacement,
      );
    } else if (searchOptions.useRegex) {
      // パターンがない場合は $0 のみ処理
      finalReplacement = replacement.replace(/\$0/g, match.text);
    }

    // $$ を $ に変換（正規表現でない場合）
    if (!searchOptions.useRegex) {
      finalReplacement = replacement.replace(/\$\$/g, "$");
    }

    // 大文字/小文字パターンの保持
    if (replaceOptions.preserveCase) {
      finalReplacement = this.caseTransformer.transform(
        match.text,
        finalReplacement,
      );
    }

    // 行内で置換を実行
    const before = lineText.substring(0, columnIndex);
    const after = lineText.substring(columnIndex + match.length);
    lines[lineIndex] = before + finalReplacement + after;

    return {
      newContent: lines.join("\n"),
      replacements: [
        {
          line: match.line,
          column: match.column,
          originalText: match.text,
          newText: finalReplacement,
        },
      ],
    };
  }

  /**
   * 複数マッチを一括置換
   */
  replaceMatches(
    content: string,
    matches: SearchMatch[],
    replacement: string,
    searchOptions: SearchOptions,
    replaceOptions: ReplaceOptions,
  ): ReplaceResult {
    if (matches.length === 0) {
      return {
        newContent: content,
        replacements: [],
      };
    }

    // 後ろから置換して位置のズレを防ぐ
    const sortedMatches = [...matches].sort((a, b) => {
      if (a.line !== b.line) {
        return b.line - a.line;
      }
      return b.column - a.column;
    });

    const replacements: Replacement[] = [];
    let currentContent = content;

    for (const match of sortedMatches) {
      const result = this.replaceSingle(
        currentContent,
        match,
        replacement,
        searchOptions,
        replaceOptions,
      );
      currentContent = result.newContent;
      replacements.unshift(...result.replacements);
    }

    return {
      newContent: currentContent,
      replacements,
    };
  }

  /**
   * 置換プレビューを生成
   */
  generatePreview(
    lineText: string,
    match: SearchMatch,
    replacement: string,
    searchOptions: SearchOptions,
    replaceOptions: ReplaceOptions,
  ): ReplacePreview {
    // 単一行コンテンツとして置換を実行
    const singleLineMatch: SearchMatch = {
      ...match,
      line: 1,
    };

    const result = this.replaceSingle(
      lineText,
      singleLineMatch,
      replacement,
      searchOptions,
      replaceOptions,
    );

    const columnIndex = match.column - 1;
    const replacementInfo = result.replacements[0];

    return {
      beforeText: lineText,
      afterText: result.newContent,
      diff: {
        removed: {
          text: match.text,
          start: columnIndex,
          end: columnIndex + match.length,
        },
        added: {
          text: replacementInfo.newText,
          start: columnIndex,
          end: columnIndex + replacementInfo.newText.length,
        },
      },
    };
  }
}
