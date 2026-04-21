# [#2276] [TASK-AWR-SAME-WAVE-SYNC-CHECKLIST-001] aiworkflow-requirements Phase 12 — same-wave 台帳同期チェックリスト追加

## メタ情報

```yaml
issue_number: 2276
title: [TASK-AWR-SAME-WAVE-SYNC-CHECKLIST-001] aiworkflow-requirements Phase 12 — same-wave 台帳同期チェックリスト追加
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-04-18
updated_date: 2026-04-18
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2276
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスクID

TASK-AWR-SAME-WAVE-SYNC-CHECKLIST-001

## 概要

完了台帳更新時に `completed index`・`recent bundle`・`stale unassigned-task/親子タスク状態` の3点を同一 wave で同期するチェックリストが未定義。詳細 completed record だけ更新されて台帳冒頭 index や recent bundle の同期が漏れると、実装完了済みでも stale `open` が残存する。

Phase 12 の system-spec-update に same-wave チェックリスト（3点）を追加し、台帳同期漏れを防止する。

## スコープ

- Phase 12 手順への same-wave チェックリスト追加
- チェック項目: `completed index` 更新・`recent bundle` 追記・`stale unassigned-task/親子タスク状態` 同期
- 各項目に確認方法またはコマンド例を付記

## 受入基準

| ID   | 基準                                                            |
| ---- | --------------------------------------------------------------- |
| AC-1 | Phase 12 手順に same-wave チェックリスト（3点）が追加されている |
| AC-2 | completed index・recent bundle・stale 状態の3点が明示されている |
| AC-3 | 各項目に確認方法またはコマンド例が付記されている                |

## 発見元

TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001 Phase 12 skill-feedback-report (FB-AWR-002)

## 仕様書

`docs/30-workflows/unassigned-task/TASK-AWR-SAME-WAVE-SYNC-CHECKLIST-001.md`
