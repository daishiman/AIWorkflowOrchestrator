# [#2035] [TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-EXHAUSTIVE-CHECK-001] verifyAndImproveLoop() 内 exhaustive check 導入

## メタ情報

```yaml
issue_number: 2035
title: [TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-EXHAUSTIVE-CHECK-001] verifyAndImproveLoop() 内 exhaustive check 導入
state: OPEN
priority: 低
scale: -
category: リファクタリング
status: 未実施
created_date: 2026-04-08
updated_date: 2026-04-08
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2035
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスク概要

`RuntimeSkillCreatorFacade.verifyAndImproveLoop()` 内の `terminal_handoff` / `success` 判定を exhaustive switch に変更する。

## 背景

`executeAsync()` には `TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001` にて exhaustive check が導入済み。
`verifyAndImproveLoop()` は同じ union 型を扱うが、switch/assertNever パターンが未適用のため、将来の union 型拡張時に型レベルでの漏れを検出できない。

## スコープ

- `verifyAndImproveLoop()` 内の switch/assertNever パターン適用
- 外部 API シグネチャは変更なし

## 参考

- 親タスク: TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001 (#1993)
- 仕様書: docs/30-workflows/unassigned-task/task-ut-rt-01-verify-and-improve-loop-exhaustive-check-001.md
