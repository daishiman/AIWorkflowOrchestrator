# テーマ要件 — Phase 1 成果物

## 3テーマ横断要件

### 対応テーマ

| テーマ          | ベーステーマ | 検証ポイント                                       |
| --------------- | ------------ | -------------------------------------------------- |
| kanagawa-dragon | dark系       | 暗い背景でのコントラスト、ステータスカラーの視認性 |
| light           | Apple HIG    | `#FFFFFF` 背景でのカラー、ボーダーの視認性         |
| dark            | Apple HIG    | `#000000` 背景でのカラー、ステータスカラーの明度   |

### テーマ切替方式

- `[data-theme]` 属性をルート要素に設定してテーマを切り替える
- 全コンポーネントは CSS 変数（`var(--xxx)`）経由でカラーを参照する
- Tailwind arbitrary values（`bg-[var(--status-primary)]`）で適用する

### テーマテスト方式

テストファイル内で `describe.each` を使用し、テーマごとにレンダリングテストを実行:

```typescript
describe.each(["kanagawa-dragon", "light", "dark"])("テーマ: %s", (theme) => {
  // コンテナ要素に data-theme 属性を設定してレンダリング
});
```

### デザイントークン依存マトリクス

#### カラートークン

| トークン           | StatusIndicator | FilterChip | Badge | SkeletonCard | SuggestionBubble | EmptyState | RelativeTime |
| ------------------ | :-------------: | :--------: | :---: | :----------: | :--------------: | :--------: | :----------: |
| `--bg-tertiary`    |                 |   **o**    |       |    **o**     |      **o**       |            |              |
| `--bg-elevated`    |                 |            |       |              |      **o**       |            |              |
| `--text-primary`   |                 |            |       |              |      **o**       |            |    **o**     |
| `--text-secondary` |                 |   **o**    |       |              |      **o**       |            |              |
| `--text-muted`     |      **o**      |            |       |              |                  |   **o**    |              |
| `--text-inverse`   |                 |   **o**    | **o** |              |                  |            |              |
| `--border-subtle`  |                 |            |       |              |      **o**       |            |              |
| `--status-primary` |      **o**      |   **o**    | **o** |              |                  |   **o**    |              |
| `--status-success` |      **o**      |            | **o** |              |                  |   **o**    |              |
| `--status-warning` |      **o**      |            | **o** |              |                  |            |              |
| `--status-error`   |      **o**      |            | **o** |              |                  |            |              |
| `--status-info`    |                 |            | **o** |              |                  |   **o**    |              |

#### アニメーション・レイアウトトークン

| トークン             | 使用コンポーネント                                      |
| -------------------- | ------------------------------------------------------- |
| `--radius-full`      | FilterChip, SuggestionBubble                            |
| `--radius-md`        | SkeletonCard                                            |
| `--duration-fast`    | FilterChip                                              |
| `--duration-default` | Badge, SuggestionBubble                                 |
| `--ease-default`     | FilterChip, SuggestionBubble                            |
| `--scale-hover`      | SuggestionBubble                                        |
| `--scale-active`     | SuggestionBubble                                        |
| `--shadow-sm`        | SuggestionBubble                                        |
| `success-bounce`     | SuggestionBubble（タップ後）, EmptyState（celebrating） |

### テーマごとのカラー値例

#### `--status-primary`

| テーマ          | 値               |
| --------------- | ---------------- |
| kanagawa-dragon | テーマ定義に従う |
| light           | `#007AFF`        |
| dark            | `#0A84FF`        |

#### `--status-success`

| テーマ          | 値               |
| --------------- | ---------------- |
| kanagawa-dragon | テーマ定義に従う |
| light           | `#34C759`        |
| dark            | `#30D158`        |
