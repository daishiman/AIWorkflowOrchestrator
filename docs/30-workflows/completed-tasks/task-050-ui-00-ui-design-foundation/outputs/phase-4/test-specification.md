# Phase 4 テスト仕様書（Red先行）

## 1. Red戦略

- SubAgent A（Tokens Test）: テーマ/トークン整合を検証
- SubAgent B（Component Test）: Molecules/Organismsの挙動検証
- SubAgent C（A11y/Responsive Test）: role/aria/キーボード/モバイルを検証

## 2. Redで固定した失敗クラス

1. **Module Resolution Error**

- 実装前（HEAD）で対象8コンポーネントファイルが未存在
- 失敗種別: `Cannot find module ...` 相当

2. **Behavior Gap**

- `SearchBar` の debounce, `ConfirmDialog` の keyboard trap, `SearchFilterList` の積集合は未実装想定
- 失敗種別: assertion mismatch

## 3. 実装対象テストファイル

- `molecules/SearchBar/SearchBar.test.tsx`
- `molecules/CodeViewer/CodeViewer.test.tsx`
- `molecules/TabSwitcher/TabSwitcher.test.tsx`
- `molecules/SlideInPanel/SlideInPanel.test.tsx`
- `molecules/ConfirmDialog/ConfirmDialog.test.tsx`
- `organisms/CardGrid/CardGrid.test.tsx`
- `organisms/MasterDetailLayout/MasterDetailLayout.test.tsx`
- `organisms/SearchFilterList/SearchFilterList.test.tsx`

## 4. P39/P40/P9対策

- interactionは `fireEvent` を使用
- `apps/desktop` 起点で実行
- fake timer使用時は各テストで状態をリセット
