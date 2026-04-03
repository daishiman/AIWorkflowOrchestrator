# [#1704] [UT-RT-01-PLAN-RESPONSE-DISCRIMINATED-UNION-001] RuntimeSkillCreatorPlanResponse discriminated union化

## メタ情報

```yaml
issue_number: 1704
title: [UT-RT-01-PLAN-RESPONSE-DISCRIMINATED-UNION-001] RuntimeSkillCreatorPlanResponse discriminated union化
state: OPEN
priority: 低
scale: -
category: リファクタリング
status: 未実施
created_date: 2026-03-29
updated_date: 2026-03-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1704
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

TASK-RT-01 で `RuntimeSkillCreatorPlanResponse` を union type として拡張したが、`success` フィールドによる discriminated union パターンになっておらず、型の絞り込みに `in` 演算子チェックが必要な状態。Discriminated union 化により型ガードの簡潔化と型安全性向上を図る。

## 関連タスク

- 親タスク: TASK-RT-01
- タスク仕様書: `docs/30-workflows/unassigned-task/task-ut-rt-01-plan-response-discriminated-union-001.md`

## 完了条件

- `RuntimeSkillCreatorPlanResult` に `success: true` が追加されている
- `RuntimeSkillCreatorPlanErrorResponse` に `success: false` が追加されている
- `success` フィールドで型を絞り込めるようになっている
- IPC ハンドラーの型ガードが更新されている
- 既存テストがリグレッションなし

## 優先度

Low - リファクタリング。機能的な影響はなく、コード品質・型安全性の改善。
