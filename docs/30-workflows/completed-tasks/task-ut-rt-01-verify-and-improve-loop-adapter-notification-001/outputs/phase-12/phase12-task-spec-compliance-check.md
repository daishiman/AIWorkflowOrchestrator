# Phase 12 仕様準拠チェック

## 対象

| 区分                 | 対象                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| current workflow     | `docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001/`                   |
| baseline             | `docs/30-workflows/unassigned-task/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001.md` |
| same-wave skill sync | `.claude/skills/aiworkflow-requirements/` / `.claude/skills/task-specification-creator/`              |

## チェック結果（Task 12-1〜12-6）

| 項目      | 判定 | 根拠（一次）                                                                                     |
| --------- | ---- | ------------------------------------------------------------------------------------------------ |
| Task 12-1 | PASS | `implementation-guide.md` が Part 1 / Part 2 の 2 パートで構成され、validator 条件を満たす       |
| Task 12-2 | PASS | `system-spec-update-summary.md` に Step 1-A/B/C、Step 2 N/A、parity、same-wave sync がある       |
| Task 12-3 | PASS | `documentation-changelog.md` に current workflow / baseline / skill sync と validator 結果がある |
| Task 12-4 | PASS | `unassigned-task-detection.md` が 0件でも出力され、残件の切り分けがある                          |
| Task 12-5 | PASS | `skill-feedback-report.md` が改善点なしでも理由を添えて出力されている                            |
| Task 12-6 | PASS | root evidence が 4条件ゲートと依存関係整合を説明できる                                           |

## 4条件ゲート

| 条件         | 判定 | 根拠                                                                                                           |
| ------------ | ---- | -------------------------------------------------------------------------------------------------------------- |
| 矛盾なし     | PASS | `phase-12-documentation.md` / `system-spec-update-summary.md` / `task-workflow*` が current facts で揃っている |
| 漏れなし     | PASS | Phase 12 必須 6 成果物がすべて出力されている                                                                   |
| 整合性あり   | PASS | current / baseline / skill sync の記述粒度が一致している                                                       |
| 依存関係整合 | PASS | Step 1-A/B/C → Step 2 N/A → Step 3〜6 の順序が維持されている                                                   |

## 証跡（実測）

| 観点                     | コマンド                                                                                                                                                                                             | 結果                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| workflow 出力検証        | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001`                                   | PASS（0エラー / 0警告）  |
| Phase12 実装ガイド検証   | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 --json` | PASS（10/10 checks OK）  |
| 仕様整合（warning 含む） | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001`                             | PASS（0エラー / 26警告） |
| artifacts parity         | `diff -u artifacts.json outputs/artifacts.json`                                                                                                                                                      | 差分 0                   |

## 補足

- `artifacts.json` と `outputs/artifacts.json` の parity は `diff -u` 差分 0。
- Phase 13 は `blocked` のままユーザー承認待ち。
