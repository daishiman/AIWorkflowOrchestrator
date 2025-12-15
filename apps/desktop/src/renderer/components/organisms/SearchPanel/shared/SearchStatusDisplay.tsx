/**
 * SearchStatusDisplay - 検索ステータス表示
 *
 * 検索中のローディング表示、結果件数、エラー状態を表示するコンポーネント
 */

import React from "react";
import clsx from "clsx";
import { Icon } from "../../../atoms/Icon";

export interface SearchStatusDisplayProps {
  /** 検索中かどうか */
  isLoading: boolean;
  /** 検索を実行したかどうか */
  hasSearched: boolean;
  /** 結果があるかどうか */
  hasResults: boolean;
  /** 現在のインデックス（ファイル内検索用） */
  currentIndex?: number;
  /** 合計件数 */
  totalCount: number;
  /** 表示形式: "counter"は「1/10」形式、"count"は「10件」形式 */
  displayFormat?: "counter" | "count";
  /** カスタムクラス名 */
  className?: string;
}

export const SearchStatusDisplay: React.FC<SearchStatusDisplayProps> = ({
  isLoading,
  hasSearched,
  hasResults,
  currentIndex,
  totalCount,
  displayFormat = "counter",
  className,
}) => {
  // ローディング中
  if (isLoading) {
    return (
      <div
        role="progressbar"
        aria-label="検索中"
        className={clsx("flex items-center justify-center", className)}
      >
        <Icon name="loader-2" size={16} spin className="text-blue-400" />
      </div>
    );
  }

  // 検索未実行
  if (!hasSearched) {
    return (
      <span
        role="status"
        aria-live="polite"
        className={clsx("text-xs text-slate-500", className)}
      />
    );
  }

  // 検索結果表示
  const displayText = hasResults
    ? displayFormat === "counter" && currentIndex !== undefined
      ? `${currentIndex + 1} / ${totalCount}`
      : `${totalCount} 件`
    : "結果なし / 0件";

  return (
    <span
      role="status"
      aria-live="polite"
      className={clsx(
        "text-xs tabular-nums",
        hasResults ? "text-slate-400" : "text-slate-500",
        className,
      )}
    >
      {displayText}
    </span>
  );
};

SearchStatusDisplay.displayName = "SearchStatusDisplay";
