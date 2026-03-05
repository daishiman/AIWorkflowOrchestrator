import { IPC_CHANNELS } from "../channels";
import type {
  HistorySearchRequest,
  HistorySearchResult,
  HistorySearchStats,
} from "@repo/shared/types";

export type NotificationType = "info" | "success" | "warning" | "error";

export type NotificationSource =
  | { kind: "skill_execution"; skillName: string }
  | { kind: "file_operation"; fileName: string; operation: string }
  | { kind: "system"; eventType: string };

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  detail?: string;
  timestamp: string;
  isRead: boolean;
  source: NotificationSource;
}

export interface NotificationGetHistoryRequest {
  limit?: number;
  offset?: number;
}

export interface NotificationGetHistoryResponse {
  success: boolean;
  data?: {
    notifications: Notification[];
    totalCount: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface NotificationMarkReadResponse {
  success: boolean;
  data?: { updated: boolean };
  error?: { code: string; message: string };
}

export interface NotificationMarkAllReadResponse {
  success: boolean;
  data?: { updatedCount: number };
  error?: { code: string; message: string };
}

export interface NotificationClearResponse {
  success: boolean;
  data?: { deletedCount: number };
  error?: { code: string; message: string };
}

export interface HistorySearchResponse {
  success: boolean;
  data?: HistorySearchResult;
  error?: { code: string; message: string };
}

export interface HistorySearchStatsResponse {
  success: boolean;
  data?: HistorySearchStats;
  error?: { code: string; message: string };
}

export interface NotificationAPI {
  getHistory: (
    request?: NotificationGetHistoryRequest,
  ) => Promise<NotificationGetHistoryResponse>;
  markRead: (request: {
    notificationId: string;
  }) => Promise<NotificationMarkReadResponse>;
  markAllRead: () => Promise<NotificationMarkAllReadResponse>;
  clear: () => Promise<NotificationClearResponse>;
  onNew: (
    callback: (event: { notification: Notification }) => void,
  ) => () => void;
}

export interface HistorySearchAPI {
  search: (request: HistorySearchRequest) => Promise<HistorySearchResponse>;
  getStats: () => Promise<HistorySearchStatsResponse>;
}

type Invoke = <T>(channel: string, ...args: unknown[]) => Promise<T>;
type On = <T>(channel: string, callback: (data: T) => void) => () => void;

export function createNotificationAPI(
  safeInvoke: Invoke,
  safeOn: On,
): NotificationAPI {
  return {
    getHistory: (request = {}) =>
      safeInvoke<NotificationGetHistoryResponse>(
        IPC_CHANNELS.NOTIFICATION_GET_HISTORY,
        request,
      ),
    markRead: (request) =>
      safeInvoke<NotificationMarkReadResponse>(
        IPC_CHANNELS.NOTIFICATION_MARK_READ,
        request,
      ),
    markAllRead: () =>
      safeInvoke<NotificationMarkAllReadResponse>(
        IPC_CHANNELS.NOTIFICATION_MARK_ALL_READ,
      ),
    clear: () =>
      safeInvoke<NotificationClearResponse>(IPC_CHANNELS.NOTIFICATION_CLEAR),
    onNew: (callback) =>
      safeOn<{ notification: Notification }>(
        IPC_CHANNELS.NOTIFICATION_NEW,
        callback,
      ),
  };
}

export function createHistorySearchAPI(safeInvoke: Invoke): HistorySearchAPI {
  return {
    search: (request) =>
      safeInvoke<HistorySearchResponse>(IPC_CHANNELS.HISTORY_SEARCH, request),
    getStats: () =>
      safeInvoke<HistorySearchStatsResponse>(IPC_CHANNELS.HISTORY_GET_STATS),
  };
}
