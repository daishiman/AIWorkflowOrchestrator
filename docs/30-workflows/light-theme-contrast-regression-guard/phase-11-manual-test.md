# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 |
| Phase      | 11                                                 |
| Phase名    | 手動テスト                                         |
| ステータス | not_started                                        |
| 前提Phase  | Phase 10                                           |
| 後続Phase  | Phase 12                                           |

## 目的

設計した checklist と screenshot matrix が現実のレビュー運用で使えるか確認する。

## 実行タスク

- タスク1: representative 4 画面の撮影手順を確認する
- タスク2: current build source pinning を確認する
- タスク3: discovered-issues への起票手順を確認する

## 参照資料

| 参照資料                          | パス                                                                                        | 説明                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 11/12 guide                 | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | representative screenshot と evidence 運用 |
| Screenshot verification procedure | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md` | screenshot 実行手順                        |
| Phase 2 成果物                    | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-2/`                  | screenshot / audit 設計                    |
| Phase 5 成果物                    | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-5/`                  | 実装差分                                   |
| Phase 6 成果物                    | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-6/`                  | テスト拡張結果                             |
| Phase 7 成果物                    | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-7/`                  | coverage                                   |
| Phase 8 成果物                    | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-8/`                  | refactoring 結果                           |
| Phase 10 成果物                   | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-10/`                 | 最終レビュー結果                           |
| ui-ux-design-principles           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | 目視評価基準                               |
| quality report                    | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-9/quality-report.md` | 手動テスト観点の入力                       |

## 統合テスト連携

| 観点                   | 連携内容                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| Representative screens | Settings / Dashboard / Auth / WorkspaceSearch の light theme を current build で確認する |
| Source pinning         | current build / asset hash / capture metadata の一致を確認する                           |
| Evidence               | `manual-test-result.md` と発見事項を Phase 12 未タスク検出へ渡す                         |

## 成果物

| 成果物             | パス                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| manual-test-plan   | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-11/manual-test-plan.md`   |
| manual-test-result | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-11/manual-test-result.md` |

## 完了条件

- [ ] checklist が実運用できる
- [ ] representative 4 画面で問題なく回せる

## 次Phase

Phase 12: ドキュメント
