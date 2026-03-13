---
id: TASK-3-2
tier: 1
title: PermissionResolver 実装
phase: 3
depends_on: [TASK-1-1]
parallel_with: [TASK-3-1]
blocks: [TASK-4-2]
status: pending
priority: high
estimated_complexity: small
tags: [backend, main-process, service]
---

# PermissionResolver 実装

## 概要

権限確認リクエストの待機・解決を管理するクラスを実装する。
Renderer から IPC 経由で送られる権限応答を受け取り、待機中のリクエストを解決する。

## 入力

- TASK-1-1 の型定義（`PermissionRequest`, `PermissionResponse`）

## 出力

- `apps/desktop/src/main/services/skill/PermissionResolver.ts`
- 単体テストファイル

## 実装詳細

### クラス構造

```typescript
interface PendingRequest {
  resolve: (response: PermissionResponse) => void;
  reject: (error: Error) => void;
  timeoutId: NodeJS.Timeout;
}

export class PermissionResolver {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private defaultTimeout: number = 300000; // 5分

  constructor(defaultTimeout?: number);

  /**
   * 権限応答を待機
   * @param requestId リクエストID
   * @param signal AbortSignal（キャンセル用）
   * @returns 権限応答
   */
  async waitForResponse(
    requestId: string,
    signal?: AbortSignal,
  ): Promise<PermissionResponse>;

  /**
   * 権限リクエストを解決
   * @param response 権限応答
   */
  resolveRequest(response: PermissionResponse): void;

  /**
   * 保留中のリクエストをキャンセル
   * @param requestId リクエストID
   * @param reason キャンセル理由
   */
  cancelRequest(requestId: string, reason?: string): void;

  /**
   * 全ての保留中リクエストをキャンセル
   */
  cancelAll(): void;

  /**
   * 保留中のリクエスト数を取得
   */
  get pendingCount(): number;
}
```

### 実装例

```typescript
export class PermissionResolver {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private defaultTimeout: number;

  constructor(defaultTimeout: number = 300000) {
    this.defaultTimeout = defaultTimeout;
  }

  async waitForResponse(
    requestId: string,
    signal?: AbortSignal,
  ): Promise<PermissionResponse> {
    return new Promise((resolve, reject) => {
      // タイムアウト設定
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Permission request timed out: ${requestId}`));
      }, this.defaultTimeout);

      // AbortSignal処理
      if (signal) {
        signal.addEventListener("abort", () => {
          clearTimeout(timeoutId);
          this.pendingRequests.delete(requestId);
          reject(new Error(`Permission request aborted: ${requestId}`));
        });
      }

      // 保留リクエストを登録
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeoutId,
      });
    });
  }

  resolveRequest(response: PermissionResponse): void {
    const pending = this.pendingRequests.get(response.requestId);
    if (pending) {
      clearTimeout(pending.timeoutId);
      this.pendingRequests.delete(response.requestId);
      pending.resolve(response);
    }
  }

  cancelRequest(requestId: string, reason?: string): void {
    const pending = this.pendingRequests.get(requestId);
    if (pending) {
      clearTimeout(pending.timeoutId);
      this.pendingRequests.delete(requestId);
      pending.reject(new Error(reason || `Request cancelled: ${requestId}`));
    }
  }

  cancelAll(): void {
    for (const [requestId, pending] of this.pendingRequests) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error(`Request cancelled: ${requestId}`));
    }
    this.pendingRequests.clear();
  }

  get pendingCount(): number {
    return this.pendingRequests.size;
  }
}
```

## ファイル

| 操作 | パス                                                                        |
| ---- | --------------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/main/services/skill/PermissionResolver.ts`                |
| 作成 | `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts` |
| 修正 | `apps/desktop/src/main/services/skill/index.ts`                             |

## 依存パッケージ

なし（Node.js標準のみ）

## 完了条件

- [ ] `PermissionResolver` クラスが実装されている
- [ ] `waitForResponse()` が応答を待機する
- [ ] `resolveRequest()` が保留中のリクエストを解決する
- [ ] `cancelRequest()` が個別リクエストをキャンセルする
- [ ] `cancelAll()` が全リクエストをキャンセルする
- [ ] タイムアウト処理が実装されている
- [ ] AbortSignal によるキャンセルが対応されている
- [ ] 単体テストが全て通過する

## テスト要件

### 単体テスト

```typescript
describe("PermissionResolver", () => {
  describe("waitForResponse", () => {
    it("should resolve when resolveRequest is called");
    it("should timeout after default timeout");
    it("should reject when signal is aborted");
  });

  describe("resolveRequest", () => {
    it("should resolve pending request");
    it("should do nothing for unknown requestId");
  });

  describe("cancelRequest", () => {
    it("should reject pending request");
    it("should do nothing for unknown requestId");
  });

  describe("cancelAll", () => {
    it("should cancel all pending requests");
  });

  describe("pendingCount", () => {
    it("should return correct count");
  });
});
```

## 参考資料

- [specification.md - 5.2.3 Hooks実装パターン](../specification.md)
