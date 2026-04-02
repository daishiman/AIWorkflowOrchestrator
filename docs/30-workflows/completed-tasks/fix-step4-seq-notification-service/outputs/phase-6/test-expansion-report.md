# Phase 6: テスト拡充レポート

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 6                             |
| タスクID | TASK-NOTIFICATION-SERVICE-001 |
| 実施日   | 2026-04-02                    |

---

## 追加テストケース一覧

### ElectronNotificationService（TC-E-04〜TC-E-05）

| TC      | テスト名                                                    | 目的                                                                      | 結果 |
| ------- | ----------------------------------------------------------- | ------------------------------------------------------------------------- | ---- |
| TC-E-04 | `notify() can be called multiple times independently`       | `notify()` を連続 3 回呼んでも `show()` が各回独立して呼ばれること        | PASS |
| TC-E-05 | `notify() passes empty strings to Notification constructor` | 空文字列を渡しても `Notification({ title: '', body: '' })` が呼ばれること | PASS |

### RuntimeSkillCreatorFacade（TC-F-06〜TC-F-08）

| TC      | テスト名                                                                  | 目的                                                                           | 結果 |
| ------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---- |
| TC-F-06 | `hasRunningExecution() returns true with multiple concurrent executions`  | 2 つの execute が並行実行中のとき `hasRunningExecution()` が `true` を返すこと | PASS |
| TC-F-07 | `hasRunningExecution() returns true when one of two executions completes` | 1 つが完了しもう 1 つが実行中のとき `true` を返すこと                          | PASS |
| TC-F-08 | `hasRunningExecution() returns false after all executions complete`       | 全 execute が完了した後 `false` を返すこと                                     | PASS |

### beforeQuitGuard（TC-B-03）

| TC      | テスト名                                                            | 目的                                                                                 | 結果 |
| ------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---- |
| TC-B-03 | `registerBeforeQuitGuard returns cleanup that removes the listener` | 戻り値の解除関数を呼ぶと `app.removeListener("before-quit", handler)` が呼ばれること | PASS |

---

## テストケース詳細と設計意図

### TC-E-04: 複数回呼び出し独立性

`ElectronNotificationService` は状態を持たないため、`notify()` の呼び出しは完全に独立している。
複数スキルが連続して完了した場合でも、各呼び出しが独立して `Notification` インスタンスを生成し `show()` を呼ぶことを検証。

### TC-E-05: 空文字列の透過

`INotificationService.notify(title, body)` の約束（interface）を守る限り、
`ElectronNotificationService` は入力値の検証をせず `Notification` コンストラクタに透過的に渡す。
入力バリデーションは呼び出し側（`RuntimeSkillCreatorFacade`）の責務であることを明確にする。

### TC-F-06〜TC-F-08: 並行実行カウンター

`activeExecutionCount` の加減算が並行実行でも正しく動作することを検証。
`Math.max(0, count - 1)` によるアンダーフロー防止が、部分完了シナリオでも機能することを確認。

### TC-B-03: ライフサイクル管理

`registerBeforeQuitGuard` が返す解除関数は、IPC ハンドラーのアンレジスター時（`unregisterAllIpcHandlers`）で呼ばれる。
この解除が `app.removeListener` を正しく呼ぶことを検証し、リスナーのリーク防止を確認。

---

## リグレッション確認結果

### 新規テストファイル（3 本）の実行結果

```
Test Files  3 passed (3)
     Tests  16 passed (16)
  Start at  02:10:45
  Duration  29.69s
```

| ファイル                                         | テスト数 | 結果 |
| ------------------------------------------------ | -------- | ---- |
| `ElectronNotificationService.test.ts`            | 5        | PASS |
| `beforeQuitGuard.test.ts`                        | 3        | PASS |
| `RuntimeSkillCreatorFacade.notification.test.ts` | 8        | PASS |

全 16 テスト GREEN。リグレッションなし。
