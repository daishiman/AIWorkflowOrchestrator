# Phase 5: 実装 - 成果物

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| Phase      | 5          |
| Phase名    | 実装       |
| 完了日時   | 2026-01-25 |
| ステータス | 完了       |
| 作成者     | Claude     |
| TDD状態    | **Green**  |

---

## タスク 1: クラスファイル作成 ✅

### 作成ファイル

```
apps/desktop/src/main/services/skill/PermissionResolver.ts
```

### 実装内容

- PendingRequest インターフェース定義
- PermissionResolver クラスの実装
- 全5メソッド/ゲッター実装完了

---

## タスク 2: メソッド実装 ✅

### 実装メソッド一覧

| メソッド                              | 実装内容                                   |
| ------------------------------------- | ------------------------------------------ |
| `constructor(defaultTimeout?)`        | デフォルトタイムアウト設定（300000ms）     |
| `waitForResponse(requestId, signal?)` | Promise返却、タイムアウト・AbortSignal対応 |
| `resolveRequest(response)`            | 待機中Promiseの解決、タイマークリア        |
| `cancelRequest(requestId, reason?)`   | 個別キャンセル、エラーメッセージ付きreject |
| `cancelAll()`                         | 全リクエストキャンセル                     |
| `get pendingCount`                    | Map.size 返却                              |

### 特記事項

- 既にabortされているSignalの即座reject対応を追加
- once: true オプションでリスナーの自動解除を実装

---

## タスク 3: export 追加 ✅

### 更新ファイル

```
apps/desktop/src/main/services/skill/index.ts
```

### 追加内容

```typescript
export { PermissionResolver } from "./PermissionResolver";
```

---

## タスク 4: テスト実行・確認 ✅

### テスト結果

```
 RUN  v2.1.9

 ✓ src/main/services/skill/__tests__/PermissionResolver.test.ts (29 tests) 43ms

 Test Files  1 passed (1)
      Tests  29 passed (29)
   Start at  18:34:29
   Duration  1.76s
```

### テスト結果サマリー

| 項目                | 結果 |
| ------------------- | ---- |
| テストファイル数    | 1    |
| テストケース数      | 29   |
| 成功数              | 29   |
| 失敗数              | 0    |
| Unhandled Rejection | 0    |

---

## 実装コード（最終版）

```typescript
// apps/desktop/src/main/services/skill/PermissionResolver.ts

import type { SkillPermissionResponse } from "@repo/shared";

interface PendingRequest {
  resolve: (response: SkillPermissionResponse) => void;
  reject: (error: Error) => void;
  timeoutId: NodeJS.Timeout;
}

export class PermissionResolver {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private readonly defaultTimeout: number;

  constructor(defaultTimeout: number = 300000) {
    this.defaultTimeout = defaultTimeout;
  }

  waitForResponse(
    requestId: string,
    signal?: AbortSignal,
  ): Promise<SkillPermissionResponse> {
    return new Promise((resolve, reject) => {
      // 既に abort されている場合は即座に reject
      if (signal?.aborted) {
        reject(new Error(`Permission request aborted: ${requestId}`));
        return;
      }

      // タイムアウト設定
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Permission request timed out: ${requestId}`));
      }, this.defaultTimeout);

      // AbortSignal 処理
      if (signal) {
        const onAbort = () => {
          clearTimeout(timeoutId);
          this.pendingRequests.delete(requestId);
          reject(new Error(`Permission request aborted: ${requestId}`));
        };
        signal.addEventListener("abort", onAbort, { once: true });
      }

      // 保留リクエストを登録
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeoutId,
      });
    });
  }

  resolveRequest(response: SkillPermissionResponse): void {
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

---

## Phase 5 完了条件チェック

- [x] `PermissionResolver.ts` が作成されている
- [x] `waitForResponse()` が実装されている
- [x] `resolveRequest()` が実装されている
- [x] `cancelRequest()` が実装されている
- [x] `cancelAll()` が実装されている
- [x] `pendingCount` ゲッターが実装されている
- [x] `index.ts` にエクスポートが追加されている
- [x] 全テストが成功している（Green状態）
- [x] Unhandled Rejection エラーなし

---

## 次のPhase

Phase 6: テスト拡充 へ進む

`docs/30-workflows/TASK-3-2-permission-resolver/phase-6-test-expansion.md`
