# Phase 12: 未タスク検出レポート

## メタ情報

| 項目     | 値                |
| -------- | ----------------- |
| タスクID | UT-SLIDE-IMPL-001 |
| Phase    | 12                |
| 検出日   | 2026-03-24        |

## 検出結果

**検出件数: 1件**

## 検出プロセス

1. Phase 10 最終レビューの MINOR 指摘: なし
2. 実装中に発見した残課題: 1件（Phase 5 Task 4 未完了チェック項目）
3. テスト中に発見した不整合: なし

## 検出結果

| #   | タスクID                        | 概要                                                                            | 優先度 | 指示書パス                                                                          |
| --- | ------------------------------- | ------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| 1   | UT-SLIDE-CAPABILITY-DYNAMIC-001 | resolveSlideCapability 動的実装（RuntimePolicyResolver / IAuthKeyService 統合） | 中     | `docs/30-workflows/unassigned-task/task-ut-slide-capability-dynamic-resolve-001.md` |

### UT-SLIDE-CAPABILITY-DYNAMIC-001 詳細

Phase 5 Task 4 に以下の5つの未チェック項目が残存:

1. `sessionId` から `RuntimePolicyResolver` 経由で lane を判定
2. `IAuthKeyService` 経由で apiKeySource を取得
3. uiStatus を現在の実行状態から算出（Phase 2 Task 5 の状態遷移根拠テーブルに従う）
4. `apiKeySource === "none"` の場合 `uiStatus: "guidance"` を返す（P62 対策）
5. エラー時に `blockedReason` を設定する

現在の `resolveSlideCapability()` は静的スタブ（`ipc-handlers.ts` L139-147）。
Phase 2 Task 5 で状態遷移根拠テーブルが設計済みのため、後続タスクで動的実装に移行する。

## 3ステップ完了確認（P3/P58 準拠）

- [x] `docs/30-workflows/unassigned-task/task-ut-slide-capability-dynamic-resolve-001.md` に指示書作成
- [x] `task-workflow-backlog.md` 残課題テーブルに登録
- [x] `phase-5-implementation.md` に参照リンク追加

## 備考

- Agent SDK adapter のデフォルト実装は getAgentAPI() レガシーAPIと並行して存在。統合は後続タスクのスコープ
