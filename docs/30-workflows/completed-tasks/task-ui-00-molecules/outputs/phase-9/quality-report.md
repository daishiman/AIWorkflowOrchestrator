# Phase 9 品質レポート

- 作成日: 2026-03-04

## 静的解析

| 項目      | コマンド                                                                                                                                    | 結果                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Lint      | `pnpm lint -- "apps/desktop/src/renderer/components/molecules/{SearchBar,CodeViewer,TabSwitcher,SlideInPanel,ConfirmDialog}/**/*.{ts,tsx}"` | error 0 / warning 4（shared既存警告） |
| TypeCheck | `pnpm --filter @repo/desktop typecheck`                                                                                                     | PASS                                  |

## テスト

| 項目             | コマンド                                                | 結果                                  |
| ---------------- | ------------------------------------------------------- | ------------------------------------- |
| Molecules unit   | `cd apps/desktop && pnpm vitest run <5 test files>`     | 5 files / 69 tests PASS               |
| Coverage (scope) | `pnpm vitest run ... --coverage --coverage.include=...` | Lines 94.71 / Branch 87.07 / Func 100 |

## 補足

- `pnpm lint` は root スクリプトで repo 全体を走査するため、無関係領域（packages/shared）の warning が表示される
