/**
 * SelectedFilesPanel コンポーネント
 *
 * 選択されたファイルのリスト表示パネル。
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import React from "react";
import clsx from "clsx";
import { Icon } from "../../atoms/Icon";
import type { SelectedFilesPanelProps } from "./types";

/**
 * 選択ファイルパネル
 */
export const SelectedFilesPanel: React.FC<SelectedFilesPanelProps> = ({
  selectedFiles,
  onRemove,
  onClearAll,
}) => {
  return (
    <div
      role="region"
      aria-label="選択されたファイル"
      className="flex flex-col h-full min-h-0"
    >
      <div className="shrink-0 flex items-center justify-between px-2 py-2 border-b border-zinc-700">
        <span className="text-sm text-zinc-400">
          {selectedFiles.length > 0
            ? `${selectedFiles.length}件のファイルを選択中`
            : "ファイルを選択してください"}
        </span>
        {selectedFiles.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            すべてクリア
          </button>
        )}
      </div>

      {selectedFiles.length > 0 ? (
        <ul
          role="list"
          className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1"
        >
          {selectedFiles.map((file) => (
            <li
              key={file.path}
              role="listitem"
              className={clsx(
                "flex items-center justify-between gap-2 px-2 py-1.5 rounded",
                "hover:bg-zinc-800 transition-colors",
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon
                  name="file"
                  size={14}
                  className="text-zinc-400 shrink-0"
                />
                <span className="truncate text-sm text-zinc-300">
                  {file.name}
                </span>
              </div>
              <button
                type="button"
                data-testid={`remove-file-${file.name}`}
                aria-label={`${file.name} を削除`}
                onClick={() => onRemove(file.path)}
                className={clsx(
                  "p-1 rounded shrink-0",
                  "text-zinc-500 hover:text-white hover:bg-zinc-700",
                  "transition-colors",
                )}
              >
                <Icon name="x" size={12} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-zinc-500">ファイルを選択してください</p>
        </div>
      )}
    </div>
  );
};

SelectedFilesPanel.displayName = "SelectedFilesPanel";
