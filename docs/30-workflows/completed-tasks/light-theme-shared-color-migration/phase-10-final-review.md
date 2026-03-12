# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 10                                              |
| Phase名    | 最終レビュー                                    |
| ステータス | completed                                       |
| 前提Phase  | Phase 9                                         |
| 後続Phase  | Phase 11                                        |

## 目的

AC-1〜AC-5 の達成度と batch 完了性をレビューする。

## 実行タスク

- タスク1: batch 完了レビューを行う
- タスク2: backlog 整理レビューを行う
- タスク3: regression guard へ渡す残課題を判定する

## 参照資料

| 参照資料                | パス                                                                                                     | 説明                |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | ------------------- |
| Phase 2 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/`                  | batch 設計          |
| Phase 5 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-5/`                  | 実装差分            |
| Quality report          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-9/quality-report.md` | 最終判定の根拠      |
| Token foundation review | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-10/final-review-result.md` | 依存元の状態        |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                     | 完了/未タスク整理先 |
| requirements-definition | `outputs/phase-1/requirements-definition.md`                                                             | Phase 1 成果物      |
| priority-batches        | `outputs/phase-1/priority-batches.md`                                                                    | Phase 1 成果物      |
| backlog-mapping         | `outputs/phase-1/backlog-mapping.md`                                                                     | Phase 1 成果物      |
| migration-plan          | `outputs/phase-2/migration-plan.md`                                                                      | Phase 2 成果物      |
| batch-plan              | `outputs/phase-2/batch-plan.md`                                                                          | Phase 2 成果物      |
| codex-handoff           | `outputs/phase-2/codex-handoff.md`                                                                       | Phase 2 成果物      |
| implementation-summary  | `outputs/phase-5/implementation-summary.md`                                                              | Phase 5 成果物      |
| coverage-report         | `outputs/phase-7/coverage-report.md`                                                                     | Phase 7 成果物      |
| refactoring-plan        | `outputs/phase-8/refactoring-plan.md`                                                                    | Phase 8 成果物      |

## 統合テスト連携

| 観点           | 連携内容                                                        |
| -------------- | --------------------------------------------------------------- |
| Release gate   | Phase 11 で確認すべき representative screen と batch を固定する |
| Backlog bridge | 回帰 guard へ渡す current 差分と baseline を分離する            |
| Evidence       | `final-review-result.md` に AC 判定と移送先を残す               |

## 成果物

| 成果物              | パス                                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| final-review-result | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-10/final-review-result.md` |

## 完了条件

- [x] AC-1〜AC-5 の判定が記録されている
- [x] 残課題の移送先が決まっている

## 次Phase

Phase 11: 手動テスト
