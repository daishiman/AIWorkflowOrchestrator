# [#1959] TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001: verifyAndImproveLoop adapter error 通知整理

## メタ情報

```yaml
issue_number: 1959
title: TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001: verifyAndImproveLoop adapter error 通知整理
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-06
updated_date: 2026-04-06
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1959
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`verifyAndImproveLoop()` 内で `improve()` が呼ばれた際の adapter error 通知処理が整理されておらず、review loop の feedback 文言が runtime guard とずれる可能性がある。

## 背景

TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 の Phase 10 MINOR 指摘として記録された。
`execute()` / `improve()` 単体の adapter error 通知は整備されているが、`verifyAndImproveLoop()` 内の `improve()` 呼び出し経路での通知パターンが未整理のまま残っている。

## 子タスク

- TASK-UT-RT-01-NOTIFY-HELPER-CONSOLIDATION-001 (#1936) — notify helper 統合
- TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001 (#1937) — executeAsync snapshot error propagation

## 受入基準

- `verifyAndImproveLoop()` 内の `improve()` 呼び出しにおいて adapter error 時の通知が `execute()` / `improve()` 単体と同等水準になっている
- 通知文言が統一されている

## 関連

- 親: TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001
- 子: #1936, #1937
