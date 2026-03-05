import type { StateCreator } from "zustand";
import type {
  HistoryItem,
  HistoryItemType,
  HistorySearchRequest,
  HistorySearchResult,
} from "@repo/shared/types";

export interface HistorySearchSlice {
  historySearchQuery: string;
  historySearchResults: HistoryItem[];
  historySearchTotalCount: number;
  historySearchHasMore: boolean;
  isHistorySearching: boolean;
  historySearchError: string | null;
  expandedItemId: string | null;

  setHistorySearchQuery: (query: string) => void;
  searchHistory: (query: string, offset?: number) => Promise<void>;
  loadMoreHistory: () => Promise<void>;
  resetHistorySearch: () => void;
  toggleItemExpanded: (itemId: string) => void;
}

const DEFAULT_FILTER: HistoryItemType | "all" = "all";
const DEFAULT_LIMIT = 30;

interface SearchResponse {
  success: boolean;
  data?: HistorySearchResult;
  error?: { code?: string; message?: string };
}

function buildRequest(query: string, offset: number): HistorySearchRequest {
  return {
    query,
    filter: DEFAULT_FILTER,
    limit: DEFAULT_LIMIT,
    offset,
  };
}

function getSearchApi():
  | ((request: HistorySearchRequest) => Promise<SearchResponse>)
  | null {
  if (
    typeof window === "undefined" ||
    !window.electronAPI ||
    !window.electronAPI.historySearch ||
    !window.electronAPI.historySearch.search
  ) {
    return null;
  }

  return window.electronAPI.historySearch.search as (
    request: HistorySearchRequest,
  ) => Promise<SearchResponse>;
}

function resolveErrorMessage(
  error: unknown,
  fallback = "検索に失敗しました",
): string {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const e = error as { message?: string };
    if (typeof e.message === "string" && e.message !== "") {
      return e.message;
    }
  }

  return fallback;
}

export const createHistorySearchSlice: StateCreator<
  HistorySearchSlice,
  [],
  [],
  HistorySearchSlice
> = (set, get) => ({
  historySearchQuery: "",
  historySearchResults: [],
  historySearchTotalCount: 0,
  historySearchHasMore: false,
  isHistorySearching: false,
  historySearchError: null,
  expandedItemId: null,

  setHistorySearchQuery: (query) => {
    set({ historySearchQuery: query });
  },

  searchHistory: async (query, offset = 0) => {
    const search = getSearchApi();

    if (!search) {
      set({
        isHistorySearching: false,
        historySearchError: "historySearch APIが利用できません",
      });
      return;
    }

    set({
      isHistorySearching: true,
      historySearchError: null,
    });

    try {
      const response = await search(buildRequest(query, offset));

      if (!response.success || !response.data) {
        set({
          isHistorySearching: false,
          historySearchError: resolveErrorMessage(
            response.error,
            "検索結果の取得に失敗しました",
          ),
        });
        return;
      }

      const data = response.data;
      set((state) => ({
        historySearchQuery: query,
        historySearchResults:
          offset > 0
            ? [...state.historySearchResults, ...data.items]
            : data.items,
        historySearchTotalCount: data.totalCount,
        historySearchHasMore: data.hasMore,
        isHistorySearching: false,
        historySearchError: null,
      }));
    } catch (error) {
      set({
        isHistorySearching: false,
        historySearchError: resolveErrorMessage(error),
      });
    }
  },

  loadMoreHistory: async () => {
    const state = get();
    if (!state.historySearchHasMore || state.isHistorySearching) {
      return;
    }

    await state.searchHistory(
      state.historySearchQuery,
      state.historySearchResults.length,
    );
  },

  resetHistorySearch: () => {
    set({
      historySearchQuery: "",
      historySearchResults: [],
      historySearchTotalCount: 0,
      historySearchHasMore: false,
      isHistorySearching: false,
      historySearchError: null,
      expandedItemId: null,
    });
  },

  toggleItemExpanded: (itemId) => {
    set((state) => ({
      expandedItemId: state.expandedItemId === itemId ? null : itemId,
    }));
  },
});
