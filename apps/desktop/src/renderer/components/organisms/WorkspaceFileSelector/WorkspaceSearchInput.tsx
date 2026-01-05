/**
 * WorkspaceSearchInput コンポーネント
 *
 * ファイル検索入力フィールド。
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import React, { useCallback } from "react";
import clsx from "clsx";
import { Icon } from "../../atoms/Icon";
import type { WorkspaceSearchInputProps } from "./types";

/**
 * ワークスペースファイル検索入力
 */
export const WorkspaceSearchInput: React.FC<WorkspaceSearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "ファイルを検索...",
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape" && value) {
        e.preventDefault();
        onClear();
      }
    },
    [value, onClear],
  );

  return (
    <div className="relative w-full">
      <div
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-label="検索アイコン"
      >
        <Icon name="search" size={16} className="text-zinc-400" />
      </div>
      <input
        type="text"
        role="searchbox"
        aria-label="ファイル検索"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={clsx(
          "w-full pl-10 pr-10 py-2 rounded-md",
          "bg-zinc-800 border border-zinc-700",
          "text-white placeholder-zinc-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "transition-colors duration-150",
        )}
      />
      {value && (
        <button
          type="button"
          aria-label="検索をクリア"
          onClick={onClear}
          className={clsx(
            "absolute right-3 top-1/2 -translate-y-1/2",
            "p-1 rounded-sm",
            "text-zinc-400 hover:text-white",
            "transition-colors duration-150",
          )}
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
};

WorkspaceSearchInput.displayName = "WorkspaceSearchInput";
