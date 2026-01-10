/**
 * useVersionDetail Hook Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 */
import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useVersionDetail } from "../useVersionDetail";

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

interface ConversionLog {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  details?: Record<string, unknown>;
}

interface _VersionDetailData {
  version: VersionHistoryItem;
  logs: ConversionLog[];
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

describe("useVersionDetail", () => {
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
    it("UVD-001: 初期状態でisLoading=trueを返す", () => {
      // Given: フック初期化
      mockHistoryAPI.getVersionDetail.mockReturnValue(new Promise(() => {})); // pending promise

      // When: フックをレンダリング
      const { result } = renderHook(() => useVersionDetail("conv-001"));

      // Then: isLoading=true
      expect(result.current.isLoading).toBe(true);
    });

    it("UVD-002: データ取得後にversionオブジェクトを返す", async () => {
      // Given: APIが成功レスポンスを返す
      const mockVersion = createMockVersionHistoryItem();
      const mockLogs = [createMockConversionLog()];

      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: { version: mockVersion, logs: mockLogs },
      });

      // When: フック初期化
      const { result } = renderHook(() => useVersionDetail("conv-001"));

      // Then: versionオブジェクトが設定される
      await waitFor(() => {
        expect(result.current.version).not.toBeNull();
        expect(result.current.version?.conversionId).toBe("conv-001");
      });
    });

    it("UVD-003: データ取得後にlogs配列を返す", async () => {
      // Given: APIが成功レスポンスを返す
      const mockVersion = createMockVersionHistoryItem();
      const mockLogs = [
        createMockConversionLog({ message: "Log 1" }),
        createMockConversionLog({ message: "Log 2" }),
      ];

      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: { version: mockVersion, logs: mockLogs },
      });

      // When: フック初期化
      const { result } = renderHook(() => useVersionDetail("conv-001"));

      // Then: logs配列が設定される
      await waitFor(() => {
        expect(result.current.logs).toHaveLength(2);
      });
    });

    it("UVD-004: データ取得後にisLoading=falseになる", async () => {
      // Given: APIが成功レスポンスを返す
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: {
          version: createMockVersionHistoryItem(),
          logs: [],
        },
      });

      // When: フック初期化
      const { result } = renderHook(() => useVersionDetail("conv-001"));

      // Then: isLoading=false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("UVD-005: エラー時にerrorを設定する", async () => {
      // Given: APIがエラーを返す
      const mockError = new Error("Version not found");
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: false,
        error: mockError,
      });

      // When: フック初期化
      const { result } = renderHook(() => useVersionDetail("conv-001"));

      // Then: errorが設定される
      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
        expect(result.current.error?.message).toBe("Version not found");
      });
    });

    it("UVD-006: エラー時にisLoading=falseになる", async () => {
      // Given: APIがエラーを返す
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: false,
        error: new Error("Error"),
      });

      // When: フック初期化
      const { result } = renderHook(() => useVersionDetail("conv-001"));

      // Then: isLoading=false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("conversionId変更", () => {
    it("UVD-007: conversionId変更時にデータを再取得する", async () => {
      // Given: 初期データが読み込まれている
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: {
          version: createMockVersionHistoryItem({ conversionId: "conv-001" }),
          logs: [],
        },
      });

      const { result, rerender } = renderHook(
        ({ conversionId }) => useVersionDetail(conversionId),
        { initialProps: { conversionId: "conv-001" } },
      );

      await waitFor(() => {
        expect(result.current.version?.conversionId).toBe("conv-001");
      });

      // When: conversionIdを変更
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: {
          version: createMockVersionHistoryItem({ conversionId: "conv-002" }),
          logs: [],
        },
      });

      rerender({ conversionId: "conv-002" });

      // Then: 新しいconversionIdでAPIが呼ばれる
      await waitFor(() => {
        expect(mockHistoryAPI.getVersionDetail).toHaveBeenLastCalledWith(
          "conv-002",
        );
      });
    });
  });

  describe("メタデータ表示 (FR-02)", () => {
    it("UVD-008: metadataが含まれる場合に取得できる", async () => {
      // Given: metadataが含まれるレスポンス
      const mockVersion = createMockVersionHistoryItem({
        metadata: { sourceFormat: "docx", wordCount: 500 },
      });

      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: { version: mockVersion, logs: [] },
      });

      // When: フック初期化
      const { result } = renderHook(() => useVersionDetail("conv-001"));

      // Then: metadataが取得できる
      await waitFor(() => {
        expect(result.current.version?.metadata).toEqual({
          sourceFormat: "docx",
          wordCount: 500,
        });
      });
    });
  });
});
