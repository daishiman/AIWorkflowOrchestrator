# TASK-UI-04-WORKSPACE-VIEW requirements traceability matrix

| AC   | 要求                                                                       | 主な根拠                                                       | 反映Phase       |
| ---- | -------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------- |
| AC-1 | 親責務を pointer / orchestration / sync policy に限定する                  | `task-060-ui-04-workspace-view.md`, `task-000-master-index.md` | 1, 2, 3, 5      |
| AC-2 | child workflow canonical path を固定する                                   | child workflow index 3件                                       | 1, 2, 5, 12     |
| AC-3 | 04A が 04B / 04C を block し、04B / 04C が並列実行可能であることを明記する | master index Step 6-B / 6-C / 6-D                              | 1, 2, 4, 9      |
| AC-4 | `aiworkflow-requirements` 抽出セットと同期先を明記する                     | resource-map, quick-reference, task-workflow                   | 1, 2, 9, 12     |
| AC-5 | Phase 11 で child evidence 継承を検証する                                  | screenshot procedure, phase-11-12-guide                        | 1, 2, 11        |
| AC-6 | commit / PR 禁止、Phase 1-3 先行、Atent Team lane 分離を埋め込む           | ユーザー指示                                                   | 1, 2, 3, 10, 13 |
