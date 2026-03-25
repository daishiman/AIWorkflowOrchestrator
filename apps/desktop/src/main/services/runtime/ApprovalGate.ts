/**
 * ApprovalGate - Approval token の生成・検証・失効を管理する
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001
 *
 * Main Process で危険操作・外部送信の承認状態を enforcement する。
 * Renderer 側の ApprovalSheet で承認後、IPC 経由で grantApproval() が呼ばれる。
 * 各操作の実行前に checkApproval() で検証する。
 *
 * Security invariants:
 * - token は crypto-safe な乱数で生成（予測不可能）
 * - TTL は 300 秒（R-M1）
 * - 単一操作ごとに失効（再利用不可）
 * - sessionId + operationId の一致が必須
 */

import { randomBytes } from "crypto";

/** Approval 状態を表す判別共用体 */
export type ApprovalStatus =
  | { approved: true; token: string; approvedAt: number }
  | {
      approved: false;
      reason: "not_requested" | "rejected" | "expired" | "already_used";
    };

/** 内部 token ストレージのエントリ */
interface ApprovalEntry {
  token: string;
  sessionId: string;
  operationId: string;
  grantedAt: number;
  used: boolean;
}

/** ApprovalGate の公開インターフェース */
export interface IApprovalGate {
  grantApproval(sessionId: string, operationId: string): ApprovalStatus;
  rejectApproval(sessionId: string, operationId: string): void;
  checkApproval(
    sessionId: string,
    operationId: string,
    token: string,
  ): ApprovalStatus;
  revokeAll(sessionId: string): void;
}

/** Approval token の有効期限（秒） */
const APPROVAL_TTL_SECONDS = 300;

export class DefaultApprovalGate implements IApprovalGate {
  /** sessionId:operationId -> ApprovalEntry */
  private readonly entries = new Map<string, ApprovalEntry>();

  private makeKey(sessionId: string, operationId: string): string {
    return `${sessionId}:${operationId}`;
  }

  private generateToken(): string {
    return randomBytes(32).toString("hex");
  }

  /**
   * Approval を許可し、token を生成して返す。
   * Renderer の ApprovalSheet で「承認」が押された後に呼ばれる。
   */
  grantApproval(sessionId: string, operationId: string): ApprovalStatus {
    const key = this.makeKey(sessionId, operationId);
    const token = this.generateToken();
    const now = Date.now();

    this.entries.set(key, {
      token,
      sessionId,
      operationId,
      grantedAt: now,
      used: false,
    });

    return { approved: true, token, approvedAt: now };
  }

  /**
   * Approval を拒否する。
   * Renderer の ApprovalSheet で「拒否」が押された後に呼ばれる。
   */
  rejectApproval(sessionId: string, operationId: string): void {
    const key = this.makeKey(sessionId, operationId);
    this.entries.delete(key);
  }

  /**
   * Approval token を検証する。
   * 存在 → token 一致 → 使用済み → TTL → 成功 の順で検証する。
   * 成功時は entry を使用済みにし、単一操作失効を保証する。
   */
  checkApproval(
    sessionId: string,
    operationId: string,
    token: string,
  ): ApprovalStatus {
    const key = this.makeKey(sessionId, operationId);
    const entry = this.entries.get(key);

    if (!entry || entry.token !== token) {
      return { approved: false, reason: "not_requested" };
    }
    if (entry.used) {
      return { approved: false, reason: "already_used" };
    }
    if (Date.now() - entry.grantedAt > APPROVAL_TTL_SECONDS * 1000) {
      this.entries.delete(key);
      return { approved: false, reason: "expired" };
    }

    entry.used = true;
    return { approved: true, token: entry.token, approvedAt: entry.grantedAt };
  }

  /**
   * セッション終了時に全 token を無効化する。
   */
  revokeAll(sessionId: string): void {
    for (const [key, entry] of this.entries) {
      if (entry.sessionId === sessionId) {
        this.entries.delete(key);
      }
    }
  }
}
