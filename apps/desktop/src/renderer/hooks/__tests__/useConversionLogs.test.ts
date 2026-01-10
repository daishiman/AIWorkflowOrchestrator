/**
 * useConversionLogs Hook Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 */
import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useConversionLogs } from "../useConversionLogs";

// Types (will be imported from actual types when implemented)
type LogLevel = "info" | "warn" | "error" | "debug";

interface ConversionLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: Record<string, unknown>;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

// Mock factory
const createMockConversionLog = (
  overrides?: Partial<ConversionLog>,
): ConversionLog => ({
  timestamp: "2026-01-10T00:00:00Z",
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

describe("useConversionLogs", () => {
  beforeEach(() => {
    // Add historyAPI to window without replacing the entire window object
    (window as unknown as { historyAPI: typeof mockHistoryAPI }).historyAPI =
      mockHistoryAPI;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    delete (window as unknown as { historyAPI?: typeof mockHistoryAPI })
      .historyAPI;
  });

  describe("初期読み込み", () => {
    it("UCL-001: 初期状態でisLoading=trueを返す", () => {
      // Given: フック初期化
      mockHistoryAPI.getConversionLogs.mockReturnValue(new Promise(() => {})); // pending promise

      // When: フックをレンダリング
      const { result } = renderHook(() => useConversionLogs("conv-001"));

      // Then: isLoading=true
      expect(result.current.isLoading).toBe(true);
    });

    it("UCL-002: データ取得後にlogs配列を返す", async () => {
      // Given: APIが成功レスポンスを返す
      const mockData: PaginatedResult<ConversionLog> = {
        items: [createMockConversionLog()],
        total: 1,
        hasMore: false,
      };
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: mockData,
      });

      // When: フック初期化
      const { result } = renderHook(() => useConversionLogs("conv-001"));

      // Then: logs配列が設定される
      await waitFor(() => {
        expect(result.current.logs).toHaveLength(1);
        expect(result.current.logs[0].message).toBe("Conversion started");
      });
    });

    it("UCL-003: データ取得後にisLoading=falseになる", async () => {
      // Given: APIが成功レスポンスを返す
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: { items: [], total: 0, hasMore: false },
      });

      // When: フック初期化
      const { result } = renderHook(() => useConversionLogs("conv-001"));

      // Then: isLoading=false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("UCL-004: エラー時にerrorを設定する", async () => {
      // Given: APIがエラーを返す
      const mockError = new Error("Failed to load logs");
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: false,
        error: mockError,
      });

      // When: フック初期化
      const { result } = renderHook(() => useConversionLogs("conv-001"));

      // Then: errorが設定される
      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
        expect(result.current.error?.message).toBe("Failed to load logs");
      });
    });
  });

  describe("フィルタリング (FR-05)", () => {
    it("UCL-005: levelフィルタで特定レベルのログのみ取得する", async () => {
      // Given: フィルタオプション付きでフック初期化
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: {
          items: [createMockConversionLog({ level: "error" })],
          total: 1,
          hasMore: false,
        },
      });

      // When: level="error"でフック初期化
      const { result: _result } = renderHook(() =>
        useConversionLogs("conv-001", { level: "error" }),
      );

      // Then: APIがlevelフィルタ付きで呼ばれる
      await waitFor(() => {
        expect(mockHistoryAPI.getConversionLogs).toHaveBeenCalledWith(
          "conv-001",
          expect.objectContaining({ level: "error" }),
        );
      });
    });

    it("UCL-006: setFilter()でフィルタを変更できる", async () => {
      // Given: 初期データが読み込まれている
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: { items: [], total: 0, hasMore: false },
      });

      const { result } = renderHook(() => useConversionLogs("conv-001"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // When: setFilter()を呼ぶ
      await act(async () => {
        result.current.setFilter({ level: "warn" });
      });

      // Then: 新しいフィルタでAPIが呼ばれる
      await waitFor(() => {
        expect(mockHistoryAPI.getConversionLogs).toHaveBeenLastCalledWith(
          "conv-001",
          expect.objectContaining({ level: "warn" }),
        );
      });
    });

    it("UCL-007: フィルタ変更時にlogsがリセットされる", async () => {
      // Given: 初期データが読み込まれている
      mockHistoryAPI.getConversionLogs
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [createMockConversionLog({ message: "Initial" })],
            total: 1,
            hasMore: false,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [createMockConversionLog({ message: "Filtered" })],
            total: 1,
            hasMore: false,
          },
        });

      const { result } = renderHook(() => useConversionLogs("conv-001"));

      await waitFor(() => {
        expect(result.current.logs[0]?.message).toBe("Initial");
      });

      // When: setFilter()を呼ぶ
      await act(async () => {
        result.current.setFilter({ level: "error" });
      });

      // Then: logsが新しいデータで置き換えられる
      await waitFor(() => {
        expect(result.current.logs).toHaveLength(1);
        expect(result.current.logs[0]?.message).toBe("Filtered");
      });
    });
  });

  describe("ページネーション", () => {
    it("UCL-008: loadMore()で追加データを取得する", async () => {
      // Given: 初期データが読み込まれている
      const initialItems = [createMockConversionLog({ message: "Log 1" })];
      const additionalItems = [createMockConversionLog({ message: "Log 2" })];

      mockHistoryAPI.getConversionLogs
        .mockResolvedValueOnce({
          success: true,
          data: { items: initialItems, total: 2, hasMore: true },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { items: additionalItems, total: 2, hasMore: false },
        });

      const { result } = renderHook(() => useConversionLogs("conv-001"));

      await waitFor(() => {
        expect(result.current.logs).toHaveLength(1);
      });

      // When: loadMore()を呼ぶ
      await act(async () => {
        await result.current.loadMore();
      });

      // Then: 追加データがlogsに追加される
      expect(result.current.logs).toHaveLength(2);
    });

    it("UCL-009: hasMore=falseの場合loadMore()は何もしない", async () => {
      // Given: 全データが読み込まれている
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: { items: [createMockConversionLog()], total: 1, hasMore: false },
      });

      const { result } = renderHook(() => useConversionLogs("conv-001"));

      await waitFor(() => {
        expect(result.current.hasMore).toBe(false);
      });

      const callCount = mockHistoryAPI.getConversionLogs.mock.calls.length;

      // When: loadMore()を呼ぶ
      await act(async () => {
        await result.current.loadMore();
      });

      // Then: APIが追加で呼ばれない
      expect(mockHistoryAPI.getConversionLogs).toHaveBeenCalledTimes(callCount);
    });
  });

  describe("ログレベル別表示 (FR-05)", () => {
    it("UCL-010: 全レベルのログを取得できる", async () => {
      // Given: 複数レベルのログを含むレスポンス
      const mockLogs = [
        createMockConversionLog({ level: "info", message: "Info log" }),
        createMockConversionLog({ level: "warn", message: "Warn log" }),
        createMockConversionLog({ level: "error", message: "Error log" }),
        createMockConversionLog({ level: "debug", message: "Debug log" }),
      ];

      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: { items: mockLogs, total: 4, hasMore: false },
      });

      // When: フック初期化（フィルタなし）
      const { result } = renderHook(() => useConversionLogs("conv-001"));

      // Then: 全レベルのログが取得できる
      await waitFor(() => {
        expect(result.current.logs).toHaveLength(4);
        expect(result.current.logs.map((l) => l.level)).toEqual([
          "info",
          "warn",
          "error",
          "debug",
        ]);
      });
    });
  });

  describe("リフレッシュ", () => {
    it("UCL-011: refresh()でデータを再取得する", async () => {
      // Given: 初期データが読み込まれている
      mockHistoryAPI.getConversionLogs.mockResolvedValue({
        success: true,
        data: { items: [createMockConversionLog()], total: 1, hasMore: false },
      });

      const { result } = renderHook(() => useConversionLogs("conv-001"));

      await waitFor(() => {
        expect(result.current.logs).toHaveLength(1);
      });

      // When: refresh()を呼ぶ
      await act(async () => {
        await result.current.refresh();
      });

      // Then: APIが再度呼ばれる
      expect(mockHistoryAPI.getConversionLogs).toHaveBeenCalledTimes(2);
    });
  });
});
