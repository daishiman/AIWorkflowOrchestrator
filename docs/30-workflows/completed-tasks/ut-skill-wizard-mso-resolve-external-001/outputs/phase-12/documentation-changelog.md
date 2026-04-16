# Documentation Changelog: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001

## 変更概要

Phase 12 close-out として、workflow root、Phase 12 必須6成果物、artifacts parity、
aiworkflow-requirements completed ledger を current facts に同期した。

## workflow 側更新

| ファイル                                                     | 更新内容                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| `index.md`                                                   | ステータスを `completed` に更新、Phase 1-12 / Phase 13 の実績を反映 |
| `artifacts.json`                                             | `status=completed`、各 phase status を current facts に更新         |
| `outputs/artifacts.json`                                     | root と同内容で新規作成し parity を確立                             |
| `outputs/phase-11/manual-test.md`                            | Phase 11 の動作確認結果を更新                                       |
| `outputs/phase-11/manual-test-result.md`                     | 補助スクリーンショット込みの結果表を更新                            |
| `outputs/phase-11/manual-test-report.md`                     | 補助スクリーンショットを含む報告へ更新                              |
| `outputs/phase-11/discovered-issues.md`                      | 0 件を維持                                                          |
| `outputs/phase-11/todo-deletion-confirmation.md`             | TODO / badge 残骸なしを維持                                         |
| `outputs/phase-11/screenshot-plan.json`                      | Q5 single / multi の補助スクリーンショット計画を追加                |
| `outputs/phase-11/phase11-capture-metadata.json`             | current build の capture metadata を追加                            |
| `outputs/phase-11/screenshots/q5-single-select-no-badge.png` | Q5 single select の画像証跡                                         |
| `outputs/phase-11/screenshots/q5-multi-select-no-badge.png`  | Q5 multi select の画像証跡                                          |
| `outputs/phase-12/implementation-guide.md`                   | 2パート構成へ全面書き換え                                           |
| `outputs/phase-12/system-spec-update-summary.md`             | renderer-local / shared N/A / ledger sync を明記                    |
| `outputs/phase-12/documentation-changelog.md`                | 本ファイル                                                          |
| `outputs/phase-12/unassigned-task-detection.md`              | 未タスク 0 件を明記                                                 |
| `outputs/phase-12/skill-feedback-report.md`                  | workflow / skill へのフィードバック整理                             |
| `outputs/phase-12/phase12-task-spec-compliance-check.md`     | Phase 12 準拠チェックを追加                                         |

## aiworkflow-requirements 側更新

| ファイル                                                                                       | 更新内容                  |
| ---------------------------------------------------------------------------------------------- | ------------------------- |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                 | recent list へリンク追加  |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-recent-2026-04g.md` | 新規作成                  |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-history.md`                   | 変更履歴追記              |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                           | current facts を追記      |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                               | current facts sync を記録 |
| `.agents/skills/aiworkflow-requirements/...`                                                   | mirror 同期               |

## 実行 / 未実行の検証コマンド

| コマンド / 確認                                                         | 状態     | 備考                                               |
| ----------------------------------------------------------------------- | -------- | -------------------------------------------------- |
| root `artifacts.json` と `outputs/artifacts.json` の diff               | 実行済み | PASS                                               |
| `rg --files docs/30-workflows/ut-skill-wizard-mso-resolve-external-001` | 実行済み | 実在ファイル棚卸し                                 |
| `sed` / `rg` による current facts 読み取り                              | 実行済み | コード・phase docs・ledger を参照                  |
| `vitest`                                                                | 実行済み | PASS（135 tests）                                  |
| `typecheck`                                                             | 実行済み | PASS                                               |
| `Playwright screenshot capture`                                         | 実行済み | PASS（Q5 single / multi の補助スクリーンショット） |
| `lint`                                                                  | 未実行   | この changelog 作成時点では未再実行                |
| `rg` による TODO / badge 残骸確認                                       | 実行済み | PASS（該当なし）                                   |

## current / baseline の扱い

- current: 今回の worktree 上で実在する code / workflow / ledger
- baseline: 以前の phase spec に残っていた pending 記述や、Q5 単一参照前提の説明

今回の Phase 12 では baseline を巻き戻さず、
current facts に合わせて close-out 文書だけを更新した。

## parity

| 対象                     | 状態    |
| ------------------------ | ------- |
| `artifacts.json`         | updated |
| `outputs/artifacts.json` | created |
| root / outputs parity    | pass    |
