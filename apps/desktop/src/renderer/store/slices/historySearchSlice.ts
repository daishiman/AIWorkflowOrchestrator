import type { StateCreator } from "zustand";
import type {
  HistoryItem,
  HistoryItemType,
  HistorySearchRequest,
  HistorySearchResult,
  HistorySearchStats,
} from "@repo/shared/types";

export interface HistorySearchSlice {
  historySearchQuery: string;
  historySearchFilter: HistoryItemType | "all";
  historySearchResults: HistoryItem[];
  historySearchTotalCount: number;
  historySearchHasMore: boolean;
  hasFetchedHistory: boolean;
  isHistorySearching: boolean;
  isHistoryLoadingMore: boolean;
  historySearchError: string | null;
  historySearchStats: HistorySearchStats;
  historySearchStatsError: string | null;
  expandedItemId: string | null;

  setHistorySearchQuery: (query: string) => void;
  setHistorySearchFilter: (filter: HistoryItemType | "all") => void;
  searchHistory: (
    query: string,
    offset?: number,
    filter?: HistoryItemType | "all",
  ) => Promise<void>;
  loadMoreHistory: () => Promise<void>;
  loadHistorySearchStats: () => Promise<void>;
  resetHistorySearch: () => void;
  toggleItemExpanded: (itemId: string) => void;
}

const DEFAULT_FILTER: HistoryItemType | "all" = "all";
const DEFAULT_LIMIT = 30;
const DEFAULT_STATS: HistorySearchStats = {
  chat: 0,
  file: 0,
  skill: 0,
  total: 0,
};

interface SearchResponse {
  success: boolean;
  data?: HistorySearchResult;
  error?: { code?: string; message?: string };
}

interface StatsResponse {
  success: boolean;
  data?: HistorySearchStats;
  error?: { code?: string; message?: string };
}

function buildRequest(
  query: string,
  offset: number,
  filter: HistoryItemType | "all",
): HistorySearchRequest {
  return {
    query: query.trim(),
    filter,
    limit: DEFAULT_LIMIT,
    offset,
  };
}

function mergeHistoryItems(
  currentItems: HistoryItem[],
  incomingItems: HistoryItem[],
): HistoryItem[] {
  const seenIds = new Set(currentItems.map((item) => item.id));
  const merged = [...currentItems];

  incomingItems.forEach((item) => {
    if (!seenIds.has(item.id)) {
      merged.push(item);
      seenIds.add(item.id);
    }
  });

  return merged;
}

function isValidFilter(filter: unknown): filter is HistoryItemType | "all" {
  return (
    filter === "all" ||
    filter === "chat" ||
    filter === "file" ||
    filter === "skill"
  );
}

function getHistorySearchApi(): {
  search: (request: HistorySearchRequest) => Promise<SearchResponse>;
  getStats: () => Promise<StatsResponse>;
} | null {
  if (
    typeof window === "undefined" ||
    !window.electronAPI ||
    !window.electronAPI.historySearch ||
    !window.electronAPI.historySearch.search ||
    !window.electronAPI.historySearch.getStats
  ) {
    return null;
  }

  return {
    search: window.electronAPI.historySearch.search as (
      request: HistorySearchRequest,
    ) => Promise<SearchResponse>,
    getStats: window.electronAPI.historySearch
      .getStats as () => Promise<StatsResponse>,
  };
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
  historySearchFilter: DEFAULT_FILTER,
  historySearchResults: [],
  historySearchTotalCount: 0,
  historySearchHasMore: false,
  hasFetchedHistory: false,
  isHistorySearching: false,
  isHistoryLoadingMore: false,
  historySearchError: null,
  historySearchStats: DEFAULT_STATS,
  historySearchStatsError: null,
  expandedItemId: null,

  setHistorySearchQuery: (query) => {
    set({ historySearchQuery: query });
  },

  setHistorySearchFilter: (filter) => {
    set({ historySearchFilter: filter });
  },

  searchHistory: async (query, offset = 0, filter) => {
    const api = getHistorySearchApi();

    if (!api) {
      set({
        isHistorySearching: false,
        historySearchError: "historySearch APIが利用できません",
      });
      return;
    }

    const currentFilter = get().historySearchFilter;
    const selectedFilter = isValidFilter(filter) ? filter : currentFilter;

    set({
      isHistorySearching: offset === 0,
      isHistoryLoadingMore: offset > 0,
      historySearchError: null,
    });

    try {
      const response = await api.search(
        buildRequest(query, offset, selectedFilter),
      );

      if (!response.success || !response.data) {
        set({
          isHistorySearching: false,
          isHistoryLoadingMore: false,
          hasFetchedHistory: true,
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
        historySearchFilter: selectedFilter,
        historySearchResults:
          offset > 0
            ? mergeHistoryItems(state.historySearchResults, data.items)
            : data.items,
        historySearchTotalCount: data.totalCount,
        historySearchHasMore: data.hasMore,
        hasFetchedHistory: true,
        isHistorySearching: false,
        isHistoryLoadingMore: false,
        historySearchError: null,
      }));
    } catch (error) {
      set({
        isHistorySearching: false,
        isHistoryLoadingMore: false,
        hasFetchedHistory: true,
        historySearchError: resolveErrorMessage(error),
      });
    }
  },

  loadMoreHistory: async () => {
    const state = get();
    if (
      !state.historySearchHasMore ||
      state.isHistorySearching ||
      state.isHistoryLoadingMore
    ) {
      return;
    }

    await state.searchHistory(
      state.historySearchQuery,
      state.historySearchResults.length,
      state.historySearchFilter,
    );
  },

  loadHistorySearchStats: async () => {
    const api = getHistorySearchApi();

    if (!api) {
      set({
        historySearchStatsError: "historySearch APIが利用できません",
      });
      return;
    }

    set({ historySearchStatsError: null });
    try {
      const response = await api.getStats();
      if (!response.success || !response.data) {
        set({
          historySearchStatsError: resolveErrorMessage(
            response.error,
            "統計情報の取得に失敗しました",
          ),
        });
        return;
      }

      set({
        historySearchStats: response.data,
        historySearchStatsError: null,
      });
    } catch (error) {
      set({
        historySearchStatsError: resolveErrorMessage(
          error,
          "統計情報の取得に失敗しました",
        ),
      });
    }
  },

  resetHistorySearch: () => {
    set({
      historySearchQuery: "",
      historySearchFilter: DEFAULT_FILTER,
      historySearchResults: [],
      historySearchTotalCount: 0,
      historySearchHasMore: false,
      hasFetchedHistory: false,
      isHistorySearching: false,
      isHistoryLoadingMore: false,
      historySearchError: null,
      historySearchStats: DEFAULT_STATS,
      historySearchStatsError: null,
      expandedItemId: null,
    });
  },

  toggleItemExpanded: (itemId) => {
    set((state) => ({
      expandedItemId: state.expandedItemId === itemId ? null : itemId,
    }));
  },
});
