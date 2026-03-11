# Phase 8 成果物: リファクタリング方針

## 実施内容

- 挨拶、suggestion、timeline を view-local component へ抽出した。
- 純粋関数 `dashboardContent.ts` を導入し、文言・導線判定・timeline icon mapping を UI から分離した。
- `DashboardView/index.tsx` から旧 stats 変換ロジックと local error state を除去した。

## 守った境界

- shared component へ昇格しない
- `SuggestionBubble` 既存 API を壊さない
- state / navigation contract を view 内から直接変更しない
