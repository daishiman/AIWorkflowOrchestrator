# Phase 2 状態管理設計

## 1. P31対策（必須）

- Zustand storeをOrganisms内で直接参照しない。
- 外部状態はすべて props 受け取り。
- UI状態のみを局所管理する。

## 2. コンポーネント別状態

| コンポーネント     | 状態                                    | 管理手段                  |
| ------------------ | --------------------------------------- | ------------------------- |
| CardGrid           | focusIndex, columns推定値               | `useState` + `useRef`     |
| MasterDetailLayout | responsive mode (desktop/tablet/mobile) | `useState` + `matchMedia` |
| SearchFilterList   | query, activeFilterIds                  | `useState`                |
| SearchFilterList   | filteredItems                           | `useMemo`                 |

## 3. メモ化方針

- SearchFilterList のフィルタリング結果は `useMemo`。
- 依存配列: `items`, `query`, `activeFilterIds`, `filters`, `searchPredicate`, `sortFn`。

## 4. 副作用方針

- `matchMedia` 監視は `useEffect` で登録/解除。
- タイマー管理は依存Molecule（SearchBar）側の実装を利用。
- DOMフォーカス移動はキーボード操作時に限定。
