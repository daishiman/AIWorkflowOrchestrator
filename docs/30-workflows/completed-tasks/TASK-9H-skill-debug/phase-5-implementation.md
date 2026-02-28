# Phase 5: 実装（TDD: Green）— TASK-9H スキルデバッグモード

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 5                                                      |
| タスクID   | TASK-9H                                                |
| 機能名     | スキルデバッグモード                                   |
| 作成日     | 2026-02-27                                             |
| 前提Phase  | Phase 4（テスト作成・Red状態確認）                     |
| 依存タスク | TASK-9B-I（SDK正式統合）、TASK-9A-B（ファイル編集IPC） |

## 目的

Phase 4 で作成した全テスト（101テスト）を通すための**最小限のプロダクションコード**を実装し、全テストが **Green 状態**（成功）であることを確認する。

## 実行タスク

### Step 1: 型定義追加

#### 1.1 共有型定義ファイル作成

**対象ファイル**: `packages/shared/src/types/skill-debug.ts`（新規作成）

以下の型を定義する:

```typescript
/**
 * スキルデバッグモード型定義
 *
 * TASK-9H: スキル実行時のデバッグ機能
 *
 * IPC シリアライズ方針:
 * - Main Process 内部: Date オブジェクト使用
 * - IPC 境界: .toISOString() で ISO 8601 文字列変換
 * - Renderer 側: string として受け取り、表示時に new Date() で復元
 */

export interface DebugSession {
  id: string;
  skillName: string;
  status: DebugSessionStatus;
  breakpoints: Breakpoint[];
  currentStep?: DebugStep;
  variables: Record<string, unknown>;
  callStack: CallStackEntry[];
  startedAt: string; // ISO 8601
}

export type DebugSessionStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "error";

export interface Breakpoint {
  id: string;
  type: BreakpointType;
  condition?: string;
  toolName?: string;
  hookType?: HookType;
  enabled: boolean;
}

export type BreakpointType = "tool" | "hook" | "step";

export type HookType = "PreToolUse" | "PostToolUse";

export interface DebugStep {
  stepNumber: number;
  type: DebugStepType;
  toolName?: string;
  hookType?: string;
  input?: unknown;
  output?: unknown;
  timestamp: string; // ISO 8601
}

export type DebugStepType = "tool_call" | "hook_execution" | "agent_response";

export interface CallStackEntry {
  depth: number;
  name: string;
  type: CallStackEntryType;
  startTime: string; // ISO 8601
}

export type CallStackEntryType = "skill" | "agent" | "tool";

export type DebugEvent =
  | { type: "step"; sessionId: string; step: DebugStep }
  | {
      type: "breakpoint-hit";
      sessionId: string;
      breakpoint: Breakpoint;
      step?: DebugStep;
    }
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
      completedAt?: string;
    };

export type DebugCommand =
  | "continue"
  | "stepOver"
  | "stepInto"
  | "stepOut"
  | "pause"
  | "stop";
```

#### 1.2 re-export 追加

**対象ファイル**: `packages/shared/src/types/index.ts`（変更）

末尾に以下の1行を追加する:

```typescript
// スキルデバッグ型定義 (TASK-9H)
export * from "./skill-debug";
```

**追加位置**: `export * from "./skill-improver"` の直下

---

### Step 2: DebugSession クラス実装

**対象ファイル**: `apps/desktop/src/main/services/skill/DebugSession.ts`（新規作成）

#### 2.1 クラス構造

```
DebugSession.ts
├── import 宣言（型定義は @repo/shared から）
├── VALID_TRANSITIONS: Record<DebugSessionStatus, DebugSessionStatus[]>
├── class DebugSession
│   ├── private _id: string
│   ├── private _skillName: string
│   ├── private _status: DebugSessionStatus
│   ├── private _breakpoints: Breakpoint[]
│   ├── private _currentStep?: DebugStep
│   ├── private _variables: Record<string, unknown>
│   ├── private _callStack: CallStackEntry[]
│   ├── private _startedAt: string
│   ├── private _stepHistory: DebugStep[]
│   ├── private _stepCounter: number
│   ├── constructor(id, skillName, breakpoints)
│   ├── // 状態遷移メソッド
│   ├── start(): void
│   ├── pause(): void
│   ├── resume(): void
│   ├── complete(): void
│   ├── fail(error: string): void
│   ├── // 変数管理
│   ├── setVariable(key, value): void
│   ├── getVariables(): Record<string, unknown>
│   ├── clearVariables(): void
│   ├── // コールスタック管理
│   ├── pushCallStack(name, type): void
│   ├── popCallStack(): CallStackEntry | undefined
│   ├── // ステップ管理
│   ├── recordStep(type, options?): DebugStep
│   ├── getStepHistory(): DebugStep[]
│   ├── // シリアライズ
│   └── toJSON(): DebugSession（型定義のinterface形式）
```

#### 2.2 状態遷移テーブル

```typescript
const VALID_TRANSITIONS: Record<DebugSessionStatus, DebugSessionStatus[]> = {
  idle: ["running"],
  running: ["paused", "completed", "error"],
  paused: ["running", "completed"],
  completed: [],
  error: [],
};
```

全ての状態遷移メソッド（start, pause, resume, complete, fail）は、遷移先が `VALID_TRANSITIONS[currentStatus]` に含まれない場合に `Error("Invalid state transition: <from> -> <to>")` をスローする。

#### 2.3 変数管理の実装仕様

- `setVariable(key: string, value: unknown)`: `this._variables[key] = value` で設定する
- `getVariables()`: `{ ...this._variables }` でシャローコピーを返す（内部状態の変更防止）
- `clearVariables()`: `this._variables = {}` で全クリアする

#### 2.4 コールスタックの実装仕様

- `pushCallStack(name: string, type: CallStackEntryType)`:
  - `depth` は `this._callStack.length`（0始まり）
  - `startTime` は `new Date().toISOString()`
  - `this._callStack.push(entry)` で追加
- `popCallStack()`:
  - `this._callStack.length === 0` の場合は `undefined` を返す
  - `this._callStack.pop()` で最後のエントリを削除して返す

#### 2.5 ステップ管理の実装仕様

- `recordStep(type: DebugStepType, options?: { toolName?, hookType?, input?, output? })`:
  - `this._stepCounter++` でインクリメント
  - `timestamp` は `new Date().toISOString()`
  - `this._currentStep = step` で現在ステップを更新
  - `this._stepHistory.push(step)` で履歴に追加
  - 作成した `DebugStep` を返す
- `getStepHistory()`: `[...this._stepHistory]` でコピーを返す

---

### Step 3: SkillDebugger クラス実装

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillDebugger.ts`（新規作成）

#### 3.1 クラス構造

```
SkillDebugger.ts
├── import 宣言
├── class SkillDebugger
│   ├── private sessions: Map<string, DebugSession>
│   ├── private mainWindow: BrowserWindow
│   ├── private skillExecutor: SkillExecutor
│   ├── private resolveResumeMap: Map<string, () => void>
│   ├── constructor(mainWindow, skillExecutor)
│   ├── // セッション管理
│   ├── async startDebugSession(skillName, prompt, breakpoints): Promise<DebugSession>
│   ├── async executeCommand(sessionId, command): Promise<void>
│   ├── // ブレークポイント管理
│   ├── async addBreakpoint(sessionId, breakpoint): Promise<Breakpoint>
│   ├── async removeBreakpoint(sessionId, breakpointId): Promise<void>
│   ├── // インスペクション
│   ├── async inspectVariable(sessionId, path): Promise<unknown>
│   ├── async evaluateExpression(sessionId, expression): Promise<unknown>
│   ├── // Hooks 統合
│   ├── createHooks(session): { PreToolUse, PostToolUse }
│   ├── private shouldBreak(session, step): boolean
│   ├── private emitDebugEvent(event): void
│   ├── // 内部ヘルパー
│   ├── private getSession(sessionId): DebugSession
│   ├── private waitForResume(sessionId): Promise<void>
│   └── private resolveResume(sessionId): void
```

#### 3.2 セッション管理の実装仕様

- `startDebugSession(skillName: string, prompt: string, breakpoints: Breakpoint[])`:
  1. `v4()` で UUID を生成し、`new DebugSession(id, skillName, breakpoints)` を作成
  2. `this.sessions.set(id, session)` で保存
  3. `session.toJSON()` を返す

- `executeCommand(sessionId: string, command: DebugCommand)`:
  1. `this.getSession(sessionId)` でセッション取得（見つからなければ Error）
  2. コマンドに応じた状態遷移:
     - `"continue"`: session が paused または idle の場合 → `session.resume()` または `session.start()`、`this.resolveResume(sessionId)`
     - `"pause"`: session が running の場合 → `session.pause()`
     - `"stop"`: session が running または paused の場合 → `session.complete()`、`emitDebugEvent({ type: "session-ended", sessionId })`
     - `"stepOver"`: session が paused の場合 → `session.recordStep(...)` で次ステップ実行、`emitDebugEvent({ type: "step", sessionId, step })`
     - `"stepInto"`: session が paused の場合 → `session.pushCallStack(...)`、次ステップ実行
     - `"stepOut"`: session が paused の場合 → `session.popCallStack()`、次ステップ実行
  3. completed セッションへのコマンドは `Error("Cannot execute command on completed session")`
  4. idle セッションへの pause は `Error("Cannot pause idle session")`

#### 3.3 ブレークポイント管理の実装仕様

- `addBreakpoint(sessionId: string, breakpoint: Omit<Breakpoint, "id">)`:
  1. `this.getSession(sessionId)` でセッション取得
  2. `v4()` で ID 生成
  3. `enabled` のデフォルト値は `true`
  4. セッションの breakpoints 配列に追加
  5. 完全な `Breakpoint` オブジェクトを返す

- `removeBreakpoint(sessionId: string, breakpointId: string)`:
  1. `this.getSession(sessionId)` でセッション取得
  2. breakpoints 配列から該当 ID を検索
  3. 見つからなければ `Error("Breakpoint not found: <breakpointId>")`
  4. `splice` で削除

#### 3.4 変数インスペクションの実装仕様

- `inspectVariable(sessionId: string, path: string)`:
  1. `this.getSession(sessionId)` でセッション取得
  2. `path` をドット（`.`）で分割
  3. セッションの `variables` から逐次的にプロパティを辿る
  4. 途中で `undefined` になった場合はそのまま `undefined` を返す

- `evaluateExpression(sessionId: string, expression: string)`:
  1. `this.getSession(sessionId)` でセッション取得
  2. セッションの `variables` をコンテキストとして式を評価
  3. 評価は `new Function` を使用し、セキュリティ上の制約として変数スコープをセッション変数に限定
  4. 評価エラーは `Error` でラップして返す

#### 3.5 Hooks 統合の実装仕様

- `createHooks(session: DebugSession)`:

```typescript
return {
  PreToolUse: async (context: { toolName: string; input?: unknown }) => {
    const step: DebugStep = session.recordStep("tool_call", {
      toolName: context.toolName,
      input: context.input,
    });
    this.emitDebugEvent({ type: "step", sessionId: session.id, step });

    if (this.shouldBreak(session, step)) {
      session.pause();
      const matchedBp = session.breakpoints.find(
        (bp) =>
          bp.enabled && bp.type === "tool" && bp.toolName === context.toolName,
      );
      if (matchedBp) {
        this.emitDebugEvent({
          type: "breakpoint-hit",
          sessionId: session.id,
          breakpoint: matchedBp,
          step,
        });
      }
      await this.waitForResume(session.id);
    }
    return { decision: "allow" as const };
  },

  PostToolUse: async (context: { toolName: string; output?: unknown }) => {
    if (session.currentStep) {
      session.currentStep.output = context.output;
    }
    if (session.status === "paused") {
      await this.waitForResume(session.id);
    }
  },
};
```

- `shouldBreak(session: DebugSession, step: DebugStep)`:
  1. セッションの breakpoints を走査
  2. 各ブレークポイントの `enabled` が true であることを確認
  3. `type === "tool"` の場合: `step.type === "tool_call"` かつ `bp.toolName === step.toolName`
  4. `type === "hook"` の場合: `step.type === "hook_execution"` かつ `bp.hookType === step.hookType`
  5. `type === "step"` の場合: `step.stepNumber` が条件に一致（条件未指定の場合は毎ステップ停止）
  6. `condition` が設定されている場合: 条件式を評価し、真の場合のみブレーク
  7. 一致するブレークポイントが1つでも見つかれば `true` を返す

- `emitDebugEvent(event: DebugEvent)`:
  1. `this.mainWindow.webContents.isDestroyed()` を確認
  2. `false` の場合のみ `this.mainWindow.webContents.send(IPC_CHANNELS.SKILL_DEBUG_EVENT, event)` でイベントを送信

- `waitForResume(sessionId: string)`:
  1. `new Promise<void>((resolve) => { this.resolveResumeMap.set(sessionId, resolve); })` で待機

- `resolveResume(sessionId: string)`:
  1. `this.resolveResumeMap.get(sessionId)` を取得
  2. 存在する場合は `resolve()` を呼び出し、`this.resolveResumeMap.delete(sessionId)`

---

### Step 4: IPC チャネル定数追加

#### 4.1 Preload チャネル定数

**対象ファイル**: `apps/desktop/src/preload/channels.ts`（変更）

`IPC_CHANNELS` オブジェクトの `// Skill share operations (TASK-9F)` セクションの直下に以下を追加する:

```typescript
// Skill debug operations (TASK-9H)
SKILL_DEBUG_START: "skill:debug:start",
SKILL_DEBUG_COMMAND: "skill:debug:command",
SKILL_DEBUG_BREAKPOINT_ADD: "skill:debug:breakpoint:add",
SKILL_DEBUG_BREAKPOINT_REMOVE: "skill:debug:breakpoint:remove",
SKILL_DEBUG_INSPECT: "skill:debug:inspect",
SKILL_DEBUG_EVALUATE: "skill:debug:evaluate",
SKILL_DEBUG_EVENT: "skill:debug:event",
```

`ALLOWED_INVOKE_CHANNELS` 配列の `// Skill share channels (TASK-9F)` セクションの直下に以下を追加する:

```typescript
// Skill debug channels (TASK-9H)
IPC_CHANNELS.SKILL_DEBUG_START,
IPC_CHANNELS.SKILL_DEBUG_COMMAND,
IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_ADD,
IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_REMOVE,
IPC_CHANNELS.SKILL_DEBUG_INSPECT,
IPC_CHANNELS.SKILL_DEBUG_EVALUATE,
```

`ALLOWED_ON_CHANNELS` 配列の `// Skill Creator channels (TASK-9B-H)` セクションの直下に以下を追加する:

```typescript
// Skill debug event channel (TASK-9H)
IPC_CHANNELS.SKILL_DEBUG_EVENT,
```

**注意**:

- `SKILL_DEBUG_EVENT` は Main → Renderer のイベント通知チャネルのため、`ALLOWED_ON_CHANNELS` にのみ追加する
- 他の6チャネルは Renderer → Main の invoke パターンのため、`ALLOWED_INVOKE_CHANNELS` にのみ追加する

---

### Step 5: IPC ハンドラ実装

**対象ファイル**: `apps/desktop/src/main/ipc/skillDebugHandlers.ts`（変更）

既存の `registerSkillHandlers` 関数の末尾（skill:optimize:evaluate ハンドラの後）にデバッグ関連のハンドラを追加する。

#### 5.1 SkillDebugger インスタンスの初期化

`registerSkillHandlers` 関数内で `_skillExecutorInstance` 初期化の直後に以下を追加する:

```typescript
import { SkillDebugger } from "../services/skill/SkillDebugger";

// TASK-9H: SkillDebugger インスタンス初期化
const skillDebugger = new SkillDebugger(mainWindow, _skillExecutorInstance);
```

#### 5.2 各ハンドラーの実装仕様

全ハンドラーは以下の共通パターンに従う:

```
1. validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })
2. validation.valid === false → throw toIPCValidationError(validation)
3. P42準拠3段バリデーション（型チェック → 空文字列 → trim()空文字列）
4. SkillDebugger メソッド呼び出し
5. { success: true, data? } を返却
6. Error → { success: false, error: error.message }
```

#### 5.3 `skill:debug:start` ハンドラ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_DEBUG_START,
  async (
    event: IpcMainInvokeEvent,
    args: { skillName: string; prompt: string; breakpoints?: Breakpoint[] },
  ) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_DEBUG_START,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    // P42準拠: skillName 3段バリデーション
    if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }
    // P42準拠: prompt 3段バリデーション
    if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "prompt must be a non-empty string",
      };
    }
    try {
      const session = await skillDebugger.startDebugSession(
        args.skillName,
        args.prompt,
        args.breakpoints ?? [],
      );
      return { success: true, data: session };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "デバッグセッション開始に失敗しました",
      };
    }
  },
);
```

#### 5.4 `skill:debug:command` ハンドラ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_DEBUG_COMMAND,
  async (
    event: IpcMainInvokeEvent,
    args: { sessionId: string; command: string },
  ) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_DEBUG_COMMAND,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (typeof args?.sessionId !== "string" || args.sessionId.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "sessionId must be a non-empty string",
      };
    }
    const validCommands = [
      "continue",
      "stepOver",
      "stepInto",
      "stepOut",
      "pause",
      "stop",
    ];
    if (!validCommands.includes(args.command)) {
      throw {
        code: "VALIDATION_ERROR",
        message: `command must be one of: ${validCommands.join(", ")}`,
      };
    }
    try {
      await skillDebugger.executeCommand(
        args.sessionId,
        args.command as DebugCommand,
      );
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "デバッグコマンド実行に失敗しました",
      };
    }
  },
);
```

#### 5.5 `skill:debug:breakpoint:add` ハンドラ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_ADD,
  async (
    event: IpcMainInvokeEvent,
    args: { sessionId: string; breakpoint: Omit<Breakpoint, "id"> },
  ) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_ADD,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (typeof args?.sessionId !== "string" || args.sessionId.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "sessionId must be a non-empty string",
      };
    }
    const validTypes = ["tool", "hook", "step"];
    if (!validTypes.includes(args?.breakpoint?.type)) {
      throw {
        code: "VALIDATION_ERROR",
        message: `breakpoint.type must be one of: ${validTypes.join(", ")}`,
      };
    }
    try {
      const bp = await skillDebugger.addBreakpoint(
        args.sessionId,
        args.breakpoint,
      );
      return { success: true, data: bp };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ブレークポイント追加に失敗しました",
      };
    }
  },
);
```

#### 5.6 `skill:debug:breakpoint:remove` ハンドラ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_REMOVE,
  async (
    event: IpcMainInvokeEvent,
    args: { sessionId: string; breakpointId: string },
  ) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_REMOVE,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (typeof args?.sessionId !== "string" || args.sessionId.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "sessionId must be a non-empty string",
      };
    }
    if (
      typeof args?.breakpointId !== "string" ||
      args.breakpointId.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "breakpointId must be a non-empty string",
      };
    }
    try {
      await skillDebugger.removeBreakpoint(args.sessionId, args.breakpointId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ブレークポイント削除に失敗しました",
      };
    }
  },
);
```

#### 5.7 `skill:debug:inspect` ハンドラ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_DEBUG_INSPECT,
  async (
    event: IpcMainInvokeEvent,
    args: { sessionId: string; path: string },
  ) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_DEBUG_INSPECT,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (typeof args?.sessionId !== "string" || args.sessionId.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "sessionId must be a non-empty string",
      };
    }
    if (typeof args?.path !== "string" || args.path.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "path must be a non-empty string",
      };
    }
    try {
      const value = await skillDebugger.inspectVariable(
        args.sessionId,
        args.path,
      );
      return { success: true, data: value };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "変数インスペクションに失敗しました",
      };
    }
  },
);
```

#### 5.8 `skill:debug:evaluate` ハンドラ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_DEBUG_EVALUATE,
  async (
    event: IpcMainInvokeEvent,
    args: { sessionId: string; expression: string },
  ) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_DEBUG_EVALUATE,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (typeof args?.sessionId !== "string" || args.sessionId.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "sessionId must be a non-empty string",
      };
    }
    if (typeof args?.expression !== "string" || args.expression.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "expression must be a non-empty string",
      };
    }
    try {
      const result = await skillDebugger.evaluateExpression(
        args.sessionId,
        args.expression,
      );
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "式評価に失敗しました",
      };
    }
  },
);
```

#### 5.9 `unregisterSkillHandlers` への追加

既存の `unregisterSkillHandlers` 関数の末尾に以下を追加する:

```typescript
// TASK-9H: スキルデバッグハンドラ解除
ipcMain.removeHandler(IPC_CHANNELS.SKILL_DEBUG_START);
ipcMain.removeHandler(IPC_CHANNELS.SKILL_DEBUG_COMMAND);
ipcMain.removeHandler(IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_ADD);
ipcMain.removeHandler(IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_REMOVE);
ipcMain.removeHandler(IPC_CHANNELS.SKILL_DEBUG_INSPECT);
ipcMain.removeHandler(IPC_CHANNELS.SKILL_DEBUG_EVALUATE);
```

**注意**: `SKILL_DEBUG_EVENT` は `ipcMain.handle` ではなく `mainWindow.webContents.send` で使用するため、`removeHandler` は不要。

---

### Step 6: Preload API 拡張

#### 6.1 Preload 型定義追加

**対象ファイル**: `apps/desktop/src/preload/types.ts`（変更）

ファイル末尾に以下を追加する:

```typescript
// Skill debug types (TASK-9H)
// 型定義は @repo/shared/types/skill-debug から re-export
export type {
  DebugSession,
  DebugSessionStatus,
  Breakpoint,
  BreakpointType,
  HookType,
  DebugStep,
  DebugStepType,
  CallStackEntry,
  CallStackEntryType,
  DebugEvent,
  DebugCommand,
} from "@repo/shared/types/skill-debug";
```

#### 6.2 Preload skill-api 拡張

**対象ファイル**: `apps/desktop/src/preload/skill-api.ts`（変更）

`SkillAPI` インターフェースの末尾（`validateSource` メソッドの後）に以下を追加する:

```typescript
// === Skill Debug Operations (TASK-9H) ===

/** デバッグセッションを開始する */
startDebugSession: (
  skillName: string,
  prompt: string,
  breakpoints?: Breakpoint[],
) => Promise<DebugSession>;
/** デバッグコマンドを実行する */
executeDebugCommand: (
  sessionId: string,
  command: DebugCommand,
) => Promise<void>;
/** ブレークポイントを追加する */
addBreakpoint: (
  sessionId: string,
  breakpoint: Omit<Breakpoint, "id">,
) => Promise<Breakpoint>;
/** ブレークポイントを削除する */
removeBreakpoint: (
  sessionId: string,
  breakpointId: string,
) => Promise<void>;
/** 変数をインスペクションする */
inspectVariable: (
  sessionId: string,
  path: string,
) => Promise<unknown>;
/** 式を評価する */
evaluateExpression: (
  sessionId: string,
  expression: string,
) => Promise<unknown>;
/** デバッグイベントを購読する */
onDebugEvent: (
  callback: (event: DebugEvent) => void,
) => () => void;
```

`skillAPI` 実装オブジェクトの末尾に以下を追加する:

```typescript
// === Skill Debug Operations (TASK-9H) ===

startDebugSession: (
  skillName: string,
  prompt: string,
  breakpoints?: Breakpoint[],
): Promise<DebugSession> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_DEBUG_START, {
    skillName,
    prompt,
    breakpoints: breakpoints ?? [],
  }),

executeDebugCommand: (
  sessionId: string,
  command: DebugCommand,
): Promise<void> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_DEBUG_COMMAND, {
    sessionId,
    command,
  }),

addBreakpoint: (
  sessionId: string,
  breakpoint: Omit<Breakpoint, "id">,
): Promise<Breakpoint> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_ADD, {
    sessionId,
    breakpoint,
  }),

removeBreakpoint: (
  sessionId: string,
  breakpointId: string,
): Promise<void> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_REMOVE, {
    sessionId,
    breakpointId,
  }),

inspectVariable: (
  sessionId: string,
  path: string,
): Promise<unknown> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_DEBUG_INSPECT, {
    sessionId,
    path,
  }),

evaluateExpression: (
  sessionId: string,
  expression: string,
): Promise<unknown> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_DEBUG_EVALUATE, {
    sessionId,
    expression,
  }),

onDebugEvent: (
  callback: (event: DebugEvent) => void,
): (() => void) =>
  safeOn<DebugEvent>(IPC_CHANNELS.SKILL_DEBUG_EVENT, callback),
```

import 文に以下を追加する:

```typescript
import type {
  DebugSession,
  Breakpoint,
  DebugCommand,
  DebugEvent,
} from "@repo/shared/types/skill-debug";
```

---

## 実行手順

1. Step 1（型定義追加）を実装し、`packages/shared` の型整合を先に確定する。
2. Step 2（DebugSession）と Step 3（SkillDebugger）を順に実装する。
3. Step 4（IPC ハンドラ）と Step 5（Preload）を実装し、7チャネル契約を揃える。
4. `TDD 検証コマンド` を順番に実行し、Phase 4 の Red テストをすべて Green 化する。
5. Pitfall チェックリストと完了条件を確認して成果物を確定する。

---

## Pitfall 対策チェックリスト

| Pitfall | 対策                                                                              | 適用箇所          |
| ------- | --------------------------------------------------------------------------------- | ----------------- |
| P5      | ハンドラ二重登録防止 — unregisterSkillHandlers に6チャネルの removeHandler を追加 | Step 5.9          |
| P42     | 全文字列引数に .trim() === "" チェック（3段バリデーション）                       | Step 5.3-5.8      |
| P44     | IPC ハンドラ引数形式と Preload 呼び出し形式の一致を検証                           | Step 5, Step 6    |
| P45     | 引数名のセマンティクスが実際の値と一致（sessionId, skillName, breakpointId）      | Step 5 全ハンドラ |
| P23     | 型定義は @repo/shared に配置し Preload から re-export                             | Step 1, Step 6.1  |
| P32     | 型変更時は shared と preload の両方を同時更新                                     | Step 1, Step 6    |
| P40     | テスト実行は apps/desktop ディレクトリから実行                                    | TDD検証コマンド   |

---

## 参照資料

| 参照資料               | パス                                                                                        | 内容                      |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| Phase 4 成果物         | `outputs/phase-4/test-specification.md`                                                     | テスト仕様                |
| IPC設計                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 既存IPCチャネル仕様       |
| セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Electron IPCセキュリティ  |
| セキュリティ（スキル） | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | スキルIPC固有セキュリティ |
| スキルインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル型定義              |
| アーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | システム全体構造          |
| Electronサービス       | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main Processサービス構造  |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ            |
| IPC契約チェックリスト  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約検証手順           |
| Claude Agent SDK       | `.claude/skills/claude-agent-sdk/SKILL.md`                                                  | SDK統合パターン           |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集            |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                        | Pitfall対策               |

## 統合テスト連携

Phase 5 では、Phase 4 で固定した Red 契約を Green 化し、Main/Preload/Shared の3層を一貫して統合する。

| 連携観点     | 実装アクション                                                      | 検証ポイント                 |
| ------------ | ------------------------------------------------------------------- | ---------------------------- |
| IPC登録      | `registerSkillDebugHandlers` を `registerAllIpcHandlers` に組み込む | ハンドラ未配線がないこと     |
| Preload連携  | `channels.ts` / `skill-api.ts` / `types.ts` を同時更新              | 呼び出し引数と戻り値型が一致 |
| 共有型連携   | `skill-debug.ts` 追加と `index.ts` re-export 同期                   | Main/Renderer で同じ型を参照 |
| セキュリティ | 全ハンドラで sender 検証 + P42 + sanitize を適用                    | 不正入力時に統一エラーを返す |

## 成果物

| ファイル                                                | 操作     | 内容                        |
| ------------------------------------------------------- | -------- | --------------------------- |
| `packages/shared/src/types/skill-debug.ts`              | 新規作成 | デバッグ型定義              |
| `packages/shared/src/types/index.ts`                    | 変更     | re-export 追加              |
| `apps/desktop/src/main/services/skill/DebugSession.ts`  | 新規作成 | DebugSession クラス         |
| `apps/desktop/src/main/services/skill/SkillDebugger.ts` | 新規作成 | SkillDebugger クラス        |
| `apps/desktop/src/main/ipc/skillDebugHandlers.ts`       | 変更     | 7チャネルのハンドラ追加     |
| `apps/desktop/src/preload/channels.ts`                  | 変更     | 7チャネル定数追加           |
| `apps/desktop/src/preload/skill-api.ts`                 | 変更     | デバッグ API 7メソッド追加  |
| `apps/desktop/src/preload/types.ts`                     | 変更     | デバッグ型の re-export 追加 |

## 完了条件

- [ ] `packages/shared/src/types/skill-debug.ts` に全型定義（DebugSession, Breakpoint, DebugStep, CallStackEntry, DebugEvent, DebugCommand）が定義されている
- [ ] `packages/shared/src/types/index.ts` から skill-debug が re-export されている
- [ ] DebugSession クラスが5つの状態遷移（idle→running, running→paused, paused→running, running→completed, running→error）を正しく管理する
- [ ] DebugSession クラスが無効な状態遷移に対して `Error("Invalid state transition")` をスローする
- [ ] SkillDebugger クラスが セッション管理、ブレークポイント管理、変数インスペクション、式評価の全メソッドを実装している
- [ ] SkillDebugger.createHooks が PreToolUse と PostToolUse の両方を返す
- [ ] shouldBreak が tool, hook, step の3種類のブレークポイントを正しく判定する
- [ ] 7つの IPC チャネルが `channels.ts` に定数として定義されている
- [ ] 6つの invoke チャネルが `ALLOWED_INVOKE_CHANNELS` に追加されている
- [ ] 1つのイベントチャネルが `ALLOWED_ON_CHANNELS` に追加されている
- [ ] 全 IPC ハンドラが P42 準拠の3段バリデーション（型チェック → 空文字列 → trim()空文字列）を実装している
- [ ] 全 IPC ハンドラが `validateIpcSender` による送信元検証を実装している
- [ ] `skill-api.ts` に7つの Preload API メソッドが追加されている
- [ ] `types.ts` にデバッグ型の re-export が追加されている
- [ ] Phase 4 の全テスト（101テスト）が Green 状態（成功）である
- [ ] `pnpm --filter @repo/shared build` がエラーなしで完了する
- [ ] `cd apps/desktop && pnpm vitest run` で既存テストがリグレッションしない

## TDD 検証コマンド

```bash
# shared パッケージのビルド確認
pnpm --filter @repo/shared build

# 型テスト
cd packages/shared && pnpm vitest run src/types/__tests__/skill-debug.test.ts

# SkillDebugger テスト（apps/desktop から実行 — P40対策）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillDebugger.test.ts

# DebugSession テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/DebugSession.test.ts

# IPC ハンドラテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillDebugHandlers.test.ts

# 全テスト一括（Green 確認）
cd apps/desktop && pnpm vitest run --reporter=verbose src/main/services/skill/__tests__/SkillDebugger.test.ts src/main/services/skill/__tests__/DebugSession.test.ts src/main/ipc/__tests__/skillDebugHandlers.test.ts

# リグレッション確認
cd apps/desktop && pnpm vitest run
```

## 次のPhase

Phase 6（テスト拡充）へ進む。カバレッジ不足箇所を特定し、追加テストを作成する。
