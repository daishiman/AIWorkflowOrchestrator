# [#1502] [UT-SC-03-007] improve() P42 準拠バリデーション追加

## メタ情報

```yaml
issue_number: 1502
title: [UT-SC-03-007] improve() P42 準拠バリデーション追加
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1502
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

RuntimeSkillCreatorFacade.improve() に入力バリデーションがない。同Facade内の plan() は P42 準拠3段バリデーションを実施しているが、improve() は未実施で方針不統一。

## 背景

- TASK-SC-03 エレガント検証（類推思考 #16）で検出
- skillName と feedback パラメータの空文字列チェックが欠如

## 関連タスク

- TASK-SC-03-PLAN-LLM-PROMPT（親タスク）
- 指示書: docs/30-workflows/unassigned-task/UT-SC-03-007.md
