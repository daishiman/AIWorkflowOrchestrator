# Phase 2: アーキテクチャ設計書

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| タスクID   | UT-LLM-STREAM-001 |
| Phase      | 2                 |
| 作成日     | 2026-01-23        |
| ステータス | 完了              |

---

## 1. アーキテクチャ概要

### 1.1 既存アーキテクチャ（確認済み）

現在のLLMアダプターは既にストリーミング機能が**完全実装**されている。

```
┌─────────────────────────────────────────────────────────────────┐
│                      Renderer Process                           │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────────┐│
│  │ ChatMessage  │  │ ChatSlice     │  │ Preload API           ││
│  │ Component    │←─│ (Zustand)     │←─│ (streamChat, onChunk) ││
│  └──────────────┘  └───────────────┘  └───────────┬───────────┘│
└──────────────────────────────────────────────────┬──────────────┘
                                                   │ IPC
                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Main Process                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ IPC Handlers (llm:stream-chat, llm:stream-chunk, ...)     │ │
│  └────────────────────────────┬───────────────────────────────┘ │
│                               ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ LLMAdapterFactory                                        │   │
│  │   ├── getAdapter(providerId) → ILLMAdapter               │   │
│  └──┬───────────────────────────────────────────────────────┘   │
│     │                                                            │
│     ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ BaseLLMAdapter (Abstract)                                │   │
│  │   ├── streamChat()*: AsyncGenerator<StreamChunk>         │   │
│  │   ├── fetchSSE(): AsyncGenerator<string>                 │   │
│  │   └── handleError(), createLLMError()                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                               │                                  │
│     ┌────────────┬────────────┼────────────┬──────────────┐     │
│     ▼            ▼            ▼            ▼              ▼     │
│  ┌────────┐ ┌──────────┐ ┌────────┐ ┌────────┐                  │
│  │OpenAI  │ │Anthropic │ │Google  │ │xAI     │                  │
│  │Adapter │ │Adapter   │ │Adapter │ │Adapter │                  │
│  └────────┘ └──────────┘ └────────┘ └────────┘                  │
│      │           │           │           │                       │
└──────┼───────────┼───────────┼───────────┼───────────────────────┘
       │           │           │           │
       ▼           ▼           ▼           ▼
    OpenAI      Anthropic    Google       xAI
    API (SSE)   API (SSE)    API (SSE)   API (SSE)
```

### 1.2 統合対象箇所

既存実装は堅牢であり、主な作業は**Renderer側の統合**となる。

| レイヤー       | 状態     | 統合作業                                 |
| -------------- | -------- | ---------------------------------------- |
| Main Process   | 完全実装 | 動作確認のみ                             |
| LLM Adapters   | 完全実装 | 動作確認のみ                             |
| IPC Channels   | 定義済み | ホワイトリスト確認                       |
| Preload API    | 要確認   | streamChat/onStreamChunkメソッド公開確認 |
| Renderer Store | 要統合   | isStreaming/streamingContent状態管理追加 |
| UI Components  | 要統合   | ストリーミングUI統合                     |

---

## 2. コンポーネント設計

### 2.1 Main Process層（既存実装確認）

#### handleStreamChat（実装済み）

```typescript
// apps/desktop/src/main/handlers/llm.ts
export async function handleStreamChat(
  event: IpcMainInvokeEvent,
  request: LLMChatRequestInput,
): Promise<void> {
  const adapter = await LLMAdapterFactory.getAdapter(providerId);
  const stream = adapter.streamChat(request);

  for await (const chunk of stream) {
    event.sender.send(IPC_CHANNELS.LLM_STREAM_CHUNK, chunk);
  }

  event.sender.send(IPC_CHANNELS.LLM_STREAM_END);
}
```

#### handleStreamCancel（新規設計）

```typescript
// apps/desktop/src/main/handlers/llm-stream.ts
interface ActiveStream {
  requestId: string;
  abortController: AbortController;
}

const activeStreams = new Map<string, ActiveStream>();

export async function handleStreamCancel(
  _event: IpcMainInvokeEvent,
  requestId: string,
): Promise<void> {
  const stream = activeStreams.get(requestId);
  if (stream) {
    stream.abortController.abort();
    activeStreams.delete(requestId);
  }
}
```

### 2.2 Preload API層（確認・拡張）

```typescript
// apps/desktop/src/preload/index.ts
const llmAPI = {
  // 既存
  sendChat: (request: LLMChatRequest) =>
    safeInvoke(IPC_CHANNELS.LLM_SEND_CHAT, request),

  // ストリーミング（確認・統合）
  streamChat: (request: LLMChatRequest) =>
    safeInvoke(IPC_CHANNELS.LLM_STREAM_CHAT, request),

  cancelStream: (requestId: string) =>
    safeInvoke(IPC_CHANNELS.LLM_STREAM_CANCEL, requestId),

  onStreamChunk: (callback: (chunk: LLMStreamChunk) => void) =>
    safeOn<LLMStreamChunk>(IPC_CHANNELS.LLM_STREAM_CHUNK, callback),

  onStreamEnd: (callback: () => void) =>
    safeOn(IPC_CHANNELS.LLM_STREAM_END, callback),

  onStreamError: (callback: (error: LLMError) => void) =>
    safeOn<LLMError>(IPC_CHANNELS.LLM_STREAM_ERROR, callback),
};
```

### 2.3 Renderer Store層（新規設計）

```typescript
// apps/desktop/src/renderer/store/slices/chatSlice.ts
interface ChatStreamingState {
  isStreaming: boolean;
  streamingContent: string;
  streamingRequestId: string | null;
}

interface ChatStreamingActions {
  startStreaming: (requestId: string) => void;
  appendStreamChunk: (content: string) => void;
  finishStreaming: (finalMessage: ChatMessage) => void;
  cancelStreaming: () => void;
  handleStreamError: (error: LLMError) => void;
}
```

---

## 3. IPC通信設計

### 3.1 チャンネル一覧（既存定義確認）

| チャンネル          | 方式    | 方向            | 定義箇所                        |
| ------------------- | ------- | --------------- | ------------------------------- |
| `llm:stream-chat`   | invoke  | Renderer → Main | `IPC_CHANNELS.LLM_STREAM_CHAT`  |
| `llm:stream-chunk`  | send/on | Main → Renderer | `IPC_CHANNELS.LLM_STREAM_CHUNK` |
| `llm:stream-end`    | send/on | Main → Renderer | `IPC_CHANNELS.LLM_STREAM_END`   |
| `llm:stream-error`  | send/on | Main → Renderer | `IPC_CHANNELS.LLM_STREAM_ERROR` |
| `llm:stream-cancel` | invoke  | Renderer → Main | 新規追加（必要時）              |

### 3.2 ホワイトリスト登録確認

```typescript
// apps/desktop/src/preload/channels.ts
export const ALLOWED_INVOKE_CHANNELS = [
  // ... 既存チャンネル
  IPC_CHANNELS.LLM_STREAM_CHAT,
  IPC_CHANNELS.LLM_STREAM_CANCEL, // 要追加確認
];

export const ALLOWED_ON_CHANNELS = [
  // ... 既存チャンネル
  IPC_CHANNELS.LLM_STREAM_CHUNK,
  IPC_CHANNELS.LLM_STREAM_END,
  IPC_CHANNELS.LLM_STREAM_ERROR,
];
```

---

## 4. エラーハンドリング設計

### 4.1 エラーフロー

```
Provider API Error
       │
       ▼
LLM Adapter (catch & transform)
       │
       ▼
IPC Handler (send error event)
       │
       ▼ llm:stream-error
Renderer (display & recover)
```

### 4.2 エラー変換マッピング

| Provider Error               | LLMErrorCode          | リトライ |
| ---------------------------- | --------------------- | -------- |
| 401 Unauthorized             | `API_KEY_INVALID`     | 不可     |
| 429 Too Many Requests        | `RATE_LIMIT`          | 可能     |
| 500 Internal Server Error    | `SERVICE_UNAVAILABLE` | 可能     |
| Network Error (fetch failed) | `NETWORK_ERROR`       | 可能     |
| Timeout                      | `TIMEOUT`             | 可能     |
| Content Policy Violation     | `CONTENT_FILTER`      | 不可     |

### 4.3 エラー発生時の状態復旧

```typescript
// Renderer側
const handleStreamError = (error: LLMError) => {
  // 1. ストリーミングフラグを解除
  setIsStreaming(false);

  // 2. 途中応答があれば保持（streamingContent → messages）
  if (streamingContent) {
    addPartialMessage(streamingContent, error);
  }

  // 3. エラー表示
  showError(error);

  // 4. リトライ可能ならリトライボタン表示
  if (error.retryable) {
    showRetryButton(lastRequest);
  }
};
```

---

## 5. キャンセル機構設計

### 5.1 AbortController統合

```typescript
// Main Process
const handleStreamChat = async (event, request) => {
  const requestId = crypto.randomUUID();
  const abortController = new AbortController();

  activeStreams.set(requestId, { requestId, abortController });

  try {
    const adapter = await LLMAdapterFactory.getAdapter(request.providerId);
    const stream = adapter.streamChat(request, abortController.signal);

    for await (const chunk of stream) {
      if (abortController.signal.aborted) break;
      event.sender.send(IPC_CHANNELS.LLM_STREAM_CHUNK, chunk);
    }

    if (!abortController.signal.aborted) {
      event.sender.send(IPC_CHANNELS.LLM_STREAM_END);
    }
  } finally {
    activeStreams.delete(requestId);
  }

  return { requestId };
};
```

### 5.2 Adapter側のAbortSignal対応

```typescript
// BaseLLMAdapter
abstract streamChat(
  request: LLMChatRequestInput,
  signal?: AbortSignal
): AsyncGenerator<StreamChunk>;

// OpenAIAdapter実装例
async *streamChat(request, signal) {
  const response = await fetch(url, {
    method: 'POST',
    headers: this.getHeaders(),
    body: JSON.stringify(body),
    signal, // AbortSignal渡し
  });

  for await (const line of this.fetchSSE(response, signal)) {
    yield this.parseChunk(line);
  }
}
```

---

## 6. メモリ管理設計

### 6.1 リソースクリーンアップ

| リソース         | クリーンアップタイミング         | 方法                       |
| ---------------- | -------------------------------- | -------------------------- |
| イベントリスナー | ストリーム完了/エラー/キャンセル | `removeListener()`         |
| AbortController  | ストリーム終了                   | `activeStreams.delete()`   |
| streamingContent | メッセージ確定時                 | 空文字列にリセット         |
| Renderer購読     | コンポーネントunmount            | クリーンアップ関数呼び出し |

### 6.2 Renderer側のクリーンアップ

```typescript
// React Hook
useEffect(() => {
  const unsubChunk = window.llmAPI.onStreamChunk(handleChunk);
  const unsubEnd = window.llmAPI.onStreamEnd(handleEnd);
  const unsubError = window.llmAPI.onStreamError(handleError);

  return () => {
    unsubChunk();
    unsubEnd();
    unsubError();
  };
}, []);
```

---

## 7. 設計決定事項

### 7.1 決定事項一覧

| 項目             | 決定                                     | 理由                         |
| ---------------- | ---------------------------------------- | ---------------------------- |
| 既存Adapter実装  | 再利用                                   | 完全実装済み、変更不要       |
| キャンセル機構   | AbortController                          | 標準API、fetch互換           |
| イベント購読     | safeOn（ホワイトリスト）                 | セキュリティ確保             |
| 状態管理         | Zustand Slice拡張                        | 既存パターンとの一貫性       |
| エラー表示       | 途中応答保持 + エラーメッセージ          | UX向上                       |
| UIパフォーマンス | requestAnimationFrameは不要（React管理） | React 18の自動バッチング活用 |

### 7.2 リスク対策

| リスク                     | 対策                                        |
| -------------------------- | ------------------------------------------- |
| メモリリーク               | クリーンアップ関数の徹底、useEffect cleanup |
| 高速チャンク時のUI遅延     | React 18 concurrent features活用            |
| キャンセル後のイベント到達 | requestIdによる検証、古いイベント無視       |

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-23 | 初版作成 |
