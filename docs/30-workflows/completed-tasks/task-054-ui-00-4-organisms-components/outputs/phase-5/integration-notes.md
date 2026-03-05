# Phase 5 統合メモ

## 変更ファイル

- `apps/desktop/src/renderer/components/organisms/CardGrid/index.tsx`
- `apps/desktop/src/renderer/components/organisms/MasterDetailLayout/index.tsx`
- `apps/desktop/src/renderer/components/organisms/SearchFilterList/index.tsx`
- `apps/desktop/src/renderer/components/organisms/index.ts`

## 依存統合

- CardGrid -> EmptyState / SkeletonCard
- MasterDetailLayout -> SlideInPanel
- SearchFilterList -> SearchBar / FilterChip / EmptyState / CardGrid

## 実装メモ

- CardGrid: roving tabIndex + arrow navigation を実装。
- MasterDetailLayout: matchMediaでdesktop/tablet/mobileを切替。
- SearchFilterList: query + activeFilterIds + sortFn を `useMemo` で合成。

## 残課題（Phase 6へ）

- 境界値/テーマ/レスポンシブの追加テスト拡充。
- coverage観点で未到達分岐の抽出。
