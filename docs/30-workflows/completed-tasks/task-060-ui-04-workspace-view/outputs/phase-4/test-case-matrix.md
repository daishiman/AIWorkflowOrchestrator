# Phase 4 Test Case Matrix

## contract test

| テストID   | 検証対象               | コマンド                                                                                                                                                | 期待結果                              |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------ |
| T060-CT-01 | Phase 1-13 完備        | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view`       | PASS                                  |
| T060-CT-02 | 全体整合性             | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view` | PASS                                  |
| T060-CT-03 | child canonical path   | `rg -n "task-058b-ui-04a-workspace-layout-filebrowser                                                                                                   | task-059a-ui-04b-workspace-chat-panel | task-059b-ui-04c-workspace-preview-quicksearch" docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/index.md docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/child-workflow-linkage-matrix.md` | 3 child path が検出される |
| T060-CT-04 | block / parallel 契約  | `rg -n "04A.\*block                                                                                                                                     | 04A.\*04B / 04C                       | 04B / 04C.\*並列" docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/phase-1-requirements.md docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/phase-2-design.md`                               | 依存順序が検出される      |
| T060-CT-05 | Phase 11 evidence 継承 | `rg -n "evidence 継承                                                                                                                                   | 新規 UI 撮影を行わず                  | N/A" docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/phase-11-manual-test.md`                                                                                                                              | 継承方針が検出される      |
| T060-CT-06 | Phase 12 sync target   | `rg -n "spec_created                                                                                                                                    | task-workflow                         | ui-ux-feature-components                                                                                                                                                                                                   | ui-ux-navigation          | lessons-learned" docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/phase-12-documentation.md` | 同期先が検出される |

## Phase 6 へ拡張する監査

- parent pointer route 監査
- master index Step 6-D 監査
- system spec の path drift 監査
- child Phase 11 evidence 実体監査
