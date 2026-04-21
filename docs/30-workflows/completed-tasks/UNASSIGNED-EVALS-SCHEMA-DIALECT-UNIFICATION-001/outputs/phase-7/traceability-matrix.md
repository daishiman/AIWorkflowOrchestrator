# Phase 7: トレーサビリティ行列

| AC   | 根拠 output                                                                                            | 確認コマンド / 証跡                         |
| ---- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| AC-1 | `phase-2/consumer-matrix.md`, `phase-5/implementation-diff-check.md`                                   | 対象 consumer 一覧 + writer / reader 更新順 |
| AC-2 | `phase-2/validation-matrix.md`, `phase-7/coverage-report.md`                                           | 変更対象ペア限定 diff                       |
| AC-3 | `phase-4/test-scenarios.md`, `phase-4/command-suite.md`                                                | 対象限定 grep + fixture / desktop 回帰      |
| AC-4 | `phase-11/manual-test-checklist.md`, `phase-11/manual-test-result.md`, `phase-11/discovered-issues.md` | NON_VISUAL 3点セット                        |
| AC-5 | `phase-12/phase12-task-spec-compliance-check.md`, `artifacts.json`, `outputs/artifacts.json`           | 必須6成果物 + artifacts parity              |
