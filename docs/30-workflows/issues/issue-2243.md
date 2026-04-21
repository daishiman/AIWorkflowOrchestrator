# [#2243] feat(skill-creator): TASK-SW-STRUCT-LLM-003 workflow.phases / workflow.tasks 自動生成

## メタ情報

\`\`\`yaml
task_id: TASK-SW-STRUCT-LLM-003
task_name: workflow.phases / workflow.tasks 自動生成
category: 改善
target_feature: SkillCreatorService / generateSkillMd
priority: 低
scale: 大規模
status: 未実施
source_phase: TASK-SW-STRUCT-002 Phase 12 / 未タスク検出 (UNASSIGNED-STRUCT-003)
created_date: 2026-04-17
dependencies: [TASK-SW-STRUCT-LLM-002]
spec_path: docs/30-workflows/unassigned-task/TASK-SW-STRUCT-LLM-003.md
\`\`\`

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 大規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

`generateSkillMd()` 内で `workflow.phases` と `workflow.tasks` が空配列 `[]` で固定されているため、generate_skill_md.js が生成する SKILL.md のワークフロー / タスクリストが TODO 表示になる。ルールベースまたは LLM を使った自動生成で充実させる。

## 2. 何を達成するか（What）

`generateSkillMd()` 内の `workflow.phases` / `workflow.tasks` を自動生成し、`StructurePlanJson` インターフェースに型安全なフィールドを追加する。

## 依存

- TASK-SW-STRUCT-LLM-002（features 自動生成の後に対応が望ましい）

## 詳細仕様書

`docs/30-workflows/unassigned-task/TASK-SW-STRUCT-LLM-003.md`
