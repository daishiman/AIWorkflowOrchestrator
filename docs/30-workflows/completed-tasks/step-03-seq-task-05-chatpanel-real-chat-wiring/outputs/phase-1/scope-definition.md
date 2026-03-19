# Phase 1: スコープ定義

## メタ情報

| 項目             | 内容                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001                                                                                  |
| Phase            | 1 - 要件定義                                                                                                         |
| 作成日           | 2026-03-18                                                                                                           |
| 担当エージェント | Agent C (Task 1-6 / Task 1-7)                                                                                        |
| 調査元ファイル   | channels.ts / types.ts / llm.ts / conversationHandlers.ts / authKeyHandlers.ts / llm-ipc-types.md / llm-streaming.md |

---

## IPC 契約要件

### チャンネル一覧（10 チャンネル）

| #   | チャンネル名              | 定数名 (IPC_CHANNELS)      | 方向            | 通信種別  | 用途                                                                                         |
| --- | ------------------------- | -------------------------- | --------------- | --------- | -------------------------------------------------------------------------------------------- |
| 1   | `llm:stream-chat`         | `LLM_STREAM_CHAT`          | Renderer → Main | invoke    | ストリーミングチャット開始。`{ requestId: string }` を即時返却し、以降は push イベントで配信 |
| 2   | `llm:stream-chunk`        | `LLM_STREAM_CHUNK`         | Main → Renderer | on (push) | ストリームチャンクを1フラグメントずつ配信                                                    |
| 3   | `llm:stream-end`          | `LLM_STREAM_END`           | Main → Renderer | on (push) | ストリーミング正常完了を通知                                                                 |
| 4   | `llm:stream-error`        | `LLM_STREAM_ERROR`         | Main → Renderer | on (push) | ストリーミングエラーを通知                                                                   |
| 5   | `llm:stream-cancel`       | `LLM_STREAM_CANCEL`        | Renderer → Main | invoke    | ストリーミングキャンセル                                                                     |
| 6   | `llm:set-selected-config` | `LLM_SET_SELECTED_CONFIG`  | Renderer → Main | invoke    | Provider / Model 選択状態をMainへ同期                                                        |
| 7   | `llm:check-health`        | `LLM_CHECK_HEALTH`         | Renderer → Main | invoke    | プロバイダーのヘルスチェック                                                                 |
| 8   | `conversation:create`     | `CONVERSATION_CREATE`      | Renderer → Main | invoke    | 新規会話レコードを作成                                                                       |
| 9   | `conversation:addMessage` | `CONVERSATION_ADD_MESSAGE` | Renderer → Main | invoke    | 会話にメッセージを追加                                                                       |
| 10  | `auth-key:exists`         | `AUTH_KEY_EXISTS`          | Renderer → Main | invoke    | APIキーの存在確認                                                                            |

**注記**:

- チャンネル 1-5 は ALLOWED_INVOKE_CHANNELS（1, 5）および ALLOWED_ON_CHANNELS（2, 3, 4）に登録済み
- チャンネル 6-7 は ALLOWED_INVOKE_CHANNELS に登録済み
- チャンネル 8-9 は ALLOWED_INVOKE_CHANNELS に登録済み
- チャンネル 10 は ALLOWED_INVOKE_CHANNELS に登録済み
- 指示書で `llm:stream-done` とされていたチャンネルの実際の定数は `LLM_STREAM_END`（`"llm:stream-end"`）である。`LLM_STREAM_DONE` という定数は channels.ts に存在しない

---

### チャンネル詳細

#### CH-01: `llm:stream-chat`（LLM_STREAM_CHAT）

**方向**: Renderer → Main（invoke）

**引数型**:

```typescript
// @repo/shared/types/llm/schemas から
interface LLMChatRequestInput {
  messages: LLMMessage[]; // 必須: メッセージ配列
  modelId: string; // 必須: モデルID
  providerId?: LLMProviderId; // 任意: 省略時はmodelIdから推論
  systemPrompt?: string; // 任意: システムプロンプト
  temperature?: number; // 任意: 温度パラメータ (0-2)
  maxTokens?: number; // 任意: 最大出力トークン数
  stream?: boolean; // 任意: ストリーミング有効フラグ
}
```

**戻り値型**:

```typescript
interface StreamChatResponse {
  requestId: string; // UUIDv4。以降のキャンセルに使用する
}
```

**P42 バリデーション（Main handler側 実装済み）**:

1. `messages` が配列かつ length > 0 であること（空配列は VALIDATION_ERROR）
2. `providerId` / `modelId` が未設定の場合は `inferProviderId(modelId)` で推論、どちらも不明な場合は MODEL_NOT_FOUND エラーを stream-error チャンネルで送信
3. SecureStorage で APIキーが存在しない場合は API_KEY_MISSING エラーを stream-error チャンネルで送信

**既存実装**: `apps/desktop/src/main/handlers/llm.ts` の `handleStreamChat` 実装済み

---

#### CH-02: `llm:stream-chunk`（LLM_STREAM_CHUNK）

**方向**: Main → Renderer（push / on）

**ペイロード型**（types.ts 定義）:

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

**Preload Bridge**: `window.electronAPI.llm.onStreamChunk(callback)` → `() => void`（クリーンアップ関数）

**既存実装**: handler 側で `event.sender.send(IPC_CHANNELS.LLM_STREAM_CHUNK, chunk)` 実装済み

---

#### CH-03: `llm:stream-end`（LLM_STREAM_END）

**方向**: Main → Renderer（push / on）

**ペイロード**: なし（引数なし）

**Preload Bridge**: `window.electronAPI.llm.onStreamEnd(callback)` → `() => void`（クリーンアップ関数）

**既存実装**: handler 側で `event.sender.send(IPC_CHANNELS.LLM_STREAM_END)` 実装済み

**注意**: 仕様書では `llm:stream-done` と記載されることがあるが、実際の定数は `LLM_STREAM_END = "llm:stream-end"` である。`useStreamingChat.ts` では `llmApi.onStreamEnd()` で接続している。

---

#### CH-04: `llm:stream-error`（LLM_STREAM_ERROR）

**方向**: Main → Renderer（push / on）

**ペイロード型**（@repo/shared/types/llm/schemas から）:

```typescript
interface LLMError {
  code: LLMErrorCode; // API_KEY_MISSING | API_KEY_INVALID | NETWORK_ERROR | TIMEOUT | RATE_LIMIT | CONTEXT_LENGTH_EXCEEDED | CONTENT_FILTER | MODEL_NOT_FOUND | SERVICE_UNAVAILABLE | UNKNOWN
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
  details?: Record<string, unknown>;
}
```

**Preload Bridge**: `window.electronAPI.llm.onStreamError(callback)` → `() => void`（クリーンアップ関数）

**既存実装**: handler 側で `event.sender.send(IPC_CHANNELS.LLM_STREAM_ERROR, llmError)` 実装済み

---

#### CH-05: `llm:stream-cancel`（LLM_STREAM_CANCEL）

**方向**: Renderer → Main（invoke）

**引数型**（Preload経由）:

```typescript
// Preload: window.electronAPI.llm.cancelStream(requestId: string)
// Main handler が受け取る形式:
{
  requestId: string;
}
```

**戻り値型**:

```typescript
{
  success: boolean;
}
```

**P42 バリデーション（Main handler側）**:

- `requestId` が activeStreams Map に存在しない場合は `{ success: false }` を返す（エラーはスローしない）

**既存実装**: `handleStreamCancel` 実装済み。AbortController を abort() して activeStreams から削除

---

#### CH-06: `llm:set-selected-config`（LLM_SET_SELECTED_CONFIG）

**方向**: Renderer → Main（invoke）

**引数型**:

```typescript
{
  providerId: LLMProviderId; // "openai" | "anthropic" | "google" | "xai"
  modelId: string;
}
```

**戻り値型**（P60 wrapper 形式）:

```typescript
{ success: boolean; error?: string }
```

**P42 バリデーション（Main handler側 実装済み）**:

1. `typeof providerId === "string"` かつ有効な LLMProviderId であること
2. `typeof modelId !== "string" || modelId.trim().length === 0` の場合はエラー（trim 済み）
3. 成功時は `setSelectedLLMConfig({ providerId, modelId: modelId.trim() })` を呼び出し

**既存実装**: `handleSetSelectedConfig` 実装済み。`llmConfigProvider.ts` の `setSelectedLLMConfig` へ委譲

---

#### CH-07: `llm:check-health`（LLM_CHECK_HEALTH）

**方向**: Renderer → Main（invoke）

**引数型**:

```typescript
// Preload 呼び出し形式: window.electronAPI.llm.checkHealth(providerId: LLMProviderId)
// Main handler が受け取る形式（P44/P45対策で確認済み）:
{
  providerId: LLMProviderId;
}
```

**戻り値型**:

```typescript
// HealthCheckResult (@repo/shared/types/llm/schemas)
interface HealthCheckResult {
  providerId: LLMProviderId;
  status: "connected" | "disconnected" | "error";
  latency?: number;
  checkedAt: Date;
  errorMessage?: string;
}
```

**P42 バリデーション（Main handler側）**:

- `isValidProviderId(providerId)` が false の場合は LLMError をスロー

**既存実装**: `handleCheckHealth` 実装済み。catch ブロックは `status: "disconnected"` を返す（GAP-02 修正済み、TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001）

---

#### CH-08: `conversation:create`（CONVERSATION_CREATE）

**方向**: Renderer → Main（invoke）

**引数型**（`apps/desktop/src/shared/types/conversation.ts`）:

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

**戻り値型**（P60 wrapper 形式）:

```typescript
type ConversationCreateResponse = ConversationIPCResponse<Conversation>;
// = { success: true; data: Conversation }
//   | { success: false; error: { code: string; message: string } }
```

**戻り値の Conversation 型**:

```typescript
interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  isFavorite: boolean;
  isPinned: boolean;
  pinOrder: number | null;
  lastMessagePreview: string | null;
  metadata: Record<string, unknown>;
  messages: Message[];
}
```

**P42 バリデーション（Main handler側 実装済み）**:

1. `!request.title || request.title.trim() === ""` → VALIDATION_ERROR

**既存実装**: `conversationHandlers.ts` の `CONVERSATION_CREATE` ハンドラ実装済み

**Preload Bridge**: `window.conversationAPI.create(request)` として公開（ElectronAPI の外 / 独立 window 変数）

---

#### CH-09: `conversation:addMessage`（CONVERSATION_ADD_MESSAGE）

**方向**: Renderer → Main（invoke）

**引数型**:

```typescript
interface ConversationAddMessageRequest {
  sessionId: string; // Conversation の id
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

**戻り値型**（P60 wrapper 形式）:

```typescript
type ConversationAddMessageResponse = ConversationIPCResponse<Message>;
// = { success: true; data: Message }
//   | { success: false; error: { code: string; message: string } }
```

**戻り値の Message 型**:

```typescript
interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  messageIndex: number;
  timestamp: string;
  llmProvider?: string;
  llmModel?: string;
  llmMetadata?: Record<string, unknown>;
  systemPrompt?: string;
  attachments: Attachment[];
  metadata: Record<string, unknown>;
}
```

**P42 バリデーション（Main handler側 実装済み）**:

1. `!request.sessionId || request.sessionId.trim() === ""` → VALIDATION_ERROR
2. `!request.message?.content || request.message.content.trim() === ""` → VALIDATION_ERROR

**既存実装**: `conversationHandlers.ts` の `CONVERSATION_ADD_MESSAGE` ハンドラ実装済み

**Preload Bridge**: `window.conversationAPI.addMessage(request)` として公開

---

#### CH-10: `auth-key:exists`（AUTH_KEY_EXISTS）

**方向**: Renderer → Main（invoke）

**引数型**:

```typescript
// Preload Bridge の定義 (types.ts L1105-1110):
// window.electronAPI.authKey.exists() → 引数なし
// Main handler が受け取る引数: void / なし
// （指示書の "{ provider }" 引数は preload では存在しない）
```

**戻り値型**（非 wrapper 形式 - success フィールドなし）:

```typescript
interface AuthKeyExistsResponse {
  exists: boolean;
  source?: "saved" | "env-fallback" | "not-set";
}
```

**既存実装**: `apps/desktop/src/main/ipc/authKeyHandlers.ts` の `AUTH_KEY_EXISTS` ハンドラ（セキュリティルール上直接読み取り不可のため handler 内容の詳細確認は不可）

**Preload Bridge**: `window.electronAPI.authKey.exists()` として公開

**注意**: 指示書では引数 `{ provider }` と記載されているが、実際の Preload Bridge（types.ts L1107）は `exists: () => Promise<AuthKeyExistsResponse>` で引数なし。AUTH_KEY_EXISTS は特定のプロバイダーではなく Claude Agent SDK 用の単一 API キーを管理する。

---

### Preload Bridge 要件

ChatPanel が使用するすべての API は既存の `window.electronAPI` または `window.conversationAPI` 経由でアクセス可能。新規 contextBridge 定義の追加は不要。

| API グループ  | Window 変数                  | 接続先インターフェース                       |
| ------------- | ---------------------------- | -------------------------------------------- |
| LLM Streaming | `window.electronAPI.llm`     | `ElectronAPI.llm` (types.ts L1167-1180)      |
| Conversation  | `window.conversationAPI`     | `ConversationAPI` (conversation.ts L228-246) |
| Auth Key      | `window.electronAPI.authKey` | `ElectronAPI.authKey` (types.ts L1105-1110)  |

**LLM API インターフェース（types.ts L1167-1180 抜粋）**:

```typescript
llm: {
  getProviders: () => Promise<LLMProvider[]>;
  setSelectedConfig: (request: { providerId: LLMProviderId; modelId: string; }) => Promise<{ success: boolean; error?: string }>;
  checkHealth: (providerId: LLMProviderId) => Promise<HealthCheckResult>;
  sendChat: (request: LLMChatRequest) => Promise<LLMChatResponse>;
  streamChat: (request: LLMChatRequest) => Promise<{ requestId: string }>;
  cancelStream: (requestId: string) => Promise<{ success: boolean }>;
  onStreamChunk: (callback: (chunk: LLMStreamChunk) => void) => () => void;
  onStreamEnd: (callback: () => void) => () => void;
  onStreamError: (callback: (error: LLMError) => void) => () => void;
};
```

**Auth Key API インターフェース（types.ts L1104-1110 抜粋）**:

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
// 独立した window 変数として公開（ElectronAPI の外）
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

## 依存ハンドオフ要件

### 上流依存

本タスクが前提とするもの。以下はすべて既存実装済みまたは完了タスク済みのものとして確認された。

| 依存元                                                  | 提供物                                                                                  | ファイルパス                                                     | 確認状態               |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------- |
| TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 (Task06相当) | `llm:check-health` catch ブロック修正（status: "disconnected"）                         | `apps/desktop/src/main/handlers/llm.ts`                          | 実装済み（2026-03-17） |
| TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001              | `handleSetSelectedConfig` trim バリデーション確認                                       | `apps/desktop/src/main/handlers/llm.ts`                          | 実装済み（2026-03-17） |
| UT-LLM-STREAM-001                                       | `useStreamingChat` フック（179行、IPC接続済み）                                         | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`            | 実装済み（2026-01-24） |
| UT-LLM-STREAM-001                                       | `StreamingMessage` コンポーネント（83行）                                               | `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx` | 実装済み               |
| UT-LLM-STREAM-001                                       | LLM ストリーミングハンドラ群（handleStreamChat, handleStreamCancel）                    | `apps/desktop/src/main/handlers/llm.ts`                          | 実装済み（2026-01-24） |
| UT-LLM-HISTORY-001                                      | conversationHandlers（create / addMessage）                                             | `apps/desktop/src/main/ipc/conversationHandlers.ts`              | 実装済み（2026-01-24） |
| TASK-FIX-16-1                                           | authKeyHandlers（auth-key:exists）                                                      | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                   | 実装済み               |
| llmConfigProvider                                       | `setSelectedLLMConfig` / `getSelectedLLMConfig`（DEFAULT_CONFIG fallback 禁止 P62準拠） | `apps/desktop/src/main/ipc/llmConfigProvider.ts`                 | 実装済み               |
| channels.ts                                             | 10 チャンネル全定数の ALLOWED リスト登録                                                | `apps/desktop/src/preload/channels.ts`                           | 確認済み（全登録済み） |

**注記**: 調査対象の index.md では本タスクは「Task07」として扱われており、「Task02（Main Chat/Settings AI runtime同期）」が「Task06」に相当する。ディレクトリ名の `step-03-seq-task-05` は連番であり、AI Surface 台帳上の番号と一致しない。

#### chatSlice 提供状態（Store）

`useStreamingChat.ts` が `useStore()` から取得するスロット:

| スロット名                   | 型                                     | 用途                            |
| ---------------------------- | -------------------------------------- | ------------------------------- |
| `isStreaming`                | boolean                                | ストリーミング中フラグ          |
| `streamingContent`           | string                                 | 累積ストリームコンテンツ        |
| `currentStreamId`            | string                                 | アクティブストリームのrequestId |
| `streamingError`             | `{ code, message, retryable } \| null` | ストリームエラー状態            |
| `startStreaming(requestId)`  | action                                 | ストリーミング開始              |
| `appendStreamChunk(content)` | action                                 | チャンク追記                    |
| `endStreaming()`             | action                                 | ストリーミング完了              |
| `cancelStreaming()`          | action                                 | ストリーミングキャンセル        |
| `setStreamingError(error)`   | action                                 | エラー状態セット                |

---

### 下流ハンドオフ

本タスクが後続タスク・実装者に提供するもの。

| 提供物                                 | 詳細                                                                                   | 後続タスク                       |
| -------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------- |
| ChatPanel 完全な AI チャット機能       | placeholder 3箇所（model-selector-slot, message-list-slot, chat-input-slot）の置換実装 | Phase 4-13 実装フェーズ          |
| IPC 契約マトリクス（10チャンネル）     | 本ドキュメントの型定義・バリデーション・Bridge 定義                                    | Phase 2 設計、Phase 4 テスト作成 |
| コンポーネント階層（12コンポーネント） | Phase 2 設計で定義予定                                                                 | Phase 5 実装                     |
| 状態機械（8状態 + 遷移）               | Phase 2 設計で定義予定                                                                 | Phase 5 実装                     |
| access capability 判定ロジック         | integratedRuntime / terminalSurface / both / none の4値判定                            | Phase 2 設計                     |

---

### タスク間依存図

```
[Task01: Access Matrix Foundation]
  └─提供─ access capability 4値判定基盤
          └─参照─ [Task07: ChatPanel (本タスク)]
                  ├─参照─ [Task06: Main Chat / Settings AI runtime同期]
                  │         └─提供─ llm:check-health 修正済みハンドラ
                  │         └─提供─ llm:set-selected-config バリデーション
                  │         └─提供─ llmConfigProvider (DEFAULT_CONFIG fallback 禁止)
                  │
                  ├─参照─ [既存実装 UT-LLM-STREAM-001]
                  │         └─提供─ useStreamingChat フック
                  │         └─提供─ handleStreamChat / handleStreamCancel
                  │         └─提供─ StreamingMessage コンポーネント
                  │
                  ├─参照─ [既存実装 UT-LLM-HISTORY-001]
                  │         └─提供─ conversationHandlers (create / addMessage)
                  │
                  └─参照─ [既存実装 TASK-FIX-16-1]
                            └─提供─ authKeyHandlers (auth-key:exists)
```

---

## スコープ外定義

以下は明示的に本タスクのスコープ外とする。

| 項目                                                           | 理由                                                              | 担当                   |
| -------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------- |
| `window.conversationAPI` の preload 登録実装（新規追加の場合） | 既存実装済み（types.ts L1793で確認）                              | 変更不要               |
| `auth-key:exists` の provider 指定対応                         | 現行 Preload Bridge は引数なし。provider 別キー管理はスコープ外   | 別タスク               |
| `llm:stream-done` チャンネルの新規定義                         | 実際の定数は `LLM_STREAM_END`（`"llm:stream-end"`）として実装済み | 変更不要               |
| WorkspaceChatPanel の streaming 配線                           | Task08 (step-03-par-task-07) が担当                               | Task08                 |
| Skill / Agent 実行の AI runtime 接続                           | Task04 が担当                                                     | Task04                 |
| RAG / Embedding の capability 整理                             | Task09 が担当                                                     | Task09                 |
| Slide AI の配線                                                | Task10 が担当                                                     | Task10                 |
| conversationAPI の list / get / update / delete / search       | 本タスクではチャット記録（create / addMessage）のみ使用           | 将来タスク             |
| Consumer subscription / OAuth token の処理                     | アプリが取得・保存・中継しない（パックレベルのリスク境界）        | なし                   |
| `claude-cli:execute-script` の自動実行経路                     | consumer subscription 前提の実行 lane として使わない              | パックレベルの禁止事項 |
