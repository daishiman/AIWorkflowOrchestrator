---
id: TASK-9H
title: スキルデバッグモード実装
tier: 3
phase: 9
depends_on: [TASK-9B]
parallel_with: [TASK-9D, TASK-9E, TASK-9F, TASK-9G, TASK-9I, TASK-9J]
blocks: []
status: pending
priority: low
estimated_complexity: large
tags: [backend, main, skill-management, debug, breakpoint, hooks, future]

execution:
  mode: sequential
  timeout_minutes: 90
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - apps/desktop/src/main/services/skill/SkillDebugger.ts
    - apps/desktop/src/main/services/skill/DebugSession.ts
    - packages/shared/src/types/skill-debug.ts
  # UI成果物は ./task-031b-ui-05b-skill-advanced-views.md#3C で定義
  modifies:
    - packages/shared/src/types/index.ts
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/preload/channels.ts
    - apps/desktop/src/preload/skill-api.ts
    - apps/desktop/src/preload/types.ts
---

# スキルデバッグモード実装

## 概要

スキル実行時のデバッグ機能。ブレークポイント設定、ステップ実行、変数インスペクションを提供する。

## 入力

- TASK-9B: skill-creator スキル（debugコマンド追加済み）
- specification.md §22: デバッグモード仕様
- technical-decisions.md §23: 設計判断

## 出力

- SkillDebugger サービス
- DebugSession 管理
- DebugPanel UI コンポーネント

## 実装手順

### Step 1: 型定義追加

**ファイル**: `packages/shared/src/types/skill-debug.ts`

```typescript
export interface DebugSession {
  id: string;
  skillName: string;
  status: "idle" | "running" | "paused" | "completed" | "error";
  breakpoints: Breakpoint[];
  currentStep?: DebugStep;
  variables: Record<string, unknown>;
  callStack: CallStackEntry[];
  /** @format ISO 8601 — IPC経由では string として送受信 */
  startedAt: string; // ISO 8601
}

export interface Breakpoint {
  id: string;
  type: "tool" | "hook" | "step";
  condition?: string;
  toolName?: string;
  hookType?: "PreToolUse" | "PostToolUse";
  enabled: boolean;
}

export interface DebugStep {
  stepNumber: number;
  type: "tool_call" | "hook_execution" | "agent_response";
  toolName?: string;
  hookType?: string;
  input?: unknown;
  output?: unknown;
  /** @format ISO 8601 */
  timestamp: string; // ISO 8601
}

export interface CallStackEntry {
  depth: number;
  name: string;
  type: "skill" | "agent" | "tool";
  /** @format ISO 8601 */
  startTime: string; // ISO 8601
}

export type DebugEvent =
  | {
      type: "step";
      sessionId: string;
      step: DebugStep;
    }
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
      /** @format ISO 8601 */
      completedAt?: string; // ISO 8601
    };

export type DebugCommand =
  | "continue"
  | "stepOver"
  | "stepInto"
  | "stepOut"
  | "pause"
  | "stop";
```

### IPC シリアライズ方針（Date 型）

本タスクの Date 型フィールドは IPC 経由で ISO 8601 文字列（`string`）として送受信する。

- **バックエンド（Main Process）内部**: `Date` オブジェクトを使用
- **IPC 境界（ハンドラ戻り値）**: `.toISOString()` で ISO 8601 文字列に変換
- **Renderer 側**: `string` として受け取り、表示時に `new Date(isoString)` で復元

この方針は以下の理由に基づく:

1. contextBridge の Structured Clone は Date を保持するが、JSON API（Web版）では string に変換される
2. ISO 8601 文字列であれば `new Date()` で確実に復元可能
3. IPC 型とドメイン型の混在を避け、型安全性を維持

### idle 状態の定義

`DebugSession.status` に追加した `"idle"` 値の意味:

- デバッグセッションが未開始の初期状態
- DebugPanel のマウント時にデフォルトで設定される
- `skill:debug:start` ハンドラの呼び出し前のデフォルト値として使用する
- 05B（DebugControlsProps.sessionStatus）の値セット（`"idle" | "running" | "paused" | "completed" | "error"`）と完全一致

### Step 2: SkillDebugger 実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillDebugger.ts`

```typescript
export class SkillDebugger {
  async startDebugSession(
    skillName: string,
    prompt: string,
    breakpoints: Breakpoint[],
  ): Promise<DebugSession>;

  async executeCommand(sessionId: string, command: DebugCommand): Promise<void>;

  async addBreakpoint(
    sessionId: string,
    breakpoint: Omit<Breakpoint, "id">,
  ): Promise<Breakpoint>;

  async removeBreakpoint(
    sessionId: string,
    breakpointId: string,
  ): Promise<void>;

  async inspectVariable(sessionId: string, path: string): Promise<unknown>;

  async evaluateExpression(
    sessionId: string,
    expression: string,
  ): Promise<unknown>;

  private createHooks(session: DebugSession): HooksConfig;
  private shouldBreak(session: DebugSession, step: DebugStep): boolean;
  private emitDebugEvent(event: DebugEvent): void;
}
```

### Step 3: DebugSession 実装

**ファイル**: `apps/desktop/src/main/services/skill/DebugSession.ts`

- セッション状態管理
- ブレークポイント評価
- ステップ履歴記録
- 変数スナップショット

### Step 4: IPC拡張

**チャネル追加**:

- `skill:debug:start` - デバッグセッション開始
- `skill:debug:command` - デバッグコマンド実行
- `skill:debug:breakpoint:add` - ブレークポイント追加
- `skill:debug:breakpoint:remove` - ブレークポイント削除
- `skill:debug:inspect` - 変数インスペクション
- `skill:debug:evaluate` - 式評価

**イベントチャネル**:

- `skill:debug:event` - デバッグイベント通知（breakpoint hit, step completed等）

### Step 5: DebugPanel 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05B-skill-advanced-views.md#3c-debugpanel](./task-031b-ui-05b-skill-advanced-views.md#3c-debugpanel)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

### Step 6: BreakpointEditor 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05B-skill-advanced-views.md#3c-debugpanel](./task-031b-ui-05b-skill-advanced-views.md#3c-debugpanel)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

## Claude Agent SDK Hooks統合

デバッグ機能はClaude Agent SDKのHooksシステムを活用:

```typescript
const debugHooks = {
  PreToolUse: async (context) => {
    if (
      shouldBreak(session, { type: "tool_call", toolName: context.toolName })
    ) {
      await pauseSession(session.id);
      emitBreakpointHit(session.id, context);
    }
    return { decision: "allow" };
  },
  PostToolUse: async (context) => {
    recordStepOutput(session.id, context);
    if (session.status === "paused") {
      await waitForResume(session.id);
    }
  },
};
```

## 検証条件

### 必須条件

- [ ] デバッグモードでスキル実行を開始できる
- [ ] ツール呼び出し時にブレークできる
- [ ] ステップ実行（Continue, Step Over）が機能する
- [ ] 変数のインスペクションができる
- [ ] ブレークポイントの条件式が評価される

### 自動検証コマンド

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --grep "SkillDebugger"
```

## 関連仕様

- specification.md §22: デバッグモード
- technical-decisions.md §23: 設計判断
