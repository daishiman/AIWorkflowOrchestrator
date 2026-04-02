# TASK-NOTIFICATION-SERVICE-001: INotificationService + macOS 完了通知 + before-quit guard 実装

## メタ情報

```yaml
issue_number: 1832
```

| 項目         | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| issue_number | #1832（※ 2026-04-01 時点で CLOSED。重複 Issue は作らず、着手時に reopen を検討） |
| タスクID     | TASK-NOTIFICATION-SERVICE-001                                                    |
| タスク名     | fix-step4-seq-notification-service                                               |
| 分類         | 改善（通知インフラ）                                                             |
| 対象機能     | スキル生成（長時間実行）の完了/失敗通知 + アプリ終了ガード                       |
| 優先度       | 中（`priority:medium`）                                                          |
| 見積もり規模 | 中規模（`scale:medium`）                                                         |
| ステータス   | 未実施（`status:unassigned`）                                                    |
| 発見元       | step3（TASK-FIX-EXECUTE-PLAN-FF-001）後の長時間実行対応の不足                    |
| 発見日       | 2026-04-01                                                                       |
| 参照仕様書   | `docs/30-workflows/fix-step4-seq-notification-service/`（Phase 1-13 完備）       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキル生成は 10〜30 分かかる可能性があり、ユーザーは生成中に別アプリへ移動することがある。
`execute-plan` を fire-and-forget 化（step3）した後は、UI が常に前面にある前提が崩れるため、完了/失敗をユーザーへ確実に伝える手段が必要になる。

### 1.2 問題点・課題

- macOS 通知（Electron の `Notification`）を送る責務がコードベースに存在しない
- `RuntimeSkillCreatorFacade` の DI 経路に通知依存がなく、完了/失敗の通知を差し込めない
- Electron 通知を Facade に直書きすると、ユニットテストが成立しにくい（実環境依存になりがち）
- 進行中にアプリを終了した場合のガード（`before-quit`）が未整備
- 既存の `notificationHandlers.ts`（DB 通知管理）と責務/名前空間が衝突しうる

### 1.3 放置した場合の影響

- 長時間実行が終わってもユーザーが結果を見逃し、再試行や原因調査が遅れる
- 進行中終了で状態破壊や不整合が起きても気づけない（復旧コスト増）
- 通知責務が ad-hoc に各所へ混入し、テスト不能な密結合が増える

---

## 2. 何を達成するか（What）

### 2.1 目的

スキル生成の完了/失敗を macOS 通知で伝え、実行中のアプリ終了を適切にブロックする。

### 2.2 受入条件（AC）

| AC   | 内容                                                                                        |
| ---- | ------------------------------------------------------------------------------------------- |
| AC-1 | `INotificationService.notify(title, body)` インターフェースが型安全に定義される             |
| AC-2 | `ElectronNotificationService` が `new Notification({ title, body }).show()` を呼ぶ          |
| AC-3 | `MockNotificationService` が `calls: Array<{title, body}>` を持つ                           |
| AC-4 | `RuntimeSkillCreatorFacadeDeps` に `notificationService: INotificationService` が追加される |
| AC-5 | スキル生成完了時に `notify('スキル作成完了', skillName)` が呼ばれる                         |
| AC-6 | スキル生成失敗時に `notify('スキル作成失敗', errorSummary)` が呼ばれる                      |
| AC-7 | `app.on('before-quit', ...)` で実行中チェックが行われる                                     |
| AC-8 | `hasRunningExecution()` が `boolean` を返す                                                 |
| AC-9 | 既存の `notificationHandlers.ts`（DB 通知管理）との競合がない                               |

### 2.3 スコープ

含むもの:

- `INotificationService` インターフェース定義
- `ElectronNotificationService` 実装（macOS 限定 MVP）
- `RuntimeSkillCreatorFacade` への DI 統合
- `before-quit` ガード（アプリ終了時の実行中チェック）

含まないもの:

- Windows / Linux 通知（別タスク）
- 通知設定 UI（別タスク）
- 通知履歴機能（既存 `notificationHandlers.ts` とは別管理）

### 2.4 成果物

| 種別     | ファイル                                                                                    |
| -------- | ------------------------------------------------------------------------------------------- |
| 新規作成 | `apps/desktop/src/main/services/notification/INotificationService.ts`                       |
| 新規作成 | `apps/desktop/src/main/services/notification/ElectronNotificationService.ts`                |
| 新規作成 | `apps/desktop/src/main/services/notification/__tests__/ElectronNotificationService.test.ts` |
| 修正     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                       |
| 修正     | `apps/desktop/src/main/index.ts`                                                            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- **ブロッカー**: TASK-FIX-EXECUTE-PLAN-FF-001（step3）が完了していること
  - `RuntimeSkillCreatorFacade.executeAsync()` と `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が実装済みであること

### 3.2 依存タスク

| タスクID                     | 状態      | 内容                                        |
| ---------------------------- | --------- | ------------------------------------------- |
| TASK-FIX-EXECUTE-PLAN-FF-001 | ❌ 未着手 | execute-plan の fire-and-forget 化（step3） |

### 3.3 推奨アプローチ（概要）

1. 通知責務を `INotificationService` として Main Process 内で抽象化する
2. `ElectronNotificationService` は Electron の `Notification` を薄くラップし、`isSupported()` でガードする
3. `RuntimeSkillCreatorFacade` は `notificationService` を deps で受け取り、成功/失敗時に notify する
4. `before-quit` で `facade.hasRunningExecution()` を見て、実行中なら `preventDefault()` する
5. 既存 `notificationHandlers.ts`（DB 通知）と名前/用途を混ぜない（OS 通知は service として閉じる）

---

## 4. 実行手順（Phase 概要）

詳細は `docs/30-workflows/fix-step4-seq-notification-service/` を正とし、ここでは未タスクとしての実行要点のみ記述する。

| Phase | 名称                  | 主な作業（要点）                                                              |
| ----- | --------------------- | ----------------------------------------------------------------------------- |
| 1     | 要件定義              | P50/インベントリ/AC/依存確認（step3 ブロッカー確認）                          |
| 2     | 設計                  | DI 境界と責務分離（Main のみ）、通知 API のガードとテスト戦略を確定           |
| 3     | 設計レビューゲート    | AC 網羅、競合（DB 通知）なし、テスト可能性 OK で Gate 通過                    |
| 4     | テスト作成（TDD Red） | Notification/Fascade/before-quit guard の 3 テストを Red で作成               |
| 5     | 実装                  | interface/class 追加、Facade に deps 追加、notify 呼び出し、before-quit 実装  |
| 6     | テスト拡充            | 失敗系/未対応環境（Notification 非対応）/エッジケース追加                     |
| 7     | カバレッジ確認        | 目標カバレッジ到達（Main 側サービス/Facade）                                  |
| 8     | リファクタリング      | DI 配線の明確化、テストの重複除去、命名揺れ修正                               |
| 9     | 品質保証              | typecheck/lint/test の通過                                                    |
| 10    | 最終レビューゲート    | AC-1〜AC-9 の充足と回帰リスク確認                                             |
| 11    | 手動テスト検証        | macOS 上で通知表示の実測確認 + before-quit ガード確認                         |
| 12    | ドキュメント更新      | implementation-guide/system-spec-update-summary/unassigned/feedback/changelog |
| 13    | PR 作成               | ユーザー明示承認後のみ                                                        |

---

## 5. 完了条件チェックリスト

### 機能要件（AC）

- [ ] AC-1〜AC-9 を満たす

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] Notification/Fascade/before-quit guard のテストが PASS
- [ ] `notificationHandlers.ts`（DB 通知）に変更がない、または衝突がない

### ドキュメント要件（Phase 12）

- [ ] `outputs/phase-12/implementation-guide.md`
- [ ] `outputs/phase-12/system-spec-update-summary.md`
- [ ] `outputs/phase-12/documentation-changelog.md`
- [ ] `outputs/phase-12/unassigned-task-detection.md`（0件でも必須）
- [ ] `outputs/phase-12/skill-feedback-report.md`（改善点なしでも必須）

---

## 6. 開発知見・苦戦箇所（記録）

| 課題                                               | ハマりどころ                                                                  | 対策（最短）                                                                                   |
| -------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Electron 通知 API の実行環境差                     | Renderer の `window.Notification` と、Main の `Notification` は別物になりがち | `ElectronNotificationService` を Main 側に閉じ、Facade へは interface 経由で注入               |
| ユニットテストで `new Notification()` が扱いづらい | 実環境依存でテストが壊れる                                                    | `Notification` コンストラクタをモックできる構造にし、`Notification.isSupported()` ガードも検証 |
| DB 通知との競合（`notificationHandlers.ts`）       | 「通知」という単語で責務が混線しやすい                                        | OS 通知は `services/notification/` に閉じ、既存 IPC/DB 通知の名前空間や import を侵食しない    |
| before-quit のガード実装                           | 実行中終了を止めると UX/終了フローが破綻しやすい                              | `hasRunningExecution()` の真偽と `event.preventDefault()` の最小実装から始め、段階的に拡張     |
