# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 11                                              |
| Phase名    | 手動テスト                                      |
| ステータス | not_started                                     |
| 前提Phase  | Phase 10                                        |
| 後続Phase  | Phase 12                                        |

## 目的

代表画面で light theme の見え方を確認する。

## 実行タスク

- タスク1: Settings / Dashboard / Auth / WorkspaceSearch の目視確認を行う
- タスク2: 文字可読性、背景の強さ、境界線の見え方を確認する
- タスク3: token task だけでは残った問題がないか切り分ける

## 参照資料

| 参照資料           | パス                                                                                     | 説明                                 |
| ------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 11/12 guide  | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`              | representative screenshot と記録方式 |
| Phase 2 成果物     | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-2/`                  | batch 設計                           |
| Phase 5 成果物     | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-5/`                  | 実装差分                             |
| Phase 6 成果物     | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-6/`                  | テスト拡張結果                       |
| Phase 7 成果物     | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-7/`                  | coverage                             |
| Phase 8 成果物     | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-8/`                  | refactoring 結果                     |
| Phase 10 成果物    | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-10/`                 | 最終レビュー結果                     |
| ui-ux-settings     | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                    | Settings の正本                      |
| ui-ux-search-panel | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                | WorkspaceSearch の正本               |
| quality report     | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-9/quality-report.md` | 手動テスト観点の入力                 |

## 統合テスト連携

| 観点                   | 連携内容                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| Representative screens | Settings / Dashboard / Auth / WorkspaceSearch の light theme を current build で確認する |
| Token split            | token foundation で扱う課題と component migration 課題を切り分ける                       |
| Evidence               | `manual-test-result.md` と発見事項を Phase 12 未タスク検出へ渡す                         |

## 成果物

| 成果物             | パス                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- |
| manual-test-plan   | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-11/manual-test-plan.md`   |
| manual-test-result | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-11/manual-test-result.md` |

## 完了条件

- [ ] representative screen の確認結果がある
- [ ] 残問題の切り分けができている

## 次Phase

Phase 12: ドキュメント
