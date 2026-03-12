# Phase 7 Coverage Report

## coverage 集計

| 項目                    | 計画                    | 実績                                     | 判定 |
| ----------------------- | ----------------------- | ---------------------------------------- | ---- |
| screenshot coverage     | 5 TC                    | 5 png + 1 metadata                       | PASS |
| audit target coverage   | 5 files                 | 5/5 files, missing 0                     | PASS |
| current drift coverage  | current target 2 files  | 0 violations                             | PASS |
| baseline drift coverage | baseline target 3 files | 64 violations                            | PASS |
| targeted automation     | 3 test files            | 46 tests PASS                            | PASS |
| build preflight         | current build           | `pnpm --filter @repo/desktop build` PASS | PASS |

## audit 内訳

| ファイル                   | 件数 | bucket   |
| -------------------------- | ---- | -------- |
| `ThemeSelector/index.tsx`  | 6    | baseline |
| `AuthView/index.tsx`       | 4    | baseline |
| `WorkspaceSearchPanel.tsx` | 54   | baseline |
| `SettingsView/index.tsx`   | 0    | current  |
| `DashboardView/index.tsx`  | 0    | current  |

## pattern 内訳

| pattern          | 件数 |
| ---------------- | ---- |
| `text-white*`    | 14   |
| `bg-slate-*`     | 19   |
| `text-slate-*`   | 19   |
| `border-slate-*` | 9    |
| `bg-white*`      | 2    |
| `border-white*`  | 1    |

## gap 分類

| 種別           | 件数           | 扱い                                  |
| -------------- | -------------- | ------------------------------------- |
| current gap    | 0              | 今回差分としては解消済み              |
| baseline gap   | 64             | shared-color-migration backlog        |
| visual backlog | 3 observations | Phase 11 / Phase 12 で formalize 済み |

## Phase 8 / 10 / 11 handoff

- Phase 8: config 集約と pass-through 追加の before/after を整理する。
- Phase 10: AC-1〜AC-5 の判定根拠に audit summary を使う。
- Phase 11: WorkspaceSearch / Auth / ThemeSelector の baseline 所見を evidence 化する。
