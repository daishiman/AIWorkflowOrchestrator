/**
 * PermissionResolver - 権限確認リクエストの待機・解決を管理
 *
 * TASK-3-2: PermissionResolver 実装
 * Phase 8: リファクタリング（TDD: Refactor）
 *
 * Renderer から IPC 経由で送られる権限応答を受け取り、
 * 待機中のリクエストを解決する。
 */

import type { SkillPermissionResponse } from "@repo/shared";

/** デフォルトのタイムアウト時間（5分） */
const DEFAULT_TIMEOUT_MS = 300_000;

/** エラーメッセージ生成関数 */
const ErrorMessages = {
  timeout: (requestId: string) => `Permission request timed out: ${requestId}`,
  aborted: (requestId: string) => `Permission request aborted: ${requestId}`,
  cancelled: (requestId: string, reason?: string) =>
    reason || `Request cancelled: ${requestId}`,
} as const;

/**
 * 待機中リクエストの内部表現
 */
interface PendingRequest {
  /** Promise を解決する関数 */
  resolve: (response: SkillPermissionResponse) => void;
  /** Promise を拒否する関数 */
  reject: (error: Error) => void;
  /** タイムアウト用タイマーID */
  timeoutId: NodeJS.Timeout;
}

/**
 * 権限確認リクエストの待機・解決を管理するクラス
 *
 * Main Process で使用し、Renderer からの IPC 応答を待機・解決する。
 * SkillExecutor と連携し、Claude Agent SDK の Hooks 機能からの
 * 権限確認リクエストをユーザー応答まで待機し、その結果を返す。
 *
 * @example
 * ```typescript
 * const resolver = new PermissionResolver();
 *
 * // 権限応答を待機
 * const promise = resolver.waitForResponse(requestId);
 *
 * // 別のコンテキスト（IPC Handler）で解決
 * resolver.resolveRequest({ requestId, approved: true });
 *
 * const response = await promise;
 * ```
 */
export class PermissionResolver {
  /** 待機中のリクエストを管理する Map（O(1) アクセス） */
  private readonly pendingRequests: Map<string, PendingRequest> = new Map();
  /** デフォルトタイムアウト（ミリ秒） */
  private readonly defaultTimeout: number;

  /**
   * コンストラクタ
   * @param defaultTimeout タイムアウト時間（ミリ秒）。デフォルト: 300000（5分）
   */
  constructor(defaultTimeout: number = DEFAULT_TIMEOUT_MS) {
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * 権限応答を待機
   *
   * @param requestId リクエストID
   * @param signal AbortSignal（キャンセル用）
   * @returns 権限応答
   * @throws {Error} タイムアウトまたはキャンセル時
   */
  waitForResponse(
    requestId: string,
    signal?: AbortSignal,
  ): Promise<SkillPermissionResponse> {
    return new Promise((resolve, reject) => {
      // 既に abort されている場合は即座に reject
      if (signal?.aborted) {
        reject(new Error(ErrorMessages.aborted(requestId)));
        return;
      }

      const timeoutId = this.setupTimeout(requestId, reject);

      if (signal) {
        this.setupAbortHandler(requestId, signal, timeoutId, reject);
      }

      // 保留リクエストを登録
      this.pendingRequests.set(requestId, { resolve, reject, timeoutId });
    });
  }

  /**
   * 権限リクエストを解決
   *
   * @param response 権限応答
   * @remarks 存在しない requestId の場合は何もしない
   */
  resolveRequest(response: SkillPermissionResponse): void {
    const pending = this.pendingRequests.get(response.requestId);
    if (!pending) return;

    this.cleanup(response.requestId, pending.timeoutId);
    pending.resolve(response);
  }

  /**
   * 保留中のリクエストをキャンセル
   *
   * @param requestId リクエストID
   * @param reason キャンセル理由
   * @remarks 存在しない requestId の場合は何もしない
   */
  cancelRequest(requestId: string, reason?: string): void {
    const pending = this.pendingRequests.get(requestId);
    if (!pending) return;

    this.cleanup(requestId, pending.timeoutId);
    pending.reject(new Error(ErrorMessages.cancelled(requestId, reason)));
  }

  /**
   * 全ての保留中リクエストをキャンセル
   */
  cancelAll(): void {
    for (const [requestId, pending] of this.pendingRequests) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error(ErrorMessages.cancelled(requestId)));
    }
    this.pendingRequests.clear();
  }

  /**
   * 保留中のリクエスト数を取得
   */
  get pendingCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * タイムアウトを設定
   * @private
   */
  private setupTimeout(
    requestId: string,
    reject: (error: Error) => void,
  ): NodeJS.Timeout {
    return setTimeout(() => {
      this.pendingRequests.delete(requestId);
      reject(new Error(ErrorMessages.timeout(requestId)));
    }, this.defaultTimeout);
  }

  /**
   * AbortSignal のハンドラを設定
   * @private
   */
  private setupAbortHandler(
    requestId: string,
    signal: AbortSignal,
    timeoutId: NodeJS.Timeout,
    reject: (error: Error) => void,
  ): void {
    const onAbort = () => {
      this.cleanup(requestId, timeoutId);
      reject(new Error(ErrorMessages.aborted(requestId)));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  }

  /**
   * リソースをクリーンアップ
   * @private
   */
  private cleanup(requestId: string, timeoutId: NodeJS.Timeout): void {
    clearTimeout(timeoutId);
    this.pendingRequests.delete(requestId);
  }
}
