# Phase 5 成果物: 変更サマリー

## 実装結果

- `DashboardView` を「ホーム」体験へ再設計し、挨拶、導線カード、タイムラインの 3 層構成へ変更した。
- loading / empty / normal の分岐を renderer 内に閉じ、`historySearch` handoff を `setCurrentView("historySearch")` に固定した。
- CTA はすべて `button` ベースに揃え、`SuggestionBubble` 既存 API は変更していない。

## 実装済み要件

| 要件   | 状態 | 根拠                             |
| ------ | ---- | -------------------------------- |
| FR-01  | 完了 | `ホーム` 見出しへ変更            |
| FR-03  | 完了 | 3件の suggestion card を常時表示 |
| FR-04  | 完了 | timeline を 5 件制限             |
| FR-05  | 完了 | `もっと見る` で `historySearch`  |
| FR-07  | 完了 | welcoming EmptyState 実装        |
| FR-09  | 完了 | store 再利用のみ、新規 IPC なし  |
| NFR-01 | 完了 | view-local component で分割      |
| NFR-03 | 完了 | CTA を `button` で統一           |
