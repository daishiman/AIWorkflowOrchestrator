/**
 * SessionStorage - electron-storeのラッパークラス
 * @module SessionStorage
 */

import Store from "electron-store";
import type {
  PersistedSession,
  PersistedMessage,
  StorageMetadata,
  SessionStorageSchema,
} from "@repo/shared/types/agent";
import {
  persistedSessionSchema,
  persistedMessageSchema,
} from "@repo/shared/agent";
import { z } from "zod";

const SCHEMA_VERSION = "1.0.0";

/**
 * SessionStorageのオプション
 */
export interface SessionStorageOptions {
  /** ストア名 */
  name?: string;
}

/**
 * セッションデータの永続化ストレージ
 */
export class SessionStorage {
  private store: Store<SessionStorageSchema>;

  constructor(options: SessionStorageOptions = {}) {
    const name = options.name || "agent-sessions";

    this.store = new Store<SessionStorageSchema>({
      name,
      defaults: {
        sessions: [],
        messages: {},
        metadata: {
          version: SCHEMA_VERSION,
          lastUpdated: Date.now(),
          totalSize: 0,
        },
      },
    });
  }

  /**
   * 全セッションを取得
   */
  getSessions(options?: { skipInvalid?: boolean }): PersistedSession[] {
    const sessions = this.store.get("sessions") || [];

    if (options?.skipInvalid) {
      return sessions.filter((session) => {
        const result = persistedSessionSchema.safeParse(session);
        return result.success;
      });
    }

    return sessions;
  }

  /**
   * セッション一覧を保存
   */
  setSessions(sessions: PersistedSession[]): void {
    // バリデーション
    const validated = z.array(persistedSessionSchema).safeParse(sessions);
    if (!validated.success) {
      throw new Error(
        `Invalid session data: ${validated.error.flatten().formErrors.join(", ")}`,
      );
    }

    this.store.set("sessions", sessions);
    this.updateMetadataTimestamp();
  }

  /**
   * 特定セッションのメッセージを取得
   */
  getMessages(sessionId: string): PersistedMessage[] {
    const allMessages = this.store.get("messages") || {};
    return allMessages[sessionId] || [];
  }

  /**
   * 特定セッションのメッセージを保存
   */
  setMessages(sessionId: string, messages: PersistedMessage[]): void {
    // バリデーション
    const validated = z.array(persistedMessageSchema).safeParse(messages);
    if (!validated.success) {
      throw new Error(
        `Invalid message data: ${validated.error.flatten().formErrors.join(", ")}`,
      );
    }

    const allMessages = this.store.get("messages") || {};
    allMessages[sessionId] = messages;
    this.store.set("messages", allMessages);
    this.updateMetadataTimestamp();
  }

  /**
   * 特定セッションのメッセージを削除
   */
  deleteMessages(sessionId: string): void {
    const allMessages = this.store.get("messages") || {};
    delete allMessages[sessionId];
    this.store.set("messages", allMessages);
    this.updateMetadataTimestamp();
  }

  /**
   * メタデータを取得
   */
  getMetadata(): StorageMetadata {
    return (
      this.store.get("metadata") || {
        version: SCHEMA_VERSION,
        lastUpdated: Date.now(),
        totalSize: 0,
      }
    );
  }

  /**
   * メタデータを更新
   */
  setMetadata(metadata: StorageMetadata): void {
    this.store.set("metadata", metadata);
  }

  /**
   * 全データをクリア
   */
  clear(): void {
    this.store.clear();
    // デフォルト値を再設定
    this.store.set("sessions", []);
    this.store.set("messages", {});
    this.store.set("metadata", {
      version: SCHEMA_VERSION,
      lastUpdated: Date.now(),
      totalSize: 0,
    });
  }

  /**
   * ストレージサイズを計算（概算）
   */
  calculateSize(): number {
    const sessions = this.getSessions();
    const allMessages = this.store.get("messages") || {};

    const sessionsSize = JSON.stringify(sessions).length;
    const messagesSize = JSON.stringify(allMessages).length;
    const metadataSize = JSON.stringify(this.getMetadata()).length;

    return sessionsSize + messagesSize + metadataSize;
  }

  /**
   * ストレージファイルパスを取得
   */
  get path(): string {
    return this.store.path;
  }

  /**
   * 内部ストアへの直接アクセス（テスト用）
   */
  get rawStore(): Store<SessionStorageSchema> {
    return this.store;
  }

  /**
   * メタデータのタイムスタンプを更新
   */
  private updateMetadataTimestamp(): void {
    const metadata = this.getMetadata();
    metadata.lastUpdated = Date.now();
    metadata.totalSize = this.calculateSize();
    this.store.set("metadata", metadata);
  }
}
