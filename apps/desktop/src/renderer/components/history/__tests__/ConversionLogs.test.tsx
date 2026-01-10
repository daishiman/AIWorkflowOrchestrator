/**
 * ConversionLogs Component Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ConversionLogs } from "../ConversionLogs";

// Types (will be imported from actual types when implemented)
type LogLevel = "info" | "warn" | "error" | "debug";

interface ConversionLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: Record<string, unknown>;
}

// PaginatedResult type is used internally by the mock

// Mock factory
const createMockConversionLog = (
  overrides?: Partial<ConversionLog>,
): ConversionLog => ({
  timestamp: "2026-01-10T12:00:00Z",
  level: "info",
  message: "Conversion started",
  ...overrides,
});

// Mock setup
const mockHistoryAPI = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

describe("ConversionLogs", () => {
  const defaultProps = {
    conversionId: "conv-001",
  };

  beforeEach(() => {
    // Add historyAPI to window without replacing the entire window object
    (window as unknown as { historyAPI: typeof mockHistoryAPI }).historyAPI =
      mockHistoryAPI;
    vi.clearAllMocks();

    // Default successful response
    mockHistoryAPI.getConversionLogs.mockResolvedValue({
      success: true,
      data: {
        items: [createMockConversionLog()],
        total: 1,
        hasMore: false,
      },
    });
  });

  afterEach(() => {
    // Clean up
    delete (window as unknown as { historyAPI?: typeof mockHistoryAPI })
      .historyAPI;
  });

  describe("ログ一覧表示 (FR-05)", () => {
    it("CL-001: ログ一覧が表示される", async () => {
      // Given: ログデータが存在する
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: {
          items: [
            createMockConversionLog({ message: "Log 1" }),
            createMockConversionLog({ message: "Log 2" }),
          ],
          total: 2,
          hasMore: false,
        },
      });

      // When: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      // Then: ログが表示される
      expect(await screen.findByText(/Log 1/)).toBeInTheDocument();
      expect(screen.getByText(/Log 2/)).toBeInTheDocument();
    });

    it("CL-002: ログのタイムスタンプが表示される", async () => {
      // Given: タイムスタンプを含むログ
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: {
          items: [
            createMockConversionLog({ timestamp: "2026-01-10T15:30:00Z" }),
          ],
          total: 1,
          hasMore: false,
        },
      });

      // When: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      // Then: タイムスタンプが表示される（フォーマットは実装に依存）
      // タイムゾーンに応じてローカル時刻に変換されるため、HH:MM:SS形式を検証
      expect(await screen.findByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
    });

    it("CL-003: ログレベルがアイコンまたはテキストで表示される", async () => {
      // Given: 各レベルのログ
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: {
          items: [
            createMockConversionLog({ level: "info", message: "Info message" }),
            createMockConversionLog({
              level: "error",
              message: "Error message",
            }),
          ],
          total: 2,
          hasMore: false,
        },
      });

      // When: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      // Then: ログレベルが識別できる
      await screen.findByText(/Info message/);
      const logItems = screen.getAllByRole("listitem");
      expect(
        logItems.some((item) => item.getAttribute("data-level") === "info"),
      ).toBe(true);
      expect(
        logItems.some((item) => item.getAttribute("data-level") === "error"),
      ).toBe(true);
    });

    it("CL-004: ログメッセージが表示される", async () => {
      // Given: メッセージを含むログ
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: {
          items: [createMockConversionLog({ message: "Processing file..." })],
          total: 1,
          hasMore: false,
        },
      });

      // When: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      // Then: メッセージが表示される
      expect(await screen.findByText(/Processing file/)).toBeInTheDocument();
    });
  });

  describe("ログレベルフィルタリング (FR-05)", () => {
    it("CL-005: フィルタセレクターが表示される", async () => {
      // Given: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      // Then: フィルタセレクターが存在する
      expect(
        await screen.findByRole("combobox", { name: /フィルタ|level|filter/i }),
      ).toBeInTheDocument();
    });

    it("CL-006: フィルタ変更でログが絞り込まれる", async () => {
      // Given: 初期表示（全レベル）
      mockHistoryAPI.getConversionLogs
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [
              createMockConversionLog({ level: "info", message: "Info" }),
              createMockConversionLog({ level: "error", message: "Error" }),
            ],
            total: 2,
            hasMore: false,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [
              createMockConversionLog({ level: "error", message: "Error" }),
            ],
            total: 1,
            hasMore: false,
          },
        });

      render(<ConversionLogs {...defaultProps} />);

      await screen.findByText(/Info/);

      // When: フィルタを「Error」に変更
      const filterSelect = screen.getByRole("combobox", {
        name: /フィルタ|level|filter/i,
      });
      await userEvent.selectOptions(filterSelect, "error");

      // Then: APIが新しいフィルタで呼ばれる
      expect(mockHistoryAPI.getConversionLogs).toHaveBeenLastCalledWith(
        "conv-001",
        expect.objectContaining({ level: "error" }),
      );
    });

    it("CL-007: 全レベルを選択可能", async () => {
      // Given: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      // Then: 全レベルのオプションが存在する
      const filterSelect = await screen.findByRole("combobox", {
        name: /フィルタ|level|filter/i,
      });

      expect(
        within(filterSelect).getByRole("option", { name: /all|すべて/i }),
      ).toBeInTheDocument();
      expect(
        within(filterSelect).getByRole("option", { name: /info/i }),
      ).toBeInTheDocument();
      expect(
        within(filterSelect).getByRole("option", { name: /warn/i }),
      ).toBeInTheDocument();
      expect(
        within(filterSelect).getByRole("option", { name: /error/i }),
      ).toBeInTheDocument();
      expect(
        within(filterSelect).getByRole("option", { name: /debug/i }),
      ).toBeInTheDocument();
    });
  });

  describe("ローディング状態 (NFR-02)", () => {
    it("CL-008: ローディング中はスケルトンが表示される", () => {
      // Given: APIが応答を返していない
      mockHistoryAPI.getConversionLogs.mockReturnValue(new Promise(() => {}));

      // When: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      // Then: ローディングインジケータが表示される
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("エラー状態 (NFR-03)", () => {
    it("CL-009: エラー時にエラーメッセージが表示される", async () => {
      // Given: APIがエラーを返す
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: false,
        error: new Error("Failed to load logs"),
      });

      // When: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      // Then: エラーメッセージが表示される
      expect(await screen.findByRole("alert")).toBeInTheDocument();
    });

    it("CL-010: エラー時に再試行ボタンが表示される", async () => {
      // Given: APIがエラーを返す
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: false,
        error: new Error("Error"),
      });

      // When: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      // Then: 再試行ボタンが表示される
      expect(
        await screen.findByRole("button", { name: /再試行|retry/i }),
      ).toBeInTheDocument();
    });

    it("CL-011: 再試行ボタンクリックでデータを再取得する", async () => {
      // Given: APIがエラーを返す
      mockHistoryAPI.getConversionLogs
        .mockResolvedValueOnce({
          success: false,
          error: new Error("Error"),
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [createMockConversionLog({ message: "Retry success" })],
            total: 1,
            hasMore: false,
          },
        });

      render(<ConversionLogs {...defaultProps} />);

      // When: 再試行ボタンをクリック
      const retryButton = await screen.findByRole("button", {
        name: /再試行|retry/i,
      });
      await userEvent.click(retryButton);

      // Then: データが再取得される
      expect(await screen.findByText(/Retry success/)).toBeInTheDocument();
    });
  });

  describe("空状態", () => {
    it("CL-012: ログが存在しない場合にメッセージが表示される", async () => {
      // Given: 空のログリスト
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          hasMore: false,
        },
      });

      // When: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      // Then: 空状態メッセージが表示される
      expect(
        await screen.findByText(/ログがありません|no logs/i),
      ).toBeInTheDocument();
    });
  });

  describe("ページネーション", () => {
    it("CL-013: hasMore=trueの場合「さらに読み込む」ボタンが表示される", async () => {
      // Given: 追加データが存在する
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: {
          items: [createMockConversionLog()],
          total: 10,
          hasMore: true,
        },
      });

      // When: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      // Then: 読み込みボタンが表示される
      expect(
        await screen.findByRole("button", { name: /さらに|load more/i }),
      ).toBeInTheDocument();
    });

    it("CL-014: 「さらに読み込む」クリックで追加ログを取得する", async () => {
      // Given: 追加データが存在する
      mockHistoryAPI.getConversionLogs
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [createMockConversionLog({ message: "Log 1" })],
            total: 2,
            hasMore: true,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [createMockConversionLog({ message: "Log 2" })],
            total: 2,
            hasMore: false,
          },
        });

      render(<ConversionLogs {...defaultProps} />);

      await screen.findByText(/Log 1/);

      // When: 「さらに読み込む」をクリック
      const loadMoreButton = screen.getByRole("button", {
        name: /さらに|load more/i,
      });
      await userEvent.click(loadMoreButton);

      // Then: 追加ログが表示される
      expect(await screen.findByText(/Log 2/)).toBeInTheDocument();
    });

    it("CL-015: hasMore=falseの場合ボタンが非表示", async () => {
      // Given: 全データが読み込まれている
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: {
          items: [createMockConversionLog()],
          total: 1,
          hasMore: false,
        },
      });

      // When: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      await screen.findByText(/Conversion started/);

      // Then: 読み込みボタンが非表示
      expect(
        screen.queryByRole("button", { name: /さらに|load more/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("アクセシビリティ (NFR-01)", () => {
    it("CL-016: ログリストがリスト構造を持つ", async () => {
      // Given: ログデータが存在する
      render(<ConversionLogs {...defaultProps} />);

      // Then: リスト構造が存在する
      expect(await screen.findByRole("list")).toBeInTheDocument();
    });

    it("CL-017: 各ログがリストアイテムになっている", async () => {
      // Given: 複数のログ
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: {
          items: [
            createMockConversionLog({ message: "Log 1" }),
            createMockConversionLog({ message: "Log 2" }),
          ],
          total: 2,
          hasMore: false,
        },
      });

      render(<ConversionLogs {...defaultProps} />);

      // Then: リストアイテムが2つ存在する
      await screen.findByText(/Log 1/);
      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(2);
    });

    it("CL-018: フィルタセレクターにラベルがある", async () => {
      // Given: コンポーネントがレンダリングされる
      render(<ConversionLogs {...defaultProps} />);

      // Then: セレクターがラベルと関連付けられている
      const filterSelect = await screen.findByRole("combobox", {
        name: /フィルタ|level|filter/i,
      });
      expect(filterSelect).toHaveAccessibleName();
    });
  });

  describe("詳細情報表示", () => {
    it("CL-019: detailsがある場合に展開可能", async () => {
      // Given: 詳細情報を含むログ
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: {
          items: [
            createMockConversionLog({
              message: "Error occurred",
              details: { stack: "Error stack trace" },
            }),
          ],
          total: 1,
          hasMore: false,
        },
      });

      render(<ConversionLogs {...defaultProps} />);

      // When: 展開ボタンをクリック
      const expandButton = await screen.findByRole("button", {
        name: /展開|details|expand/i,
      });
      await userEvent.click(expandButton);

      // Then: 詳細が表示される
      expect(await screen.findByText(/stack trace/i)).toBeInTheDocument();
    });
  });
});
