# コンポーネントドキュメント（TASK-UI-05B-SKILL-ADVANCED-VIEWS）

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| タスクID | TASK-UI-05B-SKILL-ADVANCED-VIEWS |
| Phase    | 12 - ドキュメント                |
| 作成日   | 2026-03-02                       |
| 実装規模 | コンポーネント34個、Hook 8個     |

---

## 1. SkillChainBuilder

**ファイルパス**: `apps/desktop/src/renderer/views/SkillChainBuilder/`

### 1.1 コンポーネント一覧

| コンポーネント    | ファイル                           | Atomic Level | 責務                                         |
| ----------------- | ---------------------------------- | ------------ | -------------------------------------------- |
| SkillChainBuilder | `index.tsx`                        | Organism     | 一覧モード/編集モードの切替、全体状態の統合  |
| ChainCardGrid     | `components/ChainCardGrid.tsx`     | Organism     | チェーンカードのレスポンシブグリッド表示     |
| ChainCard         | `components/ChainCard.tsx`         | Molecule     | 個別チェーンカード（選択・削除アクション付） |
| ChainEditor       | `components/ChainEditor.tsx`       | Organism     | チェーン名/説明/ステップ/変数の編集画面      |
| StepList          | `components/StepList.tsx`          | Molecule     | ステップのリスト表示（並べ替えサポート）     |
| StepCard          | `components/StepCard.tsx`          | Molecule     | 個別ステップカード（削除・移動アクション付） |
| AddStepDialog     | `components/AddStepDialog.tsx`     | Molecule     | スキル選択からステップを追加するダイアログ   |
| CreateChainDialog | `components/CreateChainDialog.tsx` | Molecule     | 新規チェーン作成ダイアログ（名前/説明入力）  |
| VariableEditor    | `components/VariableEditor.tsx`    | Molecule     | チェーン変数の追加・編集・削除               |

### 1.2 Props 型定義

#### SkillChainBuilder

Props なし（エントリーポイントコンポーネント）

#### ChainCardGrid

```typescript
export interface ChainCardGridProps {
  chains: SkillChainDefinition[]; // チェーン一覧
  onSelect: (chainId: string) => void; // チェーン選択ハンドラ
  onDelete: (chainId: string) => void; // チェーン削除ハンドラ
}
```

#### ChainEditor

```typescript
export interface ChainEditorProps {
  chain: SkillChainDefinition; // 編集中のチェーン
  isSaving: boolean; // 保存中フラグ
  isExecuting: boolean; // 実行中フラグ
  executionResult: SkillChainResult | null; // 実行結果
  error: string | null; // エラーメッセージ
  onUpdateName: (name: string) => void; // チェーン名更新
  onUpdateDescription: (description: string) => void; // 説明更新
  onAddStep: (step: SkillChainStep) => void; // ステップ追加
  onRemoveStep: (stepId: string) => void; // ステップ削除
  onMoveStep: (fromIndex: number, toIndex: number) => void; // ステップ移動
  onUpdateVariable: (key: string, value: unknown) => void; // 変数更新
  onRemoveVariable: (key: string) => void; // 変数削除
  onSave: () => void; // 保存ハンドラ
  onExecute: () => void; // 実行ハンドラ
  onBack: () => void; // 一覧に戻るハンドラ
}
```

### 1.3 カスタムフック

#### useChainList

```typescript
export interface UseChainListReturn {
  chains: SkillChainDefinition[]; // チェーン一覧
  isLoading: boolean; // ローディング状態
  error: string | null; // エラーメッセージ
  refetch: () => Promise<void>; // 一覧を再取得する
  deleteChain: (chainId: string) => Promise<void>; // チェーンを削除する
}
```

- 初回マウント時に `window.electronAPI.skill.chainList()` でチェーン一覧を取得
- 削除後はローカルステートから即座に除外（楽観的更新）

#### useChainEditor

```typescript
export interface UseChainEditorReturn {
  chain: SkillChainDefinition | null; // 編集中のチェーン定義
  isSaving: boolean; // 保存中フラグ
  isExecuting: boolean; // 実行中フラグ
  executionResult: SkillChainResult | null; // 実行結果
  error: string | null; // エラーメッセージ
  loadChain: (chainId: string) => Promise<void>; // チェーンを読み込む
  updateName: (name: string) => void; // チェーン名を更新する
  updateDescription: (description: string) => void; // 説明を更新する
  addStep: (step: SkillChainStep) => void; // ステップを追加する
  removeStep: (stepId: string) => void; // ステップを削除する
  moveStep: (fromIndex: number, toIndex: number) => void; // ステップを並べ替える
  updateVariable: (key: string, value: unknown) => void; // 変数を更新する
  removeVariable: (key: string) => void; // 変数を削除する
  saveChain: () => Promise<void>; // チェーンを保存する
  executeChain: () => Promise<void>; // チェーンを実行する
  initNewChain: (name: string, description: string) => void; // 新規チェーン初期化
}
```

### 1.4 使用する IPC API

| メソッド                                    | 用途             |
| ------------------------------------------- | ---------------- |
| `window.electronAPI.skill.chainList()`      | チェーン一覧取得 |
| `window.electronAPI.skill.chainGet(id)`     | チェーン詳細取得 |
| `window.electronAPI.skill.chainSave(chain)` | チェーン保存     |
| `window.electronAPI.skill.chainDelete(id)`  | チェーン削除     |
| `window.electronAPI.skill.chainExecute(id)` | チェーン実行     |

### 1.5 テストファイル

| ファイル                                        | 対象                       |
| ----------------------------------------------- | -------------------------- |
| `__tests__/SkillChainBuilder.test.tsx`          | メインビュー正常系         |
| `__tests__/SkillChainBuilder.boundary.test.tsx` | 境界値・エラー系           |
| `__tests__/ChainEditor.test.tsx`                | ChainEditor コンポーネント |
| `__tests__/StepCard.test.tsx`                   | StepCard コンポーネント    |
| `__tests__/useChainList.test.ts`                | useChainList フック        |

---

## 2. ScheduleManager

**ファイルパス**: `apps/desktop/src/renderer/views/ScheduleManager/`

### 2.1 コンポーネント一覧

| コンポーネント       | ファイル                              | Atomic Level | 責務                                                 |
| -------------------- | ------------------------------------- | ------------ | ---------------------------------------------------- |
| ScheduleManager      | `index.tsx`                           | Organism     | スケジュールCRUD管理の統合、ダイアログ制御           |
| ScheduleTable        | `components/ScheduleTable.tsx`        | Organism     | スケジュール一覧テーブル                             |
| ScheduleRow          | `components/ScheduleRow.tsx`          | Molecule     | 個別スケジュール行（トグル・編集・削除アクション付） |
| ScheduleDialog       | `components/ScheduleDialog.tsx`       | Molecule     | 新規作成/編集ダイアログ（モード共通）                |
| ScheduleHistoryPanel | `components/ScheduleHistoryPanel.tsx` | Molecule     | スケジュール実行履歴の表示パネル                     |
| CronInput            | `components/CronInput.tsx`            | Atom         | Cron式入力補助コンポーネント（プレビュー付）         |

### 2.2 Props 型定義

#### ScheduleManager

Props なし（エントリーポイントコンポーネント）

#### ScheduleTable

```typescript
interface ScheduleTableProps {
  schedules: ScheduledSkill[]; // スケジュール一覧
  onToggle: (id: string) => Promise<void>; // 有効/無効トグル
  onDelete: (id: string) => Promise<void>; // スケジュール削除
  onEdit: (schedule: ScheduledSkill) => void; // 編集ダイアログを開く
}
```

#### ScheduleDialog

```typescript
interface ScheduleDialogProps {
  schedule?: ScheduledSkill; // 編集対象（未指定の場合は新規作成モード）
  onClose: () => void; // ダイアログを閉じる
  onSave: (data: Omit<ScheduledSkill, "id" | "runHistory">) => Promise<void>; // 保存
}
```

### 2.3 カスタムフック

#### useScheduleManager

```typescript
interface ScheduleManagerState {
  schedules: ScheduledSkill[]; // スケジュール一覧
  isLoading: boolean; // ローディング中フラグ
  error: string | null; // エラーメッセージ
}

interface ScheduleManagerActions {
  addSchedule: (
    input: Omit<ScheduledSkill, "id" | "runHistory">,
  ) => Promise<void>;
  updateSchedule: (
    id: string,
    updates: Partial<ScheduledSkill>,
  ) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleSchedule: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}
```

- 初回マウント時に `window.electronAPI.skill.scheduleList()` でスケジュール一覧を取得
- 追加・更新・削除・トグルはローカル状態を楽観的に更新

### 2.4 使用する IPC API

| メソッド                                               | 用途                 |
| ------------------------------------------------------ | -------------------- |
| `window.electronAPI.skill.scheduleList()`              | スケジュール一覧取得 |
| `window.electronAPI.skill.scheduleAdd(input)`          | スケジュール追加     |
| `window.electronAPI.skill.scheduleUpdate(id, updates)` | スケジュール更新     |
| `window.electronAPI.skill.scheduleDelete(id)`          | スケジュール削除     |
| `window.electronAPI.skill.scheduleToggle(id)`          | 有効/無効トグル      |

### 2.5 テストファイル

| ファイル                                      | 対象                         |
| --------------------------------------------- | ---------------------------- |
| `__tests__/ScheduleManager.test.tsx`          | メインビュー正常系           |
| `__tests__/ScheduleManager.boundary.test.tsx` | 境界値・エラー系             |
| `__tests__/ScheduleTable.test.tsx`            | ScheduleTable コンポーネント |
| `__tests__/useScheduleManager.test.ts`        | useScheduleManager フック    |

---

## 3. DebugPanel

**ファイルパス**: `apps/desktop/src/renderer/views/DebugPanel/`

### 3.1 コンポーネント一覧

| コンポーネント    | ファイル                           | Atomic Level | 責務                                                    |
| ----------------- | ---------------------------------- | ------------ | ------------------------------------------------------- |
| DebugPanel        | `index.tsx`                        | Organism     | 2カラムレイアウト統合、デバッグイベント処理             |
| DebugToolbar      | `components/DebugToolbar.tsx`      | Molecule     | デバッグコマンドボタン群（続行/一時停止/ステップ/停止） |
| CodeView          | `components/CodeView.tsx`          | Molecule     | 現在実行中のステップ詳細表示                            |
| StepHistoryList   | `components/StepHistoryList.tsx`   | Molecule     | 実行済みステップの履歴リスト                            |
| StepHistoryItem   | `components/StepHistoryItem.tsx`   | Atom         | 個別ステップ履歴アイテム                                |
| VariableInspector | `components/VariableInspector.tsx` | Molecule     | 変数の一覧とツリー表示                                  |
| VariableItem      | `components/VariableItem.tsx`      | Atom         | 個別変数アイテム（key/value表示）                       |
| CallStackView     | `components/CallStackView.tsx`     | Molecule     | コールスタックの一覧表示                                |
| CallStackEntry    | `components/CallStackEntry.tsx`    | Atom         | 個別コールスタックエントリ                              |
| EvaluateConsole   | `components/EvaluateConsole.tsx`   | Molecule     | 任意の式を評価するインタラクティブコンソール            |
| StartDebugDialog  | `components/StartDebugDialog.tsx`  | Molecule     | デバッグセッション開始ダイアログ                        |

### 3.2 Props 型定義

#### DebugPanel

Props なし（エントリーポイントコンポーネント）

#### DebugToolbar

```typescript
export interface DebugToolbarProps {
  status: DebugSessionStatus; // セッション状態（idle/running/paused/completed/error）
  skillName: string; // スキル名（表示用）
  onCommand: (command: DebugCommand) => void; // コマンド実行ハンドラ
  onStop: () => void; // 停止確認ハンドラ
}

// DebugCommand: "continue" | "pause" | "stepOver" | "stepInto" | "stepOut" | "stop"
// DebugSessionStatus: "idle" | "running" | "paused" | "completed" | "error"
```

#### VariableInspector

```typescript
interface VariableInspectorProps {
  variables: Record<string, unknown>; // 変数マップ（キー: 変数名、値: 任意の型）
}
```

#### EvaluateConsole

```typescript
interface EvaluateConsoleProps {
  sessionId: string; // 評価対象のセッションID
  onEvaluate: (expression: string) => Promise<DebugEvaluateResponse | null>;
}
```

### 3.3 カスタムフック

#### useDebugSession

```typescript
export interface UseDebugSessionReturn {
  session: DebugSessionState | null; // 現在のデバッグセッション状態（未開始時はnull）
  isLoading: boolean; // セッション操作中のローディング状態
  error: string | null; // エラーメッセージ
  startSession: (
    request: DebugStartRequest,
  ) => Promise<DebugSessionState | null>;
  executeCommand: (command: DebugCommand) => Promise<void>;
  setSession: React.Dispatch<React.SetStateAction<DebugSessionState | null>>;
  resetSession: () => void;
}
```

#### useDebugEvents

```typescript
function useDebugEvents(
  sessionId: string | null, // 購読対象セッションID（nullの場合は購読しない）
  onEvent: (event: DebugEvent) => void, // イベント受信コールバック
): void;
```

- セッションIDでフィルタリングしてイベントを受信
- useEffect のクリーンアップでリスナーを解除（P5対策: 二重登録防止）

### 3.4 使用する IPC API

| メソッド                                                                     | 用途                   |
| ---------------------------------------------------------------------------- | ---------------------- |
| `window.electronAPI.skill.debug.startSession(request)`                       | デバッグセッション開始 |
| `window.electronAPI.skill.debug.executeCommand({sessionId, command})`        | コマンド実行           |
| `window.electronAPI.skill.debug.evaluateExpression({sessionId, expression})` | 式評価                 |
| `window.electronAPI.skill.debug.onDebugEvent(callback)`                      | イベントリスナー登録   |

### 3.5 デバッグイベント型

```typescript
// DebugEvent の型（skill-debug.ts より）
type DebugEvent =
  | { type: "step"; sessionId: string; step: DebugStep }
  | { type: "breakpoint-hit"; sessionId: string; step?: DebugStep }
  | {
      type: "variable-changed";
      sessionId: string;
      path: string;
      value: unknown;
    }
  | {
      type: "session-ended";
      sessionId: string;
      error?: string;
      completedAt: string;
    };
```

### 3.6 テストファイル

| ファイル                                 | 対象                             |
| ---------------------------------------- | -------------------------------- |
| `__tests__/DebugPanel.test.tsx`          | メインビュー正常系               |
| `__tests__/DebugPanel.boundary.test.tsx` | 境界値・エラー系                 |
| `__tests__/DebugToolbar.test.tsx`        | DebugToolbar コンポーネント      |
| `__tests__/VariableInspector.test.tsx`   | VariableInspector コンポーネント |
| `__tests__/useDebugSession.test.ts`      | useDebugSession フック           |

---

## 4. AnalyticsDashboard

**ファイルパス**: `apps/desktop/src/renderer/views/AnalyticsDashboard/`

### 4.1 コンポーネント一覧

| コンポーネント     | ファイル                         | Atomic Level | 責務                                          |
| ------------------ | -------------------------------- | ------------ | --------------------------------------------- |
| AnalyticsDashboard | `index.tsx`                      | Organism     | 3Hook統合、エクスポート、ページ全体の管理     |
| SummaryCardGrid    | `components/SummaryCardGrid.tsx` | Organism     | 4枚のサマリーカードのグリッドレイアウト       |
| SummaryCard        | `components/SummaryCard.tsx`     | Molecule     | 個別サマリーカード（トレンド表示付）          |
| UsageChart         | `components/UsageChart.tsx`      | Organism     | recharts を使った使用量折れ線/棒グラフ        |
| SkillStatsTable    | `components/SkillStatsTable.tsx` | Organism     | スキル別統計テーブル（ソート/フィルタ機能付） |
| SkillStatsRow      | `components/SkillStatsRow.tsx`   | Molecule     | 個別スキル統計行                              |
| PeriodSelector     | `components/PeriodSelector.tsx`  | Molecule     | 期間プリセット選択（7d/30d/90d/1y/all）       |
| ExportButton       | `components/ExportButton.tsx`    | Molecule     | JSON/CSV形式でのデータエクスポートボタン      |

### 4.2 Props 型定義

#### AnalyticsDashboard

Props なし（エントリーポイントコンポーネント）

#### SummaryCardGrid

```typescript
export interface SummaryCardGridProps {
  summary: AnalyticsSummary; // サマリーデータ
  className?: string; // 追加のクラス名（オプション）
}
```

#### SummaryCard

```typescript
interface SummaryCardProps {
  title: string; // カードタイトル
  value: string | number; // 表示する値
  icon: React.ReactNode; // アイコンコンポーネント
  trend?: "up" | "down" | "neutral"; // トレンド方向（オプション）
  trendLabel?: string; // トレンドラベル（オプション）
}
```

#### UsageChart

```typescript
interface UsageChartProps {
  dataPoints: UsageTrendDataPoint[]; // チャートデータ
  isLoading: boolean; // ローディング状態
  error: string | null; // エラーメッセージ
}
```

#### SkillStatsTable

```typescript
interface SkillStatsTableProps {
  stats: SkillStatistics[]; // スキル統計データ
  isLoading: boolean; // ローディング状態
  error: string | null; // エラーメッセージ
  sortKey: SortKey; // 現在のソートキー
  sortDirection: SortDirection; // ソート方向（"asc" | "desc"）
  filterKeyword: string; // フィルタキーワード
  onSortChange: (key: SortKey) => void; // ソートキー変更ハンドラ
  onFilterChange: (keyword: string) => void; // フィルタ変更ハンドラ
}

// SortKey: "skillName" | "totalExecutions" | "successRate" | "averageDuration" | "totalTokens"
```

#### PeriodSelector

```typescript
interface PeriodSelectorProps {
  selectedPeriod: PeriodPreset; // 選択中の期間プリセット
  onPeriodChange: (preset: PeriodPreset) => void; // 期間変更ハンドラ
}

// PeriodPreset: "7d" | "30d" | "90d" | "1y" | "all"
```

#### ExportButton

```typescript
interface ExportButtonProps {
  onExport: (format: "json" | "csv") => Promise<void>; // エクスポートハンドラ
}
```

### 4.3 カスタムフック

#### useAnalyticsSummary

```typescript
export interface UseAnalyticsSummaryResult {
  summary: AnalyticsSummary | null; // サマリーデータ
  isLoading: boolean; // ローディング状態
  error: string | null; // エラーメッセージ
  refetch: () => Promise<void>; // データ再取得
}
```

- 初回マウント時に自動取得
- `window.electronAPI.skill.analyticsSummary()` を呼び出す

#### useAnalyticsTrend

```typescript
export interface UseAnalyticsTrendResult {
  trend: UsageTrend | null; // トレンドデータ
  isLoading: boolean; // ローディング状態
  error: string | null; // エラーメッセージ
  periodPreset: PeriodPreset; // 現在の期間プリセット
  setPeriodPreset: (preset: PeriodPreset) => void; // 期間プリセット変更
  refetch: () => Promise<void>; // データ再取得
}
```

- 期間プリセット変更時に自動再取得
- `PeriodPreset` を `AnalyticsPeriod` に変換してから `window.electronAPI.skill.analyticsTrend()` を呼び出す

#### useSkillStats

```typescript
export interface UseSkillStatsResult {
  stats: SkillStatistics[]; // スキル統計データ一覧
  sortedStats: SkillStatistics[]; // ソート・フィルタ適用済みデータ
  isLoading: boolean; // ローディング状態
  error: string | null; // エラーメッセージ
  sortKey: SortKey; // ソートキー
  sortDirection: SortDirection; // ソート方向
  filterKeyword: string; // フィルタキーワード
  setSortKey: (key: SortKey) => void; // ソートキー変更（同じキー→方向切替）
  setFilterKeyword: (keyword: string) => void; // フィルタ変更
  refetch: () => Promise<void>; // データ再取得
}
```

- `skillNames` リストを引数に受け取り、`Promise.all` で並列取得
- ソートとフィルタは `useMemo` でメモ化

### 4.4 使用する IPC API

| メソッド                                                  | 用途                   |
| --------------------------------------------------------- | ---------------------- |
| `window.electronAPI.skill.analyticsSummary()`             | サマリーデータ取得     |
| `window.electronAPI.skill.analyticsTrend(period, name?)`  | トレンドデータ取得     |
| `window.electronAPI.skill.analyticsStatistics(skillName)` | スキル別統計データ取得 |
| `window.electronAPI.skill.analyticsExport(format)`        | JSON/CSVエクスポート   |

### 4.5 テストファイル

| ファイル                                         | 対象                           |
| ------------------------------------------------ | ------------------------------ |
| `__tests__/AnalyticsDashboard.test.tsx`          | メインビュー正常系             |
| `__tests__/AnalyticsDashboard.boundary.test.tsx` | 境界値・エラー系               |
| `__tests__/UsageChart.test.tsx`                  | UsageChart コンポーネント      |
| `__tests__/SkillStatsTable.test.tsx`             | SkillStatsTable コンポーネント |
| `__tests__/useAnalyticsSummary.test.ts`          | useAnalyticsSummary フック     |

---

## 5. 共通設計パターン

### 5.1 IPC通信パターン

すべてのカスタムフックは同一パターンで IPC 通信を行います。

```typescript
const fetchData = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await window.electronAPI.skill.someMethod();
    setData(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : "取得に失敗しました");
  } finally {
    setIsLoading(false);
  }
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 5.2 エラー表示パターン

IPC エラーはコンポーネント側で `<ErrorDisplay>` アトムで表示します。

```tsx
{
  error && <ErrorDisplay message={error} onRetry={refetch} />;
}
```

### 5.3 ローディング状態パターン

データ取得中は `<Spinner>` アトムで表示します。

```tsx
{
  isLoading && (
    <div className="flex items-center justify-center h-full" role="status">
      <Spinner size="lg" />
    </div>
  );
}
```

### 5.4 空状態パターン

データが0件の場合は `<EmptyState>` アトムで表示します。

```tsx
{
  !isLoading && !error && items.length === 0 && (
    <EmptyState
      title="データがありません"
      description="説明テキスト"
      icon="icon-name"
      action={{ label: "アクション", onClick: handleAction }}
    />
  );
}
```

### 5.5 React.memo 適用方針

メインビューとサブコンポーネントは `React.memo` でラップし、不要な再レンダリングを防ぎます。`displayName` を設定して DevTools でのデバッグを容易にします。

```typescript
export const ComponentName: React.FC<Props> = memo(({ ... }) => { ... });
ComponentName.displayName = "ComponentName";
```
