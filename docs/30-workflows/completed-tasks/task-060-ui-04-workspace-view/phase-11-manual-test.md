# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW                                               |
| Phase      | 11                                                                      |
| Phase名    | 手動テスト                                                              |
| ステータス | completed                                                               |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10 |
| 後続Phase  | Phase 12                                                                |

## 目的

docs-only parent spec として、child workflow の screenshot evidence 継承、pointer / master index / completed-task pointer docs の入口、そして user 要求による representative screenshot 3件の current workflow 同期が正しく成立するかを確認する。

## 実行タスク

- タスク1: child workflow の Phase 11 証跡入口と件数を確認する
- タスク2: parent pointer / master index / completed-task pointer docs の入口を確認する
- タスク3: representative screenshot 3件を current workflow 配下へ同期する

### タスク1: child workflow の Phase 11 証跡入口

| child workflow                                   | 確認対象                                           |
| ------------------------------------------------ | -------------------------------------------------- |
| `task-058b-ui-04a-workspace-layout-filebrowser`  | `phase-11-manual-test.md` と screenshot 8件の入口  |
| `task-059a-ui-04b-workspace-chat-panel`          | `phase-11-manual-test.md` と screenshot 8件の入口  |
| `task-059b-ui-04c-workspace-preview-quicksearch` | `phase-11-manual-test.md` と screenshot 11件の入口 |

### タスク2: parent pointer と master index の入口

- parent pointer から 04A / 04B / 04C へ到達できることを確認する。
- master index Step 6-D が parent pointer を参照仕様として扱っていることを確認する。
- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/` 配下の 04A / 04B / 04C pointer docs が completed 状態と canonical root を示していることを確認する。

### タスク3: representative screenshot 3件の同期

| 対象 | current workflow に残す証跡            | 元 child evidence                  |
| ---- | -------------------------------------- | ---------------------------------- |
| 04A  | `TC-11-03-04a-3-pane-dark.png`         | `TC-11-02-3-pane-dark.png`         |
| 04B  | `TC-11-04-04b-file-chip-attached.png`  | `TC-11-03-file-chip-attached.png`  |
| 04C  | `TC-11-05-04c-quick-search-dialog.png` | `TC-11-04-quick-search-dialog.png` |

## 参照資料

| 参照資料                   | パス                                                                                                                         | 説明               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 11/12 guide          | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                                  | evidence ルール    |
| screenshot procedure       | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`                                  | N/A 記録ルール     |
| Phase 1 成果物             | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-1/`                                           | requirements       |
| Phase 2 成果物             | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-2/`                                           | design             |
| Phase 5 成果物             | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-5/`                                           | 実装内容           |
| Phase 6 成果物             | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-6/`                                           | expanded tests     |
| Phase 7 成果物             | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-7/`                                           | coverage           |
| Phase 8 成果物             | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-8/`                                           | refactor result    |
| Phase 9 成果物             | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-9/`                                           | QA result          |
| Phase 10 成果物            | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-10/`                                          | final gate result  |
| 04A Phase 11               | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/phase-11-manual-test.md`                    | child evidence     |
| 04B Phase 11               | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/phase-11-manual-test.md`                            | child evidence     |
| 04C Phase 11               | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/phase-11-manual-test.md`                   | child evidence     |
| parent pointer             | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md` | 入口確認           |
| master index               | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md`         | Step 6-D 確認      |
| completed-task pointer 04A | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md`          | completed 入口確認 |
| completed-task pointer 04B | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-059a-ui-04b-workspace-chat-panel.md`                  | completed 入口確認 |
| completed-task pointer 04C | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-059b-ui-04c-workspace-preview-quicksearch.md`         | completed 入口確認 |
| final-review-result        | `outputs/phase-10/final-review-result.md`                                                                                    | Phase 10 成果物    |
| remediation-directives     | `outputs/phase-10/remediation-directives.md`                                                                                 | Phase 10 成果物    |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                            | 内容                       |
| ------------------ | ------------------------------------------------------------------------------- | -------------------------- |
| task workflow      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | child 完了台帳             |
| feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | child feature 入口         |
| lessons learned    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | current build capture 教訓 |

## 実行手順

### ステップ1: child workflow の manual test 入口を確認する

04A / 04B / 04C の `phase-11-manual-test.md` と screenshot 証跡への到達性、および再取得後の件数を確認する。

### ステップ2: parent pointer と master index の導線を確認する

親ポインタ、master index、completed-task pointer docs から child へ辿れることを確認し、入口欠落を Phase 12 へ持ち越さない。

### ステップ3: parent current workflow に representative screenshot を残す

親 workflow 自体は新規 UI 実装を持たないが、user 要求による再監査では representative screenshot を current workflow 配下へ残し、Apple UI/UX 目視結果を同期する。

## テストケース

| テストケース | 観点                        | 期待結果                                                                                      |
| ------------ | --------------------------- | --------------------------------------------------------------------------------------------- |
| TC-11-01     | child evidence 入口         | 04A / 04B / 04C の manual test と screenshot 入口へ到達でき、件数 8 / 8 / 11 を確認できる     |
| TC-11-02     | parent pointer 導線         | `task-060` 親ポインタ、master index、completed-task pointer docs から child workflow へ辿れる |
| TC-11-03     | 04A representative snapshot | current workflow に 04A 代表 screenshot を保存できる                                          |
| TC-11-04     | 04B representative snapshot | current workflow に 04B 代表 screenshot を保存できる                                          |
| TC-11-05     | 04C representative snapshot | current workflow に 04C 代表 screenshot を保存できる                                          |

## 画面カバレッジマトリクス

| テストケース | 対象                     | 証跡                                                                                                                                                                                                                                                                             | 判定     | 備考                                     |
| ------------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------- |
| TC-11-01     | 04A / 04B / 04C evidence | `NON_VISUAL: child phase-11 spec + screenshot count 8 / 8 / 11; supporting refs: outputs/phase-11/screenshots/TC-11-03-04a-3-pane-dark.png, outputs/phase-11/screenshots/TC-11-04-04b-file-chip-attached.png, outputs/phase-11/screenshots/TC-11-05-04c-quick-search-dialog.png` | 継承確認 | child 側で再取得した evidence を親へ継承 |
| TC-11-02     | parent pointer route     | `NON_VISUAL: task-060 pointer / master index / completed-task pointer docs; supporting ref: outputs/phase-11/screenshots/TC-11-03-04a-3-pane-dark.png`                                                                                                                           | 導線確認 | docs-only verification                   |
| TC-11-03     | 04A representative       | `outputs/phase-11/screenshots/TC-11-03-04a-3-pane-dark.png`                                                                                                                                                                                                                      | 視覚確認 | 3-pane 情報階層                          |
| TC-11-04     | 04B representative       | `outputs/phase-11/screenshots/TC-11-04-04b-file-chip-attached.png`                                                                                                                                                                                                               | 視覚確認 | file chip + input hierarchy              |
| TC-11-05     | 04C representative       | `outputs/phase-11/screenshots/TC-11-05-04c-quick-search-dialog.png`                                                                                                                                                                                                              | 視覚確認 | quick search dialog                      |

## 統合テスト連携

| 観点                       | 連携内容                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| inherited evidence         | child workflow の screenshot evidence を parent manual test result へ渡す                    |
| pointer route              | parent pointer / master index / completed-task pointer docs の入口確認結果を Phase 12 へ渡す |
| representative screenshots | current workflow に保存した代表 screenshot と Apple UI/UX 所見を Phase 12 へ渡す             |

## 多角的チェック観点

| 観点                  | 適用判断 | 確認内容                                                                                                      |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| screenshot policy     | 適用     | docs-heavy parent の既定は継承だが、再監査では representative screenshot を current workflow に残していること |
| evidence inheritance  | 適用     | 04A / 04B / 04C の current evidence 入口が維持されていること                                                  |
| current build lessons | 適用     | current build capture 教訓を parent 再監査ルールへ転記できること                                              |
| documentation handoff | 適用     | Phase 12 へ渡す入口確認結果が残ること                                                                         |

## 成果物

| 成果物                     | パス                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| manual-test-checklist      | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-11/manual-test-checklist.md`    |
| manual-test-result         | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-11/manual-test-result.md`       |
| evidence-inheritance-log   | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-11/evidence-inheritance-log.md` |
| representative screenshots | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-11/screenshots/`                |

## 完了条件

- [ ] 3 child workflow の Phase 11 証跡入口が確認されている
- [ ] parent pointer / master index / completed-task pointer docs の入口が確認されている
- [ ] representative screenshot 3件が current workflow 配下に保存されている
- [ ] Phase 12 に渡す evidence log が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- child evidence 入口確認
- parent pointer / master index / completed-task pointer docs 導線確認
- representative screenshot 3件の current workflow 同期
- manual test result / evidence log への反映

## タスク100%実行確認【必須】

- [ ] `## テストケース` と `## 画面カバレッジマトリクス` がある
- [ ] 04A / 04B / 04C の child evidence をすべて参照している
- [ ] current workflow の representative screenshot 3件が記録されている
- [ ] Phase 12 に渡す evidence inheritance 情報が揃っている

## 次Phase

Phase 12: ドキュメント更新
