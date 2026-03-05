import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from "electron";
import Store from "electron-store";
import { IPC_CHANNELS } from "../../preload/channels";
import {
  IPC_ERROR_CODES,
  toIPCValidationError,
  validateIpcSender,
  type IPCValidationResult,
} from "../infrastructure/security/ipc-validator";
import { sanitizeErrorMessage } from "./sanitizeErrorMessage";

type NotificationType = "info" | "success" | "warning" | "error";

interface NotificationRecord {
  id: string;
  type: NotificationType;
  title: string;
  detail?: string;
  timestamp: string;
  isRead: boolean;
  source: Record<string, unknown>;
}

interface NotificationStoreSchema {
  notifications: NotificationRecord[];
}

export interface NotificationHistoryRequest {
  limit?: number;
  offset?: number;
}

export interface NotificationHistoryResult {
  notifications: NotificationRecord[];
  totalCount: number;
}

interface IpcError {
  code: string;
  message: string;
}

interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: IpcError;
}

export interface NotificationService {
  getHistory: (
    request: NotificationHistoryRequest,
  ) => Promise<NotificationHistoryResult>;
  markRead: (notificationId: string) => Promise<{ updated: boolean }>;
  markAllRead: () => Promise<{ updatedCount: number }>;
  clear: () => Promise<{ deletedCount: number }>;
}

export interface NotificationHandlerOptions {
  mainWindow?: BrowserWindow;
  validateSender?: (
    event: IpcMainInvokeEvent,
    channel: string,
  ) => IPCValidationResult;
}

const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

function success<T>(data: T): IpcResult<T> {
  return { success: true, data };
}

function failure(code: string, message: string): IpcResult<never> {
  return {
    success: false,
    error: { code, message },
  };
}

function validateRequiredString(
  value: unknown,
  fieldName: string,
): { valid: true } | { valid: false; message: string } {
  if (typeof value !== "string") {
    return { valid: false, message: `${fieldName} must be a string` };
  }

  if (value === "") {
    return { valid: false, message: `${fieldName} must not be empty` };
  }

  if (value.trim() === "") {
    return { valid: false, message: `${fieldName} must not be blank` };
  }

  return { valid: true };
}

function normalizePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  if (!Number.isInteger(value) || value < 0) {
    return fallback;
  }

  return value;
}

function readNotifications(
  store: Store<NotificationStoreSchema>,
): NotificationRecord[] {
  const notifications = store.get("notifications", []);
  return Array.isArray(notifications) ? notifications : [];
}

function writeNotifications(
  store: Store<NotificationStoreSchema>,
  notifications: NotificationRecord[],
): void {
  store.set("notifications", notifications);
}

export function createNotificationService(): NotificationService {
  const store = new Store<NotificationStoreSchema>({
    name: "notification-history",
    defaults: {
      notifications: [],
    },
  });

  return {
    async getHistory(request) {
      const limit = normalizePositiveInt(request.limit, DEFAULT_LIMIT);
      const offset = normalizePositiveInt(request.offset, DEFAULT_OFFSET);
      const notifications = readNotifications(store);

      return {
        notifications: notifications.slice(offset, offset + limit),
        totalCount: notifications.length,
      };
    },

    async markRead(notificationId) {
      const notifications = readNotifications(store);
      let updated = false;
      const next = notifications.map((notification) => {
        if (notification.id !== notificationId || notification.isRead) {
          return notification;
        }
        updated = true;
        return { ...notification, isRead: true };
      });
      if (updated) {
        writeNotifications(store, next);
      }

      return { updated };
    },

    async markAllRead() {
      const notifications = readNotifications(store);
      let updatedCount = 0;
      const next = notifications.map((notification) => {
        if (notification.isRead) {
          return notification;
        }
        updatedCount += 1;
        return { ...notification, isRead: true };
      });

      if (updatedCount > 0) {
        writeNotifications(store, next);
      }

      return { updatedCount };
    },

    async clear() {
      const notifications = readNotifications(store);
      writeNotifications(store, []);
      return { deletedCount: notifications.length };
    },
  };
}

function validateSender(
  event: IpcMainInvokeEvent,
  channel: string,
  options: NotificationHandlerOptions,
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

export function registerNotificationHandlers(
  service: NotificationService,
  options: NotificationHandlerOptions = {},
): void {
  ipcMain.handle(
    IPC_CHANNELS.NOTIFICATION_GET_HISTORY,
    async (
      event,
      request: NotificationHistoryRequest = {},
    ): Promise<IpcResult<NotificationHistoryResult>> => {
      const validation = validateSender(
        event,
        IPC_CHANNELS.NOTIFICATION_GET_HISTORY,
        options,
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      try {
        const data = await service.getHistory(request);
        return success(data);
      } catch (error) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(error, "Failed to get notifications"),
        );
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.NOTIFICATION_MARK_READ,
    async (
      event,
      request: { notificationId?: unknown } = {},
    ): Promise<IpcResult<{ updated: boolean }>> => {
      const senderValidation = validateSender(
        event,
        IPC_CHANNELS.NOTIFICATION_MARK_READ,
        options,
      );
      if (!senderValidation.valid) {
        return toIPCValidationError(senderValidation);
      }

      const validation = validateRequiredString(
        request.notificationId,
        "notificationId",
      );

      if (!validation.valid) {
        return failure("VALIDATION_ERROR", validation.message);
      }

      try {
        const notificationId = request.notificationId as string;
        const data = await service.markRead(notificationId);
        return success(data);
      } catch (error) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(error, "Failed to mark notification"),
        );
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.NOTIFICATION_MARK_ALL_READ,
    async (event): Promise<IpcResult<{ updatedCount: number }>> => {
      const validation = validateSender(
        event,
        IPC_CHANNELS.NOTIFICATION_MARK_ALL_READ,
        options,
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      try {
        const data = await service.markAllRead();
        return success(data);
      } catch (error) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(error, "Failed to mark all notifications"),
        );
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.NOTIFICATION_CLEAR,
    async (event): Promise<IpcResult<{ deletedCount: number }>> => {
      const validation = validateSender(
        event,
        IPC_CHANNELS.NOTIFICATION_CLEAR,
        options,
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      try {
        const data = await service.clear();
        return success(data);
      } catch (error) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(error, "Failed to clear notifications"),
        );
      }
    },
  );
}
