# Phase 2: 設計 — TASK-UI-05B-SKILL-ADVANCED-VIEWS

## メタ情報

| 項目            | 値                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| タスク ID       | TASK-UI-05B-SKILL-ADVANCED-VIEWS                                                                                              |
| Phase           | 2（設計）                                                                                                                     |
| ステータス      | pending                                                                                                                       |
| 前 Phase 成果物 | `outputs/phase-1/requirements-definition.md`, `outputs/phase-1/acceptance-criteria.md`, `outputs/phase-1/scope-definition.md` |

## 目的

Phase 1 の要件定義を基に、4ビュー（3A〜3D）のコンポーネントアーキテクチャ（Atomic Design 層分け）、状態管理設計（Zustand agentSlice 拡張 or 新規 Slice）、IPC インターフェース設計（Preload API 定義、チャネルホワイトリスト）、レスポンシブ設計、マイクロインタラクション設計、recharts 統合設計を行う。

## 実行タスク

- UIアーキテクチャ設計: Atomic Design の層責務を 4ビューで定義する
- 状態管理設計: Zustand 個別セレクタとローカル state の責務境界を定義する
- IPC契約設計: Preload API / チャネル / 型契約を設計する
- セキュリティ設計: sender 検証・P42 バリデーションを設計へ埋め込む
- レスポンシブ設計: 3ブレークポイントごとの表示戦略を固定化する
- 共通化設計: EmptyState/Loading/Error の共通パターンを定義する
- 可視化設計: Analytics のチャート描画/アニメーション仕様を定義する

## 参照資料

| 資料                    | パス / タスク ID                                                                  |
| ----------------------- | --------------------------------------------------------------------------------- |
| Phase 1 要件定義書      | `outputs/phase-1/requirements-definition.md`                                      |
| Phase 1 受け入れ基準    | `outputs/phase-1/acceptance-criteria.md`                                          |
| Phase 1 スコープ定義    | `outputs/phase-1/scope-definition.md`                                             |
| 元タスク仕様書          | `task-031b-ui-05b-skill-advanced-views.md`                                        |
| Apple HIG カラー        | `01-architecture.md` カラーパレットセクション                                     |
| 状態管理ルール          | `03-state-management.md`                                                          |
| セキュリティルール      | `04-electron-security.md`                                                         |
| 既知の落とし穴          | `06-known-pitfalls.md`（P5, P13, P27, P31, P39, P42, P47）                        |
| 仕様抽出正本            | `spec-extraction-matrix.md`                                                       |
| aiworkflow UI基準       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           |
| aiworkflow Feature仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   |
| aiworkflow 層設計       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         |
| aiworkflow 状態管理     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      |
| aiworkflow IPC契約      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              |
| aiworkflow 型契約       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| aiworkflow セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      |
| aiworkflow サービス契約 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`     |
| aiworkflow 全体構成     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      |
| aiworkflow テスト設計   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |

## 実行手順

### Task 1: コンポーネントアーキテクチャ設計

#### Atomic Design 層分け一覧

##### 3A: SkillChainBuilder

| コンポーネント    | Atomic Design 層 | 責務                         | Props 型定義             |
| ----------------- | ---------------- | ---------------------------- | ------------------------ |
| SkillChainBuilder | organisms        | メインレイアウト・ビュー統合 | `SkillChainBuilderProps` |
| ChainCardGrid     | molecules        | チェーン一覧カード表示       | `ChainCardGridProps`     |
| ChainEditor       | organisms        | パイプラインエディター       | `ChainEditorProps`       |
| StepCard          | molecules        | ステップカード表示           | `StepCardProps`          |
| StepConnector     | atoms            | ステップ間矢印 SVG           | `StepConnectorProps`     |
| StepEditor        | molecules        | ステップ詳細設定パネル       | `StepEditorProps`        |
| CreateChainDialog | organisms        | 新規チェーン作成ダイアログ   | `CreateChainDialogProps` |

**ファイルパス:**

```
apps/desktop/src/renderer/views/SkillChainBuilder/
├── SkillChainBuilder.tsx
├── ChainCardGrid.tsx
├── ChainEditor/
│   ├── ChainEditor.tsx
│   ├── StepCard.tsx
│   ├── StepConnector.tsx
│   └── StepEditor.tsx
├── CreateChainDialog.tsx
├── __tests__/
│   ├── SkillChainBuilder.test.tsx
│   ├── StepCard.test.tsx
│   ├── StepEditor.test.tsx
│   └── useChainEditor.test.ts
└── hooks/
    ├── useChainList.ts
    └── useChainEditor.ts
```

##### 3B: ScheduleManager

| コンポーネント      | Atomic Design 層 | 責務                         | Props 型定義               |
| ------------------- | ---------------- | ---------------------------- | -------------------------- |
| ScheduleManager     | organisms        | メインレイアウト・ビュー統合 | `ScheduleManagerProps`     |
| ScheduleTable       | molecules        | スケジュール一覧テーブル     | `ScheduleTableProps`       |
| ScheduleRow         | molecules        | テーブル行                   | `ScheduleRowProps`         |
| ScheduleDetailPanel | molecules        | 詳細展開パネル               | `ScheduleDetailPanelProps` |
| ScheduleDialog      | organisms        | 新規/編集ダイアログ          | `ScheduleDialogProps`      |
| CronEditor          | molecules        | Cron 式エディター            | `CronEditorProps`          |
| CronPresetList      | atoms            | プリセット一覧               | `CronPresetListProps`      |
| RunHistoryList      | molecules        | 実行履歴リスト               | `RunHistoryListProps`      |

**ファイルパス:**

```
apps/desktop/src/renderer/views/ScheduleManager/
├── ScheduleManager.tsx
├── ScheduleTable.tsx
├── ScheduleRow.tsx
├── ScheduleDetailPanel.tsx
├── ScheduleDialog/
│   ├── ScheduleDialog.tsx
│   ├── CronEditor.tsx
│   └── CronPresetList.tsx
├── RunHistoryList.tsx
├── __tests__/
│   ├── ScheduleManager.test.tsx
│   ├── CronEditor.test.tsx
│   └── useScheduleList.test.ts
└── hooks/
    ├── useScheduleList.ts
    └── useScheduleEditor.ts
```

##### 3C: DebugPanel

| コンポーネント   | Atomic Design 層 | 責務                         | Props 型定義            |
| ---------------- | ---------------- | ---------------------------- | ----------------------- |
| DebugPanel       | organisms        | メインレイアウト・ビュー統合 | `DebugPanelProps`       |
| DebugControls    | molecules        | 実行コントロールバー         | `DebugControlsProps`    |
| CallStackView    | molecules        | コールスタックツリー         | `CallStackViewProps`    |
| StepHistoryList  | molecules        | ステップ履歴リスト           | `StepHistoryListProps`  |
| OutputConsole    | molecules        | 出力コンソール               | `OutputConsoleProps`    |
| VariableWatch    | molecules        | 変数ウォッチパネル           | `VariableWatchProps`    |
| VariableNode     | atoms            | 変数ツリーノード             | `VariableNodeProps`     |
| BreakpointEditor | molecules        | ブレークポイント管理         | `BreakpointEditorProps` |
| BreakpointRow    | atoms            | ブレークポイント行           | `BreakpointRowProps`    |
| StartDebugDialog | organisms        | デバッグ開始ダイアログ       | `StartDebugDialogProps` |

**ファイルパス:**

```
apps/desktop/src/renderer/views/DebugPanel/
├── DebugPanel.tsx
├── DebugControls.tsx
├── CallStackView.tsx
├── StepHistoryList.tsx
├── OutputConsole.tsx
├── VariableWatch/
│   ├── VariableWatch.tsx
│   └── VariableNode.tsx
├── BreakpointEditor/
│   ├── BreakpointEditor.tsx
│   └── BreakpointRow.tsx
├── StartDebugDialog.tsx
├── __tests__/
│   ├── DebugPanel.test.tsx
│   ├── DebugControls.test.tsx
│   ├── BreakpointEditor.test.tsx
│   └── useDebugSession.test.ts
└── hooks/
    ├── useDebugSession.ts
    └── useBreakpoints.ts
```

##### 3D: AnalyticsDashboard

| コンポーネント     | Atomic Design 層 | 責務                         | Props 型定義              |
| ------------------ | ---------------- | ---------------------------- | ------------------------- |
| AnalyticsDashboard | organisms        | メインレイアウト・ビュー統合 | `AnalyticsDashboardProps` |
| SummaryCards       | molecules        | サマリーカード群             | `SummaryCardsProps`       |
| SummaryCard        | atoms            | 個別サマリーカード           | `SummaryCardProps`        |
| UsageChart         | molecules        | トレンドチャート             | `UsageChartProps`         |
| ChartTooltip       | atoms            | ツールチップ                 | `ChartTooltipProps`       |
| SkillRanking       | molecules        | ツール使用ランキング         | `SkillRankingProps`       |
| PeriodSelector     | atoms            | 期間セレクター               | `PeriodSelectorProps`     |
| ExportButton       | atoms            | エクスポートボタン           | `ExportButtonProps`       |

**ファイルパス:**

```
apps/desktop/src/renderer/views/AnalyticsDashboard/
├── AnalyticsDashboard.tsx
├── SummaryCards/
│   ├── SummaryCards.tsx
│   └── SummaryCard.tsx
├── UsageChart/
│   ├── UsageChart.tsx
│   └── ChartTooltip.tsx
├── SkillRanking.tsx
├── PeriodSelector.tsx
├── ExportButton.tsx
├── __tests__/
│   ├── AnalyticsDashboard.test.tsx
│   ├── SummaryCard.test.tsx
│   ├── UsageChart.test.tsx
│   └── useAnalyticsSummary.test.ts
└── hooks/
    ├── useAnalyticsSummary.ts
    └── useUsageTrend.ts
```

#### Props 型定義

主要な Props 型は元仕様書で定義済み。追加で以下を設計する:

```typescript
// 3A: ChainBuilder
interface SkillChainBuilderProps {}
interface ChainCardGridProps {
  chains: SkillChainDefinition[];
  isLoading: boolean;
  onSelect: (chainId: string) => void;
  onExecute: (chainId: string) => void;
  onDelete: (chainId: string) => void;
}
interface ChainEditorProps {
  chain: SkillChainDefinition;
  availableSkills: Skill[];
  onSave: (chain: SkillChainDefinition) => void;
  onExecute: () => void;
  onClose: () => void;
}
interface StepCardProps {
  step: SkillChainStep;
  index: number;
  isActive: boolean;
  isExecuting: boolean;
  onSelect: () => void;
  onRemove: () => void;
}
interface StepConnectorProps {
  fromStep: number;
  toStep: number;
  isActive: boolean;
  label?: string;
}
interface StepEditorProps {
  step: SkillChainStep;
  availableSkills: Skill[];
  previousOutputs: string[];
  onChange: (step: SkillChainStep) => void;
}
interface CreateChainDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (chain: Omit<SkillChainDefinition, "id">) => void;
}

// 3B: ScheduleManager
interface ScheduleManagerProps {}
interface ScheduleTableProps {
  schedules: ScheduledSkill[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}
interface ScheduleRowProps {
  schedule: ScheduledSkill;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}
interface ScheduleDetailPanelProps {
  schedule: ScheduledSkill;
  runHistory: ScheduledRunResult[];
  onEdit: () => void;
  onDelete: () => void;
}
interface ScheduleDialogProps {
  isOpen: boolean;
  schedule?: ScheduledSkill;
  onClose: () => void;
  onSave: (schedule: Omit<ScheduledSkill, "id">) => void;
}
interface CronEditorProps {
  value: string;
  onChange: (cron: string) => void;
}
interface CronPresetListProps {
  onSelect: (cron: string) => void;
  selectedCron: string;
}
interface RunHistoryListProps {
  history: ScheduledRunResult[];
  maxItems?: number;
}

// 3C: DebugPanel
interface DebugPanelProps {}
interface DebugControlsProps {
  sessionStatus: "idle" | "running" | "paused" | "completed" | "error";
  onContinue: () => void;
  onStepOver: () => void;
  onStepInto: () => void;
  onStepOut: () => void;
  onPause: () => void;
  onStop: () => void;
}
interface CallStackViewProps {
  callStack: CallStackEntry[];
  activeEntryId: string | null;
  onSelect: (id: string) => void;
}
interface StepHistoryListProps {
  steps: DebugStep[];
  activeIndex: number | null;
}
interface OutputConsoleProps {
  lines: Array<{
    timestamp: string;
    level: "info" | "warn" | "error";
    message: string;
  }>;
  maxLines?: number;
}
interface VariableWatchProps {
  variables: Record<string, unknown>;
  changedPaths: Set<string>;
}
interface VariableNodeProps {
  name: string;
  value: unknown;
  path: string;
  isChanged: boolean;
  depth: number;
}
interface BreakpointEditorProps {
  breakpoints: Breakpoint[];
  onAdd: (breakpoint: Omit<Breakpoint, "id">) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}
interface BreakpointRowProps {
  breakpoint: Breakpoint;
  onRemove: () => void;
  onToggle: () => void;
}
interface StartDebugDialogProps {
  isOpen: boolean;
  availableSkills: Skill[];
  onClose: () => void;
  onStart: (
    skillName: string,
    options?: { breakpoints?: Omit<Breakpoint, "id">[] },
  ) => void;
}

// 3D: AnalyticsDashboard
interface AnalyticsDashboardProps {}
interface SummaryCardsProps {
  summary: AnalyticsSummary;
  isLoading: boolean;
}
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
interface UsageChartProps {
  data: TrendDataPoint[];
  granularity: "hour" | "day" | "week" | "month";
  height?: number;
}
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}
interface SkillRankingProps {
  skills: SkillUsageSummary[];
  maxItems?: number;
}
interface PeriodSelectorProps {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}
interface ExportButtonProps {
  onExport: (format: "csv" | "json") => void;
  isExporting: boolean;
}
```

### Task 2: 状態管理設計

#### 方針: ローカル useState + カスタム Hooks

4ビューは互いに状態を共有しないため、新規 Zustand Slice は作成しない。各ビューのカスタム Hook 内で `useState` を使用し、IPC 経由でデータを取得する。既存の `agentSlice` からスキル一覧を取得する場合のみ個別セレクタを使用する（P31 対策）。

| 状態               | 管理方法                         | 理由                                          |
| ------------------ | -------------------------------- | --------------------------------------------- |
| チェーン一覧       | `useChainList` (useState)        | ビュー固有データ、他ビューと共有不要          |
| チェーン編集中状態 | `useChainEditor` (useState)      | エディター内でのみ使用                        |
| スケジュール一覧   | `useScheduleList` (useState)     | ビュー固有データ                              |
| デバッグセッション | `useDebugSession` (useState)     | セッション状態はビュー内完結                  |
| ブレークポイント   | `useBreakpoints` (useState)      | デバッグビュー内でのみ使用                    |
| 分析サマリー       | `useAnalyticsSummary` (useState) | ビュー固有データ                              |
| トレンドデータ     | `useUsageTrend` (useState)       | ビュー固有データ                              |
| 利用可能スキル一覧 | `agentSlice` 個別セレクタ        | 既存 Store を再利用（P31 対策で個別セレクタ） |

#### カスタム Hook インターフェース

```typescript
// useChainList
interface UseChainListReturn {
  chains: SkillChainDefinition[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteChain: (chainId: string) => Promise<void>;
  executeChain: (chainId: string) => Promise<SkillChainResult>;
}

// useChainEditor
interface UseChainEditorReturn {
  chain: SkillChainDefinition | null;
  isDirty: boolean;
  isExecuting: boolean;
  executionStatus: Map<string, "pending" | "running" | "completed" | "error">;
  loadChain: (chainId: string) => Promise<void>;
  addStep: (step: Omit<SkillChainStep, "id">) => void;
  removeStep: (stepId: string) => void;
  updateStep: (stepId: string, step: Partial<SkillChainStep>) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  saveChain: () => Promise<void>;
  executeChain: () => Promise<SkillChainResult>;
}

// useScheduleList
interface UseScheduleListReturn {
  schedules: ScheduledSkill[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleSchedule: (id: string) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
}

// useScheduleEditor
interface UseScheduleEditorReturn {
  schedule: ScheduledSkill | null;
  isDirty: boolean;
  updateCron: (cron: string) => void;
  updatePrompt: (prompt: string) => void;
  save: () => Promise<void>;
}

// useDebugSession
interface UseDebugSessionReturn {
  session: DebugSession | null;
  status: "idle" | "running" | "paused" | "completed" | "error";
  callStack: CallStackEntry[];
  steps: DebugStep[];
  variables: Record<string, unknown>;
  consoleOutput: Array<{ timestamp: string; level: string; message: string }>;
  startSession: (skillName: string, options?: object) => Promise<void>;
  sendCommand: (command: DebugCommand) => Promise<void>;
  evaluate: (expression: string) => Promise<unknown>;
  inspect: (path: string) => Promise<Record<string, unknown>>;
}

// useBreakpoints
interface UseBreakpointsReturn {
  breakpoints: Breakpoint[];
  addBreakpoint: (bp: Omit<Breakpoint, "id">) => Promise<void>;
  removeBreakpoint: (id: string) => Promise<void>;
  toggleBreakpoint: (id: string) => void;
}

// useAnalyticsSummary
interface UseAnalyticsSummaryReturn {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: (period: AnalyticsPeriod) => Promise<void>;
}

// useUsageTrend
interface UseUsageTrendReturn {
  trend: UsageTrend | null;
  isLoading: boolean;
  error: string | null;
  refetch: (period: AnalyticsPeriod) => Promise<void>;
}
```

### Task 3: IPC インターフェース設計

#### チャネルホワイトリスト追加

`preload/channels.ts` の `IPC_CHANNELS` 定数に以下を追加:

```typescript
// skill:chain:* (TASK-9D)
SKILL_CHAIN_LIST: "skill:chain:list",
SKILL_CHAIN_GET: "skill:chain:get",
SKILL_CHAIN_SAVE: "skill:chain:save",
SKILL_CHAIN_DELETE: "skill:chain:delete",
SKILL_CHAIN_EXECUTE: "skill:chain:execute",

// skill:schedule:* (TASK-9G)
SKILL_SCHEDULE_LIST: "skill:schedule:list",
SKILL_SCHEDULE_ADD: "skill:schedule:add",
SKILL_SCHEDULE_UPDATE: "skill:schedule:update",
SKILL_SCHEDULE_DELETE: "skill:schedule:delete",
SKILL_SCHEDULE_TOGGLE: "skill:schedule:toggle",

// skill:debug:* (TASK-9H)
SKILL_DEBUG_START: "skill:debug:start",
SKILL_DEBUG_COMMAND: "skill:debug:command",
SKILL_DEBUG_BREAKPOINT_ADD: "skill:debug:breakpoint:add",
SKILL_DEBUG_BREAKPOINT_REMOVE: "skill:debug:breakpoint:remove",
SKILL_DEBUG_INSPECT: "skill:debug:inspect",
SKILL_DEBUG_EVALUATE: "skill:debug:evaluate",
SKILL_DEBUG_EVENT: "skill:debug:event",

// skill:analytics:* (TASK-9J)
SKILL_ANALYTICS_RECORD: "skill:analytics:record",
SKILL_ANALYTICS_STATISTICS: "skill:analytics:statistics",
SKILL_ANALYTICS_SUMMARY: "skill:analytics:summary",
SKILL_ANALYTICS_TREND: "skill:analytics:trend",
SKILL_ANALYTICS_EXPORT: "skill:analytics:export",
```

#### Preload API 設計

`preload/skill-api.ts` に追加するメソッド:

```typescript
interface SkillAPI {
  // ... 既存メソッド ...

  // Chain (TASK-9D)
  chainList: () => Promise<SkillChainDefinition[]>;
  chainGet: (chainId: string) => Promise<SkillChainDefinition>;
  chainSave: (chain: SkillChainDefinition) => Promise<SkillChainDefinition>;
  chainDelete: (chainId: string) => Promise<{ success: boolean }>;
  chainExecute: (chainId: string) => Promise<SkillChainResult>;

  // Schedule (TASK-9G)
  scheduleList: () => Promise<ScheduledSkill[]>;
  scheduleAdd: (
    schedule: Omit<ScheduledSkill, "id">,
  ) => Promise<ScheduledSkill>;
  scheduleUpdate: (schedule: ScheduledSkill) => Promise<ScheduledSkill>;
  scheduleDelete: (id: string) => Promise<{ success: boolean }>;
  scheduleToggle: (id: string) => Promise<ScheduledSkill>;

  // Debug (TASK-9H)
  debugStart: (skillName: string, options?: object) => Promise<DebugSession>;
  debugCommand: (
    sessionId: string,
    command: DebugCommand,
  ) => Promise<DebugSession>;
  debugBreakpointAdd: (
    sessionId: string,
    bp: Omit<Breakpoint, "id">,
  ) => Promise<Breakpoint>;
  debugBreakpointRemove: (
    sessionId: string,
    bpId: string,
  ) => Promise<{ success: boolean }>;
  debugInspect: (
    sessionId: string,
    path: string,
  ) => Promise<Record<string, unknown>>;
  debugEvaluate: (
    sessionId: string,
    expression: string,
  ) => Promise<{ result: unknown }>;
  onDebugEvent: (callback: (event: DebugEvent) => void) => () => void;

  // Analytics (TASK-9J)
  analyticsRecord: (
    event: Omit<SkillUsageEvent, "id">,
  ) => Promise<SkillUsageEvent>;
  analyticsStatistics: (skillName: string) => Promise<SkillStatistics>;
  analyticsSummary: (period: AnalyticsPeriod) => Promise<AnalyticsSummary>;
  analyticsTrend: (period: AnalyticsPeriod) => Promise<UsageTrend>;
  analyticsExport: (
    period: AnalyticsPeriod,
    format: "csv" | "json",
  ) => Promise<string>;
}
```

#### IPC バリデーション設計（P42 準拠3段バリデーション）

全ハンドラで以下の3段バリデーションを実施:

1. **型チェック**: `typeof args !== "string"` 等
2. **空文字列チェック**: `args === ""`
3. **トリム空文字列チェック**: `args.trim() === ""`

### Task 4: レスポンシブ設計

#### 全ビュー共通ブレークポイント

| ブレークポイント | CSS クラス       | レイアウト                        |
| ---------------- | ---------------- | --------------------------------- |
| >= 1024px        | `lg:` prefix     | 左右分割（メイン + サイド 320px） |
| 768px〜1023px    | `md:` prefix     | 上下分割（折りたたみパネル）      |
| < 768px          | default (mobile) | 単一カラム + ボトムシート（85vh） |

#### ビュー固有レスポンシブ対応

| ビュー          | >= 1024px                      | 768px〜1023px                | < 768px                          |
| --------------- | ------------------------------ | ---------------------------- | -------------------------------- |
| ChainBuilder    | StepCard 水平配置 + 右パネル   | StepCard 水平配置 + 下パネル | StepCard 垂直配置 + ボトムシート |
| ScheduleManager | テーブルレイアウト + 右パネル  | テーブル + 下部折りたたみ    | カードリスト + ボトムシート      |
| DebugPanel      | 左右2ペイン（flex-1 + 320px）  | 上下分割                     | タブ切替（スタック/変数/出力）   |
| Analytics       | カード3列 + フルワイドチャート | カード2列 + チャート         | カード1列 + スクロールチャート   |

### Task 5: マイクロインタラクション設計

#### 3A: SkillChainBuilder

| 対象           | トリガー   | アニメーション                      | 時間      | イージング |
| -------------- | ---------- | ----------------------------------- | --------- | ---------- |
| StepCard       | hover      | `scale(1.02)` + `shadow-md`         | 200ms     | ease-out   |
| StepCard       | ドラッグ   | `opacity: 0.7` + `cursor: grabbing` | 即時      | -          |
| StepCard       | ドロップ   | 挿入位置に slide-in                 | 200ms     | ease-out   |
| ステップ追加   | クリック   | `opacity: 0→1` + `scale(0.9→1)`     | 300ms     | ease-out   |
| 実行中ステップ | 実行時     | ボーダーパルス `opacity: 0.5→1→0.5` | 1.5s 周期 | linear     |
| 接続線         | 実行進行中 | ストロークダッシュアニメーション    | 連続      | linear     |

#### 3B: ScheduleManager

| 対象          | トリガー | アニメーション                        | 時間  | イージング |
| ------------- | -------- | ------------------------------------- | ----- | ---------- |
| ScheduleRow   | hover    | 背景色 `var(--bg-hover)`              | 100ms | ease-out   |
| ON/OFF トグル | クリック | スライド + 色変化（accent ↔ gray）    | 200ms | ease-out   |
| 詳細パネル    | 展開     | `max-height` トランジション           | 300ms | ease-out   |
| 実行履歴行    | 追加     | `opacity: 0→1` + `translateY(-8px→0)` | 200ms | ease-out   |

#### 3C: DebugPanel

| 対象                 | トリガー   | アニメーション                                | 時間  | イージング  |
| -------------------- | ---------- | --------------------------------------------- | ----- | ----------- |
| コールスタック行     | ブレーク時 | 背景ハイライト `var(--status-warning-subtle)` | 300ms | ease-out    |
| ステップ履歴行       | 追加       | `opacity: 0→1` + `translateY(-4px→0)`         | 200ms | ease-out    |
| 変数値               | 変更       | テキスト色 `var(--color-accent)` で点滅       | 500ms | ease-in-out |
| 出力コンソール行     | 追加       | テキスト一行ずつ append                       | 即時  | -           |
| DebugControls ボタン | hover      | `scale(1.05)`                                 | 100ms | ease-out    |
| DebugControls ボタン | active     | `scale(0.95)`                                 | 即時  | -           |

#### 3D: AnalyticsDashboard

| 対象              | トリガー     | アニメーション              | 時間   | イージング  |
| ----------------- | ------------ | --------------------------- | ------ | ----------- |
| SummaryCard       | 初期表示     | カウントアップ（0→実際値）  | 800ms  | ease-out    |
| SummaryCard       | hover        | `scale(1.02)` + `shadow-md` | 200ms  | ease-out    |
| UsageChart        | 初期表示     | 折れ線の左→右ドロー         | 1000ms | ease-out    |
| SkillRanking バー | 初期表示     | バー幅 `0%→実際値%`         | 600ms  | ease-out    |
| SkillRanking バー | hover        | `opacity: 0.7→1`            | 100ms  | ease-out    |
| 期間切替          | セレクト変更 | チャート crossFade          | 200ms  | ease-in-out |

### Task 6: 共通パターン設計

#### EmptyState パターン

| ビュー          | mood          | メッセージ                     | アクションボタン       | アイコン（lucide-react） |
| --------------- | ------------- | ------------------------------ | ---------------------- | ------------------------ |
| ChainBuilder    | `"creative"`  | 「ツールを組み合わせてみよう」 | 「チェーンを作成」     | `Workflow`               |
| ScheduleManager | `"organized"` | 「ツールを自動で実行しよう」   | 「スケジュール作成」   | `Calendar`               |
| DebugPanel      | `"focused"`   | 「ツール実行を詳しく調べよう」 | 「デバッグ開始」       | `Bug`                    |
| Analytics       | `"curious"`   | 「ツールの使い方を振り返ろう」 | なし（データ蓄積待ち） | `BarChart3`              |

#### Loading パターン

- スケルトンカード: `animate-pulse` + `bg-[var(--bg-tertiary)]` 矩形
- カード数: ChainBuilder 4枚, ScheduleManager 5行, DebugPanel 全パネル, Analytics 3枚+チャート
- ローディング中はアクションボタン `disabled` + `opacity: 0.5`

#### Error パターン

- エラーメッセージ: `var(--status-error)` テキスト + `AlertCircle` アイコン
- リトライボタン: 「再試行」ボタンを表示
- IPC エラーはサニタイズして表示（内部情報を含まない）

### Task 7: recharts 統合設計（AnalyticsDashboard 固有）

#### 使用コンポーネント

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

#### テーマ設定

```typescript
const chartTheme = {
  strokeColor: "var(--color-accent)", // 主線
  gridColor: "var(--border-primary)", // グリッド
  textColor: "var(--text-secondary)", // 軸ラベル
  tooltipBg: "var(--bg-primary)", // ツールチップ背景
  tooltipBorder: "var(--border-primary)", // ツールチップ境界
};
```

#### recharts のテスト戦略

recharts コンポーネントはSVGを描画するため、DOM テストでは以下を検証:

- `ResponsiveContainer` がレンダリングされること
- `data` prop が正しく渡されること
- カスタム `ChartTooltip` のレンダリング
- 空データ時のフォールバック表示

## 統合テスト連携【必須】

| 連携観点     | 設計出力                            | Phase 4 での検証対象                      |
| ------------ | ----------------------------------- | ----------------------------------------- |
| UI構造       | Atomic Design 階層図                | コンポーネントレンダリング/責務境界テスト |
| 状態管理     | Storeセレクタ/Hooks 設計            | P31 回避（個別セレクタ）テスト            |
| IPC契約      | チャネル・引数・戻り値・event契約   | invoke/on 契約テスト、型整合テスト        |
| セキュリティ | sender 検証 + P42 3段バリデーション | エラー系/不正入力テスト                   |
| レスポンシブ | sm/md/lg レイアウト切替仕様         | レスポンシブ UI テスト                    |

## 成果物

| 成果物                     | パス                                         | 内容                                |
| -------------------------- | -------------------------------------------- | ----------------------------------- |
| アーキテクチャ設計書       | `outputs/phase-2/architecture-design.md`     | コンポーネント構成・Props型定義     |
| コンポーネント階層図       | `outputs/phase-2/component-hierarchy.md`     | Atomic Design 層分け・ファイルパス  |
| 状態管理設計書             | `outputs/phase-2/state-management-design.md` | Hook インターフェース・状態配置     |
| IPC インターフェース設計書 | `outputs/phase-2/ipc-interface-design.md`    | Preload API・チャネルホワイトリスト |

## 完了条件

- [ ] 全コンポーネント（3A: 7個, 3B: 8個, 3C: 10個, 3D: 8個 = 33個）の Props 型定義が記載されている
- [ ] 状態管理の責務分離（カスタム Hook useState vs agentSlice 個別セレクタ）が8項目で明確
- [ ] IPC チャネル（22チャネル）と Preload API（24メソッド）の対応表が完成している
- [ ] レスポンシブブレークポイント（3段階）ごとの4ビューのレイアウト仕様が全て記載されている
- [ ] マイクロインタラクション（3A: 6個, 3B: 4個, 3C: 6個, 3D: 6個 = 22個）のタイミング・イージング関数が全定義されている
- [ ] 共通パターン（EmptyState 4種, Loading, Error）が全て設計されている
- [ ] recharts 統合設計（使用コンポーネント8種、テーマ設定、テスト戦略）が記載されている
- [ ] 4つの成果物ファイルが全て作成されている

## 次 Phase

Phase 3（設計レビューゲート）へ進む。Phase 1 の要件定義と Phase 2 の設計の整合性を検証し、PASS / MINOR / MAJOR の判定を行う。
