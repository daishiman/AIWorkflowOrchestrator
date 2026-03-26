# [#1550] [UT-TASKSPEC-DESIGN-TEMPLATE-BRANCH-001] type:design テンプレート分岐追加

## メタ情報

```yaml
issue_number: 1550
title: [UT-TASKSPEC-DESIGN-TEMPLATE-BRANCH-001] type:design テンプレート分岐追加
state: OPEN
priority: 中
scale: 中規模
category: -
status: 未実施
created_date: 2026-03-24
updated_date: 2026-03-24
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1550
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## タスク概要

Phase 4-9 のテンプレートが implementation 前提で記述されており、設計タスク（type: design）では暗黙的な読み替えが必要。テンプレートに type 分岐を追加し、読み替えを自動化する。

## 発見元

- タスク: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
- Phase: 12 skill-feedback-report.md 改善提案1

## 受入基準

- [ ] phase-templates.md に type:design 向け Phase 4-9 テンプレートが追加されている
- [ ] SKILL.md のタスク生成フローに type 分岐が含まれている
- [ ] 既存の type:implementation テンプレートに影響がないこと

## 指示書

`docs/30-workflows/unassigned-task/UT-TASKSPEC-DESIGN-TEMPLATE-BRANCH-001.md`
