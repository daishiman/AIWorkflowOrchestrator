# Phase 12 成果物: 未タスク検出

## 判定

- 新規未タスク: 1 件
- 既存追跡中の関連課題: 1 件

## 理由

- 実装範囲は既存 `dashboard` / `historySearch` / atoms 再利用の範囲に収まっている。
- UI上の minor 調整として発見した英日混在 microcopy は本タスク内で是正済み。
- `aiworkflow-requirements` の `quick_validate` warning 群は今回タスク起因ではなく、既存未タスク `UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001` で追跡済み。
- 再監査で `.claude/skills` と `.agents/skills` の dual root が Phase 12 成果物・テンプレート・validator 経路で混在しやすいことを確認し、新規未タスク `UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001` を起票した。
- あわせて既存未タスク `UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001` が `completed-tasks/.../unassigned-task/` へ誤配置されていた件は、`docs/30-workflows/unassigned-task/` へ再配置済みである。
- `docs/30-workflows/unassigned-task/` の全体 baseline には legacy 違反が残るが、今回差分の `currentViolations` は 0 件である。

## 新規未タスク

| タスクID                                             | 内容                                                                                             | 参照先                                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001 | `.claude` canonical root / `.agents` mirror sync / `diff -qr` 検証を Phase 12 完了条件へ昇格する | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-dual-skill-root-mirror-sync-guard-001.md` |

## 既存追跡中タスク

| タスクID                                              | 内容                                                                     | 参照先                                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 | `aiworkflow-requirements` の入口導線と `quick_validate` 判定整合の再設計 | `docs/30-workflows/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md` |
