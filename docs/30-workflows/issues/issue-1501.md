# [#1501] [UT-SC-03-006] buildPlanSystemPrompt / parsePlanResponse 単体テスト追加

## メタ情報

```yaml
issue_number: 1501
title: [UT-SC-03-006] buildPlanSystemPrompt / parsePlanResponse 単体テスト追加
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1501
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

buildPlanSystemPrompt() と parsePlanResponse() の直接単体テストが欠如。Facade統合テスト経由でのみ検証されており、リファクタリング安全性にリスク。

## 背景

- TASK-SC-03 エレガント検証（2軸思考 #8）で検出
- 将来のプロンプトテンプレート変更時のリグレッション検出が間接的

## 関連タスク

- TASK-SC-03-PLAN-LLM-PROMPT（親タスク）
- 指示書: docs/30-workflows/unassigned-task/UT-SC-03-006.md
