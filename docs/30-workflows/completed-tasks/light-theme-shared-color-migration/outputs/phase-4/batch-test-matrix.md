# Phase 4 成果物: batch-test-matrix

## Batch × テストケース

| TC-ID   | Batch | 対象                       | 観点                                                            | 自動テスト                                            |
| ------- | ----- | -------------------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| TC-A-01 | A     | ThemeSelector container    | `bg-white/5` / `border-white/10` 除去                           | `ThemeSelector.test.tsx`                              |
| TC-A-02 | A     | ThemeSelector option state | selected / unselected が token class を使う                     | `ThemeSelector.test.tsx`                              |
| TC-B-01 | B     | AuthView heading           | title / subtitle / icon が light で読める semantic class        | `AuthView.test.tsx`                                   |
| TC-B-02 | B     | AuthView error shell       | error card が status color + token text で崩れない              | `AuthView.test.tsx`                                   |
| TC-C-01 | C     | WorkspaceSearch root       | panel / toolbar / results summary の `slate-*` 除去             | `WorkspaceSearchPanel.test.tsx`                       |
| TC-C-02 | C     | WorkspaceSearch controls   | input / option toggle / replace button が token class を使う    | `WorkspaceSearchPanel.test.tsx`                       |
| TC-D-01 | D     | LocaleSelector             | field / dropdown option の `white` 直書き除去                   | `LocaleSelector.test.tsx`                             |
| TC-D-02 | D     | TimezoneSelector           | button / helper / search input の `white` 直書き除去            | `TimezoneSelector.test.tsx`                           |
| TC-D-03 | D     | AccountSection             | source scan で menu / dialog / summary の `white` 直書き除去    | `light-theme-shared-color-migration.contract.test.ts` |
| TC-D-04 | D     | Settings integration       | Settings shell が target component を含んだままクラッシュしない | `SettingsView.integration.test.tsx`                   |

## 手動テストへの引き継ぎ

| TC-ID   | Phase 11 での対応                                     |
| ------- | ----------------------------------------------------- |
| TC-A-01 | Settings surface screenshot の ThemeSelector で確認   |
| TC-B-01 | Auth surface screenshot で確認                        |
| TC-C-01 | WorkspaceSearch screenshot で確認                     |
| TC-D-01 | Settings surface screenshot の locale/timezone で確認 |
| TC-D-03 | Settings surface screenshot の account area で確認    |
