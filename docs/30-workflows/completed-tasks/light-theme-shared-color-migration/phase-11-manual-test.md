# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 11                                              |
| Phase名    | 手動テスト                                      |
| ステータス | completed                                       |
| 前提Phase  | Phase 10                                        |
| 後続Phase  | Phase 12                                        |

## 目的

代表画面で light theme の見え方を確認する。

## 実行タスク

- タスク1: Settings / Dashboard / Auth / WorkspaceSearch の目視確認を行う
- タスク2: 文字可読性、背景の強さ、境界線の見え方を確認する
- タスク3: token task だけでは残った問題がないか切り分ける

## 参照資料

| 参照資料            | パス                                                                                                     | 説明                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 11/12 guide   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                              | representative screenshot と記録方式 |
| Phase 2 成果物      | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/`                  | batch 設計                           |
| Phase 5 成果物      | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-5/`                  | 実装差分                             |
| Phase 6 成果物      | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-6/`                  | テスト拡張結果                       |
| Phase 7 成果物      | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-7/`                  | coverage                             |
| Phase 8 成果物      | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-8/`                  | refactoring 結果                     |
| Phase 10 成果物     | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-10/`                 | 最終レビュー結果                     |
| ui-ux-settings      | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                    | Settings の正本                      |
| ui-ux-search-panel  | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                                | WorkspaceSearch の正本               |
| quality report      | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-9/quality-report.md` | 手動テスト観点の入力                 |
| final-review-result | `outputs/phase-10/final-review-result.md`                                                                | Phase 10 成果物                      |

## 統合テスト連携

| 観点                   | 連携内容                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| Representative screens | Settings / Dashboard / Auth / WorkspaceSearch の light theme を current build で確認する |
| Token split            | token foundation で扱う課題と component migration 課題を切り分ける                       |
| Evidence               | `manual-test-result.md` と発見事項を Phase 12 未タスク検出へ渡す                         |

## テストケース

| テストケース | 状態                                 | 観点        | 期待結果                                                         |
| ------------ | ------------------------------------ | ----------- | ---------------------------------------------------------------- |
| TC-11-01     | settings / overview / light          | readability | selector / profile / helper text / border hierarchy が読める     |
| TC-11-02     | settings / avatar-menu / light       | menu        | menu item text / hover / background が埋もれない                 |
| TC-11-03     | settings / delete-dialog / light     | destructive | title / body / input helper が判読できる                         |
| TC-11-04     | settings / locale-dropdown / light   | dropdown    | selected row / hover / border が識別できる                       |
| TC-11-05     | settings / timezone-dropdown / light | dropdown    | search field / current location button / row list が読める       |
| TC-11-06     | auth / representative / light        | hierarchy   | gradient 背景上でも title / helper / error band の階層が崩れない |
| TC-11-07     | workspace-search / results / light   | contrast    | results / alerts / counters / mark が判別できる                  |
| TC-11-08     | dashboard / reference / light        | regression  | current task の副作用が dashboard reference へ波及していない     |

## 画面カバレッジマトリクス

| 画面            | 表示状態               | テーマ | viewport  | 優先度 | テストケース | 証跡ファイル                                                        | 備考                                               |
| --------------- | ---------------------- | ------ | --------- | ------ | ------------ | ------------------------------------------------------------------- | -------------------------------------------------- |
| Settings        | overview               | light  | 1440x1500 | A      | TC-11-01     | `screenshots/TC-11-01-settings-overview-light-desktop.png`          | ThemeSelector / AccountSection / Locale / Timezone |
| Settings        | avatar menu open       | light  | 1440x1500 | A      | TC-11-02     | `screenshots/TC-11-02-settings-avatar-menu-light-desktop.png`       | menu state                                         |
| Settings        | delete dialog open     | light  | 1440x1500 | B      | TC-11-03     | `screenshots/TC-11-03-settings-delete-dialog-light-desktop.png`     | destructive state                                  |
| Settings        | locale dropdown open   | light  | 1440x1500 | A      | TC-11-04     | `screenshots/TC-11-04-settings-locale-dropdown-light-desktop.png`   | selected row / hover                               |
| Settings        | timezone dropdown open | light  | 1440x1500 | A      | TC-11-05     | `screenshots/TC-11-05-settings-timezone-dropdown-light-desktop.png` | search field / current location                    |
| Auth            | representative         | light  | 1280x960  | A      | TC-11-06     | `screenshots/TC-11-06-auth-surface-light-desktop.png`               | hero / helper / error band                         |
| WorkspaceSearch | results                | light  | 1440x1200 | A      | TC-11-07     | `screenshots/TC-11-07-workspace-search-results-light-desktop.png`   | search / replace / alerts                          |
| Dashboard       | reference              | light  | 1440x1080 | B      | TC-11-08     | `screenshots/TC-11-08-dashboard-reference-light-desktop.png`        | regression reference                               |

## 成果物

| 成果物             | パス                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| manual-test-plan   | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-11/manual-test-plan.md`   |
| manual-test-result | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-11/manual-test-result.md` |

## 完了条件

- [x] representative screen の確認結果がある
- [x] 残問題の切り分けができている

## 次Phase

Phase 12: ドキュメント
