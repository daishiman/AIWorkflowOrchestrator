/**
 * CopyHistoryContext - コピー履歴のグローバル状態管理
 *
 * TASK-3-2-D: コピー履歴機能
 *
 * @module @repo/desktop/renderer/contexts/CopyHistoryContext
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

/** 最大履歴件数 */
const MAX_HISTORY_SIZE = 50;

/**
 * 履歴エントリの型定義
 */
export interface CopyHistoryEntry {
  /** ユニークID */
  id: string;
  /** コピーした内容 */
  content: string;
  /** コピー日時（UNIXミリ秒） */
  timestamp: number;
  /** 元メッセージID（オプション） */
  sourceMessageId?: string;
}

/**
 * Context の値の型定義
 */
export interface CopyHistoryContextValue {
  // State
  /** 履歴項目配列（新しい順） */
  history: CopyHistoryEntry[];
  /** 選択中の項目ID集合 */
  selectedIds: Set<string>;

  // Computed
  /** 履歴件数 */
  historyCount: number;
  /** 選択件数 */
  selectedCount: number;

  // Actions
  /** 履歴に追加 */
  addToHistory: (content: string, sourceMessageId?: string) => void;
  /** 履歴から削除 */
  removeFromHistory: (id: string) => void;
  /** 全履歴クリア */
  clearHistory: () => void;
  /** 履歴項目をコピー */
  copyFromHistory: (id: string) => Promise<void>;
  /** 選択項目を一括コピー */
  copySelectedItems: () => Promise<void>;
  /** 選択状態をトグル */
  toggleSelection: (id: string) => void;
  /** 全選択解除 */
  clearSelection: () => void;
  /** 全選択 */
  selectAll: () => void;
}

/**
 * Context の作成（デフォルト値は undefined）
 */
const CopyHistoryContext = createContext<CopyHistoryContextValue | undefined>(
  undefined,
);

/**
 * Provider Props
 */
interface CopyHistoryProviderProps {
  children: ReactNode;
}

/**
 * CopyHistoryProvider - 履歴状態を提供するProvider
 */
export function CopyHistoryProvider({ children }: CopyHistoryProviderProps) {
  // State
  const [history, setHistory] = useState<CopyHistoryEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Actions
  const addToHistory = useCallback(
    (content: string, sourceMessageId?: string) => {
      const newEntry: CopyHistoryEntry = {
        id: crypto.randomUUID(),
        content,
        timestamp: Date.now(),
        sourceMessageId,
      };

      setHistory((prev) => {
        const newHistory = [newEntry, ...prev];
        // 50件を超えた場合は古いものを削除
        if (newHistory.length > MAX_HISTORY_SIZE) {
          return newHistory.slice(0, MAX_HISTORY_SIZE);
        }
        return newHistory;
      });
    },
    [],
  );

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    // 選択状態も削除
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setSelectedIds(new Set());
  }, []);

  const copyFromHistory = useCallback(
    async (id: string) => {
      const entry = history.find((item) => item.id === id);
      if (entry && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(entry.content);
        } catch (error) {
          console.error("Failed to copy from history:", error);
        }
      }
    },
    [history],
  );

  const copySelectedItems = useCallback(async () => {
    // 履歴の順序で選択項目を取得
    const selectedItems = history.filter((item) => selectedIds.has(item.id));
    if (selectedItems.length > 0 && navigator.clipboard) {
      const combinedContent = selectedItems
        .map((item) => item.content)
        .join("\n");
      try {
        await navigator.clipboard.writeText(combinedContent);
        // コピー成功後、選択状態をクリア
        setSelectedIds(new Set());
      } catch (error) {
        console.error("Failed to copy selected items:", error);
      }
    }
  }, [history, selectedIds]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(history.map((item) => item.id)));
  }, [history]);

  // Context値（useMemoでメモ化）
  const value = useMemo<CopyHistoryContextValue>(
    () => ({
      history,
      selectedIds,
      historyCount: history.length,
      selectedCount: selectedIds.size,
      addToHistory,
      removeFromHistory,
      clearHistory,
      copyFromHistory,
      copySelectedItems,
      toggleSelection,
      clearSelection,
      selectAll,
    }),
    [
      history,
      selectedIds,
      addToHistory,
      removeFromHistory,
      clearHistory,
      copyFromHistory,
      copySelectedItems,
      toggleSelection,
      clearSelection,
      selectAll,
    ],
  );

  return (
    <CopyHistoryContext.Provider value={value}>
      {children}
    </CopyHistoryContext.Provider>
  );
}

/**
 * Context を使用するためのフック
 * @throws Context外で使用された場合にエラー
 */
export function useCopyHistoryContext(): CopyHistoryContextValue {
  const context = useContext(CopyHistoryContext);
  if (!context) {
    throw new Error(
      "useCopyHistoryContext must be used within CopyHistoryProvider",
    );
  }
  return context;
}

export { CopyHistoryContext };
