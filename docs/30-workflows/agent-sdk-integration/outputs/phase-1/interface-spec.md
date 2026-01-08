# Agent SDK統合 インターフェース仕様

> Phase 1 成果物
> 作成日: 2026-01-08
> スキル: functional-non-functional-requirements

---

## 1. 概要

本ドキュメントは、Claude Agent SDK統合におけるIPC通信インターフェースを定義する。

### 1.1 アーキテクチャ図

```
┌─────────────────────────────────────────────────────────┐
│                   Renderer Process                       │
│                                                         │
│  ┌─────────────┐      ┌─────────────────────────────┐  │
│  │ React App   │ ───► │ useAgent Hook               │  │
│  │             │      │  - query()                  │  │
│  └─────────────┘      │  - abort()                  │  │
│                       │  - messages                 │  │
│                       └──────────┬──────────────────┘  │
│                                  │                      │
│                       ┌──────────▼──────────────────┐  │
│                       │ window.agentAPI             │  │
│                       │ (contextBridge)             │  │
│                       └──────────┬──────────────────┘  │
└──────────────────────────────────┼──────────────────────┘
                                   │ IPC
┌──────────────────────────────────┼──────────────────────┐
│                   Preload Script │                       │
│                                  │                       │
│  ┌───────────────────────────────┼──────────────────┐   │
│  │ contextBridge.exposeInMainWorld('agentAPI', {...})│   │
│  │   - ipcRenderer.invoke('agent:*')                 │   │
│  │   - ipcRenderer.on('agent:message')               │   │
│  └───────────────────────────────┼──────────────────┘   │
└──────────────────────────────────┼──────────────────────┘
                                   │ IPC
┌──────────────────────────────────┼──────────────────────┐
│                   Main Process   │                       │
│                                  │                       │
│  ┌───────────────────────────────▼──────────────────┐   │
│  │ agentHandler.ts                                   │   │
│  │   - ipcMain.handle('agent:*')                     │   │
│  │   - webContents.send('agent:message')             │   │
│  └───────────────────────────────┬──────────────────┘   │
│                                  │                       │
│  ┌───────────────────────────────▼──────────────────┐   │
│  │ AgentClient (@repo/shared)                        │   │
│  │   - query()                                       │   │
│  │   - sessionManager                                │   │
│  └───────────────────────────────┬──────────────────┘   │
│                                  │                       │
│  ┌───────────────────────────────▼──────────────────┐   │
│  │ Claude Agent SDK                                  │   │
│  │   @anthropic-ai/claude-agent-sdk                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. IPCチャネル定義

### 2.1 チャネル一覧

| チャネル名             | 方向            | 説明                         |
| ---------------------- | --------------- | ---------------------------- |
| `agent:query`          | Renderer → Main | クエリ実行リクエスト         |
| `agent:abort`          | Renderer → Main | 処理中断リクエスト           |
| `agent:getStatus`      | Renderer → Main | ステータス取得               |
| `agent:createSession`  | Renderer → Main | セッション作成               |
| `agent:resumeSession`  | Renderer → Main | セッション再開               |
| `agent:destroySession` | Renderer → Main | セッション破棄               |
| `agent:message`        | Main → Renderer | ストリーミングメッセージ配信 |

### 2.2 チャネル定数

```typescript
// packages/shared/src/ipc/agent-channels.ts

export const AGENT_IPC_CHANNELS = {
  /** クエリ実行 */
  QUERY: "agent:query",
  /** 処理中断 */
  ABORT: "agent:abort",
  /** ステータス取得 */
  GET_STATUS: "agent:getStatus",
  /** セッション作成 */
  CREATE_SESSION: "agent:createSession",
  /** セッション再開 */
  RESUME_SESSION: "agent:resumeSession",
  /** セッション破棄 */
  DESTROY_SESSION: "agent:destroySession",
  /** メッセージ配信（Main → Renderer） */
  MESSAGE: "agent:message",
} as const;

export type AgentIpcChannel =
  (typeof AGENT_IPC_CHANNELS)[keyof typeof AGENT_IPC_CHANNELS];
```

---

## 3. 型定義

### 3.1 リクエスト/レスポンス型

```typescript
// packages/shared/src/agent/types.ts

/** クエリオプション */
export interface QueryOptions {
  /** タイムアウト（ミリ秒） */
  timeout?: number;
  /** セッションID */
  sessionId?: string;
  /** システムプロンプト */
  systemPrompt?: string;
}

/** クエリリクエスト */
export interface AgentQueryRequest {
  /** プロンプト文字列 */
  prompt: string;
  /** オプション */
  options?: QueryOptions;
}

/** エージェントステータス */
export type AgentStatusType =
  | "not_initialized"
  | "initializing"
  | "initialized"
  | "error";

/** ステータスレスポンス */
export interface AgentStatus {
  /** ステータス */
  status: AgentStatusType;
  /** エラーメッセージ（エラー時のみ） */
  error?: string;
  /** ステータス更新時刻 */
  timestamp: number;
}

/** セッション再開リクエスト */
export interface ResumeSessionRequest {
  /** セッションID */
  sessionId: string;
}

/** セッション破棄リクエスト */
export interface DestroySessionRequest {
  /** セッションID */
  sessionId: string;
}

/** セッション作成レスポンス */
export interface CreateSessionResponse {
  /** 生成されたセッションID */
  sessionId: string;
}
```

### 3.2 メッセージ型

```typescript
// packages/shared/src/agent/types.ts

/** メッセージタイプ */
export type SDKMessageType =
  | "text"
  | "tool_use"
  | "tool_result"
  | "error"
  | "complete";

/** SDKメッセージ */
export interface SDKMessage {
  /** メッセージID */
  id: string;
  /** メッセージタイプ */
  type: SDKMessageType;
  /** メッセージ内容 */
  content: string;
  /** タイムスタンプ */
  timestamp: number;
  /** 完了フラグ */
  isComplete: boolean;
  /** ツール使用情報（tool_use時のみ） */
  toolUse?: {
    toolName: string;
    input: Record<string, unknown>;
  };
  /** ツール結果（tool_result時のみ） */
  toolResult?: {
    toolUseId: string;
    output: string;
    isError: boolean;
  };
}
```

### 3.3 エラー型

```typescript
// packages/shared/src/agent/errors.ts

/** エラーコード */
export enum AgentErrorCode {
  INITIALIZATION_FAILED = "AGENT_INIT_FAILED",
  NOT_INITIALIZED = "AGENT_NOT_INITIALIZED",
  QUERY_FAILED = "AGENT_QUERY_FAILED",
  TIMEOUT = "AGENT_TIMEOUT",
  ABORTED = "AGENT_ABORTED",
  SESSION_NOT_FOUND = "AGENT_SESSION_NOT_FOUND",
  SESSION_ERROR = "AGENT_SESSION_ERROR",
  VALIDATION_ERROR = "AGENT_VALIDATION_ERROR",
}

/** 基底エラークラス */
export class AgentError extends Error {
  constructor(
    public readonly code: AgentErrorCode,
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "AgentError";
  }
}

/** 初期化エラー */
export class AgentInitializationError extends AgentError {
  constructor(message: string, cause?: Error) {
    super(AgentErrorCode.INITIALIZATION_FAILED, message, cause);
    this.name = "AgentInitializationError";
  }
}

/** クエリエラー */
export class AgentQueryError extends AgentError {
  constructor(message: string, cause?: Error) {
    super(AgentErrorCode.QUERY_FAILED, message, cause);
    this.name = "AgentQueryError";
  }
}

/** タイムアウトエラー */
export class AgentTimeoutError extends AgentError {
  constructor(message: string = "Query timed out") {
    super(AgentErrorCode.TIMEOUT, message);
    this.name = "AgentTimeoutError";
  }
}

/** キャンセルエラー */
export class AgentAbortedError extends AgentError {
  constructor(message: string = "Query was aborted") {
    super(AgentErrorCode.ABORTED, message);
    this.name = "AgentAbortedError";
  }
}

/** セッションエラー */
export class AgentSessionError extends AgentError {
  constructor(
    message: string,
    code: AgentErrorCode = AgentErrorCode.SESSION_ERROR,
  ) {
    super(code, message);
    this.name = "AgentSessionError";
  }
}
```

---

## 4. Preload API定義

### 4.1 公開API

```typescript
// apps/desktop/src/preload/agent-api.ts

export interface AgentAPI {
  /**
   * クエリを実行する
   * ストリーミングレスポンスは onMessage で受信する
   */
  query: (prompt: string, options?: QueryOptions) => Promise<void>;

  /**
   * 実行中のクエリを中断する
   */
  abort: () => void;

  /**
   * エージェントのステータスを取得する
   */
  getStatus: () => Promise<AgentStatus>;

  /**
   * 新しいセッションを作成する
   */
  createSession: () => Promise<string>;

  /**
   * 既存のセッションを再開する
   */
  resumeSession: (sessionId: string) => Promise<void>;

  /**
   * セッションを破棄する
   */
  destroySession: (sessionId: string) => Promise<void>;

  /**
   * メッセージ受信リスナーを登録する
   * @returns アンサブスクライブ関数
   */
  onMessage: (callback: (message: SDKMessage) => void) => () => void;
}
```

### 4.2 Preload実装パターン

```typescript
// apps/desktop/src/preload/agent-api.ts

import { contextBridge, ipcRenderer } from "electron";
import { AGENT_IPC_CHANNELS } from "@repo/shared/ipc/agent-channels";
import type {
  AgentAPI,
  QueryOptions,
  SDKMessage,
  AgentStatus,
} from "@repo/shared/agent/types";

const agentAPI: AgentAPI = {
  query: async (prompt: string, options?: QueryOptions): Promise<void> => {
    return ipcRenderer.invoke(AGENT_IPC_CHANNELS.QUERY, { prompt, options });
  },

  abort: (): void => {
    ipcRenderer.send(AGENT_IPC_CHANNELS.ABORT);
  },

  getStatus: async (): Promise<AgentStatus> => {
    return ipcRenderer.invoke(AGENT_IPC_CHANNELS.GET_STATUS);
  },

  createSession: async (): Promise<string> => {
    const response = await ipcRenderer.invoke(
      AGENT_IPC_CHANNELS.CREATE_SESSION,
    );
    return response.sessionId;
  },

  resumeSession: async (sessionId: string): Promise<void> => {
    return ipcRenderer.invoke(AGENT_IPC_CHANNELS.RESUME_SESSION, { sessionId });
  },

  destroySession: async (sessionId: string): Promise<void> => {
    return ipcRenderer.invoke(AGENT_IPC_CHANNELS.DESTROY_SESSION, {
      sessionId,
    });
  },

  onMessage: (callback: (message: SDKMessage) => void): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      message: SDKMessage,
    ) => {
      callback(message);
    };
    ipcRenderer.on(AGENT_IPC_CHANNELS.MESSAGE, handler);
    return () => {
      ipcRenderer.removeListener(AGENT_IPC_CHANNELS.MESSAGE, handler);
    };
  },
};

contextBridge.exposeInMainWorld("agentAPI", agentAPI);
```

---

## 5. Main Process Handler定義

### 5.1 ハンドラインターフェース

```typescript
// apps/desktop/src/main/agent/agent-handler.ts

import { ipcMain, BrowserWindow } from "electron";
import { AGENT_IPC_CHANNELS } from "@repo/shared/ipc/agent-channels";
import type {
  AgentQueryRequest,
  AgentStatus,
  ResumeSessionRequest,
  DestroySessionRequest,
} from "@repo/shared/agent/types";

export function registerAgentHandlers(mainWindow: BrowserWindow): void {
  // agent:query
  ipcMain.handle(
    AGENT_IPC_CHANNELS.QUERY,
    async (_event, request: AgentQueryRequest): Promise<void> => {
      // 実装はPhase 5で
    },
  );

  // agent:abort
  ipcMain.on(AGENT_IPC_CHANNELS.ABORT, () => {
    // 実装はPhase 5で
  });

  // agent:getStatus
  ipcMain.handle(
    AGENT_IPC_CHANNELS.GET_STATUS,
    async (): Promise<AgentStatus> => {
      // 実装はPhase 5で
    },
  );

  // agent:createSession
  ipcMain.handle(
    AGENT_IPC_CHANNELS.CREATE_SESSION,
    async (): Promise<{ sessionId: string }> => {
      // 実装はPhase 5で
    },
  );

  // agent:resumeSession
  ipcMain.handle(
    AGENT_IPC_CHANNELS.RESUME_SESSION,
    async (_event, request: ResumeSessionRequest): Promise<void> => {
      // 実装はPhase 5で
    },
  );

  // agent:destroySession
  ipcMain.handle(
    AGENT_IPC_CHANNELS.DESTROY_SESSION,
    async (_event, request: DestroySessionRequest): Promise<void> => {
      // 実装はPhase 5で
    },
  );
}
```

---

## 6. React Hook定義

### 6.1 useAgent Hook

```typescript
// apps/desktop/src/renderer/hooks/useAgent.ts

export interface UseAgentOptions {
  /** 自動セッション管理 */
  autoSession?: boolean;
  /** デフォルトタイムアウト（ミリ秒） */
  defaultTimeout?: number;
}

export interface UseAgentReturn {
  /** エージェントステータス */
  status: AgentStatus | null;
  /** 受信メッセージ履歴 */
  messages: SDKMessage[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー状態 */
  error: AgentError | null;
  /** 現在のセッションID */
  sessionId: string | null;
  /** クエリ実行 */
  query: (prompt: string, options?: QueryOptions) => Promise<void>;
  /** 処理中断 */
  abort: () => void;
  /** メッセージクリア */
  clearMessages: () => void;
  /** セッションリセット */
  resetSession: () => Promise<void>;
}

export function useAgent(options?: UseAgentOptions): UseAgentReturn {
  // 実装はPhase 5で
}
```

---

## 7. バリデーションルール

### 7.1 リクエストバリデーション

| フィールド           | 型     | 必須 | バリデーション            |
| -------------------- | ------ | ---- | ------------------------- |
| prompt               | string | Yes  | 非空文字列、最大10000文字 |
| options.timeout      | number | No   | 1000 <= value <= 300000   |
| options.sessionId    | string | No   | UUID v4形式               |
| options.systemPrompt | string | No   | 最大5000文字              |

### 7.2 バリデーション実装

```typescript
// packages/shared/src/agent/validation.ts

import { z } from "zod";

export const queryOptionsSchema = z.object({
  timeout: z.number().min(1000).max(300000).optional(),
  sessionId: z.string().uuid().optional(),
  systemPrompt: z.string().max(5000).optional(),
});

export const queryRequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  options: queryOptionsSchema.optional(),
});

export const resumeSessionRequestSchema = z.object({
  sessionId: z.string().uuid(),
});

export const destroySessionRequestSchema = z.object({
  sessionId: z.string().uuid(),
});
```

---

## 8. シーケンス図

### 8.1 クエリ実行フロー

```
Renderer          Preload            Main              AgentClient        SDK
   │                 │                 │                    │               │
   │ query(prompt)   │                 │                    │               │
   │────────────────►│                 │                    │               │
   │                 │ invoke(agent:query)                  │               │
   │                 │────────────────►│                    │               │
   │                 │                 │ validate request   │               │
   │                 │                 │──────────────────►─│               │
   │                 │                 │                    │ query()       │
   │                 │                 │                    │──────────────►│
   │                 │                 │                    │               │
   │                 │                 │                    │◄──stream msg──│
   │                 │                 │◄───SDKMessage──────│               │
   │                 │◄──agent:message─│                    │               │
   │◄──onMessage()───│                 │                    │               │
   │                 │                 │                    │               │
   │                 │                 │                    │◄──complete────│
   │                 │                 │◄───isComplete:true─│               │
   │                 │◄──agent:message─│                    │               │
   │◄──onMessage()───│                 │                    │               │
   │                 │                 │                    │               │
```

### 8.2 キャンセルフロー

```
Renderer          Preload            Main              AgentClient
   │                 │                 │                    │
   │ abort()         │                 │                    │
   │────────────────►│                 │                    │
   │                 │ send(agent:abort)                    │
   │                 │────────────────►│                    │
   │                 │                 │ abortController.abort()
   │                 │                 │──────────────────►─│
   │                 │                 │                    │
   │                 │                 │◄──AbortedError─────│
   │                 │◄──agent:message(error)               │
   │◄──onMessage()───│                 │                    │
   │                 │                 │                    │
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-08 | 初版作成 |
