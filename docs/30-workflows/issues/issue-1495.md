# [#1495] [UT-SC-03-002] 動的 apiKey 注入

## メタ情報

```yaml
issue_number: 1495
title: [UT-SC-03-002] 動的 apiKey 注入
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1495
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

plan() 実行時に RuntimePolicyResolver から取得した apiKey を LLM リクエストに動的注入する。現在は ILLMAdapter が内部的に認証を管理しているため、apiKey の渡し方を設計する。

## 背景

- TASK-SC-03 Phase 3 レビュー MINOR #2 で指摘
- 現在はapiKeyがLLMリクエストに反映されていない

## 関連タスク

- TASK-SC-03-PLAN-LLM-PROMPT（親タスク）
- 指示書: `docs/30-workflows/unassigned-task/UT-SC-03-002.md`

## ラベル

priority:medium, status:unassigned, enhancement
