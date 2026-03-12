# Phase 6 Additional Test Cases

## cross-doc audit 追加ケース

| テストID   | 対象                               | コマンド                                                                                                                                                                                                            | 期待結果                                                       |
| ---------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| T060-XA-01 | parent pointer completed-task link | `rg -n "\\.\\./completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md                                                                                                                                      | \\.\\./completed-task/task-059a-ui-04b-workspace-chat-panel.md | \\.\\./completed-task/task-059b-ui-04c-workspace-preview-quicksearch.md" docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md` | 3件検出 |
| T060-XA-02 | master index completed-task link   | `rg -n "\\.\\./completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md                                                                                                                                      | \\.\\./completed-task/task-059a-ui-04b-workspace-chat-panel.md | \\.\\./completed-task/task-059b-ui-04c-workspace-preview-quicksearch.md" docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md`         | 3件検出 |
| T060-XA-03 | child evidence 実体                | `find .../task-058b.../screenshots -name 'TC-\*.png'                                                                                                                                                                | wc -l` 他                                                      | 04A=8, 04B=8, 04C=11                                                                                                                                                                                 |
| T060-XA-04 | system spec 04B stale path         | `rg -n "docs/30-workflows/task-059a-ui-04b-workspace-chat-panel/" .claude/skills/aiworkflow-requirements/references/task-workflow.md .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 0件が理想、残っていれば Phase 12 対象                          |

## 負例

- current path が system spec に残っていたら fail candidate
- child screenshot が規定件数より少なければ Phase 11 evidence 継承 fail
- parent pointer が task-00 stale path を指していたら Phase 5 へ戻す
