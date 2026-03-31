# Phase 12: ドキュメント更新履歴 — TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001

## current

| 種別          | ファイル                                                                       | 内容                                                         |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| code          | `apps/desktop/electron.vite.config.ts`                                         | preload `exclude + alias` を追加                             |
| code          | `apps/desktop/vitest.config.ts`                                                | shared IPC alias を追加                                      |
| code          | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`   | relative import を alias 化                                  |
| code          | `apps/desktop/src/__tests__/electron-vite.preload-alias.test.ts`               | electron-vite 設定 drift を監査する回帰テストを追加          |
| docs          | `docs/30-workflows/task-fix-preload-vite-alias-shared-ipc-001/*`               | current facts へ再構成                                       |
| outputs       | `outputs/phase-11/manual-test-result.md`                                       | NON_VISUAL evidence を metadata / fallback reason 付きで補強 |
| outputs       | `outputs/phase-11/discovered-issues.md`                                        | Phase 11 必須の検出課題 0件記録を追加                        |
| outputs       | `outputs/phase-12/*.md`                                                        | generic canonical filename と current 0件の narrative へ統一 |
| system spec   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 完了記録を current facts へ更新                              |
| system spec   | `.claude/skills/aiworkflow-requirements/references/task-workflow-history.md`   | same-wave sync 履歴を追加                                    |
| system spec   | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`   | `UT-DX...` の完了移管を反映                                  |
| system spec   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` | 再発防止教訓追加                                             |
| skill log     | `.claude/skills/aiworkflow-requirements/LOGS.md`                               | same-wave sync 記録                                          |
| skill log     | `.claude/skills/task-specification-creator/LOGS.md`                            | canonical outputs 是正の記録                                 |
| skill history | `.claude/skills/aiworkflow-requirements/SKILL.md`                              | 変更履歴追記                                                 |
| skill history | `.claude/skills/task-specification-creator/SKILL.md`                           | 変更履歴追記                                                 |

## 実測

- `pnpm --filter @repo/desktop typecheck` PASS
- `pnpm --filter @repo/desktop build` PASS
- `pnpm --filter @repo/desktop exec vitest run src/__tests__/electron-vite.preload-alias.test.ts` PASS
- targeted vitest: `2 files / 37 tests PASS`

## baseline

baseline の wider governance 変更は行っていない。今回差分に閉じて更新した。
