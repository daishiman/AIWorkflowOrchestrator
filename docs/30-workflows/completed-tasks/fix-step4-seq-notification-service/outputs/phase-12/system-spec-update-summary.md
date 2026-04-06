# Phase 12: システム仕様更新サマリー

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 12                            |
| タスクID | TASK-NOTIFICATION-SERVICE-001 |
| 作成日   | 2026-04-02                    |

---

## 変更された仕様の要約

### 新規追加

| 種別      | 名前                          | ファイル                                                                     |
| --------- | ----------------------------- | ---------------------------------------------------------------------------- |
| interface | `INotificationService`        | `apps/desktop/src/main/services/notification/INotificationService.ts`        |
| class     | `ElectronNotificationService` | `apps/desktop/src/main/services/notification/ElectronNotificationService.ts` |
| function  | `registerBeforeQuitGuard`     | `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                               |
| type      | `BeforeQuitGuardDeps`         | `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                               |

### 既存ファイルへの追加

#### RuntimeSkillCreatorFacade.ts

| 変更内容                                                                                 | 場所                    |
| ---------------------------------------------------------------------------------------- | ----------------------- |
| `notificationService?: INotificationService` を `RuntimeSkillCreatorFacadeDeps` に追加   | deps interface          |
| `private activeExecutionCount: number = 0` フィールド追加                                | class body              |
| `private readonly notificationService: INotificationService \| undefined` フィールド追加 | class body              |
| `hasRunningExecution(): boolean` メソッド追加                                            | class body              |
| `execute()` を `activeExecutionCount` カウンターでラップ                                 | method body             |
| 完了/失敗時の `notify()` 呼び出し追加                                                    | `_executeInternal()` 内 |

#### ipc/index.ts

| 変更内容                                          | 場所                                      |
| ------------------------------------------------- | ----------------------------------------- |
| `app`, `dialog` import 追加                       | import 節                                 |
| `ElectronNotificationService` import 追加         | import 節                                 |
| `registerBeforeQuitGuard` import 追加             | import 節                                 |
| `_unregisterBeforeQuitGuardFn` モジュール変数追加 | モジュールレベル                          |
| `unregisterAllIpcHandlers()` に解除ロジック追加   | 関数内                                    |
| `ElectronNotificationService` DI 注入             | `registerSkillCreatorHandlers` ブロック内 |
| `registerBeforeQuitGuard()` 呼び出し追加          | `registerSkillCreatorHandlers` ブロック内 |

---

## Step 1-A: 本タスクで更新・作成したドキュメント一覧

| ドキュメント                                                              | 種別     |
| ------------------------------------------------------------------------- | -------- |
| `docs/30-workflows/skill-creator-agent-sdk-lane/index.md`                 | 更新     |
| `docs/30-workflows/unassigned-task/TASK-FIX-LIFECYCLE-PANEL-ERROR-001.md` | 更新     |
| `outputs/phase-1/spec-extraction-map.md`                                  | 新規作成 |
| `outputs/phase-2/design-topology.md`                                      | 新規作成 |
| `outputs/phase-3/design-review-result.md`                                 | 新規作成 |
| `outputs/phase-6/test-expansion-report.md`                                | 新規作成 |
| `outputs/phase-7/coverage-report.md`                                      | 新規作成 |
| `outputs/phase-8/refactoring-log.md`                                      | 新規作成 |
| `outputs/phase-9/quality-report.md`                                       | 新規作成 |
| `outputs/phase-10/final-review-result.md`                                 | 新規作成 |
| `outputs/phase-11/manual-test-checklist.md`                               | 新規作成 |
| `outputs/phase-11/manual-test-result.md`                                  | 新規作成 |
| `outputs/phase-11/discovered-issues.md`                                   | 新規作成 |
| `outputs/phase-12/implementation-guide.md`                                | 新規作成 |

---

## Step 1-B: 完了記録の更新方針

`artifacts.json` の全 phase を `completed` に更新して完了を記録する。

---

## Step 1-C: LOGS.md 更新の必要性

`apps/desktop/` 配下に LOGS.md は存在しない。更新不要。

---

## Step 2: 仕様正本更新先と差分要約

| 正本                     | 更新内容                                       |
| ------------------------ | ---------------------------------------------- |
| `artifacts.json`         | 全 phase を `not_started` → `completed` に更新 |
| `apps/desktop/src/main/` | 実装ファイル 3 本新規作成、既存 2 ファイル修正 |

aiworkflow-requirements の更新: **不要**（本タスクは実装のみ、仕様文書への記載変更なし）

---

## current facts と target delta

### Current (before)

- 通知機能なし
- `hasRunningExecution()` なし
- `before-quit` ガードなし

### Target delta (after)

- `INotificationService` + `ElectronNotificationService` による macOS 通知
- `hasRunningExecution()` で実行中カウント管理
- `beforeQuitGuard.ts` による終了前確認ダイアログ
