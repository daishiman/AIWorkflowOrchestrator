import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  HistorySearchRequest,
  HistorySearchResult,
  HistorySearchStats,
} from "@repo/shared/types";
import {
  IPC_ERROR_CODES,
  toIPCValidationError,
  validateIpcSender,
  type IPCValidationResult,
} from "../infrastructure/security/ipc-validator";
import { sanitizeErrorMessage } from "./sanitizeErrorMessage";

interface IpcError {
  code: string;
  message: string;
}

interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: IpcError;
}

export interface HistorySearchService {
  search: (request: HistorySearchRequest) => Promise<HistorySearchResult>;
  getStats: () => Promise<HistorySearchStats>;
}

export interface HistorySearchHandlerOptions {
  mainWindow?: BrowserWindow;
  validateSender?: (
    event: IpcMainInvokeEvent,
    channel: string,
  ) => IPCValidationResult;
}

function success<T>(data: T): IpcResult<T> {
  return { success: true, data };
}

function failure(code: string, message: string): IpcResult<never> {
  return { success: false, error: { code, message } };
}

function validateQuery(
  query: unknown,
): { valid: true; value: string } | { valid: false; message: string } {
  // P42: typeof チェック
  if (typeof query !== "string") {
    return { valid: false, message: "query must be a string" };
  }

  // P42: 空文字チェック（空文字は全件検索として許容）
  if (query === "") {
    return { valid: true, value: query };
  }

  // P42: trim空文字チェック（空白のみは全件検索として許容）
  if (query.trim() === "") {
    return { valid: true, value: query };
  }

  return { valid: true, value: query };
}

function validateFilter(
  filter: unknown,
): filter is HistorySearchRequest["filter"] {
  return (
    filter === "all" ||
    filter === "chat" ||
    filter === "file" ||
    filter === "skill"
  );
}

function normalizePagination(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  if (!Number.isInteger(value) || value < 0) {
    return fallback;
  }
  return value;
}

export function createHistorySearchService(): HistorySearchService {
  return {
    async search(_request) {
      return {
        items: [],
        totalCount: 0,
        hasMore: false,
      };
    },

    async getStats() {
      return {
        chat: 0,
        file: 0,
        skill: 0,
        total: 0,
      };
    },
  };
}

function validateSender(
  event: IpcMainInvokeEvent,
  channel: string,
  options: HistorySearchHandlerOptions,
): IPCValidationResult {
  if (options.validateSender) {
    return options.validateSender(event, channel);
  }

  if (options.mainWindow) {
    return validateIpcSender(event, channel, {
      getAllowedWindows: () => [options.mainWindow!],
    });
  }

  return {
    valid: false,
    errorCode: IPC_ERROR_CODES.UNAUTHORIZED,
    errorMessage: "Unauthorized IPC call: sender validation context is missing",
    webContentsId: -1,
    windowId: null,
  };
}

export function registerHistorySearchHandlers(
  service: HistorySearchService,
  options: HistorySearchHandlerOptions = {},
): void {
  ipcMain.handle(
    IPC_CHANNELS.HISTORY_SEARCH,
    async (
      event,
      request: Partial<HistorySearchRequest> = {},
    ): Promise<IpcResult<HistorySearchResult>> => {
      const senderValidation = validateSender(
        event,
        IPC_CHANNELS.HISTORY_SEARCH,
        options,
      );
      if (!senderValidation.valid) {
        return toIPCValidationError(senderValidation);
      }

      const queryValidation = validateQuery(request.query);
      if (!queryValidation.valid) {
        return failure("VALIDATION_ERROR", queryValidation.message);
      }

      const filter = request.filter ?? "all";
      if (!validateFilter(filter)) {
        return failure("VALIDATION_ERROR", "filter is invalid");
      }

      const normalizedRequest: HistorySearchRequest = {
        query: queryValidation.value,
        filter,
        limit: normalizePagination(request.limit, 30),
        offset: normalizePagination(request.offset, 0),
      };

      try {
        const data = await service.search(normalizedRequest);
        return success(data);
      } catch (error) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(error, "Failed to search history"),
        );
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.HISTORY_GET_STATS,
    async (event): Promise<IpcResult<HistorySearchStats>> => {
      const validation = validateSender(
        event,
        IPC_CHANNELS.HISTORY_GET_STATS,
        options,
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      try {
        const data = await service.getStats();
        return success(data);
      } catch (error) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(error, "Failed to get history search stats"),
        );
      }
    },
  );
}
