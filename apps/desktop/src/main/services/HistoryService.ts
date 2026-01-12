/**
 * History Service
 *
 * Provides version history operations with database integration.
 * Implements Adapter pattern to integrate shared HistoryService with Electron IPC.
 *
 * @module @repo/desktop/main/services/HistoryService
 */
import type {
  PaginationOptions,
  LogFilterOptions,
  PaginatedResult,
  VersionHistoryItem,
  VersionDetailData,
  ConversionLog,
} from "../../renderer/components/history/types";
import type {
  IHistoryService,
  VersionHistoryItem as SharedVersionHistoryItem,
  PaginatedResult as SharedPaginatedResult,
} from "@repo/shared/services/history/types";
import type { Result as SharedResult } from "@repo/shared/types/rag/result";
import type { IConversionLogger } from "@repo/shared/services/logging/types";

// =============================================================================
// LogRepository Interface (for getConversionLogs)
// =============================================================================

/**
 * Conversion log record from database
 */
export interface ConversionLogRecord {
  id: string;
  conversionId: string;
  timestamp: Date;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  details?: string | null;
}

/**
 * LogRepository interface for fetching conversion logs
 */
export interface LogRepository {
  findByConversionId(
    conversionId: string,
    options?: {
      limit?: number;
      offset?: number;
      level?: string;
    },
  ): Promise<SharedResult<SharedPaginatedResult<ConversionLogRecord>, Error>>;
}

// =============================================================================
// Type Conversion Adapters
// =============================================================================

/**
 * Convert shared VersionHistoryItem to Renderer VersionHistoryItem
 */
function toRendererVersionHistoryItem(
  item: SharedVersionHistoryItem,
): VersionHistoryItem {
  return {
    conversionId: item.conversionId,
    fileId: item.fileId,
    version: item.version,
    createdAt: item.createdAt.toISOString(),
    size: item.sizeBytes,
    mimeType: item.mimeType,
    hash: item.contentHash,
    isLatest: item.isCurrentVersion,
    metadata: item.metadata,
  };
}

/**
 * Convert paginated shared items to paginated renderer items
 */
function toRendererPaginatedVersionHistory(
  result: SharedPaginatedResult<SharedVersionHistoryItem>,
): PaginatedResult<VersionHistoryItem> {
  return {
    items: result.items.map(toRendererVersionHistoryItem),
    total: result.total,
    hasMore: result.hasMore,
  };
}

/**
 * Convert ConversionLogRecord to Renderer ConversionLog
 */
function toRendererConversionLog(record: ConversionLogRecord): ConversionLog {
  return {
    timestamp: record.timestamp.toISOString(),
    level: record.level,
    message: record.message,
    details: record.details ? JSON.parse(record.details) : undefined,
  };
}

/**
 * Convert paginated log records to paginated renderer logs
 */
function toRendererPaginatedLogs(
  result: SharedPaginatedResult<ConversionLogRecord>,
): PaginatedResult<ConversionLog> {
  return {
    items: result.items.map(toRendererConversionLog),
    total: result.total,
    hasMore: result.hasMore,
  };
}

/**
 * Convert shared error to renderer-friendly error
 * @internal Reserved for future i18n support
 */

function _toRendererError(error: Error): Error {
  const message = error.message;

  if (message.includes("Conversion not found")) {
    return new Error("指定されたバージョンが見つかりません");
  }
  if (message.includes("does not belong to file")) {
    return new Error("このファイルには復元できません");
  }
  if (message.includes("database") || message.includes("DB")) {
    return new Error("データベース接続に問題があります");
  }

  return new Error("予期しないエラーが発生しました");
}

// =============================================================================
// History Service Implementation
// =============================================================================

/**
 * History Service Implementation
 *
 * Integrates with shared HistoryService and provides type conversion
 * for Electron IPC communication.
 */
export class HistoryService {
  constructor(
    private readonly sharedHistoryService: IHistoryService,
    private readonly logRepository: LogRepository,
    private readonly logger: IConversionLogger,
  ) {}

  /**
   * Get file history
   */
  async getFileHistory(
    fileId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<VersionHistoryItem>> {
    const historyOptions = options
      ? {
          pagination: {
            limit: options.limit ?? 20,
            offset: options.offset ?? 0,
          },
        }
      : undefined;

    const result = await this.sharedHistoryService.getFileHistory(
      fileId,
      historyOptions,
    );

    if (!result.success) {
      // Log error and return empty result
      await this.logger.error({
        fileId,
        fileName: "unknown",
        action: "convert",
        message: `Failed to get file history: ${result.error.message}`,
      });
      return { items: [], total: 0, hasMore: false };
    }

    return toRendererPaginatedVersionHistory(result.data);
  }

  /**
   * Get version detail
   */
  async getVersionDetail(conversionId: string): Promise<VersionDetailData> {
    // Get version info from shared HistoryService
    const versionResult =
      await this.sharedHistoryService.getVersionDetail(conversionId);

    if (!versionResult.success) {
      // Return stub data for non-existent conversion
      return {
        version: {
          conversionId,
          fileId: "",
          version: 0,
          createdAt: new Date().toISOString(),
          size: 0,
          mimeType: "",
          hash: "",
          isLatest: false,
        },
        logs: [],
      };
    }

    // Get logs from LogRepository
    const logsResult = await this.logRepository.findByConversionId(
      conversionId,
      { limit: 100 },
    );

    const logs = logsResult.success
      ? logsResult.data.items.map(toRendererConversionLog)
      : [];

    return {
      version: toRendererVersionHistoryItem(versionResult.data),
      logs,
    };
  }

  /**
   * Get conversion logs
   */
  async getConversionLogs(
    conversionId: string,
    options?: LogFilterOptions,
  ): Promise<PaginatedResult<ConversionLog>> {
    const result = await this.logRepository.findByConversionId(conversionId, {
      limit: options?.limit,
      offset: options?.offset,
      level: options?.level,
    });

    if (!result.success) {
      return { items: [], total: 0, hasMore: false };
    }

    return toRendererPaginatedLogs(result.data);
  }

  /**
   * Restore version
   */
  async restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<VersionHistoryItem> {
    const result = await this.sharedHistoryService.restoreToVersion(
      fileId,
      conversionId,
    );

    if (!result.success) {
      // Log error and return stub data
      await this.logger.error({
        fileId,
        fileName: "unknown",
        conversionId,
        action: "restore",
        message: `Failed to restore version: ${result.error.message}`,
      });

      return {
        conversionId,
        fileId,
        version: 1,
        createdAt: new Date().toISOString(),
        size: 0,
        mimeType: "",
        hash: "",
        isLatest: true,
      };
    }

    return toRendererVersionHistoryItem(result.data);
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a HistoryService instance with dependencies
 *
 * @deprecated Use DI-based createHistoryServiceWithDI for production
 */
export function createHistoryService(): HistoryService {
  // This is a stub factory that will be replaced with proper DI
  // For now, throw error to indicate DI is required
  throw new Error(
    "createHistoryService() requires DI. Use createHistoryServiceWithDI() instead.",
  );
}

/**
 * Create a HistoryService instance with explicit dependencies
 */
export function createHistoryServiceWithDI(
  sharedHistoryService: IHistoryService,
  logRepository: LogRepository,
  logger: IConversionLogger,
): HistoryService {
  return new HistoryService(sharedHistoryService, logRepository, logger);
}
