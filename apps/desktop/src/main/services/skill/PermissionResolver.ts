/**
 * PermissionResolver - 権限確認リクエストの待機・解決管理
 *
 * TASK-3-2: PermissionResolver 実装
 *
 * Renderer から IPC 経由で送られる権限応答を受け取り、
 * 待機中のリクエストを解決する。
 */

/**
 * 権限応答インターフェース
 */
export interface PermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
  rejectReason?: string;
}

/**
 * 保留中リクエストの内部構造
 */
interface PendingRequest {
  resolve: (response: PermissionResponse) => void;
  reject: (error: Error) => void;
  timeoutId: NodeJS.Timeout;
}

/**
 * 権限確認リクエストの待機・解決を管理するクラス
 *
 * @example
 * ```typescript
 * const resolver = new PermissionResolver();
 *
 * // 待機開始
 * const responsePromise = resolver.waitForResponse('request-123', signal, 30000);
 *
 * // IPC経由で応答を受信したら
 * resolver.resolveRequest({ requestId: 'request-123', approved: true });
 *
 * // 待機中のPromiseが解決される
 * const response = await responsePromise;
 * ```
 */
export class PermissionResolver {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private defaultTimeout: number;

  /**
   * PermissionResolver のコンストラクタ
   *
   * @param defaultTimeout - デフォルトのタイムアウト（ミリ秒）。デフォルト: 300000（5分）
   */
  constructor(defaultTimeout: number = 300000) {
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * 権限応答を待機する
   *
   * @param requestId - リクエストID
   * @param signal - AbortSignal（キャンセル用、オプション）
   * @param timeout - タイムアウト（ミリ秒、オプション）
   * @returns 権限応答の Promise
   * @throws タイムアウトまたはキャンセル時にエラー
   */
  async waitForResponse(
    requestId: string,
    signal?: AbortSignal,
    timeout?: number,
  ): Promise<PermissionResponse> {
    const effectiveTimeout = timeout ?? this.defaultTimeout;

    return new Promise<PermissionResponse>((resolve, reject) => {
      // 既に abort されている場合
      if (signal?.aborted) {
        reject(new Error(`Permission request aborted: ${requestId}`));
        return;
      }

      // タイムアウト設定
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Permission request timed out: ${requestId}`));
      }, effectiveTimeout);

      // AbortSignal 処理
      const abortHandler = () => {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(requestId);
        reject(new Error(`Permission request aborted: ${requestId}`));
      };

      if (signal) {
        signal.addEventListener("abort", abortHandler, { once: true });
      }

      // resolve/reject をラップして AbortSignal リスナーをクリーンアップ
      const wrappedResolve = (response: PermissionResponse) => {
        if (signal) {
          signal.removeEventListener("abort", abortHandler);
        }
        resolve(response);
      };

      const wrappedReject = (error: Error) => {
        if (signal) {
          signal.removeEventListener("abort", abortHandler);
        }
        reject(error);
      };

      // 保留リクエストを登録
      this.pendingRequests.set(requestId, {
        resolve: wrappedResolve,
        reject: wrappedReject,
        timeoutId,
      });
    });
  }

  /**
   * 権限リクエストを解決する
   *
   * @param response - 権限応答
   */
  resolveRequest(response: PermissionResponse): void {
    const pending = this.pendingRequests.get(response.requestId);

    if (pending) {
      clearTimeout(pending.timeoutId);
      this.pendingRequests.delete(response.requestId);
      pending.resolve(response);
    }
  }

  /**
   * 保留中のリクエストをキャンセルする
   *
   * @param requestId - リクエストID
   * @param reason - キャンセル理由（オプション）
   */
  cancelRequest(requestId: string, reason?: string): void {
    const pending = this.pendingRequests.get(requestId);

    if (pending) {
      clearTimeout(pending.timeoutId);
      this.pendingRequests.delete(requestId);
      pending.reject(
        new Error(reason || `Permission request cancelled: ${requestId}`),
      );
    }
  }

  /**
   * 全ての保留中リクエストをキャンセルする
   */
  cancelAll(): void {
    for (const [requestId, pending] of this.pendingRequests) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error(`Permission request cancelled: ${requestId}`));
    }
    this.pendingRequests.clear();
  }

  /**
   * 保留中のリクエスト数を取得する
   */
  get pendingCount(): number {
    return this.pendingRequests.size;
  }
}
