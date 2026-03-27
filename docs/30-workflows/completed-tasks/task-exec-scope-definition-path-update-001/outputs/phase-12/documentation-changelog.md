# Documentation Changelog

| kind                  | path                                                                                                                                     | note                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| workflow              | `docs/30-workflows/completed-tasks/task-exec-scope-definition-path-update-001/`                                                          | follow-up workflow 新規作成                                                   |
| implementation-anchor | `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md` | `execution-capability.ts` 行を追加                                            |
| phase12               | `outputs/phase-12/implementation-guide.md`                                                                                               | docs-only patch guide                                                         |
| phase12               | `outputs/phase-12/system-spec-update-summary.md`                                                                                         | Step 1 same-wave sync + Step 2 no-op 理由                                     |
| phase12               | `outputs/phase-12/skill-feedback-report.md`                                                                                              | 改善提案を actual skill update へ昇格                                         |
| system-spec           | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                                                           | docs-only follow-up 完了記録を追加                                            |
| system-spec           | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`                                        | implementation anchor / duplicate source baseline 判定の教訓を追加            |
| system-spec           | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`                          | execution-responsibility family の close-out sync を追加                      |
| index                 | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                                      | docs-only path correction 導線を追加                                          |
| skill                 | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                                           | implementation anchor path 実在確認 / baseline 判定の誤判断防止を追記         |
| skill                 | `.claude/skills/skill-creator/references/update-process.md`                                                                              | Phase 12 retrospective に docs-only path correction lane を追記               |
| logs                  | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                                                         | close-out sync を記録                                                         |
| logs                  | `.claude/skills/task-specification-creator/LOGS.md`                                                                                      | Phase 12 guard 更新を記録                                                     |
| logs                  | `.claude/skills/skill-creator/LOGS.md`                                                                                                   | retrospective pattern 更新を記録                                              |
| existing-follow-up    | `docs/30-workflows/unassigned-task/task-imp-task-spec-stale-path-duplicate-source-guard-001.md`                                          | stale path / duplicate source guard は既存 formalized task を再利用           |
| verification          | `outputs/verification-report.md`                                                                                                         | workflow validator PASS                                                       |
| verification          | `outputs/phase-13/local-check-result.md`                                                                                                 | canonical index / structure / skill validate / mirror parity を追記           |
| source drift          | `docs/30-workflows/completed-tasks/unassigned-task/*.md`                                                                                 | stale path / duplicate source / ID collision を current baseline として明文化 |

## Validator / Audit

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- `node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js`
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/completed-tasks/task-exec-scope-definition-path-update-001/outputs/phase-12/unassigned-task-detection.md`
- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements`
- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`
- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator`
- `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/aiworkflow-requirements`
- `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator`
- `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/skill-creator`
- `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`
- `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`
- `diff -qr .claude/skills/skill-creator .agents/skills/skill-creator`
