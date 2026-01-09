/**
 * ConversionRepository モック
 *
 * @module @repo/shared/services/history/__tests__/mocks
 */

import { ok, err } from "../../../../types/rag/result";
import type { Result } from "../../../../types/rag/result";
import type {
  Conversion,
  ConversionRepository,
  CreateConversionInput,
  HistoryFilter,
} from "../../types";

/**
 * モック用変換データ生成ヘルパー
 */
export function createMockConversion(
  overrides: Partial<Conversion> = {},
): Conversion {
  return {
    id: `conv-${crypto.randomUUID().slice(0, 8)}`,
    fileId: "file-123",
    fileName: "test.txt",
    createdAt: new Date(),
    mimeType: "text/plain",
    contentHash: `hash-${crypto.randomUUID().slice(0, 8)}`,
    sizeBytes: 1024,
    metadata: {},
    ...overrides,
  };
}

/**
 * ConversionRepository モック実装
 */
export function createMockConversionRepository(): ConversionRepository & {
  _conversions: Conversion[];
  _setConversions: (conversions: Conversion[]) => void;
  _addConversion: (conversion: Conversion) => void;
  _clear: () => void;
} {
  let conversions: Conversion[] = [];

  return {
    _conversions: conversions,
    _setConversions: (newConversions: Conversion[]) => {
      conversions = newConversions;
    },
    _addConversion: (conversion: Conversion) => {
      conversions.push(conversion);
    },
    _clear: () => {
      conversions = [];
    },

    async findByFileId(
      fileId: string,
      options?: {
        orderBy?: "createdAt";
        orderDirection?: "asc" | "desc";
        limit?: number;
        offset?: number;
        filter?: HistoryFilter;
      },
    ): Promise<Result<Conversion[], Error>> {
      let result = conversions.filter((c) => c.fileId === fileId);

      // フィルタ適用
      if (options?.filter) {
        if (options.filter.dateFrom) {
          result = result.filter(
            (c) => c.createdAt >= options.filter!.dateFrom!,
          );
        }
        if (options.filter.dateTo) {
          result = result.filter((c) => c.createdAt <= options.filter!.dateTo!);
        }
        if (options.filter.mimeTypes && options.filter.mimeTypes.length > 0) {
          result = result.filter((c) =>
            options.filter!.mimeTypes!.includes(c.mimeType),
          );
        }
      }

      // ソート
      if (options?.orderDirection === "desc") {
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else {
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }

      // ページネーション
      const offset = options?.offset ?? 0;
      const limit = options?.limit ?? 20;
      result = result.slice(offset, offset + limit);

      return ok(result);
    },

    async findById(
      conversionId: string,
    ): Promise<Result<Conversion | null, Error>> {
      const conversion = conversions.find((c) => c.id === conversionId);
      return ok(conversion ?? null);
    },

    async create(
      data: CreateConversionInput,
    ): Promise<Result<Conversion, Error>> {
      const newConversion: Conversion = {
        id: `conv-${crypto.randomUUID().slice(0, 8)}`,
        fileId: data.fileId,
        fileName: data.fileName,
        createdAt: new Date(),
        mimeType: data.mimeType,
        contentHash: `hash-${crypto.randomUUID().slice(0, 8)}`,
        sizeBytes:
          typeof data.content === "string"
            ? data.content.length
            : data.content.length,
        metadata: data.metadata,
        content: data.content,
      };
      conversions.push(newConversion);
      return ok(newConversion);
    },

    async countByFileId(fileId: string): Promise<Result<number, Error>> {
      const count = conversions.filter((c) => c.fileId === fileId).length;
      return ok(count);
    },
  };
}

/**
 * エラーを返すモック
 */
export function createErrorMockConversionRepository(
  error: Error = new Error("Repository error"),
): ConversionRepository {
  return {
    async findByFileId(): Promise<Result<Conversion[], Error>> {
      return err(error);
    },
    async findById(): Promise<Result<Conversion | null, Error>> {
      return err(error);
    },
    async create(): Promise<Result<Conversion, Error>> {
      return err(error);
    },
    async countByFileId(): Promise<Result<number, Error>> {
      return err(error);
    },
  };
}
