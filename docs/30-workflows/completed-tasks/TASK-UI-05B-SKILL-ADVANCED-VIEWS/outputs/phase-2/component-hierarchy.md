# Phase 2 成果物: コンポーネント階層図

## メタ情報

| 項目            | 値                                |
| --------------- | --------------------------------- |
| タスク ID       | TASK-UI-05B-SKILL-ADVANCED-VIEWS  |
| Phase           | 2（設計）                         |
| 成果物          | component-hierarchy.md            |
| 作成日          | 2026-03-02                        |
| 前 Phase 成果物 | `outputs/phase-1/` (要件定義書等) |

---

## 1. 全体ファイルツリー

```
apps/desktop/src/renderer/views/
├── SkillChainBuilder/           # 3A: パイプラインビルダー (7コンポーネント + 2 hooks)
├── ScheduleManager/             # 3B: スケジュール管理 (8コンポーネント + 2 hooks)
├── DebugPanel/                  # 3C: デバッグパネル (10コンポーネント + 2 hooks)
└── AnalyticsDashboard/          # 3D: 使用分析ダッシュボード (8コンポーネント + 2 hooks)
```

合計: **33コンポーネント + 8 hooks**

---

## 2. 3A: SkillChainBuilder（7コンポーネント + 2 hooks）

### ファイルツリー

```
apps/desktop/src/renderer/views/SkillChainBuilder/
├── SkillChainBuilder.tsx          # [organisms] メインレイアウト・ビュー統合
├── ChainCardGrid.tsx              # [molecules] チェーン一覧カード表示
├── ChainEditor/
│   ├── ChainEditor.tsx            # [organisms] パイプラインエディター
│   ├── StepCard.tsx               # [molecules] ステップカード表示
│   ├── StepConnector.tsx          # [atoms]     ステップ間矢印 SVG
│   └── StepEditor.tsx             # [molecules] ステップ詳細設定パネル
├── CreateChainDialog.tsx          # [organisms] 新規チェーン作成ダイアログ
├── __tests__/
│   ├── SkillChainBuilder.test.tsx
│   ├── StepCard.test.tsx
│   ├── StepEditor.test.tsx
│   └── useChainEditor.test.ts
└── hooks/
    ├── useChainList.ts            # チェーン一覧取得・管理
    └── useChainEditor.ts          # チェーン編集・実行ロジック
```

### Atomic Design 層分け

| コンポーネント    | 層        | 責務                         |
| ----------------- | --------- | ---------------------------- |
| SkillChainBuilder | organisms | メインレイアウト・ビュー統合 |
| ChainCardGrid     | molecules | チェーン一覧カード表示       |
| ChainEditor       | organisms | パイプラインエディター       |
| StepCard          | molecules | ステップカード表示           |
| StepConnector     | atoms     | ステップ間矢印 SVG           |
| StepEditor        | molecules | ステップ詳細設定パネル       |
| CreateChainDialog | organisms | 新規チェーン作成ダイアログ   |

### カスタム Hooks

| Hook           | 責務                       |
| -------------- | -------------------------- |
| useChainList   | チェーン一覧取得・管理     |
| useChainEditor | チェーン編集・実行ロジック |

### コンポーネント依存関係

```
SkillChainBuilder (organisms)
├── ChainCardGrid (molecules)
│   └── EmptyState (共通)
├── ChainEditor (organisms)
│   ├── StepCard (molecules)
│   ├── StepConnector (atoms)
│   └── StepEditor (molecules)
├── CreateChainDialog (organisms)
├── useChainList (hook)
└── useChainEditor (hook)
```

---

## 3. 3B: ScheduleManager（8コンポーネント + 2 hooks）

### ファイルツリー

```
apps/desktop/src/renderer/views/ScheduleManager/
├── ScheduleManager.tsx            # [organisms] メインレイアウト・ビュー統合
├── ScheduleTable.tsx              # [molecules] スケジュール一覧テーブル
├── ScheduleRow.tsx                # [molecules] テーブル行
├── ScheduleDetailPanel.tsx        # [molecules] 詳細展開パネル
├── ScheduleDialog/
│   ├── ScheduleDialog.tsx         # [organisms] 新規/編集ダイアログ
│   ├── CronEditor.tsx             # [molecules] Cron 式エディター
│   └── CronPresetList.tsx         # [atoms]     プリセット一覧
├── RunHistoryList.tsx             # [molecules] 実行履歴リスト
├── __tests__/
│   ├── ScheduleManager.test.tsx
│   ├── CronEditor.test.tsx
│   └── useScheduleList.test.ts
└── hooks/
    ├── useScheduleList.ts         # スケジュール一覧取得・管理
    └── useScheduleEditor.ts       # スケジュール作成・編集ロジック
```

### Atomic Design 層分け

| コンポーネント      | 層        | 責務                         |
| ------------------- | --------- | ---------------------------- |
| ScheduleManager     | organisms | メインレイアウト・ビュー統合 |
| ScheduleTable       | molecules | スケジュール一覧テーブル     |
| ScheduleRow         | molecules | テーブル行                   |
| ScheduleDetailPanel | molecules | 詳細展開パネル               |
| ScheduleDialog      | organisms | 新規/編集ダイアログ          |
| CronEditor          | molecules | Cron 式エディター            |
| CronPresetList      | atoms     | プリセット一覧               |
| RunHistoryList      | molecules | 実行履歴リスト               |

### カスタム Hooks

| Hook              | 責務                           |
| ----------------- | ------------------------------ |
| useScheduleList   | スケジュール一覧取得・管理     |
| useScheduleEditor | スケジュール作成・編集ロジック |

### コンポーネント依存関係

```
ScheduleManager (organisms)
├── ScheduleTable (molecules)
│   ├── ScheduleRow (molecules)
│   └── EmptyState (共通)
├── ScheduleDetailPanel (molecules)
│   └── RunHistoryList (molecules)
├── ScheduleDialog (organisms)
│   ├── CronEditor (molecules)
│   │   └── CronPresetList (atoms)
│   └── ...
├── useScheduleList (hook)
└── useScheduleEditor (hook)
```

---

## 4. 3C: DebugPanel（10コンポーネント + 2 hooks）

### ファイルツリー

```
apps/desktop/src/renderer/views/DebugPanel/
├── DebugPanel.tsx                 # [organisms] メインレイアウト・ビュー統合
├── DebugControls.tsx              # [molecules] 実行コントロールバー
├── CallStackView.tsx              # [molecules] コールスタックツリー
├── StepHistoryList.tsx            # [molecules] ステップ履歴リスト
├── OutputConsole.tsx              # [molecules] 出力コンソール
├── VariableWatch/
│   ├── VariableWatch.tsx          # [molecules] 変数ウォッチパネル
│   └── VariableNode.tsx           # [atoms]     変数ツリーノード
├── BreakpointEditor/
│   ├── BreakpointEditor.tsx       # [molecules] ブレークポイント管理
│   └── BreakpointRow.tsx          # [atoms]     ブレークポイント行
├── StartDebugDialog.tsx           # [organisms] デバッグ開始ダイアログ
├── __tests__/
│   ├── DebugPanel.test.tsx
│   ├── DebugControls.test.tsx
│   ├── BreakpointEditor.test.tsx
│   └── useDebugSession.test.ts
└── hooks/
    ├── useDebugSession.ts         # デバッグセッション管理
    └── useBreakpoints.ts          # ブレークポイント管理
```

### Atomic Design 層分け

| コンポーネント   | 層        | 責務                         |
| ---------------- | --------- | ---------------------------- |
| DebugPanel       | organisms | メインレイアウト・ビュー統合 |
| DebugControls    | molecules | 実行コントロールバー         |
| CallStackView    | molecules | コールスタックツリー         |
| StepHistoryList  | molecules | ステップ履歴リスト           |
| OutputConsole    | molecules | 出力コンソール               |
| VariableWatch    | molecules | 変数ウォッチパネル           |
| VariableNode     | atoms     | 変数ツリーノード             |
| BreakpointEditor | molecules | ブレークポイント管理         |
| BreakpointRow    | atoms     | ブレークポイント行           |
| StartDebugDialog | organisms | デバッグ開始ダイアログ       |

### カスタム Hooks

| Hook            | 責務                   |
| --------------- | ---------------------- |
| useDebugSession | デバッグセッション管理 |
| useBreakpoints  | ブレークポイント管理   |

### コンポーネント依存関係

```
DebugPanel (organisms)
├── DebugControls (molecules)
├── CallStackView (molecules)
├── StepHistoryList (molecules)
├── OutputConsole (molecules)
├── VariableWatch (molecules)
│   └── VariableNode (atoms) [再帰]
├── BreakpointEditor (molecules)
│   └── BreakpointRow (atoms)
├── StartDebugDialog (organisms)
├── useDebugSession (hook)
│   └── safeOn(skill:debug:event) イベント購読
└── useBreakpoints (hook)
```

---

## 5. 3D: AnalyticsDashboard（8コンポーネント + 2 hooks）

### ファイルツリー

```
apps/desktop/src/renderer/views/AnalyticsDashboard/
├── AnalyticsDashboard.tsx         # [organisms] メインレイアウト・ビュー統合
├── SummaryCards/
│   ├── SummaryCards.tsx            # [molecules] サマリーカード群
│   └── SummaryCard.tsx            # [atoms]     個別サマリーカード
├── UsageChart/
│   ├── UsageChart.tsx             # [molecules] トレンドチャート
│   └── ChartTooltip.tsx           # [atoms]     ツールチップ
├── SkillRanking.tsx               # [molecules] ツール使用ランキング
├── PeriodSelector.tsx             # [atoms]     期間セレクター
├── ExportButton.tsx               # [atoms]     エクスポートボタン
├── __tests__/
│   ├── AnalyticsDashboard.test.tsx
│   ├── SummaryCard.test.tsx
│   ├── UsageChart.test.tsx
│   └── useAnalyticsSummary.test.ts
└── hooks/
    ├── useAnalyticsSummary.ts     # サマリーデータ取得
    └── useUsageTrend.ts           # トレンドデータ取得
```

### Atomic Design 層分け

| コンポーネント     | 層        | 責務                         |
| ------------------ | --------- | ---------------------------- |
| AnalyticsDashboard | organisms | メインレイアウト・ビュー統合 |
| SummaryCards       | molecules | サマリーカード群             |
| SummaryCard        | atoms     | 個別サマリーカード           |
| UsageChart         | molecules | トレンドチャート             |
| ChartTooltip       | atoms     | ツールチップ                 |
| SkillRanking       | molecules | ツール使用ランキング         |
| PeriodSelector     | atoms     | 期間セレクター               |
| ExportButton       | atoms     | エクスポートボタン           |

### カスタム Hooks

| Hook                | 責務               |
| ------------------- | ------------------ |
| useAnalyticsSummary | サマリーデータ取得 |
| useUsageTrend       | トレンドデータ取得 |

### コンポーネント依存関係

```
AnalyticsDashboard (organisms)
├── PeriodSelector (atoms)
├── ExportButton (atoms)
├── SummaryCards (molecules)
│   └── SummaryCard (atoms)
├── UsageChart (molecules)
│   └── ChartTooltip (atoms)
│   └── recharts (ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend)
├── SkillRanking (molecules)
├── useAnalyticsSummary (hook)
└── useUsageTrend (hook)
```

---

## 6. Atomic Design 層集計

### 層別コンポーネント数

| 層        | 3A  | 3B  | 3C  | 3D  | 合計   |
| --------- | --- | --- | --- | --- | ------ |
| atoms     | 1   | 1   | 2   | 4   | 8      |
| molecules | 3   | 5   | 6   | 3   | 17     |
| organisms | 3   | 2   | 2   | 1   | 8      |
| **計**    | 7   | 8   | 10  | 8   | **33** |

### 層別一覧

#### atoms（8コンポーネント）

| コンポーネント | ビュー | ファイルパス                                              |
| -------------- | ------ | --------------------------------------------------------- |
| StepConnector  | 3A     | `views/SkillChainBuilder/ChainEditor/StepConnector.tsx`   |
| CronPresetList | 3B     | `views/ScheduleManager/ScheduleDialog/CronPresetList.tsx` |
| VariableNode   | 3C     | `views/DebugPanel/VariableWatch/VariableNode.tsx`         |
| BreakpointRow  | 3C     | `views/DebugPanel/BreakpointEditor/BreakpointRow.tsx`     |
| SummaryCard    | 3D     | `views/AnalyticsDashboard/SummaryCards/SummaryCard.tsx`   |
| ChartTooltip   | 3D     | `views/AnalyticsDashboard/UsageChart/ChartTooltip.tsx`    |
| PeriodSelector | 3D     | `views/AnalyticsDashboard/PeriodSelector.tsx`             |
| ExportButton   | 3D     | `views/AnalyticsDashboard/ExportButton.tsx`               |

#### molecules（17コンポーネント）

| コンポーネント      | ビュー | ファイルパス                                             |
| ------------------- | ------ | -------------------------------------------------------- |
| ChainCardGrid       | 3A     | `views/SkillChainBuilder/ChainCardGrid.tsx`              |
| StepCard            | 3A     | `views/SkillChainBuilder/ChainEditor/StepCard.tsx`       |
| StepEditor          | 3A     | `views/SkillChainBuilder/ChainEditor/StepEditor.tsx`     |
| ScheduleTable       | 3B     | `views/ScheduleManager/ScheduleTable.tsx`                |
| ScheduleRow         | 3B     | `views/ScheduleManager/ScheduleRow.tsx`                  |
| ScheduleDetailPanel | 3B     | `views/ScheduleManager/ScheduleDetailPanel.tsx`          |
| CronEditor          | 3B     | `views/ScheduleManager/ScheduleDialog/CronEditor.tsx`    |
| RunHistoryList      | 3B     | `views/ScheduleManager/RunHistoryList.tsx`               |
| DebugControls       | 3C     | `views/DebugPanel/DebugControls.tsx`                     |
| CallStackView       | 3C     | `views/DebugPanel/CallStackView.tsx`                     |
| StepHistoryList     | 3C     | `views/DebugPanel/StepHistoryList.tsx`                   |
| OutputConsole       | 3C     | `views/DebugPanel/OutputConsole.tsx`                     |
| VariableWatch       | 3C     | `views/DebugPanel/VariableWatch/VariableWatch.tsx`       |
| BreakpointEditor    | 3C     | `views/DebugPanel/BreakpointEditor/BreakpointEditor.tsx` |
| SummaryCards        | 3D     | `views/AnalyticsDashboard/SummaryCards/SummaryCards.tsx` |
| UsageChart          | 3D     | `views/AnalyticsDashboard/UsageChart/UsageChart.tsx`     |
| SkillRanking        | 3D     | `views/AnalyticsDashboard/SkillRanking.tsx`              |

#### organisms（8コンポーネント）

| コンポーネント     | ビュー | ファイルパス                                              |
| ------------------ | ------ | --------------------------------------------------------- |
| SkillChainBuilder  | 3A     | `views/SkillChainBuilder/SkillChainBuilder.tsx`           |
| ChainEditor        | 3A     | `views/SkillChainBuilder/ChainEditor/ChainEditor.tsx`     |
| CreateChainDialog  | 3A     | `views/SkillChainBuilder/CreateChainDialog.tsx`           |
| ScheduleManager    | 3B     | `views/ScheduleManager/ScheduleManager.tsx`               |
| ScheduleDialog     | 3B     | `views/ScheduleManager/ScheduleDialog/ScheduleDialog.tsx` |
| DebugPanel         | 3C     | `views/DebugPanel/DebugPanel.tsx`                         |
| StartDebugDialog   | 3C     | `views/DebugPanel/StartDebugDialog.tsx`                   |
| AnalyticsDashboard | 3D     | `views/AnalyticsDashboard/AnalyticsDashboard.tsx`         |

---

## 7. テストファイル一覧

```
apps/desktop/src/renderer/views/
├── SkillChainBuilder/__tests__/
│   ├── SkillChainBuilder.test.tsx     # organisms テスト
│   ├── StepCard.test.tsx              # molecules テスト
│   ├── StepEditor.test.tsx            # molecules テスト
│   └── useChainEditor.test.ts         # hook テスト
├── ScheduleManager/__tests__/
│   ├── ScheduleManager.test.tsx       # organisms テスト
│   ├── CronEditor.test.tsx            # molecules テスト
│   └── useScheduleList.test.ts        # hook テスト
├── DebugPanel/__tests__/
│   ├── DebugPanel.test.tsx            # organisms テスト
│   ├── DebugControls.test.tsx         # molecules テスト
│   ├── BreakpointEditor.test.tsx      # molecules テスト
│   └── useDebugSession.test.ts        # hook テスト
└── AnalyticsDashboard/__tests__/
    ├── AnalyticsDashboard.test.tsx     # organisms テスト
    ├── SummaryCard.test.tsx            # atoms テスト
    ├── UsageChart.test.tsx             # molecules テスト
    └── useAnalyticsSummary.test.ts     # hook テスト
```

合計: **16テストファイル**（コンポーネントテスト12 + hookテスト4）

---

## 8. 共通依存コンポーネント

全4ビューが共通で使用する外部コンポーネント:

| コンポーネント | 配置先         | 用途                                     |
| -------------- | -------------- | ---------------------------------------- |
| EmptyState     | 既存共通       | データなし時のフォールバック表示         |
| Loading        | 既存共通       | スケルトンローディング表示               |
| lucide-react   | 外部ライブラリ | 全アイコン表示                           |
| recharts       | 外部ライブラリ | 3D AnalyticsDashboard のチャート描画のみ |
