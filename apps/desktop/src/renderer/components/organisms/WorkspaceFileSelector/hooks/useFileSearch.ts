/**
 * useFileSearch フック
 *
 * ファイル検索・フィルタリング機能を提供するカスタムフック。
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import { useState, useCallback } from "react";
import type { FileNode } from "../../../../store/types";

export interface UseFileSearchOptions {
  /** デバウンス時間（ms） */
  debounceMs?: number;
}

export interface UseFileSearchReturn {
  /** 検索クエリ */
  query: string;

  /** クエリ設定 */
  setQuery: (query: string) => void;

  /** クリア */
  clearQuery: () => void;

  /** フィルタリング関数 */
  filterNodes: (nodes: FileNode[]) => FileNode[];
}

/**
 * ノードがクエリにマッチするかどうかを判定
 */
function nodeMatchesQuery(node: FileNode, query: string): boolean {
  return node.name.toLowerCase().includes(query.toLowerCase());
}

/**
 * ファイルツリーを再帰的にフィルタリング
 */
function filterFileTree(nodes: FileNode[], query: string): FileNode[] {
  const result: FileNode[] = [];

  for (const node of nodes) {
    if (node.type === "folder") {
      // フォルダの場合、子孫にマッチするものがあれば含める
      if (node.children && node.children.length > 0) {
        const filteredChildren = filterFileTree(node.children, query);
        if (filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren,
          });
        }
      }
    } else {
      // ファイルの場合、名前がマッチすれば含める
      if (nodeMatchesQuery(node, query)) {
        result.push(node);
      }
    }
  }

  return result;
}

/**
 * ファイル検索フック
 *
 * @example
 * ```tsx
 * const { query, setQuery, clearQuery, filterNodes } = useFileSearch({
 *   debounceMs: 300,
 * });
 *
 * const filteredFiles = filterNodes(fileTree);
 * ```
 */
export function useFileSearch(
  _options: UseFileSearchOptions = {},
): UseFileSearchReturn {
  // Note: debounceMs is reserved for future implementation
  // Debouncing should be handled at the consumer level if needed

  const [query, setQueryState] = useState("");

  const setQuery = useCallback((newQuery: string) => {
    // 即座にクエリを設定（デバウンスは呼び出し元で制御）
    setQueryState(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState("");
  }, []);

  const filterNodes = useCallback(
    (nodes: FileNode[]): FileNode[] => {
      if (!query) {
        return nodes;
      }
      return filterFileTree(nodes, query);
    },
    [query],
  );

  return {
    query,
    setQuery,
    clearQuery,
    filterNodes,
  };
}
