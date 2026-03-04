# Phase 5 実装計画ログ

## 1. 実装順序

1. CardGrid 実装（最小描画 + empty/loading + keyboard + responsive）
2. MasterDetailLayout 実装（desktop分割 + tablet/mobile overlay）
3. SearchFilterList 実装（検索/フィルター/ソート/件数/empty/viewMode）
4. Organisms export 統合（`components/organisms/index.ts`）

## 2. SubAgent作業分担

| SubAgent                  | 実装対象                       |
| ------------------------- | ------------------------------ |
| SubAgent-IMPL-CardGrid    | `CardGrid/index.tsx`           |
| SubAgent-IMPL-Layout      | `MasterDetailLayout/index.tsx` |
| SubAgent-IMPL-Search      | `SearchFilterList/index.tsx`   |
| SubAgent-IMPL-Integration | export統合、依存確認           |

## 3. 実装方針

- P31対策: 全コンポーネントは props 駆動、store未参照。
- P39対策: fireEvent前提でテスト互換を維持。
- P40対策: `apps/desktop` でテスト実行。
