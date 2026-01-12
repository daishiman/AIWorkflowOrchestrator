# エージェント実行UI IPC通信設計

## 概要

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | AGENT-004          |
| 機能名   | agent-execution-ui |
| Phase    | 2                  |
| 作成日   | 2026-01-12         |

---

## IPCチャンネル一覧

### Renderer → Main Process

| チャンネル             | ペイロード           | 戻り値            | 説明         |
| ---------------------- | -------------------- | ----------------- | ------------ |
| `agent:start`          | `AgentStartPayload`  | `{ executionId }` | 実行開始     |
| `agent:stop`           | `AgentStopPayload`   | `{ success }`     | 実行停止     |
| `agent:permission:res` | `PermissionResponse` | `void`            | 権限確認応答 |

### Main Process → Renderer

| チャンネル         | ペイロード           | 説明           |
| ------------------ | -------------------- | -------------- |
| `agent:stream`     | `AgentStreamPayload` | ストリーミング |
| `agent:status`     | `AgentStatusPayload` | 状態変更通知   |
| `agent:permission` | `PermissionRequest`  | 権限確認要求   |

---

## IPCハンドラー設計

### Main Process側（agent-handler.ts）

```typescript
// apps/desktop/src/main/agent/agent-handler.ts

import { ipcMain, BrowserWindow } from "electron";
import { v4 as uuidv4 } from "uuid";
import { agentStartPayloadSchema, agentStopPayloadSchema } from "@repo/shared";
import type {
  AgentStartPayload,
  AgentStopPayload,
  PermissionResponse,
  AgentStreamPayload,
  AgentStatusPayload,
  PermissionRequest,
} from "@repo/shared";

// 実行中のAbortControllerマップ
const activeExecutions = new Map<string, AbortController>();

/**
 * エージェントIPCハンドラーを登録
 */
export function registerAgentHandlers(mainWindow: BrowserWindow): void {
  // agent:start - 実行開始
  ipcMain.handle("agent:start", async (_event, payload: AgentStartPayload) => {
    const validated = agentStartPayloadSchema.parse(payload);
    const executionId = uuidv4();
    const abortController = new AbortController();

    activeExecutions.set(executionId, abortController);

    // 状態通知: executing
    sendStatus(mainWindow, {
      executionId,
      status: "executing",
      updatedAt: new Date(),
    });

    // エージェント実行（非同期）
    executeAgent(mainWindow, executionId, validated, abortController.signal);

    return { executionId };
  });

  // agent:stop - 実行停止
  ipcMain.handle("agent:stop", async (_event, payload: AgentStopPayload) => {
    const validated = agentStopPayloadSchema.parse(payload);
    const abortController = activeExecutions.get(validated.executionId);

    if (abortController) {
      abortController.abort();
      activeExecutions.delete(validated.executionId);

      sendStatus(mainWindow, {
        executionId: validated.executionId,
        status: "cancelled",
        updatedAt: new Date(),
      });

      return { success: true };
    }

    return { success: false };
  });

  // agent:permission:res - 権限確認応答
  ipcMain.on("agent:permission:res", (_event, response: PermissionResponse) => {
    handlePermissionResponse(response);
  });
}

/**
 * ストリーミングメッセージ送信
 */
function sendStream(window: BrowserWindow, payload: AgentStreamPayload): void {
  window.webContents.send("agent:stream", payload);
}

/**
 * 状態変更通知
 */
function sendStatus(window: BrowserWindow, payload: AgentStatusPayload): void {
  window.webContents.send("agent:status", payload);
}

/**
 * 権限確認リクエスト送信
 */
function sendPermissionRequest(
  window: BrowserWindow,
  request: PermissionRequest,
): void {
  window.webContents.send("agent:permission", request);
}
```

### Preload API（agentApi.ts）

```typescript
// apps/desktop/src/preload/agentApi.ts

import { contextBridge, ipcRenderer } from "electron";
import type {
  AgentStartPayload,
  AgentStopPayload,
  PermissionResponse,
  AgentStreamPayload,
  AgentStatusPayload,
  PermissionRequest,
} from "@repo/shared";

export const agentAPI = {
  /**
   * エージェント実行開始
   */
  start: (payload: AgentStartPayload): Promise<{ executionId: string }> => {
    return ipcRenderer.invoke("agent:start", payload);
  },

  /**
   * エージェント実行停止
   */
  stop: (payload: AgentStopPayload): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke("agent:stop", payload);
  },

  /**
   * 権限確認応答
   */
  respondPermission: (response: PermissionResponse): void => {
    ipcRenderer.send("agent:permission:res", response);
  },

  /**
   * ストリーミングメッセージ購読
   */
  onStream: (callback: (payload: AgentStreamPayload) => void): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      payload: AgentStreamPayload,
    ) => {
      callback(payload);
    };
    ipcRenderer.on("agent:stream", handler);
    return () => ipcRenderer.removeListener("agent:stream", handler);
  },

  /**
   * 状態変更通知購読
   */
  onStatus: (callback: (payload: AgentStatusPayload) => void): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      payload: AgentStatusPayload,
    ) => {
      callback(payload);
    };
    ipcRenderer.on("agent:status", handler);
    return () => ipcRenderer.removeListener("agent:status", handler);
  },

  /**
   * 権限確認リクエスト購読
   */
  onPermission: (
    callback: (request: PermissionRequest) => void,
  ): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      request: PermissionRequest,
    ) => {
      callback(request);
    };
    ipcRenderer.on("agent:permission", handler);
    return () => ipcRenderer.removeListener("agent:permission", handler);
  },
};

// contextBridgeで公開
contextBridge.exposeInMainWorld("agentAPI", agentAPI);
```

---

## シーケンス図

### 正常フロー（メッセージ送信→応答完了）

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│    Renderer    │     │  Main Process  │     │  Claude Agent  │
│    (React UI)  │     │   (Electron)   │     │      SDK       │
└───────┬────────┘     └───────┬────────┘     └───────┬────────┘
        │                      │                      │
        │  agent:start         │                      │
        │ ────────────────────►│                      │
        │  { skillId, prompt } │                      │
        │                      │                      │
        │  { executionId }     │                      │
        │ ◄────────────────────│                      │
        │                      │                      │
        │  agent:status        │                      │
        │ ◄────────────────────│                      │
        │  { status: "exec" }  │                      │
        │                      │                      │
        │                      │   query(prompt)      │
        │                      │ ────────────────────►│
        │                      │                      │
        │                      │                      │
        │  agent:stream        │   stream: text       │
        │ ◄────────────────────│ ◄────────────────────│
        │  { type: "text" }    │                      │
        │                      │                      │
        │  agent:stream        │   stream: text       │
        │ ◄────────────────────│ ◄────────────────────│
        │  { type: "text" }    │                      │
        │                      │                      │
        │  agent:stream        │   complete           │
        │ ◄────────────────────│ ◄────────────────────│
        │  { type: "complete" }│                      │
        │                      │                      │
        │  agent:status        │                      │
        │ ◄────────────────────│                      │
        │  { status: "done" }  │                      │
        │                      │                      │
```

### 権限確認フロー

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│    Renderer    │     │  Main Process  │     │  Claude Agent  │
│    (React UI)  │     │   (Electron)   │     │      SDK       │
└───────┬────────┘     └───────┬────────┘     └───────┬────────┘
        │                      │                      │
        │  (実行中...)         │                      │
        │                      │                      │
        │                      │   PermissionRequest  │
        │                      │ ◄────────────────────│
        │                      │   { tool: "Bash" }   │
        │                      │                      │
        │  agent:status        │                      │
        │ ◄────────────────────│                      │
        │  { "await_perm" }    │                      │
        │                      │                      │
        │  agent:permission    │                      │
        │ ◄────────────────────│                      │
        │  { tool, args }      │                      │
        │                      │                      │
        │      [ダイアログ表示]│                      │
        │      [ユーザー選択]  │                      │
        │                      │                      │
        │  agent:permission:res│                      │
        │ ────────────────────►│                      │
        │  { approved: true }  │                      │
        │                      │   proceed: true      │
        │                      │ ────────────────────►│
        │                      │                      │
        │  agent:status        │                      │
        │ ◄────────────────────│                      │
        │  { "streaming" }     │                      │
        │                      │                      │
        │  (ストリーミング継続)│                      │
        │                      │                      │
```

### キャンセルフロー

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│    Renderer    │     │  Main Process  │     │  Claude Agent  │
│    (React UI)  │     │   (Electron)   │     │      SDK       │
└───────┬────────┘     └───────┬────────┘     └───────┬────────┘
        │                      │                      │
        │  (実行中...)         │                      │
        │                      │                      │
        │  agent:stop          │                      │
        │ ────────────────────►│                      │
        │  { executionId }     │                      │
        │                      │   abort()            │
        │                      │ ────────────────────►│
        │                      │                      │
        │  { success: true }   │                      │
        │ ◄────────────────────│                      │
        │                      │                      │
        │  agent:status        │                      │
        │ ◄────────────────────│                      │
        │  { "cancelled" }     │                      │
        │                      │                      │
```

### エラーフロー

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│    Renderer    │     │  Main Process  │     │  Claude Agent  │
│    (React UI)  │     │   (Electron)   │     │      SDK       │
└───────┬────────┘     └───────┬────────┘     └───────┬────────┘
        │                      │                      │
        │  (実行中...)         │                      │
        │                      │                      │
        │                      │   error              │
        │                      │ ◄────────────────────│
        │                      │   { message }        │
        │                      │                      │
        │  agent:stream        │                      │
        │ ◄────────────────────│                      │
        │  { type: "error" }   │                      │
        │                      │                      │
        │  agent:status        │                      │
        │ ◄────────────────────│                      │
        │  { "error", msg }    │                      │
        │                      │                      │
```

---

## 統合ポイント/契約

### Renderer → Main 契約

| チャンネル             | 入力型               | 出力型            | エラー処理 |
| ---------------------- | -------------------- | ----------------- | ---------- |
| `agent:start`          | `AgentStartPayload`  | `{ executionId }` | throw      |
| `agent:stop`           | `AgentStopPayload`   | `{ success }`     | throw      |
| `agent:permission:res` | `PermissionResponse` | -                 | 無視       |

### Main → Renderer 契約

| チャンネル         | ペイロード型         | 配信タイミング                |
| ------------------ | -------------------- | ----------------------------- |
| `agent:stream`     | `AgentStreamPayload` | SDK出力受信時（リアルタイム） |
| `agent:status`     | `AgentStatusPayload` | 状態遷移時                    |
| `agent:permission` | `PermissionRequest`  | askルール該当ツール呼び出し時 |

---

## エラーハンドリング

### IPC通信エラー

| エラー種別     | 処理方法                  |
| -------------- | ------------------------- |
| バリデーション | Zodエラーをthrow          |
| タイムアウト   | agent:status(error)を送信 |
| SDK接続エラー  | agent:stream(error)を送信 |
| 予期せぬエラー | agent:status(error)を送信 |

### エラーメッセージ形式

```typescript
interface AgentError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

---

## 変更履歴

| Version | Date       | Author | Changes  |
| ------- | ---------- | ------ | -------- |
| 1.0.0   | 2026-01-12 | Claude | 初版作成 |
