/**
 * History Service Stub Implementations
 *
 * Provides stub implementations for history-related dependencies
 * until full database integration is completed.
 *
 * @module @repo/desktop/main/infrastructure/historyStubs
 */

import type {
  IHistoryService,
  ConversionRepository,
  FileRepository,
  Conversion,
  CreateConversionInput,
} from "@repo/shared/services/history/types";
import type {
  IConversionLogger,
  ConversionLog,
  LogLevel,
  Result,
  ILogRepository,
} from "@repo/shared/services/logging/types";
import type {
  LogRepository,
  ConversionLogRecord,
} from "../services/HistoryService";
import type {
  Result as SharedResult,
  PaginatedResult as SharedPaginatedResult,
} from "@repo/shared/types/rag";
import { ok } from "@repo/shared/types/rag";
import { ConversionLogger } from "@repo/shared/services/logging/conversion-logger";
import { HistoryService as SharedHistoryService } from "@repo/shared/services/history/history-service";

// =============================================================================
// Stub LogRepository (for ILogRepository interface)
// =============================================================================

/**
 * In-memory stub implementation of ILogRepository
 */
class StubLogRepository implements ILogRepository {
  private logs: ConversionLog[] = [];

  async bulkInsert(logs: ConversionLog[]): Promise<Result<void>> {
    this.logs.push(...logs);
    return { success: true, data: undefined };
  }

  async findByFileId(fileId: string): Promise<Result<ConversionLog[]>> {
    const filtered = this.logs.filter((log) => log.fileId === fileId);
    return { success: true, data: filtered };
  }

  async findByLevel(level: LogLevel): Promise<Result<ConversionLog[]>> {
    const filtered = this.logs.filter((log) => log.level === level);
    return { success: true, data: filtered };
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Result<ConversionLog[]>> {
    const filtered = this.logs.filter(
      (log) => log.timestamp >= startDate && log.timestamp <= endDate,
    );
    return { success: true, data: filtered };
  }
}

// =============================================================================
// Stub ConversionRepository
// =============================================================================

/**
 * In-memory stub implementation of ConversionRepository
 */
class StubConversionRepository implements ConversionRepository {
  private conversions: Conversion[] = [];

  async findByFileId(
    fileId: string,
    options?: {
      orderBy?: "createdAt";
      orderDirection?: "asc" | "desc";
      limit?: number;
      offset?: number;
    },
  ): Promise<SharedResult<Conversion[], Error>> {
    let filtered = this.conversions.filter((c) => c.fileId === fileId);

    if (options?.orderDirection === "desc") {
      filtered = filtered.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    } else {
      filtered = filtered.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? filtered.length;
    const result = filtered.slice(offset, offset + limit);

    return ok(result);
  }

  async findById(
    conversionId: string,
  ): Promise<SharedResult<Conversion | null, Error>> {
    const found = this.conversions.find((c) => c.id === conversionId);
    return ok(found ?? null);
  }

  async create(
    data: CreateConversionInput,
  ): Promise<SharedResult<Conversion, Error>> {
    const newConversion: Conversion = {
      id: crypto.randomUUID(),
      fileId: data.fileId,
      fileName: data.fileName,
      createdAt: new Date(),
      mimeType: data.mimeType,
      contentHash: crypto.randomUUID(),
      sizeBytes:
        typeof data.content === "string"
          ? data.content.length
          : data.content.length,
      metadata: data.metadata,
      content: data.content,
    };
    this.conversions.push(newConversion);
    return ok(newConversion);
  }

  async countByFileId(fileId: string): Promise<SharedResult<number, Error>> {
    const count = this.conversions.filter((c) => c.fileId === fileId).length;
    return ok(count);
  }
}

// =============================================================================
// Stub FileRepository
// =============================================================================

/**
 * Stub implementation of FileRepository
 */
class StubFileRepository implements FileRepository {
  async findById(
    _fileId: string,
  ): Promise<SharedResult<unknown | null, Error>> {
    return ok(null);
  }
}

// =============================================================================
// Stub LogRepository for HistoryService (ConversionLogRecord)
// =============================================================================

/**
 * Stub implementation of LogRepository for HistoryService
 */
class StubHistoryLogRepository implements LogRepository {
  async findByConversionId(
    _conversionId: string,
    _options?: {
      limit?: number;
      offset?: number;
      level?: string;
    },
  ): Promise<SharedResult<SharedPaginatedResult<ConversionLogRecord>, Error>> {
    return ok({
      items: [],
      total: 0,
      limit: _options?.limit ?? 10,
      offset: _options?.offset ?? 0,
      hasMore: false,
    });
  }
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create stub IConversionLogger instance
 */
export function createStubLogger(): IConversionLogger {
  const logRepository = new StubLogRepository();
  return new ConversionLogger(logRepository, {
    bufferSize: 0, // Immediate flush for stubs
    flushIntervalMs: 0,
  });
}

/**
 * Create stub IHistoryService instance
 */
export function createStubSharedHistoryService(): IHistoryService {
  const conversionRepository = new StubConversionRepository();
  const fileRepository = new StubFileRepository();
  const logger = createStubLogger();
  return new SharedHistoryService(conversionRepository, fileRepository, logger);
}

/**
 * Create stub LogRepository instance for HistoryService
 */
export function createStubLogRepository(): LogRepository {
  return new StubHistoryLogRepository();
}
