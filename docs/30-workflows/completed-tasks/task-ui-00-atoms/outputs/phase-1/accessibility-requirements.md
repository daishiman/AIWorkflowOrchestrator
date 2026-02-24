# アクセシビリティ要件 — Phase 1 成果物

## WCAG 2.1 AA 準拠要件

### ARIA 属性マトリクス

| コンポーネント   | 要素       | role       | aria-label                                         | aria-checked   | aria-disabled | aria-busy | tabIndex |
| ---------------- | ---------- | ---------- | -------------------------------------------------- | -------------- | ------------- | --------- | -------- |
| StatusIndicator  | `<span>`   | `status`   | `"ステータス: {status}"` または `label` props の値 | -              | -             | -         | -        |
| FilterChip       | `<button>` | `checkbox` | -                                                  | `{isSelected}` | `{disabled}`  | -         | `0`      |
| Badge            | `<span>`   | `status`   | `content` が number なら `"{content}件"`           | -              | -             | -         | -        |
| SkeletonCard     | `<div>`    | `status`   | `"読み込み中"`                                     | -              | -             | `true`    | -        |
| SuggestionBubble | `<div>`    | `button`   | -                                                  | -              | `{disabled}`  | -         | `0`      |
| EmptyState       | `<div>`    | -          | -                                                  | -              | -             | -         | -        |
| RelativeTime     | `<time>`   | -          | -                                                  | -              | -             | -         | -        |

### キーボード操作要件

| コンポーネント   | キー          | 動作                       |
| ---------------- | ------------- | -------------------------- |
| FilterChip       | Enter / Space | `onClick` 発火（選択切替） |
| SuggestionBubble | Enter / Space | `onClick` 発火             |
| SuggestionBubble | Tab           | フォーカス移動             |
| FilterChip       | Tab           | フォーカス移動             |

### コントラスト比要件

| 組み合わせ                                      | 最小コントラスト比 | 対象                                   |
| ----------------------------------------------- | ------------------ | -------------------------------------- |
| `--text-primary` on `--bg-primary`              | 4.5:1              | 通常テキスト                           |
| `--text-secondary` on `--bg-tertiary`           | 4.5:1              | FilterChip 非選択テキスト              |
| `--text-inverse` on `--status-primary`          | 4.5:1              | FilterChip 選択テキスト、Badge primary |
| `--text-muted`（idle/offline ステータスドット） | 3:1                | UI 部品（StatusIndicator ドット）      |
| `--status-*` カラー                             | 3:1                | UI 部品（StatusIndicator ドット）      |

### フォーカス表示要件

- 全インタラクティブコンポーネント（FilterChip, SuggestionBubble）にフォーカスリングを表示
- フォーカスリングは `outline: 2px solid var(--status-primary)` + `outline-offset: 2px`
- `:focus-visible` 疑似クラスを使用（マウスクリック時は非表示）

### スクリーンリーダー対応

| コンポーネント   | 読み上げ内容                                        |
| ---------------- | --------------------------------------------------- |
| StatusIndicator  | `label` props の値、または `"ステータス: {status}"` |
| FilterChip       | `"{label}"` + 選択状態（`aria-checked` による）     |
| Badge            | `content` の値、number の場合は `"{content}件"`     |
| SkeletonCard     | `"読み込み中"`（`aria-busy="true"` で処理中を通知） |
| SuggestionBubble | `children`（テキスト内容）                          |
| EmptyState       | 見出し・説明・アクションが自然な文書構造で読み上げ  |
| RelativeTime     | `<time>` 要素の `datetime` 属性 + テキスト内容      |
