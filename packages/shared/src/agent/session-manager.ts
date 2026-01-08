/**
 * Session Manager
 * @module @repo/shared/agent/session-manager
 */

import { randomUUID } from "crypto";
import type { Session } from "./types";
import { AgentSessionError, AgentErrorCode } from "./errors";

/**
 * セッション最大数
 */
const MAX_SESSIONS = 10;

/**
 * セッション管理クラス
 * - セッションの作成・再開・破棄
 * - LRU方式で最大数を超えた場合は古いセッションを削除
 */
export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  /**
   * 新しいセッションを作成する
   * @returns セッションID
   */
  createSession(): string {
    this.enforceSessionLimit();

    const now = Date.now();
    const session: Session = {
      id: randomUUID(),
      createdAt: now,
      lastAccessedAt: now,
      context: {
        messageIds: [],
      },
    };

    this.sessions.set(session.id, session);
    return session.id;
  }

  /**
   * セッションを取得する
   * @param sessionId セッションID
   * @returns セッション情報、存在しない場合はundefined
   */
  getSession(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessedAt = Date.now();
    }
    return session;
  }

  /**
   * セッションを再開する
   * @param sessionId セッションID
   * @throws AgentSessionError セッションが存在しない場合
   */
  resumeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new AgentSessionError(
        "Session not found",
        AgentErrorCode.SESSION_NOT_FOUND,
      );
    }
    session.lastAccessedAt = Date.now();
  }

  /**
   * セッションを破棄する
   * @param sessionId セッションID
   */
  destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * セッションにメッセージIDを追加する
   * @param sessionId セッションID
   * @param messageId メッセージID
   * @throws AgentSessionError セッションが存在しない場合
   */
  addMessageToSession(sessionId: string, messageId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new AgentSessionError(
        "Session not found",
        AgentErrorCode.SESSION_NOT_FOUND,
      );
    }
    session.context.messageIds.push(messageId);
    session.lastAccessedAt = Date.now();
  }

  /**
   * セッション数を取得する
   * @returns セッション数
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * 全セッションをクリアする
   */
  clearAllSessions(): void {
    this.sessions.clear();
  }

  /**
   * セッション数が上限を超えた場合、最も古いセッションを削除する
   */
  private enforceSessionLimit(): void {
    if (this.sessions.size >= MAX_SESSIONS) {
      let oldestSession: Session | null = null;
      let oldestTime = Infinity;

      for (const session of this.sessions.values()) {
        if (session.lastAccessedAt < oldestTime) {
          oldestTime = session.lastAccessedAt;
          oldestSession = session;
        }
      }

      if (oldestSession) {
        this.sessions.delete(oldestSession.id);
      }
    }
  }
}
