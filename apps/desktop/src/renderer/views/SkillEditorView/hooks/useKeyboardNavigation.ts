/**
 * useKeyboardNavigation - WAI-ARIA Tree Pattern 1.2 準拠キーボードナビゲーション
 *
 * UT-UI-05A-001: FileTree キーボードナビゲーション
 *
 * Roving tabIndex パターンで以下のキーをサポート:
 * - ArrowDown: 次の可視ノードへ移動
 * - ArrowUp: 前の可視ノードへ移動
 * - ArrowRight: ディレクトリ展開 / ファイル選択
 * - ArrowLeft: ディレクトリ折りたたみ / 親ノードへ移動
 * - Enter / Space: ノード選択
 * - Home: 最初のノードへ
 * - End: 最後のノードへ
 * - Escape: フォーカス解放
 *
 * @module SkillEditorView/hooks/useKeyboardNavigation
 */

import { useState, useCallback } from "react";

export interface FlatNode {
  path: string;
  name: string;
  type: "file" | "directory";
  depth: number;
  isExpanded?: boolean;
  parentPath?: string;
}

interface UseKeyboardNavigationOptions {
  flatNodes: FlatNode[];
  onSelect: (path: string) => void;
  onToggleExpand: (path: string) => void;
}

interface UseKeyboardNavigationResult {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  moveFocus: (direction: "up" | "down" | "home" | "end") => void;
  handleKeyDown: (e: KeyboardEvent) => void;
}

export const useKeyboardNavigation = (
  options: UseKeyboardNavigationOptions,
): UseKeyboardNavigationResult => {
  const { flatNodes, onSelect, onToggleExpand } = options;
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const moveFocus = useCallback(
    (direction: "up" | "down" | "home" | "end") => {
      setFocusedIndex((prev) => {
        const maxIndex = flatNodes.length - 1;
        if (maxIndex < 0) return -1;

        switch (direction) {
          case "down":
            return prev < 0 ? 0 : Math.min(prev + 1, maxIndex);
          case "up":
            return prev <= 0 ? 0 : prev - 1;
          case "home":
            return 0;
          case "end":
            return maxIndex;
          default:
            return prev;
        }
      });
    },
    [flatNodes.length],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const currentNode = focusedIndex >= 0 ? flatNodes[focusedIndex] : null;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          moveFocus("down");
          break;

        case "ArrowUp":
          e.preventDefault();
          moveFocus("up");
          break;

        case "ArrowRight":
          e.preventDefault();
          if (currentNode) {
            if (currentNode.type === "directory" && !currentNode.isExpanded) {
              onToggleExpand(currentNode.path);
            } else if (currentNode.type === "file") {
              onSelect(currentNode.path);
            } else if (
              currentNode.type === "directory" &&
              currentNode.isExpanded
            ) {
              // Move to first child
              moveFocus("down");
            }
          }
          break;

        case "ArrowLeft":
          e.preventDefault();
          if (currentNode) {
            if (currentNode.type === "directory" && currentNode.isExpanded) {
              onToggleExpand(currentNode.path);
            } else if (currentNode.parentPath) {
              // Move to parent
              const parentIndex = flatNodes.findIndex(
                (n) => n.path === currentNode.parentPath,
              );
              if (parentIndex >= 0) {
                setFocusedIndex(parentIndex);
              }
            }
          }
          break;

        case "Enter":
        case " ":
          e.preventDefault();
          if (currentNode) {
            onSelect(currentNode.path);
          }
          break;

        case "Home":
          e.preventDefault();
          moveFocus("home");
          break;

        case "End":
          e.preventDefault();
          moveFocus("end");
          break;

        case "Escape":
          // Blur will be handled by the component
          break;

        default:
          break;
      }
    },
    [focusedIndex, flatNodes, moveFocus, onSelect, onToggleExpand],
  );

  return {
    focusedIndex,
    setFocusedIndex,
    moveFocus,
    handleKeyDown,
  };
};
