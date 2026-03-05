# Phase 2 テスト設計マップ

## 1. 要件IDとテストIDの対応

| 要件ID    | テストID         | 対象               |
| --------- | ---------------- | ------------------ |
| FR-CG-01  | TC-CG-RENDER-01  | CardGrid           |
| FR-CG-02  | TC-CG-LOAD-01    | CardGrid           |
| FR-CG-03  | TC-CG-EMPTY-01   | CardGrid           |
| FR-CG-04  | TC-CG-KEY-01     | CardGrid           |
| FR-CG-05  | TC-CG-RESP-01    | CardGrid           |
| FR-CG-06  | TC-CG-ANIM-01    | CardGrid           |
| FR-MDL-01 | TC-MDL-LAYOUT-01 | MasterDetailLayout |
| FR-MDL-02 | TC-MDL-WIDTH-01  | MasterDetailLayout |
| FR-MDL-03 | TC-MDL-TOGGLE-01 | MasterDetailLayout |
| FR-MDL-04 | TC-MDL-MOBILE-01 | MasterDetailLayout |
| FR-MDL-05 | TC-MDL-A11Y-01   | MasterDetailLayout |
| FR-MDL-06 | TC-MDL-FOCUS-01  | MasterDetailLayout |
| FR-SFL-01 | TC-SFL-SEARCH-01 | SearchFilterList   |
| FR-SFL-02 | TC-SFL-AND-01    | SearchFilterList   |
| FR-SFL-03 | TC-SFL-SORT-01   | SearchFilterList   |
| FR-SFL-04 | TC-SFL-COUNT-01  | SearchFilterList   |
| FR-SFL-05 | TC-SFL-VIEW-01   | SearchFilterList   |
| FR-SFL-06 | TC-SFL-EMPTY-01  | SearchFilterList   |

## 2. Redフェーズ対象（Phase 4）

- TC-CG-RENDER-01
- TC-CG-EMPTY-01
- TC-CG-LOAD-01
- TC-CG-KEY-01
- TC-MDL-LAYOUT-01
- TC-MDL-WIDTH-01
- TC-MDL-A11Y-01
- TC-MDL-MOBILE-01
- TC-SFL-SEARCH-01
- TC-SFL-AND-01
- TC-SFL-SORT-01
- TC-SFL-COUNT-01
- TC-SFL-EMPTY-01
- TC-SFL-VIEW-01
- TC-SFL-A11Y-01（aria-live）

## 3. テスト基盤

- `window.matchMedia` をテスト内でモック
- `fireEvent` を標準使用（userEventは使用しない）
- 実行コマンド: `cd apps/desktop && pnpm vitest run`
