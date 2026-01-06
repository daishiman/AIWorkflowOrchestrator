/**
 * 検索・置換機能 状態管理ストア (Zustand)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SearchMatch, SearchOptions } from "../types";

// 型を再エクスポート（後方互換性のため）
export type { SearchMatch, SearchOptions } from "../types";

export interface SearchState {
  // 検索状態
  searchQuery: string;
  replaceText: string;

  // 検索オプション
  options: SearchOptions;

  // ファイル検索結果
  fileResults: SearchMatch[];
  currentFileResultIndex: number;

  // 状態フラグ
  isSearching: boolean;
  error: string | null;

  // パネル状態
  isSearchPanelOpen: boolean;
  isWorkspaceSearchPanelOpen: boolean;
  showReplace: boolean;

  // ファイルフィルター（WS検索用）
  includePattern: string;
  excludePattern: string;
}

export interface SearchActions {
  // 検索値の設定
  setSearchQuery: (query: string) => void;
  setReplaceText: (text: string) => void;
  setOption: <K extends keyof SearchOptions>(
    key: K,
    value: SearchOptions[K],
  ) => void;

  // パネル操作
  openSearchPanel: () => void;
  closeSearchPanel: () => void;
  openWorkspaceSearchPanel: () => void;
  closeWorkspaceSearchPanel: () => void;
  toggleReplaceMode: () => void;

  // 結果操作
  setFileResults: (results: SearchMatch[]) => void;
  goToNextResult: () => void;
  goToPreviousResult: () => void;

  // 状態操作
  setIsSearching: (isSearching: boolean) => void;
  setError: (error: string | null) => void;

  // フィルター操作
  setIncludePattern: (pattern: string) => void;
  setExcludePattern: (pattern: string) => void;

  // リセット
  reset: () => void;
}

const initialState: SearchState = {
  searchQuery: "",
  replaceText: "",
  options: {
    caseSensitive: false,
    regex: false,
    wholeWord: false,
  },
  fileResults: [],
  currentFileResultIndex: 0,
  isSearching: false,
  error: null,
  isSearchPanelOpen: false,
  isWorkspaceSearchPanelOpen: false,
  showReplace: false,
  includePattern: "",
  excludePattern: "",
};

export const useSearchStore = create<SearchState & SearchActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSearchQuery: (query: string) => {
        set({ searchQuery: query, error: null });
      },

      setReplaceText: (text: string) => {
        set({ replaceText: text });
      },

      setOption: (key, value) => {
        set((state) => ({
          options: { ...state.options, [key]: value },
        }));
      },

      openSearchPanel: () => {
        set({
          isSearchPanelOpen: true,
          isWorkspaceSearchPanelOpen: false,
        });
      },

      closeSearchPanel: () => {
        set({ isSearchPanelOpen: false });
      },

      openWorkspaceSearchPanel: () => {
        set({
          isWorkspaceSearchPanelOpen: true,
          isSearchPanelOpen: false,
        });
      },

      closeWorkspaceSearchPanel: () => {
        set({ isWorkspaceSearchPanelOpen: false });
      },

      toggleReplaceMode: () => {
        set((state) => ({ showReplace: !state.showReplace }));
      },

      setFileResults: (results: SearchMatch[]) => {
        set({
          fileResults: results,
          currentFileResultIndex: results.length > 0 ? 0 : -1,
        });
      },

      goToNextResult: () => {
        const { fileResults, currentFileResultIndex } = get();
        if (fileResults.length === 0) return;

        const nextIndex = (currentFileResultIndex + 1) % fileResults.length;
        set({ currentFileResultIndex: nextIndex });
      },

      goToPreviousResult: () => {
        const { fileResults, currentFileResultIndex } = get();
        if (fileResults.length === 0) return;

        const prevIndex =
          (currentFileResultIndex - 1 + fileResults.length) %
          fileResults.length;
        set({ currentFileResultIndex: prevIndex });
      },

      setIsSearching: (isSearching: boolean) => {
        set({ isSearching });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setIncludePattern: (pattern: string) => {
        set({ includePattern: pattern });
      },

      setExcludePattern: (pattern: string) => {
        set({ excludePattern: pattern });
      },

      reset: () => {
        set({
          searchQuery: "",
          replaceText: "",
          fileResults: [],
          currentFileResultIndex: 0,
          isSearching: false,
          error: null,
        });
      },
    }),
    {
      name: "search-store",
      partialize: (state) => ({
        options: state.options,
        showReplace: state.showReplace,
        includePattern: state.includePattern,
        excludePattern: state.excludePattern,
      }),
    },
  ),
);
