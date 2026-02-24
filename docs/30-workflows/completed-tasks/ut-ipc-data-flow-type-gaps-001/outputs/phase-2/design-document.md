# Phase 2: 設計書

## メタ情報

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001                               |
| Phase      | 2                                                            |
| 作成日     | 2026-02-24                                                   |
| タスク種別 | 仕様書修正のみ（実コード変更なし）                           |
| 機能名     | バックエンド型定義と UI Props 間のデータフロー型ギャップ解消 |
| 前提       | Phase 1 要件定義が完了していること                           |

---

## 1. 修正実行順序

依存関係と重要度に基づく実行順序:

| 順序 | Gap   | 対象ファイル                             | 重要度 | 理由                                         |
| ---- | ----- | ---------------------------------------- | ------ | -------------------------------------------- |
| 1    | Gap 6 | task-020b-task-9a-skill-editor.md        | 高     | P44 再発防止。実装時に最初に参照される仕様書 |
| 2    | Gap 5 | task-031b-ui-05b-skill-advanced-views.md | 高     | P5（リスナー二重登録）の直接的リスク         |
| 3    | Gap 1 | 4 ファイル（9f, 9g, 9h, 9j）             | 中     | 横断的な型標準化。14 フィールドに影響        |
| 4    | Gap 2 | task-023b + task-031b                    | 中     | バックエンド/フロントエンドの状態値統一      |
| 5    | Gap 3 | task-030-ui-05-skill-center-view.md      | 中     | IPC データフローの明確化                     |
| 6    | Gap 4 | task-030 + task-022                      | 低     | UI 側の変換ロジック補完                      |

**順序の根拠**:

- Gap 6 は他の Gap の修正パターン（オブジェクト形式）の基礎となる
- Gap 5 はランタイムリスク（二重登録）があるため早期対処が必要
- Gap 1 は 4 ファイルに影響するが、各ファイルの修正は独立しているため並列実行可能
- Gap 2 は Gap 1 の task-9h 修正と同一ファイルなので、Gap 1 の後に実行
- Gap 3, 4 は UI 側のみの修正で、バックエンド側の修正に依存しない

---

## 2. 各 Gap の修正設計

### 設計 1: Gap 6 — task-9a IPC 引数形式の統一

**対象ファイル**: `task-020b-task-9a-skill-editor.md`

#### 修正 1-1: IPC ハンドラ引数のオブジェクト形式統一

task-9a の IPC ハンドラ定義で使用されている positional 形式を、全てオブジェクト形式に統一する。

**Before（positional 形式）**:

```typescript
ipcMain.handle(
  "skill:readFile",
  async (_, skillName: string, relativePath: string) => {
    return fileManager.readFile(skillName, relativePath);
  },
);

ipcMain.handle(
  "skill:writeFile",
  async (_, skillName: string, relativePath: string, content: string) => {
    await fileManager.writeFile(skillName, relativePath, content);
  },
);

ipcMain.handle("skill:listBackups", async (_, skillName: string) => {
  return fileManager.listBackups(skillName);
});
```

**After（オブジェクト形式）**:

```typescript
ipcMain.handle(
  "skill:readFile",
  async (_, args: { skillName: string; filePath: string }) => {
    return fileManager.readFile(args.skillName, args.filePath);
  },
);

ipcMain.handle(
  "skill:writeFile",
  async (_, args: { skillName: string; filePath: string; content: string }) => {
    await fileManager.writeFile(args.skillName, args.filePath, args.content);
  },
);

ipcMain.handle("skill:listBackups", async (_, args: { skillName: string }) => {
  return fileManager.listBackups(args.skillName);
});
```

対応する Preload 側の修正:

```typescript
// Before
safeInvoke(IPC_CHANNELS.SKILL_READ, skillName, filePath);
safeInvoke(IPC_CHANNELS.SKILL_WRITE, skillName, filePath, content);
safeInvoke(IPC_CHANNELS.SKILL_LIST_FILES, skillName);
safeInvoke(IPC_CHANNELS.SKILL_CREATE_FILE, skillName, filePath, content);
safeInvoke(IPC_CHANNELS.SKILL_DELETE_FILE, skillName, filePath);

// After
safeInvoke(IPC_CHANNELS.SKILL_READ, { skillName, filePath });
safeInvoke(IPC_CHANNELS.SKILL_WRITE, { skillName, filePath, content });
safeInvoke(IPC_CHANNELS.SKILL_LIST_FILES, { skillName });
safeInvoke(IPC_CHANNELS.SKILL_CREATE_FILE, { skillName, filePath, content });
safeInvoke(IPC_CHANNELS.SKILL_DELETE_FILE, { skillName, filePath });
```

#### 修正 1-2: P44/P45 再発防止注記の追加

IPC ハンドラ定義セクションの末尾に以下の注意書きを追加:

```markdown
> **P44/P45 再発防止**: IPC 呼び出しは必ずオブジェクト形式（`{ key: value }`）を使用する。
> positional 形式（`arg1, arg2, arg3`）は禁止。
> 引数名はバックエンドハンドラの受け取り側と一致させること（P45 対策）。
> 参照: `.claude/rules/06-known-pitfalls.md#P44`, `#P45`
```

---

### 設計 2: Gap 5 — skill:debug:event の safeOn 購読仕様

**対象ファイル**: `task-031b-ui-05b-skill-advanced-views.md`

#### 修正 2-1: DebugPanel の IPC イベント購読セクション追加

DebugPanel セクションに以下の仕様を追加:

**追加セクション名**: `skill:debug:event イベント購読`

**DebugEvent 型定義**（task-9h から参照）:

```typescript
interface DebugEvent {
  sessionId: string;
  type: "step" | "breakpoint_hit" | "variable_change" | "error" | "completed";
  data: DebugStep | Breakpoint | Record<string, unknown> | Error;
  /** IPC 経由では ISO 8601 文字列（string）として送受信 */
  timestamp: string;
}
```

**購読パターン（P5 対策済み）**:

```typescript
// DebugPanel 内のイベント購読
useEffect(() => {
  // safeOn は cleanup 関数を返す
  const cleanup = window.electronAPI.debug.onDebugEvent((event: DebugEvent) => {
    switch (event.type) {
      case "step":
        updateCurrentStep(event.data as DebugStep);
        break;
      case "breakpoint_hit":
        handleBreakpointHit(event.data as Breakpoint);
        break;
      case "variable_change":
        updateVariables(event.data as Record<string, unknown>);
        break;
      case "error":
        handleDebugError(event.data as Error);
        break;
      case "completed":
        handleSessionCompleted();
        break;
    }
  });

  // StrictMode 対策: クリーンアップでリスナーを確実に解除
  return () => cleanup();
}, []); // 依存配列は空 — マウント時に1度だけ登録
```

**P5 対策注記**:

```markdown
> **P5 対策**: React StrictMode では `useEffect` が2回実行される。
> `safeOn` が返す cleanup 関数を `useEffect` の return で呼び出すことで、
> 1回目のマウントで登録されたリスナーが2回目のマウント前に解除される。
> 参照: `.claude/rules/06-known-pitfalls.md#P5`
```

---

### 設計 3: Gap 1 — Date 型シリアライズ方針の標準化

**対象ファイル**（4 ファイル）:

1. `task-022-task-9f-skill-share.md`
2. `task-023a-task-9g-skill-schedule.md`
3. `task-023b-task-9h-skill-debug.md`
4. `task-023d-task-9j-skill-analytics.md`

#### 共通: IPC シリアライズ方針テーブル

各仕様書の型定義セクション直後に以下の標準テーブルを追加:

```markdown
#### IPC シリアライズ方針

| 型               | IPC 定義（Renderer ↔ Main） | バックエンド内部 | 変換タイミング                      |
| ---------------- | --------------------------- | ---------------- | ----------------------------------- |
| Date             | `string`（ISO 8601）        | `Date`           | ハンドラの戻り値で `.toISOString()` |
| Date（nullable） | `string \| null`            | `Date \| null`   | 同上、`null` はそのまま             |

> Electron の contextBridge（Structured Clone）では Date オブジェクトが保持されるが、
> 将来的な Web 版対応（JSON API）との一貫性のため ISO 8601 文字列に統一する。
```

#### 修正 3-1: task-022-task-9f-skill-share.md（1 フィールド）

```typescript
export interface ImportResult {
  success: boolean;
  skillName: string;
  skillPath: string;
  source: ShareTarget;
  /** @ipc string（ISO 8601）。IPC 経由では .toISOString() に変換 */
  importedAt: Date; // バックエンド内部型。IPC 戻り値: string
}
```

#### 修正 3-2: task-023a-task-9g-skill-schedule.md（4 フィールド）

```typescript
export interface ScheduledSkill {
  id: string;
  skillName: string;
  prompt: string;
  schedule: SkillSchedule;
  enabled: boolean;
  /** @ipc string | null（ISO 8601）。IPC 経由では .toISOString() に変換 */
  lastRun?: Date;
  /** @ipc string | null（ISO 8601）。IPC 経由では .toISOString() に変換 */
  nextRun?: Date;
  runHistory: ScheduledRunResult[];
  notification: NotificationSettings;
}

export interface ScheduledRunResult {
  runId: string;
  /** @ipc string（ISO 8601）。IPC 経由では .toISOString() に変換 */
  startedAt: Date;
  /** @ipc string | null（ISO 8601）。IPC 経由では .toISOString() に変換 */
  completedAt?: Date;
  success: boolean;
  output?: string;
  error?: string;
}
```

#### 修正 3-3: task-023b-task-9h-skill-debug.md（3 フィールド）

```typescript
export interface DebugSession {
  id: string;
  skillName: string;
  status: "idle" | "running" | "paused" | "completed" | "error"; // Gap 2 で idle 追加
  breakpoints: Breakpoint[];
  currentStep?: DebugStep;
  variables: Record<string, unknown>;
  callStack: CallStackEntry[];
  /** @ipc string（ISO 8601）。IPC 経由では .toISOString() に変換 */
  startedAt: Date;
}

export interface DebugStep {
  stepNumber: number;
  type: "tool_call" | "hook_execution" | "agent_response";
  toolName?: string;
  hookType?: string;
  input?: unknown;
  output?: unknown;
  /** @ipc string（ISO 8601）。IPC 経由では .toISOString() に変換 */
  timestamp: Date;
}

export interface CallStackEntry {
  depth: number;
  name: string;
  type: "skill" | "agent" | "tool";
  /** @ipc string（ISO 8601）。IPC 経由では .toISOString() に変換 */
  startTime: Date;
}
```

#### 修正 3-4: task-023d-task-9j-skill-analytics.md（6 フィールド）

対象フィールド:

- `SkillUsageEvent.timestamp: Date`
- `AnalyticsPeriod.start: Date`
- `AnalyticsPeriod.end: Date`
- `TrendDataPoint.timestamp: Date`
- `SkillStatistics.lastUsed?: Date`
- `SkillUsageSummary.lastUsed?: Date`

```typescript
export interface SkillUsageEvent {
  id: string;
  skillName: string;
  eventType: "execution" | "error" | "cancellation";
  /** @ipc string（ISO 8601）。IPC 経由では .toISOString() に変換 */
  timestamp: Date;
  duration?: number;
  success: boolean;
  errorMessage?: string;
  toolsUsed: string[];
  tokenCount?: number;
}

export interface AnalyticsPeriod {
  /** @ipc string（ISO 8601）。Renderer から受信時は new Date(isoString) で復元 */
  start: Date;
  /** @ipc string（ISO 8601）。Renderer から受信時は new Date(isoString) で復元 */
  end: Date;
  granularity: "hour" | "day" | "week" | "month";
}

export interface TrendDataPoint {
  /** @ipc string（ISO 8601）。IPC 経由では .toISOString() に変換 */
  timestamp: Date;
  executions: number;
  errors: number;
  avgDuration: number;
}

export interface SkillStatistics {
  skillName: string;
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  /** @ipc string | null（ISO 8601）。IPC 経由では .toISOString() に変換 */
  lastUsed?: Date;
  mostUsedTools: ToolUsageStat[];
  errorRate: number;
  totalTokens: number;
}

export interface SkillUsageSummary {
  skillName: string;
  totalExecutions: number;
  successRate: number;
  /** @ipc string | null（ISO 8601）。IPC 経由では .toISOString() に変換 */
  lastUsed?: Date;
  trend: "up" | "down" | "stable";
}
```

---

### 設計 4: Gap 2 — DebugSession.status に idle 追加

**対象ファイル**:

1. `task-023b-task-9h-skill-debug.md`（バックエンド側）
2. `task-031b-ui-05b-skill-advanced-views.md`（フロントエンド側 — 整合性確認注記のみ）

#### 修正 4-1: DebugSession 型の修正

**Before**:

```typescript
export interface DebugSession {
  id: string;
  skillName: string;
  status: "running" | "paused" | "completed" | "error";
  // ...
}
```

**After**:

```typescript
export interface DebugSession {
  id: string;
  skillName: string;
  status: "idle" | "running" | "paused" | "completed" | "error";
  // ...
}
```

#### 修正 4-2: status 値の説明テーブル追加

| 状態        | 説明                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `idle`      | デバッグセッション未開始の初期状態。DebugPanel マウント時のデフォルト |
| `running`   | デバッグ実行中                                                        |
| `paused`    | ブレークポイントまたは手動でのポーズ状態                              |
| `completed` | デバッグが正常完了                                                    |
| `error`     | デバッグ中にエラーが発生                                              |

#### 修正 4-3: idle 状態のセッション初期値

```typescript
const initialDebugSession: Partial<DebugSession> = {
  status: "idle",
  breakpoints: [],
  variables: {},
  callStack: [],
};
```

#### 修正 4-4: task-031b の整合性注記

DebugControlsProps の定義付近に以下を追加:

```markdown
> `sessionStatus` の値はバックエンド `DebugSession.status`（task-9h）と完全一致する。
> `idle` はデバッグセッション未開始の初期状態を表す。
```

---

### 設計 5: Gap 3 — DocPreview の onExport データフロー

**対象ファイル**: `task-030-ui-05-skill-center-view.md`

#### 修正 5-1: DocPreviewProps 型定義の修正

**Before**:

```typescript
interface DocPreviewProps {
  doc: GeneratedDoc | null;
  isLoading: boolean;
  onExport: (format: string, path: string) => void;
  onCopy: () => void;
  onClose: () => void;
}
```

**After**:

```typescript
interface DocPreviewProps {
  doc: GeneratedDoc | null;
  isLoading: boolean;
  onExport: (docId: string, format: string, outputPath: string) => void;
  onCopy: () => void;
  onClose: () => void;
}
```

#### 修正 5-2: IPC データフロー図の追加

```
Renderer (DocPreview)
│
│ onExport(docId, format, outputPath) を呼び出し
│
▼
Preload (contextBridge)
│
│ safeInvoke(IPC_CHANNELS.SKILL_DOCS_EXPORT, { docId, format, outputPath })
│ → 引数型: { docId: string; format: string; outputPath: string }
│
▼
Main Process (IPC Handler)
│
│ 1. docId からキャッシュ済み GeneratedDoc を取得
│ 2. format に基づいてエクスポート処理（exportToFile）
│ 3. 結果を返却
│ → 戻り値型: { success: boolean; outputPath: string; error?: string }
│
▼
Renderer (DocPreview)
│
│ 成功: エクスポート完了通知を表示
│ 失敗: エラーメッセージを表示
```

> **設計判断**: Renderer から Main へ `GeneratedDoc` オブジェクト全体を渡すのではなく、
> `docId` を渡して Main 側でキャッシュから取得する方式を採用する。
> これにより IPC 経由で大きなオブジェクトを転送するコストを回避する。

---

### 設計 6: Gap 4 — ExportResult 変換ロジック

**対象ファイル**:

1. `task-030-ui-05-skill-center-view.md`（フロントエンド側）
2. `task-022-task-9f-skill-share.md`（バックエンド側 — 補足注記のみ）

#### 修正 6-1: ExportSkillDialog 変換ロジック追加

ExportSkillDialog セクションに以下を追加:

```typescript
const handleExport = async (target: ShareTarget, options: ExportOptions) => {
  try {
    const result: ExportResult = await window.electronAPI.skill.exportSkill({
      skillName,
      target,
      options,
    });

    if (result.success) {
      // 成功: shareUrl を親コンポーネントに通知
      onExportComplete(result.shareUrl);
    } else {
      // 失敗: ダイアログ内にエラーを表示（親には通知しない）
      setExportError("エクスポートに失敗しました。再度お試しください。");
      setIsRetryEnabled(true);
    }
  } catch (error) {
    // IPC エラー: ダイアログ内にエラーを表示
    setExportError("通信エラーが発生しました。");
    setIsRetryEnabled(true);
  }
};
```

**エラーハンドリング仕様テーブル**:

| 条件                           | 動作                                                |
| ------------------------------ | --------------------------------------------------- |
| `result.success === true`      | `onExportComplete(result.shareUrl)` を呼び出し      |
| `result.success === false`     | ダイアログ内にエラーメッセージ + リトライボタン     |
| IPC 通信エラー（catch）        | ダイアログ内に通信エラーメッセージ + リトライボタン |
| `shareUrl` が undefined の場合 | `onExportComplete(undefined)` — URL なしで完了      |

#### 修正 6-2: task-022 への補足注記

ExportResult 型定義の付近に以下を追加:

```markdown
> **フロントエンド連携**: ExportResult は IPC 経由で Renderer に返される。
> Renderer 側（ExportSkillDialog）は `success` フラグで分岐し、
> 成功時は `shareUrl` を親コンポーネントに通知する。
> 詳細: `task-030-ui-05-skill-center-view.md` の ExportSkillDialog セクション参照。
```

---

## 3. 仕様書間の相互参照マトリクス

修正後に成立すべき参照関係:

| #   | 参照元                           | 参照先                               | 参照内容                                           |
| --- | -------------------------------- | ------------------------------------ | -------------------------------------------------- |
| 1   | task-031b（05B DebugPanel）      | task-023b（9h DebugSession）         | `DebugEvent` 型定義、`status` 値の一致             |
| 2   | task-031b（05B DebugControls）   | task-023b（9h DebugSession）         | `sessionStatus` = `DebugSession.status` の整合注記 |
| 3   | task-030（05 DocPreview）        | task-023c（9i exportToFile）         | onExport の IPC データフロー                       |
| 4   | task-030（05 ExportSkillDialog） | task-022（9f ExportResult）          | ExportResult → onExportComplete 変換               |
| 5   | task-022（9f ExportResult）      | task-030（05 ExportSkillDialog）     | フロントエンド連携の補足注記                       |
| 6   | task-020b（9a IPC ハンドラ）     | `.claude/rules/06-known-pitfalls.md` | P44, P45 再発防止規約                              |
| 7   | 全 Date 型仕様書（4 ファイル）   | IPC シリアライズ方針テーブル         | ISO 8601 文字列への統一                            |

---

## 4. リスク分析

| リスク                            | 影響度 | 対策                                         |
| --------------------------------- | ------ | -------------------------------------------- |
| Date フィールドの修正漏れ         | 中     | Phase 7 で grep ベースの網羅性検証           |
| positional 形式の残存             | 高     | Phase 6 で safeInvoke のオブジェクト形式検証 |
| status 値セットの不一致           | 高     | Phase 6 で横断整合性検証                     |
| P5 対策不足                       | 高     | Phase 6 で Pitfall 参照検証                  |
| SkillUsageSummary.lastUsed の漏れ | 低     | Phase 7 で全 Date フィールドのカウント検証   |

---

## 5. 完了条件チェックリスト

- [x] 6 つの Gap 全てに具体的な修正内容が設計されている
- [x] 各修正の Before/After が明確に記載されている
- [x] 修正の実行順序（Gap 6 → 5 → 1 → 2 → 3 → 4）が定義されている
- [x] 仕様書間の相互参照マトリクスが作成されている
- [x] 各修正で追加するセクション・注記の具体的なマークダウンが示されている
- [x] task-9a のハンドラ側（ipcMain.handle）とPreload側（safeInvoke）の両方が設計されている
- [x] SkillUsageSummary.lastUsed を含む全 14 Date フィールドが設計に含まれている
