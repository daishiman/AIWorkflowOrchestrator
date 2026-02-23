# デザインシステム UI/UX ガイドライン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## デザインシステム概要

### Design Tokens の3層構造

| 層                   | 説明                                                | 例                                     |
| -------------------- | --------------------------------------------------- | -------------------------------------- |
| **Primitive Tokens** | 生の値を定義する基礎層                              | `gray-900: #111827`, `spacing-4: 16px` |
| **Semantic Tokens**  | 意味を持つトークン。Primitiveを参照して用途を明確化 | `color-text-primary: gray-900`         |
| **Component Tokens** | コンポーネント固有のトークン。Semanticを参照        | `button-primary-bg: color-primary`     |

### 一貫性の原則

- 同じ意味を持つ要素には同じトークンを適用する
- デザイン決定は必ずトークンを通じて行い、ハードコードを避ける
- Tailwind CSSのユーティリティクラスを基盤とし、カスタムクラスは最小限に留める
- Web版とDesktop版で同一のトークンセットを共有する

### 拡張性の確保

- 新しいコンポーネント追加時は既存トークンの再利用を優先する
- 既存トークンで対応できない場合のみ新規トークンを定義する
- トークン命名は予測可能なパターンに従う（用途-状態-バリアント）
- バージョニングを考慮し、非推奨トークンの移行期間を設ける

---

## Spatial Design Tokens（Knowledge Studio）

### 概要

Knowledge StudioデスクトップアプリではApple Human Interface GuidelinesのSpatial Design原則を取り入れたトークンを定義する。

### Glass Panel効果

| トークン         | 値                         | 用途              |
| ---------------- | -------------------------- | ----------------- |
| `--glass-bg`     | rgba(30,30,30,0.7)         | パネル背景        |
| `--glass-border` | rgba(255,255,255,0.1)      | パネルボーダー    |
| `--glass-blur`   | 20px                       | backdrop-filter値 |
| `--glass-shadow` | 0 8px 32px rgba(0,0,0,0.3) | パネルシャドウ    |

### Dynamic Island

| 要素       | 仕様                                   |
| ---------- | -------------------------------------- |
| 配置       | 画面上部中央                           |
| サイズ     | コンテンツに応じて動的に拡縮           |
| 状態       | idle, loading, success, error, warning |
| アニメ     | 300ms ease-in-out                      |
| 自動非表示 | 成功/エラー時3秒後、警告時5秒後        |

### App Dock

| 要素       | 仕様                                     |
| ---------- | ---------------------------------------- |
| 配置       | 左端固定                                 |
| 幅         | 64px                                     |
| アイテム   | Dashboard, Editor, Chat, Graph, Settings |
| ホバー効果 | Tooltip表示（300ms delay）               |
| 選択状態   | 背景色変更 + 左ボーダーインジケータ      |

---

## カラーシステム

### テーマ切り替え機能

| 項目         | 仕様                                                         |
| ------------ | ------------------------------------------------------------ |
| テーマモード | light, dark, system の3種類                                  |
| 永続化       | electron-store による設定保存                                |
| システム連動 | `nativeTheme` API を使用してOS設定に自動追従（system選択時） |
| FOUC防止     | `data-theme` 属性による初期テーマ設定                        |

### ライトモード / ダークモードの色定義

| 用途                   | ライトモード | ダークモード |
| ---------------------- | ------------ | ------------ |
| 背景（プライマリ）     | white        | slate-900    |
| 背景（セカンダリ）     | slate-50     | slate-800    |
| 背景（ターシャリ）     | slate-100    | slate-700    |
| テキスト（プライマリ） | slate-900    | slate-50     |
| テキスト（セカンダリ） | slate-600    | slate-400    |
| テキスト（ミュート）   | slate-400    | slate-500    |
| ボーダー               | slate-200    | slate-700    |
| ボーダー（強調）       | slate-300    | slate-600    |

### セマンティックカラー

| 種別        | ベース色              | 用途                                 |
| ----------- | --------------------- | ------------------------------------ |
| **Primary** | blue-600 / blue-500   | 主要アクション、リンク、アクティブ   |
| **Success** | green-600 / green-500 | 成功状態、完了、肯定的フィードバック |
| **Warning** | amber-500 / amber-400 | 警告、注意喚起、保留状態             |
| **Error**   | red-600 / red-500     | エラー、危険、破壊的アクション       |
| **Info**    | sky-500 / sky-400     | 情報提供、ヒント、補足説明           |

### アクセシビリティ対応（コントラスト比）

| 要件                       | 最低コントラスト比 | 対象                           |
| -------------------------- | ------------------ | ------------------------------ |
| 通常テキスト（14px未満）   | 4.5:1 以上         | 本文、ラベル、説明文           |
| 大きいテキスト（18px以上） | 3:1 以上           | 見出し、ボタンテキスト         |
| UIコンポーネント           | 3:1 以上           | アイコン、ボーダー、フォーカス |

**確認事項**

- ダークモードでも同等のコントラスト比を維持する
- 色覚多様性への配慮として、色だけでなく形状やテキストでも情報を伝達する
- コントラストチェッカーツールで定期的に検証する

---

## タイポグラフィ

### フォントファミリー（日本語対応）

| 用途                 | フォントスタック                                           |
| -------------------- | ---------------------------------------------------------- |
| UI全般（sans-serif） | Inter, Noto Sans JP, Hiragino Sans, sans-serif             |
| コード（monospace）  | JetBrains Mono, Source Code Pro, Noto Sans Mono, monospace |

**考慮事項**

- 日本語フォントは可変フォント対応のものを優先する
- system-uiフォールバックでOSネイティブフォントも活用する
- ウェブフォントの読み込みは`font-display: swap`を使用する

### フォントサイズスケール

| トークン名 | サイズ          | 用途                 |
| ---------- | --------------- | -------------------- |
| text-xs    | 12px / 0.75rem  | キャプション、バッジ |
| text-sm    | 14px / 0.875rem | 補助テキスト、ラベル |
| text-base  | 16px / 1rem     | 本文、デフォルト     |
| text-lg    | 18px / 1.125rem | 小見出し、強調       |
| text-xl    | 20px / 1.25rem  | セクション見出し     |
| text-2xl   | 24px / 1.5rem   | ページ見出し         |
| text-3xl   | 30px / 1.875rem | 大見出し             |
| text-4xl   | 36px / 2.25rem  | ヒーロー、タイトル   |

### 行間・文字間隔

| 要素               | 行間（line-height）     | 文字間隔（letter-spacing） |
| ------------------ | ----------------------- | -------------------------- |
| 本文（日本語含む） | 1.75（leading-relaxed） | 0.025em                    |
| 見出し             | 1.25-1.4                | -0.025em                   |
| UI要素（ボタン等） | 1.25                    | 0.025em                    |
| コード             | 1.5                     | 0                          |

---

## スペーシングとレイアウト

### 8pxグリッドシステム

- 全てのスペーシングは8pxの倍数を基本とする
- 微調整が必要な場合のみ4pxを許可する
- 1px, 2pxはボーダーやアウトライン専用とする

| トークン    | 値   | 主な用途                       |
| ----------- | ---- | ------------------------------ |
| spacing-0.5 | 2px  | ボーダー内側の微細な隙間       |
| spacing-1   | 4px  | アイコンとテキストの間隔       |
| spacing-2   | 8px  | コンパクトな内部パディング     |
| spacing-3   | 12px | 小要素間のギャップ             |
| spacing-4   | 16px | 標準パディング、要素間隔       |
| spacing-6   | 24px | セクション内のグループ間隔     |
| spacing-8   | 32px | カード・パネルの内部パディング |
| spacing-12  | 48px | セクション間のマージン         |
| spacing-16  | 64px | ページセクション間の大きな間隔 |

### マージン・パディングの規則

| コンテキスト               | 推奨値                                           |
| -------------------------- | ------------------------------------------------ |
| ボタン内部パディング（横） | spacing-4〜spacing-6                             |
| ボタン内部パディング（縦） | spacing-2〜spacing-3                             |
| 入力フィールド内部         | spacing-3（縦）、spacing-4（横）                 |
| カード内部パディング       | spacing-6〜spacing-8                             |
| リスト項目間のギャップ     | spacing-2〜spacing-4                             |
| フォーム項目間のギャップ   | spacing-6                                        |
| ページのサイドパディング   | spacing-4（モバイル）〜spacing-8（デスクトップ） |

### レスポンシブブレイクポイント

| ブレイクポイント | 値     | 対象デバイス                           |
| ---------------- | ------ | -------------------------------------- |
| sm               | 640px  | 大型スマートフォン（横向き）           |
| md               | 768px  | タブレット（縦向き）                   |
| lg               | 1024px | タブレット（横向き）、小型ラップトップ |
| xl               | 1280px | デスクトップ                           |
| 2xl              | 1536px | 大型デスクトップ                       |

**Electron固有の考慮事項**

- 最小ウィンドウサイズは800x600pxを推奨する
- サイドバーの表示/非表示はlg（1024px）を基準とする
- ウィンドウサイズ変更時のレイアウト崩れを防ぐ

---

## Tap & Discover デザイントークン拡張

> 参照: [00-ui-design-foundation.md](../../../docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-ui-design-foundation.md) Task 5C

### マイクロインタラクション用トークン

| トークン | 値 | カテゴリ | 用途 |
|----------|-----|----------|------|
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | イージング | 成功時のバウンスアニメーション |
| `--ease-anticipate` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` | イージング | 溜めてから跳ねるアニメーション |
| `--scale-hover` | `1.02` | スケール | ホバー時の微拡大 |
| `--scale-active` | `0.97` | スケール | タップ/クリック時の微縮小 |
| `--scale-bounce` | `1.05` | スケール | 成功時のバウンスピーク |

### SuggestionBubble コンポーネントトークン

| トークン | ライトモード | ダークモード | 用途 |
|----------|-------------|-------------|------|
| `--suggestion-bg` | `var(--bg-secondary)` | `var(--bg-secondary)` | バブル背景色 |
| `--suggestion-bg-hover` | `var(--bg-elevated)` | `var(--bg-elevated)` | ホバー時の背景色 |
| `--suggestion-border` | `var(--border)` | `var(--border)` | ボーダー色 |
| `--suggestion-text` | `var(--text-primary)` | `var(--text-primary)` | テキスト色 |
| `--suggestion-icon` | `var(--accent)` | `var(--accent)` | アイコン色 |
| `--suggestion-radius` | `9999px` | `9999px` | 角丸（pill形状） |

### EmptyState mood トークン

| mood | アイコン色 | 背景色 | テキストトーン |
|------|-----------|--------|---------------|
| `welcoming` | `var(--accent)` | `var(--bg-secondary)` | 暖かく迎え入れる |
| `encouraging` | `var(--status-info)` | `var(--bg-secondary)` | 前向きに促す |
| `celebrating` | `var(--status-success)` | `var(--bg-secondary)` | 達成を祝う |

---

## 完了タスク

| タスクID | タスク名 | 完了日 | 概要 |
|----------|----------|--------|------|
| TASK-UI-00-TOKENS | デザイントークンCSS変数 Apple HIG準拠 light/dark テーマ定義 | 2026-02-22 | tokens.css に `[data-theme="light"]`/`[data-theme="dark"]` セレクタでApple HIG System Colors準拠のカラー定義を追加。マイクロインタラクション変数（ease-bounce/ease-anticipate/scale-hover/scale-active/scale-bounce）、キーフレームアニメーション（success-bounce/error-shake）、renderWithThemeテストヘルパーを作成。28テスト全PASS、カバレッジ100% |
| TASK-UI-00-ATOMS | Atoms共通コンポーネント7種でデザイントークン適用 | 2026-02-23 | 全コンポーネントでCSS変数（`var(--status-primary)`等）を使用、ハードコードカラー0件。EmptyState mood機能でSemanticトークン参照 |

#### StatusIndicator ステータスカラー定義

| status | CSS変数 | ライトモード | ダークモード | 用途 |
|---|---|---|---|---|
| running | `--status-primary` | `#007AFF` | `#0A84FF` | 実行中（パルスアニメーション） |
| success | `--status-success` | `#34C759` | `#30D158` | 成功 |
| error | `--status-error` | `#FF3B30` | `#FF453A` | エラー |
| warning | `--status-warning` | `#FF9500` | `#FF9F0A` | 警告 |
| idle | `--text-tertiary` | `rgba(60,60,67,0.3)` | `rgba(235,235,245,0.3)` | 待機 |
| offline | `--text-disabled` | `rgba(60,60,67,0.18)` | `rgba(235,235,245,0.18)` | オフライン |

#### Atoms デザイントークン使用パターン

```typescript
// CSS変数 + Tailwind arbitrary values パターン
// テーマ切替はCSS変数値差し替えのみ、TSコードにテーマ固有ロジック0件
<div className="bg-[var(--status-primary)] text-[var(--text-muted)]" />

// Record型でバリアント→トークンマッピングを定義
const variantStyles: Record<Variant, string> = {
  default: "bg-[var(--bg-tertiary)]",
  primary: "bg-[var(--status-primary)]",
};
```

### 関連未タスク

| タスクID | タスク名 | 優先度 | 参照 |
|----------|----------|--------|------|
| UT-UI-THEME-DYNAMIC-SWITCH-001 | settingsSlice テーマ動的切替対応 | 中 | `docs/30-workflows/unassigned-task/ut-ui-theme-dynamic-switch-001.md` |
| UT-UI-TAILWIND-TOKENS-INTEGRATION-001 | Tailwind CSS カスタムプロパティ統合 | 低 | `docs/30-workflows/unassigned-task/ut-ui-tailwind-tokens-integration-001.md` |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.4.0 | 2026-02-23 | TASK-UI-00-ATOMS StatusIndicatorステータスカラー定義追加（6状態のCSS変数マッピング）、Atomsデザイントークン使用パターン追加（CSS変数+Tailwind arbitrary valuesパターン、Record型バリアント→トークンマッピング） |
| 1.3.0 | 2026-02-23 | TASK-UI-00-ATOMS完了: 7コンポーネントでのデザイントークン使用パターン追加（StatusIndicator statusカラー/SuggestionBubble bg-tertiary/EmptyState moodパレット等） |
| 1.2.0 | 2026-02-22 | TASK-UI-00-TOKENS完了: Apple HIG System Colors準拠 light/darkテーマCSS変数定義追加、マイクロインタラクション変数・キーフレームアニメーション定義、renderWithThemeテストヘルパー作成（28テスト全PASS） |
| 1.1.0 | 2026-02-22 | Tap & Discover デザイントークン拡張（マイクロインタラクション、SuggestionBubble、EmptyState mood） |
| 1.0.0 | - | 初版作成 |
