# Phase 4 Validator Command List

## command set

| コマンド                                                                                                                                                | 用途                                  | 再利用 Phase                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------- | ---- |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view`       | workflow 構造検証                     | 4, 9, 12                                                                                      |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view` | 全体整合性検証                        | 4, 9, 12                                                                                      |
| `rg -n "task-058b-ui-04a-workspace-layout-filebrowser                                                                                                   | task-059a-ui-04b-workspace-chat-panel | task-059b-ui-04c-workspace-preview-quicksearch" ...`                                          | child canonical path 監査 | 4, 6, 9                                                                                                     |
| `rg -n "04A.\*block                                                                                                                                     | 04B / 04C.\*並列" ...`                | dependency 契約監査                                                                           | 4, 6, 9                   |
| `rg -n "evidence 継承                                                                                                                                   | 新規 UI 撮影を行わず                  | N/A" docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/phase-11-manual-test.md` | Phase 11 policy 監査      | 4, 6, 9                                                                                                     |
| `rg -n "spec_created                                                                                                                                    | task-workflow                         | ui-ux-feature-components                                                                      | ui-ux-navigation          | lessons-learned" docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/phase-12-documentation.md` | Phase 12 sync target 監査 | 4, 9 |

## 実行ルール

- Phase 5 の更新直後に workflow root と pointer route を再確認する
- Phase 6 では system spec を含めた cross-doc audit を追加する
- Phase 9 / 12 で最終 PASS を記録する
