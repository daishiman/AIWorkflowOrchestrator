/**
 * 検索実行ユーティリティ
 *
 * Phase 8: SearchPanel.tsxから抽出したリファクタリング
 */

import type { SearchMatch } from "../types";

/**
 * 検索オプション
 */
export interface SearchOptions {
  /** 大文字小文字を区別するか */
  caseSensitive: boolean;
  /** 正規表現モードか */
  regex: boolean;
  /** 単語単位で検索するか */
  wholeWord: boolean;
}

/**
 * 検索結果
 */
export interface SearchResult {
  /** マッチした結果の配列 */
  matches: SearchMatch[];
  /** エラーメッセージ（正規表現エラーなど） */
  error: string | null;
}

/**
 * 検索用の正規表現パターンを生成
 *
 * @param query - 検索クエリ
 * @param options - 検索オプション
 * @returns 正規表現パターン
 * @throws 無効な正規表現の場合
 */
function createSearchPattern(query: string, options: SearchOptions): RegExp {
  const flags = options.caseSensitive ? "g" : "gi";

  if (options.regex) {
    return new RegExp(query, flags);
  }

  // 特殊文字をエスケープ
  let escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (options.wholeWord) {
    escapedQuery = `\\b${escapedQuery}\\b`;
  }

  return new RegExp(escapedQuery, flags);
}

/**
 * 単一行内のマッチを検索
 *
 * @param lineText - 検索対象の行テキスト
 * @param lineNumber - 行番号（1-indexed）
 * @param pattern - 検索パターン
 * @returns マッチ配列
 */
function findMatchesInLine(
  lineText: string,
  lineNumber: number,
  pattern: RegExp,
): SearchMatch[] {
  const matches: SearchMatch[] = [];
  let match: RegExpExecArray | null;

  // lastIndexをリセット
  pattern.lastIndex = 0;

  while ((match = pattern.exec(lineText)) !== null) {
    matches.push({
      line: lineNumber,
      column: match.index + 1,
      length: match[0].length,
      text: match[0],
      lineText,
    });

    // 空マッチの無限ループ防止
    if (match.index === pattern.lastIndex) {
      pattern.lastIndex++;
    }
  }

  return matches;
}

/**
 * コンテンツ内を検索してマッチを取得
 *
 * @param content - 検索対象のコンテンツ
 * @param query - 検索クエリ
 * @param options - 検索オプション
 * @returns 検索結果（マッチ配列とエラー情報）
 */
export function executeSearch(
  content: string,
  query: string,
  options: SearchOptions,
): SearchResult {
  // 空のクエリは空の結果を返す
  if (!query) {
    return { matches: [], error: null };
  }

  try {
    const pattern = createSearchPattern(query, options);
    const lines = content.split("\n");
    const matches: SearchMatch[] = [];

    lines.forEach((lineText, lineIndex) => {
      const lineMatches = findMatchesInLine(lineText, lineIndex + 1, pattern);
      matches.push(...lineMatches);
    });

    return { matches, error: null };
  } catch (e) {
    // 正規表現エラーをキャッチして呼び出し元に伝播
    if (options.regex && e instanceof SyntaxError) {
      return { matches: [], error: "無効な正規表現です" };
    }
    // その他のエラーは空の結果を返す
    return { matches: [], error: null };
  }
}
