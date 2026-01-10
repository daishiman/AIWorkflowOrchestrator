/**
 * useVersionHistory Hook Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 */
import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useVersionHistory } from "../useVersionHistory";

// Types (will be imported from actual types when implemented)
interface VersionHistoryItem {
  conversionId: string;
  fileId: string;
  version: number;
  createdAt: string;
  size: number;
  mimeType: string;
  hash: string;
  isLatest: boolean;
  metadata?: Record<string, unknown>;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

// Mock factory
const createMockVersionHistoryItem = (
  overrides?: Partial<VersionHistoryItem>,
): VersionHistoryItem => ({
  conversionId: "conv-001",
  fileId: "file-123",
  version: 1,
  createdAt: "2026-01-10T00:00:00Z",
  size: 1024,
  mimeType: "text/markdown",
  hash: "abc123",
  isLatest: false,
  ...overrides,
});

// Mock setup
const mockHistoryAPI = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

describe("useVersionHistory", () => {
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
    it("UVH-001: 初期状態でisLoading=trueを返す", () => {
      // Given: フック初期化
      mockHistoryAPI.getFileHistory.mockReturnValue(new Promise(() => {})); // pending promise

      // When: フックをレンダリング
      const { result } = renderHook(() => useVersionHistory("file-123"));

      // Then: isLoading=true
      expect(result.current.isLoading).toBe(true);
    });

    it("UVH-002: データ取得後にhistory配列を返す", async () => {
      // Given: APIが成功レスポンスを返す
      const mockData: PaginatedResult<VersionHistoryItem> = {
        items: [createMockVersionHistoryItem()],
        total: 1,
        hasMore: false,
      };
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: mockData,
      });

      // When: フック初期化
      const { result } = renderHook(() => useVersionHistory("file-123"));

      // Then: history配列が設定される
      await waitFor(() => {
        expect(result.current.history).toHaveLength(1);
        expect(result.current.history[0].conversionId).toBe("conv-001");
      });
    });

    it("UVH-003: データ取得後にisLoading=falseになる", async () => {
      // Given: APIが成功レスポンスを返す
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: { items: [], total: 0, hasMore: false },
      });

      // When: フック初期化
      const { result } = renderHook(() => useVersionHistory("file-123"));

      // Then: isLoading=false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("UVH-004: エラー時にerrorを設定する", async () => {
      // Given: APIがエラーを返す
      const mockError = new Error("Network error");
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: false,
        error: mockError,
      });

      // When: フック初期化
      const { result } = renderHook(() => useVersionHistory("file-123"));

      // Then: errorが設定される
      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
        expect(result.current.error?.message).toBe("Network error");
      });
    });

    it("UVH-005: エラー時にisLoading=falseになる", async () => {
      // Given: APIがエラーを返す
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: false,
        error: new Error("Error"),
      });

      // When: フック初期化
      const { result } = renderHook(() => useVersionHistory("file-123"));

      // Then: isLoading=false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("ページネーション", () => {
    it("UVH-006: loadMore()で追加データを取得する", async () => {
      // Given: 初期データが読み込まれている
      const initialItems = [createMockVersionHistoryItem({ version: 3 })];
      const additionalItems = [createMockVersionHistoryItem({ version: 2 })];

      mockHistoryAPI.getFileHistory
        .mockResolvedValueOnce({
          success: true,
          data: { items: initialItems, total: 2, hasMore: true },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { items: additionalItems, total: 2, hasMore: false },
        });

      const { result } = renderHook(() => useVersionHistory("file-123"));

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1);
      });

      // When: loadMore()を呼ぶ
      await act(async () => {
        await result.current.loadMore();
      });

      // Then: 追加データがhistoryに追加される
      expect(result.current.history).toHaveLength(2);
    });

    it("UVH-007: loadMore()で既存データに追加される", async () => {
      // Given: 初期データが読み込まれている
      mockHistoryAPI.getFileHistory
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [createMockVersionHistoryItem({ conversionId: "conv-001" })],
            total: 2,
            hasMore: true,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [createMockVersionHistoryItem({ conversionId: "conv-002" })],
            total: 2,
            hasMore: false,
          },
        });

      const { result } = renderHook(() => useVersionHistory("file-123"));

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1);
      });

      // When: loadMore()を呼ぶ
      await act(async () => {
        await result.current.loadMore();
      });

      // Then: 既存データが保持されたまま追加される
      expect(result.current.history[0].conversionId).toBe("conv-001");
      expect(result.current.history[1].conversionId).toBe("conv-002");
    });

    it("UVH-008: すべて読み込み後はhasMore=falseになる", async () => {
      // Given: 最後のページを読み込み済み
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: { items: [], total: 1, hasMore: false },
      });

      // When: フック初期化
      const { result } = renderHook(() => useVersionHistory("file-123"));

      // Then: hasMore=false
      await waitFor(() => {
        expect(result.current.hasMore).toBe(false);
      });
    });
  });

  describe("リフレッシュ", () => {
    it("UVH-009: refresh()でデータを再取得する", async () => {
      // Given: 初期データが読み込まれている
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem()],
          total: 1,
          hasMore: false,
        },
      });

      const { result } = renderHook(() => useVersionHistory("file-123"));

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1);
      });

      // When: refresh()を呼ぶ
      await act(async () => {
        await result.current.refresh();
      });

      // Then: APIが再度呼ばれる
      expect(mockHistoryAPI.getFileHistory).toHaveBeenCalledTimes(2);
    });

    it("UVH-010: refresh()でoffsetが0にリセットされる", async () => {
      // Given: loadMore()でoffsetが進んでいる
      mockHistoryAPI.getFileHistory
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [createMockVersionHistoryItem()],
            total: 2,
            hasMore: true,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [createMockVersionHistoryItem()],
            total: 2,
            hasMore: false,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [createMockVersionHistoryItem()],
            total: 1,
            hasMore: false,
          },
        });

      const { result } = renderHook(() => useVersionHistory("file-123"));

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      // When: refresh()を呼ぶ
      await act(async () => {
        await result.current.refresh();
      });

      // Then: offset=0でAPIが呼ばれる（3回目の呼び出し）
      expect(mockHistoryAPI.getFileHistory).toHaveBeenLastCalledWith(
        "file-123",
        expect.objectContaining({ offset: 0 }),
      );
    });
  });
});
