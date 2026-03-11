# Phase 8 refactor plan

## 実施した整理

1. `index.tsx` から timeline group / empty state / search bar / sentinel を分離
2. item card を `chat` / `file` / `skill` ごとに分割
3. timeline grouping と infinite scroll を hook に移した
4. 文言と定数を `constants.ts` に退避した

## 効果

- 画面コンポーネントは state orchestration に集中
- card type 追加時の変更面が `components/HistoryItemCard/` に閉じる
- observer と group 化の回帰を独立 test で追える
