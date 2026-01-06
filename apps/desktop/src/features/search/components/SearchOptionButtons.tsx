/**
 * SearchOptionButtons - 検索オプションボタン群
 *
 * 大文字小文字区別、単語単位、正規表現のトグルボタンを提供
 * WCAG 2.1 AA準拠
 */

import React from "react";

export interface SearchOptionButtonsProps {
  /** 大文字小文字を区別 */
  caseSensitive: boolean;
  /** 大文字小文字を区別の変更コールバック */
  onCaseSensitiveChange: (value: boolean) => void;
  /** 単語単位 */
  wholeWord: boolean;
  /** 単語単位の変更コールバック */
  onWholeWordChange: (value: boolean) => void;
  /** 正規表現 */
  regex: boolean;
  /** 正規表現の変更コールバック */
  onRegexChange: (value: boolean) => void;
}

/**
 * オプションボタンの基本スタイル
 */
const baseButtonClass =
  "p-1.5 rounded text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

/**
 * アクティブ状態のスタイル
 */
const activeClass = "bg-blue-600 text-white";

/**
 * 非アクティブ状態のスタイル
 */
const inactiveClass = "hover:bg-zinc-700";

/**
 * 検索オプションボタンコンポーネント
 */
export function SearchOptionButtons({
  caseSensitive,
  onCaseSensitiveChange,
  wholeWord,
  onWholeWordChange,
  regex,
  onRegexChange,
}: SearchOptionButtonsProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => onCaseSensitiveChange(!caseSensitive)}
        aria-label="大文字小文字を区別"
        aria-pressed={caseSensitive}
        title="大文字小文字を区別 (Aa)"
        className={`${baseButtonClass} ${caseSensitive ? activeClass : inactiveClass}`}
      >
        <span className="text-sm font-mono">Aa</span>
      </button>

      <button
        type="button"
        onClick={() => onWholeWordChange(!wholeWord)}
        aria-label="単語単位"
        aria-pressed={wholeWord}
        title="単語単位 (ab)"
        className={`${baseButtonClass} ${wholeWord ? activeClass : inactiveClass}`}
      >
        <span className="text-sm font-mono">[ab]</span>
      </button>

      <button
        type="button"
        onClick={() => onRegexChange(!regex)}
        aria-label="正規表現"
        aria-pressed={regex}
        title="正規表現 (.*)"
        className={`${baseButtonClass} ${regex ? activeClass : inactiveClass}`}
      >
        <span className="text-sm font-mono">.*</span>
      </button>
    </>
  );
}
