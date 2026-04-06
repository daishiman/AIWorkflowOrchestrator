# Documentation Changelog

## 2026-04-06（JST）

## スコープ

| 区分                 | 対象                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| current workflow     | `docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001/`                   |
| baseline（元指示書） | `docs/30-workflows/unassigned-task/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001.md` |
| same-wave skill sync | `.claude/skills/aiworkflow-requirements/` / `.claude/skills/task-specification-creator/`              |

baseline 側は `issue_number: 1906` を `1896` に修正したのみで、本文は source of truth として残す。

## 変更ファイル一覧

### current workflow

| 種別 | ファイル                                                 | 変更要点                                                       |
| ---- | -------------------------------------------------------- | -------------------------------------------------------------- |
| add  | `index.md`                                               | 成果物一覧の PR 行を「ユーザー承認後のみ」に変更               |
| add  | `artifacts.json`                                         | Phase 11/12 成果物名を canonical に統一、Phase 13 を `blocked` |
| add  | `outputs/artifacts.json`                                 | root `artifacts.json` と同一内容（台帳ミラー）                 |
| add  | `phase-11-manual-test.md`                                | `NON_VISUAL` 前提へ再構成（UI/スクリーンショット語彙の除去）   |
| add  | `outputs/phase-11/manual-test-checklist.md`              | Phase 11 補助成果物                                            |
| add  | `outputs/phase-11/manual-test-result.md`                 | Phase 11 補助成果物                                            |
| add  | `outputs/phase-11/discovered-issues.md`                  | Phase 11 補助成果物                                            |
| add  | `phase-12-documentation.md`                              | Phase 12 の実行手順を current facts へ再整形                   |
| add  | `outputs/phase-12/implementation-guide.md`               | Part 1/2 を self-contained 化し validator 要件を満たす         |
| add  | `outputs/phase-12/system-spec-update-summary.md`         | Step 1/2 / parity / same-wave sync の実測を記録                |
| add  | `outputs/phase-12/documentation-changelog.md`            | 本ファイル                                                     |
| add  | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出結果（0件でも出力）                                |
| add  | `outputs/phase-12/skill-feedback-report.md`              | skill feedback（改善点なしでも理由を記録）                     |
| add  | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 仕様準拠チェック（根拠付き）                          |
| add  | `outputs/verification-report.md`                         | `verify-all-specs.js` の出力                                   |

### same-wave skill sync

| 種別       | ファイル                                                                       | 変更要点                                         |
| ---------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| update     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | completed ledger 追記と current facts の縮約     |
| update     | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`   | 本タスク row を completed へ移管、残件 1件を維持 |
| update     | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 本タスクの completed record を追記               |
| update     | `.claude/skills/aiworkflow-requirements/LOGS.md`                               | close-out / validate の記録を追記                |
| update     | `.claude/skills/task-specification-creator/LOGS.md`                            | Phase 12 validate 補強の記録を追記               |
| update     | `.claude/skills/aiworkflow-requirements/SKILL.md`                              | 変更履歴を current facts に反映                  |
| update     | `.claude/skills/task-specification-creator/SKILL.md`                           | Phase 12 validate 補強の変更履歴を反映           |
| regenerate | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  | 見出しナビを再生成                               |
| regenerate | `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                 | topic-map 連動で再生成                           |

## 台帳同期

| 対象                                        | 実測                                                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `index.md`                                  | Phase 1〜13 へのリンクあり（`validate-phase-output.js` で PASS）                              |
| `phase-*.md`                                | Phase 1〜13 の「実行タスク / 完了条件」最低要件を満たす（`validate-phase-output.js` で PASS） |
| `artifacts.json` / `outputs/artifacts.json` | `diff -u` 差分 0（parity 一致）                                                               |

## Validator 実測結果

| コマンド                                                                                                                                                                                             | 結果                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001`                                   | PASS（31項目パス / 0エラー / 0警告）    |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 --json` | PASS（10/10 checks OK）                 |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001`                             | PASS（13/13 phases / 0エラー / 26警告） |

## 確認メモ

- `outputs/phase-12/*.md` は future wording を含めない。
- current / baseline の分離は `system-spec-update-summary.md` と本 changelog の両方で同じ粒度に揃える。
