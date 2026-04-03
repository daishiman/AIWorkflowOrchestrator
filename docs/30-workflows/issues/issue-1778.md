# [#1778] [TASK-P0-07-OPERATION-PHASE-IDS-MANIFEST-DRIVEN-001] OPERATION_PHASE_IDS 定数の manifest-driven 化

## メタ情報

```yaml
issue_number: 1778
title: [TASK-P0-07-OPERATION-PHASE-IDS-MANIFEST-DRIVEN-001] OPERATION_PHASE_IDS 定数の manifest-driven 化
state: OPEN
priority: 低
scale: 小規模
category: -
status: 未実施
created_date: 2026-03-30
updated_date: 2026-03-30
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1778
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`RuntimeSkillCreatorFacade.ts` の `OPERATION_PHASE_IDS` 定数を manifest-driven 化する。

現在は `{ plan: ["requirements-gathering", "plan"], improve: ["improve"] }` とハードコードされており、エージェント名は TASK-P0-07 で manifest-driven になったが、「どの phase を読む」かはまだハードコードのまま。

## 背景

TASK-P0-07 で hardcoded agent names を manifest-driven に変更した。しかし `OPERATION_PHASE_IDS` 定数は依然ハードコードのままで、将来的に異なる phase 名称を持つスキルに対応する際に問題になる可能性がある。

## 受入基準

- [ ] `WorkflowManifest` 型に `operations?: Record<string, string[]>` フィールド追加
- [ ] `operations` フィールドがある場合は manifest の設定を使う
- [ ] `operations` フィールドがない場合は既存 `OPERATION_PHASE_IDS` にフォールバック
- [ ] 既存テストが pass する（後方互換性維持）
- [ ] 新しい manifest スキーマのユニットテストを追加する

## 参考実装

```ts
const operationPhaseIds =
  manifest.operations?.[operation] ?? OPERATION_PHASE_IDS[operation];
```

## 仕様書

`docs/30-workflows/unassigned-task/task-p0-07-operation-phase-ids-manifest-driven-001.md`

## 発見元

TASK-P0-07 (hardcoded-agent-names-dynamic-resolution) Phase 12 unassigned-task-detection（2026-03-30）
