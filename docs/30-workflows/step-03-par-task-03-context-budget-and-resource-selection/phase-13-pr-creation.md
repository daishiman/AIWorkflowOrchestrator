# Phase 13: PR作成

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 13                                    |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

ユーザー承認後にのみ実施する PR 作成の前提条件を明記し、spec_created 状態では blocked を維持する。

## 実行タスク

- ユーザー承認の有無を確認する
- ローカル確認項目を満たしているか確認する
- blocked 維持条件を明記する

## 参照資料

| 資料名                 | パス                                                                       | 説明                                 |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------------------ |
| Phase 2 設計           | `phase-2-design.md`                                                        | source / budget / degrade 設計の正本 |
| Phase 5 実装           | `phase-5-implementation.md`                                                | 実装対象                             |
| Phase 6 テスト拡充     | `phase-6-test-expansion.md`                                                | edge case coverage                   |
| Phase 7 coverage       | `phase-7-coverage-check.md`                                                | coverage 観点                        |
| Phase 8 refactoring    | `phase-8-refactoring.md`                                                   | naming / boundary 整理               |
| Phase 9 QA             | `phase-9-quality-assurance.md`                                             | quality gate                         |
| execute workflow       | `.claude/skills/task-specification-creator/references/execute-workflow.md` | Phase 13 の原則                      |
| Phase 10 最終レビュー  | `phase-10-final-review.md`                                                 | 直前 gate                            |
| Phase 11 manual test   | `phase-11-manual-test.md`                                                  | manual walkthrough                   |
| Phase 12 documentation | `phase-12-documentation.md`                                                | close-out 記録                       |

## 実行手順

### ステップ1: blocked 条件を確認する

- ユーザーの明示承認がない限り blocked を維持する。

### ステップ2: 承認後の前提を確認する

- build / test / typecheck / lint / docs validation の結果を確認する。
- `outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` の作成有無を記録する。

## 成果物

| 成果物             | パス                                     | 説明                                       |
| ------------------ | ---------------------------------------- | ------------------------------------------ |
| PR creation 本文   | `phase-13-pr-creation.md`                | blocked 条件の記録                         |
| local check result | `outputs/phase-13/local-check-result.md` | Phase 13 時点のローカル確認要約            |
| change summary     | `outputs/phase-13/change-summary.md`     | commit / PR 未実施のまま共有できる変更要約 |

## blocked 記録

- user approval: 未取得
- Phase 12 完了根拠: validator PASS、manual walkthrough 記録、Phase 12 成果物更新済み
- local check: `outputs/phase-13/local-check-result.md` に記録
- `pr-info.md` / `pr-creation-result.md`: user 未承認のため未作成

## 完了条件

- [ ] ユーザー指示があるまで blocked を維持する
- [ ] コミット / PR は実行しない
- [ ] 本 task は spec_created のため、Phase 13 は future step として扱う
