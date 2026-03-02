# Phase 2 成果物: アーキテクチャ設計書

## メタ情報

| 項目            | 値                                |
| --------------- | --------------------------------- |
| タスク ID       | TASK-UI-05B-SKILL-ADVANCED-VIEWS  |
| Phase           | 2（設計）                         |
| 成果物          | architecture-design.md            |
| 作成日          | 2026-03-02                        |
| 前 Phase 成果物 | `outputs/phase-1/` (要件定義書等) |

---

## 1. コンポーネントアーキテクチャ概要

### 1.1 Atomic Design 層責務

| 層        | 責務                                       | 配置先                                       |
| --------- | ------------------------------------------ | -------------------------------------------- |
| atoms     | 単一責務の表示・入力パーツ                 | 各ビューディレクトリ直下 or サブディレクトリ |
| molecules | 複数 atoms を組み合わせた機能単位          | 各ビューディレクトリ直下 or サブディレクトリ |
| organisms | ビュー全体のレイアウト統合・ダイアログ制御 | 各ビューディレクトリ直下                     |

### 1.2 全ビュー共通レイアウト（HIG 準拠）

```
+----------------------------------------------------------+
| ヘッダー: ビュータイトル + アクションボタン群             |
|   h-56px, border-bottom, px-24px                         |
+----------------------------------------------------------+
| メインコンテンツエリア                                    |
|   p-24px, overflow-y: auto, max-w-1200px, mx-auto        |
+----------------------------------------------------------+
```

---

## 2. コンポーネント構成と Props 型定義（全33コンポーネント）

### 2.1 3A: SkillChainBuilder（7コンポーネント）

#### SkillChainBuilder（organisms）

メインレイアウト。チェーン一覧とエディターを統合する。

```typescript
interface SkillChainBuilderProps {}
```

- チェーン一覧（ChainCardGrid）とエディター（ChainEditor）の表示切替を管理
- `useChainList` / `useChainEditor` フックを使用

#### ChainCardGrid（molecules）

チェーン一覧をカード形式で表示する。

```typescript
interface ChainCardGridProps {
  chains: SkillChainDefinition[];
  isLoading: boolean;
  onSelect: (chainId: string) => void;
  onExecute: (chainId: string) => void;
  onDelete: (chainId: string) => void;
}
```

- `isLoading: true` 時はスケルトンカード4枚を表示
- 空配列時は EmptyState（mood: `"creative"`）を表示

#### ChainEditor（organisms）

パイプラインエディター。ステップの追加・削除・並び替え・実行を制御する。

```typescript
interface ChainEditorProps {
  chain: SkillChainDefinition;
  availableSkills: Skill[];
  onSave: (chain: SkillChainDefinition) => void;
  onExecute: () => void;
  onClose: () => void;
}
```

- ステップを水平配置（lg）/垂直配置（< 768px）で表示
- エラーハンドリング設定（stop/skip/retry）を提供

#### StepCard（molecules）

ステップカードの表示。実行状態に応じたビジュアルフィードバックを提供する。

```typescript
interface StepCardProps {
  step: SkillChainStep;
  index: number;
  isActive: boolean;
  isExecuting: boolean;
  onSelect: () => void;
  onRemove: () => void;
}
```

- カードサイズ: 160px x 100px
- 実行中: ボーダー `var(--color-accent)` + パルスアニメーション
- 完了: チェックマーク + 緑ボーダー
- エラー: 赤ボーダー + エラーアイコン

#### StepConnector（atoms）

ステップ間の接続線を SVG で描画する。

```typescript
interface StepConnectorProps {
  fromStep: number;
  toStep: number;
  isActive: boolean;
  label?: string;
}
```

- SVG パス（水平矢印 + ラベル `${variableName}`）
- 実行進行中: ストロークダッシュアニメーション（連続、linear）

#### StepEditor（molecules）

ステップの詳細設定パネル。

```typescript
interface StepEditorProps {
  step: SkillChainStep;
  availableSkills: Skill[];
  previousOutputs: string[];
  onChange: (step: SkillChainStep) => void;
}
```

- ツール選択ドロップダウン（SearchBar 付き）
- 入力マッピングタイプ選択: `literal` / `variable` / `template` / `previousOutput`
- 条件設定: `always` / `ifVariable` / `ifPreviousSuccess` / `expression`
- タイムアウト・リトライ設定

#### CreateChainDialog（organisms）

新規チェーン作成ダイアログ。

```typescript
interface CreateChainDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (chain: Omit<SkillChainDefinition, "id">) => void;
}
```

---

### 2.2 3B: ScheduleManager（8コンポーネント）

#### ScheduleManager（organisms）

メインレイアウト。スケジュール一覧と詳細パネルを統合する。

```typescript
interface ScheduleManagerProps {}
```

#### ScheduleTable（molecules）

スケジュール一覧をテーブル形式で表示する。

```typescript
interface ScheduleTableProps {
  schedules: ScheduledSkill[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}
```

- `isLoading: true` 時はスケルトン行5行を表示
- カラム: ツール名 / スケジュール / 次回実行 / 状態

#### ScheduleRow（molecules）

テーブルの各行を表示する。

```typescript
interface ScheduleRowProps {
  schedule: ScheduledSkill;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}
```

- hover: 背景色 `var(--bg-hover)` (100ms ease-out)
- ON/OFF トグル: スライド + 色変化（accent ↔ gray, 200ms ease-out）

#### ScheduleDetailPanel（molecules）

行選択時に展開される詳細パネル。

```typescript
interface ScheduleDetailPanelProps {
  schedule: ScheduledSkill;
  runHistory: ScheduledRunResult[];
  onEdit: () => void;
  onDelete: () => void;
}
```

- 展開アニメーション: `max-height` トランジション（300ms ease-out）
- プロンプト表示 + 実行履歴（RunHistoryList）を含む

#### ScheduleDialog（organisms）

新規作成・編集ダイアログ。

```typescript
interface ScheduleDialogProps {
  isOpen: boolean;
  schedule?: ScheduledSkill;
  onClose: () => void;
  onSave: (schedule: Omit<ScheduledSkill, "id">) => void;
}
```

- `schedule` が undefined の場合は新規作成モード
- `schedule` がある場合は編集モード

#### CronEditor（molecules）

Cron 式の GUI エディター。

```typescript
interface CronEditorProps {
  value: string;
  onChange: (cron: string) => void;
}
```

- プリセット選択（CronPresetList）
- カスタム入力: 分 / 時 / 日 / 月 / 曜日のセレクトボックス群
- Cron 式プレビュー表示

#### CronPresetList（atoms）

Cron プリセット一覧。

```typescript
interface CronPresetListProps {
  onSelect: (cron: string) => void;
  selectedCron: string;
}
```

プリセット:

| ラベル        | Cron 式       |
| ------------- | ------------- |
| 毎日 9:00     | `0 9 * * *`   |
| 平日 9:00     | `0 9 * * 1-5` |
| 毎時          | `0 * * * *`   |
| 毎週月曜 9:00 | `0 9 * * 1`   |

#### RunHistoryList（molecules）

実行履歴をリスト形式で表示する。

```typescript
interface RunHistoryListProps {
  history: ScheduledRunResult[];
  maxItems?: number;
}
```

- 実行履歴行の追加アニメーション: `opacity: 0->1` + `translateY(-8px->0)` (200ms ease-out)

---

### 2.3 3C: DebugPanel（10コンポーネント）

#### DebugPanel（organisms）

メインレイアウト。左右2ペイン構成でデバッグ情報を表示する。

```typescript
interface DebugPanelProps {}
```

- lg: 左右2ペイン（flex-1 + 320px）
- md: 上下分割
- < 768px: タブ切替（スタック/変数/出力）

#### DebugControls（molecules）

実行コントロールバー。

```typescript
interface DebugControlsProps {
  sessionStatus: "idle" | "running" | "paused" | "completed" | "error";
  onContinue: () => void;
  onStepOver: () => void;
  onStepInto: () => void;
  onStepOut: () => void;
  onPause: () => void;
  onStop: () => void;
}
```

ボタン仕様:

| ボタン         | アイコン（lucide-react） | ショートカット | 有効条件          |
| -------------- | ------------------------ | -------------- | ----------------- |
| 続行           | `Play`                   | `F5`           | paused            |
| ステップ       | `SkipForward`            | `F10`          | paused            |
| ステップイン   | `ArrowDownToLine`        | `F11`          | paused            |
| ステップアウト | `ArrowUpFromLine`        | `Shift+F11`    | paused            |
| 一時停止       | `Pause`                  | `F6`           | running           |
| 停止           | `Square`                 | `Shift+F5`     | running or paused |

- hover: `scale(1.05)` (100ms ease-out)
- active: `scale(0.95)` (即時)

#### CallStackView（molecules）

コールスタックをツリー形式で表示する。

```typescript
interface CallStackViewProps {
  callStack: CallStackEntry[];
  activeEntryId: string | null;
  onSelect: (id: string) => void;
}
```

- ブレーク時: 背景ハイライト `var(--status-warning-subtle)` (300ms ease-out)

#### StepHistoryList（molecules）

ステップ履歴をリスト形式で表示する。

```typescript
interface StepHistoryListProps {
  steps: DebugStep[];
  activeIndex: number | null;
}
```

- 行追加アニメーション: `opacity: 0->1` + `translateY(-4px->0)` (200ms ease-out)

#### OutputConsole（molecules）

出力コンソール。ログを1行ずつ append で表示する。

```typescript
interface OutputConsoleProps {
  lines: Array<{
    timestamp: string;
    level: "info" | "warn" | "error";
    message: string;
  }>;
  maxLines?: number;
}
```

- level 別のテキスト色: info = `var(--text-primary)`, warn = `var(--status-warning)`, error = `var(--status-error)`
- 自動スクロール（最新行を常に表示）

#### VariableWatch（molecules）

変数ウォッチパネル。変数をツリー形式で表示する。

```typescript
interface VariableWatchProps {
  variables: Record<string, unknown>;
  changedPaths: Set<string>;
}
```

#### VariableNode（atoms）

変数ツリーの各ノード。再帰的にネストされたオブジェクトを表示する。

```typescript
interface VariableNodeProps {
  name: string;
  value: unknown;
  path: string;
  isChanged: boolean;
  depth: number;
}
```

- 変更時: テキスト色 `var(--color-accent)` で点滅（500ms ease-in-out）

#### BreakpointEditor（molecules）

ブレークポイントの管理パネル。

```typescript
interface BreakpointEditorProps {
  breakpoints: Breakpoint[];
  onAdd: (breakpoint: Omit<Breakpoint, "id">) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}
```

#### BreakpointRow（atoms）

ブレークポイントの各行。

```typescript
interface BreakpointRowProps {
  breakpoint: Breakpoint;
  onRemove: () => void;
  onToggle: () => void;
}
```

- チェックボックスで有効/無効トグル
- 削除ボタン

#### StartDebugDialog（organisms）

デバッグ開始ダイアログ。

```typescript
interface StartDebugDialogProps {
  isOpen: boolean;
  availableSkills: Skill[];
  onClose: () => void;
  onStart: (
    skillName: string,
    options?: { breakpoints?: Omit<Breakpoint, "id">[] },
  ) => void;
}
```

---

### 2.4 3D: AnalyticsDashboard（8コンポーネント）

#### AnalyticsDashboard（organisms）

メインレイアウト。サマリー・チャート・ランキングを統合する。

```typescript
interface AnalyticsDashboardProps {}
```

#### SummaryCards（molecules）

サマリーカード群を表示する。

```typescript
interface SummaryCardsProps {
  summary: AnalyticsSummary;
  isLoading: boolean;
}
```

- `isLoading: true` 時はスケルトンカード3枚を表示
- lg: カード3列、md: 2列、< 768px: 1列

#### SummaryCard（atoms）

個別のサマリーカード。

```typescript
interface SummaryCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    direction: "up" | "down" | "flat";
    percentage: number;
    label: string;
  };
  icon: LucideIcon;
}
```

- カードサイズ: `min-h-100px`, flex-1
- 値フォント: `text-3xl`, `font-bold`
- トレンド上昇: `var(--status-success)` + `TrendingUp` アイコン
- トレンド下降: `var(--status-error)` + `TrendingDown` アイコン
- 初期表示: カウントアップアニメーション（0->実際値、800ms ease-out）
- hover: `scale(1.02)` + `shadow-md` (200ms ease-out)

#### UsageChart（molecules）

トレンドチャートを recharts で描画する。

```typescript
interface UsageChartProps {
  data: TrendDataPoint[];
  granularity: "hour" | "day" | "week" | "month";
  height?: number;
}
```

- デフォルト height: 280px
- 初期表示: 折れ線の左->右ドローアニメーション（1000ms ease-out）
- ライブラリ: recharts（ResponsiveContainer + LineChart + Tooltip）

#### ChartTooltip（atoms）

カスタムツールチップ。

```typescript
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}
```

- 表示内容: 実行回数・エラー数・平均時間
- 背景: `var(--bg-primary)`, ボーダー: `var(--border-primary)`

#### SkillRanking（molecules）

ツール使用ランキングを水平バーチャートで表示する。

```typescript
interface SkillRankingProps {
  skills: SkillUsageSummary[];
  maxItems?: number;
}
```

- デフォルト maxItems: 10
- バー色: `var(--color-accent)` のグラデーション
- 初期表示: バー幅 `0%->実際値%`（600ms ease-out）
- hover: `opacity: 0.7->1` (100ms ease-out)

#### PeriodSelector（atoms）

期間フィルターセレクター。

```typescript
interface PeriodSelectorProps {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}
```

- 選択肢: 過去7日 / 30日 / 90日
- 期間切替時: チャート crossFade（200ms ease-in-out）

#### ExportButton（atoms）

エクスポートボタン。

```typescript
interface ExportButtonProps {
  onExport: (format: "csv" | "json") => void;
  isExporting: boolean;
}
```

- `isExporting: true` 時はスピナー表示 + disabled

---

## 3. マイクロインタラクション仕様（全22個）

### 3.1 3A: SkillChainBuilder（6個）

| #   | 対象           | トリガー   | アニメーション                        | 時間      | イージング |
| --- | -------------- | ---------- | ------------------------------------- | --------- | ---------- |
| 1   | StepCard       | hover      | `scale(1.02)` + `shadow-md`           | 200ms     | ease-out   |
| 2   | StepCard       | ドラッグ   | `opacity: 0.7` + `cursor: grabbing`   | 即時      | -          |
| 3   | StepCard       | ドロップ   | 挿入位置に slide-in                   | 200ms     | ease-out   |
| 4   | ステップ追加   | クリック   | `opacity: 0->1` + `scale(0.9->1)`     | 300ms     | ease-out   |
| 5   | 実行中ステップ | 実行時     | ボーダーパルス `opacity: 0.5->1->0.5` | 1.5s 周期 | linear     |
| 6   | 接続線         | 実行進行中 | ストロークダッシュアニメーション      | 連続      | linear     |

### 3.2 3B: ScheduleManager（4個）

| #   | 対象          | トリガー | アニメーション                          | 時間  | イージング |
| --- | ------------- | -------- | --------------------------------------- | ----- | ---------- |
| 1   | ScheduleRow   | hover    | 背景色 `var(--bg-hover)`                | 100ms | ease-out   |
| 2   | ON/OFF トグル | クリック | スライド + 色変化（accent <-> gray）    | 200ms | ease-out   |
| 3   | 詳細パネル    | 展開     | `max-height` トランジション             | 300ms | ease-out   |
| 4   | 実行履歴行    | 追加     | `opacity: 0->1` + `translateY(-8px->0)` | 200ms | ease-out   |

### 3.3 3C: DebugPanel（6個）

| #   | 対象                 | トリガー   | アニメーション                                | 時間  | イージング  |
| --- | -------------------- | ---------- | --------------------------------------------- | ----- | ----------- |
| 1   | コールスタック行     | ブレーク時 | 背景ハイライト `var(--status-warning-subtle)` | 300ms | ease-out    |
| 2   | ステップ履歴行       | 追加       | `opacity: 0->1` + `translateY(-4px->0)`       | 200ms | ease-out    |
| 3   | 変数値               | 変更       | テキスト色 `var(--color-accent)` で点滅       | 500ms | ease-in-out |
| 4   | 出力コンソール行     | 追加       | テキスト一行ずつ append                       | 即時  | -           |
| 5   | DebugControls ボタン | hover      | `scale(1.05)`                                 | 100ms | ease-out    |
| 6   | DebugControls ボタン | active     | `scale(0.95)`                                 | 即時  | -           |

### 3.4 3D: AnalyticsDashboard（6個）

| #   | 対象              | トリガー     | アニメーション              | 時間   | イージング  |
| --- | ----------------- | ------------ | --------------------------- | ------ | ----------- |
| 1   | SummaryCard       | 初期表示     | カウントアップ（0->実際値） | 800ms  | ease-out    |
| 2   | SummaryCard       | hover        | `scale(1.02)` + `shadow-md` | 200ms  | ease-out    |
| 3   | UsageChart        | 初期表示     | 折れ線の左->右ドロー        | 1000ms | ease-out    |
| 4   | SkillRanking バー | 初期表示     | バー幅 `0%->実際値%`        | 600ms  | ease-out    |
| 5   | SkillRanking バー | hover        | `opacity: 0.7->1`           | 100ms  | ease-out    |
| 6   | 期間切替          | セレクト変更 | チャート crossFade          | 200ms  | ease-in-out |

---

## 4. recharts 統合設計（AnalyticsDashboard 固有）

### 4.1 使用コンポーネント

| recharts コンポーネント | 用途                     |
| ----------------------- | ------------------------ |
| `ResponsiveContainer`   | チャートのレスポンシブ化 |
| `LineChart`             | トレンド折れ線グラフ     |
| `Line`                  | データ線                 |
| `XAxis`                 | 横軸（日付）             |
| `YAxis`                 | 縦軸（実行回数）         |
| `CartesianGrid`         | グリッド線               |
| `Tooltip`               | カスタムツールチップ     |
| `Legend`                | 凡例                     |

### 4.2 テーマ設定

```typescript
const chartTheme = {
  strokeColor: "var(--color-accent)", // 主線
  gridColor: "var(--border-primary)", // グリッド
  textColor: "var(--text-secondary)", // 軸ラベル
  tooltipBg: "var(--bg-primary)", // ツールチップ背景
  tooltipBorder: "var(--border-primary)", // ツールチップ境界
};
```

### 4.3 UsageChart 実装パターン

```tsx
const UsageChart: React.FC<UsageChartProps> = ({
  data,
  granularity,
  height = 280,
}) => {
  if (data.length === 0) {
    return (
      <EmptyState
        mood="curious"
        message="データがまだありません"
        icon={BarChart3}
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid stroke={chartTheme.gridColor} strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          stroke={chartTheme.textColor}
          tickFormatter={(ts) => formatTimestamp(ts, granularity)}
        />
        <YAxis stroke={chartTheme.textColor} />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="totalRuns"
          stroke={chartTheme.strokeColor}
          strokeWidth={2}
          dot={false}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### 4.4 recharts テスト戦略

recharts コンポーネントは SVG を描画するため、DOM テストでは以下を検証する:

1. `ResponsiveContainer` がレンダリングされること
2. `data` prop が正しく渡されること
3. カスタム `ChartTooltip` のレンダリング
4. 空データ時のフォールバック表示（EmptyState）
5. `granularity` 変更時の軸ラベルフォーマット変更

注意事項:

- recharts は SVG を描画するため、happy-dom 環境での SVG レンダリングに制約がある
- チャートの描画内容の詳細検証は Phase 11（手動テスト）で実施する

---

## 5. 共通パターン設計

### 5.1 EmptyState パターン

| ビュー          | mood          | メッセージ                     | アクションボタン       | アイコン（lucide-react） |
| --------------- | ------------- | ------------------------------ | ---------------------- | ------------------------ |
| ChainBuilder    | `"creative"`  | 「ツールを組み合わせてみよう」 | 「チェーンを作成」     | `Workflow`               |
| ScheduleManager | `"organized"` | 「ツールを自動で実行しよう」   | 「スケジュール作成」   | `Calendar`               |
| DebugPanel      | `"focused"`   | 「ツール実行を詳しく調べよう」 | 「デバッグ開始」       | `Bug`                    |
| Analytics       | `"curious"`   | 「ツールの使い方を振り返ろう」 | なし（データ蓄積待ち） | `BarChart3`              |

### 5.2 Loading パターン

- スケルトンカード: `animate-pulse` + `bg-[var(--bg-tertiary)]` 矩形
- ローディング中はアクションボタン `disabled` + `opacity: 0.5`

| ビュー          | スケルトン内容                       |
| --------------- | ------------------------------------ |
| ChainBuilder    | カード4枚                            |
| ScheduleManager | テーブル行5行                        |
| DebugPanel      | 全パネル（コールスタック/変数/出力） |
| Analytics       | カード3枚 + チャート矩形             |

### 5.3 Error パターン

- エラーメッセージ: `var(--status-error)` テキスト + `AlertCircle` アイコン（lucide-react）
- リトライボタン: 「再試行」ボタンを表示
- IPC エラーはサニタイズして表示（内部情報を含まない）
- エラーメッセージテンプレート: `「データの取得に失敗しました。再試行してください。」`

---

## 6. レスポンシブ設計

### 6.1 全ビュー共通ブレークポイント

| ブレークポイント | CSS クラス       | レイアウト                        |
| ---------------- | ---------------- | --------------------------------- |
| >= 1024px        | `lg:` prefix     | 左右分割（メイン + サイド 320px） |
| 768px - 1023px   | `md:` prefix     | 上下分割（折りたたみパネル）      |
| < 768px          | default (mobile) | 単一カラム + ボトムシート（85vh） |

### 6.2 ビュー固有レスポンシブ対応

| ビュー          | >= 1024px                      | 768px - 1023px               | < 768px                          |
| --------------- | ------------------------------ | ---------------------------- | -------------------------------- |
| ChainBuilder    | StepCard 水平配置 + 右パネル   | StepCard 水平配置 + 下パネル | StepCard 垂直配置 + ボトムシート |
| ScheduleManager | テーブルレイアウト + 右パネル  | テーブル + 下部折りたたみ    | カードリスト + ボトムシート      |
| DebugPanel      | 左右2ペイン（flex-1 + 320px）  | 上下分割                     | タブ切替（スタック/変数/出力）   |
| Analytics       | カード3列 + フルワイドチャート | カード2列 + チャート         | カード1列 + スクロールチャート   |

---

## 7. セキュリティ設計

### 7.1 sender 検証

全 IPC ハンドラで `validateIpcSender` を使用して送信元ウィンドウを検証する。

### 7.2 P42 準拠3段バリデーション

全ハンドラの文字列引数に以下の3段バリデーションを適用する:

1. **型チェック**: `typeof arg !== "string"` で型を検証
2. **空文字列チェック**: `arg === ""` で空文字列を拒否
3. **トリム空文字列チェック**: `arg.trim() === ""` でスペースのみの入力を拒否

### 7.3 エラーサニタイズ

IPC エラーレスポンスでは内部情報（スタックトレース、ファイルパス）を含めず、サニタイズされたエラーメッセージのみを返す。

---

## 8. 統合テスト連携

| 連携観点     | 設計出力                            | Phase 4 での検証対象                      |
| ------------ | ----------------------------------- | ----------------------------------------- |
| UI構造       | Atomic Design 階層図                | コンポーネントレンダリング/責務境界テスト |
| 状態管理     | Store セレクタ/Hooks 設計           | P31 回避（個別セレクタ）テスト            |
| IPC契約      | チャネル・引数・戻り値・event契約   | invoke/on 契約テスト、型整合テスト        |
| セキュリティ | sender 検証 + P42 3段バリデーション | エラー系/不正入力テスト                   |
| レスポンシブ | sm/md/lg レイアウト切替仕様         | レスポンシブ UI テスト                    |
