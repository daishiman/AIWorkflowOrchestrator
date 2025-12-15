/**
 * SearchOptionsBar - 検索オプションボタンバー
 *
 * FileSearchPanelとWorkspaceSearchPanelで共通使用される
 * 検索オプション（大文字小文字区別、単語単位、正規表現）のトグルボタン群
 */

import React from "react";
import clsx from "clsx";

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export interface SearchOptionsBarProps {
  /** 現在のオプション状態 */
  options: SearchOptions;
  /** オプション変更時のコールバック */
  onOptionToggle: (option: keyof SearchOptions) => void;
  /** 無効化状態 */
  disabled?: boolean;
  /** カスタムクラス名 */
  className?: string;
}

interface OptionButton {
  key: keyof SearchOptions;
  label: string;
  ariaLabel: string;
  display: string;
}

const OPTION_BUTTONS: OptionButton[] = [
  {
    key: "caseSensitive",
    label: "Case Sensitive",
    ariaLabel: "大文字/小文字を区別 / Case sensitive",
    display: "Aa",
  },
  {
    key: "wholeWord",
    label: "Whole Word",
    ariaLabel: "単語単位で検索 / Whole word",
    display: "Ab",
  },
  {
    key: "useRegex",
    label: "Regex",
    ariaLabel: "正規表現を使用 / Regex",
    display: ".*",
  },
];

export const SearchOptionsBar: React.FC<SearchOptionsBarProps> = ({
  options,
  onOptionToggle,
  disabled = false,
  className,
}) => {
  return (
    <div className={clsx("flex items-center gap-1", className)}>
      {OPTION_BUTTONS.map((button) => {
        const isActive = options[button.key];

        return (
          <button
            key={button.key}
            type="button"
            role="checkbox"
            aria-checked={isActive}
            aria-label={button.ariaLabel}
            onClick={() => onOptionToggle(button.key)}
            disabled={disabled}
            className={clsx(
              "w-7 h-7 flex items-center justify-center rounded",
              "transition-colors duration-150",
              disabled && "opacity-50 cursor-not-allowed",
              isActive
                ? "bg-blue-500 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600",
            )}
          >
            <span className="text-xs font-medium">{button.display}</span>
          </button>
        );
      })}
    </div>
  );
};

SearchOptionsBar.displayName = "SearchOptionsBar";
