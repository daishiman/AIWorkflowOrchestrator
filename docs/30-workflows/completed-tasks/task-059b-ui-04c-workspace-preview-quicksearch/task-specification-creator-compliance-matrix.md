# task-specification-creator Compliance Matrix

## メタ情報

| 項目     | 値                                          |
| -------- | ------------------------------------------- |
| タスクID | TASK-UI-04C-WORKSPACE-PREVIEW               |
| 作成日   | 2026-03-11                                  |
| 目的     | task-specification-creator 要件への準拠確認 |

## 準拠マトリクス

| 要件                                                | 出典                                                | 反映先                                                  | 状態 |
| --------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------- | ---- |
| create workflow の順序（分析→生成→出力→検証）を遵守 | `create-workflow.md`                                | `init-artifacts.js` 実行 + Phase生成 + 検証ログ         | 対応 |
| Phase 1-13 の13ファイル作成                         | `create-workflow.md`                                | `phase-1-*.md` 〜 `phase-13-*.md`                       | 対応 |
| `index.md` と `artifacts.json` を作成               | `create-workflow.md`                                | `index.md`, `artifacts.json`                            | 対応 |
| Phase 1-3 を先行確定してから後続へ進む              | ユーザー要件 + `create-workflow.md`                 | 作成順序（Phase1→2→3→4..13）                            | 対応 |
| 各Phaseに必須セクションを配置                       | `phase-templates.md`                                | 全Phaseファイル                                         | 対応 |
| Phase 1-11 に統合テスト連携節を配置                 | `phase-templates.md`, `validate-phase-output.js`    | `phase-1` 〜 `phase-11`                                 | 対応 |
| 各Phaseで aiworkflow 参照節を明記                   | `create-workflow.md`（システム仕様参照）            | 全Phaseの `### システム仕様（aiworkflow-requirements）` | 対応 |
| review gate 判定表（PASS/MINOR/MAJOR）を定義        | `review-gate-criteria.md`                           | `phase-3-design-review.md`, `phase-10-final-review.md`  | 対応 |
| Phase 11 screenshot plan/coverage 検証要件を定義    | `phase-11-12-guide.md`                              | `phase-11-manual-test.md`                               | 対応 |
| Phase 12 Task 12-1〜12-5 の必須成果物を定義         | `phase12-checklist-definition.md`                   | `phase-12-documentation.md`                             | 対応 |
| Phase 12 Task 12-1 に Part 1/Part 2 を含める        | `phase12-checklist-definition.md`                   | `phase-12-documentation.md` ステップ1                   | 対応 |
| Phase 12 の LOGS/SKILL 同期ルールを明示             | `evidence-sync-rules.md`                            | `phase-12-documentation.md`                             | 対応 |
| Concern分離（SubAgent責務）を仕様化                 | ユーザー要件 + `phase-templates.md`                 | `index.md`, `phase-1-requirements.md` ほか各Phase担当欄 | 対応 |
| 並列可能な検証タスクを並列実行                      | `create-workflow.md`（parタスク）                   | 監査時の並列検証実行（差分/参照/検証）                  | 対応 |
| 検証コマンドを明示し warning=0 で通過               | `create-workflow.md` Phase 5, `verify-all-specs.js` | `index.md`, `outputs/verification-report.md`            | 対応 |
| commit/PR 保留条件を明示                            | ユーザー要件                                        | `phase-13-pr-creation.md`                               | 対応 |

## 監査コマンド結果

| コマンド                                                                                                                                                                 | 結果                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch`       | PASS（エラー0 / 警告0） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` | PASS（エラー0 / 警告0） |

## 判定

- 必須要件 17 項目の準拠を確認
- 検証結果は `warning=0` まで改善済み
- Phase 1-12 の実行と workflow / outputs / system spec の completed 同期を完了した
