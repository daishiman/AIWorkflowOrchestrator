# Phase 5 変更セット計画

## SubAgent 分担

| SubAgent | 担当                | 実施                              |
| -------- | ------------------- | --------------------------------- |
| A        | canonical 再計算    | `task-workflow.md` と物理配置確認 |
| B        | workflow 台帳同期   | completed/active 行更新           |
| C        | UI / detection 同期 | 2つの derived ledger を更新       |
| D        | 監査コード          | validator と test 追加            |

## 変更ファイル

- `.claude/skills/task-specification-creator/scripts/validate-task10ab-ledger-sync.js`
- `.claude/skills/task-specification-creator/scripts/__tests__/validate-task10ab-ledger-sync.test.mjs`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-12/unassigned-task-detection.md`
