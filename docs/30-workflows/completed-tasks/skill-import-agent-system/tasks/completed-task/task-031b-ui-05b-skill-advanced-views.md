# TASK-UI-05B-SKILL-ADVANCED-VIEWS: ツール高度管理ビュー群

## 1. メタ情報

| 項目         | 値                                                                                     |
| ------------ | -------------------------------------------------------------------------------------- |
| タスク ID    | TASK-UI-05B-SKILL-ADVANCED-VIEWS                                                       |
| ステータス   | 完了                                                                                   |
| 依存タスク   | TASK-UI-00（デザイン基盤）, TASK-UI-01（アーキテクチャ）, TASK-UI-05（スキルセンター） |
| バックエンド | TASK-9D（チェーン）, TASK-9G（スケジュール）, TASK-9H（デバッグ）, TASK-9J（分析）     |
| 複雑度       | large                                                                                  |
| 対象ビュー   | 4つの独立ビュー群（タブ切替またはルーティング）                                        |
| 関連スライス | `agentSlice`（既存利用）                                                               |
| 設計哲学     | 「パワーユーザー向け」-- 高度な管理機能を Apple HIG 準拠で提供                         |

## 2. 目的

スキルの高度管理機能（チェーン構築・スケジュール実行・デバッグ・使用分析）の UI 仕様を Apple HIG 準拠で統合定義する。各ビューは独立した画面として提供し、共通のデザインパターン（HIG レイアウト / EmptyState / Loading / IPC 連携）を適用する。

## 3. 共通パターン

### 3.0.1 HIG 準拠レイアウト

全ビューに共通するレイアウト構成:

```
+----------------------------------------------------------+
| ヘッダー: ビュータイトル + アクションボタン群             |
+----------------------------------------------------------+
| メインコンテンツエリア                                    |
|                                                          |
| (各ビュー固有の内容)                                     |
|                                                          |
+----------------------------------------------------------+
```

- ヘッダー: `h-56px`, `border-bottom`, `px-24px`
- コンテンツ: `p-24px`, `overflow-y: auto`
- 最大幅: `1200px`, `mx-auto`

### 3.0.2 EmptyState パターン

各ビューの初期状態:

| ビュー          | mood          | メッセージ                     | アクションボタン       |
| --------------- | ------------- | ------------------------------ | ---------------------- |
| ChainBuilder    | `"creative"`  | 「ツールを組み合わせてみよう」 | 「チェーンを作成」     |
| ScheduleManager | `"organized"` | 「ツールを自動で実行しよう」   | 「スケジュール作成」   |
| DebugPanel      | `"focused"`   | 「ツール実行を詳しく調べよう」 | 「デバッグ開始」       |
| Analytics       | `"curious"`   | 「ツールの使い方を振り返ろう」 | なし（データ蓄積待ち） |

### 3.0.3 Loading パターン

- スケルトンカード: `animate-pulse` + グレー背景矩形
- カード数: コンテンツに応じて 3〜6 枚
- ローディング中はアクションボタン無効化

### 3.0.4 IPC 連携パターン

各ビューのバックエンド連携は対応する task-9 仕様書を参照:

| ビュー          | IPC チャネルプレフィックス | バックエンド仕様                                  |
| --------------- | -------------------------- | ------------------------------------------------- |
| ChainBuilder    | `skill:chain:*`            | [task-9d](./task-023e-task-9d-skill-chain.md)     |
| ScheduleManager | `skill:schedule:*`         | [task-9g](./task-023a-task-9g-skill-schedule.md)  |
| DebugPanel      | `skill:debug:*`            | [task-9h](./task-023b-task-9h-skill-debug.md)     |
| Analytics       | `skill:analytics:*`        | [task-9j](./task-023d-task-9j-skill-analytics.md) |

---

## 3A. SkillChainBuilder（パイプラインビルダー）

### 画面構成図

```
+----------------------------------------------------------+
| チェーン管理                     [+ 新規チェーン作成]     |
+----------------------------------------------------------+
| チェーン一覧 (CardGrid)                                   |
| +--------------------+ +--------------------+             |
| | データ分析パイプ   | | テスト自動化       |             |
| | 3ステップ          | | 2ステップ          |             |
| | 最終実行: 2h前     | | 最終実行: 1d前     |             |
| |       [実行] [編集]| |       [実行] [編集]|             |
| +--------------------+ +--------------------+             |
|                                                           |
| ---- チェーンエディター（カード選択時に展開）----         |
| +-------------------------------------------------------+ |
| | Step 1          Step 2          Step 3                | |
| | [コード分析] → [レビュー生成] → [レポート送信]       | |
| |    ↓ output       ↓ output       ↓ output            | |
| |   ${result}      ${review}      ${report}            | |
| +-------------------------------------------------------+ |
| | [+ ステップ追加]  エラー時: [停止 ▼]  [保存] [実行]  | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

### コンポーネント構成

```
SkillChainBuilder/
├── SkillChainBuilder.tsx            # メインレイアウト（organisms）
├── ChainCardGrid.tsx                # チェーン一覧カード（molecules）
├── ChainEditor/
│   ├── ChainEditor.tsx              # パイプラインエディター（organisms）
│   ├── StepCard.tsx                 # ステップカード（molecules）
│   ├── StepConnector.tsx            # ステップ間矢印（atoms）
│   └── StepEditor.tsx              # ステップ詳細設定パネル（molecules）
├── CreateChainDialog.tsx            # 新規チェーン作成ダイアログ（organisms）
└── hooks/
    ├── useChainList.ts              # チェーン一覧取得・管理
    └── useChainEditor.ts           # チェーン編集・実行ロジック
```

### StepCard コンポーネント

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

| 属性         | 値                                                    |
| ------------ | ----------------------------------------------------- |
| カードサイズ | 160px × 100px                                         |
| アイコン     | ツールカテゴリに応じた lucide-react アイコン          |
| 接続線       | SVG パス（水平矢印 + ラベル `${variableName}`）       |
| 実行中       | ボーダー `var(--color-accent)` + パルスアニメーション |
| 完了         | チェックマーク + 緑ボーダー                           |
| エラー       | 赤ボーダー + エラーアイコン                           |

### StepEditor コンポーネント

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

### マイクロインタラクション

| 対象           | トリガー   | アニメーション                                | 時間           |
| -------------- | ---------- | --------------------------------------------- | -------------- |
| StepCard       | hover      | `scale(1.02)` + `shadow-md`                   | 200ms ease-out |
| StepCard       | ドラッグ   | `opacity: 0.7` + カーソル `grabbing`          | 即時           |
| StepCard       | ドロップ   | 挿入位置に slide-in                           | 200ms ease-out |
| ステップ追加   | クリック   | 新 StepCard が `opacity 0→1` + `scale(0.9→1)` | 300ms ease-out |
| 実行中ステップ | 実行時     | ボーダーパルス `opacity 0.5→1→0.5`            | 1.5s 周期      |
| 接続線         | 実行進行中 | ストロークダッシュアニメーション              | 連続           |

---

## 3B. ScheduleManager（スケジュール管理）

### 画面構成図

```
+----------------------------------------------------------+
| スケジュール管理                 [+ 新規スケジュール]     |
+----------------------------------------------------------+
| スケジュール一覧                                          |
| +-------------------------------------------------------+ |
| | ツール名       | スケジュール   | 次回実行   | 状態  | |
| |----------------|---------------|------------|-------| |
| | コードレビュー | 毎日 9:00     | 明日 9:00  | [ON]  | |
| | テスト実行     | 平日 18:00    | 月曜 18:00 | [ON]  | |
| | バックアップ   | 毎週月曜 6:00 | 来週月曜   | [OFF] | |
| +-------------------------------------------------------+ |
|                                                           |
| ---- スケジュール詳細（行選択時に展開）----               |
| +-------------------------------------------------------+ |
| | コードレビュー                                        | |
| | プロンプト: 「最新のコミットをレビューして」          | |
| |                                                       | |
| | 実行履歴:                                             | |
| | 2/22 9:00 ✓ 成功 (3.2s)                              | |
| | 2/21 9:00 ✓ 成功 (2.8s)                              | |
| | 2/20 9:00 ✗ エラー (タイムアウト)                     | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

### コンポーネント構成

```
ScheduleManager/
├── ScheduleManager.tsx              # メインレイアウト（organisms）
├── ScheduleTable.tsx                # スケジュール一覧テーブル（molecules）
├── ScheduleRow.tsx                  # テーブル行（molecules）
├── ScheduleDetailPanel.tsx          # 詳細展開パネル（molecules）
├── ScheduleDialog/
│   ├── ScheduleDialog.tsx           # 新規/編集ダイアログ（organisms）
│   ├── CronEditor.tsx              # Cron 式エディター（molecules）
│   └── CronPresetList.tsx          # プリセット一覧（atoms）
├── RunHistoryList.tsx               # 実行履歴リスト（molecules）
└── hooks/
    ├── useScheduleList.ts           # スケジュール一覧取得・管理
    └── useScheduleEditor.ts        # スケジュール作成・編集ロジック
```

### CronEditor コンポーネント

```typescript
interface CronEditorProps {
  value: string; // Cron 式
  onChange: (cron: string) => void;
}
```

**プリセット**:

| ラベル        | Cron 式       |
| ------------- | ------------- |
| 毎日 9:00     | `0 9 * * *`   |
| 平日 9:00     | `0 9 * * 1-5` |
| 毎時          | `0 * * * *`   |
| 毎週月曜 9:00 | `0 9 * * 1`   |

**カスタム入力**: 分 / 時 / 日 / 月 / 曜日のセレクトボックス群 + Cron 式プレビュー

### マイクロインタラクション

| 対象          | トリガー | アニメーション                       | 時間           |
| ------------- | -------- | ------------------------------------ | -------------- |
| ScheduleRow   | hover    | 背景色 `var(--bg-hover)`             | 100ms          |
| ON/OFF トグル | クリック | スライド + 色変化（accent ↔ gray）   | 200ms ease-out |
| 詳細パネル    | 展開     | `max-height` トランジション          | 300ms ease-out |
| 実行履歴の行  | 追加     | `opacity 0→1` + `translateY(-8px→0)` | 200ms ease-out |

---

## 3C. DebugPanel（デバッグパネル）

### 画面構成図

```
+----------------------------------------------------------+
| デバッグ                   [▶ 続行] [⏭ ステップ] [⏹ 停止] |
+----------------------------------------------------------+
| 左パネル (flex-1)               | 右パネル (320px)        |
| +-----------------------------+ | +--------------------+  |
| | コールスタック               | | | 変数ウォッチ       |  |
| | ├── my-skill (running)      | | | prompt: "Review.." |  |
| | │   ├── agent-main          | | | result: null       |  |
| | │   │   └── Read (paused)   | | | tools: ["Read"]    |  |
| | │   └── ...                 | | +--------------------+  |
| +-----------------------------+ | +--------------------+  |
| | ステップ履歴                 | | | ブレークポイント   |  |
| | #1 PreToolUse: Read ✓ 0.3s  | | | ☑ tool: Read       |  |
| | #2 PostToolUse: Read ✓ 1.2s | | | ☑ hook: PreToolUse |  |
| | #3 PreToolUse: Write ⏸ ...  | | | ☐ step: #5         |  |
| +-----------------------------+ | +--------------------+  |
| +-----------------------------+ |                         |
| | 出力コンソール               | |                        |
| | > Reading file: src/app.ts  | |                         |
| | > File content (234 lines)  | |                         |
| +-----------------------------+ |                         |
+-----------------------------------------------------------+
```

### コンポーネント構成

```
DebugPanel/
├── DebugPanel.tsx                   # メインレイアウト（organisms）
├── DebugControls.tsx                # 実行コントロールバー（molecules）
├── CallStackView.tsx                # コールスタックツリー（molecules）
├── StepHistoryList.tsx              # ステップ履歴リスト（molecules）
├── OutputConsole.tsx                # 出力コンソール（molecules）
├── VariableWatch/
│   ├── VariableWatch.tsx           # 変数ウォッチパネル（molecules）
│   └── VariableNode.tsx            # 変数ツリーノード（atoms）
├── BreakpointEditor/
│   ├── BreakpointEditor.tsx        # ブレークポイント管理（molecules）
│   └── BreakpointRow.tsx           # ブレークポイント行（atoms）
├── StartDebugDialog.tsx             # デバッグ開始ダイアログ（organisms）
└── hooks/
    ├── useDebugSession.ts           # デバッグセッション管理
    └── useBreakpoints.ts           # ブレークポイント管理
```

### DebugControls コンポーネント

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

| ボタン         | アイコン（lucide-react） | ショートカット | 有効条件          |
| -------------- | ------------------------ | -------------- | ----------------- |
| 続行           | `Play`                   | `F5`           | paused            |
| ステップ       | `SkipForward`            | `F10`          | paused            |
| ステップイン   | `ArrowDownToLine`        | `F11`          | paused            |
| ステップアウト | `ArrowUpFromLine`        | `Shift+F11`    | paused            |
| 一時停止       | `Pause`                  | `F6`           | running           |
| 停止           | `Square`                 | `Shift+F5`     | running or paused |

### skill:debug:event のイベント購読（P5 対策）

DebugPanel は `skill:debug:event` チャネルを `safeOn` で購読し、デバッグイベント（ステップ実行、ブレークポイントヒット、変数変更等）をリアルタイムで受信する。

#### 購読パターン（React StrictMode 対応）

P5（リスナー二重登録）を防止するため、`useEffect` のクリーンアップ関数でリスナーを解除する:

```typescript
// DebugPanel のイベント購読パターン（P5 対策）
useEffect(() => {
  // safeOn はクリーンアップ関数を返す
  const cleanup = window.electronAPI.skill.onDebugEvent((event: DebugEvent) => {
    switch (event.type) {
      case "step":
        setCurrentStep(event.step);
        break;
      case "breakpoint-hit":
        setSessionStatus("paused");
        setCurrentBreakpoint(event.breakpoint);
        break;
      case "variable-changed":
        setVariables((prev) => ({ ...prev, [event.path]: event.value }));
        break;
      case "session-ended":
        setSessionStatus(event.error ? "error" : "completed");
        break;
    }
  });

  // StrictMode 対策: アンマウント時にリスナーを確実に解除
  return () => cleanup();
}, []); // 依存配列は空 — リスナーはマウント時に一度だけ登録
```

#### 注意事項

1. **React StrictMode**: 開発環境では `useEffect` が2回実行される。`cleanup()` 関数で確実にリスナーを解除しないと、リスナーが二重登録される（P5 パターン）
2. **safeOn の戻り値**: `safeOn` は解除関数（`() => void`）を返す。この戻り値を `useEffect` の return で呼び出す
3. **DebugEvent 型**: task-9h で定義される `DebugEvent` 型を使用する。IPC 経由のため Date フィールドは ISO 8601 文字列（Gap 1 方針）
4. **Preload 側の定義**: `safeOn(IPC_CHANNELS.SKILL_DEBUG_EVENT, callback)` として実装。IPC_CHANNELS 定数を使用する（ハードコード文字列禁止 -- P27 対策）

#### Preload API 定義

```typescript
// Preload API（contextBridge 経由で公開）
interface SkillAPI {
  // ... 既存メソッド ...

  /** デバッグイベントの購読（Main → Renderer プッシュ通知） */
  onDebugEvent: (callback: (event: DebugEvent) => void) => () => void;
  // 戻り値は解除関数（safeOn パターン）
}
```

### マイクロインタラクション

| 対象                 | トリガー   | アニメーション                                | 時間  |
| -------------------- | ---------- | --------------------------------------------- | ----- |
| コールスタック行     | ブレーク時 | 背景ハイライト `var(--status-warning-subtle)` | 300ms |
| ステップ履歴行       | 追加       | `opacity 0→1` + `translateY(-4px→0)`          | 200ms |
| 変数値               | 変更       | 値テキストが `var(--color-accent)` で点滅     | 500ms |
| 出力コンソール行     | 追加       | テキスト一行ずつ append                       | 即時  |
| DebugControls ボタン | hover      | `scale(1.05)`                                 | 100ms |
| DebugControls ボタン | active     | `scale(0.95)`                                 | 即時  |

---

## 3D. AnalyticsDashboard（使用分析ダッシュボード）

### 画面構成図

```
+----------------------------------------------------------+
| 使用分析                    期間: [過去7日 ▼] [エクスポート] |
+----------------------------------------------------------+
| サマリーカード                                             |
| +-------------+ +-------------+ +-------------+           |
| | 総実行回数  | | 成功率      | | 平均実行時間|           |
| | 156         | | 94.2%       | | 3.4秒       |           |
| | ↑12% (先週比)| | ↓0.3%      | | ↑0.2秒      |           |
| +-------------+ +-------------+ +-------------+           |
|                                                           |
| 使用トレンド                                               |
| +-------------------------------------------------------+ |
| |     ╱╲                                                | |
| |    ╱  ╲    ╱╲                                        | |
| |   ╱    ╲  ╱  ╲                       ╱╲              | |
| |  ╱      ╲╱    ╲─────────────╱╲╱   ╲╱  ╲            | |
| | ╱                          ╱                ╲          | |
| | Mon  Tue  Wed  Thu  Fri  Sat  Sun                     | |
| +-------------------------------------------------------+ |
|                                                           |
| ツール使用ランキング                                       |
| +-------------------------------------------------------+ |
| | 1. コードレビュー      ████████████████████  45回      | |
| | 2. テスト生成          ████████████          28回      | |
| | 3. リファクタリング    ██████████            22回      | |
| | 4. ドキュメント生成    ████████              18回      | |
| | 5. データ分析          ██████                12回      | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

### コンポーネント構成

```
AnalyticsDashboard/
├── AnalyticsDashboard.tsx           # メインレイアウト（organisms）
├── SummaryCards/
│   ├── SummaryCards.tsx             # サマリーカード群（molecules）
│   └── SummaryCard.tsx            # 個別サマリーカード（atoms）
├── UsageChart/
│   ├── UsageChart.tsx              # トレンドチャート（molecules）
│   └── ChartTooltip.tsx           # ツールチップ（atoms）
├── SkillRanking.tsx                 # ツール使用ランキング（molecules）
├── PeriodSelector.tsx               # 期間セレクター（atoms）
├── ExportButton.tsx                 # エクスポートボタン（atoms）
└── hooks/
    ├── useAnalyticsSummary.ts       # サマリーデータ取得
    └── useUsageTrend.ts            # トレンドデータ取得
```

### SummaryCard コンポーネント

```typescript
interface SummaryCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    direction: "up" | "down" | "flat";
    percentage: number;
    label: string; // 例: "先週比"
  };
  icon: LucideIcon;
}
```

| 属性         | 値                                              |
| ------------ | ----------------------------------------------- |
| カードサイズ | `min-h-100px`, flex-1                           |
| 値フォント   | `text-3xl`, `font-bold`                         |
| トレンド↑    | `var(--status-success)` + `TrendingUp` アイコン |
| トレンド↓    | `var(--status-error)` + `TrendingDown` アイコン |

### UsageChart コンポーネント

```typescript
interface UsageChartProps {
  data: TrendDataPoint[];
  granularity: "hour" | "day" | "week" | "month";
  height?: number; // デフォルト 280px
}
```

- **ライブラリ**: recharts（`ResponsiveContainer` + `LineChart` + `Tooltip`）
- **テーマ色**: `var(--color-accent)` を主線に使用
- **グリッド**: `var(--border-primary)` で薄い水平線
- **ツールチップ**: カスタム `ChartTooltip` で実行回数・エラー数・平均時間を表示

### SkillRanking コンポーネント

```typescript
interface SkillRankingProps {
  skills: SkillUsageSummary[];
  maxItems?: number; // デフォルト 10
}
```

- 水平バーチャート（CSS `width: ${percentage}%`）
- バー色: `var(--color-accent)` のグラデーション
- ホバー時: バーが `opacity 0.7→1` + 実行数ツールチップ

### マイクロインタラクション

| 対象              | トリガー     | アニメーション                           | 時間            |
| ----------------- | ------------ | ---------------------------------------- | --------------- |
| SummaryCard       | 初期表示     | カウントアップアニメーション（0→実際値） | 800ms ease-out  |
| SummaryCard       | hover        | `scale(1.02)` + `shadow-md`              | 200ms ease-out  |
| UsageChart        | 初期表示     | 折れ線が左から右にドロー                 | 1000ms ease-out |
| SkillRanking バー | 初期表示     | バー幅が `0%→実際値%`                    | 600ms ease-out  |
| SkillRanking バー | hover        | `opacity 0.7→1`                          | 100ms           |
| 期間切替          | セレクト変更 | チャート crossFade                       | 200ms           |

---

## 4. レスポンシブ設計

### 全ビュー共通

| ブレークポイント | レイアウト                  | サイドパネル           |
| ---------------- | --------------------------- | ---------------------- |
| >= 1024px        | 左右分割（メイン + サイド） | 右パネル 320px         |
| 768px〜1023px    | 上下分割                    | 下部に折りたたみパネル |
| < 768px          | 単一カラム                  | ボトムシート（85vh）   |

### ビュー固有

| ビュー          | デスクトップ                   | モバイル                           |
| --------------- | ------------------------------ | ---------------------------------- |
| ChainBuilder    | StepCard を水平配置            | StepCard を垂直配置                |
| ScheduleManager | テーブルレイアウト             | カードリスト形式                   |
| DebugPanel      | 左右2ペイン                    | タブ切替（スタック/変数/出力）     |
| Analytics       | カード3列 + フルワイドチャート | カード1列 + スクロール可能チャート |

## 5. テスト構成

### テストファイル

```
apps/desktop/src/renderer/
├── views/SkillChainBuilder/__tests__/
│   ├── SkillChainBuilder.test.tsx
│   ├── StepCard.test.tsx
│   ├── StepEditor.test.tsx
│   └── useChainEditor.test.ts
├── views/ScheduleManager/__tests__/
│   ├── ScheduleManager.test.tsx
│   ├── CronEditor.test.tsx
│   └── useScheduleList.test.ts
├── views/DebugPanel/__tests__/
│   ├── DebugPanel.test.tsx
│   ├── DebugControls.test.tsx
│   ├── BreakpointEditor.test.tsx
│   └── useDebugSession.test.ts
└── views/AnalyticsDashboard/__tests__/
    ├── AnalyticsDashboard.test.tsx
    ├── SummaryCard.test.tsx
    ├── UsageChart.test.tsx
    └── useAnalyticsSummary.test.ts
```

### P31/P39/P40 対策

| Pitfall | 対策                                                            |
| ------- | --------------------------------------------------------------- |
| **P31** | agentSlice からは個別セレクタ使用                               |
| **P39** | happy-dom 環境では `fireEvent` 使用、`userEvent` 禁止           |
| **P40** | テスト実行は `cd apps/desktop` から実行                         |
| **P13** | ScheduleManager のタイマーテストでは `advanceTimersByTime` 使用 |

## 6. 完了条件

### 3A: ChainBuilder

- [ ] チェーン一覧がカード形式で表示される
- [ ] ステップカードの追加・削除・並び替えが動作する
- [ ] 入力マッピング（literal/variable/template/previousOutput）が設定可能
- [ ] チェーンの保存・読み込みが動作する
- [ ] チェーン実行時にステップ進行がビジュアルに表示される
- [ ] エラーハンドリング設定（stop/skip/retry）が機能する

### 3B: ScheduleManager

- [ ] スケジュール一覧がテーブル/カード形式で表示される
- [ ] CronEditor でスケジュール設定が可能
- [ ] プリセット選択が動作する
- [ ] ON/OFF トグルでスケジュール有効/無効が切替可能
- [ ] 実行履歴が表示される
- [ ] 次回実行時刻が正確に表示される

### 3C: DebugPanel

- [ ] デバッグセッションが開始・停止できる
- [ ] コールスタックがツリー形式で表示される
- [ ] 変数ウォッチで値がリアルタイム更新される
- [ ] ブレークポイントの追加・削除・有効/無効トグルが動作する
- [ ] ステップ実行（Continue/StepOver/StepInto/StepOut）が動作する
- [ ] 出力コンソールにログが表示される

### 3D: AnalyticsDashboard

- [ ] サマリーカードに総実行回数・成功率・平均時間が表示される
- [ ] カウントアップアニメーションが動作する
- [ ] 使用トレンドチャートが表示される
- [ ] ツール使用ランキングがバーチャートで表示される
- [ ] 期間フィルター（過去7日/30日/90日）が動作する
- [ ] CSV/JSON エクスポートが動作する

### 共通品質

- [ ] 全ビューの EmptyState が正しく表示される
- [ ] 全ビューのローディングスケルトンが表示される
- [ ] 全コンポーネントテストが PASS する
- [ ] レスポンシブ対応（デスクトップ/タブレット/モバイル）が動作する
- [ ] lucide-react アイコンのみ使用（絵文字不使用）

## 7. 既知の落とし穴・教訓

| Pitfall | 該当箇所               | 対策                                                         |
| ------- | ---------------------- | ------------------------------------------------------------ |
| **P13** | タイマーテスト         | `advanceTimersByTime` で1ステップずつ（`runAllTimers` 禁止） |
| **P31** | agentSlice セレクタ    | 個別セレクタ使用                                             |
| **P39** | テスト環境             | happy-dom 環境では `fireEvent` 使用、`userEvent` 禁止        |
| **P40** | テスト実行ディレクトリ | `cd apps/desktop` から実行                                   |

## 8. 参照資料

| 資料                     | パス / タスク ID                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------- |
| デザイン基盤             | TASK-UI-00 `00-ui-design-foundation.md`                                                |
| UI アーキテクチャ        | TASK-UI-01 `01-store-ipc-architecture.md`                                              |
| スキルセンター画面       | TASK-UI-05 `05-skill-center-view.md`                                                   |
| チェーンバックエンド     | TASK-9D [task-023e-task-9d-skill-chain.md](./task-023e-task-9d-skill-chain.md)         |
| スケジュールバックエンド | TASK-9G [task-023a-task-9g-skill-schedule.md](./task-023a-task-9g-skill-schedule.md)   |
| デバッグバックエンド     | TASK-9H [task-023b-task-9h-skill-debug.md](./task-023b-task-9h-skill-debug.md)         |
| 分析バックエンド         | TASK-9J [task-023d-task-9j-skill-analytics.md](./task-023d-task-9j-skill-analytics.md) |

## 9. 次の Phase

- TASK-UI-05（スキルセンター）完了後に実装開始が理想
- 各セクション（3A〜3D）は対応する TASK-9 バックエンドと **並列実装可能**
- TASK-UI-05A（エディター）とも **並列実装可能**
