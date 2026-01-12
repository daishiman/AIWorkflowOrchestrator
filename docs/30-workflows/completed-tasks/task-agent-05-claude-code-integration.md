# Claude Agent SDK統合 - タスク指示書

## メタ情報

| 項目         | 内容                 |
| ------------ | -------------------- |
| タスクID     | AGENT-005            |
| タスク名     | Claude Agent SDK統合 |
| 分類         | 要件                 |
| 対象機能     | エージェント機能     |
| 優先度       | 高                   |
| 見積もり規模 | 大規模               |
| ステータス   | 未実施               |
| 発見元       | ユーザー要求         |
| 発見日       | 2026-01-09           |

---

## 依存関係と並行実行

### 依存関係マップ

```
task-agent-01-dashboard-foundation.md (AGENT-001)
    │
    ├──► task-agent-02-skill-management-ui.md (AGENT-002) ─┐
    │                                                      │
    └──► task-agent-03-skill-management-backend.md ────────┼──► task-agent-04-execution-ui.md
         (AGENT-003) ※02と並行可能                         │    (AGENT-004)
                │                                          │
                └──► task-agent-05-claude-code-integration ┘    ※04と並行可能
                     (AGENT-005/本タスク) ※04と並行可能
                          │
                          └──► task-agent-06-custom-environment-ui.md (AGENT-006)
                                    │
                                    └──► task-agent-07-environment-backend.md (AGENT-007)
                                         ※06と並行可能
```

### 本タスクの位置づけ

| 項目                     | 内容                                                       |
| ------------------------ | ---------------------------------------------------------- |
| 直接依存                 | AGENT-003（スキル管理バックエンド）                        |
| 並行実行可能             | AGENT-004（エージェント実行UI）                            |
| 本タスク完了後に開始可能 | AGENT-006（カスタム実行環境UI）, AGENT-007（実行環境管理） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

エージェント機能の中核として、**Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）** を使用して、**ユーザーのClaude Codeサブスクリプション**を活用したスキルベースのタスク実行機能を実装する。

Claude Agent SDKは、Claude Codeの認証・サブスクリプションを自動的に利用するため、Anthropic APIキーを直接管理する必要がない。SDKの`query()` APIを使用することで、ストリーミング出力、Hooksシステム、Permission Controlを統合的に扱える。

### 1.2 問題点・課題

- Claude Agent SDKを統合する機能がない
- Hooksシステム（PreToolUse/PostToolUse/PermissionRequest）がない
- Permission Control（権限制御）の仕組みがない
- ストリーミング出力をIPC経由で転送する機能がない
- 実行の中断・キャンセル機能がない
- Permission Dialog（ユーザー承認UI）との連携がない

### 1.3 放置した場合の影響

- エージェント機能が動作しない
- スキルベースのタスク実行が不可能
- ユーザーのClaude Code契約を活用した機能が提供できない
- 危険なツール使用を制御できない

---

## 2. 何を達成するか（What）

### 2.1 目的

Claude Agent SDKの`query()` APIをElectronアプリに統合し、Hooksシステム、Permission Control、ストリーミング出力、Permission Dialogを実装する。

### 2.2 最終ゴール

- Claude Agent SDK `query()` APIでエージェントを実行できる
- Hooksシステムで危険なツール使用をブロックできる
- Permission Controlで宣言的に権限ルールを定義できる
- Permission Dialogでユーザー承認を求められる
- 実行結果がストリーミングでRendererに転送される
- AbortSignalで実行をキャンセルできる
- 複数の実行を管理できる

### 2.3 スコープ

#### 含むもの

- AgentExecutorサービス（SDK `query()` API統合）
- ExecutionManagerサービス（複数実行管理）
- Hooksシステム（PreToolUse/PostToolUse/PermissionRequest）
- Permission Control設定
- Permission Dialog IPC連携
- ストリーミングIPC通信
- AbortController/Signal統合
- agentHandlers拡張

#### 含まないもの

- フロントエンドUI（別タスク: AGENT-004）
- カスタム実行環境（別タスク: AGENT-006, AGENT-007）
- Permission DialogのUI実装（AGENT-004で実装）

### 2.4 成果物

| 成果物                | パス                                                       |
| --------------------- | ---------------------------------------------------------- |
| AgentExecutor         | `apps/desktop/src/main/services/agent/AgentExecutor.ts`    |
| ExecutionManager      | `apps/desktop/src/main/services/agent/ExecutionManager.ts` |
| PermissionRulesConfig | `apps/desktop/src/main/services/agent/PermissionRules.ts`  |
| HooksFactory          | `apps/desktop/src/main/services/agent/HooksFactory.ts`     |
| agentHandlers更新     | `apps/desktop/src/main/ipc/agentHandlers.ts`               |
| IPCチャネル更新       | `apps/desktop/src/preload/channels.ts`                     |
| 型定義更新            | `packages/shared/src/types/agent.ts`                       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AGENT-003（スキル管理バックエンド）が完了している
- Claude Code（ローカル認証済み）がインストールされている
- `@anthropic-ai/claude-agent-sdk` パッケージを理解している

### 3.2 依存タスク

- AGENT-001: エージェントダッシュボード基盤
- AGENT-003: スキル管理バックエンド
- AGENT-004: Permission Dialog UI（並行開発可能、IPC仕様は本タスクで定義）

### 3.3 必要な知識・スキル

- Claude Agent SDK `query()` API
- SDK Hooksシステム（PreToolUse/PostToolUse/PermissionRequest）
- Permission Control（4層権限システム）
- AsyncIterator/ストリーミング処理
- AbortController/AbortSignal
- Electron IPC

### 3.4 推奨アプローチ

1. 型定義を拡張（SDKMessage、実行状態、Permission関連）
2. HooksFactoryを実装（Hook生成、IPC連携）
3. PermissionRulesConfigを実装（宣言的権限ルール）
4. AgentExecutorを実装（SDK `query()` API統合）
5. ExecutionManagerを実装（複数実行管理）
6. ストリーミングIPC通信を実装
7. agentHandlersを拡張
8. AbortController/Signalでキャンセル機能を実装

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準フローに従って実装する。

### Phase 1: 要件定義

#### 使用スキル

| スキル名                    | パス                                                  | 選定理由                                |
| --------------------------- | ----------------------------------------------------- | --------------------------------------- |
| acceptance-criteria-writing | `.claude/skills/acceptance-criteria-writing/SKILL.md` | Given-When-Then形式で受け入れ基準を定義 |

#### 受け入れ基準（Given-When-Then）

```gherkin
Feature: Claude Agent SDK統合

Scenario: SDK query() APIでエージェントを実行できる
  Given スキルが選択されている
  And ユーザーがメッセージを入力している
  When agent:startを呼び出す
  Then SDK query() APIが呼び出される
  And スキルコンテキストがsettingSourcesで渡される

Scenario: ストリーミングメッセージを受信できる
  Given エージェントが実行中である
  When SDKがメッセージを生成する
  Then agent:streamイベントがRendererに送信される
  And SDKMessage型のデータが含まれる

Scenario: 危険なツール使用をブロックできる
  Given エージェントが実行中である
  And PreToolUse Hookが設定されている
  When 危険なBashコマンドが実行されようとする
  Then PreToolUse Hookがproceed: falseを返す
  And ツール使用がブロックされる

Scenario: Permission Dialogでユーザー承認を求められる
  Given エージェントが実行中である
  And PermissionRequest Hookが設定されている
  When 権限確認が必要なツールが呼び出される
  Then agent:permissionイベントがRendererに送信される
  And Rendererからagent:permission:resで応答を受信する

Scenario: 実行をキャンセルできる
  Given エージェントが実行中である
  When agent:stopを呼び出す
  Then AbortControllerがabort()される
  And 実行がキャンセルされる

Scenario: エラーを処理できる
  Given エージェントを実行している
  When SDK実行でエラーが発生する
  Then agent:streamイベントでerrorタイプが送信される
  And エラーメッセージが含まれる

Scenario: 複数の実行を管理できる
  Given 実行Aが進行中である
  When 新しい実行Bを開始する
  Then 実行Aと実行Bが独立して管理される
  And 各実行のストリームがexecutionIdで区別される

Scenario: 宣言的権限ルールで制御できる
  Given Permission Rulesが設定されている
  When deny/allow/askルールに該当するツールが呼ばれる
  Then ルールに従って権限判定が行われる
```

#### 成果物

- `outputs/phase-1/requirements.md`

#### 完了条件

- [ ] 受け入れ基準がGiven-When-Then形式で定義されている
- [ ] Claude Code CLIの呼び出し仕様が明確化されている

---

### Phase 2: 設計

#### 使用スキル

| スキル名         | パス                                       | 選定理由        |
| ---------------- | ------------------------------------------ | --------------- |
| domain-modeling  | `.claude/skills/domain-modeling/SKILL.md`  | 実行モデル設計  |
| claude-agent-sdk | `.claude/skills/claude-agent-sdk/SKILL.md` | SDK統合パターン |

#### 設計内容

**1. 型定義拡張**

```typescript
// packages/shared/src/types/agent.ts に追加

// SDK実行リクエスト
export interface AgentExecutionRequest {
  executionId: string; // UUID
  skillId: string;
  skillPath: string;
  prompt: string;
  workingDirectory?: string;
  tools?: string[]; // 許可するツール
  permissionMode?: "auto" | "ask" | "deny" | "default";
}

// SDKメッセージ型（ストリーミング用）
export interface AgentStreamMessage {
  executionId: string;
  type: "assistant" | "user" | "result" | "tool_use" | "status" | "error";
  content: unknown;
  timestamp: number;
}

// Permission Request（UIダイアログ用）
export interface PermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}

// Permission Response（UIからの応答）
export interface PermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
}

// 実行状態
export interface AgentExecutionStatus {
  executionId: string;
  status: "running" | "completed" | "cancelled" | "error";
  startedAt: number;
  completedAt?: number;
  error?: string;
}

// Permission Rule型
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

**2. HooksFactory設計**

```typescript
// HooksFactory.ts
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
      // ツール実行前: 危険なコマンドをブロック
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

      // ツール実行後: ステータス更新
      PostToolUse: async (input, toolUseID, { signal }) => {
        this.mainWindow.webContents.send(IPC_CHANNELS.AGENT_STATUS, {
          executionId: this.executionId,
          type: "tool_completed",
          tool: input.toolName,
          timestamp: Date.now(),
        });
        return {};
      },

      // 権限リクエスト: UIダイアログ表示
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

      // セッション開始
      SessionStart: async (input, toolUseID, { signal }) => {
        this.mainWindow.webContents.send(IPC_CHANNELS.AGENT_STATUS, {
          executionId: this.executionId,
          type: "session_started",
          timestamp: Date.now(),
        });
        return {};
      },

      // セッション終了
      SessionEnd: async (input, toolUseID, { signal }) => {
        this.mainWindow.webContents.send(IPC_CHANNELS.AGENT_STATUS, {
          executionId: this.executionId,
          type: "session_ended",
          timestamp: Date.now(),
        });
        return {};
      },
    };
  }
}

// Permission応答を解決するクラス
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

**3. PermissionRulesConfig設計**

```typescript
// PermissionRules.ts

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

**4. AgentExecutor設計**

```typescript
// AgentExecutor.ts
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
      settingSources: ["user", "project"], // スキル設定を読み込む
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

**5. ExecutionManager設計**

```typescript
// ExecutionManager.ts
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

**6. IPCチャネル定義**

```typescript
// channels.ts に追加
AGENT_START: "agent:start",
AGENT_STOP: "agent:stop",
AGENT_STOP_ALL: "agent:stop-all",
AGENT_GET_ACTIVE_EXECUTIONS: "agent:get-active-executions",
AGENT_STREAM: "agent:stream",
AGENT_STATUS: "agent:status",
AGENT_PERMISSION: "agent:permission",        // Main → Renderer（権限確認要求）
AGENT_PERMISSION_RES: "agent:permission:res", // Renderer → Main（権限確認応答）
```

**7. agentHandlers拡張**

```typescript
// agentHandlers.ts に追加
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

#### 成果物

- `outputs/phase-2/design.md`
- シーケンス図

#### 完了条件

- [ ] 型定義が完成している
- [ ] クラス設計が完成している
- [ ] IPC通信フローが設計されている

---

### Phase 3: 設計レビューゲート

#### 使用スキル

| スキル名             | パス                                           | 選定理由         |
| -------------------- | ---------------------------------------------- | ---------------- |
| code-smell-detection | `.claude/skills/code-smell-detection/SKILL.md` | 設計品質チェック |

#### セキュリティレビュー項目

- [ ] コマンドインジェクション対策
- [ ] 環境変数の安全な受け渡し
- [ ] プロセス終了時のクリーンアップ

#### 完了条件

- [ ] セキュリティレビューが完了している
- [ ] 既存パターンと整合している

---

### Phase 4: テスト作成

#### 使用スキル

| スキル名       | パス                                     | 選定理由        |
| -------------- | ---------------------------------------- | --------------- |
| tdd-principles | `.claude/skills/tdd-principles/SKILL.md` | TDDでテスト先行 |

#### テストケース

```typescript
// HooksFactory.test.ts
describe("HooksFactory", () => {
  it("should create hooks object with all required hooks", () => {});
  it("PreToolUse should block dangerous bash commands", async () => {});
  it("PreToolUse should allow safe commands", async () => {});
  it("PostToolUse should send status via IPC", async () => {});
  it("PermissionRequest should send request and wait for response", async () => {});
  it("PermissionRequest should handle abort signal", async () => {});
});

// PermissionResolver.test.ts
describe("PermissionResolver", () => {
  it("should resolve pending request", async () => {});
  it("should reject on abort signal", async () => {});
  it("should handle multiple pending requests", async () => {});
});

// AgentExecutor.test.ts
describe("AgentExecutor", () => {
  it("should call SDK query() with correct options", async () => {});
  it("should stream messages via IPC", async () => {});
  it("should send completion status on success", async () => {});
  it("should send cancelled status on abort", async () => {});
  it("should send error status on exception", async () => {});
  it("should apply permission rules correctly", async () => {});
});

// ExecutionManager.test.ts
describe("ExecutionManager", () => {
  it("should start execution and return id", async () => {});
  it("should track active executions", async () => {});
  it("should stop specific execution", async () => {});
  it("should stop all executions", async () => {});
  it("should remove execution on completion", async () => {});
  it("should handle multiple concurrent executions", async () => {});
  it("should resolve permission for specific execution", async () => {});
});

// agentHandlers.test.ts (execution)
describe("agentHandlers execution", () => {
  it("should handle agent:start", async () => {});
  it("should handle agent:stop", async () => {});
  it("should handle agent:stop-all", async () => {});
  it("should handle agent:get-active-executions", async () => {});
  it("should handle agent:permission:res", async () => {});
});
```

#### 完了条件

- [ ] 各クラスのユニットテストがある
- [ ] IPCハンドラーのテストがある
- [ ] すべてのテストが失敗状態（Red）

---

### Phase 5: 実装

#### 使用スキル

| スキル名            | パス                                          | 選定理由         |
| ------------------- | --------------------------------------------- | ---------------- |
| multi-agent-systems | `.claude/skills/multi-agent-systems/SKILL.md` | プロセス管理実装 |

#### 実装ファイル

1. `packages/shared/src/types/agent.ts`（更新）
2. `apps/desktop/src/main/services/agent/HooksFactory.ts`
3. `apps/desktop/src/main/services/agent/PermissionRules.ts`
4. `apps/desktop/src/main/services/agent/AgentExecutor.ts`
5. `apps/desktop/src/main/services/agent/ExecutionManager.ts`
6. `apps/desktop/src/main/services/agent/index.ts`
7. `apps/desktop/src/main/ipc/agentHandlers.ts`（更新）
8. `apps/desktop/src/preload/channels.ts`（更新）
9. `apps/desktop/src/main/index.ts`（ExecutionManager初期化）

#### 完了条件

- [ ] 全クラスが実装されている
- [ ] SDK `query()` APIでエージェントが実行できる
- [ ] Hooksシステムが動作する
- [ ] Permission Controlが動作する
- [ ] ストリーミングが動作する
- [ ] AbortSignalでキャンセルが動作する
- [ ] テストがすべて通過（Green）

---

### Phase 6-13: 標準フロー

標準のPhase 6-13フローに従って実装を完了する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SDK `query()` APIでエージェントを実行できる
- [ ] Hooksシステムで危険なツール使用をブロックできる
- [ ] Permission Controlで宣言的に権限ルールを定義できる
- [ ] Permission Dialogでユーザー承認を求められる
- [ ] ストリーミング出力を受信できる
- [ ] AbortSignalで実行をキャンセルできる
- [ ] 複数の実行を管理できる

### 品質要件

- [ ] テストカバレッジ: Line 80%以上
- [ ] TypeScript型エラーなし
- [ ] ESLint/Prettierエラーなし

### セキュリティ要件

- [ ] 危険なBashコマンドがPreToolUseでブロックされる
- [ ] システムディレクトリへの書き込みがdenyルールで禁止される
- [ ] 書き込み系ツールがaskルールで確認を要求する
- [ ] AbortSignalが適切にチェックされる

### ドキュメント要件

- [ ] Claude Agent SDK統合仕様が文書化されている
- [ ] Hooksシステム実装ガイドが作成されている
- [ ] Permission Control設定ガイドが作成されている

---

## 6. 検証方法

### テストケース

```bash
# ユニットテスト
pnpm --filter @repo/desktop test src/main/services/agent/
```

### 検証手順

1. アプリを起動
2. スキルを選択
3. メッセージを送信してagent:startを呼び出す
4. SDK `query()` APIが呼び出されることを確認
5. ストリーミング出力（agent:stream）がRendererに届くことを確認
6. 危険なBashコマンド実行時にPreToolUseでブロックされることを確認
7. askルールのツール使用時にPermission Dialog（agent:permission）が表示されることを確認
8. Permission Dialogで承認/拒否した結果がエージェントに反映されることを確認
9. キャンセルボタンで実行がAbortSignalで中断されることを確認
10. 複数実行を同時に開始して独立管理されることを確認

---

## 7. リスクと対策

| リスク                              | 影響度 | 発生確率 | 対策                                                 |
| ----------------------------------- | ------ | -------- | ---------------------------------------------------- |
| Claude Codeの認証が未完了           | 高     | 中       | 起動時チェック、認証ガイド表示                       |
| Permission Dialog応答のタイムアウト | 中     | 中       | タイムアウト設定、デフォルト拒否                     |
| ストリーミングの途切れ              | 中     | 低       | エラーハンドリング、再試行ロジック                   |
| AbortSignalの伝播漏れ               | 中     | 低       | signal.abortedの定期チェック、Hook内でのチェック実装 |
| 複数実行時のPermission競合          | 中     | 低       | executionIdによる分離、requestIdによる一意識別       |

---

## 8. 参照情報

### 関連ドキュメント

- Claude Agent SDK スキル: `.claude/skills/claude-agent-sdk/`
  - `references/query-api.md` - query() API
  - `references/hooks-system.md` - Hooksシステム
  - `references/permission-control.md` - Permission Control
  - `references/electron-ipc.md` - Electron IPC統合
  - `assets/agent-handler-template.ts` - IPCハンドラーテンプレート
- `apps/desktop/src/main/ipc/` - 既存IPCハンドラー

### 参考資料

- [Claude Agent SDK](https://github.com/anthropics/claude-code) - `@anthropic-ai/claude-agent-sdk`
- [AbortController MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [AsyncIterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator)

---

## 9. 備考

### 実行モデル：Claude Agent SDK

本機能は、**Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）** を使用します：

- SDKはローカルのClaude Code認証を自動的に利用する
- ユーザーのClaude Codeサブスクリプション（Pro/Team/Enterprise）を使用
- アプリはAnthropicAPIキーを直接管理しない
- `query()` APIでストリーミング、Hooks、Permission Controlを統合的に扱う

### SDK `query()` API 基本形式

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const conversation = query({
  prompt: "ユーザーメッセージ",
  options: {
    tools: ["Read", "Edit", "Write", "Bash"],
    permissionMode: "default",
    permissions: { allow: [...], deny: [...], ask: [...] },
    hooks: { PreToolUse, PostToolUse, PermissionRequest },
    signal: abortController.signal,
    settingSources: ["user", "project"],
  },
});

for await (const message of conversation.stream()) {
  // ストリーミング処理
}
```

### 前提条件

- Claude Code（ローカル認証済み）がインストールされていること
- 有効なClaude Code契約（Pro/Team/Enterprise）があること
- `@anthropic-ai/claude-agent-sdk` パッケージがインストールされていること

### Hooksシステムの注意点

- `signal.aborted`を定期的にチェックすること
- 非同期処理には適切なタイムアウトを設定すること
- PreToolUseで危険なコマンドを確実にブロックすること

### Permission Controlの注意点

- 最小権限の原則に従うこと（deny-allから開始）
- プロジェクトディレクトリ外への書き込みを禁止すること
- 本番環境では`bypassPermissions`を使用しないこと

### Permission Dialog連携

- AGENT-004でPermission Dialog UIを実装
- Main→Renderer: `agent:permission` イベントで権限確認を要求
- Renderer→Main: `agent:permission:res` で承認/拒否を応答
- `rememberChoice`オプションで同一ツールの次回以降の判定を記憶可能

### 将来の拡張

- カスタムPermission Rules UI（設定画面から編集）
- 実行履歴の永続化
- 複数のPermissionプリセット対応
