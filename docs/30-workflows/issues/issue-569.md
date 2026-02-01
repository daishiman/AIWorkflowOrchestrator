# [#569] [task-imp-llm-handler-timeout-001] LLMハンドラーのタイムアウト機構実装

## メタ情報

```yaml
issue_number: 569
title: [task-imp-llm-handler-timeout-001] LLMハンドラーのタイムアウト機構実装
state: OPEN
priority: 中
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-01-29
updated_date: 2026-01-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/569
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## タスク概要

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | task-imp-llm-handler-timeout-001 |
| カテゴリ | 改善（imp）                      |
| 優先度   | 中                               |
| 規模     | 中                               |
| 発見元   | コードコメント（TODO）           |

## Why

LLMハンドラーにタイムアウト機構がなく、API呼び出しが無期限に待機し続ける可能性。ユーザー体験・リソースリークのリスク。

## What

AbortControllerベースのタイムアウト機構を実装（デフォルト30秒）。タイムアウト発生時の適切なエラーハンドリングを追加。

## 参照

- 仕様書: `docs/30-workflows/completed-tasks/TASK-CI-FIX-001-fix-backend-lint-next16/unassigned-tasks/task-imp-llm-handler-timeout-001.md`
