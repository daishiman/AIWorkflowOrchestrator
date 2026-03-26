# [#1552] [UT-TASKSPEC-SKILL-FEEDBACK-MANDATORY-001] Phase 12 skill-feedback-report 必須化

## メタ情報

```yaml
issue_number: 1552
title: [UT-TASKSPEC-SKILL-FEEDBACK-MANDATORY-001] Phase 12 skill-feedback-report 必須化
state: OPEN
priority: 中
scale: 小規模
category: -
status: 未実施
created_date: 2026-03-24
updated_date: 2026-03-24
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1552
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## タスク概要

Phase 12 テンプレートに skill-feedback-report が必須項目として含まれていない場合がある。テンプレート・artifacts.json・完了条件チェックリストに自動追加する仕組みを導入する。

## 発見元

- タスク: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
- Phase: 12 skill-feedback-report.md 改善提案3
- 関連Pitfall: P28（スキルフィードバックレポート未作成）

## 受入基準

- [ ] phase-templates.md の Phase 12 Task リストに skill-feedback-report が必須項目として含まれている
- [ ] artifacts.json に Phase 12 成果物として skill-feedback-report.md が自動追加される
- [ ] 05-task-execution.md に Phase 12 チェック項目が追加されている

## 指示書

`docs/30-workflows/unassigned-task/UT-TASKSPEC-SKILL-FEEDBACK-MANDATORY-001.md`
