/**
 * History IPC Handlers
 *
 * Handles version history operations between renderer and main process.
 *
 * @module @repo/desktop/main/ipc/historyHandlers
 */
import { ipcMain } from "electron";
import type { BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  PaginationOptions,
  LogFilterOptions,
  Result,
  PaginatedResult,
  VersionHistoryItem,
  VersionDetailData,
  ConversionLog,
} from "../../renderer/components/history/types";

/**
 * History Service Interface
 *
 * Defines the contract for history service operations.
 */
export interface HistoryService {
  getFileHistory(
    fileId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<VersionHistoryItem>>;

  getVersionDetail(conversionId: string): Promise<VersionDetailData>;

  getConversionLogs(
    conversionId: string,
    options?: LogFilterOptions,
  ): Promise<PaginatedResult<ConversionLog>>;

  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<VersionHistoryItem>;
}

/**
 * Creates a success result
 */
function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Creates an error result
 */
function error<T>(err: Error): Result<T> {
  return { success: false, error: err };
}

/**
 * Normalizes an error to a standard Error object
 */
function normalizeError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
  return new Error(String(err) || "Unknown error");
}

/**
 * Validates that a string is not empty
 */
function validateNotEmpty(value: string, fieldName: string): void {
  if (!value || value.trim() === "") {
    throw new Error(`${fieldName} is required and cannot be empty`);
  }
}

/**
 * Registers history IPC handlers
 *
 * @param mainWindow - The main browser window
 * @param historyService - The history service instance
 */
export function registerHistoryHandlers(
  mainWindow: BrowserWindow,
  historyService: HistoryService,
): void {
  // history:getFileHistory
  ipcMain.handle(
    IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
    async (
      _event,
      fileId: string,
      options?: PaginationOptions,
    ): Promise<Result<PaginatedResult<VersionHistoryItem>>> => {
      try {
        validateNotEmpty(fileId, "fileId");
        const result = await historyService.getFileHistory(fileId, options);
        return success(result);
      } catch (err) {
        return error(normalizeError(err));
      }
    },
  );

  // history:getVersionDetail
  ipcMain.handle(
    IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL,
    async (
      _event,
      conversionId: string,
    ): Promise<Result<VersionDetailData>> => {
      try {
        validateNotEmpty(conversionId, "conversionId");
        const result = await historyService.getVersionDetail(conversionId);
        return success(result);
      } catch (err) {
        return error(normalizeError(err));
      }
    },
  );

  // history:getConversionLogs
  ipcMain.handle(
    IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS,
    async (
      _event,
      conversionId: string,
      options?: LogFilterOptions,
    ): Promise<Result<PaginatedResult<ConversionLog>>> => {
      try {
        validateNotEmpty(conversionId, "conversionId");
        const result = await historyService.getConversionLogs(
          conversionId,
          options,
        );
        return success(result);
      } catch (err) {
        return error(normalizeError(err));
      }
    },
  );

  // history:restoreVersion
  ipcMain.handle(
    IPC_CHANNELS.HISTORY_RESTORE_VERSION,
    async (
      _event,
      fileId: string,
      conversionId: string,
    ): Promise<Result<VersionHistoryItem>> => {
      try {
        validateNotEmpty(fileId, "fileId");
        validateNotEmpty(conversionId, "conversionId");
        const result = await historyService.restoreVersion(
          fileId,
          conversionId,
        );
        return success(result);
      } catch (err) {
        return error(normalizeError(err));
      }
    },
  );
}
