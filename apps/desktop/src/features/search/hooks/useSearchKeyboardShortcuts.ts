/**
 * キーボードショートカットフック
 *
 * グローバルなキーボードショートカットを管理
 * - Cmd/Ctrl+F: ファイル内検索パネルを開く
 * - Cmd/Ctrl+Shift+F: ワークスペース検索パネルを開く
 * - Cmd/Ctrl+H: 置換モードをトグル
 */

import { useEffect, useCallback } from "react";
import { useSearchStore } from "../stores/useSearchStore";

interface UseSearchKeyboardShortcutsOptions {
  enabled?: boolean;
}

export function useSearchKeyboardShortcuts(
  options: UseSearchKeyboardShortcutsOptions = {},
) {
  const { enabled = true } = options;

  const {
    openSearchPanel,
    openWorkspaceSearchPanel,
    toggleReplaceMode,
    isSearchPanelOpen,
    isWorkspaceSearchPanelOpen,
  } = useSearchStore();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Cmd/Ctrl キーが押されているか
      const isMod = event.metaKey || event.ctrlKey;

      if (!isMod) return;

      // Cmd/Ctrl+Shift+F: ワークスペース検索
      if (event.key === "f" && event.shiftKey) {
        event.preventDefault();
        openWorkspaceSearchPanel();
        return;
      }

      // Cmd/Ctrl+F: ファイル内検索
      if (event.key === "f" && !event.shiftKey) {
        event.preventDefault();
        openSearchPanel();
        return;
      }

      // Cmd/Ctrl+H: 置換モードトグル
      if (event.key === "h") {
        event.preventDefault();
        if (isSearchPanelOpen || isWorkspaceSearchPanelOpen) {
          toggleReplaceMode();
        } else {
          // 検索パネルを開いてから置換モードを有効化
          openSearchPanel();
          // 少し遅延させて置換モードを有効化
          setTimeout(() => {
            toggleReplaceMode();
          }, 0);
        }
        return;
      }
    },
    [
      openSearchPanel,
      openWorkspaceSearchPanel,
      toggleReplaceMode,
      isSearchPanelOpen,
      isWorkspaceSearchPanelOpen,
    ],
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    isSearchPanelOpen,
    isWorkspaceSearchPanelOpen,
  };
}
