/**
 * SearchInputField - 検索入力フィールド
 *
 * FileSearchPanelとWorkspaceSearchPanelで共通使用される
 * スタイル付き検索/置換入力フィールド
 */

import React, { forwardRef } from "react";
import clsx from "clsx";

export interface SearchInputFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  /** 入力値 */
  value: string;
  /** 値変更時のコールバック */
  onChange: (value: string) => void;
  /** エラー状態 */
  hasError?: boolean;
  /** IME変換開始時のコールバック */
  onCompositionStart?: () => void;
  /** IME変換終了時のコールバック */
  onCompositionEnd?: () => void;
}

export const SearchInputField = forwardRef<
  HTMLInputElement,
  SearchInputFieldProps
>(
  (
    {
      value,
      onChange,
      hasError = false,
      onCompositionStart,
      onCompositionEnd,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        className={clsx(
          "flex-1 min-w-0 px-3 py-1.5 h-8",
          "bg-slate-900 rounded-md",
          "text-sm text-white placeholder-slate-400",
          "border transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          hasError ? "border-red-500" : "border-slate-600",
          className,
        )}
        {...props}
      />
    );
  },
);

SearchInputField.displayName = "SearchInputField";
