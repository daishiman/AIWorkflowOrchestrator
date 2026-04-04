# Electron IPC 統合リファレンス

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────┐
│                  Electron App                       │
├─────────────────────────────────────────────────────┤
│  Renderer Process                                   │
│  ┌────────────────────────────────────────────────┐ │
│  │  UI Components (React)                         │ │
│  │  - ChatView                                    │ │
│  │  - AgentStatusPanel                            │ │
│  │  - PermissionDialog                            │ │
│  └────────────────────┬───────────────────────────┘ │
│                       │ IPC                         │
│  ┌────────────────────▼───────────────────────────┐ │
│  │  Main Process                                  │ │
│  │  ┌──────────────────────────────────────────┐  │ │
│  │  │  Agent SDK Integration                   │  │ │
│  │  │  - query() API                           │  │ │
│  │  │  - Hook handlers                         │  │ │
│  │  │  - Permission control                    │  │ │
│  │  └──────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## IPCチャネル設計

### Agent チャネル

| チャネル               | 方向            | 用途                     |
| ---------------------- | --------------- | ------------------------ |
| `agent:start`          | Renderer → Main | エージェント起動         |
| `agent:stop`           | Renderer → Main | エージェント停止         |
| `agent:message`        | Renderer → Main | メッセージ送信           |
| `agent:stream`         | Main → Renderer | ストリーミングメッセージ |
| `agent:permission`     | Main → Renderer | 権限要求                 |
| `agent:permission:res` | Renderer → Main | 権限応答                 |
| `agent:status`         | Main → Renderer | ステータス更新           |

### AuthKey チャネル

| チャネル           | 方向            | 用途                       |
| ------------------ | --------------- | -------------------------- |
| `auth-key:set`     | Renderer → Main | APIキー設定（暗号化保存）  |
| `auth-key:exists`  | Renderer → Main | APIキー存在確認            |
| `auth-key:validate`| Renderer → Main | APIキー検証（API呼び出し） |
| `auth-key:delete`  | Renderer → Main | APIキー削除                |

---

## Main Process 実装

### agentHandlers.ts

```typescript
// apps/desktop/src/main/ipc/agentHandlers.ts
import { query, type Options, type HookInput } from "@anthropic-ai/claude-agent-sdk";
import { ipcMain, BrowserWindow } from "electron";

let currentConversation: ReturnType<typeof query> | null = null;
let abortController: AbortController | null = null;

export function setupAgentHandlers(mainWindow: BrowserWindow) {
  // エージェント起動
  ipcMain.handle("agent:start", async (event, config: AgentStartConfig) => {
    abortController = new AbortController();

    const options: Options = {
      tools: config.tools || ["Read", "Edit", "Bash"],
      permissionMode: "ask",
      hooks: {
        PreToolUse: async (input, toolUseID, { signal }) => {
          if (shouldBlockTool(input)) {
            return {
              proceed: false,
              message: "このツール使用は許可されていません",
            };
          }

          if (requiresUserApproval(input)) {
            const approved = await requestPermission(mainWindow, input);
            return { proceed: approved };
          }

          return { proceed: true };
        },

        PostToolUse: async (input, toolUseID) => {
          mainWindow.webContents.send("agent:status", {
            type: "tool_completed",
            tool: input.toolName,
            timestamp: Date.now(),
          });
          return {};
        },

        PermissionRequest: async (input, toolUseID, { signal }) => {
          const approved = await requestPermission(mainWindow, input);
          return { proceed: approved };
        },
      },
    };

    try {
      currentConversation = query({
        prompt: config.initialPrompt,
        options,
      });

      processStream(mainWindow);

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // エージェント停止
  ipcMain.handle("agent:stop", async () => {
    abortController?.abort();
    currentConversation = null;
    abortController = null;
    return { success: true };
  });

  // 権限応答
  ipcMain.on("agent:permission:res", (event, response: PermissionResponse) => {
    const resolver = permissionResolvers.get(response.requestId);
    if (resolver) {
      resolver(response.approved);
      permissionResolvers.delete(response.requestId);
    }
  });
}
```

### ストリーミング処理

```typescript
async function processStream(mainWindow: BrowserWindow) {
  if (!currentConversation) return;

  try {
    for await (const message of currentConversation.stream()) {
      mainWindow.webContents.send("agent:stream", {
        type: message.type,
        data: sanitizeMessageForIPC(message),
        timestamp: Date.now(),
      });
    }

    mainWindow.webContents.send("agent:status", {
      type: "completed",
      timestamp: Date.now(),
    });
  } catch (error) {
    mainWindow.webContents.send("agent:status", {
      type: "error",
      error: String(error),
      timestamp: Date.now(),
    });
  }
}
```

### 権限要求処理

```typescript
const permissionResolvers = new Map<string, (approved: boolean) => void>();

async function requestPermission(
  mainWindow: BrowserWindow,
  input: HookInput,
): Promise<boolean> {
  const requestId = crypto.randomUUID();

  return new Promise((resolve) => {
    permissionResolvers.set(requestId, resolve);

    mainWindow.webContents.send("agent:permission", {
      requestId,
      toolName: input.toolName,
      args: sanitizeArgsForIPC(input.args),
    });

    // タイムアウト（30秒）
    setTimeout(() => {
      if (permissionResolvers.has(requestId)) {
        permissionResolvers.delete(requestId);
        resolve(false);
      }
    }, 30000);
  });
}
```

---

## Preload Script

```typescript
// apps/desktop/src/preload/index.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  agent: {
    start: (config: AgentStartConfig) =>
      ipcRenderer.invoke("agent:start", config),
    stop: () => ipcRenderer.invoke("agent:stop"),
    sendMessage: (message: string) =>
      ipcRenderer.invoke("agent:message", message),
    respondToPermission: (response: PermissionResponse) =>
      ipcRenderer.send("agent:permission:res", response),

    onStream: (callback: (message: AgentMessage) => void) => {
      const handler = (_event: unknown, message: AgentMessage) =>
        callback(message);
      ipcRenderer.on("agent:stream", handler);
      return () => ipcRenderer.removeListener("agent:stream", handler);
    },

    onPermission: (callback: (request: PermissionRequest) => void) => {
      const handler = (_event: unknown, request: PermissionRequest) =>
        callback(request);
      ipcRenderer.on("agent:permission", handler);
      return () => ipcRenderer.removeListener("agent:permission", handler);
    },

    onStatus: (callback: (status: AgentStatus) => void) => {
      const handler = (_event: unknown, status: AgentStatus) =>
        callback(status);
      ipcRenderer.on("agent:status", handler);
      return () => ipcRenderer.removeListener("agent:status", handler);
    },
  },
});
```

---

## Renderer Process: useAgent Hook

```typescript
// apps/desktop/src/renderer/hooks/useAgent.ts
import { useCallback, useEffect, useState, useRef } from "react";

interface AgentState {
  isRunning: boolean;
  messages: AgentMessage[];
  pendingPermission: PermissionRequest | null;
  error: string | null;
}

export function useAgent() {
  const [state, setState] = useState<AgentState>({
    isRunning: false,
    messages: [],
    pendingPermission: null,
    error: null,
  });

  const messagesRef = useRef<AgentMessage[]>([]);

  useEffect(() => {
    const unsubscribeStream = window.electronAPI.agent.onStream(
      (message: AgentMessage) => {
        messagesRef.current = [...messagesRef.current, message];
        setState((prev) => ({
          ...prev,
          messages: messagesRef.current,
        }));
      },
    );

    const unsubscribePermission = window.electronAPI.agent.onPermission(
      (request: PermissionRequest) => {
        setState((prev) => ({
          ...prev,
          pendingPermission: request,
        }));
      },
    );

    const unsubscribeStatus = window.electronAPI.agent.onStatus(
      (status: { type: string; error?: string }) => {
        if (status.type === "completed") {
          setState((prev) => ({ ...prev, isRunning: false }));
        } else if (status.type === "error") {
          setState((prev) => ({
            ...prev,
            isRunning: false,
            error: status.error || "Unknown error",
          }));
        }
      },
    );

    return () => {
      unsubscribeStream();
      unsubscribePermission();
      unsubscribeStatus();
    };
  }, []);

  const startAgent = useCallback(async (prompt: string, tools?: string[]) => {
    setState((prev) => ({ ...prev, isRunning: true, error: null }));
    messagesRef.current = [];

    const result = await window.electronAPI.agent.start({
      initialPrompt: prompt,
      tools,
    });

    if (!result.success) {
      setState((prev) => ({
        ...prev,
        isRunning: false,
        error: result.error,
      }));
    }
  }, []);

  const stopAgent = useCallback(async () => {
    await window.electronAPI.agent.stop();
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const respondToPermission = useCallback(
    async (approved: boolean) => {
      if (!state.pendingPermission) return;

      await window.electronAPI.agent.respondToPermission({
        requestId: state.pendingPermission.requestId,
        approved,
      });

      setState((prev) => ({ ...prev, pendingPermission: null }));
    },
    [state.pendingPermission],
  );

  return {
    ...state,
    startAgent,
    stopAgent,
    respondToPermission,
  };
}
```

---

## AuthKeyService 統合パターン

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron App                            │
├─────────────────────────────────────────────────────────────┤
│  Renderer Process                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Settings UI                                           │ │
│  │  - API Key Input                                       │ │
│  │  - Validation Status                                   │ │
│  └───────────────────┬────────────────────────────────────┘ │
│                      │ IPC (auth-key:*)                     │
│  ┌───────────────────▼────────────────────────────────────┐ │
│  │  Main Process                                          │ │
│  │  ┌───────────────────────────────────────────────────┐ │ │
│  │  │  AuthKeyService                                   │ │ │
│  │  │  - safeStorage encryption                         │ │ │
│  │  │  - electron-store persistence                     │ │ │
│  │  │  - API validation                                 │ │ │
│  │  └───────────────────────────────────────────────────┘ │ │
│  │                       │                                │ │
│  │                       ▼ DI                             │ │
│  │  ┌───────────────────────────────────────────────────┐ │ │
│  │  │  SkillExecutor                                    │ │ │
│  │  │  - query() with auto key resolution               │ │ │
│  │  └───────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 統合フロー

1. **Main Process で AuthKeyService を初期化**
2. **SkillExecutor に DI で注入**
3. **query() 呼び出し時に自動でキーを取得**

### authKeyHandlers.ts

```typescript
// apps/desktop/src/main/ipc/authKeyHandlers.ts
import { ipcMain } from "electron";
import { authKeyService } from "../services/auth/AuthKeyService";

export function setupAuthKeyHandlers(): void {
  // APIキー設定
  ipcMain.handle("auth-key:set", async (_, key: string) => {
    try {
      await authKeyService.setKey(key);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // キー存在確認
  ipcMain.handle("auth-key:exists", async () => {
    return authKeyService.hasKey();
  });

  // キー検証（API呼び出しで確認）
  ipcMain.handle("auth-key:validate", async () => {
    return authKeyService.validateKey();
  });

  // キー削除
  ipcMain.handle("auth-key:delete", async () => {
    try {
      await authKeyService.deleteKey();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}
```

### Preload API

```typescript
// apps/desktop/src/preload/authKeyApi.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("authKeyApi", {
  setKey: (key: string) => ipcRenderer.invoke("auth-key:set", key),
  hasKey: () => ipcRenderer.invoke("auth-key:exists"),
  validateKey: () => ipcRenderer.invoke("auth-key:validate"),
  deleteKey: () => ipcRenderer.invoke("auth-key:delete"),
});
```

### SkillExecutor 連携

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts
export class SkillExecutor {
  constructor(private readonly deps: {
    authKeyService: AuthKeyService;
    retryConfig?: RetryConfig;
  }) {}

  async execute(phase: SkillPhase, projectPath: string): Promise<Result> {
    // 認証キーを自動解決
    const apiKey = await this.resolveApiKey();

    if (!apiKey) {
      throw new AuthenticationError(3001, "API key not set");
    }

    return this.executeWithRetry(() =>
      query({ prompt, options: { apiKey, ...options } })
    );
  }

  private async resolveApiKey(): Promise<string | null> {
    // 1. AuthKeyService から取得
    const key = await this.deps.authKeyService.getKey();
    if (key) return key;

    // 2. 環境変数フォールバック
    return process.env.ANTHROPIC_API_KEY || null;
  }
}
```

---

## External API IPC 統合パターン（TASK-SDK-SC-03）

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron App                            │
├─────────────────────────────────────────────────────────────┤
│  Renderer Process                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ExternalApiConfigForm                                 │ │
│  │  - API URL / Method / Auth 入力                        │ │
│  │  - 接続テスト結果表示                                  │ │
│  └───────────────────┬────────────────────────────────────┘ │
│                      │ IPC (skill-creator:*)                │
│  ┌───────────────────▼────────────────────────────────────┐ │
│  │  Main Process                                          │ │
│  │  ┌───────────────────────────────────────────────────┐ │ │
│  │  │  SkillCreatorIpcBridge                            │ │ │
│  │  │  → SkillCreatorSdkSession                        │ │ │
│  │  │    - RequestExternalApiConfig custom tool         │ │ │
│  │  │    - sanitizeExternalApiConfigForPrompt()         │ │ │
│  │  │    - 並行フロー管理（質問待機 vs API設定要求）     │ │ │
│  │  └───────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### External API IPCチャネル

| チャネル | 方向 | 用途 |
| --- | --- | --- |
| `skill-creator:configure-api` | Renderer → Main | 外部API設定を送信 |
| `skill-creator:api-configured` | Main → Renderer | API設定確認応答 |
| `skill-creator:api-test-result` | Main → Renderer | API接続テスト結果 |
| `skill-creator:external-api-config-required` | Main → Renderer | 設定要求通知（フォーム表示トリガー） |
| `skill-creator:get-verify-detail` | Renderer → Main | verify チェック詳細取得（TASK-P0-01） |
| `skill-creator:request-reverify` | Renderer → Main | 再 verify 要求（TASK-P0-01） |
| `skill-creator:reverify-workflow` | Renderer → Main | verify→improve→re-verify ワークフロー実行（TASK-P0-02） |

### RequestExternalApiConfig Custom Tool パターン

SDK Session 内で外部API設定が必要になった際、custom tool を使ってRendererにUI表示を要求し、ユーザー入力を待機するパターン。

```typescript
// SkillCreatorSdkSession.ts
private buildRequestExternalApiConfigTool() {
  return {
    name: "RequestExternalApiConfig",
    description: "外部API接続設定をユーザーに要求する",
    // tool_use を受けると:
    // 1. pendingExternalApiPromise を作成（Promise<ExternalApiConnectionConfig>）
    // 2. IPC経由でRendererに設定フォーム表示を要求
    // 3. Rendererから configure-api で設定が送信されるまで待機
    // 4. 受領した設定を sanitize してSDKに返却
  };
}
```

### 並行フロー管理パターン

質問待機（`pendingQuestionResolve`）と API設定要求（`pendingExternalApiResolve`）は相互排他。

```typescript
// 相互排他: 一方を解決してから他方を開始
private pendingQuestionResolve: ((answer: string) => void) | null = null;
private pendingExternalApiResolve:
  | ((config: ExternalApiConnectionConfig) => void)
  | null = null;
private pendingExternalApiPromise:
  | Promise<ExternalApiConnectionConfig>
  | null = null;
```

**注意点**:
- `pendingQuestionResolve` と `pendingExternalApiResolve` が同時に存在しないことを保証する
- タイムアウト時は両方を適切にクリーンアップする
- abort時は pending Promise を reject してリソースリークを防ぐ

### 秘匿化パターン（sanitizeForPrompt）

外部API設定をSDKに返す際、認証情報をマスクしてプロンプトに含める。

```typescript
private sanitizeExternalApiConfigForPrompt(
  config: ExternalApiConnectionConfig,
): ExternalApiConnectionConfig {
  return {
    ...config,
    credential: config.credential ? "***REDACTED***" : undefined,
  };
}
```

**重要**: SDKに渡すプロンプト文字列には生の認証情報を含めない。HTTP呼び出し時のみ生の credential を使用する。

---

## セキュリティベストプラクティス

### Main Process

| 項目                 | 推奨設定                          |
| -------------------- | --------------------------------- |
| APIキー管理          | Electron SafeStorageで暗号化保存  |
| ファイルアクセス     | プロジェクトディレクトリに制限    |
| コマンド実行         | 危険パターンをPreToolUseでブロック |
| IPC通信              | 入力バリデーション必須            |

### Renderer Process

| 項目               | 推奨設定                       |
| ------------------ | ------------------------------ |
| 権限ダイアログ     | 操作内容を明示的に表示         |
| タイムアウト       | 無応答時は自動拒否             |
| エラー表示         | 機密情報を含めない             |
| 状態管理           | 不整合を防ぐためuseRefを活用   |

---

## 関連ドキュメント

- [query-api.md](./query-api.md) - query() API
- [hooks-system.md](./hooks-system.md) - Hooksシステム
- [security-sandboxing.md](./security-sandboxing.md) - セキュリティとサンドボックス
