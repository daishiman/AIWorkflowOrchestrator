# Documentation Changelog

## current wave

| 日付       | 対象          | 変更                                                                                                                      |
| ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-29 | workflow root | `step-03-seq-task-04-test-update/` を canonical root として再構成                                                         |
| 2026-03-29 | phase files   | `phase-11-manual-test.md` / `phase-13-pr-creation.md` へ命名統一                                                          |
| 2026-03-29 | outputs       | `outputs/phase-11/*` と `outputs/phase-12/*` を current root に整備                                                       |
| 2026-03-29 | artifacts     | `artifacts.json` / `outputs/artifacts.json` を同期し、Phase 11 補助成果物と Phase 13 blocked 状態を反映                   |
| 2026-03-29 | tracking docs | `UT-LLM-MOD-04-001` と `issue-1561` に parent workflow / detection artifact の導線を追加                                  |
| 2026-03-29 | parent refs   | `llm-provider-model-modernization/index.md` と `system-alignment-matrix.md` に canonical root / follow-up 参照を追記      |
| 2026-03-29 | skill mirrors | `.claude/skills/task-specification-creator` と `.claude/skills/aiworkflow-requirements` の差分を `.agents/skills/` へ同期 |
| 2026-03-29 | tests         | GoogleAdapter / provider-registry tests の旧モデル例を current registry へ更新                                            |
| 2026-03-29 | stale refs    | 旧 root と旧実装前提の記述を current facts へ更新                                                                         |

## changed files

- `docs/30-workflows/step-03-seq-task-04-test-update/index.md`
- `docs/30-workflows/step-03-seq-task-04-test-update/phase-11-manual-test.md`
- `docs/30-workflows/step-03-seq-task-04-test-update/phase-12-documentation.md`
- `docs/30-workflows/step-03-seq-task-04-test-update/artifacts.json`
- `docs/30-workflows/step-03-seq-task-04-test-update/outputs/artifacts.json`
- `docs/30-workflows/step-03-seq-task-04-test-update/outputs/verification-report.md`
- `docs/30-workflows/step-03-seq-task-04-test-update/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/step-03-seq-task-04-test-update/outputs/phase-12/system-spec-update-summary.md`
- `docs/30-workflows/step-03-seq-task-04-test-update/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/step-03-seq-task-04-test-update/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/step-03-seq-task-04-test-update/outputs/phase-12/phase12-task-spec-compliance-check.md`
- `docs/30-workflows/unassigned-task/UT-LLM-MOD-04-001.md`
- `docs/30-workflows/issues/issue-1561.md`
- `docs/30-workflows/llm-provider-model-modernization/index.md`
- `docs/30-workflows/completed-tasks/guided-execution-console-realization/system-alignment-matrix.md`
- `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts`
- `packages/shared/src/types/llm/schemas/__tests__/provider-registry.test.ts`
- `.agents/skills/task-specification-creator/SKILL.md`
- `.agents/skills/task-specification-creator/LOGS.md`
- `.agents/skills/task-specification-creator/scripts/complete-phase.js`
- `.agents/skills/aiworkflow-requirements/indexes/keywords.json`
- `.agents/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `.agents/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.agents/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.agents/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md`
- `.agents/skills/aiworkflow-requirements/references/workflow-task-rt-06-artifact-inventory.md`

## validation notes

- workflow files / outputs / tracking docs の導線を再点検
- `diff -rq .claude/skills .agents/skills` で parity 解消を確認
