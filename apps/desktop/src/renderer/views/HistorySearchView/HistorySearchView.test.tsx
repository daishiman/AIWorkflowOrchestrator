import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HistorySearchView } from "./index";
import { useAppStore } from "../../store";

const mockSearch = vi.fn();
const mockGetStats = vi.fn();

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(
    _callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit,
  ) {}
}

function isoDate(offsetDays: number, hour: number): string {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function buildItems() {
  return [
    {
      id: "chat-1",
      type: "chat" as const,
      title: "React コンポーネントの設計",
      preview: "Composition をどう使うか整理したやりとり",
      timestamp: isoDate(0, 14),
      metadata: {
        type: "chat" as const,
        sessionId: "session-1",
        messageCount: 6,
        lastModel: "claude-opus-4-6",
      },
    },
    {
      id: "file-1",
      type: "file" as const,
      title: "src/components/Button.tsx",
      preview: "ボタンのスタイルを整理して分岐を削減",
      timestamp: isoDate(0, 11),
      metadata: {
        type: "file" as const,
        filePath: "src/components/Button.tsx",
        additions: 12,
        deletions: 3,
      },
    },
    {
      id: "skill-1",
      type: "skill" as const,
      title: "skill:presentation-generator 実行",
      preview: "slides.html を出力しました",
      timestamp: isoDate(-1, 10),
      metadata: {
        type: "skill" as const,
        skillName: "presentation-generator",
        executionId: "exec-1",
        status: "success" as const,
        outputFile: "slides.html",
        executionTimeMs: 12340,
        modelUsed: "claude-opus-4-6",
      },
    },
  ];
}

function setupElectronApi() {
  Object.defineProperty(window, "electronAPI", {
    value: {
      historySearch: {
        search: mockSearch,
        getStats: mockGetStats,
      },
      file: {
        read: vi.fn().mockResolvedValue({
          success: true,
          data: { content: "file content" },
        }),
      },
    },
    configurable: true,
    writable: true,
  });
}

function renderView() {
  return render(
    <MemoryRouter>
      <HistorySearchView />
    </MemoryRouter>,
  );
}

describe("HistorySearchView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    useAppStore.getState().resetHistorySearch();
    useAppStore.setState({
      currentView: "dashboard",
      viewHistory: ["dashboard"],
      pendingOpenFilePath: null,
    } as never);

    mockSearch.mockResolvedValue({
      success: true,
      data: {
        items: buildItems(),
        totalCount: 3,
        hasMore: false,
      },
    });
    mockGetStats.mockResolvedValue({
      success: true,
      data: {
        chat: 1,
        file: 1,
        skill: 1,
        total: 3,
      },
    });

    setupElectronApi();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("タイムライン主導の初期表示を行う", async () => {
    renderView();

    await waitFor(() => {
      expect(
        screen.getByText("React コンポーネントの設計"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("heading", { name: "あなたの記録" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("history-stats-panel")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("history-search-filter"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("history-search-submit"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("きょう")).toBeInTheDocument();
    expect(screen.getByText("きのう")).toBeInTheDocument();
    expect(mockSearch).toHaveBeenCalledWith({
      query: "",
      filter: "all",
      limit: 30,
      offset: 0,
    });
  });

  it("検索入力を 300ms デバウンスし、trim して再検索する", async () => {
    renderView();

    await screen.findByText("React コンポーネントの設計");

    const input = screen.getByTestId("history-search-input");
    fireEvent.change(input, { target: { value: "  React  " } });

    expect(mockSearch).toHaveBeenCalledTimes(1);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    await waitFor(() => {
      expect(mockSearch).toHaveBeenLastCalledWith({
        query: "React",
        filter: "all",
        limit: 30,
        offset: 0,
      });
    });

    const clearButton = screen.getByRole("button", { name: "検索をクリア" });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenLastCalledWith({
        query: "",
        filter: "all",
        limit: 30,
        offset: 0,
      });
    });
  });

  it("カードを展開し、file 導線で editor へ切り替える", async () => {
    renderView();

    const fileCard = await screen.findByRole("button", {
      name: /src\/components\/Button\.tsx/i,
    });
    fireEvent.click(fileCard);

    expect(screen.getByText("エディタで開く")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "エディタで開く" }));

    expect(useAppStore.getState().currentView).toBe("editor");
    expect(useAppStore.getState().pendingOpenFilePath).toBe(
      "src/components/Button.tsx",
    );
  });

  it("chat 導線リンクと skill 詳細を展開表示する", async () => {
    renderView();

    const chatCard = await screen.findByRole("button", {
      name: /React コンポーネントの設計/i,
    });
    fireEvent.click(chatCard);

    const chatLink = screen.getByRole("link", { name: "やりとりを見る" });
    expect(chatLink).toHaveAttribute("href", "/chat/history/session-1");

    const skillCard = screen.getByRole("button", {
      name: /skill:presentation-generator 実行/i,
    });
    fireEvent.click(skillCard);

    const article = screen.getByTestId("history-item-skill-1");
    expect(within(article).getByText("slides.html")).toBeInTheDocument();
    expect(within(article).getByText("12340ms")).toBeInTheDocument();
  });

  it("検索結果ゼロ件時は clear action 付きゼロステートを表示する", async () => {
    mockSearch.mockResolvedValueOnce({
      success: true,
      data: {
        items: [],
        totalCount: 0,
        hasMore: false,
      },
    });

    renderView();

    await waitFor(() => {
      expect(screen.getByText("まだ記録がありません")).toBeInTheDocument();
    });

    mockSearch.mockResolvedValueOnce({
      success: true,
      data: {
        items: [],
        totalCount: 0,
        hasMore: false,
      },
    });

    fireEvent.change(screen.getByTestId("history-search-input"), {
      target: { value: "missing" },
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    await waitFor(() => {
      expect(
        screen.getByText("「missing」に一致する記録が見つかりませんでした"),
      ).toBeInTheDocument();
    });
  });

  it("エラー時は再試行導線付きエラー state を表示する", async () => {
    mockSearch.mockResolvedValueOnce({
      success: false,
      error: { code: "UNKNOWN_ERROR", message: "search failed" },
    });

    renderView();

    await waitFor(() => {
      expect(
        screen.getByText("記録の読み込みに失敗しました"),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "もう一度試す" }),
    ).toBeInTheDocument();
  });
});
