import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { HistorySearchView } from "./index";
import { useAppStore } from "../../store";

const mockSearch = vi.fn();
const mockGetStats = vi.fn();

function setupElectronApi() {
  Object.defineProperty(window, "electronAPI", {
    value: {
      historySearch: {
        search: mockSearch,
        getStats: mockGetStats,
      },
    },
    configurable: true,
    writable: true,
  });
}

describe("HistorySearchView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.getState().resetHistorySearch();

    mockSearch.mockResolvedValue({
      success: true,
      data: {
        items: [
          {
            id: "h-1",
            type: "chat",
            title: "Chat session",
            preview: "React state discussion",
            timestamp: "2026-03-05T12:00:00.000Z",
            metadata: {
              type: "chat",
              sessionId: "s-1",
              messageCount: 5,
            },
          },
        ],
        totalCount: 1,
        hasMore: false,
      },
    });

    mockGetStats.mockResolvedValue({
      success: true,
      data: {
        chat: 1,
        file: 0,
        skill: 0,
        total: 1,
      },
    });

    setupElectronApi();
  });

  it("初期表示で結果一覧と統計パネルを表示する", async () => {
    render(<HistorySearchView />);

    await waitFor(() => {
      expect(screen.getByText("Chat session")).toBeInTheDocument();
    });

    const statsPanel = screen.getByTestId("history-stats-panel");
    expect(statsPanel).toBeInTheDocument();
    expect(within(statsPanel).getByText("チャット")).toBeInTheDocument();
    expect(within(statsPanel).getByText("合計")).toBeInTheDocument();
    expect(mockSearch).toHaveBeenCalledWith({
      query: "",
      filter: "all",
      limit: 30,
      offset: 0,
    });
  });

  it("フィルタ変更で再検索する", async () => {
    render(<HistorySearchView />);

    const select = await screen.findByTestId("history-search-filter");
    fireEvent.change(select, { target: { value: "chat" } });

    await waitFor(() => {
      expect(mockSearch).toHaveBeenLastCalledWith({
        query: "",
        filter: "chat",
        limit: 30,
        offset: 0,
      });
    });
  });

  it("hasMore=trueのとき追加読み込みできる", async () => {
    mockSearch
      .mockResolvedValueOnce({
        success: true,
        data: {
          items: [
            {
              id: "h-1",
              type: "chat",
              title: "Chat session",
              preview: "React state discussion",
              timestamp: "2026-03-05T12:00:00.000Z",
              metadata: {
                type: "chat",
                sessionId: "s-1",
                messageCount: 5,
              },
            },
          ],
          totalCount: 2,
          hasMore: true,
        },
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          items: [
            {
              id: "h-2",
              type: "file",
              title: "File update",
              preview: "src/app.ts changed",
              timestamp: "2026-03-05T12:05:00.000Z",
              metadata: {
                type: "file",
                filePath: "src/app.ts",
                additions: 3,
                deletions: 1,
              },
            },
          ],
          totalCount: 2,
          hasMore: false,
        },
      });

    render(<HistorySearchView />);

    const loadMore = await screen.findByTestId("history-search-load-more");
    fireEvent.click(loadMore);

    await waitFor(() => {
      expect(screen.getByText("File update")).toBeInTheDocument();
    });
  });
});
