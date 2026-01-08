# Claude Agent SDK 統合 APIリファレンス

## メタ情報

| 項目         | 内容                     |
| ------------ | ------------------------ |
| ドキュメント | APIリファレンス          |
| 対象機能     | Claude Agent SDK統合基盤 |
| 作成日       | 2026-01-08               |
| バージョン   | 1.0.0                    |

---

## 概要

本ドキュメントはClaude Agent SDK統合基盤のAPI仕様を定義します。

---

## 1. window.agentAPI（Preload API）

Renderer ProcessからMain Processにアクセスするための公開API。

### 1.1 query

クエリを実行してAIからの応答を取得します。

```typescript
window.agentAPI.query(prompt: string, options?: QueryOptions): Promise<void>
```

**パラメータ**:

| 名前      | 型             | 必須 | 説明           |
| --------- | -------------- | ---- | -------------- |
| `prompt`  | `string`       | ✅   | クエリ文字列   |
| `options` | `QueryOptions` | -    | オプション設定 |

**QueryOptions**:

| プロパティ     | 型       | 説明                       |
| -------------- | -------- | -------------------------- |
| `sessionId`    | `string` | セッションID（会話継続用） |
| `systemPrompt` | `string` | システムプロンプト         |
| `timeout`      | `number` | タイムアウト (ms)          |

**戻り値**: `Promise<void>` - 完了時にresolve

**例外**:

| エラー型                   | 発生条件                |
| -------------------------- | ----------------------- |
| `AgentInitializationError` | SDKが初期化されていない |
| `AgentValidationError`     | リクエストが不正        |
| `AgentQueryError`          | クエリ実行に失敗        |
| `AgentTimeoutError`        | タイムアウト発生        |
| `AgentAbortedError`        | ユーザーによる中断      |

**使用例**:

```typescript
// 基本的なクエリ
await window.agentAPI.query("今日の天気は？");

// オプション付きクエリ
await window.agentAPI.query("続きを教えて", {
  sessionId: "session-123",
  systemPrompt: "あなたは親切なアシスタントです",
  timeout: 60000,
});
```

---

### 1.2 abort

実行中のクエリを中断します。

```typescript
window.agentAPI.abort(): void
```

**戻り値**: `void`

**使用例**:

```typescript
// クエリ中断
window.agentAPI.abort();
```

---

### 1.3 getStatus

Agent SDKの現在のステータスを取得します。

```typescript
window.agentAPI.getStatus(): Promise<AgentStatus>
```

**戻り値**: `Promise<AgentStatus>`

**AgentStatus**:

| プロパティ  | 型                | 説明                     |
| ----------- | ----------------- | ------------------------ |
| `status`    | `AgentStatusType` | ステータス種別           |
| `error`     | `string?`         | エラーメッセージ（任意） |
| `timestamp` | `number`          | 更新タイムスタンプ       |

**AgentStatusType**:

| 値                | 説明       |
| ----------------- | ---------- |
| `not_initialized` | 未初期化   |
| `initializing`    | 初期化中   |
| `initialized`     | 初期化完了 |
| `error`           | エラー状態 |

**使用例**:

```typescript
const status = await window.agentAPI.getStatus();
console.log(status.status); // "initialized"
```

---

### 1.4 createSession

新しいセッションを作成します。

```typescript
window.agentAPI.createSession(): Promise<CreateSessionResponse>
```

**戻り値**: `Promise<CreateSessionResponse>`

**CreateSessionResponse**:

| プロパティ  | 型       | 説明         |
| ----------- | -------- | ------------ |
| `sessionId` | `string` | セッションID |

**使用例**:

```typescript
const { sessionId } = await window.agentAPI.createSession();
// sessionId: "550e8400-e29b-41d4-a716-446655440000"
```

---

### 1.5 resumeSession

既存のセッションを再開します。

```typescript
window.agentAPI.resumeSession(sessionId: string): Promise<void>
```

**パラメータ**:

| 名前        | 型       | 必須 | 説明         |
| ----------- | -------- | ---- | ------------ |
| `sessionId` | `string` | ✅   | セッションID |

**例外**:

| エラー型               | 発生条件               |
| ---------------------- | ---------------------- |
| `AgentSessionError`    | セッションが存在しない |
| `AgentValidationError` | リクエストが不正       |

**使用例**:

```typescript
await window.agentAPI.resumeSession("550e8400-e29b-41d4-a716-446655440000");
```

---

### 1.6 destroySession

セッションを破棄します。

```typescript
window.agentAPI.destroySession(sessionId: string): Promise<void>
```

**パラメータ**:

| 名前        | 型       | 必須 | 説明         |
| ----------- | -------- | ---- | ------------ |
| `sessionId` | `string` | ✅   | セッションID |

**使用例**:

```typescript
await window.agentAPI.destroySession("550e8400-e29b-41d4-a716-446655440000");
```

---

### 1.7 onMessage

メッセージ受信のコールバックを登録します。

```typescript
window.agentAPI.onMessage(callback: (message: SDKMessage) => void): () => void
```

**パラメータ**:

| 名前       | 型                              | 必須 | 説明             |
| ---------- | ------------------------------- | ---- | ---------------- |
| `callback` | `(message: SDKMessage) => void` | ✅   | コールバック関数 |

**戻り値**: `() => void` - 購読解除関数

**SDKMessage**:

| プロパティ   | 型               | 説明           |
| ------------ | ---------------- | -------------- |
| `id`         | `string`         | メッセージID   |
| `type`       | `SDKMessageType` | メッセージ種別 |
| `content`    | `string`         | メッセージ内容 |
| `timestamp`  | `number`         | タイムスタンプ |
| `isComplete` | `boolean`        | 完了フラグ     |

**SDKMessageType**:

| 値         | 説明               |
| ---------- | ------------------ |
| `text`     | テキストメッセージ |
| `tool_use` | ツール使用         |
| `error`    | エラーメッセージ   |
| `complete` | 完了通知           |

**使用例**:

```typescript
const unsubscribe = window.agentAPI.onMessage((message) => {
  console.log(`[${message.type}] ${message.content}`);
});

// 購読解除
unsubscribe();
```

---

## 2. useAgent Hook

Reactコンポーネントで使用するカスタムフック。

```typescript
import { useAgent } from "@/hooks/useAgent";

function MyComponent() {
  const { messages, isLoading, error, status, query, abort, clearMessages } =
    useAgent();
}
```

### 戻り値

| プロパティ      | 型                                                          | 説明                 |
| --------------- | ----------------------------------------------------------- | -------------------- |
| `messages`      | `SDKMessage[]`                                              | 受信メッセージの配列 |
| `isLoading`     | `boolean`                                                   | クエリ実行中フラグ   |
| `error`         | `string \| null`                                            | エラーメッセージ     |
| `status`        | `AgentStatus \| null`                                       | Agent SDKステータス  |
| `query`         | `(prompt: string, options?: QueryOptions) => Promise<void>` | クエリ実行関数       |
| `abort`         | `() => void`                                                | クエリ中断関数       |
| `clearMessages` | `() => void`                                                | メッセージクリア関数 |

### オプション

```typescript
interface UseAgentOptions {
  autoFetchStatus?: boolean; // 自動ステータス取得（デフォルト: true）
}
```

### 使用例

```tsx
function ChatComponent() {
  const { messages, isLoading, error, query, abort, clearMessages } =
    useAgent();

  const handleSubmit = async (prompt: string) => {
    await query(prompt);
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      {isLoading && <button onClick={abort}>中断</button>}
      {error && <div className="error">{error}</div>}
      <button onClick={clearMessages}>クリア</button>
    </div>
  );
}
```

---

## 3. AgentClient（内部API）

Main Processで使用するSDKクライアント。

### コンストラクタ

```typescript
new AgentClient(config: AgentClientConfig)
```

**AgentClientConfig**:

| プロパティ          | 型       | 必須 | デフォルト | 説明                        |
| ------------------- | -------- | ---- | ---------- | --------------------------- |
| `apiKey`            | `string` | ✅   | -          | Claude API Key              |
| `defaultTimeout`    | `number` | -    | `30000`    | デフォルトタイムアウト (ms) |
| `maxRetries`        | `number` | -    | `3`        | 最大リトライ回数            |
| `initialRetryDelay` | `number` | -    | `1000`     | 初回リトライ待機 (ms)       |
| `maxRetryDelay`     | `number` | -    | `4000`     | 最大リトライ待機 (ms)       |

### メソッド

| メソッド           | 戻り値                        | 説明             |
| ------------------ | ----------------------------- | ---------------- |
| `initialize()`     | `Promise<void>`               | SDK初期化        |
| `query()`          | `Promise<void>`               | クエリ実行       |
| `abort()`          | `void`                        | クエリ中断       |
| `getStatus()`      | `AgentStatus`                 | ステータス取得   |
| `getConfig()`      | `Required<AgentClientConfig>` | 設定取得         |
| `isQueryRunning()` | `boolean`                     | クエリ実行中判定 |

---

## 4. SessionManager（内部API）

セッション管理クラス。

### メソッド

| メソッド                                | 戻り値                 | 説明               |
| --------------------------------------- | ---------------------- | ------------------ |
| `createSession()`                       | `string`               | セッション作成     |
| `getSession(sessionId)`                 | `Session \| undefined` | セッション取得     |
| `resumeSession(sessionId)`              | `void`                 | セッション再開     |
| `destroySession(sessionId)`             | `void`                 | セッション破棄     |
| `addMessageToSession(sessionId, msgId)` | `void`                 | メッセージ追加     |
| `getSessionCount()`                     | `number`               | セッション数取得   |
| `clearAllSessions()`                    | `void`                 | 全セッションクリア |

### Session型

```typescript
interface Session {
  id: string;
  createdAt: number;
  lastAccessedAt: number;
  context: SessionContext;
}

interface SessionContext {
  messageIds: string[];
}
```

---

## 5. エラー型

### エラー階層

```
AgentError (基底クラス)
├── AgentInitializationError
├── AgentQueryError
├── AgentTimeoutError
├── AgentAbortedError
├── AgentSessionError
└── AgentValidationError
```

### AgentErrorCode

```typescript
enum AgentErrorCode {
  INITIALIZATION_FAILED = "INITIALIZATION_FAILED",
  QUERY_FAILED = "QUERY_FAILED",
  TIMEOUT = "TIMEOUT",
  ABORTED = "ABORTED",
  SESSION_NOT_FOUND = "SESSION_NOT_FOUND",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  VALIDATION_FAILED = "VALIDATION_FAILED",
}
```

### エラー処理例

```typescript
try {
  await window.agentAPI.query("Hello");
} catch (error) {
  if (error instanceof AgentTimeoutError) {
    console.log("タイムアウトしました");
  } else if (error instanceof AgentAbortedError) {
    console.log("中断されました");
  } else if (error instanceof AgentQueryError) {
    console.log("クエリ失敗:", error.message);
  }
}
```

---

## 6. IPC チャンネル

Main/Renderer間のIPCチャンネル一覧。

| チャンネル             | 方向            | 説明           |
| ---------------------- | --------------- | -------------- |
| `agent:query`          | Renderer → Main | クエリ実行     |
| `agent:abort`          | Renderer → Main | クエリ中断     |
| `agent:getStatus`      | Renderer → Main | ステータス取得 |
| `agent:createSession`  | Renderer → Main | セッション作成 |
| `agent:resumeSession`  | Renderer → Main | セッション再開 |
| `agent:destroySession` | Renderer → Main | セッション破棄 |
| `agent:message`        | Main → Renderer | メッセージ送信 |

---

## 7. Zodスキーマ

### queryRequestSchema

```typescript
const queryRequestSchema = z.object({
  prompt: z.string().min(1).max(100000),
  options: z
    .object({
      sessionId: z.string().uuid().optional(),
      systemPrompt: z.string().max(10000).optional(),
      timeout: z.number().int().positive().max(300000).optional(),
    })
    .optional(),
});
```

### resumeSessionRequestSchema

```typescript
const resumeSessionRequestSchema = z.object({
  sessionId: z.string().uuid(),
});
```

### destroySessionRequestSchema

```typescript
const destroySessionRequestSchema = z.object({
  sessionId: z.string().uuid(),
});
```

---

## 8. 定数

### デフォルト設定

| 定数                  | 値      | 説明                        |
| --------------------- | ------- | --------------------------- |
| `DEFAULT_TIMEOUT`     | `30000` | デフォルトタイムアウト (ms) |
| `MAX_RETRIES`         | `3`     | 最大リトライ回数            |
| `INITIAL_RETRY_DELAY` | `1000`  | 初回リトライ待機 (ms)       |
| `MAX_RETRY_DELAY`     | `4000`  | 最大リトライ待機 (ms)       |
| `MAX_SESSIONS`        | `10`    | 最大セッション数            |

---

## 更新履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-08 | 初版作成 |
