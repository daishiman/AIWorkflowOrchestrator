/**
 * CopyHistoryPanel - コピー履歴表示パネル
 *
 * TASK-3-2-D: コピー履歴機能
 *
 * @module @repo/desktop/renderer/components/AgentView/CopyHistoryPanel
 */

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useCopyHistory } from "../../hooks/useCopyHistory";
import { formatRelativeTime } from "../../utils/formatTime";
import type { CopyHistoryEntry } from "../../contexts/CopyHistoryContext";

/** プレビュー表示文字数 */
const PREVIEW_LENGTH = 100;

/** コピーフィードバック表示時間（ミリ秒） */
const COPY_FEEDBACK_MS = 2000;

/**
 * テキストを省略表示用にフォーマット
 */
function formatPreview(content: string): string {
  // 改行を空白に置換
  const normalized = content.replace(/\n/g, " ");
  if (normalized.length > PREVIEW_LENGTH) {
    return normalized.slice(0, PREVIEW_LENGTH) + "...";
  }
  return normalized;
}

/**
 * CopyHistoryPanel Props
 */
export interface CopyHistoryPanelProps {
  /** パネルの開閉状態 */
  isOpen: boolean;
  /** 閉じるコールバック */
  onClose: () => void;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * CopyHistoryItem Props
 */
interface CopyHistoryItemProps {
  item: CopyHistoryEntry;
  isSelected: boolean;
  onToggleSelect: () => void;
  onCopy: () => void;
  copiedId: string | null;
}

/**
 * CopyHistoryItem - 単一履歴項目コンポーネント
 */
const CopyHistoryItem = React.memo(function CopyHistoryItem({
  item,
  isSelected,
  onToggleSelect,
  onCopy,
  copiedId,
}: CopyHistoryItemProps) {
  const isCopied = copiedId === item.id;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onCopy();
    } else if (e.key === " ") {
      e.preventDefault();
      onToggleSelect();
    }
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`p-2 flex items-center gap-2 cursor-pointer transition-colors duration-100 ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/30"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {/* チェックボックス */}
      <input
        type="checkbox"
        role="checkbox"
        aria-checked={isSelected}
        checked={isSelected}
        onChange={onToggleSelect}
        className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
        onClick={(e) => e.stopPropagation()}
      />

      {/* プレビュー */}
      <span
        className="flex-1 text-sm text-gray-600 dark:text-gray-300 truncate"
        title={item.content}
      >
        {formatPreview(item.content)}
      </span>

      {/* タイムスタンプ */}
      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
        {formatRelativeTime(item.timestamp)}
      </span>

      {/* コピーボタン */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        aria-label="この項目をコピー"
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
      >
        <svg
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* コピーフィードバック */}
      {isCopied && (
        <span
          className="text-xs text-green-500"
          role="status"
          aria-live="polite"
        >
          コピーしました
        </span>
      )}
    </div>
  );
});

/**
 * CopyHistoryPanel - コピー履歴表示パネル
 */
export function CopyHistoryPanel({
  isOpen,
  onClose,
  className = "",
}: CopyHistoryPanelProps) {
  const {
    history,
    selectedIds,
    historyCount,
    selectedCount,
    copyFromHistory,
    copySelectedItems,
    clearHistory,
    toggleSelection,
  } = useCopyHistory();

  const panelRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 個別コピー処理
  const handleCopyItem = useCallback(
    async (id: string) => {
      await copyFromHistory(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), COPY_FEEDBACK_MS);
    },
    [copyFromHistory],
  );

  // 一括コピー処理
  const handleCopySelected = useCallback(async () => {
    await copySelectedItems();
    setCopiedId("selected");
    setTimeout(() => setCopiedId(null), COPY_FEEDBACK_MS);
  }, [copySelectedItems]);

  // Escapeキーでパネルを閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // パネル外クリックで閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // 少し遅延を入れてクリックイベントを登録（開くボタンのクリックを無視するため）
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="コピー履歴"
      aria-modal="true"
      className={`absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-80 border border-gray-200 dark:border-gray-700 ${className}`}
      style={{
        animation: "panelEnter 150ms ease-out",
      }}
    >
      {/* ヘッダー */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          コピー履歴 ({historyCount}件)
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="パネルを閉じる"
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <svg
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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

      {/* 履歴リスト */}
      <div
        role="listbox"
        aria-multiselectable="true"
        className="max-h-64 overflow-y-auto"
      >
        {history.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <svg
              className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p>履歴がありません</p>
            <p className="text-sm mt-1">
              メッセージをコピーすると
              <br />
              ここに表示されます
            </p>
          </div>
        ) : (
          history.map((item) => (
            <CopyHistoryItem
              key={item.id}
              item={item}
              isSelected={selectedIds.has(item.id)}
              onToggleSelect={() => toggleSelection(item.id)}
              onCopy={() => handleCopyItem(item.id)}
              copiedId={copiedId}
            />
          ))
        )}
      </div>

      {/* アクションバー */}
      <div className="flex justify-between items-center p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleCopySelected}
          disabled={selectedCount === 0}
          aria-label="選択項目をコピー"
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
        >
          選択をコピー{selectedCount > 0 && ` (${selectedCount}件)`}
          {copiedId === "selected" && (
            <span className="ml-1 text-green-200">完了</span>
          )}
        </button>
        <button
          type="button"
          onClick={clearHistory}
          disabled={historyCount === 0}
          aria-label="履歴をクリア"
          className="px-3 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          クリア
        </button>
      </div>

      {/* アニメーション用CSS */}
      <style>{`
        @keyframes panelEnter {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * CopyHistoryToggle - 履歴パネル開閉トグルボタン
 */
export interface CopyHistoryToggleProps {
  /** パネルの開閉状態 */
  isOpen: boolean;
  /** トグルコールバック */
  onToggle: () => void;
  /** 履歴件数 */
  historyCount: number;
}

export function CopyHistoryToggle({
  isOpen,
  onToggle,
  historyCount,
}: CopyHistoryToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="コピー履歴を開く"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      className={`relative p-1 rounded transition-colors ${
        isOpen
          ? "bg-gray-200 dark:bg-gray-600"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <svg
        className="h-5 w-5 text-gray-500 dark:text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      {historyCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {historyCount > 9 ? "9+" : historyCount}
        </span>
      )}
    </button>
  );
}

export default CopyHistoryPanel;
