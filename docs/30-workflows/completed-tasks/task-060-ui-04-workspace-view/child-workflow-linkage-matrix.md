# TASK-UI-04-WORKSPACE-VIEW child workflow linkage matrix

| 親責務                      | child workflow                | canonical path                                                                      | parent が保持する内容                             |
| --------------------------- | ----------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| レイアウト基盤の入口        | TASK-UI-04A-WORKSPACE-LAYOUT  | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/`  | 04A が 04B / 04C を block する依存順序            |
| chat 統合の入口             | TASK-UI-04B-WORKSPACE-CHAT    | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/`          | 04A 完了後に 04C と並列実行できる契約             |
| preview / search 統合の入口 | TASK-UI-04C-WORKSPACE-PREVIEW | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/` | 04A 完了後に 04B と並列実行できる契約             |
| system spec 反映            | 04A / 04B / 04C 全体          | `.claude/skills/aiworkflow-requirements/references/*.md`                            | parent は同期先一覧と canonical path のみ保持する |
| Phase 11 evidence 継承      | 04A / 04B / 04C 全体          | child workflow `phase-11-manual-test.md`                                            | parent は新規撮影をせず、継承可否だけを検証する   |
