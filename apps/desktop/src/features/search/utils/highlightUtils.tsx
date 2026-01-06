/**
 * 検索ハイライト関連ユーティリティ
 */

import React from "react";

/**
 * マッチ部分をハイライト表示
 *
 * @param lineText - 行のテキスト
 * @param matchStart - マッチ開始位置（0-indexed）
 * @param matchLength - マッチの長さ
 * @returns ハイライトされたReactノード
 */
export function highlightMatch(
  lineText: string,
  matchStart: number,
  matchLength: number,
): React.ReactNode {
  const before = lineText.slice(0, matchStart);
  const match = lineText.slice(matchStart, matchStart + matchLength);
  const after = lineText.slice(matchStart + matchLength);

  return (
    <>
      {before}
      <mark className="bg-yellow-200 dark:bg-yellow-800">{match}</mark>
      {after}
    </>
  );
}

/**
 * ハイライト配列を生成
 *
 * @param matches - マッチ配列
 * @param currentIndex - 現在のインデックス
 * @returns ハイライト配列
 */
export function createHighlights(
  matches: Array<{
    line: number;
    column: number;
    length: number;
  }>,
  currentIndex: number,
): Array<{
  line: number;
  column: number;
  length: number;
  isCurrent: boolean;
}> {
  return matches.map((m, i) => ({
    line: m.line,
    column: m.column,
    length: m.length,
    isCurrent: i === currentIndex,
  }));
}
