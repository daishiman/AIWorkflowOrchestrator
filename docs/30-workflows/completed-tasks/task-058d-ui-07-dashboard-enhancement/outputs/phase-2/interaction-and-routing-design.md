# Phase 2 成果物: 導線・インタラクション設計

## CTA 契約

| UI                                   | 遷移先          | 理由                               |
| ------------------------------------ | --------------- | ---------------------------------- |
| サジェスチョン: 作業スペースを見る   | `workspace`     | 次の作業に最短で到達できる         |
| サジェスチョン: ツールを探す         | `skillCenter`   | 空状態からの立ち上がりに最適       |
| サジェスチョン: AIアシスタントを開く | `agent`         | `pending` がある場合の次アクション |
| タイムライン「もっと見る」           | `historySearch` | 詳細検索は UI-06 に委譲            |

## マイクロインタラクション

- GreetingHeader: `opacity` + `translateY` 200ms
- SuggestionCard: hover でわずかな scale、focus-visible で outline
- Timeline item: hover で背景色トーンアップ、キーボードフォーカス可視化

## アクセシビリティ

- CTA は `button` 要素を使う
- タイムラインは `ul > li` とし、時刻は `<time>` を使う
- EmptyState は既存 `role="status"` を利用する

## 境界

- ナビゲーションバーのラベル変更は対象外
- タイムライン詳細展開は本タスクで行わず、一覧と遷移に限定する
