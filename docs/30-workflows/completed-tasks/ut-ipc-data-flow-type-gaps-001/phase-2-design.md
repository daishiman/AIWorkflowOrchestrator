# Phase 2: 設計

## メタ情報

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| Phase      | 2                                                            |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001                               |
| 機能名     | バックエンド型定義と UI Props 間のデータフロー型ギャップ解消 |
| 作成日     | 2026-02-24                                                   |
| タスク種別 | 仕様書修正のみ（実コード変更なし）                           |
| 前提       | Phase 1 要件定義が完了していること                           |

## 目的

Phase 1 で特定した 6 つの型ギャップに対して、各仕様書の具体的な修正内容を設計する。修正は Gap 優先順位に従い、実行順序を定義する。

## 実行タスク

- 修正順序設計: 6 Gap の依存関係に基づく実行順序を定義する
- 仕様修正設計: 各 Gap の Before/After と型契約を設計する
- 参照整合設計: 相互参照マトリクスとチェック観点を設計する

| #   | タスク名                       | 説明                                                                       |
| --- | ------------------------------ | -------------------------------------------------------------------------- |
| 1   | Gap 修正実行順序の設計         | 6 つの Gap の優先順位に基づいた修正実行順序を定義する                      |
| 2   | 各 Gap の修正設計              | Gap 6 → 5 → 1 → 2 → 3 → 4 の順で具体的な修正内容（Before/After）を設計する |
| 3   | 仕様書間相互参照マトリクス作成 | 修正後に成立すべき仕様書間の参照関係を整理する                             |

## 参照資料

| 資料                       | パス                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Phase 1 要件定義書         | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-1-requirements.md`                               |
| Phase 1 抽出成果物         | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-1/aiworkflow-requirements-extraction.md` |
| task-011 元仕様書          | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-011-ut-ipc-data-flow-type-gaps-001.md`            |
| IPC API 仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                     |
| Skill IPC セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                |
| IPC セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                             |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                              |
| Skill インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                        |

---

## 実行順序

優先順位に基づき、以下の順で修正を実行する:

| 順序 | Gap   | 重要度 | 理由                                         |
| ---- | ----- | ------ | -------------------------------------------- |
| 1    | Gap 6 | 高     | P44 再発防止。実装時に最初に参照される仕様書 |
| 2    | Gap 5 | 高     | P5（リスナー二重登録）の直接的なリスク       |
| 3    | Gap 1 | 中     | 4 つの仕様書に影響する横断的な修正           |
| 4    | Gap 2 | 中     | フロントエンドとバックエンドの状態値統一     |
| 5    | Gap 3 | 中     | IPC データフローの明確化                     |
| 6    | Gap 4 | 低     | UI 側の表示ロジック補完                      |

---

## 修正設計

### 設計 1: Gap 6 — task-9a IPC 引数形式の統一

**対象ファイル**: `task-020b-task-9a-skill-editor.md`

#### 修正方針

task-9a（Step 2: Preload API 拡張）のコード例で使用されている positional 形式の `safeInvoke` 呼び出しを、全てオブジェクト形式に統一する。

#### 修正箇所と内容

**修正 1-1: safeInvoke 呼び出しパターンの統一**

Step 2 のコード例を以下のように修正する:

```typescript
// ❌ 修正前（positional 形式）
safeInvoke(IPC_CHANNELS.SKILL_READ, skillName, filePath);
safeInvoke(IPC_CHANNELS.SKILL_WRITE, skillName, filePath, content);
safeInvoke(IPC_CHANNELS.SKILL_LIST_FILES, skillName);
safeInvoke(IPC_CHANNELS.SKILL_CREATE_FILE, skillName, filePath, content);
safeInvoke(IPC_CHANNELS.SKILL_DELETE_FILE, skillName, filePath);

// ✅ 修正後（オブジェクト形式）
safeInvoke(IPC_CHANNELS.SKILL_READ, { skillName, filePath });
safeInvoke(IPC_CHANNELS.SKILL_WRITE, { skillName, filePath, content });
safeInvoke(IPC_CHANNELS.SKILL_LIST_FILES, { skillName });
safeInvoke(IPC_CHANNELS.SKILL_CREATE_FILE, { skillName, filePath, content });
safeInvoke(IPC_CHANNELS.SKILL_DELETE_FILE, { skillName, filePath });
```

**修正 1-2: P44/P45 再発防止注記の追加**

Step 2 セクションの末尾に以下の注意書きを追加する:

```markdown
> **P44/P45 再発防止**: IPC 呼び出しは必ずオブジェクト形式（`{ key: value }`）を使用する。
> positional 形式（`arg1, arg2, arg3`）は禁止。
> 引数名はバックエンドハンドラの受け取り側と一致させること（P45 対策）。
> 参照: `.claude/rules/06-known-pitfalls.md#P44`, `#P45`
```

---

### 設計 2: Gap 5 — skill:debug:event の safeOn 購読仕様

**対象ファイル**: `task-031b-ui-05b-skill-advanced-views.md`

#### 修正方針

DebugPanel セクションに `skill:debug:event` の safeOn 購読仕様を追加する。P5（リスナー二重登録）対策として、`useEffect` + cleanup パターンを明記する。

#### 修正箇所と内容

**修正 2-1: DebugPanel の IPC イベント購読セクション追加**

DebugPanel（または DebugControls）のセクションに、以下の仕様を追加する:

```markdown
#### skill:debug:event イベント購読

DebugPanel は Main Process から送信されるデバッグイベント（`skill:debug:event`）を `safeOn` パターンで購読する。

**DebugEvent 型定義**（task-9h から参照）:

\`\`\`typescript
interface DebugEvent {
sessionId: string;
type: "step" | "breakpoint\*hit" | "variable_change" | "error" | "completed";
data: DebugStep | Breakpoint | Record<string, unknown> | Error;
/\*\* IPC 経由では ISO 8601 文字列（string）として送受信 \_/
timestamp: string;
}
\`\`\`

**購読パターン（P5 対策済み）**:

\`\`\`typescript
// DebugPanel 内のイベント購読
useEffect(() => {
// safeOn は cleanup 関数を返す
const cleanup = window.electronAPI.debug.onDebugEvent(
(event: DebugEvent) => {
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
}
);

// StrictMode 対策: クリーンアップでリスナーを確実に解除
return () => cleanup();
}, []); // 依存配列は空 — マウント時に1度だけ登録
\`\`\`

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

#### 修正方針

各仕様書の型定義セクションに IPC シリアライズ注記を追加する。バックエンド内部型（`Date`）と IPC 転送型（`string`）を明確に分離する。

#### 共通の追加セクション

各仕様書の型定義セクション直後に以下の標準テーブルを追加する:

```markdown
#### IPC シリアライズ方針

| 型               | IPC 定義（Renderer ↔ Main） | バックエンド内部 | 変換タイミング                      |
| ---------------- | --------------------------- | ---------------- | ----------------------------------- |
| Date             | `string`（ISO 8601）        | `Date`           | ハンドラの戻り値で `.toISOString()` |
| Date（nullable） | `string \| null`            | `Date \| null`   | 同上、`null` はそのまま             |

> Electron の contextBridge（Structured Clone）では Date オブジェクトが保持されるが、
> 将来的な Web 版対応（JSON API）との一貫性のため ISO 8601 文字列に統一する。
```

#### 個別ファイルの修正内容

**修正 3-1: task-022-task-9f-skill-share.md**

`ImportResult` 型定義に注記を追加:

```typescript
export interface ImportResult {
  success: boolean;
  skillName: string;
  skillPath: string;
  source: ShareTarget;
  /** IPC 経由では ISO 8601 文字列（string）として送受信 */
  importedAt: Date; // バックエンド内部型。IPC 戻り値: string
}
```

**修正 3-2: task-023a-task-9g-skill-schedule.md**

以下のフィールドに注記を追加:

- `ScheduledSkill.lastRun?: Date` → JSDoc に `@ipc string | null（ISO 8601）` を追記
- `ScheduledSkill.nextRun?: Date` → 同上
- `ScheduledRunResult.startedAt: Date` → JSDoc に `@ipc string（ISO 8601）` を追記
- `ScheduledRunResult.completedAt?: Date` → JSDoc に `@ipc string | null（ISO 8601）` を追記

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

**修正 3-3: task-023b-task-9h-skill-debug.md**

以下のフィールドに注記を追加:

- `DebugSession.startedAt: Date` → JSDoc に `@ipc string（ISO 8601）` を追記
- `DebugStep.timestamp: Date` → 同上
- `CallStackEntry.startTime: Date` → 同上

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

**修正 3-4: task-023d-task-9j-skill-analytics.md**

以下のフィールドに注記を追加:

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
```

---

### 設計 4: Gap 2 — DebugSession.status に idle 追加

**対象ファイル**:

1. `task-023b-task-9h-skill-debug.md`（バックエンド側）
2. `task-031b-ui-05b-skill-advanced-views.md`（フロントエンド側 — 整合性確認のみ）

#### 修正方針

task-9h の `DebugSession.status` に `idle` を追加し、初期状態の説明を追記する。05B 側は既に `idle` を含むため修正不要だが、整合性の確認注記を追加する。

#### 修正箇所と内容

**修正 4-1: task-023b-task-9h-skill-debug.md — DebugSession 型**

```typescript
// ❌ 修正前
export interface DebugSession {
  id: string;
  skillName: string;
  status: "running" | "paused" | "completed" | "error";
  // ...
}

// ✅ 修正後
export interface DebugSession {
  id: string;
  skillName: string;
  status: "idle" | "running" | "paused" | "completed" | "error";
  // ...
}
```

**修正 4-2: idle 状態の説明追加**

`DebugSession.status` の説明セクションに以下を追加:

```markdown
| 状態        | 説明                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `idle`      | デバッグセッション未開始の初期状態。DebugPanel マウント時のデフォルト |
| `running`   | デバッグ実行中                                                        |
| `paused`    | ブレークポイントまたは手動でのポーズ状態                              |
| `completed` | デバッグが正常完了                                                    |
| `error`     | デバッグ中にエラーが発生                                              |
```

**修正 4-3: idle 状態のセッション初期値**

```typescript
// DebugPanel の初期状態（セッション未開始）
const initialDebugSession: Partial<DebugSession> = {
  status: "idle",
  breakpoints: [],
  variables: {},
  callStack: [],
};
```

**修正 4-4: task-031b-ui-05b-skill-advanced-views.md — 整合性注記**

DebugControlsProps の定義付近に以下の注記を追加:

```markdown
> `sessionStatus` の値はバックエンド `DebugSession.status`（task-9h）と完全一致する。
> `idle` はデバッグセッション未開始の初期状態を表す。
```

---

### 設計 5: Gap 3 — DocPreview の onExport データフロー

**対象ファイル**: `task-030-ui-05-skill-center-view.md`

#### 修正方針

`DocPreviewProps.onExport` を docId ベースのインターフェースに修正し、Renderer → Main の IPC データフロー図を追加する。

#### 修正箇所と内容

**修正 5-1: DocPreviewProps 型定義の修正**

```typescript
// ❌ 修正前
interface DocPreviewProps {
  doc: GeneratedDoc | null;
  isLoading: boolean;
  onExport: (format: string, path: string) => void;
  onCopy: () => void;
  onClose: () => void;
}

// ✅ 修正後
interface DocPreviewProps {
  doc: GeneratedDoc | null;
  isLoading: boolean;
  onExport: (docId: string, format: string, outputPath: string) => void;
  onCopy: () => void;
  onClose: () => void;
}
```

**修正 5-2: IPC データフロー図の追加**

DocPreview セクションに以下のフロー図を追加:

```markdown
#### onExport の IPC データフロー

\`\`\`
Renderer (DocPreview)
│
│ onExport(docId, format, outputPath) を呼び出し
│
▼
Preload (contextBridge)
│
│ safeInvoke(IPC_CHANNELS.SKILL_DOCS_EXPORT, { docId, format, outputPath })
│
▼
Main Process (IPC Handler)
│
│ 1. docId からキャッシュ済み GeneratedDoc を取得
│ 2. format に基づいてエクスポート処理（exportToFile）
│ 3. 結果を返却
│
▼
Renderer (DocPreview)
│
│ 成功: エクスポート完了通知を表示
│ 失敗: エラーメッセージを表示
\`\`\`

> **設計判断**: Renderer から Main へ `GeneratedDoc` オブジェクト全体を渡すのではなく、
> `docId` を渡して Main 側でキャッシュから取得する方式を採用する。
> これにより IPC 経由で大きなオブジェクトを転送するコストを回避する。
```

---

### 設計 6: Gap 4 — ExportResult 変換ロジック

**対象ファイル**:

1. `task-030-ui-05-skill-center-view.md`（フロントエンド側）
2. `task-022-task-9f-skill-share.md`（バックエンド側 — 補足注記のみ）

#### 修正方針

ExportSkillDialog セクションに、`ExportResult` から `onExportComplete` コールバックへの変換ロジックと、エラーハンドリングの仕様を追記する。

#### 修正箇所と内容

**修正 6-1: task-030-ui-05-skill-center-view.md — ExportSkillDialog 変換ロジック**

ExportSkillDialog セクションに以下を追加:

```markdown
#### ExportResult → onExportComplete 変換ロジック

ExportSkillDialog 内部で IPC 呼び出しの結果（`ExportResult`）を受け取り、
`onExportComplete` コールバックに変換する:

\`\`\`typescript
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
\`\`\`

**エラーハンドリング仕様**:

| 条件                           | 動作                                                |
| ------------------------------ | --------------------------------------------------- |
| `result.success === true`      | `onExportComplete(result.shareUrl)` を呼び出し      |
| `result.success === false`     | ダイアログ内にエラーメッセージ + リトライボタン     |
| IPC 通信エラー（catch）        | ダイアログ内に通信エラーメッセージ + リトライボタン |
| `shareUrl` が undefined の場合 | `onExportComplete(undefined)` — URL なしで完了      |
```

**修正 6-2: task-022-task-9f-skill-share.md — 補足注記**

ExportResult 型定義の付近に以下を追加:

```markdown
> **フロントエンド連携**: ExportResult は IPC 経由で Renderer に返される。
> Renderer 側（ExportSkillDialog）は `success` フラグで分岐し、
> 成功時は `shareUrl` を親コンポーネントに通知する。
> 詳細: `task-030-ui-05-skill-center-view.md` の ExportSkillDialog セクション参照。
```

---

## 仕様書間の相互参照マトリクス

修正後に以下の相互参照が成立していることを確認する:

| 参照元                                                     | 参照先                                             | 参照内容                               |
| ---------------------------------------------------------- | -------------------------------------------------- | -------------------------------------- |
| `task-031b-ui-05b-skill-advanced-views.md`（DebugPanel）   | `task-023b-task-9h-skill-debug.md`（DebugSession） | `DebugEvent` 型定義、`status` 値の一致 |
| `task-030-ui-05-skill-center-view.md`（DocPreview）        | `task-023c-task-9i-skill-docs.md`（exportToFile）  | onExport の IPC データフロー           |
| `task-030-ui-05-skill-center-view.md`（ExportSkillDialog） | `task-022-task-9f-skill-share.md`（ExportResult）  | ExportResult → onExportComplete 変換   |
| `task-020b-task-9a-skill-editor.md`（Step 2）              | `.claude/rules/06-known-pitfalls.md`（P44, P45）   | IPC 引数形式の統一規約                 |
| 全 Date 型フィールドの仕様書                               | task-011 のシリアライズ方針テーブル                | ISO 8601 文字列への統一                |

---

## 統合テスト連携

| 連携観点           | 実施内容                                                                    | 検証先                          |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------- |
| IPC 契約整合       | Renderer → Preload → Main の引数型/戻り値型を突合し、契約ドリフトを防止する | Phase 4〜7 の検証コマンドと結果 |
| 型変換整合         | Date/ISO 8601・ExportResult 変換・DebugEvent ペイロードの境界変換を確認する | 修正対象 7 仕様書 + Phase 6/7   |
| イベント購読安全性 | safeOn + cleanup による二重登録防止（P5）を確認する                         | 05B 仕様書 + Phase 6/9          |

## 成果物

| 成果物 | パス                                                                                 | 説明             |
| ------ | ------------------------------------------------------------------------------------ | ---------------- |
| 設計書 | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-2-design.md` | 6 Gap の修正設計 |

## 完了条件

- [ ] 6 つの Gap 全てに具体的な修正内容が設計されている
- [ ] 各修正の Before/After が明確に記載されている
- [ ] 修正の実行順序（Gap 6 → 5 → 1 → 2 → 3 → 4）が定義されている
- [ ] 仕様書間の相互参照マトリクスが作成されている
- [ ] 各修正で追加するセクション・注記の具体的なマークダウンが示されている

## 次の Phase

Phase 3: 設計レビュー
