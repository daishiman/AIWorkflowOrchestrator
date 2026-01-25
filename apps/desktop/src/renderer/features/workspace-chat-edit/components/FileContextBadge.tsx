/**
 * FileContextBadge コンポーネント
 *
 * ファイルコンテキストをバッジとして表示するコンポーネント
 */

import type { FC, KeyboardEvent, MouseEvent } from "react";
import { memo } from "react";
import type { FileContext } from "../types";
import { cn } from "../../../lib/utils";
import { CloseIcon } from "./common";

export interface FileContextBadgeProps {
  /** ファイルコンテキスト */
  context: FileContext;
  /** 削除時コールバック */
  onRemove?: () => void;
  /** アクティブ状態 */
  isActive?: boolean;
  /** 選択時コールバック */
  onSelect?: () => void;
  /** ツールチップ表示有無（デフォルト: true） */
  showTooltip?: boolean;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * FileContextBadge コンポーネント
 *
 * React.memo で最適化（親の再レンダリング時の不要な更新を防止）
 */
export const FileContextBadge: FC<FileContextBadgeProps> = memo(
  ({
    context,
    onRemove,
    isActive = false,
    onSelect,
    showTooltip = true,
    className,
  }) => {
    const handleRemove = (e: MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onRemove?.();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect?.();
      }
    };

    const handleClick = () => {
      onSelect?.();
    };

    return (
      <div
        role="listitem"
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md",
          "bg-slate-100 dark:bg-slate-800",
          "border border-slate-200 dark:border-slate-700",
          "max-w-[200px] cursor-pointer",
          "hover:bg-slate-200 dark:hover:bg-slate-700",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          isActive && "ring-2 ring-blue-500",
          className,
        )}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-selected={isActive}
      >
        {/* ファイルアイコン */}
        <svg
          className="w-4 h-4 flex-shrink-0 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>

        {/* ファイル名 */}
        <span
          className="truncate text-sm text-slate-700 dark:text-slate-300"
          title={showTooltip ? context.filePath : undefined}
        >
          {context.fileName}
        </span>

        {/* 削除ボタン */}
        {onRemove && (
          <button
            type="button"
            className={cn(
              "flex-shrink-0 p-0.5 rounded",
              "hover:bg-slate-300 dark:hover:bg-slate-600",
              "focus:outline-none focus:ring-1 focus:ring-blue-500",
            )}
            onClick={handleRemove}
            aria-label={`${context.fileName}を削除`}
          >
            <CloseIcon
              size="sm"
              className="text-slate-500 hover:text-red-500"
            />
          </button>
        )}
      </div>
    );
  },
);

FileContextBadge.displayName = "FileContextBadge";

export default FileContextBadge;
