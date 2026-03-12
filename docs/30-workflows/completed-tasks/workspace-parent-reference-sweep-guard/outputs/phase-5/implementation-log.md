# 実装ログ

## 実装方針

Phase 4 で固定した `manifest -> guard -> mirror -> sync wiring` の順を守り、関心ごとを 4 つに分離して実装した。

| 担当       | 実装対象                              | 実施内容                                                                                                                                                                               |
| ---------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SubAgent-A | parent pointer / pointer docs / index | `task-060`、`task-000`、`task-090`、completed-task pointer docs の導線と status drift を是正                                                                                           |
| SubAgent-B | system spec / capture script          | `task-workflow.md`、`ui-ux-feature-components.md`、`interfaces-llm.md`、`interfaces-chat-history.md`、capture script の stale path を是正                                              |
| SubAgent-C | validator / tests / mirror            | `scripts/validate-workspace-parent-reference-sweep.mjs` と `scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs` を追加し、`.claude` 正本から `.agents` mirror へ同期 |
| SubAgent-D | Phase 12 sync                         | `lessons-learned.md`、`LOGS.md`、関連未タスク導線、Phase 12 記録のための更新ポイントを整理                                                                                             |

## 実装順序

1. `task-060` を completed workflow 正本へ向ける参照仕様へ変更した。
2. completed-task pointer docs に「実装 workflow 正本」リンクを追加し、status を移管済みへ更新した。
3. `task-000-master-index.md` と `task-090-tasks-index-legacy.md` を修正し、index 側の path/status drift を止めた。
4. `.claude/skills/aiworkflow-requirements/references/*.md` と capture script の stale path を正本 root へ更新した。
5. root validator と fixture test を追加して、自動で path/status/mirror drift を再検出できるようにした。
6. `generate-index.js` 実行後に `.claude -> .agents` の rsync と `diff -qr` を直列実行し、mirror drift を 0 に戻した。

## 変更ファイル一覧

| 区分            | ファイル                                                                                                                      | 変更内容                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| pointer         | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md`  | 04A/04B/04C の completed workflow `index.md` への導線を追加し、status を参照仕様へ変更 |
| index           | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md`          | 04A/04B/04C の参照先を `../completed-task/*.md` へ是正                                 |
| legacy index    | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-090-tasks-index-legacy.md`                             | TASK-UI-04A/B/C の status を `completed` へ更新                                        |
| pointer docs    | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md` ほか 2 件 | completed workflow 正本リンクを追加し、status を移管済み表記へ更新                     |
| system spec     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                          | 04B outputs path を completed workflow 正本へ統一し、関連未タスクを追加                |
| system spec     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                               | 04B workflow path を completed root へ統一し、関連未タスクを追加                       |
| system spec     | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                                         | 04B screenshot 証跡 path を completed root へ統一                                      |
| system spec     | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`                                                | 04B integration evidence path を completed root へ統一                                 |
| system spec     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                        | Workspace parent reference sweep guard 節を追加                                        |
| system spec log | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                                              | 本タスクの同期記録を追加                                                               |
| capture         | `apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs`                                                         | workflow root を completed workflow 正本へ変更                                         |
| validator       | `scripts/validate-workspace-parent-reference-sweep.mjs`                                                                       | path/status/mirror drift を 1 コマンドで検証する CLI を追加                            |
| test            | `scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs`                                                        | normalized / stale path / pending status / mirror drift の 4 fixture test を追加       |

## Green 化結果

| Red case                | 実装内容                                                                                     | 結果 |
| ----------------------- | -------------------------------------------------------------------------------------------- | ---- |
| stale parent pointer    | `task-060` の local `.md` 参照を completed workflow `index.md` へ変更                        | 解消 |
| stale master index      | `task-000` の 04A/04B/04C 参照先を実在 pointer doc へ変更                                    | 解消 |
| pending legacy status   | `task-090` と completed-task pointer docs の status を更新                                   | 解消 |
| stale 04B evidence path | `task-workflow.md` / `ui-ux-feature-components.md` / `interfaces-*` を completed root へ更新 | 解消 |
| stale capture root      | 04A capture script の workflow root を completed root へ更新                                 | 解消 |
| mirror drift            | `.claude` を canonical、`.agents` を mirror として rsync + `diff -qr` を固定                 | 解消 |

## 結論

Phase 4 で定義した 3 drift class と parent/child 導線整理は実装済みで、scope は docs/script/system-spec 更新に限定できている。Workspace 04A/04B/04C の Renderer UI 実装には変更を入れていない。
