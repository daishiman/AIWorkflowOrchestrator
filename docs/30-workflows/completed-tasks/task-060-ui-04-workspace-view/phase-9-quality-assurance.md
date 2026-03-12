# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW          |
| Phase      | 9                                  |
| Phase名    | 品質保証                           |
| ステータス | completed                          |
| 前提Phase  | Phase 5, Phase 6, Phase 7, Phase 8 |
| 後続Phase  | Phase 10                           |

## 目的

親参照仕様が validator、traceability、system spec 抽出、child evidence 継承の全観点で破綻していないことを確認する。

## 実行タスク

- タスク1: validator suite を実行する
- タスク2: QA risk register を作成する
- タスク3: system spec 抽出の漏れを確認する

### タスク1: validator suite

| command                    | 判定        |
| -------------------------- | ----------- |
| `validate-phase-output.js` | PASS が必要 |
| `verify-all-specs.js`      | PASS が必要 |
| `rg` contract checks       | PASS が必要 |

### タスク2: QA risk register

| リスク                   | 影響                                | 対応                             |
| ------------------------ | ----------------------------------- | -------------------------------- |
| child path drift         | parent 入口が stale になる          | completed path を正本に固定する  |
| parent-child scope drift | parent が child detail を抱える     | Phase 3 / 10 で gate を掛ける    |
| evidence scope drift     | parent が新規 screenshot を要求する | Phase 11 で N/A と継承に固定する |

### タスク3: system spec 抽出漏れ確認

- resource-map と quick-reference の入口が index に反映されていることを確認する。
- `ui-ux-feature-components`, `ui-ux-navigation`, `task-workflow`, `lessons-learned` が Phase 12 に反映されていることを確認する。

## 参照資料

| 参照資料                     | パス                                                                               | 説明            |
| ---------------------------- | ---------------------------------------------------------------------------------- | --------------- |
| Phase 5 成果物               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-5/` | 実装内容        |
| Phase 4 成果物               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-4/` | contract test   |
| Phase 7 成果物               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-7/` | coverage        |
| Phase 8 成果物               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-8/` | refactor result |
| implementation-summary       | `outputs/phase-5/implementation-summary.md`                                        | Phase 5 成果物  |
| pointer-doc-update-plan      | `outputs/phase-5/pointer-doc-update-plan.md`                                       | Phase 5 成果物  |
| canonical-path-normalization | `outputs/phase-5/canonical-path-normalization.md`                                  | Phase 5 成果物  |
| refactoring-report           | `outputs/phase-8/refactoring-report.md`                                            | Phase 8 成果物  |
| terminology-normalization    | `outputs/phase-8/terminology-normalization.md`                                     | Phase 8 成果物  |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                 | 内容           |
| --------------- | -------------------------------------------------------------------- | -------------- |
| resource map    | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`     | 抽出入口       |
| quick reference | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`  | 検索語         |
| task workflow   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | child 完了台帳 |

## 実行手順

### ステップ1: validator suite を実行する

構造、全体整合、grep contract の3系統を再実行し、Phase 4-8 の成果物が崩れていないかを見る。

### ステップ2: QA risk register を整理する

path drift、scope drift、evidence drift、抽出漏れをリスクとして列挙し、Phase 10 の gate 入力に変換する。

### ステップ3: aiworkflow 抽出漏れを最終確認する

resource-map / quick-reference 起点で必要仕様が matrix と phase 本文に反映されているかを確認する。

## 統合テスト連携

| 観点                | 連携内容                                              |
| ------------------- | ----------------------------------------------------- |
| QA to final review  | PASS 結果を Phase 10 の gate 入力にする               |
| QA to documentation | Phase 12 で同期する doc 一覧を QA で再確認する        |
| QA to manual test   | evidence 継承ルールを Phase 11 の前提として再確認する |

## 多角的チェック観点

| 観点             | 適用判断 | 確認内容                                                                         |
| ---------------- | -------- | -------------------------------------------------------------------------------- |
| validator 品質   | 適用     | `validate-phase-output.js` / `verify-all-specs.js` / grep が再実行可能であること |
| aiworkflow 抽出  | 適用     | entrypoint だけでなく quality / a11y / error taxonomy まで確認できていること     |
| evidence 継承    | 適用     | Phase 11 の N/A / child evidence ルールが QA で再確認されていること              |
| branch diff 監査 | 適用     | 本 worktree の変更が skill 要件へ対応づいていること                              |

## 成果物

| 成果物               | パス                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| quality-verification | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-9/quality-verification.md` |
| qa-risk-register     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-9/qa-risk-register.md`     |

## 完了条件

- [ ] validator suite が PASS している
- [ ] QA risk register が作成されている
- [ ] system spec 抽出漏れが確認されている
- [ ] Phase 10 に渡す gate 入力が揃っている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- validator suite 実行
- QA risk register 作成
- aiworkflow 抽出漏れ確認
- Phase 10 入力整理

## タスク100%実行確認【必須】

- [ ] Phase 5-8 の成果物を前提に QA を実施している
- [ ] validator 3系統の PASS 条件が明記されている
- [ ] aiworkflow 抽出漏れの確認対象が resource-map から lessons まで届いている
- [ ] Phase 10 に渡すリスクと判定材料が整理されている

## 次Phase

Phase 10: 最終レビュー
