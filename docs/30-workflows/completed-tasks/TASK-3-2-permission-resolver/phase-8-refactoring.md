# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 8                       |
| Phase名    | リファクタリング        |
| 前提Phase  | Phase 7                 |
| 後続Phase  | Phase 9                 |
| ステータス | 未実施                  |
| 作成日     | 2026-01-25              |
| 機能名     | PermissionResolver 実装 |

---

## 目的

TDD の Refactor フェーズとして、コードの品質を改善する。
テストを維持しながら、可読性・保守性を向上させる。

## 背景

Phase 5 で実装したコードは機能的に正しいが、
コードの品質（可読性、保守性、一貫性）を向上させる余地がある。

---

## 実行タスク

### タスク 1: コード品質レビュー

**目的**: 改善が必要な箇所を特定する

**実行手順**:

1. コードの可読性を評価
2. 命名規則の一貫性を確認
3. コメント・ドキュメントの充実度を確認
4. 改善候補リストを作成

**期待される成果物**:

- 改善候補リスト

### タスク 2: リファクタリング実施

**目的**: 特定した改善点を適用する

**実行手順**:

1. 定数の抽出（マジックナンバー除去）
2. エラーメッセージの一貫性確保
3. JSDoc コメントの充実
4. 不要なコードの削除

**期待される成果物**:

- リファクタリング済みコード

### タスク 3: テスト確認

**目的**: リファクタリング後もテストが成功することを確認する

**実行手順**:

1. 全テストを実行
2. カバレッジが維持されていることを確認
3. 新たなバグが発生していないことを確認

**期待される成果物**:

- テスト成功レポート

---

## 参照資料

| 参照資料       | パス                        | 内容           |
| -------------- | --------------------------- | -------------- |
| Phase 5 成果物 | `phase-5-implementation.md` | 元の実装       |
| Phase 7 成果物 | `phase-7-coverage.md`       | カバレッジ基準 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                        | 内容     |
| -------------------- | --------------------------------------------------------------------------- | -------- |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準 |

---

## 成果物

| 成果物               | パス                                                         | 内容             |
| -------------------- | ------------------------------------------------------------ | ---------------- |
| リファクタリング済み | `apps/desktop/src/main/services/skill/PermissionResolver.ts` | 改善されたコード |

---

## 改善候補チェックリスト

### 定数抽出

- [ ] `300000` → `DEFAULT_TIMEOUT_MS` 定数化
- [ ] エラーメッセージプレフィックスの統一

### 命名改善

- [ ] メソッド・変数名が意図を明確に表現しているか
- [ ] 型名が適切か

### コメント充実

- [ ] クラスレベルの JSDoc
- [ ] 各メソッドの JSDoc（パラメータ、戻り値、例外）
- [ ] 複雑なロジックの説明コメント

### 構造改善

- [ ] 責務の分離（必要であれば）
- [ ] 不要なコードの削除

---

## リファクタリング後のコード例

````typescript
// apps/desktop/src/main/services/skill/PermissionResolver.ts

import type { PermissionResponse } from "@repo/shared";

/** デフォルトのタイムアウト時間（5分） */
const DEFAULT_TIMEOUT_MS = 300_000;

/** エラーメッセージ */
const ErrorMessages = {
  timeout: (requestId: string) => `Permission request timed out: ${requestId}`,
  aborted: (requestId: string) => `Permission request aborted: ${requestId}`,
  cancelled: (requestId: string, reason?: string) =>
    reason || `Request cancelled: ${requestId}`,
} as const;

/**
 * 保留中のリクエスト情報
 */
interface PendingRequest {
  /** Promise を解決する関数 */
  resolve: (response: PermissionResponse) => void;
  /** Promise を拒否する関数 */
  reject: (error: Error) => void;
  /** タイムアウト用タイマーID */
  timeoutId: NodeJS.Timeout;
}

/**
 * 権限確認リクエストの待機・解決を管理するクラス
 *
 * Renderer から IPC 経由で送られる権限応答を受け取り、
 * 待機中のリクエストを解決する。
 *
 * @example
 * ```typescript
 * const resolver = new PermissionResolver();
 *
 * // 待機開始
 * const promise = resolver.waitForResponse(requestId);
 *
 * // 別のコンテキストで解決
 * resolver.resolveRequest({ requestId, approved: true });
 *
 * const response = await promise;
 * ```
 */
export class PermissionResolver {
  private readonly pendingRequests: Map<string, PendingRequest> = new Map();
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
  async waitForResponse(
    requestId: string,
    signal?: AbortSignal,
  ): Promise<PermissionResponse> {
    return new Promise((resolve, reject) => {
      const timeoutId = this.setupTimeout(requestId, reject);

      if (signal) {
        this.setupAbortHandler(requestId, signal, timeoutId, reject);
      }

      this.pendingRequests.set(requestId, { resolve, reject, timeoutId });
    });
  }

  /**
   * 権限リクエストを解決
   *
   * @param response 権限応答
   * @remarks 存在しない requestId の場合は何もしない
   */
  resolveRequest(response: PermissionResponse): void {
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
   */
  private setupAbortHandler(
    requestId: string,
    signal: AbortSignal,
    timeoutId: NodeJS.Timeout,
    reject: (error: Error) => void,
  ): void {
    signal.addEventListener("abort", () => {
      this.cleanup(requestId, timeoutId);
      reject(new Error(ErrorMessages.aborted(requestId)));
    });
  }

  /**
   * リソースをクリーンアップ
   */
  private cleanup(requestId: string, timeoutId: NodeJS.Timeout): void {
    clearTimeout(timeoutId);
    this.pendingRequests.delete(requestId);
  }
}
````

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run PermissionResolver
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 完了条件

- [ ] 改善候補リストが作成されている
- [ ] 定数が抽出されている
- [ ] エラーメッセージが一貫している
- [ ] JSDoc コメントが充実している
- [ ] プライベートメソッドで責務が分離されている
- [ ] 全テストが成功している
- [ ] カバレッジが維持されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-3-2-permission-resolver/phase-9-quality.md`
