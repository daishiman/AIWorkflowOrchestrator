# TASK-UI-00-DESIGN-FOUNDATION: UI共通デザイン基盤

## 1. メタ情報

| 項目         | 値                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-UI-00-DESIGN-FOUNDATION                                                                       |
| タスク名     | UI共通デザイン基盤（デザイントークン・共通コンポーネント・テーマ・レスポンシブ・アクセシビリティ） |
| 優先度       | 最高（全画面の前提条件）                                                                           |
| 複雑度       | medium                                                                                             |
| 依存タスク   | なし                                                                                               |
| ブロック対象 | 02〜09の全タスク                                                                                   |

## 2. 目的

全画面で一貫した視覚的体験を実現するための「共通デザイン基盤」を定義する。デザイントークン（カラー・スペーシング・タイポグラフィ・エフェクト）、Atomic Design に基づく共通コンポーネントカタログ、テーマシステム、レスポンシブ戦略、アクセシビリティ基準を一元管理し、後続の全画面仕様（02〜09）が本仕様を参照して UI を構築する。

## 3. Why（なぜ必要か）

1. **一貫性の担保**: 各画面仕様書が独立してスタイルを定義すると、色・間隔・角丸の不統一が発生する
2. **重複排除**: SearchBar、CardGrid 等の共通コンポーネントが画面ごとに再定義されるのを防ぐ
3. **Apple HIG 準拠**: tokens.css の light / dark テーマを Apple Human Interface Guidelines の公式システムカラーに全面置き換えし、見やすくクリーンなモードを実現する
4. **保守効率**: デザイン変更時に1ファイルを更新するだけで全画面に反映される

## 4. 実行タスク

### Task 1: デザイントークン補完

#### 1.1 tokens.css 現状分析

**対象テーマ（3テーマ構成）:**

| テーマ名        | data-theme属性    | CSS現状   | 対応方針                                   |
| --------------- | ----------------- | --------- | ------------------------------------------ |
| Kanagawa Dragon | `kanagawa-dragon` | ✅ 完全   | 変更不要（既存のまま維持）                 |
| Light           | `light`           | ⚠️ 部分的 | **Apple HIG System Colors に全面置き換え** |
| Dark            | `dark`            | ❌ スタブ | **Apple HIG System Colors で新規定義**     |

> **スコープ外**: `kanagawa-wave` / `kanagawa-lotus` は本タスクの対象外。TypeScript型定義にのみ存在し、CSS未実装のまま残す（将来必要に応じて別タスクで対応）。

**注意**: settingsSlice.ts で `kanagawa-dragon` に固定されている（`setThemeMode` / `setResolvedTheme` が変更を無視）。テーマ切替を有効化するには settingsSlice の制約解除が必要。

#### 1.2 テーマカラー定義

##### `[data-theme="light"]` — Apple HIG System Colors 準拠（全面置き換え）

tokens.css の既存 light テーマ定義を **Apple Human Interface Guidelines のシステムカラー** に全面置き換えする。Tailwind Slate ベースの青みがかった灰色から、Apple の純粋な**中性灰色**（色相なし）へ移行する。

> **変更理由**: Tailwind Slate（`#f8fafc` 等）は微かな青味を持ち、Apple の UI と比較すると色温度が異なる。Apple の `#F2F2F7`（systemGray6）は完全な中性灰で、クリーンで見やすいライトモードを実現する。

```css
[data-theme="light"] {
  color-scheme: light;

  /* ─── Apple System Background Colors ─── */
  --bg-primary: #ffffff; /* systemBackground */
  --bg-secondary: #f2f2f7; /* secondarySystemBackground (systemGray6) */
  --bg-tertiary: #e5e5ea; /* systemGray5 */
  --bg-elevated: #ffffff; /* elevated surface */
  --bg-glass: rgba(242, 242, 247, 0.8); /* translucent secondary */
  --bg-selection: rgba(0, 122, 255, 0.15); /* systemBlue 15% */

  /* ─── Apple Label Colors ─── */
  --text-primary: #000000; /* label */
  --text-secondary: rgba(60, 60, 67, 0.6); /* secondaryLabel (#3C3C43 60%) */
  --text-muted: rgba(60, 60, 67, 0.3); /* tertiaryLabel (#3C3C43 30%) */
  --text-inverse: #ffffff;

  /* ─── Apple Separator Colors ─── */
  --border-default: #c6c6c8; /* opaqueSeparator */
  --border-emphasis: #aeaeb2; /* systemGray2 */
  --border-subtle: rgba(60, 60, 67, 0.12); /* separator (low opacity) */

  /* ─── Apple System Tint Colors (Light) ─── */
  --status-primary: #007aff; /* systemBlue */
  --status-primary-hover: #0056b3;
  --status-success: #34c759; /* systemGreen */
  --status-success-hover: #28a745;
  --status-warning: #ff9500; /* systemOrange */
  --status-warning-hover: #cc7700;
  --status-error: #ff3b30; /* systemRed */
  --status-error-hover: #cc2f26;
  --status-info: #5856d6; /* systemIndigo */
  --status-info-hover: #4240a8;

  /* ─── Syntax Highlighting (Xcode Light 準拠) ─── */
  --syntax-keyword: #9b2393; /* Xcode keyword purple */
  --syntax-function: #007aff; /* systemBlue */
  --syntax-string: #c41a16; /* Xcode string red */
  --syntax-number: #1c00cf; /* Xcode number blue */
  --syntax-constant: #703daa; /* Xcode constant purple */
  --syntax-type: #5856d6; /* systemIndigo */
  --syntax-comment: #8e8e93; /* systemGray */
  --syntax-variable: #3900a0;
}
```

**Apple System Gray Scale（Light Mode 参考）:**

| 名前        | Hex       | 用途                   |
| ----------- | --------- | ---------------------- |
| systemGray  | `#8E8E93` | 非アクティブ要素       |
| systemGray2 | `#AEAEB2` | セカンダリ UI 部品     |
| systemGray3 | `#C7C7CC` | ディバイダー補助       |
| systemGray4 | `#D1D1D6` | 入力フィールド背景     |
| systemGray5 | `#E5E5EA` | グループ化された背景   |
| systemGray6 | `#F2F2F7` | セカンダリシステム背景 |

##### `[data-theme="dark"]` — Apple HIG System Colors 準拠（全面置き換え）

`:root` のデフォルト dark を **Apple の公式ダークモードカラー** に全面置き換え。Tailwind Slate の青みがかったダーク（`#0f172a`）から、Apple の中性灰色ダーク（`#000000` / `#1C1C1E`）へ移行する。

> **変更理由**: Tailwind Slate-900（`#0f172a`）は濃い紺色であり、Apple の中性 `#000000`/`#1C1C1E` とは異なる印象を与える。Apple のダークモードは OLED ディスプレイで真の黒を活用し、コンテンツとの明確なコントラストを実現する。

```css
[data-theme="dark"] {
  color-scheme: dark;

  /* ─── Apple System Background Colors (Dark) ─── */
  --bg-primary: #000000; /* systemBackground */
  --bg-secondary: #1c1c1e; /* secondarySystemBackground */
  --bg-tertiary: #2c2c2e; /* tertiarySystemBackground */
  --bg-elevated: #1c1c1e; /* elevated surface */
  --bg-glass: rgba(28, 28, 30, 0.8); /* translucent secondary */
  --bg-selection: rgba(10, 132, 255, 0.25); /* systemBlue 25% */

  /* ─── Apple Label Colors (Dark) ─── */
  --text-primary: #ffffff; /* label */
  --text-secondary: rgba(235, 235, 245, 0.6); /* secondaryLabel (#EBEBF5 60%) */
  --text-muted: rgba(235, 235, 245, 0.3); /* tertiaryLabel (#EBEBF5 30%) */
  --text-inverse: #000000;

  /* ─── Apple Separator Colors (Dark) ─── */
  --border-default: #38383a; /* opaqueSeparator */
  --border-emphasis: #48484a; /* systemGray3 */
  --border-subtle: rgba(84, 84, 88, 0.36); /* separator */

  /* ─── Apple System Tint Colors (Dark) ─── */
  --status-primary: #0a84ff; /* systemBlue */
  --status-primary-hover: #409cff;
  --status-success: #30d158; /* systemGreen */
  --status-success-hover: #5bd97d;
  --status-warning: #ff9f0a; /* systemOrange */
  --status-warning-hover: #ffb840;
  --status-error: #ff453a; /* systemRed */
  --status-error-hover: #ff6961;
  --status-info: #5e5ce6; /* systemIndigo */
  --status-info-hover: #7a78eb;

  /* ─── Syntax Highlighting (Xcode Dark 準拠) ─── */
  --syntax-keyword: #fc5fa3; /* Xcode keyword pink */
  --syntax-function: #0a84ff; /* systemBlue */
  --syntax-string: #fc6a5d; /* Xcode string */
  --syntax-number: #d0bf69; /* Xcode number */
  --syntax-constant: #a167e6; /* Xcode constant */
  --syntax-type: #5e5ce6; /* systemIndigo */
  --syntax-comment: #7f8c98; /* Xcode comment gray */
  --syntax-variable: #67b7a4;
}
```

**Apple System Gray Scale（Dark Mode 参考）:**

| 名前        | Hex       | 用途                     |
| ----------- | --------- | ------------------------ |
| systemGray  | `#8E8E93` | 非アクティブ要素（共通） |
| systemGray2 | `#636366` | セカンダリ UI 部品       |
| systemGray3 | `#48484A` | 強調ボーダー             |
| systemGray4 | `#3A3A3C` | 入力フィールド背景       |
| systemGray5 | `#2C2C2E` | ターシャリ背景           |
| systemGray6 | `#1C1C1E` | セカンダリシステム背景   |

**Apple System Tint Colors 対照表（Light ↔ Dark）:**

| カラー名     | Light Mode | Dark Mode | 用途             |
| ------------ | ---------- | --------- | ---------------- |
| systemBlue   | `#007AFF`  | `#0A84FF` | アクセント       |
| systemGreen  | `#34C759`  | `#30D158` | 成功             |
| systemRed    | `#FF3B30`  | `#FF453A` | エラー・破壊操作 |
| systemOrange | `#FF9500`  | `#FF9F0A` | 警告             |
| systemIndigo | `#5856D6`  | `#5E5CE6` | 情報             |
| systemPurple | `#AF52DE`  | `#BF5AF2` | 特殊機能         |
| systemPink   | `#FF2D55`  | `#FF375F` | ハイライト       |
| systemTeal   | `#5AC8FA`  | `#64D2FF` | 補助情報         |
| systemYellow | `#FFCC00`  | `#FFD60A` | 注意             |

#### 1.3 テーマカラーマップ全体像（3テーマ）

> **注**: `--text-secondary` / `--text-muted` の light / dark は Apple の rgba 表記。テーブルでは白/黒背景上での近似 Hex を記載。

| セマンティック変数 | kanagawa-dragon | light（Apple HIG） | dark（Apple HIG） |
| ------------------ | --------------- | ------------------ | ----------------- |
| `--bg-primary`     | `#12120f`       | `#FFFFFF`          | `#000000`         |
| `--bg-secondary`   | `#1d1c19`       | `#F2F2F7`          | `#1C1C1E`         |
| `--bg-tertiary`    | `#282727`       | `#E5E5EA`          | `#2C2C2E`         |
| `--text-primary`   | `#c5c9c5`       | `#000000`          | `#FFFFFF`         |
| `--text-secondary` | `#a6a69c`       | `≈#86868B`¹        | `≈#98989F`¹       |
| `--text-muted`     | `#625e5a`       | `≈#C5C5C7`¹        | `≈#6C6C70`¹       |
| `--border-default` | `#393836`       | `#C6C6C8`          | `#38383A`         |
| `--status-primary` | `#8ba4b0`       | `#007AFF`          | `#0A84FF`         |
| `--status-success` | `#87a987`       | `#34C759`          | `#30D158`         |
| `--status-error`   | `#e82424`       | `#FF3B30`          | `#FF453A`         |

¹ CSS 定義は `rgba()` 形式（Apple 公式）。近似 Hex は白/黒背景上の視覚的等価色。

#### 1.4 既存トークン（変更不要・そのまま利用）

以下は tokens.css で既に適切に定義済み。全テーマ共通で使用する。

**スペーシング（8pxグリッド）:**

| トークン       | 値   | 用途                     |
| -------------- | ---- | ------------------------ |
| `--spacing-1`  | 4px  | アイコンとテキストの間隔 |
| `--spacing-2`  | 8px  | コンパクトなパディング   |
| `--spacing-3`  | 12px | 標準パディング           |
| `--spacing-4`  | 16px | カード内パディング       |
| `--spacing-6`  | 24px | セクション間ギャップ     |
| `--spacing-8`  | 32px | 大セクション間隔         |
| `--spacing-12` | 48px | ページレベル余白         |

**タイポグラフィ:**

| トークン      | 値                  | 用途                 |
| ------------- | ------------------- | -------------------- |
| `--font-sans` | Inter, ...          | UIテキスト全般       |
| `--font-mono` | JetBrains Mono, ... | コード表示           |
| `--text-xs`   | 0.75rem             | バッジ、補足テキスト |
| `--text-sm`   | 0.875rem            | ボタン、ラベル       |
| `--text-base` | 1rem                | 本文                 |
| `--text-lg`   | 1.125rem            | セクション見出し     |
| `--text-xl`   | 1.25rem             | ページ見出し         |
| `--text-2xl`  | 1.5rem              | 大見出し             |

**角丸:**

| トークン           | 値     | 用途                       |
| ------------------ | ------ | -------------------------- |
| `--radius-sm`      | 4px    | インラインバッジ           |
| `--radius-default` | 6px    | ボタン                     |
| `--radius-md`      | 8px    | カード、インプット         |
| `--radius-lg`      | 12px   | モーダル、パネル           |
| `--radius-xl`      | 16px   | フローティングパネル       |
| `--radius-full`    | 9999px | アバター、ステータスドット |

**シャドウ:**

| トークン           | 用途                           |
| ------------------ | ------------------------------ |
| `--shadow-sm`      | ホバーフィードバック           |
| `--shadow-default` | カード                         |
| `--shadow-md`      | ドロップダウン、ポップオーバー |
| `--shadow-lg`      | モーダル                       |
| `--shadow-xl`      | フローティングパネル           |
| `--shadow-glass`   | グラスモーフィズムパネル       |

**トランジション:**

| トークン             | 値                                      | 用途                       |
| -------------------- | --------------------------------------- | -------------------------- |
| `--duration-fast`    | 100ms                                   | ホバー、フォーカス         |
| `--duration-default` | 200ms                                   | ボタン操作フィードバック   |
| `--duration-normal`  | 300ms                                   | パネルスライド、テーマ切替 |
| `--duration-slow`    | 500ms                                   | ページトランジション       |
| `--ease-out`         | cubic-bezier(0, 0, 0.2, 1)              | パネルアニメーション       |
| `--ease-spring`      | cubic-bezier(0.175, 0.885, 0.32, 1.275) | バウンスエフェクト         |

---

### Task 2: 共通コンポーネントカタログ（Atomic Design）

#### 2.1 Atoms

##### `StatusIndicator`

```typescript
interface StatusIndicatorProps {
  /** ステータス種別 */
  status: "running" | "success" | "error" | "warning" | "idle" | "offline";
  /** サイズ（デフォルト: "md"） */
  size?: "sm" | "md" | "lg";
  /** パルスアニメーション有効（runningステータス時のみ効果あり） */
  pulse?: boolean;
  /** ラベルテキスト（アクセシビリティ用、視覚的には非表示） */
  label?: string;
}
```

- **外観**: カラードットにステータスカラーを反映。`running` 時は `pulse` アニメーション（CSS `@keyframes pulse`）
- **サイズ**: sm=8px, md=10px, lg=14px
- **ステータスカラーマッピング**:
  - `running` → `--status-primary` + pulse
  - `success` → `--status-success`
  - `error` → `--status-error`
  - `warning` → `--status-warning`
  - `idle` → `--text-muted`
  - `offline` → `--text-muted`（破線ボーダー）
- **使用画面**: AgentView（実行状態）、GlobalNavStrip（通知アイコン横）、Workspace（ファイル監視状態）

##### `FilterChip`

```typescript
interface FilterChipProps {
  /** チップに表示するラベル */
  label: string;
  /** 選択状態 */
  isSelected: boolean;
  /** カウント（オプション、バッジ表示） */
  count?: number;
  /** lucide-reactアイコン名（オプション） */
  icon?: string;
  /** クリックハンドラ */
  onClick: () => void;
  /** 無効化 */
  disabled?: boolean;
}
```

- **外観**: 角丸ピル形状（`--radius-full`）、非選択時は `--bg-tertiary` + `--text-secondary`、選択時は `--status-primary` 背景 + `--text-inverse`
- **トランジション**: `--duration-fast` `--ease-default`
- **使用画面**: HistorySearch（期間フィルター）、SkillCenter（カテゴリフィルター）

##### `Badge`

```typescript
interface BadgeProps {
  /** 表示テキスト（数値または文字列） */
  content: string | number;
  /** バリエーション */
  variant: "default" | "primary" | "success" | "warning" | "error";
  /** サイズ */
  size?: "sm" | "md";
}
```

- **外観**: 角丸ピル形状（`--radius-full`）、`--text-xs` フォントサイズ
- **サイズ**: sm=min-width 16px / height 16px, md=min-width 20px / height 20px
- **使用画面**: GlobalNavStrip（未読通知カウント）、SkillCenter（カテゴリ別スキル数）、Dashboard（統計バッジ）

##### `SkeletonCard`

```typescript
interface SkeletonCardProps {
  /** カードの高さ（デフォルト: "120px"） */
  height?: string;
  /** 角丸（デフォルト: "--radius-md"） */
  borderRadius?: string;
  /** 内部レイアウトバリエーション */
  variant?: "default" | "stat" | "list-item";
  /** アニメーション有効（デフォルト: true） */
  animate?: boolean;
}
```

- **外観**: `--bg-tertiary` 背景、パルスアニメーション（`opacity: 0.4` ⟷ `1.0`、1.5秒周期、CSS `@keyframes skeleton-pulse`）
- **構成バリエーション**:
  - `default`: ヘッダーライン（幅60%、高さ12px） + ボディライン2本（幅80%/100%、高さ8px）
  - `stat`: 大きな数値プレースホルダー（幅40%、高さ24px） + ラベルライン（幅60%、高さ8px）
  - `list-item`: アイコン円（32px） + テキストライン2本
- **使用画面**: CardGrid（ローディング時 `skeletonCount` 個表示）、SkillCenter（スキルリスト読み込み）、Dashboard（統計カードロード）

##### `SuggestionBubble`

```typescript
interface SuggestionBubbleProps {
  /** バブルに表示するテキスト */
  label: string;
  /** lucide-reactアイコン名（オプション） */
  icon?: string;
  /** クリックハンドラ */
  onClick: () => void;
  /** サイズ */
  size?: "sm" | "md" | "lg";
  /** 無効化 */
  disabled?: boolean;
}
```

- **外観**: ピル形状（`--radius-full`）、背景 `--bg-tertiary`、ボーダー `--border-subtle`
- **サイズ**: sm=高さ36px / md=高さ44px / lg=高さ56px
- **インタラクション**:
  - ホバー: `scale(var(--scale-hover))` + `--bg-elevated` + `--shadow-sm`
  - アクティブ: `scale(var(--scale-active))`
  - タップ後: `success-bounce` アニメーション（5C.4参照）
- **テキスト**: `--text-sm`（sm/md）/ `--text-base`（lg）、`--text-primary`
- **アイコン**: テキスト左に配置、`--text-secondary` カラー、16px（sm/md）/ 20px（lg）
- **タッチターゲット**: 最小 44px（5C.2準拠）
- **使用画面**: Dashboard（おすすめの次のステップ）、Workspace ChatPanel（ゼロステートサジェスト）、Onboarding（操作サジェスト）

##### `EmptyState`

```typescript
interface EmptyStateProps {
  /** lucide-react アイコン名 */
  icon: string;
  /** 見出しテキスト */
  heading: string;
  /** 説明テキスト */
  description: string;
  /** アクションボタン（オプション） */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  /** サジェストリスト（オプション、SuggestionBubble形式） */
  suggestions?: Array<{
    label: string;
    icon?: string;
    onClick: () => void;
  }>;
  /** コンパクトモード（パネル内埋め込み用） */
  compact?: boolean;
  /** 感情バリアント（表示のトーンを制御） */
  mood?: "welcoming" | "encouraging" | "celebrating";
}
```

- **外観**: アイコン（48px、`--text-muted`）+ 見出し（`--text-lg`、`--text-primary`）+ 説明（`--text-sm`、`--text-secondary`）+ アクションボタン、全て中央揃え
- **コンパクトモード**: アイコン 32px、見出し `--text-base`、パディング縮小。パネル内ゼロステート用
- **サジェスト**: `SuggestionBubble` コンポーネントで描画。クリック可能なバブルUIとして表示
- **mood バリアント**:
  - `welcoming`: アイコンカラー `--status-primary`、背景にうっすら青グラデーション。初回利用のゼロステートに使用。見出し例:「ようこそ！」
  - `encouraging`: アイコンカラー `--status-info`、ニュートラルな背景。操作を促すゼロステートに使用。見出し例:「まずはこれを試してみよう」
  - `celebrating`: アイコンカラー `--status-success`、`success-bounce` アニメーション付き。完了・達成時に使用。見出し例:「準備完了！」
  - デフォルト（未指定）: 従来の `--text-muted` アイコン。通常のゼロステートに使用
- **使用画面**: Dashboard（welcoming / encouraging）、Workspace（encouraging）、SkillCenter（welcoming）、HistorySearch（encouraging）、Onboarding完了（celebrating）

##### `RelativeTime`

```typescript
interface RelativeTimeProps {
  /** ISO 8601 タイムスタンプ */
  timestamp: string;
  /** 表示形式（デフォルト: "auto"） */
  format?: "auto" | "short" | "long";
  /** 自動更新間隔（ミリ秒、デフォルト: 60000） */
  refreshInterval?: number;
  /** ツールチップに絶対時刻を表示（デフォルト: true） */
  showAbsoluteOnHover?: boolean;
}
```

- **表示例**: "3分前", "2時間前", "昨日", "3日前", "2025/12/15"
- **切り替え閾値**: < 1分 → "たった今" / < 1時間 → "N分前" / < 24時間 → "N時間前" / < 7日 → "N日前" / >= 7日 → 絶対日付（`YYYY/MM/DD`）
- **自動更新**: `setInterval` で `refreshInterval` ごとに再レンダリング。`useEffect` クリーンアップで解除
- **ツールチップ**: `title` 属性に `YYYY/MM/DD HH:mm:ss` 形式の絶対時刻
- **使用画面**: NotificationCenter（通知タイムスタンプ）、HistorySearch（実行日時）、Dashboard（最終更新日時）

#### 2.2 Molecules

##### `SearchBar`

```typescript
interface SearchBarProps {
  /** 検索クエリ */
  value: string;
  /** 変更ハンドラ（デバウンス適用前の即座のコールバック） */
  onChange: (value: string) => void;
  /** デバウンス後の確定ハンドラ */
  onDebouncedChange?: (value: string) => void;
  /** デバウンス間隔（デフォルト: 300ms） */
  debounceMs?: number;
  /** プレースホルダー */
  placeholder?: string;
  /** キーボードショートカット表示（例: "Cmd+K"） */
  shortcutHint?: string;
  /** 自動フォーカス */
  autoFocus?: boolean;
}
```

- **構成**: `Search` アイコン（lucide-react）+ テキストインプット + クリアボタン（`X` アイコン、入力がある場合のみ表示）
- **デバウンス**: 300ms デフォルト、`useRef` + `setTimeout` でクリーンアップ
- **スタイル**: `--bg-tertiary` 背景、`--border-subtle` ボーダー、フォーカス時 `--status-primary` ボーダー
- **使用画面**: HistorySearch（全文検索）、SkillCenter（スキル名検索）

##### `CodeViewer`

```typescript
interface CodeViewerProps {
  /** ソースコード文字列 */
  code: string;
  /** 言語（シンタックスハイライト用） */
  language?: string;
  /** 行番号表示 */
  showLineNumbers?: boolean;
  /** 最大高さ（スクロール） */
  maxHeight?: string;
  /** ファイルパスヘッダー */
  filePath?: string;
  /** コピーボタン表示 */
  showCopyButton?: boolean;
}
```

- **構成**: ファイルパスヘッダー（オプション）+ シンタックスハイライト済みコード表示 + コピーボタン（`Copy` → `Check` アイコン切替）
- **シンタックスハイライト**: CSS変数 `--syntax-*` を使用。軽量な正規表現ベースのハイライターまたは `prism-react-renderer` を検討
- **フォント**: `--font-mono`
- **使用画面**: SkillCenter CodeViewTab、Workspace SourceView

##### `TabSwitcher`

```typescript
interface Tab {
  id: string;
  label: string;
  icon?: string; // lucide-react icon name
  badge?: string | number;
  disabled?: boolean;
}

interface TabSwitcherProps {
  /** タブ定義 */
  tabs: Tab[];
  /** 選択中のタブID */
  activeTab: string;
  /** タブ切替ハンドラ */
  onTabChange: (tabId: string) => void;
  /** バリエーション */
  variant?: "underline" | "pill";
}
```

- **バリエーション**:
  - `underline`: 下線でアクティブ表示（デフォルト）。`--status-primary` 色の 2px 下線
  - `pill`: ピル形状の背景切替。アクティブ時 `--bg-tertiary`
- **アニメーション**: 下線の移動を `--duration-default` `--ease-out` でアニメーション
- **使用画面**: SkillCenter（Overview / Code / Config タブ）、Workspace（Source / Preview タブ）

##### `SlideInPanel`

```typescript
interface SlideInPanelProps {
  /** パネルの表示状態 */
  isOpen: boolean;
  /** 閉じるハンドラ */
  onClose: () => void;
  /** パネルの表示方向 */
  side: "right" | "left";
  /** パネル幅 */
  width?: string; // デフォルト: "400px"
  /** ヘッダータイトル */
  title?: string;
  /** 子コンテンツ */
  children: React.ReactNode;
  /** オーバーレイ表示 */
  showOverlay?: boolean;
}
```

- **アニメーション**: `transform: translateX()` で 250ms `ease-out` スライドイン
- **背景**: `--bg-secondary`、左ボーダー `--border-default`
- **オーバーレイ**: `showOverlay=true` の場合、背面に半透明オーバーレイ（`rgba(0,0,0,0.3)`）
- **使用画面**: SkillCenter Inspector パネル、将来拡張（設定サイドパネル等）

##### `ConfirmDialog`

```typescript
interface ConfirmDialogProps {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** 閉じるハンドラ（キャンセル時） */
  onClose: () => void;
  /** 確認ハンドラ */
  onConfirm: () => void;
  /** タイトル */
  title: string;
  /** 説明文（Markdown対応は不要、プレーンテキスト） */
  description: string;
  /** 確認ボタンのラベル（デフォルト: "確認"） */
  confirmLabel?: string;
  /** キャンセルボタンのラベル（デフォルト: "キャンセル"） */
  cancelLabel?: string;
  /** 破壊的操作フラグ（trueの場合、確認ボタンが赤色） */
  isDestructive?: boolean;
  /** 確認ボタンのローディング状態 */
  isLoading?: boolean;
}
```

- **外観**: 中央モーダル（幅 400px、角丸 `--radius-lg`、影 `--shadow-lg`）。背面に半透明オーバーレイ（`rgba(0,0,0,0.4)`）
- **ボタン配置**: キャンセル（左、`--bg-tertiary`）+ 確認（右、`--status-primary` or `--status-error`）
- **破壊的操作**: `isDestructive=true` の場合、確認ボタンが `--status-error` 背景。タイトルに `AlertTriangle` アイコン表示
- **キーボード**: `Escape` で閉じる、`Enter` で確認実行。フォーカストラップ適用
- **ARIA**: `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- **使用画面**: SkillCenter（スキル削除確認）、Workspace（ファイル削除確認）、Settings（データリセット確認）

#### 2.3 Organisms

##### `CardGrid<T>`

```typescript
interface CardGridProps<T> {
  /** データ配列 */
  items: T[];
  /** カード描画関数 */
  renderCard: (item: T, index: number) => React.ReactNode;
  /** グリッドの最小カード幅（デフォルト: 280px） */
  minCardWidth?: number;
  /** ギャップ（デフォルト: --spacing-4） */
  gap?: string;
  /** 空状態メッセージ */
  emptyMessage?: string;
  /** 空状態アイコン */
  emptyIcon?: string;
  /** ローディング状態 */
  isLoading?: boolean;
  /** スケルトンカード数（ローディング時） */
  skeletonCount?: number;
}
```

- **レイアウト**: `display: grid; grid-template-columns: repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`
- **空状態**: アイコン + メッセージをセンター表示
- **ローディング**: スケルトンカード（パルスアニメーション）を `skeletonCount` 個表示
- **使用画面**: SkillCenter（スキルカード一覧）、Dashboard（統計カード）

##### `MasterDetailLayout`

```typescript
interface MasterDetailLayoutProps {
  /** マスターパネル（リスト/グリッド） */
  master: React.ReactNode;
  /** ディテールパネル */
  detail: React.ReactNode;
  /** ディテールパネルの表示状態 */
  isDetailOpen: boolean;
  /** マスターパネル幅（デフォルト: "380px"） */
  masterWidth?: string;
  /** レスポンシブ時にディテールをオーバーレイ表示 */
  overlayOnMobile?: boolean;
}
```

- **レイアウト**: デスクトップ — 左右分割（`flex`）、マスター固定幅 + ディテール `flex: 1`
- **レスポンシブ**: tablet以下 — マスターが全幅表示、ディテールは `SlideInPanel` としてオーバーレイ
- **ボーダー**: マスターとディテールの間に `--border-default` の縦線
- **使用画面**: SkillCenter（スキルリスト + 詳細パネル）、Workspace（ファイルツリー + エディタ）

##### `SearchFilterList<T>`

```typescript
interface SearchFilterListProps<T> {
  /** 全データ配列 */
  items: T[];
  /** フィルターチップの定義 */
  filters: Array<{
    id: string;
    label: string;
    icon?: string;
    predicate: (item: T) => boolean;
  }>;
  /** 検索関数（テキストマッチ） */
  searchPredicate: (item: T, query: string) => boolean;
  /** アイテム描画（リスト形式） */
  renderItem?: (item: T, index: number) => React.ReactNode;
  /** アイテム描画（グリッド形式） */
  renderCard?: (item: T, index: number) => React.ReactNode;
  /** 表示モード */
  viewMode?: "list" | "grid";
  /** 検索プレースホルダー */
  searchPlaceholder?: string;
  /** 空状態メッセージ */
  emptyMessage?: string;
  /** ソート関数 */
  sortFn?: (a: T, b: T) => number;
}
```

- **構成**: `SearchBar` + `FilterChip[]`（横スクロール可能） + 結果表示（`list` or `grid` モード）
- **フィルタリングロジック**: 検索クエリ AND アクティブフィルターの積集合
- **結果カウント**: フィルター適用後の件数を表示
- **使用画面**: HistorySearch（履歴検索 + 期間/種別フィルター）、SkillCenter（スキル検索 + カテゴリフィルター）

---

### Task 3: lucide-react アイコンマスターリスト

#### ナビゲーション系

| アイコン名      | 用途                      | 使用画面                     |
| --------------- | ------------------------- | ---------------------------- |
| `LayoutGrid`    | ダッシュボード            | AppDock                      |
| `FolderTree`    | エディタ / ワークスペース | AppDock                      |
| `MessageCircle` | チャット                  | AppDock                      |
| `Network`       | グラフ                    | AppDock                      |
| `Bot`           | エージェント              | AppDock                      |
| `User`          | 設定 / プロフィール       | AppDock                      |
| `Puzzle`        | スキルセンター            | AppDock（新規追加）          |
| `History`       | 履歴検索                  | AppDock（新規追加）          |
| `FolderOpen`    | ワークスペース            | AppDock（新規追加）          |
| `ChevronLeft`   | 戻る                      | パネルヘッダー               |
| `ChevronRight`  | 進む / 展開               | ツリービュー                 |
| `ChevronDown`   | 折りたたみ展開            | ツリービュー、アコーディオン |
| `ArrowLeft`     | ナビゲーション戻る        | モバイルヘッダー             |

#### アクション系

| アイコン名          | 用途                      | 使用画面                    |
| ------------------- | ------------------------- | --------------------------- |
| `Search`            | 検索                      | SearchBar全般               |
| `X`                 | 閉じる / クリア           | SearchBar、パネル、モーダル |
| `Plus`              | 追加                      | フォルダ追加、新規作成      |
| `Trash2`            | 削除                      | スキル削除、ファイル削除    |
| `Download`          | インポート                | SkillCenter                 |
| `Upload`            | エクスポート              | SkillCenter                 |
| `Play`              | 実行開始                  | AgentView                   |
| `Square`            | 実行停止                  | AgentView                   |
| `RefreshCw`         | リフレッシュ / リスキャン | SkillCenter                 |
| `Copy`              | コピー                    | CodeViewer                  |
| `Check`             | 確認 / コピー完了         | CodeViewer、トースト        |
| `Filter`            | フィルター表示切替        | HistorySearch               |
| `SlidersHorizontal` | 詳細フィルター            | HistorySearch               |
| `MoreHorizontal`    | その他メニュー            | カードアクション            |
| `ExternalLink`      | 外部リンク                | スキル詳細                  |

#### ステータス系

| アイコン名      | 用途                     | 使用画面                 |
| --------------- | ------------------------ | ------------------------ |
| `AlertCircle`   | エラー                   | 全画面エラー表示         |
| `AlertTriangle` | 警告                     | バリデーション警告       |
| `CheckCircle`   | 成功                     | 完了通知                 |
| `Info`          | 情報                     | ツールチップ、説明       |
| `Loader2`       | ローディング（スピナー） | ボタン内、データ読み込み |
| `Bell`          | 通知                     | GlobalNavStrip           |
| `BellOff`       | 通知オフ                 | 設定                     |
| `Wifi`          | オンライン               | ステータスバー           |
| `WifiOff`       | オフライン               | ステータスバー           |

#### 種別系

| アイコン名   | 用途                    | 使用画面                   |
| ------------ | ----------------------- | -------------------------- |
| `File`       | ファイル                | Workspace、HistorySearch   |
| `FileCode`   | コードファイル          | Workspace                  |
| `FileText`   | テキストファイル        | Workspace                  |
| `Folder`     | フォルダ（閉じ）        | Workspace                  |
| `FolderOpen` | フォルダ（開き）        | Workspace                  |
| `Zap`        | スキル（高速実行）      | SkillCenter                |
| `Package`    | パッケージ / モジュール | SkillCenter                |
| `Code`       | コード表示              | SkillCenter CodeTab        |
| `Settings`   | 設定 / コンフィグ       | SkillCenter ConfigTab      |
| `BookOpen`   | ドキュメント / 概要     | SkillCenter OverviewTab    |
| `Tag`        | タグ / カテゴリ         | SkillCenter、HistorySearch |
| `Calendar`   | 日付                    | HistorySearch              |
| `Clock`      | 時刻 / 最近             | HistorySearch              |

---

### Task 4: レスポンシブ仕様

#### 4.1 ブレークポイント定義

既存の `uiSlice.ts` の `ResponsiveMode` に準拠:

| モード    | 幅範囲         | 定数              |
| --------- | -------------- | ----------------- |
| `mobile`  | < 768px        | `--breakpoint-sm` |
| `tablet`  | 768px – 1023px | `--breakpoint-md` |
| `desktop` | ≥ 1024px       | `--breakpoint-lg` |
| (wide)    | ≥ 1440px       | `--breakpoint-xl` |

#### 4.2 レスポンシブ動作

| コンポーネント / レイアウト  | desktop           | tablet                                     | mobile                                       |
| ---------------------------- | ----------------- | ------------------------------------------ | -------------------------------------------- |
| **GlobalNavStrip (AppDock)** | 左サイドバー 80px | 左サイドバー 64px                          | 下部タブバー 70px                            |
| **MasterDetailLayout**       | 左右分割          | マスターのみ表示、ディテールはオーバーレイ | マスターのみ表示、ディテールはフルスクリーン |
| **CardGrid minWidth**        | 280px             | 280px                                      | 100%（1カラム）                              |
| **SearchBar**                | フル幅            | フル幅                                     | フル幅                                       |
| **SlideInPanel**             | 右サイドパネル    | オーバーレイパネル                         | フルスクリーン                               |
| **TabSwitcher**              | 全タブ表示        | 全タブ表示                                 | 横スクロール                                 |

#### 4.3 GlobalNavStrip 幅変化

```
desktop (≥1024px):  80px — アイコン + ラベル表示
tablet  (768-1023): 64px — アイコンのみ、ツールチップでラベル
mobile  (<768px):   ボトムタブ高さ 70px — アイコン + 短縮ラベル
```

---

### Task 5: アクセシビリティ基準（WCAG 2.1 AA）

#### 5.1 コントラスト比

| 対象                         | 最低基準 | 検証方法                              |
| ---------------------------- | -------- | ------------------------------------- |
| 通常テキスト（< 18px）       | 4.5:1    | `--text-primary` on `--bg-primary`    |
| 大テキスト（≥ 18px bold）    | 3:1      | 見出しテキスト                        |
| UI部品（ボーダー、アイコン） | 3:1      | `--border-emphasis` on `--bg-primary` |
| フォーカスインジケーター     | 3:1      | `--status-primary` on `--bg-primary`  |

**各テーマでの検証必須**: Apple HIG のカラーは設計上 WCAG AA を満たすが、`--text-muted`（tertiaryLabel: 30% opacity）は背景色との組み合わせでコントラスト比が低下する場合がある。小テキスト（< 18px）で `--text-muted` を使用する場合は 4.5:1 を確認すること。

#### 5.2 キーボードナビゲーション

| パターン                   | キー操作            | 動作                             |
| -------------------------- | ------------------- | -------------------------------- |
| **AppDock ナビゲーション** | `Cmd+1`〜`Cmd+9`    | ビュー直接切替                   |
| **Tab フォーカス移動**     | `Tab` / `Shift+Tab` | フォーカス可能要素間の移動       |
| **リスト内移動**           | `↑` / `↓`           | リストアイテム間移動             |
| **グリッド内移動**         | `↑↓←→`              | カード間移動                     |
| **パネル閉じる**           | `Escape`            | SlideInPanel、モーダルを閉じる   |
| **検索フォーカス**         | `Cmd+K` or `/`      | SearchBar にフォーカス           |
| **アクション実行**         | `Enter` / `Space`   | フォーカス中の要素をアクティブ化 |

#### 5.3 ARIA属性ガイドライン

| コンポーネント    | 必須ARIA属性                                              |
| ----------------- | --------------------------------------------------------- |
| `StatusIndicator` | `role="status"`, `aria-label="ステータス: {status}"`      |
| `FilterChip`      | `role="checkbox"`, `aria-checked={isSelected}`            |
| `Badge`           | `aria-label="{content}件"` (数値の場合)                   |
| `SearchBar`       | `role="searchbox"`, `aria-label="検索"`                   |
| `TabSwitcher`     | `role="tablist"` (親), `role="tab"` (子), `aria-selected` |
| `SlideInPanel`    | `role="dialog"`, `aria-modal="true"`, `aria-label`        |
| `CardGrid`        | `role="grid"` (グリッド), `role="gridcell"` (カード)      |
| ナビゲーション    | `role="navigation"`, `aria-label="メインナビゲーション"`  |

#### 5.4 フォーカス管理

- **フォーカスリング**: `outline: 2px solid var(--status-primary); outline-offset: 2px`
- **フォーカストラップ**: モーダル / SlideInPanel 内でフォーカスを閉じ込める
- **フォーカスリストア**: パネル閉じた後、開く前にフォーカスしていた要素にフォーカスを戻す
- **スキップリンク**: メインコンテンツへのスキップリンクを最上部に配置

---

### Task 5C: マイクロインタラクション仕様

全画面で統一的な「ポチポチと触れる」体験を実現するためのインタラクションガイドライン。

#### 5C.1 追加CSS変数（トランジション拡張）

```css
/* tokens.css に追加 */
:root {
  /* ─── マイクロインタラクション用イージング ─── */
  --ease-bounce: cubic-bezier(
    0.34,
    1.56,
    0.64,
    1
  ); /* バウンス感のある跳ね返り */
  --ease-anticipate: cubic-bezier(
    0.68,
    -0.55,
    0.27,
    1.55
  ); /* 溜めてから跳ねる */

  /* ─── スケールフィードバック ─── */
  --scale-hover: 1.02; /* ホバー時の微拡大 */
  --scale-active: 0.97; /* タップ/クリック時の微縮小 */
  --scale-bounce: 1.05; /* 成功時のバウンスピーク */
}
```

#### 5C.2 タッチターゲット最小サイズ

| 要素タイプ           | 最小サイズ   | 推奨サイズ   | 根拠                       |
| -------------------- | ------------ | ------------ | -------------------------- |
| ボタン               | 44 × 44px    | 48 × 48px    | Apple HIG タッチターゲット |
| カード               | 80 × 80px    | 120 × 120px  | 指での選択しやすさ         |
| リスト項目           | 56px（高さ） | 64px（高さ） | 行間タップの誤操作防止     |
| アイコンボタン       | 44 × 44px    | 44 × 44px    | Apple HIG 最小タップ領域   |
| チップ/バッジ        | 36 × 36px    | 40 × 40px    | 小要素でもタップ可能       |
| サジェスチョンバブル | 48px（高さ） | 56px（高さ） | テキスト付きのタップ領域   |

> **注意**: `padding` でタッチ領域を確保すること。視覚的なサイズが小さくても、タップ可能領域は最小サイズ以上にする。

#### 5C.3 標準フィードバックパターン

| 操作              | CSS                                                                                      | 用途                       |
| ----------------- | ---------------------------------------------------------------------------------------- | -------------------------- |
| ホバー            | `transform: scale(var(--scale-hover)); transition: var(--duration-fast) var(--ease-out)` | カード、ボタン             |
| アクティブ/タップ | `transform: scale(var(--scale-active)); transition: 50ms ease-in`                        | 全インタラクティブ要素     |
| 成功              | `scale(1) → scale(var(--scale-bounce)) → scale(1)` 300ms `var(--ease-bounce)`            | 追加完了、送信完了         |
| 失敗/エラー       | `translateX(-4px, 4px, -4px, 4px, 0)` 400ms (シェイク)                                   | バリデーションエラー       |
| 出現              | `opacity: 0 → 1` + `translateY(8px → 0)` 200ms `var(--ease-out)`                         | カード出現、リスト項目追加 |
| 消失              | `opacity: 1 → 0` + `scale(1 → 0.95)` 150ms `ease-in`                                     | 削除、ポップオーバー閉じ   |

#### 5C.4 フィードバック実装パターン

```css
/* 標準的なインタラクティブカード */
.interactive-card {
  transition:
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}
.interactive-card:hover {
  transform: scale(var(--scale-hover));
  box-shadow: var(--shadow-md);
}
.interactive-card:active {
  transform: scale(var(--scale-active));
  transition-duration: 50ms;
}

/* 成功バウンスアニメーション */
@keyframes success-bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(var(--scale-bounce));
  }
  100% {
    transform: scale(1);
  }
}

/* エラーシェイクアニメーション */
@keyframes error-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-4px);
  }
  40% {
    transform: translateX(4px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}
```

---

### Task 5D: UX言語ガイドライン

素人ユーザーが直感的に理解できるよう、技術用語をやさしい日本語に変換する。画面上に表示される全テキストは以下の変換テーブルに従う。

#### 5D.1 技術用語→やさしい日本語 変換テーブル

| 技術用語         | やさしい日本語      | 使用例                                           |
| ---------------- | ------------------- | ------------------------------------------------ |
| エージェント     | AIアシスタント      | 「AIアシスタントが作業を代行します」             |
| スキル           | できること / ツール | 「新しいツールを追加する」（文脈により使い分け） |
| パーミッション   | 許可 / できること   | 「AIにできることを設定する」                     |
| バリデーション   | 確認 / チェック     | 「入力内容を確認しています」                     |
| IPC              | （表示しない）      | ユーザーに見せない                               |
| インポート       | 追加する            | 「ツールを追加する」                             |
| エクスポート     | 書き出す            | 「データを書き出す」                             |
| プロバイダ       | AI                  | 「AIを選ぶ」                                     |
| モデル           | AIの種類            | 「使うAIの種類を選ぶ」                           |
| ストリーミング   | （表示しない）      | 処理中のアニメーションで代替                     |
| リフレッシュ     | 更新する            | 「最新の情報に更新する」                         |
| ワークスペース   | 作業スペース        | 「作業スペースを開く」                           |
| ダッシュボード   | ホーム              | 「ホームに戻る」                                 |
| セッション       | やりとり            | 「前回のやりとりを続ける」                       |
| コンテキスト     | 状況 / 背景情報     | 「ファイルの背景情報をAIに伝える」               |
| フィルター       | しぼり込み          | 「条件でしぼり込む」                             |
| ページネーション | （表示しない）      | 「もっと見る」ボタンで代替                       |
| トースト/通知    | お知らせ            | 「お知らせが届きました」                         |
| デバウンス       | （表示しない）      | 内部実装のみ。ユーザーには見せない               |

#### 5D.2 UXライティング原則

1. **主語はユーザー**: 「ファイルがインポートされました」→「ファイルを追加しました」
2. **能動態を使う**: 「設定が保存されました」→「設定を保存しました」
3. **1文15文字以内**: ボタンラベル、見出しは短く
4. **「〜してみよう」で誘う**: 命令形（「〜してください」）ではなく提案形
5. **エラー時は解決策を示す**: 「エラーが発生しました」→「うまくいきませんでした。もう一度試してみてください」

#### 5D.3 画面タイトル変換

| 既存タイトル       | 新タイトル     |
| ------------------ | -------------- |
| ダッシュボード     | ホーム         |
| エージェントビュー | AIアシスタント |
| スキルセンター     | ツールを探す   |
| 横断履歴検索ビュー | あなたの記録   |
| 通知センター       | お知らせ       |
| オンボーディング   | はじめよう     |
| ワークスペース     | 作業スペース   |

---

### Task 5B: エラー・オフライン状態のUI指針（C10対策）

全画面で一貫したエラー/オフライン表示を実現するための共通パターンを定義する。各画面仕様（04〜09）はこの指針に従ってエラーUIを実装する。

#### 5B.1 エラー表示パターン

| パターン             | 使用場面                    | UIコンポーネント             | 表示内容                                             |
| -------------------- | --------------------------- | ---------------------------- | ---------------------------------------------------- |
| **インラインエラー** | IPC呼び出し失敗（単一操作） | `EmptyState`（compact）      | エラーメッセージ + 「再試行」ボタン                  |
| **パネルエラー**     | パネル全体のデータ取得失敗  | `EmptyState`                 | `AlertCircle` アイコン + 説明 + 「再読み込み」ボタン |
| **トーストエラー**   | バックグラウンド操作の失敗  | NotificationCenter（08参照） | 自動消失（5秒）、`--status-error` 背景               |
| **モーダルエラー**   | 致命的エラー（復旧不可）    | `ConfirmDialog`              | エラー詳細 + 「アプリを再起動」ボタン                |

#### 5B.2 IPC エラーレスポンスの UI マッピング

```typescript
// 共通エラーハンドリングパターン
interface IPCErrorResponse {
  code: string; // e.g., "VALIDATION_ERROR", "PERMISSION_ERROR", "TIMEOUT"
  message: string; // ユーザー向けメッセージ
  details?: unknown; // 開発者向け詳細（UIには表示しない）
}

// エラーコード → UI表示マッピング
const ERROR_UI_MAP: Record<string, { icon: string; recoverable: boolean }> = {
  VALIDATION_ERROR: { icon: "AlertTriangle", recoverable: false },
  PERMISSION_ERROR: { icon: "ShieldAlert", recoverable: false },
  NOT_FOUND: { icon: "FileQuestion", recoverable: false },
  TIMEOUT: { icon: "Clock", recoverable: true },
  NETWORK_ERROR: { icon: "WifiOff", recoverable: true },
  INTERNAL_ERROR: { icon: "AlertCircle", recoverable: true },
};
```

#### 5B.3 オフライン検出と表示

- **検出**: `navigator.onLine` + `window.addEventListener("online"/"offline")`
- **オフライン時**: 画面上部に固定バナー表示（高さ 36px、`--status-warning` 背景）
  - テキスト: 「オフラインです。一部の機能が制限されます」
  - アイコン: `WifiOff`
  - オンライン復帰時: バナーを 2秒間 `--status-success` に変更（「接続が復旧しました」）後、自動非表示
- **影響範囲**: LLM ストリーミング、スキルインポート、OAuth 認証がブロックされる
- **オフラインでも動作する機能**: ローカルファイル閲覧、設定変更、テーマ切替

#### 5B.4 ローディング状態のガイドライン

| 状況                 | 表示                                  | 閾値                       |
| -------------------- | ------------------------------------- | -------------------------- |
| 即座（< 100ms）      | 表示変更なし                          | -                          |
| 短時間（100ms - 1s） | ボタン内 `Loader2` スピナー           | `--duration-fast` 後に表示 |
| 中時間（1s - 3s）    | `SkeletonCard` プレースホルダー       | 即座に表示                 |
| 長時間（> 3s）       | `SkeletonCard` + プログレスメッセージ | 3秒後にメッセージ追加      |

---

### Task 6: テスト戦略（共通）

#### 6.1 テストヘルパー

```typescript
// tests/helpers/renderWithTheme.tsx
import { render, type RenderOptions } from "@testing-library/react";
import type { ResolvedTheme } from "../../store/types";

interface ThemeRenderOptions extends RenderOptions {
  theme?: ResolvedTheme;
}

export function renderWithTheme(
  ui: React.ReactElement,
  options: ThemeRenderOptions = {},
) {
  const { theme = "kanagawa-dragon", ...renderOptions } = options;

  // data-theme属性をdocument.documentElementに設定
  document.documentElement.setAttribute("data-theme", theme);

  return render(ui, renderOptions);
}
```

#### 6.2 テスト環境ルール

| ルール                         | 根拠                                | 対策                                 |
| ------------------------------ | ----------------------------------- | ------------------------------------ |
| `fireEvent` を使用             | P39: happy-dom環境でuserEvent非互換 | `fireEvent.click()` + `act()`        |
| パッケージディレクトリから実行 | P40: テスト実行ディレクトリ依存     | `cd apps/desktop && pnpm vitest run` |
| テスト間状態リセット           | P9: モジュールスコープ変数リーク    | `beforeEach` で DOM / store リセット |

#### 6.3 共通コンポーネントテスト方針

| コンポーネント       | テスト対象                                                   |
| -------------------- | ------------------------------------------------------------ |
| `StatusIndicator`    | 各ステータスの色クラス適用、pulseアニメーション有無          |
| `FilterChip`         | 選択 / 非選択切替、onClickコールバック                       |
| `Badge`              | variant別スタイル、content表示                               |
| `SearchBar`          | 入力反映、デバウンス動作、クリアボタン                       |
| `CodeViewer`         | コード表示、コピーボタン動作                                 |
| `TabSwitcher`        | タブ切替、activeTab反映、disabledタブ                        |
| `SlideInPanel`       | 開閉アニメーション、Escape閉じ、オーバーレイ                 |
| `CardGrid`           | アイテム描画、空状態、ローディングスケルトン                 |
| `MasterDetailLayout` | 左右分割レンダリング、レスポンシブモード切替                 |
| `SkeletonCard`       | バリエーション別レンダリング、パルスアニメーション           |
| `EmptyState`         | アイコン+見出し+説明表示、アクションボタン、サジェスト       |
| `RelativeTime`       | 相対時刻表示、自動更新、閾値切替、ツールチップ               |
| `ConfirmDialog`      | 開閉、キーボード操作、破壊的操作スタイル、フォーカストラップ |
| `SearchFilterList`   | 検索フィルタリング、フィルターチップ連動                     |

#### 6.4 テーマテスト

各共通コンポーネントについて、全3テーマ（`kanagawa-dragon` + `light` + `dark`）でレンダリングテストを実施:

```typescript
describe.each(["kanagawa-dragon", "light", "dark"] as const)(
  "StatusIndicator - theme: %s",
  (theme) => {
    it("renders with correct theme colors", () => {
      const { container } = renderWithTheme(
        <StatusIndicator status="success" />,
        { theme },
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  },
);
```

#### 6.5 Visual Regression Testing（将来検討）

- **ツール**: Chromatic または Percy（Storybook連携）
- **対象**: 全共通コンポーネント × 全テーマ × 3レスポンシブモード
- **頻度**: PR単位で自動実行
- **現時点**: 初期実装では省略し、コンポーネントが安定した Phase 後に導入

---

## 5. 成果物

| #   | 成果物                          | パス                                              |
| --- | ------------------------------- | ------------------------------------------------- |
| 1   | tokens.css テーマ追加           | `apps/desktop/src/renderer/styles/tokens.css`     |
| 2   | 共通コンポーネント（Atoms）     | `apps/desktop/src/renderer/components/atoms/`     |
| 3   | 共通コンポーネント（Molecules） | `apps/desktop/src/renderer/components/molecules/` |
| 4   | 共通コンポーネント（Organisms） | `apps/desktop/src/renderer/components/organisms/` |
| 5   | テストヘルパー                  | `apps/desktop/src/renderer/tests/helpers/`        |
| 6   | コンポーネントテスト            | 各コンポーネントと同階層の `.test.tsx`            |

## 6. 完了条件

- [ ] tokens.css に3テーマ全て（kanagawa-dragon / light / dark）のセマンティックカラーが定義されている
- [ ] 全Atomsコンポーネント（StatusIndicator, FilterChip, Badge, SkeletonCard, EmptyState, RelativeTime）が実装・テスト済み
- [ ] 全Moleculesコンポーネント（SearchBar, CodeViewer, TabSwitcher, SlideInPanel, ConfirmDialog）が実装・テスト済み
- [ ] 全Organismsコンポーネント（CardGrid, MasterDetailLayout, SearchFilterList）が実装・テスト済み
- [ ] `renderWithTheme` テストヘルパーが作成されている
- [ ] 全テストが `cd apps/desktop && pnpm vitest run` で PASS
- [ ] WCAG 2.1 AA コントラスト比が全テーマで検証されている
- [ ] レスポンシブ動作が3ブレークポイントで確認されている

## 7. 既知の落とし穴・教訓

| Pitfall | 内容                                   | 対策                                                |
| ------- | -------------------------------------- | --------------------------------------------------- |
| P31     | Zustand合成Hook無限ループ              | 共通コンポーネントはprops駆動。store直接参照しない  |
| P39     | happy-dom環境でuserEvent非互換         | `fireEvent` を使用                                  |
| P40     | テスト実行ディレクトリ依存             | `apps/desktop/` から実行                            |
| P9      | モジュールスコープ変数テスト間リーク   | `beforeEach` で状態リセット                         |
| 新規    | settingsSlice テーマ固定               | テーマ切替有効化には settingsSlice の制約解除が必要 |
| 新規    | Apple HIG tertiaryLabel 低コントラスト | `--text-muted`（30% opacity）は小テキストで要検証   |

## 8. 参照資料

- `.claude/rules/01-architecture.md` — カラーパレット、ビジュアルスタイル、アクセシビリティ基準
- `.claude/rules/03-state-management.md` — Zustand設計原則（P31対策）
- `.claude/rules/06-known-pitfalls.md` — P31, P39, P40
- `apps/desktop/src/renderer/styles/tokens.css` — 既存デザイントークン（310行）
- `apps/desktop/src/renderer/store/types.ts` — ThemeMode, ResolvedTheme 型定義
- `apps/desktop/src/renderer/store/slices/settingsSlice.ts` — テーマ管理ロジック（kanagawa-dragon固定）
- [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color) — Apple 公式カラーガイドライン
- [Apple HIG — Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) — ダークモード設計ガイド
