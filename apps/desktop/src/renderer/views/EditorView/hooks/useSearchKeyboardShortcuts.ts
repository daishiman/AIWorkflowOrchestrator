/**
 * useSearchKeyboardShortcuts - 検索パネルのキーボードショートカットを提供するカスタムフック
 *
 * 検索関連のグローバルキーボードショートカットを管理する
 */

import { useEffect } from "react";
import type { RefObject } from "react";
import type { SearchMode } from "../../../components/organisms/SearchPanel/UnifiedSearchPanel";

export interface SearchPanelRef {
  goToNext: () => void;
  goToPrev: () => void;
}

export interface UseSearchKeyboardShortcutsOptions {
  isSearchPanelOpen: boolean;
  searchMode: SearchMode;
  selectedFilePath: string | null;
  searchPanelRef: RefObject<SearchPanelRef | null>;
  setSearchMode: (mode: SearchMode) => void;
  setShowReplace: (show: boolean) => void;
  setIsSearchPanelOpen: (open: boolean) => void;
}

/**
 * 検索パネルのキーボードショートカットを管理するカスタムフック
 */
export function useSearchKeyboardShortcuts({
  isSearchPanelOpen,
  searchMode,
  selectedFilePath,
  searchPanelRef,
  setSearchMode,
  setShowReplace,
  setIsSearchPanelOpen,
}: UseSearchKeyboardShortcutsOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+F (Mac) or Ctrl+F (Windows/Linux) to open file search
      if ((e.metaKey || e.ctrlKey) && e.key === "f" && !e.shiftKey) {
        e.preventDefault();
        // ファイルが選択されている場合はfileモード、なければworkspaceモード
        setSearchMode(selectedFilePath ? "file" : "workspace");
        setShowReplace(false);
        setIsSearchPanelOpen(true);
      }
      // Cmd+T (Mac) or Ctrl+T (Windows/Linux) to open file replace
      if ((e.metaKey || e.ctrlKey) && e.key === "t" && !e.shiftKey) {
        e.preventDefault();
        // ファイルが選択されている場合はfileモード、なければworkspaceモード
        setSearchMode(selectedFilePath ? "file" : "workspace");
        setShowReplace(true);
        setIsSearchPanelOpen(true);
      }
      // Cmd+Shift+F (Mac) or Ctrl+Shift+F (Windows/Linux) to open workspace search
      if ((e.metaKey || e.ctrlKey) && e.key === "f" && e.shiftKey) {
        e.preventDefault();
        setSearchMode("workspace");
        setShowReplace(false);
        setIsSearchPanelOpen(true);
      }
      // Cmd+Shift+T (Mac) or Ctrl+Shift+T (Windows/Linux) to open workspace replace
      if ((e.metaKey || e.ctrlKey) && e.key === "t" && e.shiftKey) {
        e.preventDefault();
        setSearchMode("workspace");
        setShowReplace(true);
        setIsSearchPanelOpen(true);
      }
      // Cmd+P (Mac) or Ctrl+P (Windows/Linux) to open file name search
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setSearchMode("filename");
        setShowReplace(false);
        setIsSearchPanelOpen(true);
      }
      // F3 to go to next match, Shift+F3 to go to previous
      if (e.key === "F3" && isSearchPanelOpen && searchMode === "file") {
        e.preventDefault();
        if (e.shiftKey) {
          searchPanelRef.current?.goToPrev();
        } else {
          searchPanelRef.current?.goToNext();
        }
      }
      // Cmd+N / Ctrl+N to go to next match (Vim-style)
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "n" &&
        isSearchPanelOpen &&
        searchMode === "file"
      ) {
        e.preventDefault();
        if (e.shiftKey) {
          searchPanelRef.current?.goToPrev();
        } else {
          searchPanelRef.current?.goToNext();
        }
      }
      // Escape to close search
      if (e.key === "Escape" && isSearchPanelOpen) {
        setIsSearchPanelOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isSearchPanelOpen,
    searchMode,
    selectedFilePath,
    searchPanelRef,
    setSearchMode,
    setShowReplace,
    setIsSearchPanelOpen,
  ]);
}
