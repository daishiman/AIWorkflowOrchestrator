# [#1330] [UT-LIFECYCLE-ORCHESTRATION-CARD-GRADUAL-REMOVAL-001] SkillLifecyclePanel 内部オーケストレーション3カードの段階的廃止

## メタ情報

```yaml
issue_number: 1330
title: [UT-LIFECYCLE-ORCHESTRATION-CARD-GRADUAL-REMOVAL-001] SkillLifecyclePanel 内部オーケストレーション3カードの段階的廃止
state: OPEN
priority: 中
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-03-18
updated_date: 2026-03-18
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1330
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

SkillLifecyclePanelの「進行状況」セクションを、ユーザーの仕事を主語にした表示に再構成し、内部オーケストレーション（Planner/Executor/Improver）の3カード構造を廃止する。

## 背景

ui-ux-realization.md のUX禁止事項「Planner/Executor/Improperをmode switchとして露出しない」に対して、ラベル変更（日本語化）は第一段階の対応にすぎない。「UIはjobとnext actionだけを出す」原則に完全準拠するため、構造自体の廃止が必要。

## 受入基準

- [ ] PlannerCard/ExecutorCard/ImproverCardコンポーネントがSkillLifecyclePanelから削除されている
- [ ] SkillProgressIndicatorがユーザーの仕事を主語にした表示を提供している
- [ ] ui-ux-realization.mdのUX禁止事項に完全準拠している
- [ ] `grep -rn "PlannerCard\|ExecutorCard\|ImproverCard" apps/desktop/src/renderer/` が0件

## 依存タスク

- TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001（Task09）の完了が前提

## 参照

- タスク指示書: `docs/30-workflows/unassigned-task/task-lifecycle-orchestration-card-gradual-removal-001.md`
- ui-ux-realization.md — UX禁止事項・導線原則
- P65 — Phase 2設計での存在しないProps/型値の前提使用
