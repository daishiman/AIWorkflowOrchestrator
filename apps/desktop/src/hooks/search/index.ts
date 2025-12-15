/**
 * Search Hooks - 検索機能関連フック
 */

export { useSearchOptions } from "./useSearchOptions";
export type { UseSearchOptionsReturn } from "./useSearchOptions";

export {
  useDebouncedCallback,
  useDebouncedSearch,
} from "./useDebouncedCallback";

export {
  useDebounce,
  useDebouncedCallback as useDebouncedCallbackNew,
} from "./useDebounce";

export { useIMEComposition } from "./useIMEComposition";
export type { UseIMECompositionReturn } from "./useIMEComposition";

export type { SearchOptions, SearchMatch, SearchResult } from "./types";

export { DEFAULT_SEARCH_OPTIONS } from "./types";
