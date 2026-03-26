# [#1634] [TASK-SC-07] SkillCreateWizard への LLM 生成フロー接続

## メタ情報

```yaml
issue_number: 1634
title: [TASK-SC-07] SkillCreateWizard への LLM 生成フロー接続
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-25
updated_date: 2026-03-25
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1634
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

SkillCreateWizard の4段階フローに planSkill/executePlan を接続する。
Phase 2 設計でスコープ外とした未タスク（R-2）。

## 背景

TASK-SC-06-UI-RUNTIME-CONNECTION で SkillLifecyclePanel への接続を完了した。
SkillCreateWizard（GenerateStep）への接続は独立した別タスクで対応する。

## 変更対象ファイル

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`

## 受入基準

- [ ] DescribeStep で「LLM で生成」を選択した場合、planSkill が呼ばれる
- [ ] GenerateStep で plan 結果が表示される
- [ ] 既存の「テンプレートから作成」フローは非破壊

## 仕様書

`docs/30-workflows/unassigned-task/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION.md`
