/**
 * Session Persistence IPC Handler
 * @module session-persistence-handler
 */

import { ipcMain } from "electron";
import { z } from "zod";
import type {
  PersistedSession,
  PersistedMessage,
  StorageStats,
  CleanupResult,
  IPCResponse,
  IPCErrorResponse,
} from "@repo/shared/types/agent";
import { SessionPersistenceError } from "@repo/shared/types/agent";
import {
  persistedSessionSchema,
  persistedMessageSchema,
} from "@repo/shared/agent";
import type { SessionPersistenceService } from "../services/session/SessionPersistenceService";

/**
 * エラーハンドリングヘルパー
 */
function handleError(error: unknown): IPCErrorResponse {
  if (error instanceof SessionPersistenceError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };
  }
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: error.flatten(),
      },
    };
  }
  console.error("Unexpected error in session persistence handler:", error);
  return {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    },
  };
}

/**
 * セッション永続化IPCハンドラーを登録
 */
export function registerSessionPersistenceHandlers(
  service: SessionPersistenceService,
): void {
  // セッション一覧取得
  ipcMain.handle(
    "session:persist:load",
    async (): Promise<IPCResponse<PersistedSession[]>> => {
      try {
        const sessions = await service.loadSessions();
        return { success: true, data: sessions };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // セッション保存
  ipcMain.handle(
    "session:persist:save",
    async (
      _,
      { session }: { session: PersistedSession },
    ): Promise<IPCResponse<void>> => {
      try {
        const validated = persistedSessionSchema.parse(session);
        await service.saveSession(validated);
        return { success: true, data: undefined };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // セッション削除
  ipcMain.handle(
    "session:persist:delete",
    async (
      _,
      { sessionId }: { sessionId: string },
    ): Promise<IPCResponse<void>> => {
      try {
        await service.deleteSession(sessionId);
        return { success: true, data: undefined };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // セッション更新
  ipcMain.handle(
    "session:persist:update",
    async (
      _,
      {
        sessionId,
        updates,
      }: { sessionId: string; updates: Partial<PersistedSession> },
    ): Promise<IPCResponse<void>> => {
      try {
        await service.updateSession(sessionId, updates);
        return { success: true, data: undefined };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // メッセージ読み込み
  ipcMain.handle(
    "session:persist:loadMessages",
    async (
      _,
      {
        sessionId,
        options,
      }: { sessionId: string; options?: { limit?: number; offset?: number } },
    ): Promise<IPCResponse<PersistedMessage[]>> => {
      try {
        const messages = await service.loadMessages(sessionId, options);
        return { success: true, data: messages };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // メッセージ保存
  ipcMain.handle(
    "session:persist:saveMessage",
    async (
      _,
      { message }: { message: PersistedMessage },
    ): Promise<IPCResponse<void>> => {
      try {
        const validated = persistedMessageSchema.parse(message);
        await service.saveMessage(validated);
        return { success: true, data: undefined };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // 全クリア
  ipcMain.handle(
    "session:persist:clearAll",
    async (
      _,
      { confirm }: { confirm: boolean },
    ): Promise<IPCResponse<void>> => {
      try {
        if (!confirm) {
          return {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Confirmation required",
            },
          };
        }
        await service.clearAll();
        return { success: true, data: undefined };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // 統計取得
  ipcMain.handle(
    "session:persist:getStats",
    async (): Promise<IPCResponse<StorageStats>> => {
      try {
        const stats = await service.getStorageStats();
        return { success: true, data: stats };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // クリーンアップ
  ipcMain.handle(
    "session:persist:cleanup",
    async (
      _,
      { targetUsageRatio }: { targetUsageRatio?: number },
    ): Promise<IPCResponse<CleanupResult>> => {
      try {
        const result = await service.enforceStorageLimits(targetUsageRatio);
        return { success: true, data: result };
      } catch (error) {
        return handleError(error);
      }
    },
  );
}

/**
 * セッション永続化IPCハンドラーを解除
 */
export function unregisterSessionPersistenceHandlers(): void {
  const channels = [
    "session:persist:load",
    "session:persist:save",
    "session:persist:delete",
    "session:persist:update",
    "session:persist:loadMessages",
    "session:persist:saveMessage",
    "session:persist:clearAll",
    "session:persist:getStats",
    "session:persist:cleanup",
  ];

  for (const channel of channels) {
    ipcMain.removeHandler(channel);
  }
}
