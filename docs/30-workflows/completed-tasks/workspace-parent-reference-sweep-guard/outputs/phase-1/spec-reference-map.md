# 仕様参照マップ

## aiworkflow-requirements

| 仕様                                                                            | 目的                              | 今回の抽出ポイント                                                                                                          |
| ------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                | 読み込み対象の選定根拠            | docs 更新タスクとして `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` / `interfaces-*` を優先する |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 台帳正本                          | 04A/04B/04C の正本 workflow path と related UT の記録先                                                                     |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | feature spec 正本                 | Workspace 04A/04B/04C の path と関連未タスクの正本                                                                          |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再発防止                          | docs-only parent workflow sweep の 5分解決カード追加先                                                                      |
| `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | 04B の evidence path 正本         | workspace chat screenshot path を completed workflow へ統一する                                                             |
| `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`  | 04B の history evidence path 正本 | phase-6 integration evidence path を completed workflow へ統一する                                                          |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | capture script 安全側基準         | root path 補正は Renderer/Main の権限境界変更を伴わないことを確認する                                                       |

## task-specification-creator

| 仕様                                                                                 | 目的                  | 今回の抽出ポイント                                                                            |
| ------------------------------------------------------------------------------------ | --------------------- | --------------------------------------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/references/execute-workflow.md`           | フェーズ順序          | Phase 1-3 を先に固定し、Phase 4 以降へ順に進む                                                |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | Phase 11/12 必須作法  | manual result、documentation changelog、unassigned detection、mirror sync の証跡を出す        |
| `.claude/skills/task-specification-creator/references/review-gate-criteria.md`       | Phase 3/10 判定       | PASS/MINOR/MAJOR/CRITICAL を outputs に残す                                                   |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | Phase 12 更新順       | `task-workflow -> ui-ux-feature-components -> lessons-learned -> interfaces-*` の順で同期する |
| `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | current/baseline 分離 | `audit-unassigned-tasks --diff-from HEAD` の記録形式を揃える                                  |

## 実体ファイル

| 区分                        | 実体                                                                                                                                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| parent pointer              | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md`                                                                                                      |
| child workflow              | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/index.md` / `task-059a-ui-04b-workspace-chat-panel/index.md` / `task-059b-ui-04c-workspace-preview-quicksearch/index.md`                         |
| completed-task pointer docs | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md` / `task-059a-ui-04b-workspace-chat-panel.md` / `task-059b-ui-04c-workspace-preview-quicksearch.md`            |
| master / legacy index       | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md` / `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-090-tasks-index-legacy.md`          |
| stale path 発生源           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `ui-ux-feature-components.md` / `interfaces-llm.md` / `interfaces-chat-history.md` / `apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs` |
