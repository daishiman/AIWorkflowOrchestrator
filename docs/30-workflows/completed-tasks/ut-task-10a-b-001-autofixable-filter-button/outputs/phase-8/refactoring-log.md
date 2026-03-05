# Phase 8 リファクタリングログ: 自動修正可能フィルタボタン

## 実施内容

### Refactor-01: `SuggestionList` の集計処理を統合

- 対象: `apps/desktop/src/renderer/components/skill/SuggestionList.tsx`
- 変更前:
  - `groupedSuggestions` 算出（1回走査）
  - `autoFixableCount` 算出（別 `filter` で再走査）
- 変更後:
  - `useMemo` 内でグルーピングと `autoFixableCount` を同時算出（1回走査）

## 目的

- 重複走査の削減
- 関連ロジックの近接配置による可読性向上
- 挙動不変のまま保守性向上

## 挙動差分

- なし（テストで回帰なしを確認）
