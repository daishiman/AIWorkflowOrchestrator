# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 |
| Phase      | 10                                                 |
| Phase名    | 最終レビュー                                       |
| ステータス | not_started                                        |
| 前提Phase  | Phase 9                                            |
| 後続Phase  | Phase 11                                           |

## 目的

AC-1〜AC-5 に照らして guard 設計/実装をレビューする。

## 実行タスク

- タスク1: screenshot matrix の最終妥当性を確認する
- タスク2: audit / evidence policy の最終妥当性を確認する
- タスク3: 未完課題の formalize を判定する

## 参照資料

| 参照資料                | パス                                                                                                     | 説明                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 2 成果物          | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-2/`                               | screenshot / audit 設計 |
| Phase 5 成果物          | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-5/`                               | 実装差分                |
| Quality report          | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-9/quality-report.md`              | 最終判定の根拠          |
| Token foundation review | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-10/final-review-result.md` | 依存元の状態            |
| Shared migration review | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-10/final-review-result.md`           | 依存先の状態            |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                     | 完了/未タスク整理先     |

## 統合テスト連携

| 観点           | 連携内容                                                        |
| -------------- | --------------------------------------------------------------- |
| Release gate   | Phase 11 で確認すべき representative screen と drift を固定する |
| Backlog bridge | current 差分と baseline backlog を分離して Task 4 へ渡す        |
| Evidence       | `final-review-result.md` に AC 判定と移送先を残す               |

## 成果物

| 成果物              | パス                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| final-review-result | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-10/final-review-result.md` |

## 完了条件

- [ ] AC-1〜AC-5 の判定がある
- [ ] 残課題の formalize 方針がある

## 次Phase

Phase 11: 手動テスト
