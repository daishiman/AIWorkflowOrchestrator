/**
 * FileContextBadge - 添付ファイルコンテキストのバッジ表示
 *
 * @description 添付されたファイルを表示し、削除機能を提供するコンポーネント
 */

import React, { memo, useCallback } from "react";
import type { FileContext } from "@/renderer/features/workspace-chat-edit/types";

/**
 * 言語アイコンマッピング
 */
const languageIcons: Record<string, string> = {
  typescript: "TS",
  javascript: "JS",
  python: "PY",
  rust: "RS",
  go: "GO",
  java: "JV",
  markdown: "MD",
  json: "{}",
  html: "<>",
  css: "#",
  plaintext: "TXT",
};

/**
 * ファイルサイズをフォーマット
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * FileContextBadge Props
 */
interface FileContextBadgeProps {
  /** ファイルコンテキスト */
  context: FileContext;
  /** 削除ハンドラ */
  onRemove: (id: string) => void;
  /** アクティブ状態 */
  isActive?: boolean;
  /** クリックハンドラ */
  onClick?: (id: string) => void;
  /** コンパクト表示 */
  compact?: boolean;
}

/**
 * FileContextBadge コンポーネント
 */
export const FileContextBadge: React.FC<FileContextBadgeProps> = memo(
  ({ context, onRemove, isActive = false, onClick, compact = false }) => {
    const lineCount = context.content.split("\n").length;
    const langIcon = languageIcons[context.language] || "?";

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove(context.id);
      },
      [context.id, onRemove],
    );

    const handleClick = useCallback(() => {
      onClick?.(context.id);
    }, [context.id, onClick]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(context.id);
        } else if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          onRemove(context.id);
        }
      },
      [context.id, onClick, onRemove],
    );

    return (
      <div
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full
          transition-colors duration-150 cursor-pointer
          ${
            isActive
              ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700"
              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          }
          border border-transparent
        `}
        role="listitem"
        aria-label={`添付ファイル: ${context.fileName}`}
        aria-selected={isActive}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* 言語アイコン */}
        <span
          className="
            text-xs font-mono font-bold px-1.5 py-0.5 rounded
            bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300
          "
          aria-hidden="true"
        >
          {langIcon}
        </span>

        {/* ファイル名 */}
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
          {context.fileName}
        </span>

        {/* 選択範囲の表示 */}
        {context.selection && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            L{context.selection.startLine}-{context.selection.endLine}
          </span>
        )}

        {/* ファイル情報（コンパクトモードでは非表示） */}
        {!compact && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {lineCount} lines • {formatFileSize(context.fileSize)}
          </span>
        )}

        {/* 削除ボタン */}
        <button
          type="button"
          onClick={handleRemove}
          className="
            ml-1 p-0.5 rounded-full
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
            hover:bg-gray-300 dark:hover:bg-gray-500
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          aria-label={`${context.fileName}を削除`}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    );
  },
);

FileContextBadge.displayName = "FileContextBadge";

export default FileContextBadge;
