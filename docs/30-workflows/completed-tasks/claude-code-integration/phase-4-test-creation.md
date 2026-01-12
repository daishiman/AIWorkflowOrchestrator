# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                      |
| ------ | ----------------------- |
| Phase  | 4                       |
| 機能名 | claude-code-integration |
| 作成日 | 2026-01-12              |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- HooksFactoryテスト: PreToolUse/PostToolUse/PermissionRequestのテスト作成
- AgentExecutorテスト: query()呼び出し・ストリーミング・エラー処理のテスト作成
- ExecutionManagerテスト: 複数実行管理・キャンセルのテスト作成
- 統合テストシナリオ作成: API接続/データフロー/エラー/Permission連携テスト設計

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                                        | 内容             |
| ---------- | --------------------------------------------------------------------------- | ---------------- |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト方針・基準 |

### Phase 1-3成果物

| 資料名             | パス                                         | 説明          |
| ------------------ | -------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| レビュー結果       | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

## 実行手順

### 1. HooksFactoryテスト

```typescript
// apps/desktop/src/main/services/agent/__tests__/HooksFactory.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HooksFactory, PermissionResolver } from "../HooksFactory";
import type { BrowserWindow } from "electron";

describe("HooksFactory", () => {
  let mockWindow: BrowserWindow;
  let permissionResolver: PermissionResolver;
  let hooksFactory: HooksFactory;

  beforeEach(() => {
    mockWindow = {
      webContents: {
        send: vi.fn(),
      },
    } as unknown as BrowserWindow;
    permissionResolver = new PermissionResolver();
    hooksFactory = new HooksFactory(
      mockWindow,
      "test-execution-id",
      permissionResolver,
    );
  });

  it("should create hooks object with all required hooks", () => {
    const hooks = hooksFactory.createHooks();
    expect(hooks.PreToolUse).toBeDefined();
    expect(hooks.PostToolUse).toBeDefined();
    expect(hooks.PermissionRequest).toBeDefined();
  });

  describe("PreToolUse", () => {
    it("should block dangerous bash commands (rm -rf)", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "rm -rf /important" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(false);
      expect(result.message).toContain("rm -rf");
    });

    it("should block dangerous bash commands (sudo)", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "sudo apt-get install" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(false);
      expect(result.message).toContain("sudo");
    });

    it("should block dangerous bash commands (chmod 777)", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "chmod 777 /etc/passwd" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(false);
    });

    it("should allow safe commands", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "ls -la" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(true);
    });

    it("should allow non-Bash tools", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Read", args: { path: "/some/file.txt" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(true);
    });
  });

  describe("PostToolUse", () => {
    it("should send status via IPC", async () => {
      const hooks = hooksFactory.createHooks();
      await hooks.PostToolUse!({ toolName: "Read", args: {} }, "tool-use-id", {
        signal: new AbortController().signal,
      });
      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        "agent:status",
        expect.objectContaining({
          executionId: "test-execution-id",
          type: "tool_completed",
          tool: "Read",
        }),
      );
    });
  });

  describe("PermissionRequest", () => {
    it("should send request and wait for response", async () => {
      const hooks = hooksFactory.createHooks();
      const abortController = new AbortController();

      // 応答を解決するための非同期処理
      const responsePromise = hooks.PermissionRequest!(
        { toolName: "Write", args: { path: "/some/file.txt" } },
        "tool-use-id",
        { signal: abortController.signal },
      );

      // IPC送信を確認
      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        "agent:permission",
        expect.objectContaining({
          executionId: "test-execution-id",
          toolName: "Write",
        }),
      );

      // 応答を解決
      const requestId = (mockWindow.webContents.send as vi.Mock).mock
        .calls[0][1].requestId;
      permissionResolver.resolveRequest({ requestId, approved: true });

      const result = await responsePromise;
      expect(result.proceed).toBe(true);
    });

    it("should handle abort signal", async () => {
      const hooks = hooksFactory.createHooks();
      const abortController = new AbortController();

      const responsePromise = hooks.PermissionRequest!(
        { toolName: "Write", args: { path: "/some/file.txt" } },
        "tool-use-id",
        { signal: abortController.signal },
      );

      abortController.abort();

      await expect(responsePromise).rejects.toThrow("Aborted");
    });
  });
});

describe("PermissionResolver", () => {
  let resolver: PermissionResolver;

  beforeEach(() => {
    resolver = new PermissionResolver();
  });

  it("should resolve pending request", async () => {
    const signal = new AbortController().signal;
    const promise = resolver.waitForResponse("req-1", signal);

    resolver.resolveRequest({ requestId: "req-1", approved: true });

    const result = await promise;
    expect(result.approved).toBe(true);
  });

  it("should reject on abort signal", async () => {
    const abortController = new AbortController();
    const promise = resolver.waitForResponse("req-1", abortController.signal);

    abortController.abort();

    await expect(promise).rejects.toThrow("Aborted");
  });

  it("should handle multiple pending requests", async () => {
    const signal = new AbortController().signal;

    const promise1 = resolver.waitForResponse("req-1", signal);
    const promise2 = resolver.waitForResponse("req-2", signal);

    resolver.resolveRequest({ requestId: "req-1", approved: true });
    resolver.resolveRequest({ requestId: "req-2", approved: false });

    const [result1, result2] = await Promise.all([promise1, promise2]);
    expect(result1.approved).toBe(true);
    expect(result2.approved).toBe(false);
  });
});
```

### 2. AgentExecutorテスト

```typescript
// apps/desktop/src/main/services/agent/__tests__/AgentExecutor.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AgentExecutor } from "../AgentExecutor";
import type { BrowserWindow } from "electron";
import type { AgentExecutionRequest } from "@repo/shared";

// SDK モック
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: vi.fn(),
}));

import { query } from "@anthropic-ai/claude-agent-sdk";

describe("AgentExecutor", () => {
  let mockWindow: BrowserWindow;
  let mockRequest: AgentExecutionRequest;

  beforeEach(() => {
    mockWindow = {
      webContents: {
        send: vi.fn(),
      },
    } as unknown as BrowserWindow;

    mockRequest = {
      executionId: "test-exec-id",
      skillId: "test-skill",
      skillPath: "/path/to/skill",
      prompt: "Test prompt",
      workingDirectory: "/test/dir",
    };

    vi.clearAllMocks();
  });

  it("should call SDK query() with correct options", async () => {
    const mockStream = (async function* () {
      yield { type: "assistant", message: "Hello" };
    })();

    (query as vi.Mock).mockReturnValue({
      stream: () => mockStream,
    });

    const executor = new AgentExecutor(mockRequest, mockWindow);
    await executor.start();

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Test prompt",
        options: expect.objectContaining({
          tools: expect.arrayContaining(["Read", "Edit", "Write", "Bash"]),
          signal: expect.any(AbortSignal),
        }),
      }),
    );
  });

  it("should stream messages via IPC", async () => {
    const mockStream = (async function* () {
      yield { type: "assistant", message: "First message" };
      yield { type: "assistant", message: "Second message" };
    })();

    (query as vi.Mock).mockReturnValue({
      stream: () => mockStream,
    });

    const executor = new AgentExecutor(mockRequest, mockWindow);
    await executor.start();

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      "agent:stream",
      expect.objectContaining({
        executionId: "test-exec-id",
        type: "assistant",
      }),
    );
  });

  it("should send completion status on success", async () => {
    const mockStream = (async function* () {
      yield { type: "assistant", message: "Done" };
    })();

    (query as vi.Mock).mockReturnValue({
      stream: () => mockStream,
    });

    const executor = new AgentExecutor(mockRequest, mockWindow);
    await executor.start();

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      "agent:status",
      expect.objectContaining({
        executionId: "test-exec-id",
        status: "completed",
      }),
    );
  });

  it("should send cancelled status on abort", async () => {
    const mockStream = (async function* () {
      await new Promise((resolve) => setTimeout(resolve, 100));
      yield { type: "assistant", message: "This should not be sent" };
    })();

    (query as vi.Mock).mockReturnValue({
      stream: () => mockStream,
    });

    const executor = new AgentExecutor(mockRequest, mockWindow);
    const startPromise = executor.start();

    executor.stop();

    await startPromise;

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      "agent:status",
      expect.objectContaining({
        executionId: "test-exec-id",
        status: "cancelled",
      }),
    );
  });

  it("should send error status on exception", async () => {
    (query as vi.Mock).mockImplementation(() => {
      throw new Error("SDK Error");
    });

    const executor = new AgentExecutor(mockRequest, mockWindow);
    await executor.start();

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      "agent:stream",
      expect.objectContaining({
        executionId: "test-exec-id",
        type: "error",
      }),
    );

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      "agent:status",
      expect.objectContaining({
        executionId: "test-exec-id",
        status: "error",
        error: "SDK Error",
      }),
    );
  });

  it("should apply permission rules correctly", async () => {
    const customRules = {
      allow: [{ tool: "Read" }],
      deny: [{ tool: "Bash" }],
      ask: [{ tool: "Write" }],
    };

    const mockStream = (async function* () {})();
    (query as vi.Mock).mockReturnValue({
      stream: () => mockStream,
    });

    const executor = new AgentExecutor(mockRequest, mockWindow, customRules);
    await executor.start();

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          permissions: expect.objectContaining({
            allow: expect.arrayContaining([{ tool: "Read" }]),
          }),
        }),
      }),
    );
  });
});
```

### 3. ExecutionManagerテスト

```typescript
// apps/desktop/src/main/services/agent/__tests__/ExecutionManager.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExecutionManager } from "../ExecutionManager";
import type { BrowserWindow } from "electron";
import type { AgentExecutionRequest } from "@repo/shared";

// AgentExecutor モック
vi.mock("../AgentExecutor", () => ({
  AgentExecutor: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    resolvePermission: vi.fn(),
  })),
}));

describe("ExecutionManager", () => {
  let manager: ExecutionManager;
  let mockWindow: BrowserWindow;

  beforeEach(() => {
    manager = new ExecutionManager();
    mockWindow = {
      webContents: {
        send: vi.fn(),
      },
    } as unknown as BrowserWindow;
  });

  it("should start execution and return id", async () => {
    const request: AgentExecutionRequest = {
      executionId: "test-id",
      skillId: "skill-1",
      skillPath: "/path",
      prompt: "Test",
    };

    const id = await manager.startExecution(request, mockWindow);
    expect(id).toBe("test-id");
  });

  it("should generate id if not provided", async () => {
    const request: Partial<AgentExecutionRequest> = {
      skillId: "skill-1",
      skillPath: "/path",
      prompt: "Test",
    };

    const id = await manager.startExecution(
      request as AgentExecutionRequest,
      mockWindow,
    );
    expect(id).toBeDefined();
    expect(typeof id).toBe("string");
  });

  it("should track active executions", async () => {
    const request1: AgentExecutionRequest = {
      executionId: "exec-1",
      skillId: "skill-1",
      skillPath: "/path",
      prompt: "Test 1",
    };
    const request2: AgentExecutionRequest = {
      executionId: "exec-2",
      skillId: "skill-2",
      skillPath: "/path",
      prompt: "Test 2",
    };

    await manager.startExecution(request1, mockWindow);
    await manager.startExecution(request2, mockWindow);

    const active = manager.getActiveExecutions();
    expect(active).toContain("exec-1");
    expect(active).toContain("exec-2");
  });

  it("should stop specific execution", async () => {
    const request: AgentExecutionRequest = {
      executionId: "exec-to-stop",
      skillId: "skill-1",
      skillPath: "/path",
      prompt: "Test",
    };

    await manager.startExecution(request, mockWindow);
    const result = manager.stopExecution("exec-to-stop");

    expect(result).toBe(true);
  });

  it("should return false when stopping non-existent execution", () => {
    const result = manager.stopExecution("non-existent");
    expect(result).toBe(false);
  });

  it("should stop all executions", async () => {
    const request1: AgentExecutionRequest = {
      executionId: "exec-1",
      skillId: "skill-1",
      skillPath: "/path",
      prompt: "Test 1",
    };
    const request2: AgentExecutionRequest = {
      executionId: "exec-2",
      skillId: "skill-2",
      skillPath: "/path",
      prompt: "Test 2",
    };

    await manager.startExecution(request1, mockWindow);
    await manager.startExecution(request2, mockWindow);

    manager.stopAllExecutions();

    // Note: 実際の実装ではstopが呼ばれることを検証
  });

  it("should resolve permission for specific execution", async () => {
    const request: AgentExecutionRequest = {
      executionId: "exec-perm",
      skillId: "skill-1",
      skillPath: "/path",
      prompt: "Test",
    };

    await manager.startExecution(request, mockWindow);

    const result = manager.resolvePermission("exec-perm", {
      requestId: "req-1",
      approved: true,
    });

    expect(result).toBe(true);
  });

  it("should return false when resolving permission for non-existent execution", () => {
    const result = manager.resolvePermission("non-existent", {
      requestId: "req-1",
      approved: true,
    });

    expect(result).toBe(false);
  });
});
```

### 4. agentHandlersテスト

```typescript
// apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain } from "electron";
import { registerAgentExecutionHandlers } from "../agentHandlers";
import { ExecutionManager } from "../../services/agent/ExecutionManager";
import type { BrowserWindow } from "electron";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

describe("agentHandlers execution", () => {
  let mockWindow: BrowserWindow;
  let mockExecutionManager: ExecutionManager;
  let handlers: Record<string, Function>;

  beforeEach(() => {
    mockWindow = {
      webContents: {
        send: vi.fn(),
      },
    } as unknown as BrowserWindow;

    mockExecutionManager = {
      startExecution: vi.fn().mockResolvedValue("exec-id"),
      stopExecution: vi.fn().mockReturnValue(true),
      stopAllExecutions: vi.fn(),
      getActiveExecutions: vi.fn().mockReturnValue(["exec-1", "exec-2"]),
      resolvePermission: vi.fn().mockReturnValue(true),
    } as unknown as ExecutionManager;

    handlers = {};
    (ipcMain.handle as vi.Mock).mockImplementation((channel, handler) => {
      handlers[channel] = handler;
    });

    registerAgentExecutionHandlers(mockWindow, mockExecutionManager);
  });

  it("should handle agent:start", async () => {
    const request = {
      executionId: "test",
      skillId: "skill",
      skillPath: "/path",
      prompt: "Test",
    };

    const result = await handlers["agent:start"]({}, request);

    expect(mockExecutionManager.startExecution).toHaveBeenCalledWith(
      request,
      mockWindow,
    );
    expect(result).toBe("exec-id");
  });

  it("should handle agent:stop", async () => {
    const result = await handlers["agent:stop"]({}, { executionId: "exec-1" });

    expect(mockExecutionManager.stopExecution).toHaveBeenCalledWith("exec-1");
    expect(result).toBe(true);
  });

  it("should handle agent:stop-all", async () => {
    const result = await handlers["agent:stop-all"]({});

    expect(mockExecutionManager.stopAllExecutions).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("should handle agent:get-active-executions", async () => {
    const result = await handlers["agent:get-active-executions"]({});

    expect(mockExecutionManager.getActiveExecutions).toHaveBeenCalled();
    expect(result).toEqual(["exec-1", "exec-2"]);
  });

  it("should handle agent:permission:res", async () => {
    const response = { requestId: "req-1", approved: true };

    const result = await handlers["agent:permission:res"](
      {},
      { executionId: "exec-1", response },
    );

    expect(mockExecutionManager.resolvePermission).toHaveBeenCalledWith(
      "exec-1",
      response,
    );
    expect(result).toBe(true);
  });
});
```

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                     | テストファイル          |
| ------------------ | -------------------------------------------- | ----------------------- |
| IPC接続テスト      | agent:start/stop/streamのエンドポイント疎通  | `*.integration.test.ts` |
| データフローテスト | Renderer→Main→SDK→Main→Rendererの往復        | `*.flow.test.ts`        |
| エラーハンドリング | SDK障害時のエラー伝播・Renderer表示          | `*.error.test.ts`       |
| Permission連携     | agent:permission→Dialog→agent:permission:res | `*.permission.test.ts`  |
| キャンセル処理     | AbortSignal伝播・キャンセル通知              | `*.cancel.test.ts`      |

## 成果物

| 成果物                 | パス                                                                      | 説明           |
| ---------------------- | ------------------------------------------------------------------------- | -------------- |
| テスト仕様書           | `outputs/phase-4/test-specification.md`                                   | テスト設計     |
| テストケース           | `outputs/phase-4/test-cases.md`                                           | ケース一覧     |
| 統合テストシナリオ     | `outputs/phase-4/integration-test-design.md`                              | 統合テスト設計 |
| HooksFactoryテスト     | `apps/desktop/src/main/services/agent/__tests__/HooksFactory.test.ts`     | テストコード   |
| AgentExecutorテスト    | `apps/desktop/src/main/services/agent/__tests__/AgentExecutor.test.ts`    | テストコード   |
| ExecutionManagerテスト | `apps/desktop/src/main/services/agent/__tests__/ExecutionManager.test.ts` | テストコード   |
| agentHandlersテスト    | `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`               | テストコード   |

## 完了条件

- [ ] HooksFactoryのテストが作成されている（PreToolUse/PostToolUse/PermissionRequest）
- [ ] AgentExecutorのテストが作成されている（query呼び出し/ストリーミング/エラー処理）
- [ ] ExecutionManagerのテストが作成されている（複数実行管理/キャンセル）
- [ ] agentHandlersのテストが作成されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## 次のPhase

Phase 5: 実装（TDD: Green）
