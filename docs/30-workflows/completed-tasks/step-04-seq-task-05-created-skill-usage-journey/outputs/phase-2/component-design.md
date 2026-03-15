# Phase 2 コンポーネント設計

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-05    |
| タスク名   | 作成済みスキルを使う主導線 |
| Phase      | 2                          |
| 成果物種別 | コンポーネント設計         |
| 作成日     | 2026-03-15                 |

## 1. コンポーネント一覧

### 1.1 全体一覧テーブル

| コンポーネント名        | Atomic Design | 新規/既存拡張 | 配置画面                    | 責務                                         |
| ----------------------- | ------------- | ------------- | --------------------------- | -------------------------------------------- |
| ScoreGateBadge          | Atom          | 新規          | SkillCard, 履歴, 詳細パネル | ScoringGate の視覚表現（色+ラベル+アイコン） |
| SkillCard               | Molecule      | 既存拡張      | Skill Center 一覧           | スキル情報カード（バッジ・スター追加）       |
| SkillDetailPanel        | Organism      | 既存拡張      | Skill Center                | スキル詳細表示 + CTA バー                    |
| PostExecutionActionBar  | Organism      | 新規          | Agent 実行結果              | 実行後4アクションボタン                      |
| SkillActionBar          | Molecule      | 新規          | SkillDetailPanel 内         | 「使う」「改善する」CTA ボタン群             |
| RecommendedSkillSection | Organism      | 新規          | Skill Center トップ         | おすすめスキル表示セクション                 |
| RecentlyUsedSection     | Organism      | 新規          | Skill Center                | 最近使ったスキル表示セクション               |

### 1.2 既存コンポーネントの拡張内容

| 既存コンポーネント | パス                                                                              | 拡張内容                                                 |
| ------------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| SkillCard          | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillCard.tsx`        | ScoreGateBadge追加、お気に入りスター追加、最終使用日追加 |
| SkillDetailPanel   | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel.tsx` | ScoreDisplay統合、利用履歴セクション追加、CTAバー追加    |
| SkillCenterView    | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                       | おすすめ・最近使ったセクション追加                       |

## 2. ScoreGateBadge (Atom, 新規)

### 2.1 Props 定義

```typescript
interface ScoreGateBadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  /** ScoringGate 判定結果 */
  gate: ScoringGate;
  /** 数値スコア（0-100） */
  score: number;
  /** バッジサイズ */
  size: "sm" | "md";
  /** ラベルテキストを表示するか（default: true） */
  showLabel?: boolean;
}
```

**P46 準拠**: `React.HTMLAttributes<HTMLSpanElement>` から `content` 属性を `Omit` で除外。HTML 標準の `content?: string` とカスタム Props の衝突を回避する。

### 2.2 GATE_BADGE_CONFIG 定義

```typescript
export const GATE_BADGE_CONFIG: Record<
  ScoringGate,
  {
    label: string;
    variant: "error" | "warning" | "success";
    icon: string;
  }
> = {
  NEEDS_IMPROVEMENT: {
    label: "改善必須",
    variant: "error",
    icon: "alert-circle",
  },
  SAVE_ALLOWED: {
    label: "保存可",
    variant: "warning",
    icon: "save",
  },
  USE_ALLOWED: {
    label: "利用可",
    variant: "success",
    icon: "check-circle",
  },
  RECOMMENDED: {
    label: "推奨",
    variant: "success",
    icon: "star",
  },
};
```

### 2.3 表示マッピング

| ScoringGate       | ラベル   | variant | アイコン     | 背景色(Light)              | 背景色(Dark)               |
| ----------------- | -------- | ------- | ------------ | -------------------------- | -------------------------- |
| NEEDS_IMPROVEMENT | 改善必須 | error   | alert-circle | `var(--status-error-bg)`   | `var(--status-error-bg)`   |
| SAVE_ALLOWED      | 保存可   | warning | save         | `var(--status-warning-bg)` | `var(--status-warning-bg)` |
| USE_ALLOWED       | 利用可   | success | check-circle | `var(--status-success-bg)` | `var(--status-success-bg)` |
| RECOMMENDED       | 推奨     | success | star         | `var(--status-success-bg)` | `var(--status-success-bg)` |

### 2.4 サイズバリエーション

| サイズ | 高さ | フォントサイズ | アイコンサイズ | パディング | 用途                      |
| ------ | ---- | -------------- | -------------- | ---------- | ------------------------- |
| sm     | 20px | 11px           | 12px           | 2px 6px    | SkillCard, 履歴エントリ   |
| md     | 28px | 13px           | 16px           | 4px 10px   | SkillDetailPanel ヘッダー |

### 2.5 variantStyles (P47 準拠)

```typescript
export const badgeVariantStyles: Record<
  "error" | "warning" | "success",
  string
> = {
  error:
    "bg-[var(--status-error-bg)] text-[var(--status-error)] border-[var(--status-error-border)]",
  warning:
    "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]",
  success:
    "bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success-border)]",
};
```

テスト側では `badgeVariantStyles` を import して期待値を生成する。ハードコード文字列でのアサーションを避ける。

### 2.6 A11y 要件

| 要件                            | 実装方法                                                           |
| ------------------------------- | ------------------------------------------------------------------ |
| 色 + ラベル + アイコンの3重表現 | 色覚多様性対応: 色だけでなくラベルテキストとアイコンで状態を伝える |
| aria-label                      | `aria-label={`スコア${score}点 - ${config.label}`}`                |
| role                            | `role="status"`                                                    |
| コントラスト比                  | 4.5:1 以上（WCAG 2.1 AA 通常テキスト準拠）                         |
| フォーカス                      | バッジ単体はフォーカス不要（親要素がフォーカス可能）               |

### 2.7 レンダリング仕様

```
[sm] [icon] ラベル
[md] [icon] ラベル (score点)

showLabel=false の場合:
[sm] [icon]
[md] [icon] (score点)
```

## 3. SkillCard (Molecule, 既存拡張)

### 3.1 追加要素

| 追加要素         | 配置位置 | 表示内容                            | インタラクション |
| ---------------- | -------- | ----------------------------------- | ---------------- |
| ScoreGateBadge   | 左上     | ScoringGate バッジ (size="sm")      | なし（表示のみ） |
| お気に入りスター | 右上     | 星アイコン（塗り/線）               | クリックでトグル |
| 最終使用日       | 下部     | 「3日前に使用」形式（相対日時表示） | なし（表示のみ） |

### 3.2 拡張 Props

```typescript
interface SkillCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "content"
> {
  /** スキル名 */
  skillName: string;
  /** スキル説明（max 80文字、2行省略） */
  description: string;
  /** ScoringGate 判定結果 */
  gate: ScoringGate;
  /** 数値スコア（0-100） */
  score: number;
  /** お気に入り状態 */
  isFavorite: boolean;
  /** 最終使用日時（未使用の場合 null） */
  lastUsedAt: string | null;
  /** お気に入りトグルハンドラ */
  onToggleFavorite: (skillName: string) => void;
  /** カードクリックハンドラ（詳細パネル表示） */
  onSelect: (skillName: string) => void;
}
```

**P46 準拠**: `content` 属性を `Omit` で除外（HTML 標準の `content?: string` との衝突回避）。

### 3.3 variantStyles (P47 準拠)

```typescript
export const skillCardStyles = {
  base: "rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4 cursor-pointer transition-shadow duration-200",
  hover: "hover:shadow-md hover:border-[var(--border-accent)]",
  focus:
    "focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2",
} as const;
```

### 3.4 レイアウト仕様

```
+------------------------------------------+
| [ScoreGateBadge(sm)]           [Star]    |
|                                           |
| スキル名（1行、省略あり max40文字）       |
| 説明テキスト（2行、省略あり max80文字）   |
|                                           |
| 3日前に使用                               |
+------------------------------------------+
```

### 3.5 A11y 要件

| 要件           | 実装方法                                                        |
| -------------- | --------------------------------------------------------------- |
| キーボード操作 | `tabIndex={0}`, Enter/Space でカード選択                        |
| aria-label     | `aria-label={`${skillName} - ${gateLabel} - スコア${score}点`}` |
| お気に入り     | `aria-pressed={isFavorite}` on star button                      |
| role           | カード: `role="button"`, スター: `role="switch"`                |

## 4. SkillDetailPanel (Organism, 既存拡張)

### 4.1 セクション構成

| セクション | 表示内容                                    | コンポーネント           |
| ---------- | ------------------------------------------- | ------------------------ |
| ヘッダー   | スキル名 + ScoreGateBadge(md) + お気に入り  | 既存ヘッダー拡張         |
| スコア詳細 | ScoreDisplay（総合 + 5軸 breakdown）        | ScoreDisplay (full mode) |
| 説明       | スキルの全文説明                            | テキスト表示             |
| 利用履歴   | 直近5件の実行日時・結果サマリー             | UsageHistoryList (新規)  |
| CTAバー    | 「使う」(Primary) + 「改善する」(Secondary) | SkillActionBar (新規)    |

### 4.2 拡張 Props

```typescript
interface SkillDetailPanelProps {
  /** スキル名 */
  skillName: string;
  /** スキル説明 */
  description: string;
  /** ScoringGate 判定結果 */
  gate: ScoringGate;
  /** 数値スコア（0-100） */
  score: number;
  /** 5軸スコア詳細 */
  scoreBreakdown: ScoreBreakdown;
  /** お気に入り状態 */
  isFavorite: boolean;
  /** 利用可否（canUse フラグ） */
  canUse: boolean;
  /** 利用履歴（直近5件） */
  usageHistory: UsageHistoryEntry[];
  /** パネル閉じるハンドラ */
  onClose: () => void;
  /** 「使う」CTA ハンドラ */
  onUse: (skillName: string, route: "workspace" | "agent") => void;
  /** 「改善する」CTA ハンドラ */
  onImprove: (skillName: string) => void;
  /** お気に入りトグルハンドラ */
  onToggleFavorite: (skillName: string) => void;
}

interface UsageHistoryEntry {
  executionId: string;
  executedAt: string;
  status: "success" | "failure" | "cancelled";
  resultSummary: string;
  scoreAtExecution: number;
}

interface ScoreBreakdown {
  clarity: number;
  specificity: number;
  context: number;
  constraints: number;
  format: number;
}
```

### 4.3 レイアウト仕様

```
+--------------------------------------------------+
| [x 閉じる]                                       |
|                                                   |
| スキル名                                          |
| [ScoreGateBadge(md)]  [Star お気に入り]           |
|                                                   |
| ── スコア詳細 ──────────────────────────────       |
| [ScoreDisplay: 総合 85点]                         |
| 明確性: 90  具体性: 80  文脈: 85                  |
| 制約: 80   形式: 90                               |
|                                                   |
| ── 説明 ────────────────────────────────────       |
| スキルの全文説明テキスト...                        |
|                                                   |
| ── 利用履歴 ────────────────────────────────       |
| 2026-03-14 15:30  成功  「要約を生成しました...」  |
| 2026-03-12 10:15  成功  「レビューを完了し...」    |
| 2026-03-10 09:00  失敗  「タイムアウト...」        |
|                                                   |
| ── アクション ──────────────────────────────       |
| [使う v]              [改善する]                   |
+--------------------------------------------------+
```

### 4.4 A11y 要件

| 要件           | 実装方法                                                     |
| -------------- | ------------------------------------------------------------ |
| キーボード操作 | Escape でパネル閉じる、Tab でセクション間移動                |
| aria-label     | `aria-label="スキル詳細: ${skillName}"`                      |
| role           | `role="dialog"`, `aria-modal="true"`                         |
| フォーカス管理 | パネル表示時にヘッダーにフォーカス移動、閉じ時に元要素に復帰 |
| ランドマーク   | 各セクションに `aria-labelledby` で見出し紐付け              |

## 5. PostExecutionActionBar (Organism, 新規)

### 5.1 ボタン構成

| ボタン         | ラベル           | スタイル         | アイコン    | 遷移先                   | 渡すコンテキスト                                |
| -------------- | ---------------- | ---------------- | ----------- | ------------------------ | ----------------------------------------------- |
| RerunButton    | もう一度使う     | Primary (Blue)   | refresh-cw  | Agent（同スキル再実行）  | `{ skillName, previousParams }`                 |
| ImproveButton  | 改善する         | Secondary (Gray) | trending-up | SkillAnalysisView        | `{ skillName, skillAnalysis, executionResult }` |
| CompleteButton | 完了             | Tertiary (Text)  | check       | 画面遷移なし（履歴記録） | なし                                            |
| TerminalButton | terminalで続ける | Tertiary (Text)  | terminal    | Terminal Dock            | `{ promptBundle, contextSummary }`              |

### 5.2 Props 定義

```typescript
interface PostExecutionActionBarProps {
  /** 実行したスキル名 */
  skillName: string;
  /** 実行結果サマリー */
  executionResult: ExecutionResultSummary;
  /** EP-4 利用後再評価結果（任意実行後に取得） */
  postExecutionScore: ScoringGateResult | null;
  /** 前回のスコアとの差分 */
  scoreDelta: number | null;
  /** もう一度使うハンドラ */
  onRerun: (skillName: string) => void;
  /** 改善するハンドラ */
  onImprove: (skillName: string) => void;
  /** 完了ハンドラ */
  onComplete: () => void;
  /** terminalで続けるハンドラ */
  onTerminalHandoff: (skillName: string) => void;
}
```

### 5.3 レイアウト仕様

```
+------------------------------------------------------------------+
| 品質情報                                                         |
| [ScoreDisplay: 75点] [ScoreDelta: +5 (70→75)]                   |
| [ScoringGateBanner: 利用可能だが改善推奨]                        |
+------------------------------------------------------------------+
| [もう一度使う]  [改善する]         [完了]  [terminalで続ける]     |
|  ^^^Primary      ^^^Secondary       ^^^Tertiary  ^^^Tertiary     |
+------------------------------------------------------------------+
```

- 左寄せ: Primary + Secondary ボタン（主要アクション）
- 右寄せ: Tertiary ボタン群（補助アクション）
- ボタン間隔: 8px (Apple HIG 準拠)

### 5.4 A11y 要件

| 要件           | 実装方法                                                       |
| -------------- | -------------------------------------------------------------- |
| キーボード操作 | Tab でボタン間移動、Enter/Space で実行                         |
| aria-label     | 各ボタンに説明ラベル（例: `aria-label="スキルをもう一度実行"`) |
| role           | `role="toolbar"`, `aria-label="実行後アクション"`              |
| フォーカス順序 | 左から右へ自然な順序（Primary → Secondary → Tertiary）         |

## 6. SkillActionBar (Molecule, 新規)

### 6.1 Props 定義

```typescript
interface SkillActionBarProps {
  /** スキル名 */
  skillName: string;
  /** 利用可否 */
  canUse: boolean;
  /** 「使う」ハンドラ */
  onUse: (skillName: string, route: "workspace" | "agent") => void;
  /** 「改善する」ハンドラ */
  onImprove: (skillName: string) => void;
}
```

### 6.2 ボタン構成

| ボタン   | 表示条件          | スタイル         | ドロップダウン                                   |
| -------- | ----------------- | ---------------- | ------------------------------------------------ |
| 使う     | `canUse === true` | Primary (Blue)   | 「Workspace で準備してから使う」「直接実行する」 |
| 改善する | 常時表示          | Secondary (Gray) | なし                                             |

- 「使う」ボタンは `canUse === false` の場合 `disabled` + ツールチップ表示
- ドロップダウンの展開はボタン右端の `v` アイコンクリックで開く

## 7. コンポーネントツリー

### 7.1 SkillCenterView 配下

```
SkillCenterView
  +-- SkillSearchBar (既存)
  +-- RecommendedSkillSection (新規 Organism)
  |     +-- SectionHeader ("おすすめスキル")
  |     +-- SkillCard[] (with ScoreGateBadge)
  |           +-- ScoreGateBadge (size="sm")
  |           +-- FavoriteStarButton
  |           +-- RelativeTimeLabel
  +-- RecentlyUsedSection (新規 Organism)
  |     +-- SectionHeader ("最近使ったスキル")
  |     +-- SkillCard[] (with ScoreGateBadge)
  +-- SavedSkillList (既存拡張)
  |     +-- SectionHeader ("保存済みスキル")
  |     +-- SkillCard[] (with ScoreGateBadge)
  +-- SkillDetailPanel (既存拡張 Organism)
        +-- PanelHeader
        |     +-- SkillName
        |     +-- ScoreGateBadge (size="md")
        |     +-- FavoriteStarButton
        +-- ScoreDisplay (full mode, Task04 既存)
        +-- SkillDescription
        +-- UsageHistoryList (新規)
        |     +-- UsageHistoryEntry[]
        +-- SkillActionBar (新規 Molecule)
              +-- UseButton (with dropdown)
              +-- ImproveButton
```

### 7.2 AgentView 配下（実行結果セクション拡張）

```
AgentView
  +-- ... (既存コンポーネント)
  +-- ExecutionResultSection (既存拡張)
        +-- ExecutionResultSummary (既存)
        +-- ScoreDisplay (compact mode, Task04 既存)
        +-- ScoreDelta (Task04 既存)
        +-- ScoringGateBanner (Task04 既存)
        +-- PostExecutionActionBar (新規 Organism)
              +-- RerunButton
              +-- ImproveButton
              +-- CompleteButton
              +-- TerminalHandoffButton
```

## 8. Atomic Design レベル分類

### 8.1 分類テーブル

| レベル   | コンポーネント名        | 理由                                                |
| -------- | ----------------------- | --------------------------------------------------- |
| Atom     | ScoreGateBadge          | 単一の視覚要素。独立して意味を持つ最小単位          |
| Atom     | FavoriteStarButton      | トグルボタン。単一操作の最小単位                    |
| Atom     | RelativeTimeLabel       | 相対日時表示。書式変換のみの表示要素                |
| Molecule | SkillCard               | 複数 Atom（Badge, Star, Label）の組み合わせ         |
| Molecule | SkillActionBar          | ボタン群の組み合わせ。単一のアクション領域          |
| Molecule | UsageHistoryEntry       | 日時・ステータス・サマリーの組み合わせ              |
| Organism | SkillDetailPanel        | 複数 Molecule/Atom の集合体。独立した機能ブロック   |
| Organism | PostExecutionActionBar  | 複数ボタン + スコア表示の統合。独立した機能ブロック |
| Organism | RecommendedSkillSection | SkillCard[] + ヘッダーの集合体                      |
| Organism | RecentlyUsedSection     | SkillCard[] + ヘッダーの集合体                      |

### 8.2 配置ディレクトリ

| レベル   | ディレクトリ                                                                      |
| -------- | --------------------------------------------------------------------------------- |
| Atom     | `apps/desktop/src/renderer/components/atoms/`                                     |
| Molecule | `apps/desktop/src/renderer/components/molecules/`                                 |
| Organism | `apps/desktop/src/renderer/views/SkillCenterView/components/` (Skill Center 固有) |
| Organism | `apps/desktop/src/renderer/components/organisms/AgentView/` (Agent 固有)          |

## 9. P46 準拠: HTMLAttributes 衝突チェック

### 9.1 衝突リスク属性一覧

| 属性名  | HTML 標準型 | 衝突リスクのあるコンポーネント | 対策                                       |
| ------- | ----------- | ------------------------------ | ------------------------------------------ |
| content | `string`    | ScoreGateBadge, SkillCard      | `Omit<HTMLAttributes, "content">` で除外   |
| color   | `string`    | ScoreGateBadge                 | `variant` プロパティ名を使用（衝突回避）   |
| title   | `string`    | SkillCard                      | `skillName` プロパティ名を使用（衝突回避） |
| hidden  | `boolean`   | なし                           | 衝突なし                                   |

### 9.2 適用パターン

```typescript
// ScoreGateBadge: content 属性を除外
interface ScoreGateBadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  gate: ScoringGate;
  score: number;
  size: "sm" | "md";
  showLabel?: boolean;
}

// SkillCard: content と title 属性を除外
interface SkillCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "content" | "title"
> {
  skillName: string;
  description: string;
  gate: ScoringGate;
  score: number;
  isFavorite: boolean;
  lastUsedAt: string | null;
  onToggleFavorite: (skillName: string) => void;
  onSelect: (skillName: string) => void;
}
```

## 10. WCAG 2.1 AA 準拠チェックリスト

### 10.1 コントラスト比

| 要素                            | 前景色                            | 背景色                     | コントラスト比（目標: 4.5:1+） |
| ------------------------------- | --------------------------------- | -------------------------- | ------------------------------ |
| ScoreGateBadge error テキスト   | `var(--status-error)` (#FF3B30)   | `var(--status-error-bg)`   | 4.5:1 以上を保証               |
| ScoreGateBadge warning テキスト | `var(--status-warning)` (#FF9500) | `var(--status-warning-bg)` | 4.5:1 以上を保証               |
| ScoreGateBadge success テキスト | `var(--status-success)` (#34C759) | `var(--status-success-bg)` | 4.5:1 以上を保証               |
| SkillCard プライマリテキスト    | `var(--text-primary)` (#000)      | `var(--bg-primary)` (#FFF) | 21:1（PASS）                   |
| SkillCard セカンダリテキスト    | `var(--text-secondary)`           | `var(--bg-primary)` (#FFF) | 4.5:1 以上を保証               |
| disabled ボタンテキスト         | `var(--text-disabled)`            | `var(--bg-secondary)`      | 3:1 以上（UI部品基準）         |

### 10.2 キーボード操作

| コンポーネント         | 操作           | キー          | 動作                       |
| ---------------------- | -------------- | ------------- | -------------------------- |
| SkillCard              | 選択           | Enter / Space | SkillDetailPanel を開く    |
| SkillCard              | お気に入り     | F             | お気に入りトグル           |
| SkillDetailPanel       | 閉じる         | Escape        | パネルを閉じる             |
| SkillDetailPanel       | セクション移動 | Tab           | 各セクション間を移動       |
| SkillActionBar         | 使う           | Enter         | 推奨経路で利用開始         |
| SkillActionBar         | ドロップダウン | ArrowDown     | 経路選択メニュー展開       |
| PostExecutionActionBar | ボタン移動     | Tab           | 左から右へボタン間移動     |
| PostExecutionActionBar | 実行           | Enter / Space | 選択中のアクションを実行   |
| ScoreGateBadge         | -              | -             | フォーカス不要（装飾要素） |

### 10.3 ARIA ラベル

| コンポーネント         | aria 属性                                                               |
| ---------------------- | ----------------------------------------------------------------------- |
| ScoreGateBadge         | `role="status"`, `aria-label="スコア{score}点 - {label}"`               |
| SkillCard              | `role="button"`, `aria-label="{skillName} - {gateLabel}"`               |
| FavoriteStarButton     | `role="switch"`, `aria-checked={isFavorite}`, `aria-label="お気に入り"` |
| SkillDetailPanel       | `role="dialog"`, `aria-modal="true"`, `aria-label="スキル詳細"`         |
| PostExecutionActionBar | `role="toolbar"`, `aria-label="実行後アクション"`                       |
| SkillActionBar         | `role="group"`, `aria-label="スキルアクション"`                         |
| UseButton dropdown     | `role="menu"`, `aria-expanded={isOpen}`                                 |

### 10.4 フォーカス管理

| イベント                    | フォーカス移動先                                   |
| --------------------------- | -------------------------------------------------- |
| SkillDetailPanel 表示       | パネル内の最初のフォーカス可能要素（閉じるボタン） |
| SkillDetailPanel 閉じる     | トリガー元の SkillCard に復帰                      |
| ドロップダウン展開          | メニューの最初の項目                               |
| ドロップダウン閉じる        | トリガー元のボタンに復帰                           |
| PostExecutionActionBar 表示 | 最初のボタン（もう一度使う）                       |
