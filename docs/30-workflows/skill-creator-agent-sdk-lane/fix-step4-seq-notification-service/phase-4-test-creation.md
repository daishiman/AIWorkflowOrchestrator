# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 4                             |
| タスクID | TASK-NOTIFICATION-SERVICE-001 |
| 作成日   | 2026-04-01                    |

---

## 目的

Phase 5 の実装前に全テストを Red（失敗）状態で作成し、TDD サイクルを確立する。
AC-1〜AC-8 のそれぞれに対応するテストケースを定義し、実装完了の判定基準を固定する。

---

## 実行タスク

### タスク 4-1: `ElectronNotificationService.test.ts` の作成

**作成先:** `apps/desktop/src/main/services/notification/__tests__/ElectronNotificationService.test.ts`

**テストケース:**

#### TC-E-01: `notify()` が `Notification` コンストラクタを正しい引数で呼ぶ

| 項目     | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| テスト名 | `notify() calls Notification constructor with correct title and body`            |
| 対象     | `ElectronNotificationService.notify()`                                           |
| 前提条件 | `Notification` コンストラクタをモック済み                                        |
| 操作     | `service.notify('スキル作成完了', 'my-skill')` を呼ぶ                            |
| 期待結果 | `Notification` が `{ title: 'スキル作成完了', body: 'my-skill' }` で呼ばれること |

```typescript
// テスト骨格
it("notify() calls Notification constructor with correct title and body", () => {
  const MockNotification = vi
    .fn()
    .mockImplementation(() => ({ show: vi.fn() }));
  vi.stubGlobal("Notification", MockNotification);

  const service = new ElectronNotificationService();
  service.notify("スキル作成完了", "my-skill");

  expect(MockNotification).toHaveBeenCalledWith({
    title: "スキル作成完了",
    body: "my-skill",
  });
});
```

#### TC-E-02: `notify()` が `show()` を呼ぶ

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| テスト名 | `notify() calls show() on the Notification instance` |
| 対象     | `ElectronNotificationService.notify()`               |
| 前提条件 | `Notification` コンストラクタをモック済み            |
| 操作     | `service.notify('title', 'body')` を呼ぶ             |
| 期待結果 | `show()` が 1 回呼ばれること                         |

#### TC-E-03: `Notification.isSupported()` が false のとき `show()` を呼ばない

| 項目     | 内容                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| テスト名 | `notify() does not call show() when Notification.isSupported() returns false` |
| 対象     | `ElectronNotificationService.notify()`                                        |
| 前提条件 | `Notification.isSupported` が `false` を返すようモック                        |
| 操作     | `service.notify('title', 'body')` を呼ぶ                                      |
| 期待結果 | `show()` が呼ばれないこと。`console.warn` が 1 回呼ばれること                 |

### タスク 4-2: `RuntimeSkillCreatorFacade.notification.test.ts` の作成

**作成先:** `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`

**テストケース:**

#### TC-F-01: 完了時に `MockNotificationService.calls` に正しいエントリが追加される

| 項目     | 内容                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| テスト名 | `executeAsync calls notificationService.notify with completion message on success`               |
| 対象     | `RuntimeSkillCreatorFacade.executeAsync()`                                                       |
| 前提条件 | `MockNotificationService` を DI 注入済み。実行が正常完了するようモック設定                       |
| 操作     | `facade.executeAsync(skillName)` を実行し、完了を待つ                                            |
| 期待結果 | `mockNotification.calls` に `{ title: 'スキル作成完了', body: skillName }` が 1 件追加されること |

```typescript
// テスト骨格
it("calls notify with completion message on success", async () => {
  const mockNotification = new MockNotificationService();
  const facade = new RuntimeSkillCreatorFacade({
    // ...other deps
    notificationService: mockNotification,
  });

  await facade.executeAsync("my-skill");

  expect(mockNotification.calls).toHaveLength(1);
  expect(mockNotification.calls[0]).toEqual({
    title: "スキル作成完了",
    body: "my-skill",
  });
});
```

#### TC-F-02: 失敗時に `MockNotificationService.calls` に失敗エントリが追加される

| 項目     | 内容                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------- |
| テスト名 | `executeAsync calls notificationService.notify with failure message on error`                         |
| 対象     | `RuntimeSkillCreatorFacade.executeAsync()`                                                            |
| 前提条件 | `MockNotificationService` を DI 注入済み。実行がエラーで終了するようモック設定                        |
| 操作     | `facade.executeAsync(skillName)` を実行し、エラーをハンドル                                           |
| 期待結果 | `mockNotification.calls` に `{ title: 'スキル作成失敗', body: <errorSummary> }` が 1 件追加されること |

#### TC-F-03: `notify()` がエラーを投げても `executeAsync` が完了ステータスを変えない

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| テスト名 | `executeAsync completes normally even if notificationService.notify throws` |
| 対象     | `RuntimeSkillCreatorFacade.executeAsync()`                                  |
| 前提条件 | `notify()` が `throw new Error('notification failed')` するモックを DI 注入 |
| 操作     | `facade.executeAsync(skillName)` を実行し、完了を待つ                       |
| 期待結果 | `executeAsync` が正常に完了すること（例外が外に伝播しないこと）             |

#### TC-F-04: `hasRunningExecution()` が実行中に `true` を返す

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| テスト名 | `hasRunningExecution() returns true while executeAsync is running` |
| 対象     | `RuntimeSkillCreatorFacade.hasRunningExecution()`                  |
| 前提条件 | `executeAsync` が完了前の非同期状態                                |
| 操作     | `executeAsync` を開始した直後に `hasRunningExecution()` を呼ぶ     |
| 期待結果 | `true` が返ること                                                  |

#### TC-F-05: `hasRunningExecution()` が完了後に `false` を返す

| 項目     | 内容                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| テスト名 | `hasRunningExecution() returns false after executeAsync completes`             |
| 対象     | `RuntimeSkillCreatorFacade.hasRunningExecution()`                              |
| 前提条件 | `executeAsync` が完了済み                                                      |
| 操作     | `await facade.executeAsync(skillName)` 完了後に `hasRunningExecution()` を呼ぶ |
| 期待結果 | `false` が返ること                                                             |

### タスク 4-3: `before-quit-guard.test.ts` の作成

**作成先:** `apps/desktop/src/main/__tests__/before-quit-guard.test.ts`

**テストケース:**

#### TC-B-01: 実行中に `before-quit` イベントが発火したとき `event.preventDefault()` が呼ばれる

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| テスト名 | `before-quit guard calls event.preventDefault() when execution is running` |
| 対象     | `apps/desktop/src/main/index.ts` の `app.on('before-quit', ...)` ハンドラ  |
| 前提条件 | `facade.hasRunningExecution()` が `true` を返すモックを使用                |
| 操作     | `before-quit` イベントを手動でシミュレートする                             |
| 期待結果 | `event.preventDefault()` が 1 回呼ばれること                               |

#### TC-B-02: 実行中でないとき `event.preventDefault()` が呼ばれない

| 項目     | 内容                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| テスト名 | `before-quit guard does not call event.preventDefault() when no execution is running` |
| 対象     | `apps/desktop/src/main/index.ts` の `app.on('before-quit', ...)` ハンドラ             |
| 前提条件 | `facade.hasRunningExecution()` が `false` を返すモックを使用                          |
| 操作     | `before-quit` イベントを手動でシミュレートする                                        |
| 期待結果 | `event.preventDefault()` が呼ばれないこと                                             |

---

## テスト実行方法

```bash
# ElectronNotificationService のテスト実行
pnpm --filter @repo/desktop test -- ElectronNotificationService

# Facade 通知テストの実行
pnpm --filter @repo/desktop test -- RuntimeSkillCreatorFacade.notification

# before-quit guard テストの実行
pnpm --filter @repo/desktop test -- before-quit-guard

# 全テスト実行（最終確認）
pnpm vitest run
```

Phase 4 終了時点では、全テストが **Red（失敗）** であることを確認する。
対象実装ファイル（`INotificationService.ts`, `ElectronNotificationService.ts`, Facade 修正）が存在しないため必然的に失敗する。

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                         | 内容                      |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |

### 設計書

| 設計書                       | パス                             |
| ---------------------------- | -------------------------------- |
| 型設計                       | `phase-2-design.md` のタスク 2-2 |
| DI 注入ポイント              | `phase-2-design.md` のタスク 2-3 |
| `hasRunningExecution()` 設計 | `phase-2-design.md` のタスク 2-4 |
| `before-quit` ガード設計     | `phase-2-design.md` のタスク 2-5 |

---

## 実行手順

### ステップ 1: テストファイルの作成

タスク 4-1〜4-3 のテストファイルをそれぞれ作成する。
実装ファイルはまだ存在しないため、import エラーが出ることを確認する。

### ステップ 2: Red 状態の確認

```bash
pnpm --filter @repo/desktop test -- ElectronNotificationService
```

import エラーまたはテスト失敗（Red）になることを確認し、記録する。

### ステップ 3: テスト骨格の完成度確認

テストファイルに TC-E-01〜TC-E-03、TC-F-01〜TC-F-05、TC-B-01〜TC-B-02 が全て記述されていることを確認する。

---

## 多角的チェック観点

| 観点            | 確認内容                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| テストの独立性  | 各テストケースが他のテストに依存しないこと                                                                  |
| Mock の適切さ   | `MockNotificationService` がテストファイル内で完結していること（外部ファイルに書かない）                    |
| AC 対応の網羅性 | TC-E-01〜TC-E-03 が AC-2、TC-F-01〜TC-F-05 が AC-3〜AC-6・AC-8、TC-B-01〜TC-B-02 が AC-7 に対応していること |
| 環境依存の排除  | `Notification` コンストラクタをモックすることで jsdom 環境でも実行可能なこと                                |

---

## 成果物

| 成果物                             | パス                                                                                              | 説明             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| ElectronNotificationService テスト | `apps/desktop/src/main/services/notification/__tests__/ElectronNotificationService.test.ts`       | TC-E-01〜TC-E-03 |
| Facade 通知テスト                  | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | TC-F-01〜TC-F-05 |
| before-quit guard テスト           | `apps/desktop/src/main/__tests__/before-quit-guard.test.ts`                                       | TC-B-01〜TC-B-02 |

---

## 完了条件

- [ ] `ElectronNotificationService.test.ts` が作成された（TC-E-01〜TC-E-03 を含む）
- [ ] `RuntimeSkillCreatorFacade.notification.test.ts` が作成された（TC-F-01〜TC-F-05 を含む）
- [ ] `before-quit-guard.test.ts` が作成された（TC-B-01〜TC-B-02 を含む）
- [ ] 全テストが Red（失敗）状態であることを確認した
- [ ] AC-2, AC-3, AC-5, AC-6, AC-7, AC-8 の検証に対応するテストが網羅されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

Phase 4 完了時に以下を明記すること:

- 作成したテストファイル 3 本のパス
- Red 確認コマンドの実行結果（テスト数・失敗数）
- AC との対応表の確認完了

---

## 次 Phase

Phase 4 の完了条件が全て満たされたら Phase 5（実装）へ進む。
