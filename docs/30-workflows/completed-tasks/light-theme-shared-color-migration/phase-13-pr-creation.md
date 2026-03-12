# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 13                                              |
| Phase名    | PR作成                                          |
| ステータス | blocked                                         |
| 前提Phase  | Phase 12                                        |
| 後続Phase  | なし                                            |

## 目的

将来の commit / PR 作成条件を明文化する。ただし本依頼では実行しない。

## 実行タスク

- タスク1: ユーザー承認があるまで commit / PR を禁止する
- タスク2: 承認後のみ batch 単位の commit 計画を起こす

## 参照資料

| 参照資料                  | パス                                                                                             | 説明                     |
| ------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------ |
| Phase 12 documentation    | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/phase-12-documentation.md` | 完了前提                 |
| Phase 2 成果物            | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/`          | batch 設計               |
| Phase 5 成果物            | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-5/`          | 実装差分                 |
| Phase 6 成果物            | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-6/`          | テスト拡張結果           |
| Phase 7 成果物            | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-7/`          | coverage                 |
| Phase 8 成果物            | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-8/`          | refactoring 結果         |
| Phase 9 成果物            | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-9/`          | 品質結果                 |
| Phase 10 成果物           | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-10/`         | 最終レビュー結果         |
| Phase 11 成果物           | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-11/`         | 手動テスト結果           |
| User policy               | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/index.md`                  | commit / PR 禁止ルール   |
| Execute workflow          | `.claude/skills/task-specification-creator/references/execute-workflow.md`                       | 将来の Phase 13 実行手順 |
| final-review-result       | `outputs/phase-10/final-review-result.md`                                                        | Phase 10 成果物          |
| manual-test-plan          | `outputs/phase-11/manual-test-plan.md`                                                           | Phase 11 成果物          |
| manual-test-result        | `outputs/phase-11/manual-test-result.md`                                                         | Phase 11 成果物          |
| discovered-issues         | `outputs/phase-11/discovered-issues.md`                                                          | Phase 11 成果物          |
| screenshot-plan           | `outputs/phase-11/screenshot-plan.json`                                                          | Phase 11 成果物          |
| screenshot-coverage       | `outputs/phase-11/screenshot-coverage.md`                                                        | Phase 11 成果物          |
| implementation-guide      | `outputs/phase-12/implementation-guide.md`                                                       | Phase 12 成果物          |
| spec-update-summary       | `outputs/phase-12/spec-update-summary.md`                                                        | Phase 12 成果物          |
| documentation-changelog   | `outputs/phase-12/documentation-changelog.md`                                                    | Phase 12 成果物          |
| unassigned-task-detection | `outputs/phase-12/unassigned-task-detection.md`                                                  | Phase 12 成果物          |
| skill-feedback-report     | `outputs/phase-12/skill-feedback-report.md`                                                      | Phase 12 成果物          |

## ユーザー承認ゲート

| 項目   | ルール           |
| ------ | ---------------- |
| commit | 明示承認まで禁止 |
| PR     | 明示承認まで禁止 |
| push   | 明示承認まで禁止 |

## 成果物

| 成果物  | パス                                                                                               |
| ------- | -------------------------------------------------------------------------------------------------- |
| pr-plan | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-13/pr-plan.md` |

## 完了条件

- [ ] commit / PR 禁止方針が残っている
- [ ] blocked 理由が明文化されている

## 次Phase

なし
