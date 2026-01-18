/**
 * SessionPersistenceService - セッション永続化サービス
 * @module SessionPersistenceService
 */

import type {
  PersistedSession,
  PersistedMessage,
  SessionPersistenceConfig,
  StorageStats,
  CleanupResult,
} from "@repo/shared/types/agent";
import {
  SessionPersistenceError,
  DEFAULT_PERSISTENCE_CONFIG,
} from "@repo/shared/types/agent";
import {
  persistedSessionSchema,
  persistedMessageSchema,
} from "@repo/shared/agent";
import { SessionStorage } from "./SessionStorage";

/**
 * セッション永続化サービスのオプション
 */
export interface SessionPersistenceServiceOptions extends Partial<SessionPersistenceConfig> {
  /** ストア名（テスト用） */
  storeName?: string;
}

/**
 * セッション永続化サービス
 * セッションとメッセージの永続化を管理
 */
export class SessionPersistenceService {
  private storage: SessionStorage;
  private config: SessionPersistenceConfig;

  constructor(options: SessionPersistenceServiceOptions = {}) {
    this.storage = new SessionStorage({ name: options.storeName });
    this.config = {
      ...DEFAULT_PERSISTENCE_CONFIG,
      ...options,
    };
  }

  /**
   * 全セッションを読み込む
   * lastAccessedAtの降順でソート
   */
  async loadSessions(): Promise<PersistedSession[]> {
    try {
      const sessions = this.storage.getSessions();
      return sessions.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
    } catch (error) {
      throw new SessionPersistenceError(
        "Failed to load sessions",
        "STORAGE_READ_ERROR",
        error,
      );
    }
  }

  /**
   * セッションを保存
   */
  async saveSession(session: PersistedSession): Promise<void> {
    // バリデーション
    const validated = persistedSessionSchema.safeParse(session);
    if (!validated.success) {
      throw new SessionPersistenceError(
        `Invalid session data: ${validated.error.message}`,
        "VALIDATION_ERROR",
        validated.error,
      );
    }

    try {
      const sessions = this.storage.getSessions();
      const existingIndex = sessions.findIndex((s) => s.id === session.id);

      // lastAccessedAtを更新
      const sessionToSave: PersistedSession = {
        ...validated.data,
        lastAccessedAt: Date.now(),
      };

      if (existingIndex >= 0) {
        sessions[existingIndex] = sessionToSave;
      } else {
        sessions.push(sessionToSave);
      }

      this.storage.setSessions(sessions);
    } catch (error) {
      if (error instanceof SessionPersistenceError) {
        throw error;
      }
      throw new SessionPersistenceError(
        "Failed to save session",
        "STORAGE_WRITE_ERROR",
        error,
      );
    }
  }

  /**
   * セッションを削除
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = this.storage.getSessions();
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId);

      if (sessionIndex < 0) {
        throw new SessionPersistenceError(
          `Session not found: ${sessionId}`,
          "SESSION_NOT_FOUND",
        );
      }

      // セッションを削除
      sessions.splice(sessionIndex, 1);
      this.storage.setSessions(sessions);

      // 関連メッセージも削除
      this.storage.deleteMessages(sessionId);
    } catch (error) {
      if (error instanceof SessionPersistenceError) {
        throw error;
      }
      throw new SessionPersistenceError(
        "Failed to delete session",
        "STORAGE_WRITE_ERROR",
        error,
      );
    }
  }

  /**
   * セッションを更新
   */
  async updateSession(
    sessionId: string,
    updates: Partial<Omit<PersistedSession, "id" | "createdAt">>,
  ): Promise<void> {
    try {
      const sessions = this.storage.getSessions();
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId);

      if (sessionIndex < 0) {
        throw new SessionPersistenceError(
          `Session not found: ${sessionId}`,
          "SESSION_NOT_FOUND",
        );
      }

      const existingSession = sessions[sessionIndex];

      // id と createdAt は更新不可
      const updatedSession: PersistedSession = {
        ...existingSession,
        ...updates,
        id: existingSession.id,
        createdAt: existingSession.createdAt,
        lastAccessedAt: Date.now(),
      };

      // バリデーション
      const validated = persistedSessionSchema.safeParse(updatedSession);
      if (!validated.success) {
        throw new SessionPersistenceError(
          `Invalid session data: ${validated.error.message}`,
          "VALIDATION_ERROR",
          validated.error,
        );
      }

      sessions[sessionIndex] = validated.data;
      this.storage.setSessions(sessions);
    } catch (error) {
      if (error instanceof SessionPersistenceError) {
        throw error;
      }
      throw new SessionPersistenceError(
        "Failed to update session",
        "STORAGE_WRITE_ERROR",
        error,
      );
    }
  }

  /**
   * セッションのメッセージを読み込む
   */
  async loadMessages(
    sessionId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<PersistedMessage[]> {
    try {
      const messages = this.storage.getMessages(sessionId);

      // ページネーション
      const offset = options?.offset || 0;
      const limit = options?.limit;

      if (limit !== undefined) {
        return messages.slice(offset, offset + limit);
      }
      return messages.slice(offset);
    } catch (error) {
      throw new SessionPersistenceError(
        "Failed to load messages",
        "STORAGE_READ_ERROR",
        error,
      );
    }
  }

  /**
   * メッセージを保存
   */
  async saveMessage(message: PersistedMessage): Promise<void> {
    // バリデーション
    const validated = persistedMessageSchema.safeParse(message);
    if (!validated.success) {
      throw new SessionPersistenceError(
        `Invalid message data: ${validated.error.message}`,
        "VALIDATION_ERROR",
        validated.error,
      );
    }

    try {
      const messages = this.storage.getMessages(message.sessionId);
      const existingIndex = messages.findIndex((m) => m.id === message.id);

      if (existingIndex >= 0) {
        messages[existingIndex] = validated.data;
      } else {
        messages.push(validated.data);
      }

      this.storage.setMessages(message.sessionId, messages);

      // セッションのmessageCountを更新
      await this.updateSessionMessageCount(message.sessionId, messages.length);
    } catch (error) {
      if (error instanceof SessionPersistenceError) {
        throw error;
      }
      throw new SessionPersistenceError(
        "Failed to save message",
        "STORAGE_WRITE_ERROR",
        error,
      );
    }
  }

  /**
   * 全データを削除
   */
  async clearAll(): Promise<void> {
    try {
      this.storage.clear();
    } catch (error) {
      throw new SessionPersistenceError(
        "Failed to clear all data",
        "STORAGE_WRITE_ERROR",
        error,
      );
    }
  }

  /**
   * ストレージ統計を取得
   */
  async getStorageStats(): Promise<StorageStats> {
    try {
      const sessions = this.storage.getSessions();
      const metadata = this.storage.getMetadata();

      let totalMessages = 0;
      for (const session of sessions) {
        totalMessages += session.messageCount;
      }

      const usedSize = this.storage.calculateSize();
      const maxSize = this.config.maxStorageSize;

      return {
        totalSessions: sessions.length,
        totalMessages,
        usedSize,
        maxSize,
        usageRatio: maxSize > 0 ? usedSize / maxSize : 0,
        lastUpdated: metadata.lastUpdated,
      };
    } catch (error) {
      throw new SessionPersistenceError(
        "Failed to get storage stats",
        "STORAGE_READ_ERROR",
        error,
      );
    }
  }

  /**
   * LRU削除を実行
   */
  async enforceStorageLimits(
    targetUsageRatio: number = 0.8,
  ): Promise<CleanupResult> {
    try {
      const stats = await this.getStorageStats();
      const sessions = await this.loadSessions();

      // 使用率が閾値未満かつセッション数が上限以下なら何もしない
      const needsStorageCleanup =
        stats.usageRatio >= this.config.lruWarningThreshold;
      const needsSessionCleanup = sessions.length > this.config.maxSessions;

      if (!needsStorageCleanup && !needsSessionCleanup) {
        return {
          deletedSessions: 0,
          deletedMessages: 0,
          freedSize: 0,
          deletedSessionIds: [],
        };
      }

      // セッション数が上限を超えている場合も削除
      const sessionsToDelete: PersistedSession[] = [];

      // 古い順にソート
      const sortedSessions = [...sessions].sort(
        (a, b) => a.lastAccessedAt - b.lastAccessedAt,
      );

      let currentUsage = stats.usedSize;
      const targetSize = this.config.maxStorageSize * targetUsageRatio;
      let currentSessionCount = sessions.length;

      for (const session of sortedSessions) {
        // 目標サイズに達した && セッション数が上限以下なら終了
        if (
          currentUsage <= targetSize &&
          currentSessionCount <= this.config.maxSessions
        ) {
          break;
        }

        // セッションのサイズを推定
        const messages = this.storage.getMessages(session.id);
        const sessionSize = this.estimateSize(session, messages);

        sessionsToDelete.push(session);
        currentUsage -= sessionSize;
        currentSessionCount--;
      }

      // 削除実行
      let totalDeletedMessages = 0;
      let totalFreedSize = 0;
      const deletedSessionIds: string[] = [];

      for (const session of sessionsToDelete) {
        const messages = this.storage.getMessages(session.id);
        const sessionSize = this.estimateSize(session, messages);

        await this.deleteSession(session.id);

        totalDeletedMessages += messages.length;
        totalFreedSize += sessionSize;
        deletedSessionIds.push(session.id);
      }

      return {
        deletedSessions: sessionsToDelete.length,
        deletedMessages: totalDeletedMessages,
        freedSize: totalFreedSize,
        deletedSessionIds,
      };
    } catch (error) {
      if (error instanceof SessionPersistenceError) {
        throw error;
      }
      throw new SessionPersistenceError(
        "Failed to enforce storage limits",
        "STORAGE_WRITE_ERROR",
        error,
      );
    }
  }

  /**
   * セッションのメッセージ数を更新
   */
  private async updateSessionMessageCount(
    sessionId: string,
    messageCount: number,
  ): Promise<void> {
    const sessions = this.storage.getSessions();
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);

    if (sessionIndex >= 0) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        messageCount,
        lastAccessedAt: Date.now(),
      };
      this.storage.setSessions(sessions);
    }
  }

  /**
   * セッションとメッセージのサイズを推定
   */
  private estimateSize(
    session: PersistedSession,
    messages: PersistedMessage[],
  ): number {
    const sessionSize = JSON.stringify(session).length;
    const messagesSize = JSON.stringify(messages).length;
    return sessionSize + messagesSize;
  }
}
