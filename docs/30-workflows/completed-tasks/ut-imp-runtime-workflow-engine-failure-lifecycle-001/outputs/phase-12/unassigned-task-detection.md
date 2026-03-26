# Unassigned Task Detection

## 検出結果

| 種別             | 内容                                                                                                          | 判定                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| canonical source | `docs/30-workflows/completed-tasks/unassigned-task/task-fix-runtime-workflow-engine-failure-lifecycle-001.md` | この workflow 自体が formalized follow-up task          |
| existing task    | `docs/30-workflows/unassigned-task/task-session-persistence.md`                                               | session persistence 永続化は既存未タスクへ委譲済み      |
| existing task    | `docs/30-workflows/unassigned-task/ut-sc-02-006-skill-lifecycle-panel-execute-handoff-ui-connection.md`       | terminal handoff UI surface は既存未タスクへ委譲済み    |
| existing task    | `docs/30-workflows/unassigned-task/task-imp-runtime-workflow-contract-drift-guard-001.md`                     | cross-layer contract drift guard は別未タスクへ分離済み |
| existing task    | `docs/30-workflows/unassigned-task/task-imp-task-sdk-02-phase11-phase12-evidence-compliance-001.md`           | Phase 11/12 evidence 是正は別未タスクへ分離済み         |

## 判定サマリー

- 新規未タスク作成: 0件
- 既存未タスク再参照: 4件
- raw の scope outside 項目は、既存 canonical file があるため再 formalize しない
