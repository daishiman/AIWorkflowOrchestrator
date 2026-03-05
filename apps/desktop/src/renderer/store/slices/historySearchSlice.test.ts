import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createHistorySearchSlice,
  type HistorySearchSlice,
} from "./historySearchSlice";

const mockSearch = vi.fn();
const mockGetStats = vi.fn();

describe("historySearchSlice", () => {
  let store: HistorySearchSlice;
  let mockSet: (
    fn:
      | Partial<HistorySearchSlice>
      | ((state: HistorySearchSlice) => Partial<HistorySearchSlice>),
  ) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSearch.mockResolvedValue({
      success: true,
      data: {
        items: [
          {
            id: "h-1",
            type: "chat",
            title: "Chat history",
            preview: "preview",
            timestamp: new Date().toISOString(),
            metadata: {
              type: "chat",
              sessionId: "s-1",
              messageCount: 3,
            },
          },
        ],
        totalCount: 1,
        hasMore: false,
      },
    });
    mockGetStats.mockResolvedValue({
      success: true,
      data: { chat: 1, file: 0, skill: 0, total: 1 },
    });

    global.window = {
      electronAPI: {
        historySearch: {
          search: mockSearch,
          getStats: mockGetStats,
        },
      },
    } as unknown as Window;

    const state: Partial<HistorySearchSlice> = {};
    mockSet = (fn) => {
      const partial = typeof fn === "function" ? fn(store) : fn;
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    store = createHistorySearchSlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );
  });

  it("初期状態を持つ", () => {
    expect(store.historySearchQuery).toBe("");
    expect(store.historySearchResults).toEqual([]);
    expect(store.historySearchTotalCount).toBe(0);
    expect(store.historySearchHasMore).toBe(false);
    expect(store.isHistorySearching).toBe(false);
    expect(store.historySearchError).toBeNull();
    expect(store.expandedItemId).toBeNull();
  });

  it("setHistorySearchQueryでクエリ更新", () => {
    store.setHistorySearchQuery("react");
    expect(store.historySearchQuery).toBe("react");
  });

  it("searchHistoryで結果を取得する", async () => {
    await store.searchHistory("react", 0);

    expect(mockSearch).toHaveBeenCalledWith({
      query: "react",
      filter: "all",
      limit: 30,
      offset: 0,
    });
    expect(store.historySearchResults).toHaveLength(1);
    expect(store.historySearchTotalCount).toBe(1);
    expect(store.historySearchHasMore).toBe(false);
  });

  it("loadMoreHistoryで追補検索する", async () => {
    await store.searchHistory("react", 0);
    store.historySearchHasMore = true;

    mockSearch.mockResolvedValueOnce({
      success: true,
      data: {
        items: [
          {
            id: "h-2",
            type: "file",
            title: "File history",
            preview: "file",
            timestamp: new Date().toISOString(),
            metadata: {
              type: "file",
              filePath: "src/a.ts",
              additions: 1,
              deletions: 0,
            },
          },
        ],
        totalCount: 2,
        hasMore: false,
      },
    });

    await store.loadMoreHistory();

    expect(store.historySearchResults).toHaveLength(2);
    expect(store.historySearchTotalCount).toBe(2);
  });

  it("search失敗時にエラーを保持する", async () => {
    mockSearch.mockResolvedValueOnce({
      success: false,
      error: { code: "UNKNOWN_ERROR", message: "search failed" },
    });

    await store.searchHistory("react", 0);

    expect(store.historySearchError).toBe("search failed");
    expect(store.isHistorySearching).toBe(false);
  });

  it("toggleItemExpandedで同一IDは折りたたむ", () => {
    store.toggleItemExpanded("h-1");
    expect(store.expandedItemId).toBe("h-1");

    store.toggleItemExpanded("h-1");
    expect(store.expandedItemId).toBeNull();
  });

  it("resetHistorySearchで状態初期化", () => {
    store.setHistorySearchQuery("react");
    store.toggleItemExpanded("h-1");

    store.resetHistorySearch();

    expect(store.historySearchQuery).toBe("");
    expect(store.historySearchResults).toEqual([]);
    expect(store.historySearchTotalCount).toBe(0);
    expect(store.historySearchHasMore).toBe(false);
    expect(store.historySearchError).toBeNull();
    expect(store.expandedItemId).toBeNull();
  });
});
