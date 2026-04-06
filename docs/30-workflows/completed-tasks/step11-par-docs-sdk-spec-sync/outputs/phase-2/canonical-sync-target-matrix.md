# Phase 2 成果物: Canonical Sync Target Matrix

## 更新対象ファイルと観点一覧

### SDK-04 対象（先に実施）

| 優先 | ファイル                     | パス                                                                           | 更新内容                                                                                         | no-op 根拠                                                                           |
| ---- | ---------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| 1    | `task-workflow-completed.md` | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | TASK-SDK-04 成果物パスを `step-04-par-task-04` から `completed-tasks/step-03-par-task-04` へ修正 | —                                                                                    |
| 2    | `resource-map.md`            | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`               | —                                                                                                | SDK-04 関連エントリ（`step-03-par-task-04-user-interaction-bridge`）不在のため no-op |
| 3    | `quick-reference.md`         | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`            | —                                                                                                | SDK-04 関連エントリ不在のため no-op                                                  |
| 4    | `topic-map.md`               | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  | —                                                                                                | SDK-04 関連エントリ不在のため no-op                                                  |

### SDK-02 対象（SDK-04 完了後に実施）

| 優先 | ファイル                                  | パス                                                                                        | 更新内容 | no-op 根拠                                                 |
| ---- | ----------------------------------------- | ------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| 5    | `architecture-overview-core.md`           | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | —        | L289 で既に current owner として記述済み                   |
| 6    | `arch-electron-services-details-part2.md` | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | —        | L133/L151 で current fact 反映済み                         |
| 7    | `api-ipc-system-core.md`                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | —        | L510 で TASK-SDK-02 完了タスクとして current fact 反映済み |

## 更新順の根拠

1. `task-workflow-completed.md` を seed として current fact を先に固定する（SDK-04 ledger）
2. index 群（resource-map / quick-reference / topic-map）は seed 確定後に no-op 確認（SDK-04 index）
3. system spec 3 ファイルは wording drift が解消済みのため no-op 確認（SDK-02）

**実作業**: task-workflow-completed.md line 300 の 1 箇所のみ修正が必要

## stale path 置換仕様

| 対象                            | before                                                                        | after                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| task-workflow-completed.md L300 | `docs/30-workflows/step-04-par-task-04-user-interaction-bridge-and-phase-ui/` | `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/` |
