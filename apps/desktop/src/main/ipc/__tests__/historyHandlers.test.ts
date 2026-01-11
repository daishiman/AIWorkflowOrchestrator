/**
 * historyHandlers Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * @see docs/30-workflows/history-ui-integration/outputs/phase-4/test-cases.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Type Definitions ===

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

interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

interface SuccessResult<T> {
  success: true;
  data: T;
}

interface ErrorResult {
  success: false;
  error: Error;
}

type Result<T> = SuccessResult<T> | ErrorResult;

interface VersionDetailData {
  version: VersionHistoryItem;
  logs: ConversionLog[];
}

// === Mocks ===

// Mock HistoryService
const mockHistoryService = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

// Mock BrowserWindow for validation
const mockMainWindow = {
  webContents: {
    send: vi.fn(),
  },
  isDestroyed: () => false,
  id: 1,
} as unknown as BrowserWindowType;

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi.fn().mockReturnValue({ id: 1 }),
  },
}));

// Mock ipc-validator
vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  withValidation: vi.fn(
    (
      _channel: string,
      handler: (...args: unknown[]) => Promise<unknown>,
      _options: unknown,
    ) => handler,
  ),
}));

// Import after mocks
import { ipcMain } from "electron";

// History IPC Channels (will be added to channels.ts in Phase 5)
const HISTORY_CHANNELS = {
  GET_FILE_HISTORY: "history:getFileHistory",
  GET_VERSION_DETAIL: "history:getVersionDetail",
  GET_CONVERSION_LOGS: "history:getConversionLogs",
  RESTORE_VERSION: "history:restoreVersion",
} as const;

describe("historyHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Default mock responses
    mockHistoryService.getFileHistory.mockResolvedValue({
      items: [],
      total: 0,
      hasMore: false,
    });
    mockHistoryService.getVersionDetail.mockResolvedValue({
      version: {},
      logs: [],
    });
    mockHistoryService.getConversionLogs.mockResolvedValue({
      items: [],
      total: 0,
      hasMore: false,
    });
    mockHistoryService.restoreVersion.mockResolvedValue({});

    // Try to import and register handlers (will fail in Red phase)
    try {
      const { registerHistoryHandlers } = await import("../historyHandlers");
      registerHistoryHandlers(mockMainWindow, mockHistoryService);
    } catch {
      // Expected in Red phase - module doesn't exist
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // 2.1 history:getFileHistory
  // ===========================================================================

  describe("history:getFileHistory", () => {
    it("HH-GFH-01: 正常系: 履歴一覧を返す", async () => {
      // Given: サービスが正常応答
      const mockData: PaginatedResult<VersionHistoryItem> = {
        items: [
          {
            conversionId: "conv-001",
            fileId: "file-123",
            version: 1,
            createdAt: "2026-01-10T00:00:00Z",
            size: 1024,
            mimeType: "text/markdown",
            hash: "abc123",
            isLatest: true,
          },
        ],
        total: 1,
        hasMore: false,
      };
      mockHistoryService.getFileHistory.mockResolvedValue(mockData);

      const handler = handlers.get(HISTORY_CHANNELS.GET_FILE_HISTORY);
      if (!handler) {
        throw new Error("history:getFileHistory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({}, "file-123", {
        limit: 20,
        offset: 0,
      })) as Result<PaginatedResult<VersionHistoryItem>>;

      // Then: { success: true, data: {...} }
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(1);
        expect(result.data.total).toBe(1);
        expect(result.data.hasMore).toBe(false);
      }
    });

    it("HH-GFH-02: 異常系: サービスエラー", async () => {
      // Given: サービスがthrow
      mockHistoryService.getFileHistory.mockRejectedValue(
        new Error("Database error"),
      );

      const handler = handlers.get(HISTORY_CHANNELS.GET_FILE_HISTORY);
      if (!handler) {
        throw new Error("history:getFileHistory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({}, "file-123", {})) as Result<
        PaginatedResult<VersionHistoryItem>
      >;

      // Then: { success: false, error: {...} }
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it("HH-GFH-03: 異常系: fileId空文字", async () => {
      // Given: fileId=''
      const handler = handlers.get(HISTORY_CHANNELS.GET_FILE_HISTORY);
      if (!handler) {
        throw new Error("history:getFileHistory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({}, "", {})) as Result<
        PaginatedResult<VersionHistoryItem>
      >;

      // Then: { success: false, error: 検証エラー }
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toMatch(/fileId|validation/i);
      }
    });

    it("HH-GFH-04: ページネーションオプション", async () => {
      // Given: options={limit:10, offset:20}
      mockHistoryService.getFileHistory.mockResolvedValue({
        items: [],
        total: 30,
        hasMore: false,
      });

      const handler = handlers.get(HISTORY_CHANNELS.GET_FILE_HISTORY);
      if (!handler) {
        throw new Error("history:getFileHistory handler not registered");
      }

      // When: ハンドラーを呼び出す
      await handler({}, "file-123", { limit: 10, offset: 20 });

      // Then: サービスに正しくオプション渡し
      expect(mockHistoryService.getFileHistory).toHaveBeenCalledWith(
        "file-123",
        expect.objectContaining({ limit: 10, offset: 20 }),
      );
    });
  });

  // ===========================================================================
  // 2.2 history:getVersionDetail
  // ===========================================================================

  describe("history:getVersionDetail", () => {
    it("HH-GVD-01: 正常系: 詳細を返す", async () => {
      // Given: サービスが正常応答
      const mockData: VersionDetailData = {
        version: {
          conversionId: "conv-001",
          fileId: "file-123",
          version: 1,
          createdAt: "2026-01-10T00:00:00Z",
          size: 1024,
          mimeType: "text/markdown",
          hash: "abc123",
          isLatest: true,
        },
        logs: [
          {
            timestamp: "2026-01-10T00:00:00Z",
            level: "info",
            message: "Conversion started",
          },
        ],
      };
      mockHistoryService.getVersionDetail.mockResolvedValue(mockData);

      const handler = handlers.get(HISTORY_CHANNELS.GET_VERSION_DETAIL);
      if (!handler) {
        throw new Error("history:getVersionDetail handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler(
        {},
        "conv-001",
      )) as Result<VersionDetailData>;

      // Then: { success: true, data: {...} }
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.version.conversionId).toBe("conv-001");
        expect(result.data.logs).toHaveLength(1);
      }
    });

    it("HH-GVD-02: 異常系: サービスエラー", async () => {
      // Given: サービスがthrow
      mockHistoryService.getVersionDetail.mockRejectedValue(
        new Error("Not found"),
      );

      const handler = handlers.get(HISTORY_CHANNELS.GET_VERSION_DETAIL);
      if (!handler) {
        throw new Error("history:getVersionDetail handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler(
        {},
        "conv-001",
      )) as Result<VersionDetailData>;

      // Then: { success: false, error: {...} }
      expect(result.success).toBe(false);
    });

    it("HH-GVD-03: 異常系: conversionId空文字", async () => {
      // Given: conversionId=''
      const handler = handlers.get(HISTORY_CHANNELS.GET_VERSION_DETAIL);
      if (!handler) {
        throw new Error("history:getVersionDetail handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({}, "")) as Result<VersionDetailData>;

      // Then: { success: false, error: 検証エラー }
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toMatch(/conversionId|validation/i);
      }
    });
  });

  // ===========================================================================
  // 2.3 history:getConversionLogs
  // ===========================================================================

  describe("history:getConversionLogs", () => {
    it("HH-GCL-01: 正常系: ログ一覧を返す", async () => {
      // Given: サービスが正常応答
      const mockData: PaginatedResult<ConversionLog> = {
        items: [
          {
            timestamp: "2026-01-10T00:00:00Z",
            level: "info",
            message: "Conversion completed",
          },
        ],
        total: 1,
        hasMore: false,
      };
      mockHistoryService.getConversionLogs.mockResolvedValue(mockData);

      const handler = handlers.get(HISTORY_CHANNELS.GET_CONVERSION_LOGS);
      if (!handler) {
        throw new Error("history:getConversionLogs handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({}, "conv-001", {})) as Result<
        PaginatedResult<ConversionLog>
      >;

      // Then: { success: true, data: {...} }
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(1);
      }
    });

    it("HH-GCL-02: 異常系: サービスエラー", async () => {
      // Given: サービスがthrow
      mockHistoryService.getConversionLogs.mockRejectedValue(
        new Error("Database error"),
      );

      const handler = handlers.get(HISTORY_CHANNELS.GET_CONVERSION_LOGS);
      if (!handler) {
        throw new Error("history:getConversionLogs handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({}, "conv-001", {})) as Result<
        PaginatedResult<ConversionLog>
      >;

      // Then: { success: false, error: {...} }
      expect(result.success).toBe(false);
    });

    it("HH-GCL-03: フィルタオプション", async () => {
      // Given: options={level:'error'}
      mockHistoryService.getConversionLogs.mockResolvedValue({
        items: [],
        total: 0,
        hasMore: false,
      });

      const handler = handlers.get(HISTORY_CHANNELS.GET_CONVERSION_LOGS);
      if (!handler) {
        throw new Error("history:getConversionLogs handler not registered");
      }

      // When: ハンドラーを呼び出す
      await handler({}, "conv-001", { level: "error" });

      // Then: サービスに正しくオプション渡し
      expect(mockHistoryService.getConversionLogs).toHaveBeenCalledWith(
        "conv-001",
        expect.objectContaining({ level: "error" }),
      );
    });
  });

  // ===========================================================================
  // 2.4 history:restoreVersion
  // ===========================================================================

  describe("history:restoreVersion", () => {
    it("HH-RV-01: 正常系: 復元結果を返す", async () => {
      // Given: サービスが正常応答
      const mockData: VersionHistoryItem = {
        conversionId: "conv-001",
        fileId: "file-123",
        version: 1,
        createdAt: "2026-01-10T00:00:00Z",
        size: 1024,
        mimeType: "text/markdown",
        hash: "abc123",
        isLatest: true,
      };
      mockHistoryService.restoreVersion.mockResolvedValue(mockData);

      const handler = handlers.get(HISTORY_CHANNELS.RESTORE_VERSION);
      if (!handler) {
        throw new Error("history:restoreVersion handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler(
        {},
        "file-123",
        "conv-001",
      )) as Result<VersionHistoryItem>;

      // Then: { success: true, data: {...} }
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.conversionId).toBe("conv-001");
        expect(result.data.isLatest).toBe(true);
      }
    });

    it("HH-RV-02: 異常系: サービスエラー", async () => {
      // Given: サービスがthrow
      mockHistoryService.restoreVersion.mockRejectedValue(
        new Error("Restore failed"),
      );

      const handler = handlers.get(HISTORY_CHANNELS.RESTORE_VERSION);
      if (!handler) {
        throw new Error("history:restoreVersion handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler(
        {},
        "file-123",
        "conv-001",
      )) as Result<VersionHistoryItem>;

      // Then: { success: false, error: {...} }
      expect(result.success).toBe(false);
    });

    it("HH-RV-03: 異常系: fileId空文字", async () => {
      // Given: fileId=''
      const handler = handlers.get(HISTORY_CHANNELS.RESTORE_VERSION);
      if (!handler) {
        throw new Error("history:restoreVersion handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler(
        {},
        "",
        "conv-001",
      )) as Result<VersionHistoryItem>;

      // Then: { success: false, error: 検証エラー }
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toMatch(/fileId|validation/i);
      }
    });

    it("HH-RV-04: 異常系: conversionId空文字", async () => {
      // Given: conversionId=''
      const handler = handlers.get(HISTORY_CHANNELS.RESTORE_VERSION);
      if (!handler) {
        throw new Error("history:restoreVersion handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler(
        {},
        "file-123",
        "",
      )) as Result<VersionHistoryItem>;

      // Then: { success: false, error: 検証エラー }
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toMatch(/conversionId|validation/i);
      }
    });
  });

  // ===========================================================================
  // ハンドラー登録確認
  // ===========================================================================

  describe("registerHistoryHandlers", () => {
    it("should register history:getFileHistory handler", () => {
      expect(handlers.has(HISTORY_CHANNELS.GET_FILE_HISTORY)).toBe(true);
    });

    it("should register history:getVersionDetail handler", () => {
      expect(handlers.has(HISTORY_CHANNELS.GET_VERSION_DETAIL)).toBe(true);
    });

    it("should register history:getConversionLogs handler", () => {
      expect(handlers.has(HISTORY_CHANNELS.GET_CONVERSION_LOGS)).toBe(true);
    });

    it("should register history:restoreVersion handler", () => {
      expect(handlers.has(HISTORY_CHANNELS.RESTORE_VERSION)).toBe(true);
    });
  });

  // ===========================================================================
  // Phase 6 追加テスト（TS-11〜TS-14）
  // ===========================================================================

  describe("Phase 6 追加テスト", () => {
    it("TS-11: 異常系: fileIdがundefined", async () => {
      // Given: fileId=undefined
      const handler = handlers.get(HISTORY_CHANNELS.GET_FILE_HISTORY);
      if (!handler) {
        throw new Error("history:getFileHistory handler not registered");
      }

      // When: ハンドラーをundefinedで呼び出す
      const result = (await handler({}, undefined, {})) as Result<
        PaginatedResult<VersionHistoryItem>
      >;

      // Then: { success: false, error: 検証エラー }
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toMatch(/fileId|validation|required/i);
      }
    });

    it("TS-12: 異常系: HistoryServiceが予期せぬ例外を投げる", async () => {
      // Given: サービスがTypeErrorを投げる
      mockHistoryService.getVersionDetail.mockRejectedValue(
        new TypeError("Cannot read property 'x' of undefined"),
      );

      const handler = handlers.get(HISTORY_CHANNELS.GET_VERSION_DETAIL);
      if (!handler) {
        throw new Error("history:getVersionDetail handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler(
        {},
        "conv-001",
      )) as Result<VersionDetailData>;

      // Then: エラーが適切にラップされる
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it("TS-13: 境界値: paginationオプションなし", async () => {
      // Given: optionsがundefined
      const mockData: PaginatedResult<VersionHistoryItem> = {
        items: [],
        total: 0,
        hasMore: false,
      };
      mockHistoryService.getFileHistory.mockResolvedValue(mockData);

      const handler = handlers.get(HISTORY_CHANNELS.GET_FILE_HISTORY);
      if (!handler) {
        throw new Error("history:getFileHistory handler not registered");
      }

      // When: ハンドラーをオプションなしで呼び出す
      const result = (await handler({}, "file-123", undefined)) as Result<
        PaginatedResult<VersionHistoryItem>
      >;

      // Then: 正常動作（optionsはundefinedのまま渡される）
      expect(result.success).toBe(true);
      expect(mockHistoryService.getFileHistory).toHaveBeenCalledWith(
        "file-123",
        undefined,
      );
    });

    it("TS-14: 正常系: 全ハンドラーが成功応答を返す", async () => {
      // Given: 全サービスが正常応答
      const mockHistoryItems: PaginatedResult<VersionHistoryItem> = {
        items: [
          {
            conversionId: "conv-001",
            fileId: "file-123",
            version: 1,
            createdAt: "2026-01-10T00:00:00Z",
            size: 1024,
            mimeType: "text/markdown",
            hash: "abc123",
            isLatest: true,
          },
        ],
        total: 1,
        hasMore: false,
      };
      const mockVersionDetail: VersionDetailData = {
        version: mockHistoryItems.items[0],
        logs: [
          {
            timestamp: "2026-01-10T00:00:00Z",
            level: "info",
            message: "Conversion started",
          },
        ],
      };
      const mockLogs: PaginatedResult<ConversionLog> = {
        items: [
          {
            timestamp: "2026-01-10T00:00:00Z",
            level: "info",
            message: "Conversion completed",
          },
        ],
        total: 1,
        hasMore: false,
      };
      const mockRestored: VersionHistoryItem = {
        conversionId: "conv-002",
        fileId: "file-123",
        version: 2,
        createdAt: "2026-01-10T01:00:00Z",
        size: 2048,
        mimeType: "text/markdown",
        hash: "def456",
        isLatest: true,
      };

      mockHistoryService.getFileHistory.mockResolvedValue(mockHistoryItems);
      mockHistoryService.getVersionDetail.mockResolvedValue(mockVersionDetail);
      mockHistoryService.getConversionLogs.mockResolvedValue(mockLogs);
      mockHistoryService.restoreVersion.mockResolvedValue(mockRestored);

      // When & Then: 全ハンドラーが成功応答
      const historyHandler = handlers.get(HISTORY_CHANNELS.GET_FILE_HISTORY);
      const detailHandler = handlers.get(HISTORY_CHANNELS.GET_VERSION_DETAIL);
      const logsHandler = handlers.get(HISTORY_CHANNELS.GET_CONVERSION_LOGS);
      const restoreHandler = handlers.get(HISTORY_CHANNELS.RESTORE_VERSION);

      if (
        !historyHandler ||
        !detailHandler ||
        !logsHandler ||
        !restoreHandler
      ) {
        throw new Error("Some handlers not registered");
      }

      const [historyResult, detailResult, logsResult, restoreResult] =
        await Promise.all([
          historyHandler({}, "file-123", {}),
          detailHandler({}, "conv-001"),
          logsHandler({}, "conv-001", {}),
          restoreHandler({}, "file-123", "conv-001"),
        ]);

      expect((historyResult as Result<unknown>).success).toBe(true);
      expect((detailResult as Result<unknown>).success).toBe(true);
      expect((logsResult as Result<unknown>).success).toBe(true);
      expect((restoreResult as Result<unknown>).success).toBe(true);

      // 各データが適切に返却
      if (
        (historyResult as Result<PaginatedResult<VersionHistoryItem>>).success
      ) {
        expect(
          (historyResult as SuccessResult<PaginatedResult<VersionHistoryItem>>)
            .data.items,
        ).toHaveLength(1);
      }
      if ((detailResult as Result<VersionDetailData>).success) {
        expect(
          (detailResult as SuccessResult<VersionDetailData>).data.logs,
        ).toHaveLength(1);
      }
      if ((logsResult as Result<PaginatedResult<ConversionLog>>).success) {
        expect(
          (logsResult as SuccessResult<PaginatedResult<ConversionLog>>).data
            .items,
        ).toHaveLength(1);
      }
      if ((restoreResult as Result<VersionHistoryItem>).success) {
        expect(
          (restoreResult as SuccessResult<VersionHistoryItem>).data.version,
        ).toBe(2);
      }
    });
  });
});
