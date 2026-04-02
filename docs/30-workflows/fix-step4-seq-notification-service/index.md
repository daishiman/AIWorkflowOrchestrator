# fix-step4-seq-notification-service - タスク実行仕様書

## ユーザーからの元の指示

スキル生成完了時に macOS 通知を送信する INotificationService 抽象 + ElectronNotificationService 実装を追加し、ライフサイクル保護（before-quit guard）を実装する

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | TASK-NOTIFICATION-SERVICE-001           |
| タスク名     | fix-step4-seq-notification-service      |
| 分類         | 新機能                                  |
| 対象機能     | スキル生成通知サービス                  |
| 優先度       | 中                                      |
| 見積もり規模 | 中規模                                  |
| ステータス   | 未実施                                  |
| 作成日       | 2026-04-01                              |
| 前提タスク   | TASK-FIX-EXECUTE-PLAN-FF-001 完了が前提 |

---

## タスク概要

### 目的

スキル生成（完了まで 10〜30 分かかる可能性がある）が完了した際に、ユーザーが別のアプリを使用していても macOS 通知でその結果（完了／失敗）を受け取れるようにする。

### 背景

現状の問題点:

| 問題                                                   | 詳細                             |
| ------------------------------------------------------ | -------------------------------- |
| `new Notification()` API がコードベースに存在しない    | macOS 通知を送る手段がない       |
| `RuntimeSkillCreatorFacade` の deps に通知依存が未定義 | 通知の DI 経路がない             |
| 通知を直接 Facade に書くとユニットテスト不可能         | Electron は jsdom 環境で動かない |

### 最終ゴール

以下の 9 つの受入条件（AC）が全て満たされた状態でマージすること:

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

### スコープ

**含む:**

- `INotificationService` インターフェース定義
- `ElectronNotificationService` 実装（macOS 限定 MVP）
- `RuntimeSkillCreatorFacade` への DI 統合
- `before-quit` ガード（アプリ終了時の実行中チェック）

**含まない:**

- Windows / Linux 通知（macOS 限定 MVP）
- 通知設定 UI（別タスク）
- 通知履歴機能（既存 `notificationHandlers.ts` とは別管理）

### 成果物一覧

| 種別     | ファイル                                                                                    |
| -------- | ------------------------------------------------------------------------------------------- |
| 新規作成 | `apps/desktop/src/main/services/notification/INotificationService.ts`                       |
| 新規作成 | `apps/desktop/src/main/services/notification/ElectronNotificationService.ts`                |
| 新規作成 | `apps/desktop/src/main/services/notification/__tests__/ElectronNotificationService.test.ts` |
| 修正     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                       |
| 修正     | `apps/desktop/src/main/index.ts`                                                            |

---

## Phase 一覧

| Phase | 名称                  | 仕様書                                                       | ステータス |
| ----- | --------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義              | [phase-1-requirements.md](phase-1-requirements.md)           | 未実施     |
| 2     | 設計                  | [phase-2-design.md](phase-2-design.md)                       | 未実施     |
| 3     | 設計レビューゲート    | [phase-3-design-review.md](phase-3-design-review.md)         | 未実施     |
| 4     | テスト作成（TDD Red） | [phase-4-test-creation.md](phase-4-test-creation.md)         | 未実施     |
| 5     | 実装                  | [phase-5-implementation.md](phase-5-implementation.md)       | 未実施     |
| 6     | テスト拡充            | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 未実施     |
| 7     | カバレッジ確認        | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 未実施     |
| 8     | リファクタリング      | [phase-8-refactoring.md](phase-8-refactoring.md)             | 未実施     |
| 9     | 品質保証              | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 未実施     |
| 10    | 最終レビューゲート    | [phase-10-final-review.md](phase-10-final-review.md)         | 未実施     |
| 11    | 手動テスト検証        | [phase-11-manual-test.md](phase-11-manual-test.md)           | 未実施     |
| 12    | ドキュメント更新      | [phase-12-documentation.md](phase-12-documentation.md)       | 未実施     |
| 13    | PR 作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 未実施     |

---

## 実行フロー

```
Phase 1 (要件定義) → Phase 2 (設計) → Phase 3 (Gate: 設計レビュー) → Phase 4 (テスト作成)
                                              ↓
                                     (MAJOR→Phase 2 へ差し戻し)
                                              ↓
Phase 5 (実装) → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10 (Gate)
                                                                ↓
                                                       (MAJOR→戻り / PASS)
                                                                ↓
                                         Phase 11 → Phase 12 → Phase 13 → 完了
```

---

## 依存関係

| タスク                       | 方向               | 詳細                                                                                                      |
| ---------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------- |
| TASK-FIX-EXECUTE-PLAN-FF-001 | 前提（ブロッカー） | `RuntimeSkillCreatorFacade.executeAsync()` と `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が実装済みであること |

---

## Phase 完了時の必須アクション

1. **タスク 100% 実行**: Phase 内で指定された全タスクを完全に実行する
2. **成果物確認**: 全ての必須成果物が生成されていることを検証する
3. **artifacts.json 更新**: Phase 完了ステータスを `not_started` → `completed` に更新する
4. **完了条件チェック**: 各チェックボックスを全てチェックした旨を明記する

---

_このファイルは手動作成されました。_
_最終更新: 2026-04-01_
