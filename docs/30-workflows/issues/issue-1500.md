# [#1500] [UT-SC-03-005] plan() エラーハンドリングの Result<T,E> パターン移行

## メタ情報

```yaml
issue_number: 1500
title: [UT-SC-03-005] plan() エラーハンドリングの Result<T,E> パターン移行
state: OPEN
priority: 中
scale: -
category: リファクタリング
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1500
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

RuntimeSkillCreatorFacade.plan() のエラーハンドリングが throw new Error() パターンを使用。02-code-quality.md の Result<T, E> ルールとの乖離。

## 背景

- TASK-SC-03 エレガント検証（30種思考法分析）で検出
- JSON パースエラーと API タイムアウトのエラー種別識別が不可能

## 関連タスク

- TASK-SC-03-PLAN-LLM-PROMPT（親タスク）
- 指示書: docs/30-workflows/unassigned-task/UT-SC-03-005.md
