# TASK-AWR-SAME-WAVE-SYNC-CHECKLIST-001

## メタ情報

```yaml
issue_number: 2276
```

## メタ情報

| 項目       | 値                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------- |
| タスクID   | TASK-AWR-SAME-WAVE-SYNC-CHECKLIST-001                                                          |
| 機能名     | awr-same-wave-sync-checklist                                                                   |
| ステータス | open（未着手）                                                                                 |
| 作成日     | 2026-04-18                                                                                     |
| 親タスク   | なし                                                                                           |
| 優先度     | Low                                                                                            |
| タスク種別 | docs/requirements-improvement（要件書改善）                                                    |
| 関連Issue  | #2276                                                                                          |
| ソース     | FB-AWR-002（TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001 Phase 12 skill-feedback-report） |

## 概要

`aiworkflow-requirements` スキルが管理する完了台帳（`task-workflow-completed.md`）の更新時に、`completed index`・`recent bundle`・`stale unassigned-task/親子タスク状態` の3点を同一 wave で同期するチェックリストが定義されていない。

詳細な completed record だけが更新されて、冒頭 index・recent bundle・未タスク導線の同期が抜けると、実装完了済みでも stale `open` ステータスが残存する問題が発生しやすい。

同一 wave チェックリストを `aiworkflow-requirements` スキルの Phase 12 手順に追加し、台帳同期漏れを防止する。

## スコープ

### 含む

- `aiworkflow-requirements` スキルの Phase 12 手順への same-wave チェックリスト追加
- チェックリスト項目: `completed index` 更新・`recent bundle` 追記・`stale unassigned-task/親子タスク状態` 同期
- チェックリストのサンプルとチェック方法の記述

### 含まない

- `task-workflow-completed.md` の構造変更
- 台帳更新の自動化
- `aiworkflow-requirements` 以外のスキルへの適用

## 受入基準

| ID   | 基準                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| AC-1 | Phase 12 手順に same-wave チェックリスト（3点）が追加されている                                             |
| AC-2 | チェック項目: `completed index` 冒頭更新・`recent bundle` 追記・`stale unassigned-task/親子タスク状態` 同期 |
| AC-3 | 各チェック項目に「確認方法」または「実施コマンド例」が付記されている                                        |

## 苦戦箇所（発見元コンテキスト）

`TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001` の close-out 作業で判明した課題:

1. **stale `open` の残存**: 詳細 completed record は更新済みでも、`task-workflow-completed.md` 冒頭 index や `task-workflow-completed-recent-2026-04g.md`（recent bundle）、さらに `unassigned-task/` 内の未タスク導線への反映が漏れていた。これにより、台帳では「完了」なのに未タスクでは「open」という矛盾状態が生じた。
2. **根本原因**: 「同一 wave での3点同期」という明示的なルールが存在しなかったため、個別更新に頼っていた。
3. **解決策**: Phase 12 の system-spec-update の Step 1-C を拡張し、3点チェックリストとして形式化する。
