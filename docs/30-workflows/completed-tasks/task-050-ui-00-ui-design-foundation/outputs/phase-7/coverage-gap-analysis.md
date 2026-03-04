# Phase 7 カバレッジ未達分析

## 閾値未達項目

- なし（対象範囲はすべて閾値以上）

## 改善候補（Phase 8入力）

1. `ConfirmDialog` の分岐追加

- フォーカストラップ内の端ケース（要素0件、Shift+Tab境界）を明示テスト化

2. `MasterDetailLayout` の関数網羅率改善

- `window` 未定義環境（SSR相当）を追加テスト化

3. `SearchFilterList` の分岐追加

- `sortFn` 指定時の順序保証テストを追加

## 統合試験寄与

- 検索導線（SearchBar + SearchFilterList）
- パネル導線（MasterDetailLayout + SlideInPanel）
- 破壊操作導線（ConfirmDialog）
