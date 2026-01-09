/**
 * History Service エクスポート
 *
 * @module @repo/shared/services/history
 */

export { HistoryService } from "./history-service";
export {
  // Zod Schemas
  versionHistoryItemSchema,
  historyFilterSchema,
  paginationOptionsSchema,
  metadataChangeSchema,
  versionDiffSchema,
  // Types
  type VersionHistoryItem,
  type HistoryFilter,
  type PaginationOptions,
  type MetadataChange,
  type VersionDiff,
  type HistoryOptions,
  type PaginatedResult,
  type Conversion,
  type CreateConversionInput,
  type ConversionRepository,
  type FileRepository,
  type IHistoryService,
} from "./types";
