# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 5                       |
| Phase名    | 実装                    |
| 前提Phase  | Phase 4                 |
| 後続Phase  | Phase 6                 |
| ステータス | 未実施                  |
| 作成日     | 2026-01-25              |
| 機能名     | PermissionResolver 実装 |

---

## 目的

TDD の Green フェーズとして、Phase 4 で作成したテストを通す実装を行う。

## 背景

Phase 2 の設計書に基づき、PermissionResolver クラスを実装する。
テストが全て成功することを確認する。

---

## 実行タスク

### タスク 1: クラスファイル作成

**目的**: PermissionResolver クラスの基本構造を作成する

**実行手順**:

1. `apps/desktop/src/main/services/skill/PermissionResolver.ts` を作成
2. クラスの基本構造（コンストラクタ、プロパティ）を実装
3. 型インポートを追加

**期待される成果物**:

- `PermissionResolver.ts` ファイル

### タスク 2: メソッド実装

**目的**: 全てのパブリックメソッドを実装する

**実行手順**:

1. `waitForResponse` メソッドを実装
2. `resolveRequest` メソッドを実装
3. `cancelRequest` メソッドを実装
4. `cancelAll` メソッドを実装
5. `pendingCount` ゲッターを実装

**期待される成果物**:

- 完全に実装されたクラス

### タスク 3: export 追加

**目的**: クラスをモジュールからエクスポートする

**実行手順**:

1. `apps/desktop/src/main/services/skill/index.ts` を確認
2. `PermissionResolver` のエクスポートを追加

**期待される成果物**:

- 更新された `index.ts`

### タスク 4: テスト実行・確認

**目的**: 全テストが成功することを確認する

**実行手順**:

1. `pnpm --filter @repo/desktop test -- --run PermissionResolver` を実行
2. 全テストが成功することを確認
3. 失敗するテストがあれば修正

**期待される成果物**:

- テスト成功レポート

---

## 参照資料

| 参照資料       | パス                       | 内容         |
| -------------- | -------------------------- | ------------ |
| Phase 2 成果物 | `phase-2-design.md`        | クラス設計   |
| Phase 4 成果物 | `phase-4-test-creation.md` | テストコード |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                        | 内容   |
| -------------------- | --------------------------------------------------------------------------- | ------ |
| interfaces-agent-sdk | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 型定義 |

---

## 成果物

| 成果物       | パス                                                         | 内容               |
| ------------ | ------------------------------------------------------------ | ------------------ |
| 実装ファイル | `apps/desktop/src/main/services/skill/PermissionResolver.ts` | クラス本体         |
| エクスポート | `apps/desktop/src/main/services/skill/index.ts`              | export追加（修正） |

---

## 実装コード

```typescript
// apps/desktop/src/main/services/skill/PermissionResolver.ts

import type { PermissionResponse } from "@repo/shared";

/**
 * 権限確認リクエストの待機・解決を管理するクラス
 *
 * Renderer から IPC 経由で送られる権限応答を受け取り、
 * 待機中のリクエストを解決する。
 */

interface PendingRequest {
  resolve: (response: PermissionResponse) => void;
  reject: (error: Error) => void;
  timeoutId: NodeJS.Timeout;
}

export class PermissionResolver {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private defaultTimeout: number;

  /**
   * コンストラクタ
   * @param defaultTimeout タイムアウト時間（ミリ秒）。デフォルト: 300000（5分）
   */
  constructor(defaultTimeout: number = 300000) {
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * 権限応答を待機
   * @param requestId リクエストID
   * @param signal AbortSignal（キャンセル用）
   * @returns 権限応答
   * @throws Error タイムアウトまたはキャンセル時
   */
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

      // AbortSignal 処理
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

  /**
   * 権限リクエストを解決
   * @param response 権限応答
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
   * 保留中のリクエストをキャンセル
   * @param requestId リクエストID
   * @param reason キャンセル理由
   */
  cancelRequest(requestId: string, reason?: string): void {
    const pending = this.pendingRequests.get(requestId);
    if (pending) {
      clearTimeout(pending.timeoutId);
      this.pendingRequests.delete(requestId);
      pending.reject(new Error(reason || `Request cancelled: ${requestId}`));
    }
  }

  /**
   * 全ての保留中リクエストをキャンセル
   */
  cancelAll(): void {
    for (const [requestId, pending] of this.pendingRequests) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error(`Request cancelled: ${requestId}`));
    }
    this.pendingRequests.clear();
  }

  /**
   * 保留中のリクエスト数を取得
   */
  get pendingCount(): number {
    return this.pendingRequests.size;
  }
}
```

---

## エクスポート追加

```typescript
// apps/desktop/src/main/services/skill/index.ts

// 既存のエクスポート...
export { PermissionResolver } from "./PermissionResolver";
```

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run PermissionResolver
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 完了条件

- [ ] `PermissionResolver.ts` が作成されている
- [ ] `waitForResponse()` が実装されている
- [ ] `resolveRequest()` が実装されている
- [ ] `cancelRequest()` が実装されている
- [ ] `cancelAll()` が実装されている
- [ ] `pendingCount` ゲッターが実装されている
- [ ] `index.ts` にエクスポートが追加されている
- [ ] 全テストが成功している（Green状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-3-2-permission-resolver/phase-6-test-expansion.md`
