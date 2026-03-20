# step-01-seq-task-01-execution-responsibility-contract-foundation

このディレクトリは `ai-runtime-execution-responsibility-realignment` 親パックの standalone Task01 正本です。

## canonical source

- `docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md`
- `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`

## policy

- 本 Task01 は `tasks/` 配下の leaf task ではなく、Task02-09 が参照する上流契約として standalone で管理する。
- system spec の canonical root は `.claude/skills/aiworkflow-requirements/`、`.agents/skills/aiworkflow-requirements/` は mirror として扱う。
- PR 作成は user の明示承認後のみ許可する。Phase 13 は approval 取得まで `blocked` とする。
