# Agent SDK統合 API設計書

> Phase 2 成果物
> 作成日: 2026-01-08
> スキル: api-contract-design, electron-ipc-patterns

---

## 1. 概要

本ドキュメントは、Claude Agent SDK統合におけるAPI設計を定義する。

### 1.1 API層構成

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: Renderer API (useAgent Hook)                          │
│  - React Hookインターフェース                                   │
│  - 状態管理とライフサイクル                                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │ window.agentAPI
┌────────────────────────────────▼────────────────────────────────┐
│  Layer 2: Preload API (contextBridge)                           │
│  - 型安全なAPI公開                                              │
│  - IPC通信の抽象化                                              │
└────────────────────────────────┬────────────────────────────────┘
                                 │ IPC (invoke/send/on)
┌────────────────────────────────▼────────────────────────────────┐
│  Layer 3: IPC Handler (Main Process)                            │
│  - リクエストバリデーション                                     │
│  - ビジネスロジック委譲                                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│  Layer 4: AgentClient (Shared)                                  │
│  - SDK統合                                                      │
│  - セッション管理                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. IPC API仕様

### 2.1 チャネル一覧

| チャネル名             | 通信パターン | 方向            | 説明           |
| ---------------------- | ------------ | --------------- | -------------- |
| `agent:query`          | invoke       | Renderer → Main | クエリ実行     |
| `agent:abort`          | send         | Renderer → Main | 処理中断       |
| `agent:getStatus`      | invoke       | Renderer → Main | ステータス取得 |
| `agent:createSession`  | invoke       | Renderer → Main | セッション作成 |
| `agent:resumeSession`  | invoke       | Renderer → Main | セッション再開 |
| `agent:destroySession` | invoke       | Renderer → Main | セッション破棄 |
| `agent:message`        | on           | Main → Renderer | メッセージ配信 |

### 2.2 通信パターン

```typescript
// invoke: リクエスト-レスポンス型
// Renderer側
const result = await ipcRenderer.invoke("channel", request);

// Main側
ipcMain.handle("channel", async (event, request) => {
  return response;
});

// send: 一方向通知
// Renderer側
ipcRenderer.send("channel", data);

// Main側
ipcMain.on("channel", (event, data) => {
  // 処理
});

// on: イベント購読
// Main → Renderer
mainWindow.webContents.send("channel", data);

// Renderer側
ipcRenderer.on("channel", (event, data) => {
  // 処理
});
```

---

## 3. API詳細仕様

### 3.1 agent:query

クエリを実行し、ストリーミングレスポンスを開始する。

**リクエスト**:

```typescript
interface AgentQueryRequest {
  prompt: string;
  options?: {
    timeout?: number;
    sessionId?: string;
    systemPrompt?: string;
  };
}
```

**レスポンス**: `void`（成功時は何も返さない）

**エラーレスポンス**:

```typescript
interface AgentErrorResponse {
  code: AgentErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
```

**バリデーションルール**:

| フィールド           | ルール              |
| -------------------- | ------------------- |
| prompt               | 必須、1-10000文字   |
| options.timeout      | 任意、1000-300000ms |
| options.sessionId    | 任意、UUID v4形式   |
| options.systemPrompt | 任意、最大5000文字  |

**使用例**:

```typescript
// Renderer Process
try {
  await window.agentAPI.query("Hello, Claude!", {
    timeout: 30000,
    sessionId: "abc-123",
  });
} catch (error) {
  if (error.code === "AGENT_TIMEOUT") {
    // タイムアウト処理
  }
}
```

---

### 3.2 agent:abort

実行中のクエリを中断する。

**リクエスト**: なし

**レスポンス**: なし（一方向通知）

**使用例**:

```typescript
// Renderer Process
window.agentAPI.abort();
```

**注意事項**:

- 中断後、`agent:message` で `type: "error"` かつ `isComplete: true` のメッセージが配信される
- 中断は非同期で処理されるため、中断リクエスト後も数件のメッセージが配信される可能性がある

---

### 3.3 agent:getStatus

Agent SDKの現在のステータスを取得する。

**リクエスト**: なし

**レスポンス**:

```typescript
interface AgentStatus {
  status: "not_initialized" | "initializing" | "initialized" | "error";
  error?: string;
  timestamp: number;
}
```

**使用例**:

```typescript
// Renderer Process
const status = await window.agentAPI.getStatus();
if (status.status === "initialized") {
  // 使用可能
}
```

---

### 3.4 agent:createSession

新しいセッションを作成する。

**リクエスト**: なし

**レスポンス**:

```typescript
interface CreateSessionResponse {
  sessionId: string;
}
```

**使用例**:

```typescript
// Renderer Process
const sessionId = await window.agentAPI.createSession();
console.log("Session created:", sessionId);
```

---

### 3.5 agent:resumeSession

既存のセッションを再開する。

**リクエスト**:

```typescript
interface ResumeSessionRequest {
  sessionId: string;
}
```

**レスポンス**: `void`

**エラー**:

- `AGENT_SESSION_NOT_FOUND`: 指定されたセッションが存在しない

**使用例**:

```typescript
// Renderer Process
try {
  await window.agentAPI.resumeSession("abc-123");
} catch (error) {
  if (error.code === "AGENT_SESSION_NOT_FOUND") {
    // セッション再作成
  }
}
```

---

### 3.6 agent:destroySession

セッションを破棄する。

**リクエスト**:

```typescript
interface DestroySessionRequest {
  sessionId: string;
}
```

**レスポンス**: `void`

**使用例**:

```typescript
// Renderer Process
await window.agentAPI.destroySession("abc-123");
```

---

### 3.7 agent:message

Main ProcessからRenderer Processへメッセージを配信する。

**メッセージ形式**:

```typescript
interface SDKMessage {
  id: string;
  type: "text" | "tool_use" | "tool_result" | "error" | "complete";
  content: string;
  timestamp: number;
  isComplete: boolean;
  toolUse?: {
    toolName: string;
    input: Record<string, unknown>;
  };
  toolResult?: {
    toolUseId: string;
    output: string;
    isError: boolean;
  };
}
```

**メッセージタイプ**:

| タイプ      | 説明               | isComplete |
| ----------- | ------------------ | ---------- |
| text        | テキストメッセージ | false      |
| tool_use    | ツール使用開始     | false      |
| tool_result | ツール実行結果     | false      |
| error       | エラー発生         | true/false |
| complete    | クエリ完了         | true       |

**購読例**:

```typescript
// Renderer Process
const unsubscribe = window.agentAPI.onMessage((message) => {
  switch (message.type) {
    case "text":
      console.log("Text:", message.content);
      break;
    case "tool_use":
      console.log("Tool:", message.toolUse?.toolName);
      break;
    case "complete":
      console.log("Done");
      break;
  }
});

// クリーンアップ
unsubscribe();
```

---

## 4. Preload API定義

### 4.1 AgentAPI インターフェース

```typescript
// apps/desktop/src/preload/agent-api.ts

export interface AgentAPI {
  /**
   * クエリを実行する
   * @param prompt プロンプト文字列
   * @param options クエリオプション
   * @returns void（ストリーミングレスポンスはonMessageで受信）
   * @throws AgentError バリデーションエラー、タイムアウト等
   */
  query(prompt: string, options?: QueryOptions): Promise<void>;

  /**
   * 実行中のクエリを中断する
   */
  abort(): void;

  /**
   * エージェントのステータスを取得する
   * @returns 現在のステータス
   */
  getStatus(): Promise<AgentStatus>;

  /**
   * 新しいセッションを作成する
   * @returns 生成されたセッションID
   */
  createSession(): Promise<string>;

  /**
   * 既存のセッションを再開する
   * @param sessionId セッションID
   * @throws AgentSessionError セッションが見つからない場合
   */
  resumeSession(sessionId: string): Promise<void>;

  /**
   * セッションを破棄する
   * @param sessionId セッションID
   */
  destroySession(sessionId: string): Promise<void>;

  /**
   * メッセージ受信リスナーを登録する
   * @param callback メッセージ受信時のコールバック
   * @returns アンサブスクライブ関数
   */
  onMessage(callback: (message: SDKMessage) => void): () => void;
}
```

### 4.2 グローバル型定義

```typescript
// apps/desktop/src/renderer/types/electron.d.ts

declare global {
  interface Window {
    agentAPI: import("@repo/shared/agent/types").AgentAPI;
  }
}

export {};
```

---

## 5. React Hook API

### 5.1 useAgent

```typescript
// apps/desktop/src/renderer/hooks/useAgent.ts

interface UseAgentOptions {
  /** 自動セッション管理を有効にする */
  autoSession?: boolean;
  /** デフォルトタイムアウト（ミリ秒） */
  defaultTimeout?: number;
}

interface UseAgentReturn {
  /** エージェントステータス */
  status: AgentStatus | null;
  /** 受信メッセージ履歴 */
  messages: SDKMessage[];
  /** クエリ実行中フラグ */
  isLoading: boolean;
  /** エラー状態 */
  error: AgentError | null;
  /** 現在のセッションID */
  sessionId: string | null;
  /**
   * クエリを実行する
   * @param prompt プロンプト
   * @param options オプション
   */
  query: (prompt: string, options?: QueryOptions) => Promise<void>;
  /** 実行中のクエリを中断する */
  abort: () => void;
  /** メッセージ履歴をクリアする */
  clearMessages: () => void;
  /** セッションをリセットする */
  resetSession: () => Promise<void>;
}

function useAgent(options?: UseAgentOptions): UseAgentReturn;
```

### 5.2 使用例

```typescript
// コンポーネントでの使用
function ChatComponent() {
  const {
    status,
    messages,
    isLoading,
    error,
    query,
    abort,
    clearMessages,
  } = useAgent({
    autoSession: true,
    defaultTimeout: 60000,
  });

  const handleSubmit = async (prompt: string) => {
    try {
      await query(prompt);
    } catch (err) {
      console.error("Query failed:", err);
    }
  };

  return (
    <div>
      {/* UI実装 */}
    </div>
  );
}
```

---

## 6. エラーコード一覧

### 6.1 エラーコード定義

| コード                  | 説明                 | HTTP相当 |
| ----------------------- | -------------------- | -------- |
| AGENT_INIT_FAILED       | SDK初期化失敗        | 500      |
| AGENT_NOT_INITIALIZED   | SDK未初期化          | 503      |
| AGENT_QUERY_FAILED      | クエリ実行失敗       | 500      |
| AGENT_TIMEOUT           | タイムアウト         | 504      |
| AGENT_ABORTED           | ユーザーキャンセル   | 499      |
| AGENT_SESSION_NOT_FOUND | セッション不存在     | 404      |
| AGENT_SESSION_ERROR     | セッション操作エラー | 400      |
| AGENT_VALIDATION_ERROR  | バリデーションエラー | 400      |

### 6.2 エラーレスポンス形式

```typescript
// IPC経由でシリアライズされるエラー形式
interface SerializedAgentError {
  name: string;
  code: AgentErrorCode;
  message: string;
  stack?: string;
}
```

---

## 7. レート制限

### 7.1 制限値

| 項目               | 制限値     |
| ------------------ | ---------- |
| 同時クエリ数       | 1          |
| クエリ間の最小間隔 | 100ms      |
| 最大プロンプト長   | 10,000文字 |
| 最大タイムアウト   | 300,000ms  |
| セッション最大数   | 10         |

### 7.2 制限超過時の動作

- 同時クエリ: 既存のクエリをキャンセルして新しいクエリを実行
- プロンプト長: バリデーションエラー
- タイムアウト: バリデーションエラー（最大値に切り詰め）
- セッション数: 最も古いセッションを自動破棄

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-08 | 初版作成 |
