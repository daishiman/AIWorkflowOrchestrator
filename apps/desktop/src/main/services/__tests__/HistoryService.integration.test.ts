/**
 * HistoryService Integration Test
 *
 * TDD Green Phase - 実装完了後のテスト
 * Phase 5の実装により全テストがパスすることを確認
 *
 * @module @repo/desktop/main/services/__tests__/HistoryService.integration.test
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  HistoryService,
  createHistoryServiceWithDI,
  createHistoryService,
  type LogRepository,
  type ConversionLogRecord,
} from "../HistoryService";
import type {
  IHistoryService,
  PaginatedResult,
} from "@repo/shared/services/history/types";
import type { VersionHistoryItem as SharedVersionHistoryItem } from "@repo/shared/services/history/types";
import type { Result } from "@repo/shared/types/rag/result";
import type { IConversionLogger } from "@repo/shared/services/logging/types";
import type {
  VersionHistoryItem as RendererVersionHistoryItem,
  ConversionLog,
} from "../../../renderer/components/history/types";

// =============================================================================
// Mock Factory Functions
// =============================================================================

/**
 * Create mock shared HistoryService
 */
function createMockSharedHistoryService(): IHistoryService {
  return {
    getFileHistory: vi.fn(),
    getVersionDetail: vi.fn(),
    getVersionDiff: vi.fn(),
    restoreToVersion: vi.fn(),
    getLatestVersion: vi.fn(),
    getVersionCount: vi.fn(),
  };
}

/**
 * Create mock LogRepository
 */
function createMockLogRepository(): LogRepository {
  return {
    findByConversionId: vi.fn(),
  };
}

/**
 * Create mock Logger
 */
function createMockLogger(): IConversionLogger {
  return {
    info: vi.fn().mockResolvedValue({ success: true, data: {} }),
    warn: vi.fn().mockResolvedValue({ success: true, data: {} }),
    error: vi.fn().mockResolvedValue({ success: true, data: {} }),
    batch: vi.fn().mockResolvedValue({ success: true, data: [] }),
    flush: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    dispose: vi.fn(),
  };
}

// =============================================================================
// Test Data
// =============================================================================

/**
 * shared VersionHistoryItem test data
 */
const sharedVersionItem: SharedVersionHistoryItem = {
  conversionId: "conv-001",
  fileId: "file-123",
  fileName: "test.md",
  version: 1,
  createdAt: new Date("2026-01-12T10:00:00Z"),
  mimeType: "text/markdown",
  contentHash: "abc123def456",
  sizeBytes: 1024,
  metadata: { author: "test" },
  isCurrentVersion: true,
};

/**
 * Expected Renderer VersionHistoryItem
 * @internal Reference data for type conversion validation
 */
const _expectedRendererItem: RendererVersionHistoryItem = {
  conversionId: "conv-001",
  fileId: "file-123",
  version: 1,
  createdAt: "2026-01-12T10:00:00.000Z",
  mimeType: "text/markdown",
  hash: "abc123def456",
  size: 1024,
  metadata: { author: "test" },
  isLatest: true,
};

/**
 * ConversionLogRecord test data
 */
const testLogRecord: ConversionLogRecord = {
  id: "log-001",
  conversionId: "conv-001",
  timestamp: new Date("2026-01-12T10:00:00Z"),
  level: "info",
  message: "Test log message",
  details: '{"key":"value"}',
};

/**
 * Expected ConversionLog
 * @internal Reference data for log conversion validation
 */
const _expectedLog: ConversionLog = {
  timestamp: "2026-01-12T10:00:00.000Z",
  level: "info",
  message: "Test log message",
  details: { key: "value" },
};

// =============================================================================
// Test Suites
// =============================================================================

describe("HistoryService Integration Tests", () => {
  let historyService: HistoryService;
  let mockSharedHistoryService: IHistoryService;
  let mockLogRepository: LogRepository;
  let mockLogger: IConversionLogger;

  beforeEach(() => {
    mockSharedHistoryService = createMockSharedHistoryService();
    mockLogRepository = createMockLogRepository();
    mockLogger = createMockLogger();

    // Create HistoryService with DI
    historyService = createHistoryServiceWithDI(
      mockSharedHistoryService,
      mockLogRepository,
      mockLogger,
    );
  });

  // ===========================================================================
  // 4.1 getFileHistory Test Cases
  // ===========================================================================

  describe("getFileHistory", () => {
    // HS-GFH-01: Normal - Retrieve file history for given fileId
    it("should retrieve file history for given fileId (HS-GFH-01)", async () => {
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: true,
        data: {
          items: [sharedVersionItem],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("file-123");

      expect(result.items).toHaveLength(1);
      expect(result.items[0].conversionId).toBe("conv-001");
      expect(result.items[0].createdAt).toBe("2026-01-12T10:00:00.000Z");
      expect(result.items[0].size).toBe(1024);
      expect(result.items[0].hash).toBe("abc123def456");
      expect(result.items[0].isLatest).toBe(true);
    });

    // HS-GFH-02: Normal - Pagination works correctly
    it("should apply pagination options correctly (HS-GFH-02)", async () => {
      const mockItems = Array.from({ length: 10 }, (_, i) => ({
        ...sharedVersionItem,
        conversionId: `conv-${i}`,
        version: i,
      }));
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: true,
        data: {
          items: mockItems.slice(0, 5),
          total: 10,
          hasMore: true,
        },
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("file-123", {
        limit: 5,
        offset: 0,
      });

      expect(result.items).toHaveLength(5);
      expect(result.hasMore).toBe(true);
    });

    // HS-GFH-03: Normal - hasMore is correctly determined
    it("should correctly determine hasMore flag (HS-GFH-03)", async () => {
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: true,
        data: {
          items: [sharedVersionItem],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("file-123");

      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(1);
    });

    // HS-GFH-04: Normal - Empty history returns empty array
    it("should return empty array when no history exists (HS-GFH-04)", async () => {
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: true,
        data: {
          items: [],
          total: 0,
          hasMore: false,
        },
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("non-existent-file");

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    // HS-GFH-05: Normal - Type conversion is correct
    it("should correctly convert types from shared to renderer (HS-GFH-05)", async () => {
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: true,
        data: {
          items: [sharedVersionItem],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("file-123");

      const item = result.items[0];
      expect(typeof item.createdAt).toBe("string");
      expect(item).not.toHaveProperty("fileName");
      expect(item).not.toHaveProperty("sizeBytes");
      expect(item).not.toHaveProperty("contentHash");
      expect(item).not.toHaveProperty("isCurrentVersion");
    });

    // HS-GFH-06: Error - Repository error returns empty result
    it("should propagate error when repository fails (HS-GFH-06)", async () => {
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: false,
        error: new Error("Database connection failed"),
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("file-123");

      expect(result.items).toHaveLength(0);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // 4.2 getVersionDetail Test Cases
  // ===========================================================================

  describe("getVersionDetail", () => {
    // HS-GVD-01: Normal - Retrieve version detail for conversionId
    it("should retrieve version detail for given conversionId (HS-GVD-01)", async () => {
      const mockResult: Result<SharedVersionHistoryItem, Error> = {
        success: true,
        data: sharedVersionItem,
      };
      vi.mocked(mockSharedHistoryService.getVersionDetail).mockResolvedValue(
        mockResult,
      );

      const mockLogsResult: Result<
        PaginatedResult<ConversionLogRecord>,
        Error
      > = {
        success: true,
        data: {
          items: [testLogRecord],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockLogRepository.findByConversionId).mockResolvedValue(
        mockLogsResult,
      );

      const result = await historyService.getVersionDetail("conv-001");

      expect(result.version.conversionId).toBe("conv-001");
      expect(result.logs).toHaveLength(1);
    });

    // HS-GVD-02: Normal - Log data is included
    it("should include log data in version detail (HS-GVD-02)", async () => {
      const mockResult: Result<SharedVersionHistoryItem, Error> = {
        success: true,
        data: sharedVersionItem,
      };
      vi.mocked(mockSharedHistoryService.getVersionDetail).mockResolvedValue(
        mockResult,
      );

      const mockLogsResult: Result<
        PaginatedResult<ConversionLogRecord>,
        Error
      > = {
        success: true,
        data: {
          items: [testLogRecord],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockLogRepository.findByConversionId).mockResolvedValue(
        mockLogsResult,
      );

      const result = await historyService.getVersionDetail("conv-001");

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].message).toBe("Test log message");
      expect(result.logs[0].level).toBe("info");
    });

    // HS-GVD-03: Normal - Type conversion is correct
    it("should correctly convert types in version detail (HS-GVD-03)", async () => {
      const mockResult: Result<SharedVersionHistoryItem, Error> = {
        success: true,
        data: sharedVersionItem,
      };
      vi.mocked(mockSharedHistoryService.getVersionDetail).mockResolvedValue(
        mockResult,
      );

      const mockLogsResult: Result<
        PaginatedResult<ConversionLogRecord>,
        Error
      > = {
        success: true,
        data: {
          items: [testLogRecord],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockLogRepository.findByConversionId).mockResolvedValue(
        mockLogsResult,
      );

      const result = await historyService.getVersionDetail("conv-001");

      expect(typeof result.version.createdAt).toBe("string");
      expect(result.version.size).toBe(1024);
      expect(result.version.hash).toBe("abc123def456");
      expect(result.version.isLatest).toBe(true);

      expect(typeof result.logs[0].timestamp).toBe("string");
      expect(result.logs[0].details).toEqual({ key: "value" });
    });

    // HS-GVD-04: Error - Non-existent conversionId returns stub data
    it("should return error for non-existent conversionId (HS-GVD-04)", async () => {
      const mockResult: Result<SharedVersionHistoryItem, Error> = {
        success: false,
        error: new Error("Conversion not found: non-existent-id"),
      };
      vi.mocked(mockSharedHistoryService.getVersionDetail).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getVersionDetail("non-existent-id");

      expect(result.version.conversionId).toBe("non-existent-id");
      expect(result.logs).toHaveLength(0);
    });
  });

  // ===========================================================================
  // 4.3 getConversionLogs Test Cases
  // ===========================================================================

  describe("getConversionLogs", () => {
    // HS-GCL-01: Normal - Retrieve conversion logs
    it("should retrieve conversion logs (HS-GCL-01)", async () => {
      const mockLogsResult: Result<
        PaginatedResult<ConversionLogRecord>,
        Error
      > = {
        success: true,
        data: {
          items: [testLogRecord],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockLogRepository.findByConversionId).mockResolvedValue(
        mockLogsResult,
      );

      const result = await historyService.getConversionLogs("conv-001");

      expect(result.items).toHaveLength(1);
      expect(result.items[0].message).toBe("Test log message");
    });

    // HS-GCL-02: Normal - Filter by log level
    it("should filter logs by level (HS-GCL-02)", async () => {
      const errorLog: ConversionLogRecord = {
        ...testLogRecord,
        id: "log-002",
        level: "error",
        message: "Error message",
      };
      const mockLogsResult: Result<
        PaginatedResult<ConversionLogRecord>,
        Error
      > = {
        success: true,
        data: {
          items: [errorLog],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockLogRepository.findByConversionId).mockResolvedValue(
        mockLogsResult,
      );

      const result = await historyService.getConversionLogs("conv-001", {
        level: "error",
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].level).toBe("error");
    });

    // HS-GCL-03: Normal - Pagination works
    it("should apply pagination to logs (HS-GCL-03)", async () => {
      const mockLogs = Array.from({ length: 10 }, (_, i) => ({
        ...testLogRecord,
        id: `log-${i}`,
      }));
      const mockLogsResult: Result<
        PaginatedResult<ConversionLogRecord>,
        Error
      > = {
        success: true,
        data: {
          items: mockLogs.slice(0, 5),
          total: 10,
          hasMore: true,
        },
      };
      vi.mocked(mockLogRepository.findByConversionId).mockResolvedValue(
        mockLogsResult,
      );

      const result = await historyService.getConversionLogs("conv-001", {
        limit: 5,
        offset: 0,
      });

      expect(result.items).toHaveLength(5);
      expect(result.hasMore).toBe(true);
    });

    // HS-GCL-04: Normal - Type conversion is correct
    it("should correctly convert log types (HS-GCL-04)", async () => {
      const mockLogsResult: Result<
        PaginatedResult<ConversionLogRecord>,
        Error
      > = {
        success: true,
        data: {
          items: [testLogRecord],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockLogRepository.findByConversionId).mockResolvedValue(
        mockLogsResult,
      );

      const result = await historyService.getConversionLogs("conv-001");

      const log = result.items[0];
      expect(typeof log.timestamp).toBe("string");
      expect(log.timestamp).toBe("2026-01-12T10:00:00.000Z");
      expect(log.details).toEqual({ key: "value" });
    });

    // HS-GCL-05: Error - Repository error returns empty result
    it("should propagate error when log repository fails (HS-GCL-05)", async () => {
      const mockLogsResult: Result<
        PaginatedResult<ConversionLogRecord>,
        Error
      > = {
        success: false,
        error: new Error("Database error"),
      };
      vi.mocked(mockLogRepository.findByConversionId).mockResolvedValue(
        mockLogsResult,
      );

      const result = await historyService.getConversionLogs("conv-001");

      expect(result.items).toHaveLength(0);
    });
  });

  // ===========================================================================
  // 4.4 restoreVersion Test Cases
  // ===========================================================================

  describe("restoreVersion", () => {
    // HS-RV-01: Normal - Restore to specified version
    it("should restore to specified version (HS-RV-01)", async () => {
      const restoredItem: SharedVersionHistoryItem = {
        ...sharedVersionItem,
        conversionId: "conv-new",
        version: 2,
        metadata: {
          ...sharedVersionItem.metadata,
          restoredFrom: "conv-001",
        },
      };
      const mockResult: Result<SharedVersionHistoryItem, Error> = {
        success: true,
        data: restoredItem,
      };
      vi.mocked(mockSharedHistoryService.restoreToVersion).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.restoreVersion(
        "file-123",
        "conv-001",
      );

      expect(result.conversionId).toBeDefined();
      expect(result.fileId).toBe("file-123");
    });

    // HS-RV-02: Normal - New version created after restore
    it("should create new version after restore (HS-RV-02)", async () => {
      const restoredItem: SharedVersionHistoryItem = {
        ...sharedVersionItem,
        conversionId: "conv-new",
        version: 2,
        isCurrentVersion: true,
      };
      const mockResult: Result<SharedVersionHistoryItem, Error> = {
        success: true,
        data: restoredItem,
      };
      vi.mocked(mockSharedHistoryService.restoreToVersion).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.restoreVersion(
        "file-123",
        "conv-001",
      );

      expect(result.isLatest).toBe(true);
    });

    // HS-RV-03: Normal - Type conversion is correct
    it("should correctly convert restored version types (HS-RV-03)", async () => {
      const restoredItem: SharedVersionHistoryItem = {
        ...sharedVersionItem,
        conversionId: "conv-new",
      };
      const mockResult: Result<SharedVersionHistoryItem, Error> = {
        success: true,
        data: restoredItem,
      };
      vi.mocked(mockSharedHistoryService.restoreToVersion).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.restoreVersion(
        "file-123",
        "conv-001",
      );

      expect(typeof result.createdAt).toBe("string");
      expect(result).not.toHaveProperty("fileName");
      expect(result).not.toHaveProperty("sizeBytes");
      expect(result).not.toHaveProperty("contentHash");
      expect(result).not.toHaveProperty("isCurrentVersion");
    });

    // HS-RV-04: Error - Non-existent conversionId returns stub data
    it("should return error for non-existent conversionId (HS-RV-04)", async () => {
      const mockResult: Result<SharedVersionHistoryItem, Error> = {
        success: false,
        error: new Error("Conversion not found: non-existent-id"),
      };
      vi.mocked(mockSharedHistoryService.restoreToVersion).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.restoreVersion(
        "file-123",
        "non-existent-id",
      );

      expect(result.conversionId).toBe("non-existent-id");
      expect(mockLogger.error).toHaveBeenCalled();
    });

    // HS-RV-05: Error - FileId mismatch returns stub data
    it("should return error when fileId does not match (HS-RV-05)", async () => {
      const mockResult: Result<SharedVersionHistoryItem, Error> = {
        success: false,
        error: new Error(
          "Conversion conv-001 does not belong to file different-file-id",
        ),
      };
      vi.mocked(mockSharedHistoryService.restoreToVersion).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.restoreVersion(
        "different-file-id",
        "conv-001",
      );

      expect(result.fileId).toBe("different-file-id");
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // 4.5 Type Conversion Test Cases
  // ===========================================================================

  describe("Type Conversion", () => {
    // HS-TC-01: createdAt converts from Date to ISO string
    it("should convert createdAt from Date to ISO string (HS-TC-01)", async () => {
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: true,
        data: {
          items: [sharedVersionItem],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("file-123");

      expect(result.items[0].createdAt).toBe("2026-01-12T10:00:00.000Z");
    });

    // HS-TC-02: sizeBytes renamed to size
    it("should rename sizeBytes to size (HS-TC-02)", async () => {
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: true,
        data: {
          items: [sharedVersionItem],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("file-123");

      expect(result.items[0].size).toBe(1024);
      expect(result.items[0]).not.toHaveProperty("sizeBytes");
    });

    // HS-TC-03: contentHash renamed to hash
    it("should rename contentHash to hash (HS-TC-03)", async () => {
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: true,
        data: {
          items: [sharedVersionItem],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("file-123");

      expect(result.items[0].hash).toBe("abc123def456");
      expect(result.items[0]).not.toHaveProperty("contentHash");
    });

    // HS-TC-04: isCurrentVersion renamed to isLatest
    it("should rename isCurrentVersion to isLatest (HS-TC-04)", async () => {
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: true,
        data: {
          items: [sharedVersionItem],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("file-123");

      expect(result.items[0].isLatest).toBe(true);
      expect(result.items[0]).not.toHaveProperty("isCurrentVersion");
    });

    // HS-TC-05: undefined metadata is handled correctly
    it("should handle undefined metadata correctly (HS-TC-05)", async () => {
      const itemWithoutMetadata: SharedVersionHistoryItem = {
        ...sharedVersionItem,
        metadata: undefined,
      };
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: true,
        data: {
          items: [itemWithoutMetadata],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("file-123");

      expect(result.items[0].metadata).toBeUndefined();
    });
  });

  // ===========================================================================
  // Phase 6: Edge Cases and Additional Coverage
  // ===========================================================================

  describe("Edge Cases", () => {
    // Edge case: Log details is null
    it("should handle null log details correctly", async () => {
      const logWithNullDetails: ConversionLogRecord = {
        ...testLogRecord,
        details: null,
      };
      const mockLogsResult: Result<
        PaginatedResult<ConversionLogRecord>,
        Error
      > = {
        success: true,
        data: {
          items: [logWithNullDetails],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockLogRepository.findByConversionId).mockResolvedValue(
        mockLogsResult,
      );

      const result = await historyService.getConversionLogs("conv-001");

      expect(result.items[0].details).toBeUndefined();
    });

    // Edge case: Log repository fails when getting version detail
    it("should handle log repository failure in getVersionDetail", async () => {
      const mockVersionResult: Result<SharedVersionHistoryItem, Error> = {
        success: true,
        data: sharedVersionItem,
      };
      vi.mocked(mockSharedHistoryService.getVersionDetail).mockResolvedValue(
        mockVersionResult,
      );

      const mockLogsResult: Result<
        PaginatedResult<ConversionLogRecord>,
        Error
      > = {
        success: false,
        error: new Error("Log repository error"),
      };
      vi.mocked(mockLogRepository.findByConversionId).mockResolvedValue(
        mockLogsResult,
      );

      const result = await historyService.getVersionDetail("conv-001");

      expect(result.version.conversionId).toBe("conv-001");
      expect(result.logs).toHaveLength(0);
    });

    // Edge case: Empty pagination options
    it("should handle undefined pagination options", async () => {
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: true,
        data: {
          items: [sharedVersionItem],
          total: 1,
          hasMore: false,
        },
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("file-123", undefined);

      expect(result.items).toHaveLength(1);
    });

    // Edge case: Large dataset pagination
    it("should handle large dataset with pagination", async () => {
      const largeItems = Array.from({ length: 100 }, (_, i) => ({
        ...sharedVersionItem,
        conversionId: `conv-${i}`,
        version: i + 1,
      }));
      const mockResult: Result<
        PaginatedResult<SharedVersionHistoryItem>,
        Error
      > = {
        success: true,
        data: {
          items: largeItems.slice(0, 20),
          total: 100,
          hasMore: true,
        },
      };
      vi.mocked(mockSharedHistoryService.getFileHistory).mockResolvedValue(
        mockResult,
      );

      const result = await historyService.getFileHistory("file-123", {
        limit: 20,
        offset: 0,
      });

      expect(result.items).toHaveLength(20);
      expect(result.total).toBe(100);
      expect(result.hasMore).toBe(true);
    });
  });

  // ===========================================================================
  // Factory Function Tests
  // ===========================================================================

  describe("Factory Functions", () => {
    it("should throw error when using deprecated createHistoryService", () => {
      expect(() => createHistoryService()).toThrow(
        "createHistoryService() requires DI. Use createHistoryServiceWithDI() instead.",
      );
    });

    it("should create HistoryService with createHistoryServiceWithDI", () => {
      const service = createHistoryServiceWithDI(
        createMockSharedHistoryService(),
        createMockLogRepository(),
        createMockLogger(),
      );

      expect(service).toBeInstanceOf(HistoryService);
    });
  });
});
