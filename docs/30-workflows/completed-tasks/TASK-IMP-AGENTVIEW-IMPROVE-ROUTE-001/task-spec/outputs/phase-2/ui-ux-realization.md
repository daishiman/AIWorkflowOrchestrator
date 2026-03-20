# Phase 2: UI/UX 設計

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

## 1. AgentView 改善 CTA バナー

### レイアウト

- **配置**: 実行結果エリア直下、`RecentExecutionList` の上
- **構造**: 左にアイコン+テキスト、右にアクションボタン
- **サイズ**: `mx-4 mt-3 p-4`（水平マージン16px、上マージン12px、パディング16px）

### スタイル

- **背景**: `var(--bg-secondary)` (ライト: #F2F2F7, ダーク: #1C1C1E)
- **ボーダー**: `var(--border)` (ライト: #C6C6C8, ダーク: #38383A)
- **角丸**: `rounded-xl` (12px)
- **アイコン**: Sparkles (lucide-react), `var(--accent)` 色
- **テキスト**: プライマリ `var(--text-primary)`, セカンダリ `var(--text-secondary)`
- **ボタン**: `var(--accent)` 背景, white テキスト, `rounded-lg` (8px)

### アニメーション

- **表示**: `canOfferAnalysis` が true になったとき 200ms の opacity fade-in
- **CSS**: `@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }` / `animate-fade-in`

### アクセシビリティ

- `role="region"` + `aria-label="スキル改善提案"`
- ボタン: `aria-label="スキルを分析・改善する"`
- Tab 到達可能

## 2. SkillAnalysisView 戻りリンク

### レイアウト

- **配置**: ヘッダー左、スキル名の左側
- **構造**: ArrowLeft アイコン + 「戻る」テキスト

### スタイル

- **テキスト色**: `var(--accent)` (ライト: #007AFF, ダーク: #0A84FF)
- **ホバー**: `var(--accent-hover)` で若干の色変化
- **アイコン**: ArrowLeft (lucide-react), 16px
- **テキスト**: `text-sm` (14px)
- **間隔**: `gap-2` (8px)

### アニメーション

- **ホバー**: `transition-colors duration-200`

### アクセシビリティ

- `aria-label="エージェントに戻る"`
- Tab 到達可能
- フォーカスリング表示

## 3. SkillAnalysisView 再実行ボタン

### レイアウト

- **配置**: 既存フッターの右端（「選択を適用」「全自動改善」の右）
- **構造**: テキストのみ「エージェントで再実行」

### スタイル

- **背景**: transparent
- **ボーダー**: `var(--border)`
- **テキスト色**: `var(--text-secondary)` (ライト: rgba(60,60,67,0.6), ダーク: rgba(235,235,245,0.6))
- **ホバー背景**: `var(--bg-hover)`
- **角丸**: `rounded-lg` (8px)
- **パディング**: `px-4 py-2` (水平16px, 垂直8px)

### アニメーション

- **ホバー**: `transition-colors duration-200`

### アクセシビリティ

- `aria-label="エージェントで再実行"`
- Tab 到達可能

## 4. 8px グリッド準拠確認

| 要素               | 値       | 8px グリッド      |
| ------------------ | -------- | ----------------- |
| CTA バナー mx      | 16px     | 2 \* 8px          |
| CTA バナー mt      | 12px     | 1.5 \* 8px (許容) |
| CTA バナー p       | 16px     | 2 \* 8px          |
| CTA バナー gap     | 12px     | 1.5 \* 8px (許容) |
| CTA ボタン px/py   | 16px/8px | 2/1 \* 8px        |
| 戻りリンク gap     | 8px      | 1 \* 8px          |
| 再実行ボタン px/py | 16px/8px | 2/1 \* 8px        |
| 角丸 (バナー)      | 12px     | 1.5 \* 8px        |
| 角丸 (ボタン)      | 8px      | 1 \* 8px          |

## 5. ダークモード対応

全てのカラー値は CSS 変数トークンを使用しているため、ライト/ダーク両モードで自動切り替えされる。ハードコード色は使用しない。

| トークン           | ライト             | ダーク                |
| ------------------ | ------------------ | --------------------- |
| `--bg-secondary`   | #F2F2F7            | #1C1C1E               |
| `--border`         | #C6C6C8            | #38383A               |
| `--accent`         | #007AFF            | #0A84FF               |
| `--text-primary`   | #000000            | #FFFFFF               |
| `--text-secondary` | rgba(60,60,67,0.6) | rgba(235,235,245,0.6) |
