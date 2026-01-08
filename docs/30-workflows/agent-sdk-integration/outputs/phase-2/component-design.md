# Agent SDK統合 コンポーネント設計書

> Phase 2 成果物
> 作成日: 2026-01-08
> スキル: architectural-patterns, clean-architecture-principles

---

## 1. 概要

### 1.1 設計原則

本設計は以下の原則に従う：

| 原則                       | 適用方法                             |
| -------------------------- | ------------------------------------ |
| 依存性逆転の原則 (DIP)     | shared packageはElectronに依存しない |
| 単一責任の原則 (SRP)       | 各モジュールは1つの責務のみを持つ    |
| インターフェース分離 (ISP) | クライアントに必要なメソッドのみ公開 |
| 関心の分離                 | UI / IPC / ビジネスロジックを分離    |

### 1.2 アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Application Layer                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  apps/desktop/src/renderer/                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐   │   │
│  │  │  React          │  │  hooks/useAgent.ts               │   │   │
│  │  │  Components     │──│  - state management              │   │   │
│  │  │                 │  │  - message handling              │   │   │
│  │  └─────────────────┘  └─────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │ IPC (contextBridge)
┌─────────────────────────────────────────────────────────────────────┐
│                     Infrastructure Layer                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  apps/desktop/src/preload/                                   │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │  agent-api.ts                                        │    │   │
│  │  │  - contextBridge API定義                             │    │   │
│  │  │  - IPC通信抽象化                                     │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │ IPC (ipcMain/ipcRenderer)
┌─────────────────────────────────────────────────────────────────────┐
│                     Domain Layer (Main Process)                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  apps/desktop/src/main/agent/                                │   │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐   │   │
│  │  │  agent-handler  │  │  agent-initializer.ts           │   │   │
│  │  │  .ts            │  │  - SDK初期化                     │   │   │
│  │  │  - IPCハンドラ  │  │  - 状態管理                      │   │   │
│  │  └─────────────────┘  └─────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
┌─────────────────────────────────────────────────────────────────────┐
│                     Shared Layer (Framework Agnostic)               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  packages/shared/src/agent/                                  │   │
│  │  ┌───────────────┐ ┌───────────────┐ ┌─────────────────┐    │   │
│  │  │ agent-client  │ │ session-mgr   │ │ types/errors    │    │   │
│  │  │ .ts           │ │ .ts           │ │ validation.ts   │    │   │
│  │  │ - SDK統合     │ │ - セッション  │ │ - 共通型        │    │   │
│  │  │ - query()     │ │   管理        │ │ - エラー定義    │    │   │
│  │  └───────────────┘ └───────────────┘ └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
┌─────────────────────────────────────────────────────────────────────┐
│                     External Layer                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  @anthropic-ai/claude-agent-sdk                              │   │
│  │  - query() API                                               │   │
│  │  - Hooks System                                              │   │
│  │  - Permission Control                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. モジュール構成

### 2.1 ファイル構造

```
packages/shared/src/agent/
├── index.ts                 # パブリックAPI
├── agent-client.ts          # SDK統合クライアント
├── session-manager.ts       # セッション管理
├── types.ts                 # 型定義
├── errors.ts                # エラー定義
└── validation.ts            # バリデーション

packages/shared/src/ipc/
├── index.ts                 # パブリックAPI
└── agent-channels.ts        # IPCチャネル定数

apps/desktop/src/main/agent/
├── index.ts                 # パブリックAPI
├── agent-handler.ts         # IPCハンドラ
└── agent-initializer.ts     # 初期化処理

apps/desktop/src/preload/
├── index.ts                 # 既存のpreloadエントリ
└── agent-api.ts             # Agent API定義

apps/desktop/src/renderer/hooks/
└── useAgent.ts              # React Hook
```

---

## 3. コンポーネント詳細

### 3.1 AgentClient

**パス**: `packages/shared/src/agent/agent-client.ts`

**責務**: Claude Agent SDKとの通信を抽象化し、クエリ実行とストリーミング処理を提供する

```typescript
/**
 * Claude Agent SDK統合クライアント
 *
 * 責務:
 * - SDK初期化状態の管理
 * - query() APIの実行
 * - ストリーミングメッセージの処理
 * - エラーハンドリング
 * - AbortSignalによるキャンセル処理
 */
export class AgentClient {
  private status: AgentStatusType = "not_initialized";
  private currentQuery: Query | null = null;
  private abortController: AbortController | null = null;

  // 依存性注入用
  constructor(private readonly config: AgentClientConfig) {}

  // 初期化
  async initialize(): Promise<void>;

  // クエリ実行
  async query(
    prompt: string,
    options?: QueryOptions,
    onMessage?: (message: SDKMessage) => void,
  ): Promise<void>;

  // キャンセル
  abort(): void;

  // ステータス取得
  getStatus(): AgentStatus;

  // クリーンアップ
  dispose(): void;
}
```

**依存関係**:

- `@anthropic-ai/claude-agent-sdk` - 外部SDK
- `./session-manager.ts` - セッション管理
- `./types.ts` - 型定義
- `./errors.ts` - エラークラス

---

### 3.2 SessionManager

**パス**: `packages/shared/src/agent/session-manager.ts`

**責務**: 会話セッションのライフサイクル管理を行う

```typescript
/**
 * セッション管理
 *
 * 責務:
 * - セッションIDの生成
 * - セッション状態の保持（メモリ内）
 * - セッション再開機能
 * - セッション破棄とクリーンアップ
 */
export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  // セッション作成
  createSession(): string;

  // セッション取得
  getSession(sessionId: string): Session | null;

  // セッション再開
  resumeSession(sessionId: string): Session;

  // セッション破棄
  destroySession(sessionId: string): void;

  // 全セッションクリア
  clearAll(): void;
}

interface Session {
  id: string;
  createdAt: number;
  lastAccessedAt: number;
  context: SessionContext;
}
```

**依存関係**:

- `./types.ts` - 型定義
- `./errors.ts` - エラークラス（AgentSessionError）

---

### 3.3 AgentHandler

**パス**: `apps/desktop/src/main/agent/agent-handler.ts`

**責務**: Electron Main ProcessでIPCハンドラを提供し、Renderer Processとの通信を管理する

```typescript
/**
 * Agent IPCハンドラ
 *
 * 責務:
 * - IPCチャネルの登録
 * - リクエストバリデーション
 * - AgentClientへの委譲
 * - Renderer Processへのメッセージ転送
 */
export function registerAgentHandlers(mainWindow: BrowserWindow): void;

export function unregisterAgentHandlers(): void;
```

**依存関係**:

- `electron` - ipcMain, BrowserWindow
- `@repo/shared/agent` - AgentClient, SessionManager
- `@repo/shared/ipc` - AGENT_IPC_CHANNELS
- `@repo/shared/agent/validation` - バリデーションスキーマ

---

### 3.4 AgentInitializer

**パス**: `apps/desktop/src/main/agent/agent-initializer.ts`

**責務**: アプリケーション起動時のAgent SDK初期化を管理する

```typescript
/**
 * Agent SDK初期化
 *
 * 責務:
 * - 環境変数からAPIキーを取得
 * - SDKの初期化
 * - 初期化状態の管理
 * - エラーハンドリング
 */
export async function initializeAgent(): Promise<AgentClient>;

export function getAgentClient(): AgentClient | null;

export function disposeAgent(): void;
```

**依存関係**:

- `@repo/shared/agent` - AgentClient
- 環境変数: `ANTHROPIC_API_KEY`

---

### 3.5 AgentAPI (Preload)

**パス**: `apps/desktop/src/preload/agent-api.ts`

**責務**: contextBridgeを通じてRenderer ProcessにAgent APIを公開する

```typescript
/**
 * Preload Agent API
 *
 * 責務:
 * - 安全なAPI公開
 * - IPC通信の抽象化
 * - 型安全なインターフェース提供
 */
const agentAPI: AgentAPI = {
  query: (prompt, options) => ipcRenderer.invoke(...),
  abort: () => ipcRenderer.send(...),
  getStatus: () => ipcRenderer.invoke(...),
  createSession: () => ipcRenderer.invoke(...),
  resumeSession: (sessionId) => ipcRenderer.invoke(...),
  destroySession: (sessionId) => ipcRenderer.invoke(...),
  onMessage: (callback) => { ... },
};

contextBridge.exposeInMainWorld('agentAPI', agentAPI);
```

**依存関係**:

- `electron` - contextBridge, ipcRenderer
- `@repo/shared/ipc` - AGENT_IPC_CHANNELS
- `@repo/shared/agent/types` - 型定義

---

### 3.6 useAgent Hook

**パス**: `apps/desktop/src/renderer/hooks/useAgent.ts`

**責務**: Renderer ProcessでAgent機能を利用するReact Hookを提供する

```typescript
/**
 * useAgent React Hook
 *
 * 責務:
 * - Agent APIへのアクセス
 * - 状態管理（messages, status, error）
 * - メッセージ受信リスナーの管理
 * - ライフサイクル管理
 */
export function useAgent(options?: UseAgentOptions): UseAgentReturn;

interface UseAgentReturn {
  status: AgentStatus | null;
  messages: SDKMessage[];
  isLoading: boolean;
  error: AgentError | null;
  sessionId: string | null;
  query: (prompt: string, options?: QueryOptions) => Promise<void>;
  abort: () => void;
  clearMessages: () => void;
  resetSession: () => Promise<void>;
}
```

**依存関係**:

- `react` - useState, useEffect, useCallback, useRef
- `window.agentAPI` - Preload APIへのアクセス
- `@repo/shared/agent/types` - 型定義

---

## 4. 依存関係図

```
                    ┌─────────────────────────────────┐
                    │      External Dependencies      │
                    │  @anthropic-ai/claude-agent-sdk │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │        packages/shared          │
                    │  ┌─────────────────────────┐    │
                    │  │  agent/                 │    │
                    │  │  ├── agent-client.ts    │    │
                    │  │  ├── session-manager.ts │    │
                    │  │  ├── types.ts           │    │
                    │  │  ├── errors.ts          │    │
                    │  │  └── validation.ts      │    │
                    │  └─────────────────────────┘    │
                    │  ┌─────────────────────────┐    │
                    │  │  ipc/                   │    │
                    │  │  └── agent-channels.ts  │    │
                    │  └─────────────────────────┘    │
                    └──────────────┬──────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
┌──────────▼──────────┐ ┌─────────▼─────────┐ ┌──────────▼──────────┐
│  apps/desktop/src/  │ │ apps/desktop/src/ │ │  apps/desktop/src/  │
│  main/agent/        │ │ preload/          │ │  renderer/hooks/    │
│  ├── handler.ts     │ │ └── agent-api.ts  │ │  └── useAgent.ts    │
│  └── initializer.ts │ └───────────────────┘ └─────────────────────┘
└─────────────────────┘
         │
         │ electron (ipcMain)
         ▼
┌─────────────────────┐
│ apps/desktop/src/   │
│ preload/            │
│ └── agent-api.ts    │
└─────────────────────┘
         │
         │ contextBridge
         ▼
┌─────────────────────┐
│ apps/desktop/src/   │
│ renderer/hooks/     │
│ └── useAgent.ts     │
└─────────────────────┘
```

---

## 5. セキュリティ設計

### 5.1 API Key保護

| レイヤー     | 対策                               |
| ------------ | ---------------------------------- |
| Main Process | 環境変数から取得、メモリ内のみ保持 |
| Preload      | API Keyへのアクセス不可            |
| Renderer     | window.agentAPIにAPI Keyなし       |

### 5.2 IPC通信の安全性

```typescript
// BrowserWindow設定
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    webSecurity: true,
  },
});
```

### 5.3 入力バリデーション

すべてのIPCハンドラで入力バリデーションを実施：

```typescript
// agent-handler.ts
ipcMain.handle(AGENT_IPC_CHANNELS.QUERY, async (_event, request) => {
  // Zodスキーマによるバリデーション
  const result = queryRequestSchema.safeParse(request);
  if (!result.success) {
    throw new AgentError(
      AgentErrorCode.VALIDATION_ERROR,
      "Invalid request: " + result.error.message,
    );
  }
  // ...
});
```

---

## 6. エラー処理方針

### 6.1 エラー境界

| 境界                  | 処理方法                      |
| --------------------- | ----------------------------- |
| SDK → AgentClient     | エラーをAgentErrorにラップ    |
| AgentClient → Handler | エラーを構造化してログ記録    |
| Handler → Preload     | IPCエラーとして転送           |
| Preload → Hook        | useAgent内でerror stateに設定 |

### 6.2 リトライ戦略

```typescript
// 指数バックオフによるリトライ
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 4000,
  backoffFactor: 2,
};
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-08 | 初版作成 |
