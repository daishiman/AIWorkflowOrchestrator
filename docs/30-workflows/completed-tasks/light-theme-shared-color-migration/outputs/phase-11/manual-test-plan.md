# Phase 11 成果物: 手動テスト計画

## テストケース

| TC-ID    | surface / state              | viewport / theme  | 目的                                                                                   |
| -------- | ---------------------------- | ----------------- | -------------------------------------------------------------------------------------- |
| TC-11-01 | settings / overview          | 1440x1500 / light | ThemeSelector / AccountSection / Locale / Timezone の標準 light state を確認する       |
| TC-11-02 | settings / avatar-menu       | 1440x1500 / light | avatar edit menu の text / hover / border contrast を確認する                          |
| TC-11-03 | settings / delete-dialog     | 1440x1500 / light | danger dialog の title / body / input helper の可読性を確認する                        |
| TC-11-04 | settings / locale-dropdown   | 1440x1500 / light | locale dropdown の selected row / hover / border を確認する                            |
| TC-11-05 | settings / timezone-dropdown | 1440x1500 / light | timezone dropdown の search field / result list / current location button を確認する   |
| TC-11-06 | auth / representative        | 1280x960 / light  | auth surface の gradient、heading、helper、error banner を確認する                     |
| TC-11-07 | workspace-search / results   | 1440x1200 / light | WorkspaceSearchPanel の search / replace / results / alerts の contrast を確認する     |
| TC-11-08 | dashboard / reference        | 1440x1080 / light | shared migration の副作用が dashboard reference surface に波及していないことを確認する |

## 画面カバレッジマトリクス

| 画面            | 表示状態               | テーマ | viewport  | 優先度 | テストケース | 証跡ファイル                                                        | 備考                                               |
| --------------- | ---------------------- | ------ | --------- | ------ | ------------ | ------------------------------------------------------------------- | -------------------------------------------------- |
| Settings        | overview               | light  | 1440x1500 | A      | TC-11-01     | `screenshots/TC-11-01-settings-overview-light-desktop.png`          | ThemeSelector / AccountSection / Locale / Timezone |
| Settings        | avatar menu open       | light  | 1440x1500 | A      | TC-11-02     | `screenshots/TC-11-02-settings-avatar-menu-light-desktop.png`       | menu item contrast                                 |
| Settings        | delete dialog open     | light  | 1440x1500 | B      | TC-11-03     | `screenshots/TC-11-03-settings-delete-dialog-light-desktop.png`     | destructive state                                  |
| Settings        | locale dropdown open   | light  | 1440x1500 | A      | TC-11-04     | `screenshots/TC-11-04-settings-locale-dropdown-light-desktop.png`   | selected row / hover                               |
| Settings        | timezone dropdown open | light  | 1440x1500 | A      | TC-11-05     | `screenshots/TC-11-05-settings-timezone-dropdown-light-desktop.png` | search field / current location                    |
| Auth            | representative         | light  | 1280x960  | A      | TC-11-06     | `screenshots/TC-11-06-auth-surface-light-desktop.png`               | heading / helper / error band                      |
| WorkspaceSearch | results                | light  | 1440x1200 | A      | TC-11-07     | `screenshots/TC-11-07-workspace-search-results-light-desktop.png`   | results / alerts / mark                            |
| Dashboard       | reference              | light  | 1440x1080 | B      | TC-11-08     | `screenshots/TC-11-08-dashboard-reference-light-desktop.png`        | regression reference only                          |

## 観点

- readability: heading / body / helper / muted text が light background 上で沈まないか
- hierarchy: primary / secondary / muted / inverse の階層が semantic token で一貫しているか
- affordance: border / hover / selected / dialog / menu の境界が light mode で判別できるか
- regression: dashboard reference surface に current task の副作用が出ていないか

## mock 境界

- renderer component は本番実装を利用する
- electron API / auth profile / workspace search data は harness 用 mock を使う
- Main Process live navigation は使わず、current build の dedicated harness route で画面状態を固定する
