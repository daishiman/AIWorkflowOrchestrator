# Phase 2: 設計

## メタ情報

| 項目   | 値                      |
| ------ | ----------------------- |
| Phase  | 2                       |
| 機能名 | claude-code-integration |
| 作成日 | 2026-01-12              |

## 目的

Phase 1で定義した要件を実現可能な技術設計に落とし込む。

## 実行タスク

- 型定義設計: AgentStreamMessage、PermissionRequest等の型を設計
- クラス設計: AgentExecutor、ExecutionManager、HooksFactory、PermissionRulesの設計
- IPC通信設計: ストリーミングIPC、Permission Dialog連携の設計

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                         | 内容                    |
| ------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | 既存型定義・IPC仕様     |
| Electronセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC通信セキュリティ要件 |
| アーキテクチャパターン    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 設計パターン・原則      |

### Phase 1成果物

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |

## 実行手順

### 1. 型定義設計

`packages/shared/src/types/agent.ts` に追加する型定義:

```typescript
// ========================================
// SDK実行リクエスト
// ========================================
export interface AgentExecutionRequest {
  executionId: string; // UUID
  skillId: string;
  skillPath: string;
  prompt: string;
  workingDirectory?: string;
  tools?: string[]; // 許可するツール
  permissionMode?: "auto" | "ask" | "deny" | "default";
}

// ========================================
// SDKメッセージ型（ストリーミング用）
// ========================================
export interface AgentStreamMessage {
  executionId: string;
  type: "assistant" | "user" | "result" | "tool_use" | "status" | "error";
  content: unknown;
  timestamp: number;
}

// ========================================
// Permission Request（UIダイアログ用）
// ========================================
export interface PermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}

// ========================================
// Permission Response（UIからの応答）
// ========================================
export interface PermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
}

// ========================================
// 実行状態
// ========================================
export interface AgentExecutionStatus {
  executionId: string;
  status: "running" | "completed" | "cancelled" | "error";
  startedAt: number;
  completedAt?: number;
  error?: string;
}

// ========================================
// Permission Rule型
// ========================================
export interface PermissionRule {
  tool: string | string[];
  paths?: string[];
  commands?: string[];
}

export interface PermissionRules {
  allow?: PermissionRule[];
  deny?: PermissionRule[];
  ask?: PermissionRule[];
}
```

### 2. クラス設計

#### 2.1 HooksFactory

```typescript
// apps/desktop/src/main/services/agent/HooksFactory.ts
import type { Options } from "@anthropic-ai/claude-agent-sdk";
import type { BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";

export class HooksFactory {
  constructor(
    private mainWindow: BrowserWindow,
    private executionId: string,
    private permissionResolver: PermissionResolver,
  ) {}

  createHooks(): Options["hooks"] {
    return {
      PreToolUse: async (input, toolUseID, { signal }) => {
        // 危険なBashコマンドをブロック
        if (input.toolName === "Bash") {
          const dangerousPatterns = ["rm -rf", "sudo", "chmod 777", "dd if="];
          const command = input.args.command as string;

          for (const pattern of dangerousPatterns) {
            if (command?.includes(pattern)) {
              return {
                proceed: false,
                message: `危険なコマンド "${pattern}" は許可されていません`,
              };
            }
          }
        }
        return { proceed: true };
      },

      PostToolUse: async (input, toolUseID, { signal }) => {
        this.mainWindow.webContents.send(IPC_CHANNELS.AGENT_STATUS, {
          executionId: this.executionId,
          type: "tool_completed",
          tool: input.toolName,
          timestamp: Date.now(),
        });
        return {};
      },

      PermissionRequest: async (input, toolUseID, { signal }) => {
        const requestId = `perm_${Date.now()}`;

        // Rendererに権限確認を要求
        this.mainWindow.webContents.send(IPC_CHANNELS.AGENT_PERMISSION, {
          executionId: this.executionId,
          requestId,
          toolName: input.toolName,
          args: input.args,
        } as PermissionRequest);

        // Rendererからの応答を待つ
        const response = await this.permissionResolver.waitForResponse(
          requestId,
          signal,
        );

        return { proceed: response.approved };
      },
    };
  }
}
```

#### 2.2 PermissionResolver

```typescript
// apps/desktop/src/main/services/agent/HooksFactory.ts (続き)
export class PermissionResolver {
  private pendingRequests = new Map<
    string,
    {
      resolve: (response: PermissionResponse) => void;
      reject: (error: Error) => void;
    }
  >();

  waitForResponse(
    requestId: string,
    signal: AbortSignal,
  ): Promise<PermissionResponse> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error("Aborted"));
        return;
      }

      this.pendingRequests.set(requestId, { resolve, reject });

      signal.addEventListener("abort", () => {
        this.pendingRequests.delete(requestId);
        reject(new Error("Aborted"));
      });
    });
  }

  resolveRequest(response: PermissionResponse): void {
    const pending = this.pendingRequests.get(response.requestId);
    if (pending) {
      pending.resolve(response);
      this.pendingRequests.delete(response.requestId);
    }
  }
}
```

#### 2.3 PermissionRules

```typescript
// apps/desktop/src/main/services/agent/PermissionRules.ts
import type { PermissionRules, Options } from "@anthropic-ai/claude-agent-sdk";

export const DEFAULT_PERMISSION_RULES: PermissionRules = {
  // 自動許可: 読み取り系ツール
  allow: [{ tool: "Read" }, { tool: "Grep" }, { tool: "Glob" }],
  // 拒否: 危険なコマンド
  deny: [
    { tool: "Bash", commands: ["rm -rf", "sudo", "chmod 777", "dd if="] },
    { tool: "Write", paths: ["/etc/**", "/usr/**", "/var/**"] },
  ],
  // 確認必要: 書き込み系
  ask: [{ tool: "Write" }, { tool: "Edit" }, { tool: "Bash" }],
};

export function createPermissionOptions(
  rules: PermissionRules,
  projectRoot: string,
): Options["permissions"] {
  return {
    allow: rules.allow?.map((rule) => ({
      ...rule,
      paths: rule.paths?.map((p) => p.replace("${projectRoot}", projectRoot)),
    })),
    deny: rules.deny?.map((rule) => ({
      ...rule,
      paths: rule.paths?.map((p) => p.replace("${projectRoot}", projectRoot)),
    })),
    ask: rules.ask?.map((rule) => ({
      ...rule,
      paths: rule.paths?.map((p) => p.replace("${projectRoot}", projectRoot)),
    })),
  };
}
```

#### 2.4 AgentExecutor

```typescript
// apps/desktop/src/main/services/agent/AgentExecutor.ts
import {
  query,
  type Options,
  type Conversation,
} from "@anthropic-ai/claude-agent-sdk";
import type { BrowserWindow } from "electron";
import { HooksFactory, PermissionResolver } from "./HooksFactory";
import {
  createPermissionOptions,
  DEFAULT_PERMISSION_RULES,
} from "./PermissionRules";
import { IPC_CHANNELS } from "../../../preload/channels";
import type {
  AgentExecutionRequest,
  AgentStreamMessage,
  PermissionResponse,
  PermissionRules,
} from "@repo/shared";

export class AgentExecutor {
  private abortController: AbortController;
  private conversation: Conversation | null = null;
  private readonly permissionResolver: PermissionResolver;

  constructor(
    private request: AgentExecutionRequest,
    private mainWindow: BrowserWindow,
    private permissionRules: PermissionRules = DEFAULT_PERMISSION_RULES,
  ) {
    this.abortController = new AbortController();
    this.permissionResolver = new PermissionResolver();
  }

  async start(): Promise<void> {
    const hooksFactory = new HooksFactory(
      this.mainWindow,
      this.request.executionId,
      this.permissionResolver,
    );

    const options: Options = {
      tools: this.request.tools || [
        "Read",
        "Edit",
        "Write",
        "Bash",
        "Glob",
        "Grep",
      ],
      permissionMode: this.request.permissionMode || "default",
      permissions: createPermissionOptions(
        this.permissionRules,
        this.request.workingDirectory || process.cwd(),
      ),
      hooks: hooksFactory.createHooks(),
      signal: this.abortController.signal,
      settingSources: ["user", "project"],
    };

    try {
      this.conversation = query({
        prompt: this.request.prompt,
        options,
      });

      // ストリーミング処理
      for await (const message of this.conversation.stream()) {
        if (this.abortController.signal.aborted) break;

        this.mainWindow.webContents.send(IPC_CHANNELS.AGENT_STREAM, {
          executionId: this.request.executionId,
          type: message.type,
          content: message.message || message,
          timestamp: Date.now(),
        } as AgentStreamMessage);
      }

      // 完了通知
      this.mainWindow.webContents.send(IPC_CHANNELS.AGENT_STATUS, {
        executionId: this.request.executionId,
        status: "completed",
        completedAt: Date.now(),
      });
    } catch (error) {
      if (this.abortController.signal.aborted) {
        // キャンセルによる終了
        this.mainWindow.webContents.send(IPC_CHANNELS.AGENT_STATUS, {
          executionId: this.request.executionId,
          status: "cancelled",
          completedAt: Date.now(),
        });
      } else {
        // エラーによる終了
        this.mainWindow.webContents.send(IPC_CHANNELS.AGENT_STREAM, {
          executionId: this.request.executionId,
          type: "error",
          content: { message: (error as Error).message },
          timestamp: Date.now(),
        });
        this.mainWindow.webContents.send(IPC_CHANNELS.AGENT_STATUS, {
          executionId: this.request.executionId,
          status: "error",
          error: (error as Error).message,
          completedAt: Date.now(),
        });
      }
    }
  }

  stop(): void {
    this.abortController.abort();
  }

  resolvePermission(response: PermissionResponse): void {
    this.permissionResolver.resolveRequest(response);
  }
}
```

#### 2.5 ExecutionManager

```typescript
// apps/desktop/src/main/services/agent/ExecutionManager.ts
import { v4 as uuidv4 } from "uuid";
import type { BrowserWindow } from "electron";
import { AgentExecutor } from "./AgentExecutor";
import type { AgentExecutionRequest, PermissionResponse } from "@repo/shared";

export class ExecutionManager {
  private executions: Map<string, AgentExecutor> = new Map();

  async startExecution(
    request: AgentExecutionRequest,
    mainWindow: BrowserWindow,
  ): Promise<string> {
    const executionId = request.executionId || uuidv4();
    const fullRequest = { ...request, executionId };

    const executor = new AgentExecutor(fullRequest, mainWindow);

    this.executions.set(executionId, executor);

    // 非同期で実行開始（awaitしない）
    executor.start().finally(() => {
      this.executions.delete(executionId);
    });

    return executionId;
  }

  stopExecution(executionId: string): boolean {
    const executor = this.executions.get(executionId);
    if (executor) {
      executor.stop();
      return true;
    }
    return false;
  }

  stopAllExecutions(): void {
    this.executions.forEach((executor) => executor.stop());
  }

  getActiveExecutions(): string[] {
    return Array.from(this.executions.keys());
  }

  resolvePermission(
    executionId: string,
    response: PermissionResponse,
  ): boolean {
    const executor = this.executions.get(executionId);
    if (executor) {
      executor.resolvePermission(response);
      return true;
    }
    return false;
  }
}
```

### 3. IPC通信設計

#### 3.1 IPCチャネル定義

```typescript
// apps/desktop/src/preload/channels.ts に追加
export const IPC_CHANNELS = {
  // ... 既存のチャネル

  // Agent Execution
  AGENT_START: "agent:start",
  AGENT_STOP: "agent:stop",
  AGENT_STOP_ALL: "agent:stop-all",
  AGENT_GET_ACTIVE_EXECUTIONS: "agent:get-active-executions",
  AGENT_STREAM: "agent:stream",
  AGENT_STATUS: "agent:status",
  AGENT_PERMISSION: "agent:permission", // Main → Renderer（権限確認要求）
  AGENT_PERMISSION_RES: "agent:permission:res", // Renderer → Main（権限確認応答）
} as const;
```

#### 3.2 agentHandlers拡張

```typescript
// apps/desktop/src/main/ipc/agentHandlers.ts に追加
import { ipcMain } from "electron";
import type { BrowserWindow } from "electron";
import { ExecutionManager } from "../services/agent/ExecutionManager";
import { IPC_CHANNELS } from "../../preload/channels";
import type { AgentExecutionRequest, PermissionResponse } from "@repo/shared";

export function registerAgentExecutionHandlers(
  mainWindow: BrowserWindow,
  executionManager: ExecutionManager,
): void {
  // エージェント実行開始
  ipcMain.handle(
    IPC_CHANNELS.AGENT_START,
    async (_e, request: AgentExecutionRequest) => {
      return executionManager.startExecution(request, mainWindow);
    },
  );

  // 実行停止
  ipcMain.handle(IPC_CHANNELS.AGENT_STOP, async (_e, { executionId }) => {
    return executionManager.stopExecution(executionId);
  });

  // 全実行停止
  ipcMain.handle(IPC_CHANNELS.AGENT_STOP_ALL, async () => {
    executionManager.stopAllExecutions();
    return true;
  });

  // アクティブ実行一覧
  ipcMain.handle(IPC_CHANNELS.AGENT_GET_ACTIVE_EXECUTIONS, async () => {
    return executionManager.getActiveExecutions();
  });

  // Permission応答（Rendererからの応答を受け取る）
  ipcMain.handle(
    IPC_CHANNELS.AGENT_PERMISSION_RES,
    async (
      _e,
      {
        executionId,
        response,
      }: { executionId: string; response: PermissionResponse },
    ) => {
      return executionManager.resolvePermission(executionId, response);
    },
  );
}
```

### 4. シーケンス図

```
┌─────────┐     ┌─────────┐     ┌───────────────┐     ┌────────────────┐     ┌─────────────┐
│Renderer │     │  Main   │     │ExecutionMgr   │     │AgentExecutor   │     │Claude SDK   │
└────┬────┘     └────┬────┘     └───────┬───────┘     └───────┬────────┘     └──────┬──────┘
     │               │                  │                     │                     │
     │ agent:start   │                  │                     │                     │
     │──────────────►│                  │                     │                     │
     │               │ startExecution   │                     │                     │
     │               │─────────────────►│                     │                     │
     │               │                  │ new AgentExecutor   │                     │
     │               │                  │────────────────────►│                     │
     │               │                  │                     │ query()             │
     │               │                  │                     │────────────────────►│
     │               │                  │                     │                     │
     │               │                  │                     │◄─── stream messages │
     │               │                  │                     │                     │
     │◄──────────────────────────────── agent:stream ─────────│                     │
     │               │                  │                     │                     │
     │               │                  │                     │◄─ PreToolUse Hook   │
     │               │                  │                     │                     │
     │◄──────────────────────────────── agent:permission ─────│                     │
     │               │                  │                     │                     │
     │ agent:permission:res             │                     │                     │
     │──────────────►│                  │                     │                     │
     │               │─────────────────────────────────────────► resolvePermission  │
     │               │                  │                     │                     │
     │               │                  │                     │─── proceed ────────►│
     │               │                  │                     │                     │
     │◄──────────────────────────────── agent:status (completed) ─────────────────│
     │               │                  │                     │                     │
```

## 統合テスト連携【必須】

SDK query() API・Hooks・ストリーミングの統合ポイントを設計に反映:

| 統合ポイント               | 契約定義                                         |
| -------------------------- | ------------------------------------------------ |
| Renderer→Main (start)      | IPC: agent:start → AgentExecutionRequest型       |
| Main→SDK (query)           | SDK query() API Options型                        |
| SDK→Main (stream)          | AsyncIterator<SDKMessage>                        |
| Main→Renderer (stream)     | IPC: agent:stream → AgentStreamMessage型         |
| Main→Renderer (permission) | IPC: agent:permission → PermissionRequest型      |
| Renderer→Main (response)   | IPC: agent:permission:res → PermissionResponse型 |

## 成果物

| 成果物             | パス                                     | 説明            |
| ------------------ | ---------------------------------------- | --------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | クラス・IPC設計 |
| 型定義設計         | `outputs/phase-2/type-definitions.md`    | 型定義詳細      |
| シーケンス図       | `outputs/phase-2/sequence-diagram.md`    | 処理フロー      |

## 完了条件

- [ ] 全型定義が設計されている
- [ ] AgentExecutor/ExecutionManager/HooksFactory/PermissionRulesが設計されている
- [ ] IPCチャネルが定義されている
- [ ] シーケンス図が作成されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
