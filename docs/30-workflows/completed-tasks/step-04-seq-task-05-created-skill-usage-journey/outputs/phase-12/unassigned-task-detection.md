# unassigned-task-detection: TASK-SKILL-LIFECYCLE-05

## 検出サマリー

| 指標       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| 検出件数   | 6件                                                  |
| ブロッカー | 0件                                                  |
| 配置先     | `docs/30-workflows/completed-tasks/unassigned-task/` |

## 検出結果一覧

| ID  | タスクID                                                         | 優先度 | 配置パス                                                                                                                |
| --- | ---------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | TASK-IMP-SKILL-LIFECYCLE-05-CTA-INTERACTION-STATES-001           | 低     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-cta-interaction-states-001.md`           |
| 2   | TASK-IMP-SKILL-LIFECYCLE-05-CUSTOMSTORAGE-VALIDATION-GUARD-001   | 低     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-customstorage-validation-guard-001.md`   |
| 3   | TASK-IMP-SKILL-LIFECYCLE-05-FAVORITE-SELECTOR-STABILITY-001      | 低     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-favorite-selector-stability-001.md`      |
| 4   | TASK-IMP-SKILL-LIFECYCLE-05-AMBIGUITY-CRITERIA-CLARIFICATION-001 | 中     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-ambiguity-criteria-clarification-001.md` |
| 5   | TASK-IMP-SKILL-LIFECYCLE-05-EMPTY-STATE-DETAIL-DESIGN-001        | 低     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-empty-state-detail-design-001.md`        |
| 6   | TASK-IMP-SKILL-LIFECYCLE-05-E2E-SCENARIOS-COVERAGE-001           | 中     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-e2e-scenarios-coverage-001.md`           |

## 3ステップ確認

- [x] Step 1: 未タスク指示書を作成した
- [x] Step 2: `task-workflow-backlog.md` に登録した
- [x] Step 3: 関連仕様書から参照可能にした

## 配置監査

| 監査                                                                                                  | 結果                                                              |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `verify-unassigned-links --source .claude/skills/aiworkflow-requirements/references/task-workflow.md` | missing=0                                                         |
| `audit-unassigned-tasks --json --diff-from HEAD`                                                      | currentViolations=0                                               |
| `audit-unassigned-tasks --json --target-file <6 files>`                                               | 全件 currentViolations=1（completed 配置を misplaced として検知） |

## 補足

旧命名互換の `unassigned-task-report.md` も保持し、詳細説明はそちらを参照可能とした。
