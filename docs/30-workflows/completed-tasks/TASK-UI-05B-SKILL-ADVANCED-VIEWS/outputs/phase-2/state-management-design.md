# Phase 2 成果物: 状態管理設計書

## メタ情報

| 項目            | 値                                |
| --------------- | --------------------------------- |
| タスク ID       | TASK-UI-05B-SKILL-ADVANCED-VIEWS  |
| Phase           | 2（設計）                         |
| 成果物          | state-management-design.md        |
| 作成日          | 2026-03-02                        |
| 前 Phase 成果物 | `outputs/phase-1/` (要件定義書等) |

---

## 1. 設計方針

### 1.1 基本方針: ローカル useState + カスタム Hooks

4ビュー（3A - 3D）は互いに状態を共有しないため、**新規 Zustand Slice は作成しない**。各ビューのカスタム Hook 内で `useState` を使用し、IPC 経由でデータを取得・管理する。

既存の `agentSlice` からスキル一覧を取得する場合のみ、個別セレクタを使用する（P31 対策）。

### 1.2 設計根拠

| 判断基準                            | 評価                          |
| ----------------------------------- | ----------------------------- |
| ビュー間の状態共有が必要か          | 不要（各ビュー独立）          |
| 状態の永続化が必要か                | 不要（IPC 経由で取得）        |
| 全体 Store への副作用があるか       | なし                          |
| 既存 Slice の拡張が必要か           | なし（agentSlice 再利用のみ） |
| P31（合成 Hook 無限ループ）リスクか | 個別セレクタで回避            |

---

## 2. 状態配置マップ（8項目）

| #   | 状態                 | 管理方法                         | 管理場所           | 理由                                 |
| --- | -------------------- | -------------------------------- | ------------------ | ------------------------------------ |
| 1   | チェーン一覧         | `useChainList` (useState)        | SkillChainBuilder  | ビュー固有データ、他ビューと共有不要 |
| 2   | チェーン編集中状態   | `useChainEditor` (useState)      | ChainEditor        | エディター内でのみ使用               |
| 3   | スケジュール一覧     | `useScheduleList` (useState)     | ScheduleManager    | ビュー固有データ                     |
| 4   | スケジュール編集状態 | `useScheduleEditor` (useState)   | ScheduleDialog     | ダイアログ内でのみ使用               |
| 5   | デバッグセッション   | `useDebugSession` (useState)     | DebugPanel         | セッション状態はビュー内完結         |
| 6   | ブレークポイント     | `useBreakpoints` (useState)      | DebugPanel         | デバッグビュー内でのみ使用           |
| 7   | 分析サマリー         | `useAnalyticsSummary` (useState) | AnalyticsDashboard | ビュー固有データ                     |
| 8   | トレンドデータ       | `useUsageTrend` (useState)       | AnalyticsDashboard | ビュー固有データ                     |

### 2.1 agentSlice 個別セレクタ利用（P31 対策）

| 利用箇所                                   | 取得データ         | セレクタ              |
| ------------------------------------------ | ------------------ | --------------------- |
| ChainEditor（ステップのスキル選択）        | 利用可能スキル一覧 | `useAgentSkills()` 等 |
| StartDebugDialog（デバッグ対象スキル選択） | 利用可能スキル一覧 | `useAgentSkills()` 等 |

P31 対策として、合成 Store Hook（`useAgentStore()`）は使用せず、個別セレクタ（`useAgentSkills()` 等）を使用する。これにより、useEffect の依存配列に含めても安定した参照が保証される。

---

## 3. カスタム Hook インターフェース（全8 hooks）

### 3.1 useChainList（3A: SkillChainBuilder）

チェーン一覧の取得・削除・実行を管理する。

```typescript
interface UseChainListReturn {
  chains: SkillChainDefinition[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteChain: (chainId: string) => Promise<void>;
  executeChain: (chainId: string) => Promise<SkillChainResult>;
}
```

#### 内部実装方針

- マウント時に `skill:chain:list` を呼び出してチェーン一覧を取得
- `deleteChain` 実行後は自動で `refetch` を呼び出す
- エラー発生時は `error` に IPC エラーのサニタイズ済みメッセージを設定

```typescript
const useChainList = (): UseChainListReturn => {
  const [chains, setChains] = useState<SkillChainDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.skill.chainList();
      setChains(result);
    } catch (e) {
      setError("チェーン一覧の取得に失敗しました。再試行してください。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // deleteChain, executeChain ...
  return { chains, isLoading, error, refetch, deleteChain, executeChain };
};
```

### 3.2 useChainEditor（3A: SkillChainBuilder）

チェーンの編集・ステップ管理・実行を管理する。

```typescript
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
```

#### 内部実装方針

- `isDirty`: 編集後の変更検知（初期値 false、addStep/removeStep/updateStep/reorderSteps 実行後に true）
- `executionStatus`: ステップごとの実行状態を Map で管理
- `saveChain`: `skill:chain:save` IPC 呼び出し後に `isDirty` を false にリセット
- `reorderSteps`: ステップ配列の要素入れ替え（ドラッグ&ドロップ対応）

### 3.3 useScheduleList（3B: ScheduleManager）

スケジュール一覧の取得・トグル・削除を管理する。

```typescript
interface UseScheduleListReturn {
  schedules: ScheduledSkill[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleSchedule: (id: string) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
}
```

#### 内部実装方針

- マウント時に `skill:schedule:list` を呼び出してスケジュール一覧を取得
- `toggleSchedule`: `skill:schedule:toggle` IPC 呼び出し後、レスポンスでローカル状態を更新（楽観的更新なし）
- `deleteSchedule`: `skill:schedule:delete` IPC 呼び出し後に `refetch` を呼び出す

### 3.4 useScheduleEditor（3B: ScheduleManager）

スケジュールの作成・編集を管理する。

```typescript
interface UseScheduleEditorReturn {
  schedule: ScheduledSkill | null;
  isDirty: boolean;
  updateCron: (cron: string) => void;
  updatePrompt: (prompt: string) => void;
  save: () => Promise<void>;
}
```

#### 内部実装方針

- `save`: 新規作成時は `skill:schedule:add`、編集時は `skill:schedule:update` を呼び分ける
- `isDirty`: cron または prompt が変更された場合に true

### 3.5 useDebugSession（3C: DebugPanel）

デバッグセッションの管理とリアルタイムイベント購読を行う。

```typescript
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
```

#### 内部実装方針

- `skill:debug:event` を `safeOn` で購読し、リアルタイムイベントで状態を更新
- P5 対策: `useEffect` のクリーンアップ関数でリスナーを確実に解除

```typescript
const useDebugSession = (): UseDebugSessionReturn => {
  const [session, setSession] = useState<DebugSession | null>(null);
  const [status, setStatus] = useState<UseDebugSessionReturn["status"]>("idle");
  const [callStack, setCallStack] = useState<CallStackEntry[]>([]);
  const [steps, setSteps] = useState<DebugStep[]>([]);
  const [variables, setVariables] = useState<Record<string, unknown>>({});
  const [consoleOutput, setConsoleOutput] = useState<
    Array<{ timestamp: string; level: string; message: string }>
  >([]);

  // P5 対策: safeOn のクリーンアップパターン
  useEffect(() => {
    const cleanup = window.electronAPI.skill.onDebugEvent(
      (event: DebugEvent) => {
        switch (event.type) {
          case "step":
            setSteps((prev) => [...prev, event.step]);
            break;
          case "breakpoint-hit":
            setStatus("paused");
            break;
          case "variable-changed":
            setVariables((prev) => ({
              ...prev,
              [event.path]: event.value,
            }));
            break;
          case "session-ended":
            setStatus(event.error ? "error" : "completed");
            break;
        }
      },
    );

    // StrictMode 対策: アンマウント時にリスナーを確実に解除
    return () => cleanup();
  }, []); // 依存配列は空 -- リスナーはマウント時に一度だけ登録

  // startSession, sendCommand, evaluate, inspect ...
  return {
    session,
    status,
    callStack,
    steps,
    variables,
    consoleOutput,
    startSession,
    sendCommand,
    evaluate,
    inspect,
  };
};
```

### 3.6 useBreakpoints（3C: DebugPanel）

ブレークポイントの管理を行う。

```typescript
interface UseBreakpointsReturn {
  breakpoints: Breakpoint[];
  addBreakpoint: (bp: Omit<Breakpoint, "id">) => Promise<void>;
  removeBreakpoint: (id: string) => Promise<void>;
  toggleBreakpoint: (id: string) => void;
}
```

#### 内部実装方針

- `addBreakpoint`: `skill:debug:breakpoint:add` IPC 呼び出し後、レスポンスをローカル状態に追加
- `removeBreakpoint`: `skill:debug:breakpoint:remove` IPC 呼び出し後、ローカル状態から削除
- `toggleBreakpoint`: ローカル状態のみ更新（isEnabled フラグのトグル）

### 3.7 useAnalyticsSummary（3D: AnalyticsDashboard）

分析サマリーデータの取得を管理する。

```typescript
interface UseAnalyticsSummaryReturn {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: (period: AnalyticsPeriod) => Promise<void>;
}
```

#### 内部実装方針

- 初期表示時にデフォルト期間（過去7日）で `skill:analytics:summary` を呼び出す
- `refetch`: 期間変更時に再取得

### 3.8 useUsageTrend（3D: AnalyticsDashboard）

使用トレンドデータの取得を管理する。

```typescript
interface UseUsageTrendReturn {
  trend: UsageTrend | null;
  isLoading: boolean;
  error: string | null;
  refetch: (period: AnalyticsPeriod) => Promise<void>;
}
```

#### 内部実装方針

- 初期表示時にデフォルト期間（過去7日）で `skill:analytics:trend` を呼び出す
- `refetch`: 期間変更時に再取得
- `PeriodSelector` の `onChange` で `refetch` を呼び出す

---

## 4. useState vs agentSlice 個別セレクタの責務境界

### 4.1 責務境界マトリクス

| データ種別           | 管理方法                | アクセスパターン       | ライフサイクル         |
| -------------------- | ----------------------- | ---------------------- | ---------------------- |
| チェーン一覧         | useState (Hook内)       | ビュー内のみ           | ビューマウント時に取得 |
| チェーン編集状態     | useState (Hook内)       | エディター内のみ       | エディター開閉で初期化 |
| スケジュール一覧     | useState (Hook内)       | ビュー内のみ           | ビューマウント時に取得 |
| スケジュール編集状態 | useState (Hook内)       | ダイアログ内のみ       | ダイアログ開閉で初期化 |
| デバッグセッション   | useState (Hook内)       | ビュー内のみ           | セッション開始/終了    |
| ブレークポイント     | useState (Hook内)       | ビュー内のみ           | セッションに紐付き     |
| 分析サマリー         | useState (Hook内)       | ビュー内のみ           | ビューマウント時に取得 |
| トレンドデータ       | useState (Hook内)       | ビュー内のみ           | ビューマウント時に取得 |
| 利用可能スキル一覧   | agentSlice 個別セレクタ | 複数ビューから参照可能 | アプリ起動時にロード済 |

### 4.2 判断フローチャート

```
データは複数ビューで共有されるか?
  ├── Yes → agentSlice 個別セレクタを使用
  │         例: スキル一覧（useAgentSkills()）
  └── No  → データの永続化が必要か?
              ├── Yes → Zustand Slice + persist ミドルウェア
              │         (今回は該当なし)
              └── No  → カスタム Hook 内の useState
                        例: useChainList, useDebugSession 等
```

---

## 5. P31 対策（個別セレクタパターン）の適用方針

### 5.1 問題の概要

合成 Store Hook（例: `useAgentStore()`）は毎回新しいオブジェクトを返すため、そこから取得した関数を `useEffect` の依存配列に含めると無限ループが発生する（P31）。

### 5.2 本タスクでの適用箇所

本タスクの4ビューでは、`agentSlice` への依存は「利用可能スキル一覧の取得」のみに限定される。この場合、以下の個別セレクタを使用する:

```typescript
// P31 対策: 個別セレクタ使用
const skills = useAgentSkills(); // Zustand アクション参照は安定している

// ❌ 合成 Hook 使用（無限ループリスク）
// const { skills } = useAgentStore();
```

### 5.3 カスタム Hook 内での安全性

本タスクのカスタム Hook は全て `useState` ベースであり、以下の理由で P31 リスクはない:

1. `useState` の setter 関数は React が安定性を保証する
2. `useCallback` でラップしたアクション関数も依存配列が変わらない限り安定
3. 外部 Store（agentSlice）へのアクセスは個別セレクタ経由のみ

---

## 6. IPC データフロー

### 6.1 データフロー概要

```
[Renderer]                    [Preload]              [Main Process]

useState (Hook内)
  ↑ 更新
  |
カスタムHook
  ├─ safeInvoke ──→ contextBridge ──→ ipcMain.handle
  │  (request/response)
  └─ safeOn ────→ contextBridge ──→ ipcMain.on / webContents.send
     (event push)                   (skill:debug:event のみ)
```

### 6.2 safeOn イベント購読パターン（3C: DebugPanel 固有）

`skill:debug:event` チャネルのみが Main -> Renderer のプッシュ通知パターンを使用する。他の全チャネルは safeInvoke（request/response）パターン。

```typescript
// useDebugSession 内のイベント購読
useEffect(() => {
  const cleanup = window.electronAPI.skill.onDebugEvent((event) => {
    // イベント処理
  });
  return () => cleanup(); // P5 対策: クリーンアップ
}, []);
```

---

## 7. エラーハンドリング方針

### 7.1 Hook レベルのエラー管理

全カスタム Hook は以下の共通パターンでエラーを管理する:

```typescript
interface HookErrorState {
  error: string | null; // サニタイズ済みエラーメッセージ
}
```

- IPC エラーはサニタイズして `error` 状態に設定する
- 内部情報（スタックトレース、ファイルパス）は含めない
- エラーメッセージはユーザーフレンドリーな日本語テキスト

### 7.2 ビュー別エラーメッセージ

| ビュー          | エラーメッセージ                                                 |
| --------------- | ---------------------------------------------------------------- |
| ChainBuilder    | 「チェーンの取得/保存/実行に失敗しました。再試行してください。」 |
| ScheduleManager | 「スケジュールの取得/更新に失敗しました。再試行してください。」  |
| DebugPanel      | 「デバッグセッションの操作に失敗しました。再試行してください。」 |
| Analytics       | 「分析データの取得に失敗しました。再試行してください。」         |
