# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 4                                    |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | Phase 3                              |
| 後続Phase  | Phase 5                              |
| 作成日     | 2026-04-20                           |
| ステータス | completed                            |

## 目的

新規テストではなく、既存 cleanup 完了を検証できる targeted verification matrix を定義する。

## テスト戦略

| 種別             | 内容                                                                          | 期待結果 |
| ---------------- | ----------------------------------------------------------------------------- | -------- |
| static scan      | `ConversationRoundStep.tsx` から TODO / badge symbol が消えていること         | 0件      |
| current contract | `SkillCreateWizard.tsx` が `resolveExternalIntegration(toolNames)` を使うこと | 1件以上  |
| history check    | `git log` に PR #2199 相当履歴があること                                      | 1件以上  |

## 成果物

| 成果物       | パス                           | 説明                         |
| ------------ | ------------------------------ | ---------------------------- |
| テスト仕様書 | `outputs/phase-4/test-spec.md` | targeted verification matrix |

## 完了条件

- [x] targeted verification matrix を定義した
- [x] 新規実装前提のテスト作成を除去した
- [x] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次のPhase

Phase 5: 実装確認
