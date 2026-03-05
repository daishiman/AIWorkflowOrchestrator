# Phase 4 Redテスト計画

## 1. SubAgent分担

| SubAgent               | 担当                   | 出力                        |
| ---------------------- | ---------------------- | --------------------------- |
| SubAgent-TEST-CardGrid | CardGrid Red           | `cardgrid-red-tests.md`     |
| SubAgent-TEST-Layout   | MasterDetailLayout Red | `masterdetail-red-tests.md` |
| SubAgent-TEST-Search   | SearchFilterList Red   | `searchfilter-red-tests.md` |
| SubAgent-TEST-Infra    | テスト基盤条件         | `test-infra-notes.md`       |

## 2. Red対象テストID

- CardGrid: TC-CG-RENDER-01, TC-CG-EMPTY-01, TC-CG-LOAD-01, TC-CG-KEY-01, TC-CG-RESP-01, TC-CG-ANIM-01
- MasterDetailLayout: TC-MDL-LAYOUT-01, TC-MDL-WIDTH-01, TC-MDL-A11Y-01, TC-MDL-MOBILE-01, TC-MDL-TOGGLE-01
- SearchFilterList: TC-SFL-SEARCH-01, TC-SFL-AND-01, TC-SFL-SORT-01, TC-SFL-COUNT-01, TC-SFL-EMPTY-01, TC-SFL-A11Y-01

## 3. 実行コマンド

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/components/organisms/CardGrid/CardGrid.test.tsx \
  src/renderer/components/organisms/MasterDetailLayout/MasterDetailLayout.test.tsx \
  src/renderer/components/organisms/SearchFilterList/SearchFilterList.test.tsx
```

## 4. Red判定条件

- 新規コンポーネントが未実装のため、import解決失敗またはアサーション失敗が発生すること。
- 失敗が3コンポーネントにまたがっていること。
