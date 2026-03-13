# Sweep Manifest 設計

## Manifest 方針

- canonical root は `.claude` とする
- child workflow の source of truth は `docs/30-workflows/completed-tasks/*/index.md` とする
- completed-task pointer docs は履歴仕様として残し、workflow 正本への橋渡しだけを担う

## Manifest

| ID   | 分類                   | 対象ファイル                                                                              | 期待値                                             | drift class  | checker                         |
| ---- | ---------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------ | ------------------------------- |
| M-01 | parent-pointer         | `task-060-ui-04-workspace-view.md`                                                        | 04A/04B/04C が `completed-tasks/*/index.md` を指す | path drift   | guard script の required links  |
| M-02 | child-workflow         | `completed-tasks/task-058b.../index.md`, `task-059a.../index.md`, `task-059b.../index.md` | 実体 workflow が存在する                           | path drift   | exists check                    |
| M-03 | completed-task-pointer | `tasks/completed-task/task-058b...md`, `task-059a...md`, `task-059b...md`                 | status が移管済みで、workflow 正本リンクを持つ     | status drift | metadata/status parser          |
| M-04 | master-index           | `task-000-master-index.md`                                                                | 04A/04B/04C の参照先が実在パス                     | path drift   | line presence check             |
| M-05 | legacy-index           | `task-090-tasks-index-legacy.md`                                                          | 04A/04B/04C の status が `pending` ではない        | status drift | table row parser                |
| M-06 | task-workflow-ledger   | `.claude/.../task-workflow.md`                                                            | 04B の outputs path が completed workflow へ統一   | path drift   | forbidden/required string check |
| M-07 | ui-feature-ledger      | `.claude/.../ui-ux-feature-components.md`                                                 | 04B path が completed workflow へ統一              | path drift   | forbidden/required string check |
| M-08 | interfaces-ledger      | `.claude/.../interfaces-llm.md`, `.claude/.../interfaces-chat-history.md`                 | evidence path が completed workflow へ統一         | path drift   | forbidden/required string check |
| M-09 | capture-script         | `apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs`                     | workflow root が completed workflow へ統一         | path drift   | string check                    |
| M-10 | mirror-root            | `.claude/skills/aiworkflow-requirements/**`, `.agents/skills/aiworkflow-requirements/**`  | `diff -qr` が 0 件                                 | mirror drift | diff execution                  |

## 探索順

1. `parent-pointer`
2. `completed-task-pointer` / `master-index` / `legacy-index`
3. `task-workflow-ledger` / `ui-feature-ledger` / `interfaces-ledger`
4. `capture-script`
5. `mirror-root`

## 実装対象

- root script: `scripts/validate-workspace-parent-reference-sweep.mjs`
- test: `scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs`
- command: `node scripts/validate-workspace-parent-reference-sweep.mjs --json`
