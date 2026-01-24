# Phase 2: 型定義設計書

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| タスクID   | UT-LLM-STREAM-001 |
| Phase      | 2                 |
| 作成日     | 2026-01-23        |
| ステータス | 完了              |

---

## 1. 既存型定義（確認済み）

### 1.1 StreamChunk（実装済み）

```typescript
// packages/shared/src/types/llm/schemas/response.ts
export interface StreamChunk {
  id: string; // チャンクID
  delta?: StreamChunkDelta; // コンテンツ差分
  done: boolean; // 完了フラグ
  metadata?: {
    model?: string;
    finishReason?: string;
    usage?: AdapterTokenUsage;
  };
}

export interface StreamChunkDelta {
  content?: string; // テキストコンテンツ
  role?: "assistant"; // ロール（通常assistant）
}
```

### 1.2 LLMStreamChunk（実装済み）

```typescript
// packages/shared/src/types/llm/schemas/response.ts
export type LLMStreamChunk =
  | { type: "content"; content: string }
  | { type: "done"; response: LLMChatResponse }
  | { type: "error"; error: LLMError };
```

### 1.3 LLMChatRequest（実装済み）

```typescript
// packages/shared/src/types/llm/schemas/request.ts
export interface LLMChatRequest {
  messages: LLMMessage[];
  modelId: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
```

### 1.4 LLMError（実装済み）

```typescript
// packages/shared/src/types/llm/schemas/error.ts
export interface LLMError {
  code: LLMErrorCode;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
  retryAfterMs?: number;
}

export type LLMErrorCode =
  | "API_KEY_MISSING"
  | "API_KEY_INVALID"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "CONTEXT_LENGTH_EXCEEDED"
  | "CONTENT_FILTER"
  | "MODEL_NOT_FOUND"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";
```

---

## 2. 新規型定義（設計）

### 2.1 ストリーミングリクエスト型

```typescript
// packages/shared/src/types/llm/schemas/stream.ts

/**
 * ストリーミングチャットリクエスト
 * LLMChatRequestを拡張し、ストリーミング固有のフィールドを追加
 */
export interface LLMStreamChatRequest extends LLMChatRequest {
  /** ストリーミング有効（常にtrue） */
  stream: true;
  /** リクエストID（キャンセル用） */
  requestId?: string;
}

/**
 * ストリーミング開始レスポンス
 */
export interface LLMStreamChatResponse {
  /** リクエストID（キャンセル時に使用） */
  requestId: string;
  /** プロバイダーID */
  providerId: LLMProviderId;
}
```

### 2.2 ストリーミング状態型

```typescript
// apps/desktop/src/renderer/store/types/streaming.ts

/**
 * ストリーミング状態
 */
export interface StreamingState {
  /** ストリーミング中かどうか */
  isStreaming: boolean;
  /** 現在受信中のコンテンツ */
  streamingContent: string;
  /** 現在のリクエストID */
  currentRequestId: string | null;
  /** 開始時刻（パフォーマンス計測用） */
  startedAt: number | null;
  /** 受信チャンク数（デバッグ用） */
  chunkCount: number;
}

/**
 * ストリーミング状態初期値
 */
export const initialStreamingState: StreamingState = {
  isStreaming: false,
  streamingContent: "",
  currentRequestId: null,
  startedAt: null,
  chunkCount: 0,
};
```

### 2.3 ストリーミングイベント型

```typescript
// packages/shared/src/types/llm/schemas/stream-events.ts

/**
 * ストリーミングチャンクイベント（IPC用）
 */
export interface StreamChunkEvent {
  /** リクエストID */
  requestId: string;
  /** チャンクデータ */
  chunk: LLMStreamChunk;
  /** タイムスタンプ */
  timestamp: number;
}

/**
 * ストリーミング完了イベント（IPC用）
 */
export interface StreamEndEvent {
  /** リクエストID */
  requestId: string;
  /** 最終レスポンス */
  response: LLMChatResponse;
  /** トークン使用量 */
  usage?: AdapterTokenUsage;
  /** 処理時間（ms） */
  durationMs: number;
}

/**
 * ストリーミングエラーイベント（IPC用）
 */
export interface StreamErrorEvent {
  /** リクエストID */
  requestId: string;
  /** エラー情報 */
  error: LLMError;
  /** 途中までの応答（あれば） */
  partialContent?: string;
}
```

### 2.4 キャンセルリクエスト型

```typescript
// packages/shared/src/types/llm/schemas/stream.ts

/**
 * ストリーミングキャンセルリクエスト
 */
export interface LLMStreamCancelRequest {
  /** キャンセル対象のリクエストID */
  requestId: string;
}

/**
 * ストリーミングキャンセルレスポンス
 */
export interface LLMStreamCancelResponse {
  /** キャンセル成功かどうか */
  success: boolean;
  /** キャンセルしたリクエストID */
  requestId: string;
  /** 途中までの応答 */
  partialContent?: string;
}
```

---

## 3. Preload API型定義

### 3.1 LLM API型

```typescript
// apps/desktop/src/preload/types.ts

/**
 * LLM Preload API型定義
 */
export interface LLMPreloadAPI {
  // 非ストリーミング
  sendChat: (request: LLMChatRequest) => Promise<LLMChatResponse>;

  // ストリーミング
  streamChat: (request: LLMStreamChatRequest) => Promise<LLMStreamChatResponse>;
  cancelStream: (requestId: string) => Promise<LLMStreamCancelResponse>;

  // イベント購読
  onStreamChunk: (callback: StreamChunkCallback) => UnsubscribeFn;
  onStreamEnd: (callback: StreamEndCallback) => UnsubscribeFn;
  onStreamError: (callback: StreamErrorCallback) => UnsubscribeFn;

  // プロバイダー関連
  getProviders: () => Promise<LLMProvider[]>;
  checkHealth: (providerId: LLMProviderId) => Promise<HealthCheckResult>;
}

/**
 * コールバック型
 */
export type StreamChunkCallback = (event: StreamChunkEvent) => void;
export type StreamEndCallback = (event: StreamEndEvent) => void;
export type StreamErrorCallback = (event: StreamErrorEvent) => void;
export type UnsubscribeFn = () => void;
```

---

## 4. Store Slice型定義

### 4.1 ChatSlice ストリーミング拡張

```typescript
// apps/desktop/src/renderer/store/slices/chatSlice.ts

/**
 * ChatSlice状態型（ストリーミング拡張）
 */
export interface ChatState {
  // 既存
  messages: ChatMessage[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;

  // ストリーミング追加
  streaming: StreamingState;
}

/**
 * ChatSliceアクション型（ストリーミング拡張）
 */
export interface ChatActions {
  // 既存
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;

  // ストリーミング追加
  startStreaming: (requestId: string) => void;
  appendStreamChunk: (content: string) => void;
  finishStreaming: (message: ChatMessage) => void;
  cancelStreaming: () => void;
  handleStreamError: (error: LLMError) => void;
  resetStreaming: () => void;
}

/**
 * ChatSlice（State + Actions）
 */
export type ChatSlice = ChatState & ChatActions;
```

---

## 5. UIコンポーネント Props型

### 5.1 StreamingMessage Props

```typescript
// apps/desktop/src/renderer/components/chat/StreamingMessage/types.ts

/**
 * StreamingMessage コンポーネント Props
 */
export interface StreamingMessageProps {
  /** ストリーミング中のコンテンツ */
  content: string;
  /** ストリーミング中かどうか */
  isStreaming: boolean;
  /** カーソル表示 */
  showCursor?: boolean;
  /** キャンセルコールバック */
  onCancel?: () => void;
  /** 追加クラス名 */
  className?: string;
}
```

### 5.2 ChatInput Props（拡張）

```typescript
// apps/desktop/src/renderer/components/chat/ChatInput/types.ts

/**
 * ChatInput コンポーネント Props（ストリーミング対応）
 */
export interface ChatInputProps {
  // 既存
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;

  // ストリーミング追加
  isStreaming?: boolean;
  onCancelStream?: () => void;
}
```

---

## 6. 型の整合性確認

### 6.1 既存型との互換性

| 既存型            | 互換性 | 備考                        |
| ----------------- | ------ | --------------------------- |
| `LLMChatRequest`  | 完全   | `stream`フラグは既存        |
| `LLMChatResponse` | 完全   | 変更なし                    |
| `StreamChunk`     | 完全   | Adapter層で使用             |
| `LLMStreamChunk`  | 完全   | IPC通信で使用               |
| `LLMError`        | 完全   | エラーハンドリングで使用    |
| `ChatMessage`     | 完全   | `isStreaming`プロパティ既存 |

### 6.2 Zodスキーマ対応

```typescript
// packages/shared/src/types/llm/schemas/stream.ts
import { z } from "zod";

export const LLMStreamChatRequestSchema = LLMChatRequestSchema.extend({
  stream: z.literal(true),
  requestId: z.string().uuid().optional(),
});

export const StreamChunkEventSchema = z.object({
  requestId: z.string().uuid(),
  chunk: LLMStreamChunkSchema,
  timestamp: z.number(),
});

// 型エクスポート
export type LLMStreamChatRequest = z.infer<typeof LLMStreamChatRequestSchema>;
export type StreamChunkEvent = z.infer<typeof StreamChunkEventSchema>;
```

---

## 7. 型使用箇所マッピング

| 型                      | 使用箇所                        |
| ----------------------- | ------------------------------- |
| `LLMStreamChatRequest`  | Preload API → IPC Handler       |
| `LLMStreamChatResponse` | IPC Handler → Preload API       |
| `StreamChunkEvent`      | IPC (Main → Renderer)           |
| `StreamEndEvent`        | IPC (Main → Renderer)           |
| `StreamErrorEvent`      | IPC (Main → Renderer)           |
| `StreamingState`        | ChatSlice (Zustand)             |
| `StreamingMessageProps` | StreamingMessage コンポーネント |
| `LLMPreloadAPI`         | window.llmAPI 型定義            |

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-23 | 初版作成 |
