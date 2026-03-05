# Phase 8 回帰検証記録

- 実施日: 2026-03-04
- 実施ディレクトリ: `apps/desktop`

## 実行コマンドと結果

| コマンド                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 結果                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `pnpm exec vitest run src/renderer/components/organisms/CardGrid/CardGrid.test.tsx src/renderer/components/organisms/MasterDetailLayout/MasterDetailLayout.test.tsx src/renderer/components/organisms/SearchFilterList/SearchFilterList.test.tsx`                                                                                                                                                                                                                                                      | PASS（3 files / 41 tests） |
| `pnpm exec vitest run src/renderer/components/organisms/CardGrid/CardGrid.test.tsx src/renderer/components/organisms/MasterDetailLayout/MasterDetailLayout.test.tsx src/renderer/components/organisms/SearchFilterList/SearchFilterList.test.tsx --coverage --coverage.include=src/renderer/components/organisms/CardGrid/index.tsx --coverage.include=src/renderer/components/organisms/MasterDetailLayout/index.tsx --coverage.include=src/renderer/components/organisms/SearchFilterList/index.tsx` | PASS（coverage取得）       |
| `pnpm typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | PASS                       |
| `pnpm exec eslint src/renderer/components/organisms/CardGrid src/renderer/components/organisms/MasterDetailLayout src/renderer/components/organisms/SearchFilterList src/renderer/views/OrganismsShowcaseView src/renderer/App.tsx`                                                                                                                                                                                                                                                                    | PASS（error 0）            |

## カバレッジ実測（Phase 8時点）

| 対象                         | Statements |   Branches |  Functions |      Lines |
| ---------------------------- | ---------: | ---------: | ---------: | ---------: |
| CardGrid/index.tsx           |     93.66% |     85.36% |       100% |     93.66% |
| MasterDetailLayout/index.tsx |       100% |     96.15% |        80% |       100% |
| SearchFilterList/index.tsx   |     99.29% |     96.96% |       100% |     99.29% |
| **全体**                     | **97.26%** | **92.00%** | **94.73%** | **97.26%** |

## 判定

- [x] リファクタ後も Green 維持
- [x] 品質閾値（quality-requirements）充足
- [x] Phase 9 へ引き継ぎ可能
