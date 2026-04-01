# Phase 5: 実装

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 5                             |
| タスクID | TASK-NOTIFICATION-SERVICE-001 |
| 作成日   | 2026-04-01                    |

---

## 目的

Phase 4 で Red 状態のテストを Green にするための実装を行う。
Phase 2 の設計に従い、4 本のファイルを新規作成または修正する。

---

## 前提条件

- Phase 3 ゲートで PASS を得ていること
- Phase 4 の全テストが Red（失敗）状態であることを確認済みであること
- TC-E-01〜TC-E-03、TC-F-01〜TC-F-05、TC-B-01〜TC-B-02 が失敗していること

---

## 実行タスク

### タスク 5-1: `INotificationService.ts` の新規作成

**作成先:** `apps/desktop/src/main/services/notification/INotificationService.ts`

**実装内容:**

```typescript
export interface INotificationService {
  notify(title: string, body: string): void;
}
```

**確認事項:**

- `export` キーワードが付いていること
- `notify` メソッドのシグネチャが `(title: string, body: string): void` であること
- ファイルに他のコードが含まれないこと（interface のみ）

### タスク 5-2: `ElectronNotificationService.ts` の新規作成

**作成先:** `apps/desktop/src/main/services/notification/ElectronNotificationService.ts`

**実装内容:**

```typescript
import { Notification } from "electron";
import type { INotificationService } from "./INotificationService";

export class ElectronNotificationService implements INotificationService {
  notify(title: string, body: string): void {
    if (!Notification.isSupported()) {
      console.warn(
        "[ElectronNotificationService] Notification is not supported on this platform",
      );
      return;
    }
    new Notification({ title, body }).show();
  }
}
```

**確認事項:**

- `Notification` を `electron` パッケージから import していること
- `INotificationService` を type import していること
- `Notification.isSupported()` のガードが先頭にあること
- `new Notification({ title, body }).show()` の形式になっていること

### タスク 5-3: `RuntimeSkillCreatorFacade.ts` の修正

**修正先:** `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**修正内容（3 箇所）:**

#### 修正箇所 1: `RuntimeSkillCreatorFacadeDeps` への `notificationService` 追加

```typescript
// 修正前（既存フィールドに追加）
interface RuntimeSkillCreatorFacadeDeps {
  // 既存フィールド...
  notificationService: INotificationService; // 追加
}
```

#### 修正箇所 2: `executeAsync` 完了時に `notify()` を呼ぶ

完了処理の後（`webContents.send(STATE_CHANGED, { phase: 'completed' })` の直後）に追加:

```typescript
try {
  this.deps.notificationService.notify("スキル作成完了", skillName);
} catch {
  // 通知の失敗はスキル生成の結果に影響しない
}
```

#### 修正箇所 3: `executeAsync` 失敗時（catch ブロック）に `notify()` を呼ぶ

エラー処理の後（`webContents.send(STATE_CHANGED, { phase: 'failed', error })` の直後）に追加:

```typescript
try {
  const errorSummary = error instanceof Error ? error.message : String(error);
  this.deps.notificationService.notify("スキル作成失敗", errorSummary);
} catch {
  // 通知の失敗はスキル生成の結果に影響しない
}
```

#### 修正箇所 4: `hasRunningExecution()` メソッドの追加

既存の実行状態管理変数（`runningExecutions: Map<string, ...>` または相当の変数）を確認した上で:

```typescript
hasRunningExecution(): boolean {
  return this.runningExecutions.size > 0
}
```

既存の実行管理変数がない場合は、`executeAsync` 開始時に `this.runningExecutions.set(executionId, ...)` を追加し、完了/失敗時に `this.runningExecutions.delete(executionId)` を追加する。

### タスク 5-4: `apps/desktop/src/main/index.ts` の修正

**修正先:** `apps/desktop/src/main/index.ts`

**修正内容（2 箇所）:**

#### 修正箇所 1: `ElectronNotificationService` のインスタンス化と DI 注入

`RuntimeSkillCreatorFacade` のインスタンス化箇所を探し、`ElectronNotificationService` を DI 注入する:

```typescript
import { ElectronNotificationService } from "./services/notification/ElectronNotificationService";

// RuntimeSkillCreatorFacade のインスタンス化時
const notificationService = new ElectronNotificationService();
const facade = new RuntimeSkillCreatorFacade({
  // 既存の deps
  notificationService,
});
```

#### 修正箇所 2: `app.on('before-quit', ...)` ガードの追加

`app.on('ready', ...)` または アプリ初期化後のセクションに追加:

```typescript
app.on("before-quit", (event) => {
  if (facade.hasRunningExecution()) {
    event.preventDefault();
    dialog
      .showMessageBox({
        type: "warning",
        buttons: ["中断して終了", "キャンセル"],
        message: "スキル作成が進行中です",
        detail: "スキル作成を中断してアプリを終了しますか？",
      })
      .then(({ response }) => {
        if (response === 0) {
          app.exit(0);
        }
      });
  }
});
```

---

## 実装後の確認手順

### ステップ 1: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

エラーが 0 件であることを確認する。

### ステップ 2: テストの Green 確認

```bash
# ElectronNotificationService テスト
pnpm --filter @repo/desktop test -- ElectronNotificationService

# Facade 通知テスト
pnpm --filter @repo/desktop test -- RuntimeSkillCreatorFacade.notification

# before-quit guard テスト
pnpm --filter @repo/desktop test -- before-quit-guard
```

全テストが **Green（成功）** になることを確認する。

### ステップ 3: 既存テストのリグレッション確認

```bash
pnpm vitest run
```

既存テストが引き続き Green であることを確認する。

### ステップ 4: lint の確認

```bash
pnpm --filter @repo/desktop lint
```

エラーが 0 件であることを確認する。

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                      |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Electron IPC セキュリティ |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI パターン               |

### 設計書

| 設計書       | パス                       |
| ------------ | -------------------------- |
| 型設計       | `phase-2-design.md`        |
| テストケース | `phase-4-test-creation.md` |

---

## 実行手順

### ステップ 1: `INotificationService.ts` の新規作成

タスク 5-1 の内容を実装する。

### ステップ 2: `ElectronNotificationService.ts` の新規作成

タスク 5-2 の内容を実装する。

### ステップ 3: `RuntimeSkillCreatorFacade.ts` の修正

`RuntimeSkillCreatorFacade.ts` を読み込み、タスク 5-3 の 4 箇所を修正する。

### ステップ 4: `index.ts` の修正

`apps/desktop/src/main/index.ts` を読み込み、タスク 5-4 の 2 箇所を修正する。

### ステップ 5: 型チェック・テスト・lint の実行

上記「実装後の確認手順」を全て実行し、全て Green であることを確認する。

---

## 多角的チェック観点

| 観点                           | 確認内容                                                                 |
| ------------------------------ | ------------------------------------------------------------------------ |
| 実装の完全性                   | 新規 2 本 + 修正 2 本が全て変更されていること                            |
| 型安全性                       | `INotificationService` を import する全箇所で型が解決されていること      |
| 通知失敗の安全性               | `notify()` 呼び出しが `try/catch` でラップされていること                 |
| 既存コードへの影響             | `RuntimeSkillCreatorFacade` の既存テストが引き続き Green であること      |
| `before-quit` の無限ループ防止 | `event.preventDefault()` 後に `app.exit(0)` が呼ばれる経路が存在すること |

---

## 成果物

| 成果物                                | パス                                                                         | 説明     |
| ------------------------------------- | ---------------------------------------------------------------------------- | -------- |
| INotificationService                  | `apps/desktop/src/main/services/notification/INotificationService.ts`        | 新規作成 |
| ElectronNotificationService           | `apps/desktop/src/main/services/notification/ElectronNotificationService.ts` | 新規作成 |
| RuntimeSkillCreatorFacade（修正済み） | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`        | 修正済み |
| index.ts（修正済み）                  | `apps/desktop/src/main/index.ts`                                             | 修正済み |

---

## 完了条件

- [ ] `INotificationService.ts` が新規作成された
- [ ] `ElectronNotificationService.ts` が新規作成された（`Notification.isSupported()` ガード付き）
- [ ] `RuntimeSkillCreatorFacadeDeps` に `notificationService: INotificationService` が追加された
- [ ] `executeAsync` の完了時に `notify('スキル作成完了', skillName)` が `try/catch` でラップして呼ばれる
- [ ] `executeAsync` の失敗時に `notify('スキル作成失敗', errorSummary)` が `try/catch` でラップして呼ばれる
- [ ] `hasRunningExecution()` メソッドが追加された
- [ ] `index.ts` に `ElectronNotificationService` の DI 注入が追加された
- [ ] `index.ts` に `before-quit` ガードが追加された
- [ ] `pnpm --filter @repo/desktop typecheck` が 0 エラーで通過した
- [ ] TC-E-01〜TC-E-03、TC-F-01〜TC-F-05、TC-B-01〜TC-B-02 が全て Green になった
- [ ] `pnpm vitest run` で既存テストに新規失敗がないこと
- [ ] `pnpm --filter @repo/desktop lint` が 0 エラーで通過した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

Phase 5 完了時に以下を明記すること:

- 作成・修正したファイル 4 本の一覧
- typecheck / test / lint の実行結果（エラー数）
- テスト Green 確認（TC 番号と結果の一覧）

---

## 次 Phase

Phase 5 の完了条件が全て満たされたら Phase 6（テスト拡充）へ進む。
