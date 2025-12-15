/**
 * SearchErrorMessage - 検索エラーメッセージ
 *
 * 検索/置換操作でエラーが発生した際に表示するエラーメッセージコンポーネント
 */

import React from "react";
import clsx from "clsx";

export interface SearchErrorMessageProps {
  /** エラーメッセージ */
  message: string | null;
  /** カスタムクラス名 */
  className?: string;
}

export const SearchErrorMessage: React.FC<SearchErrorMessageProps> = ({
  message,
  className,
}) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={clsx(
        "px-3 py-1.5",
        "bg-red-900/50 border border-red-700 rounded",
        "text-xs text-red-400",
        className,
      )}
    >
      {message}
    </div>
  );
};

SearchErrorMessage.displayName = "SearchErrorMessage";
