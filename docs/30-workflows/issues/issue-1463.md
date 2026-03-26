# [#1463] "[UT-GUIDANCE-BLOCK-PROPS-UNIFICATION-001] UT"

## メタ情報

```yaml
task_id: UT-GUIDANCE-BLOCK-PROPS-UNIFICATION-001
task_name: UT
category: -
target_feature: -
priority: medium
scale: -
status: unassigned
source_phase: -
created_date: 2026-03-22
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-GUIDANCE-BLOCK-PROPS-UNIFICATION-001.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | medium     |
| 規模       | -          |
| ステータス | unassigned |

---

## 目的

`GuidanceBlock` の `handoff` variant が独自 variant props ではなく `HandoffGuidance` を受け取るように Props を統一する。

## 背景

Phase 2 設計で `GuidanceBlock` の `handoff` variant は独自の variant props（`command: string`, `explanation: string` など）を使用していた。`HandoffGuidance` を統一 DTO とする方針に基づき、`GuidanceBlock` も同じ DTO を受け取るように Props を統一する必要がある。これにより、Consumer 側が DTO 変換を意識せずに済む。

## 実行タスク

1. `GuidanceBlock` の現在の `handoff` variant props を調査する
2. `handoff` variant の Props を `HandoffGuidance` に変更する
3. `GuidanceBlock` 内部で `HandoffGuidance.terminalCommand` と `HandoffGuidance.contextSummary` を表示する実装に更新する
4. `GuidanceBlock` の既存の呼び出し元を新 Props に移行する
5. コンポーネントテストを更新する

## 参照資料

| 参照資料                      | パス                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| design-summary.md             | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md        |
| contract-matrix.md            | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/contract-matrix.md       |
| implementation-guide.md       | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-12/implementation-guide.md |
| ui-ux-agent-execution-core.md | .claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md                                     |

## 受入基準

- [ ] `GuidanceBlock` の `handoff` variant が `HandoffGuidance` Props を受け取る
- [ ] 旧 variant props（独自形式）が削除または deprecated されている
- [ ] 既存の呼び出し元が全て新 Props に移行されている
- [ ] コンポーネントテストが更新されておりパスしている

## 注意事項

- P46 対策: `HandoffGuidance` のフィールド名（`reason`, `content` 等）が HTML 標準属性と衝突しないか確認する。衝突する場合は `Omit<HTMLAttributes, "conflictingProp">` で除外する
- P47 対策: CSS 変数ベースのスタイルテストアサーションは variant 定数を export して再利用する
- MN-3 との関係: UT-GUIDANCE-BLOCK-HANDOFF-CARD-RULE-001 と並行して進める（使い分けルールが確定してから Props 変更を実施する）
