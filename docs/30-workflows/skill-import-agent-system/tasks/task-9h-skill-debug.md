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
    - apps/desktop/src/renderer/components/skill/DebugPanel.tsx
    - apps/desktop/src/renderer/components/skill/BreakpointEditor.tsx
  modifies:
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/preload/skillAPI.ts
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

**ファイル**: `packages/shared/src/types/skillDebug.ts`

```typescript
export interface DebugSession {
  id: string;
  skillName: string;
  status: "running" | "paused" | "completed" | "error";
  breakpoints: Breakpoint[];
  currentStep?: DebugStep;
  variables: Record<string, unknown>;
  callStack: CallStackEntry[];
  startedAt: Date;
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
  timestamp: Date;
}

export interface CallStackEntry {
  depth: number;
  name: string;
  type: "skill" | "agent" | "tool";
  startTime: Date;
}

export type DebugCommand =
  | "continue"
  | "stepOver"
  | "stepInto"
  | "stepOut"
  | "pause"
  | "stop";
```

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

**ファイル**: `apps/desktop/src/renderer/components/skill/DebugPanel.tsx`

- デバッグコントロール（Continue, Step Over, Step Into, Stop）
- コールスタック表示
- 変数ウォッチ
- ステップ履歴
- 出力コンソール

### Step 6: BreakpointEditor 実装

**ファイル**: `apps/desktop/src/renderer/components/skill/BreakpointEditor.tsx`

- ツールブレークポイント設定
- フックブレークポイント設定
- 条件式入力
- 有効/無効トグル

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
