# Phase 2: IPC 契約マトリクス（Task 2-4）

## メタ情報

| 項目             | 内容                                  |
| ---------------- | ------------------------------------- |
| タスクID         | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001   |
| Phase            | 2 - 設計                              |
| Task             | 2-4 IPC契約マトリクス                 |
| 作成日           | 2026-03-18                            |
| 担当エージェント | Agent D (Task 2-3 / Task 2-4)         |
| 依存成果物       | outputs/phase-1/scope-definition.md   |
|                  | apps/desktop/src/preload/channels.ts  |
|                  | apps/desktop/src/main/handlers/llm.ts |

---

## 1. 10チャンネル詳細テーブル

### CH-01: `llm:stream-chat`（LLM_STREAM_CHAT）

| 項目             | 内容                                                         |
| ---------------- | ------------------------------------------------------------ |
| 定数名           | `IPC_CHANNELS.LLM_STREAM_CHAT`                               |
| チャンネル文字列 | `"llm:stream-chat"`                                          |
| 方向             | Renderer → Main（invoke）                                    |
| ALLOWED リスト   | `ALLOWED_INVOKE_CHANNELS` 登録済み                           |
| Preload Bridge   | `window.electronAPI.llm.streamChat(request: LLMChatRequest)` |
| 既存実装状態     | 実装済み（`handlers/llm.ts` の `handleStreamChat`）          |

**リクエスト型**:

```typescript
// LLMChatRequest は LLMChatRequestInput のエイリアス（preload/types.ts 経由）
interface LLMChatRequestInput {
  messages: LLMMessage[]; // 必須: メッセージ配列（length >= 1）
  modelId: string; // 必須: モデルID（例: "gpt-4o", "claude-3-5-sonnet-20241022"）
  providerId?: LLMProviderId; // 任意: 省略時は modelId プレフィックスから推論
  systemPrompt?: string; // 任意: システムプロンプト
  temperature?: number; // 任意: 0-2
  maxTokens?: number; // 任意: 最大出力トークン数
  stream?: boolean; // 任意: ストリーミングフラグ（常に true を推奨）
}
```

**レスポンス型**:

```typescript
interface StreamChatResponse {
  requestId: string; // UUIDv4。以降の cancelStream に使用する
}
```

**P42 バリデーション（Main handler 実装済み）**:

1. `!request.messages || request.messages.length === 0` → `LLM_STREAM_ERROR` に `{ code: "VALIDATION_ERROR", ... }` を送信して `{ requestId }` を返す
2. `providerId` / `modelId` から `inferProviderId()` で推論、不明な場合 → `LLM_STREAM_ERROR` に `{ code: "MODEL_NOT_FOUND", ... }` を送信
3. `SecureStorage.getApiKey(providerId)` が null の場合 → `LLM_STREAM_ERROR` に `{ code: "API_KEY_MISSING", ... }` を送信

**レスポンス形式**: フラット（wrapper なし）。エラーは `LLM_STREAM_ERROR` チャンネルで非同期通知。

---

### CH-02: `llm:stream-chunk`（LLM_STREAM_CHUNK）

| 項目             | 内容                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------- |
| 定数名           | `IPC_CHANNELS.LLM_STREAM_CHUNK`                                                             |
| チャンネル文字列 | `"llm:stream-chunk"`                                                                        |
| 方向             | Main → Renderer（push / on）                                                                |
| ALLOWED リスト   | `ALLOWED_ON_CHANNELS` 登録済み                                                              |
| Preload Bridge   | `window.electronAPI.llm.onStreamChunk(callback)` → `() => void`                             |
| 既存実装状態     | 実装済み（`event.sender.send(IPC_CHANNELS.LLM_STREAM_CHUNK, chunk)` in `handleStreamChat`） |

**ペイロード型**:

```typescript
interface LLMStreamChunk {
  id: string;
  delta?: {
    content?: string; // テキストフラグメント
    role?: string;
  };
  done: boolean;
  metadata?: {
    model?: string;
    finishReason?: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
}
```

**バリデーション**: 送信側（Main）が LLMAdapter から受け取った chunk をそのまま転送。Renderer 側は `chunk.delta?.content` の存在チェックを行ってから `appendStreamChunk` を呼び出す。

**レスポンス形式**: イベントペイロード（P60 wrapper 非適用、push イベントのため）。

---

### CH-03: `llm:stream-end`（LLM_STREAM_END）

| 項目             | 内容                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| 定数名           | `IPC_CHANNELS.LLM_STREAM_END`                                                      |
| チャンネル文字列 | `"llm:stream-end"`                                                                 |
| 方向             | Main → Renderer（push / on）                                                       |
| ALLOWED リスト   | `ALLOWED_ON_CHANNELS` 登録済み                                                     |
| Preload Bridge   | `window.electronAPI.llm.onStreamEnd(callback)` → `() => void`                      |
| 既存実装状態     | 実装済み（`event.sender.send(IPC_CHANNELS.LLM_STREAM_END)` in `handleStreamChat`） |

**ペイロード**: なし（引数なし）

**命名注記（P45 対応記録）**: 仕様書ドキュメント（`llm-streaming.md` L71）では `llm:stream-done` と記載されているが、`channels.ts` の実際の定数は `LLM_STREAM_END = "llm:stream-end"` である。`useStreamingChat.ts` は `llmApi.onStreamEnd()` で正しく接続済み。新規実装でこのチャンネルを参照する際は `IPC_CHANNELS.LLM_STREAM_END` を使用すること。

**レスポンス形式**: ペイロードなし（push イベントのため P60 wrapper 非適用）。

---

### CH-04: `llm:stream-error`（LLM_STREAM_ERROR）

| 項目             | 内容                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| 定数名           | `IPC_CHANNELS.LLM_STREAM_ERROR`                                                                |
| チャンネル文字列 | `"llm:stream-error"`                                                                           |
| 方向             | Main → Renderer（push / on）                                                                   |
| ALLOWED リスト   | `ALLOWED_ON_CHANNELS` 登録済み                                                                 |
| Preload Bridge   | `window.electronAPI.llm.onStreamError(callback)` → `() => void`                                |
| 既存実装状態     | 実装済み（`event.sender.send(IPC_CHANNELS.LLM_STREAM_ERROR, llmError)` in `handleStreamChat`） |

**ペイロード型**:

```typescript
interface LLMError {
  code: LLMErrorCode; // API_KEY_MISSING | API_KEY_INVALID | NETWORK_ERROR | TIMEOUT |
  // RATE_LIMIT | CONTEXT_LENGTH_EXCEEDED | CONTENT_FILTER |
  // MODEL_NOT_FOUND | SERVICE_UNAVAILABLE | UNKNOWN | VALIDATION_ERROR
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
  details?: Record<string, unknown>;
}
```

**レスポンス形式**: イベントペイロード（push イベントのため P60 wrapper 非適用）。

---

### CH-05: `llm:stream-cancel`（LLM_STREAM_CANCEL）

| 項目             | 内容                                                     |
| ---------------- | -------------------------------------------------------- |
| 定数名           | `IPC_CHANNELS.LLM_STREAM_CANCEL`                         |
| チャンネル文字列 | `"llm:stream-cancel"`                                    |
| 方向             | Renderer → Main（invoke）                                |
| ALLOWED リスト   | `ALLOWED_INVOKE_CHANNELS` 登録済み                       |
| Preload Bridge   | `window.electronAPI.llm.cancelStream(requestId: string)` |
| 既存実装状態     | 実装済み（`handleStreamCancel` in `handlers/llm.ts`）    |

**リクエスト型（Main handler が受け取る形式）**:

```typescript
{
  requestId: string;
}
```

**Preload Bridge の呼び出し形式**（`preload/index.ts` 経由）:

```typescript
cancelStream: (requestId: string) =>
  safeInvoke(IPC_CHANNELS.LLM_STREAM_CANCEL, { requestId });
```

**レスポンス型**:

```typescript
{
  success: boolean;
}
// activeStreams に requestId が存在しない場合は { success: false } を返す（エラーはスローしない）
```

**P42 バリデーション**: `requestId` が `activeStreams` Map に存在しない場合は `{ success: false }` を返す。

**レスポンス形式**: フラット（P60 wrapper なし）。

---

### CH-06: `llm:set-selected-config`（LLM_SET_SELECTED_CONFIG）

| 項目             | 内容                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| 定数名           | `IPC_CHANNELS.LLM_SET_SELECTED_CONFIG`                                       |
| チャンネル文字列 | `"llm:set-selected-config"`                                                  |
| 方向             | Renderer → Main（invoke）                                                    |
| ALLOWED リスト   | `ALLOWED_INVOKE_CHANNELS` 登録済み                                           |
| Preload Bridge   | `window.electronAPI.llm.setSelectedConfig(request: { providerId, modelId })` |
| 既存実装状態     | 実装済み（`handleSetSelectedConfig` in `handlers/llm.ts`）                   |

**リクエスト型**:

```typescript
{
  providerId: LLMProviderId; // "openai" | "anthropic" | "google" | "xai"
  modelId: string;
}
```

**レスポンス型（P60 wrapper 形式）**:

```typescript
{ success: boolean; error?: string }
```

**P42 バリデーション（Main handler 実装済み）**:

1. `!isValidProviderId(providerId)` → `{ success: false, error: "Invalid provider ID: ..." }`
2. `typeof modelId !== "string" || modelId.trim().length === 0` → `{ success: false, error: "Model ID is required" }`
3. 成功時: `setSelectedLLMConfig({ providerId, modelId: modelId.trim() })` を呼び出し `{ success: true }` を返す

**レスポンス形式**: P60 wrapper 形式（`{ success: boolean, error?: string }`）。

---

### CH-07: `llm:check-health`（LLM_CHECK_HEALTH）

| 項目             | 内容                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| 定数名           | `IPC_CHANNELS.LLM_CHECK_HEALTH`                                       |
| チャンネル文字列 | `"llm:check-health"`                                                  |
| 方向             | Renderer → Main（invoke）                                             |
| ALLOWED リスト   | `ALLOWED_INVOKE_CHANNELS` 登録済み                                    |
| Preload Bridge   | `window.electronAPI.llm.checkHealth(providerId: LLMProviderId)`       |
| 既存実装状態     | 実装済み（`handleCheckHealth` in `handlers/llm.ts`、GAP-02 修正済み） |

**リクエスト型（Main handler が受け取る形式）**:

```typescript
{
  providerId: LLMProviderId;
}
```

**Preload Bridge の呼び出し形式**（P44/P45 対応確認済み）:

```typescript
checkHealth: (providerId: LLMProviderId) =>
  safeInvoke(IPC_CHANNELS.LLM_CHECK_HEALTH, { providerId });
```

**レスポンス型**:

```typescript
interface HealthCheckResult {
  providerId: LLMProviderId;
  status: "connected" | "disconnected" | "error";
  latency?: number;
  checkedAt: Date;
  errorMessage?: string;
}
```

**P42 バリデーション**: `!isValidProviderId(providerId)` の場合 `throw createLLMError("UNKNOWN", ...)` を発生させる（catch ブロックで `status: "disconnected"` として返る）。

**レスポンス形式**: フラット（P60 wrapper なし）。エラー時も例外スローではなく `status: "disconnected"` を返す（GAP-02 修正済み）。

---

### CH-08: `conversation:create`（CONVERSATION_CREATE）

| 項目             | 内容                                                                |
| ---------------- | ------------------------------------------------------------------- |
| 定数名           | `IPC_CHANNELS.CONVERSATION_CREATE`                                  |
| チャンネル文字列 | `"conversation:create"`                                             |
| 方向             | Renderer → Main（invoke）                                           |
| ALLOWED リスト   | `ALLOWED_INVOKE_CHANNELS` 登録済み                                  |
| Preload Bridge   | `window.conversationAPI.create(request: ConversationCreateRequest)` |
| 既存実装状態     | 実装済み（`conversationHandlers.ts`）                               |

**注意**: `window.conversationAPI` は `window.electronAPI` とは独立した window 変数として公開されている（`preload/index.ts` の `contextBridge.exposeInMainWorld("conversationAPI", ...)` 経由）。

**リクエスト型**:

```typescript
interface ConversationCreateRequest {
  userId: string;
  title: string;
  firstMessage?: {
    content: string;
    role: "user";
    systemPrompt?: string;
    llmProvider?: string;
    llmModel?: string;
  };
}
```

**レスポンス型（P60 wrapper 形式）**:

```typescript
type ConversationCreateResponse = ConversationIPCResponse<Conversation>;
// = { success: true; data: Conversation }
//   | { success: false; error: { code: string; message: string } }
```

**P42 バリデーション（Main handler 実装済み）**:

1. `!request.title || request.title.trim() === ""` → `{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }`

**レスポンス形式**: P60 wrapper 形式（`ConversationIPCResponse<T>`）。

---

### CH-09: `conversation:addMessage`（CONVERSATION_ADD_MESSAGE）

| 項目             | 内容                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| 定数名           | `IPC_CHANNELS.CONVERSATION_ADD_MESSAGE`                                     |
| チャンネル文字列 | `"conversation:addMessage"`                                                 |
| 方向             | Renderer → Main（invoke）                                                   |
| ALLOWED リスト   | `ALLOWED_INVOKE_CHANNELS` 登録済み                                          |
| Preload Bridge   | `window.conversationAPI.addMessage(request: ConversationAddMessageRequest)` |
| 既存実装状態     | 実装済み（`conversationHandlers.ts`）                                       |

**リクエスト型**:

```typescript
interface ConversationAddMessageRequest {
  sessionId: string; // Conversation の id（P45 注記参照）
  message: CreateMessageInput;
}

interface CreateMessageInput {
  role: "user" | "assistant";
  content: string;
  llmProvider?: string;
  llmModel?: string;
  llmMetadata?: Record<string, unknown>;
  systemPrompt?: string;
}
```

**レスポンス型（P60 wrapper 形式）**:

```typescript
type ConversationAddMessageResponse = ConversationIPCResponse<Message>;
// = { success: true; data: Message }
//   | { success: false; error: { code: string; message: string } }
```

**P42 バリデーション（Main handler 実装済み）**:

1. `!request.sessionId || request.sessionId.trim() === ""` → VALIDATION_ERROR
2. `!request.message?.content || request.message.content.trim() === ""` → VALIDATION_ERROR

**命名注記（P45 対応記録）**: 引数フィールド `sessionId` は実態として Conversation の `id`（UUID）を格納する。名称が `sessionId` であるのは歴史的経緯。Phase 5 実装時は呼び出し側で `conversationId` を `sessionId` フィールドにマッピングして渡すこと。将来的なリファクタリングは別タスクとして管理。

**レスポンス形式**: P60 wrapper 形式（`ConversationIPCResponse<T>`）。

---

### CH-10: `auth-key:exists`（AUTH_KEY_EXISTS）

| 項目             | 内容                                  |
| ---------------- | ------------------------------------- |
| 定数名           | `IPC_CHANNELS.AUTH_KEY_EXISTS`        |
| チャンネル文字列 | `"auth-key:exists"`                   |
| 方向             | Renderer → Main（invoke）             |
| ALLOWED リスト   | `ALLOWED_INVOKE_CHANNELS` 登録済み    |
| Preload Bridge   | `window.electronAPI.authKey.exists()` |
| 既存実装状態     | 実装済み（`authKeyHandlers.ts`）      |

**リクエスト型**: なし（引数なし）

**Preload Bridge の呼び出し形式（types.ts L1107）**:

```typescript
authKey: {
  exists: () => Promise<AuthKeyExistsResponse>;
}
```

**注意**: Phase 1 調査で確認済み。指示書の `{ provider }` 引数は実際の Preload Bridge には存在しない。`AUTH_KEY_EXISTS` は Claude Agent SDK 用の単一 API キー管理チャンネルであり、プロバイダー別キーとは独立している。

**レスポンス型**（非 wrapper 形式）:

```typescript
interface AuthKeyExistsResponse {
  exists: boolean;
  source?: "saved" | "env-fallback" | "not-set";
}
```

**レスポンス形式**: フラット（P60 wrapper なし）。`success` フィールドなし。Renderer 側は `result.exists` で直接判定する。

---

## 2. 型レイヤーの区別テーブル

| 型名                            | 定義元                                                      | 用途                                                                                 |
| ------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `AIChatRequest`                 | `apps/desktop/src/main/handlers/aiHandlers.ts`              | `AI_CHAT` チャンネル（非ストリーミング）用。ChatPanel では**使用しない**             |
| `LLMChatRequest`                | `apps/desktop/src/preload/types.ts`（preload 型エイリアス） | Preload Bridge 経由で Renderer → Main に渡す型。`streamChat` / `sendChat` 引数型     |
| `LLMChatRequestInput`           | `packages/shared/src/types/llm/schemas/request.ts`          | Main Process 内部で使用する Zod バリデーション済み型。`handlers/llm.ts` インポート先 |
| `LLMStreamChunk`                | `apps/desktop/src/preload/types.ts`                         | `onStreamChunk` コールバックの引数型                                                 |
| `LLMError`                      | `@repo/shared/types/llm/schemas`                            | `onStreamError` コールバックの引数型・`LLM_STREAM_ERROR` ペイロード型                |
| `HealthCheckResult`             | `@repo/shared/types/llm/schemas`                            | `checkHealth()` の戻り値型                                                           |
| `LLMProviderId`                 | `@repo/shared/types/llm/schemas`                            | `"openai" \| "anthropic" \| "google" \| "xai"` のユニオン型                          |
| `ConversationCreateRequest`     | `apps/desktop/src/shared/types/conversation.ts`             | `conversation:create` の引数型                                                       |
| `ConversationAddMessageRequest` | `apps/desktop/src/shared/types/conversation.ts`             | `conversation:addMessage` の引数型                                                   |
| `AuthKeyExistsResponse`         | `apps/desktop/src/preload/types.ts`                         | `auth-key:exists` の戻り値型                                                         |

**LLMChatRequest vs LLMChatRequestInput の使い分け**:

- Renderer 側コンポーネントは `LLMChatRequest`（preload 型）を使用する
- Main Process ハンドラ内部では `LLMChatRequestInput`（shared 型）を使用する
- `useStreamingChat.ts` は `LLMChatRequestInput` を引数に取り、Zod Schema でパースしてから `window.electronAPI.llm.streamChat()` に渡す

---

## 3. 命名マッピング注記

### llm:stream-done vs llm:stream-end

| 表記場所                         | 表記                          | 説明                                   |
| -------------------------------- | ----------------------------- | -------------------------------------- |
| `llm-streaming.md` L71（仕様書） | `llm:stream-done`             | 旧表記。仕様書ドキュメントの未更新箇所 |
| `channels.ts` L123               | `LLM_STREAM_END`              | 実際の定数名。値は `"llm:stream-end"`  |
| `useStreamingChat.ts` L95        | `llmApi.onStreamEnd()`        | Preload Bridge の正しい呼び出し形式    |
| `handlers/llm.ts` L359           | `IPC_CHANNELS.LLM_STREAM_END` | Main 側 send の正しい定数参照          |

**判定**: 実装上は `LLM_STREAM_END = "llm:stream-end"` が正。新規実装では必ずこの定数を使用する。

### conversation:addMessage の sessionId → conversationId

| フィールド  | 実態                                      | 対応方針                                                                                |
| ----------- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `sessionId` | Conversation テーブルの `id` (UUID)       | Phase 5 実装時: 呼び出し側で `{ sessionId: conversationId, message: ... }` とマッピング |
| 将来の修正  | `sessionId` → `conversationId` へリネーム | 別タスク（P45 対策として未タスク化予定）                                                |

---

## 4. Preload Bridge 要件サマリー

ChatPanel が使用するすべての IPC は、既存の Preload Bridge で対応済み。新規 contextBridge 定義の追加は不要。

| API グループ | window 変数                  | 定義ファイル                                       | 対応チャンネル群 |
| ------------ | ---------------------------- | -------------------------------------------------- | ---------------- |
| LLM API      | `window.electronAPI.llm`     | `apps/desktop/src/preload/types.ts` L1167-1180     | CH-01〜CH-07     |
| Conversation | `window.conversationAPI`     | `apps/desktop/src/preload/types.ts`（独立 window） | CH-08〜CH-09     |
| Auth Key     | `window.electronAPI.authKey` | `apps/desktop/src/preload/types.ts` L1104-1110     | CH-10            |

**LLM API インターフェース（types.ts L1167-1180）**:

```typescript
llm: {
  getProviders: () => Promise<LLMProvider[]>;
  setSelectedConfig: (request: {
    providerId: LLMProviderId;
    modelId: string;
  }) => Promise<{ success: boolean; error?: string }>;
  checkHealth: (providerId: LLMProviderId) => Promise<HealthCheckResult>;
  sendChat: (request: LLMChatRequest) => Promise<LLMChatResponse>;
  streamChat: (request: LLMChatRequest) => Promise<{ requestId: string }>;
  cancelStream: (requestId: string) => Promise<{ success: boolean }>;
  onStreamChunk: (callback: (chunk: LLMStreamChunk) => void) => () => void;
  onStreamEnd: (callback: () => void) => () => void;
  onStreamError: (callback: (error: LLMError) => void) => () => void;
};
```

**Auth Key API インターフェース（types.ts L1104-1110）**:

```typescript
authKey: {
  set: (key: string) => Promise<AuthKeySetResponse>;
  exists: () => Promise<AuthKeyExistsResponse>;
  validate: (key: string) => Promise<AuthKeyValidateResponse>;
  delete: () => Promise<AuthKeyDeleteResponse>;
};
```

**Conversation API インターフェース（window.conversationAPI）**:

```typescript
conversationAPI: {
  list: (request: ConversationListRequest) => Promise<ConversationListResponse>;
  get: (request: ConversationGetRequest) => Promise<ConversationGetResponse>;
  create: (request: ConversationCreateRequest) => Promise<ConversationCreateResponse>;
  update: (request: ConversationUpdateRequest) => Promise<ConversationUpdateResponse>;
  delete: (request: ConversationDeleteRequest) => Promise<ConversationDeleteResponse>;
  addMessage: (request: ConversationAddMessageRequest) => Promise<ConversationAddMessageResponse>;
  search: (request: ConversationSearchRequest) => Promise<ConversationSearchResponse>;
};
```

---

## 5. Phase 4 テスト作成への引き渡し事項

Phase 4 でテストケースを設計する際に参照すべき契約上のポイントを以下に整理する。

### invoke 系（CH-01, CH-05〜CH-09）の共通テストパターン

```typescript
// P60 準拠: wrapper 形式チャンネルのアサーション方法
// CH-06: llm:set-selected-config
expect(result).toEqual({ success: true });
expect(result).toEqual({ success: false, error: "Model ID is required" });

// CH-08: conversation:create
expect(result).toEqual({
  success: true,
  data: expect.objectContaining({ id: expect.any(String) }),
});
expect(result).toEqual({
  success: false,
  error: { code: "VALIDATION_ERROR", message: expect.any(String) },
});
```

```typescript
// フラット形式チャンネルのアサーション方法
// CH-01: llm:stream-chat
expect(result).toEqual({ requestId: expect.any(String) });

// CH-05: llm:stream-cancel
expect(result).toEqual({ success: true });
expect(result).toEqual({ success: false });

// CH-07: llm:check-health
expect(result).toEqual(expect.objectContaining({ status: "connected" }));
expect(result).toEqual(expect.objectContaining({ status: "disconnected" }));

// CH-10: auth-key:exists
expect(result).toEqual({ exists: true, source: "saved" });
expect(result).toEqual({ exists: false });
```

### push 系（CH-02〜CH-04）の共通テストパターン

```typescript
// push チャンネルはリスナー経由でアサート
const chunks: LLMStreamChunk[] = [];
window.electronAPI.llm.onStreamChunk((chunk) => chunks.push(chunk));
// ... streamChat 呼び出し後
expect(chunks.length).toBeGreaterThan(0);
expect(chunks[0].delta?.content).toBeDefined();
```

### P42 バリデーション境界値テストケース

| チャンネル                | 境界値入力                        | 期待結果                                                  |
| ------------------------- | --------------------------------- | --------------------------------------------------------- |
| `llm:stream-chat`         | `messages: []`                    | LLM_STREAM_ERROR `{ code: "VALIDATION_ERROR" }`           |
| `llm:stream-chat`         | `modelId: "unknown-model-xyz"`    | LLM_STREAM_ERROR `{ code: "MODEL_NOT_FOUND" }`            |
| `llm:set-selected-config` | `modelId: "   "` （スペースのみ） | `{ success: false, error: "Model ID is required" }`       |
| `llm:set-selected-config` | `providerId: "invalid"`           | `{ success: false, error: "Invalid provider ID..." }`     |
| `conversation:create`     | `title: ""`                       | `{ success: false, error: { code: "VALIDATION_ERROR" } }` |
| `conversation:create`     | `title: "   "` （スペースのみ）   | `{ success: false, error: { code: "VALIDATION_ERROR" } }` |
| `conversation:addMessage` | `sessionId: ""`                   | `{ success: false, error: { code: "VALIDATION_ERROR" } }` |
| `conversation:addMessage` | `message.content: ""`             | `{ success: false, error: { code: "VALIDATION_ERROR" } }` |
