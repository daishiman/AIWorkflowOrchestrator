# TASK-P0-07-OPERATION-PHASE-IDS-MANIFEST-DRIVEN-001: OPERATION_PHASE_IDS の manifest-driven 化

## メタ情報

```yaml
issue_number: 1778
task_id: TASK-P0-07-OPERATION-PHASE-IDS-MANIFEST-DRIVEN-001
task_name: OPERATION_PHASE_IDS 定数の manifest-driven 化
category: リファクタリング
target_feature: RuntimeSkillCreatorFacade / workflow-manifest schema
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-P0-07 Phase 12 unassigned-task-detection（2026-03-30）
created_date: 2026-03-30
dependencies: [TASK-P0-07]
```

| 項目         | 内容                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-P0-07-OPERATION-PHASE-IDS-MANIFEST-DRIVEN-001                                                                                                |
| タスク名     | `OPERATION_PHASE_IDS` 定数の manifest-driven 化                                                                                                   |
| 分類         | リファクタリング                                                                                                                                  |
| 対象機能     | `RuntimeSkillCreatorFacade` / `workflow-manifest.json` スキーマ                                                                                   |
| 優先度       | 低                                                                                                                                                |
| 見積もり規模 | 小規模                                                                                                                                            |
| ステータス   | 未実施                                                                                                                                            |
| 発見元       | `docs/30-workflows/completed-tasks/step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution/outputs/phase-12/unassigned-task-detection.md` |
| 発見日       | 2026-03-30                                                                                                                                        |

## 背景

TASK-P0-07 で、`planPromptConstants.AGENT_NAMES` / `improvePromptConstants.AGENT_NAME` を manifest-driven に変更した。しかし `RuntimeSkillCreatorFacade.ts` の `OPERATION_PHASE_IDS` 定数はまだハードコードされている。

```ts
// 現状
const OPERATION_PHASE_IDS: Record<"plan" | "improve", readonly string[]> = {
  plan: ["requirements-gathering", "plan"],
  improve: ["improve"],
};
```

この定数は「plan オペレーションには `requirements-gathering` / `plan` フェーズを使う」「improve オペレーションには `improve` フェーズを使う」という対応関係を定義している。現在はシステムレベルで固定されているが、将来的に異なる phase 名称を持つスキルに対応する場合に問題になる。

## 目的

`workflow-manifest.json` のスキーマに `operations` フィールドを追加し、`OPERATION_PHASE_IDS` の対応関係を manifest から読み込めるようにする。

## 受入基準

| ID   | 基準                                                                                 |
| ---- | ------------------------------------------------------------------------------------ |
| AC-1 | `workflow-manifest.json` に `operations` フィールドを追加できる                      |
| AC-2 | `operations` フィールドがある場合は manifest の設定を使う                            |
| AC-3 | `operations` フィールドがない場合は既存の `OPERATION_PHASE_IDS` にフォールバックする |
| AC-4 | 既存テストが pass する（後方互換性維持）                                             |
| AC-5 | 新しい manifest スキーマのユニットテストを追加する                                   |

## スコープ

**含む**:

- `WorkflowManifest` 型に `operations?: Record<string, string[]>` フィールド追加
- `ManifestLoader` での `operations` フィールド検証
- `RuntimeSkillCreatorFacade.getManifestResourcesForOperation()` の `operations` フィールド対応
- テスト追加

**含まない**:

- 既存 `workflow-manifest.json` の変更（スキーマ追加のみ、既存はそのまま動く）
- UI への影響

## 苦戦箇所の記録

TASK-P0-07 では「エージェント名の動的化」にフォーカスして「フェーズ ID の動的化」は意図的にスコープ外とした。本タスクを実施する際は `WorkflowManifest` の JSON Schema バリデーションも更新が必要。

## 参考実装

```ts
// manifest に operations があれば使う
const operationPhaseIds =
  manifest.operations?.[operation] ?? OPERATION_PHASE_IDS[operation];
```
