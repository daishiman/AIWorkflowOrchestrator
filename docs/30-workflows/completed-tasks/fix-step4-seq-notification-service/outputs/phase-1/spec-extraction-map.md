# Phase 1 成果物: スペック抽出マップ

## P50 チェック結果（タスク 1-1）

### `INotificationService` の存在確認

```
git grep -r "INotificationService" apps/desktop/src/
```

結果: **0 件**（未実装確認済み）

### `ElectronNotificationService` の存在確認

```
git grep -r "ElectronNotificationService" apps/desktop/src/
```

結果: **0 件**（未実装確認済み）

### `new Notification` の存在確認

```
git grep -r "new Notification" apps/desktop/src/main/
```

結果: **0 件**（OS 通知未導入確認済み）

### `notificationHandlers` の存在確認

```
git grep -r "notificationHandlers" apps/desktop/src/
```

結果: **複数件ヒット**（既存 DB 通知管理の存在確認済み）

- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/__tests__/` 配下のテスト複数

---

## 変更対象ファイルのインベントリ（タスク 1-2）

| 種別     | ファイルパス                                                                                      | 状態                                  |
| -------- | ------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 新規作成 | `apps/desktop/src/main/services/notification/INotificationService.ts`                             | 未存在                                |
| 新規作成 | `apps/desktop/src/main/services/notification/ElectronNotificationService.ts`                      | 未存在                                |
| 新規作成 | `apps/desktop/src/main/services/notification/__tests__/ElectronNotificationService.test.ts`       | 未存在                                |
| 新規作成 | `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                                                    | 未存在                                |
| 新規作成 | `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts`                                     | 未存在                                |
| 新規作成 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | 未存在                                |
| 修正     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | 存在済み（910行: async execute あり） |
| 修正     | `apps/desktop/src/main/ipc/index.ts`                                                              | 存在済み                              |

---

## 受入条件（AC-1〜AC-9）

| AC   | 内容                                                                                                          | 定義完了 |
| ---- | ------------------------------------------------------------------------------------------------------------- | -------- |
| AC-1 | `INotificationService.notify(title: string, body: string): void` インターフェースが TypeScript で型安全に定義 | ✓        |
| AC-2 | `ElectronNotificationService` が `new Notification({ title, body }).show()` を呼ぶ                            | ✓        |
| AC-3 | `MockNotificationService` が `calls: Array<{ title, body }>` を持つ                                           | ✓        |
| AC-4 | `RuntimeSkillCreatorFacadeDeps` に `notificationService: INotificationService` が追加                         | ✓        |
| AC-5 | 完了時に `notify('スキル作成完了', skillName)` が呼ばれる                                                     | ✓        |
| AC-6 | 失敗時に `notify('スキル作成失敗', errorSummary)` が呼ばれる                                                  | ✓        |
| AC-7 | `before-quit` ガードで `facade.hasRunningExecution()` が `true` の場合に `event.preventDefault()` が呼ばれる  | ✓        |
| AC-8 | `hasRunningExecution()` が `boolean` を返す                                                                   | ✓        |
| AC-9 | 既存 `notificationHandlers.ts`（DB 通知管理）との競合がない                                                   | ✓        |

---

## タスク分類（タスク 1-4）

| 分類項目          | 値                    | 理由                                                 |
| ----------------- | --------------------- | ---------------------------------------------------- |
| タスク種別        | code 実装タスク       | TypeScript ファイルの新規作成・修正                  |
| VISUAL/NON_VISUAL | NON_VISUAL            | UI コンポーネントの変更なし。通知は OS ネイティブ UI |
| テスト種別        | ユニットテスト（TDD） | Electron 環境外で実行可能なユニットテストを先に作成  |
| 影響範囲          | Main Process のみ     | Renderer Process・preload には変更なし               |

---

## 前提タスク依存確認（タスク 1-6）

- `async execute(` → `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts:910` **存在確認済み** ✓
- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` → `apps/desktop/src/main/ipc/creatorHandlers.ts` 他 **存在確認済み** ✓

**TASK-FIX-EXECUTE-PLAN-FF-001 は完了済み。Phase 2 進行可能。**

---

_作成日: 2026-04-02_
