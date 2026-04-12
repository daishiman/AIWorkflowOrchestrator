# [#1921] UT-RT-06-SKILL-STREAM-IPC-INTERNAL-TYPE-ALIGNMENT-001: SkillStreamMessage/SkillExecutorStreamMessage 変換パス型安全化

## メタ情報

```yaml
issue_number: 1921
title: UT-RT-06-SKILL-STREAM-IPC-INTERNAL-TYPE-ALIGNMENT-001: SkillStreamMessage/SkillExecutorStreamMessage 変換パス型安全化
state: OPEN
priority: 低
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-04-04
updated_date: 2026-04-04
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1921
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## タスクID

UT-RT-06-SKILL-STREAM-IPC-INTERNAL-TYPE-ALIGNMENT-001

## 目的

`SkillStreamMessage`（`skill.ts` IPC 契約型）と `SkillExecutorStreamMessage`（`skillCreator.ts` 内部処理型）の関係を明確化し、変��パスを型安全に���理する。

## 背景

UT-RT-06 の型統合により、packages/shared に2つの SkillStreamMessage 系列が共存:

1. `SkillStreamMessage`（skill.ts §5.1）— IPC 契約用 discriminated union
2. `SkillExecutorStreamMessage`（skillCreator.ts）— 内部処理用フラット構造

変換パスが暗黙的であり、型の対応関係がドキュメント化されていない。

## スコープ

- `SkillExecutorStreamMessage` → `SkillStreamMessage` の変換ロジック明示化・型安全化
- 変換関数の JSDoc 型対応表記述
- 必要に応じた変換ユーティリティの抽出

## 仕様書

`docs/30-workflows/unassigned-task/UT-RT-06-SKILL-STREAM-IPC-INTERNAL-TYPE-ALIGNMENT-001.md`

## 関��

- UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001
- UT-RT-06-SKILLEXECUTOR-DEPRECATED-ALIAS-MIGRATION-001
