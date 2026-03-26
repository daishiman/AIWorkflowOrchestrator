# System Spec Update Summary

## Canonical Root

- 正本 root: `.claude/skills/aiworkflow-requirements/`
- mirror root: `.agents/skills/aiworkflow-requirements/`
- 本 task の Phase 12 判定は `.claude` 側の実更新を正本とし、mirror は代替しない

## Step 1: 完了記録

| 項目                      | 結果                                                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| workflow root 整理        | `docs/30-workflows/ut-imp-runtime-workflow-engine-failure-lifecycle-001/` を current root として固定              |
| Phase 12 必須6成果物      | すべて `outputs/phase-12/` 配下に配置済み                                                                         |
| artifacts 同期            | `artifacts.json` と `outputs/artifacts.json` を同値化して root inventory を整合                                   |
| manual-test evidence      | docs-only walkthrough として `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md` を確認 |
| implementation 実績       | `SkillCreatorWorkflowEngine.ts` / `RuntimeSkillCreatorFacade.ts` / runtime tests を failure lifecycle 契約へ更新  |
| verification command 実行 | `pnpm exec tsc --noEmit -p apps/desktop/tsconfig.json` と runtime targeted vitest を実行して結果を記録            |

## Step 2: domain spec sync

| 更新先                                                                                                            | 結果 | 理由                                                                                 |
| ----------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------ |
| `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-2/ownership-matrix.md` | 更新 | append history と failure transition 契約を親 workflow 正本へ反映                    |
| `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-6-test-expansion.md`           | 更新 | reject / `success:false` / `verification_review` / repeated failure の回帰観点を反映 |
| `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                  | 更新 | failure lifecycle 導線を spec_created から implementation/current fact へ更新        |
| `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                               | 更新 | completed ledger / lessons まで含む初動導線へ是正                                    |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                                    | 更新 | completed record と no-new-unassigned 方針、exact vitest workaround command を記録   |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md`   | 更新 | failure reason 分離 / append history / exact workaround command の教訓を追加         |
| `.claude/skills/task-specification-creator/LOGS.md`                                                               | 更新 | bug-fix close-out でも `.claude` 正本同期と exact command 記録を必須化した運用を追加 |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                    | 更新 | runtime bug-fix task の same-wave sync ルールを変更履歴へ反映                        |
| `.claude/skills/skill-creator/LOGS.md`                                                                            | 更新 | close-out pattern 反映ログを追加                                                     |
| `.claude/skills/skill-creator/references/patterns.md`                                                             | 更新 | runtime failure lifecycle bug-fix の same-wave close-out パターンを追加              |

## Step 2 更新が必要だった理由

- 実装で append history と failure snapshot が確定したため、親 workflow の ownership / test expansion も同 wave で更新する必要があった
- Task04 / Task08 が参照する owner / consumer rule を docs 側でも現行挙動へ揃える必要があった
- 이번 task は spec_created で終わらず implementation 完了まで進んだため、canonical index / completed ledger / lessons / skill pattern も current facts へ更新しないと再利用導線が stale になる

## 検証チェーン

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- `node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js`
- `rsync -a .claude/skills/<skill>/ .agents/skills/<skill>/` for `aiworkflow-requirements`, `task-specification-creator`, `skill-creator`
- `diff -qr .claude/skills/<skill> .agents/skills/<skill>` for the same 3 skills
- `validate-structure.js` は exit 0。500行超の 5 warning は既存 baseline であり、今回差分では増加していない
