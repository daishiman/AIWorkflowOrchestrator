/**
 * 検索・置換機能 エクスポート
 */

// コンポーネント
export { SearchPanel } from "./components/SearchPanel";
export { WorkspaceSearchPanel } from "./components/WorkspaceSearchPanel";
export { SearchOptionButtons } from "./components/SearchOptionButtons";
export type { SearchOptionButtonsProps } from "./components/SearchOptionButtons";

// ストア
export { useSearchStore } from "./stores/useSearchStore";
export type { SearchState, SearchActions } from "./stores/useSearchStore";

// フック
export { useSearchKeyboardShortcuts } from "./hooks/useSearchKeyboardShortcuts";

// アダプター
export {
  TextAreaEditorAdapter,
  createTextAreaEditorAdapter,
  type TextAreaEditorAdapterOptions,
} from "./adapters";

// ユーティリティ
export { highlightMatch, createHighlights } from "./utils";

// 定数
export {
  FILE_SEARCH_DEBOUNCE_MS,
  WORKSPACE_SEARCH_DEBOUNCE_MS,
  SCROLL_OFFSET_LINES,
  DEFAULT_FONT_SIZE_PX,
  LINE_HEIGHT_MULTIPLIER,
} from "./constants";

// 型
export type {
  EditorInstance,
  SearchPanelProps,
  WorkspaceSearchPanelProps,
  SearchInputProps,
  SearchOptionsProps,
  SearchNavigationProps,
  ReplaceActionsProps,
  SearchStatusProps,
  FileResultHeaderProps,
  MatchResultItemProps,
  SearchMatch,
  FileSearchResult,
  SearchOptions,
  SearchProviderOptions,
  SearchProvider,
} from "./types";
