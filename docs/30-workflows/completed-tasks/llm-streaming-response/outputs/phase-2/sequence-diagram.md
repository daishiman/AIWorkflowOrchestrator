# Phase 2: シーケンス図

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| タスクID   | UT-LLM-STREAM-001 |
| Phase      | 2                 |
| 作成日     | 2026-01-23        |
| ステータス | 完了              |

---

## 1. 正常系: ストリーミングチャット

```mermaid
sequenceDiagram
    participant User
    participant ChatInput
    participant ChatSlice
    participant PreloadAPI
    participant IPCMain
    participant LLMHandler
    participant Adapter
    participant ProviderAPI

    User->>ChatInput: メッセージ入力 & 送信
    ChatInput->>ChatSlice: startStreaming(requestId)
    ChatSlice->>ChatSlice: isStreaming = true

    ChatInput->>PreloadAPI: streamChat(request)
    PreloadAPI->>IPCMain: invoke("llm:stream-chat", request)
    IPCMain->>LLMHandler: handleStreamChat(event, request)
    LLMHandler->>Adapter: getAdapter(providerId)
    Adapter-->>LLMHandler: adapter instance

    LLMHandler->>Adapter: streamChat(request, signal)
    Adapter->>ProviderAPI: POST /chat/completions (stream: true)

    loop チャンク受信
        ProviderAPI-->>Adapter: SSE chunk
        Adapter-->>LLMHandler: yield StreamChunk
        LLMHandler->>IPCMain: send("llm:stream-chunk", chunk)
        IPCMain->>PreloadAPI: onStreamChunk callback
        PreloadAPI->>ChatSlice: appendStreamChunk(content)
        ChatSlice->>ChatSlice: streamingContent += content
        ChatSlice-->>User: UI更新（リアルタイム表示）
    end

    ProviderAPI-->>Adapter: [DONE]
    Adapter-->>LLMHandler: stream complete
    LLMHandler->>IPCMain: send("llm:stream-end")
    IPCMain->>PreloadAPI: onStreamEnd callback
    PreloadAPI->>ChatSlice: finishStreaming(message)
    ChatSlice->>ChatSlice: isStreaming = false
    ChatSlice->>ChatSlice: messages.push(finalMessage)
    ChatSlice-->>User: 完了メッセージ表示
```

---

## 2. キャンセル: ストリーミング中断

```mermaid
sequenceDiagram
    participant User
    participant ChatInput
    participant ChatSlice
    participant PreloadAPI
    participant IPCMain
    participant LLMHandler
    participant Adapter
    participant ProviderAPI

    Note over User,ProviderAPI: ストリーミング中...

    User->>ChatInput: キャンセルボタン / Escape
    ChatInput->>PreloadAPI: cancelStream(requestId)
    PreloadAPI->>IPCMain: invoke("llm:stream-cancel", requestId)
    IPCMain->>LLMHandler: handleStreamCancel(requestId)

    LLMHandler->>LLMHandler: abortController.abort()
    LLMHandler->>Adapter: signal.aborted = true
    Adapter->>ProviderAPI: 接続中断

    LLMHandler-->>IPCMain: キャンセル完了
    IPCMain-->>PreloadAPI: Promise resolved

    PreloadAPI->>ChatSlice: cancelStreaming()
    ChatSlice->>ChatSlice: isStreaming = false
    ChatSlice->>ChatSlice: 途中応答を保存（[中断]付き）
    ChatSlice-->>User: 中断メッセージ表示
```

---

## 3. エラー系: ネットワークエラー

```mermaid
sequenceDiagram
    participant User
    participant ChatSlice
    participant PreloadAPI
    participant IPCMain
    participant LLMHandler
    participant Adapter
    participant ProviderAPI

    Note over User,ProviderAPI: ストリーミング中...

    ProviderAPI--xAdapter: Network Error
    Adapter->>Adapter: handleNetworkError()
    Adapter->>LLMHandler: throw LLMError(NETWORK_ERROR)
    LLMHandler->>LLMHandler: catch error

    LLMHandler->>IPCMain: send("llm:stream-error", error)
    IPCMain->>PreloadAPI: onStreamError callback
    PreloadAPI->>ChatSlice: handleStreamError(error)

    ChatSlice->>ChatSlice: isStreaming = false
    ChatSlice->>ChatSlice: error = error.message
    ChatSlice->>ChatSlice: streamingContent保持

    ChatSlice-->>User: エラー表示（途中応答 + エラーメッセージ）

    alt リトライ可能
        User->>ChatSlice: リトライボタンクリック
        ChatSlice->>PreloadAPI: streamChat(lastRequest)
        Note over User,ProviderAPI: 再実行フロー
    end
```

---

## 4. エラー系: タイムアウト

```mermaid
sequenceDiagram
    participant User
    participant ChatSlice
    participant PreloadAPI
    participant IPCMain
    participant LLMHandler
    participant Adapter
    participant ProviderAPI

    Note over User,ProviderAPI: ストリーミング開始...

    Adapter->>ProviderAPI: POST /chat/completions
    Note over Adapter,ProviderAPI: 60秒経過...

    ProviderAPI--xAdapter: Timeout
    Adapter->>Adapter: handleTimeoutError()
    Adapter->>LLMHandler: throw LLMError(TIMEOUT)

    LLMHandler->>IPCMain: send("llm:stream-error", error)
    IPCMain->>PreloadAPI: onStreamError callback
    PreloadAPI->>ChatSlice: handleStreamError(error)

    ChatSlice-->>User: タイムアウトエラー表示
    ChatSlice-->>User: リトライボタン表示
```

---

## 5. エラー系: レート制限

```mermaid
sequenceDiagram
    participant User
    participant ChatSlice
    participant PreloadAPI
    participant IPCMain
    participant LLMHandler
    participant Adapter
    participant ProviderAPI

    User->>PreloadAPI: streamChat(request)
    PreloadAPI->>IPCMain: invoke("llm:stream-chat")
    IPCMain->>LLMHandler: handleStreamChat()
    LLMHandler->>Adapter: streamChat()
    Adapter->>ProviderAPI: POST /chat/completions

    ProviderAPI-->>Adapter: 429 Too Many Requests
    Note over ProviderAPI,Adapter: Retry-After: 30

    Adapter->>Adapter: handleHttpError(429)
    Adapter->>LLMHandler: throw LLMError(RATE_LIMIT, retryAfterMs: 30000)

    LLMHandler->>IPCMain: send("llm:stream-error", error)
    IPCMain->>PreloadAPI: onStreamError callback
    PreloadAPI->>ChatSlice: handleStreamError(error)

    ChatSlice-->>User: "しばらくお待ちください（30秒後に再試行可能）"

    Note over User: 30秒待機...

    User->>ChatSlice: リトライボタンクリック
    ChatSlice->>PreloadAPI: streamChat(request)
    Note over User,ProviderAPI: 再実行フロー
```

---

## 6. 初期化: イベント購読

```mermaid
sequenceDiagram
    participant React
    participant useStreamingChat
    participant PreloadAPI
    participant ChatSlice

    React->>useStreamingChat: useEffect mount

    useStreamingChat->>PreloadAPI: onStreamChunk(callback)
    PreloadAPI-->>useStreamingChat: unsubChunk function

    useStreamingChat->>PreloadAPI: onStreamEnd(callback)
    PreloadAPI-->>useStreamingChat: unsubEnd function

    useStreamingChat->>PreloadAPI: onStreamError(callback)
    PreloadAPI-->>useStreamingChat: unsubError function

    Note over React,ChatSlice: イベント待機中...

    React->>useStreamingChat: useEffect cleanup (unmount)
    useStreamingChat->>PreloadAPI: unsubChunk()
    useStreamingChat->>PreloadAPI: unsubEnd()
    useStreamingChat->>PreloadAPI: unsubError()

    Note over React,ChatSlice: リソースクリーンアップ完了
```

---

## 7. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> Idle: 初期化

    Idle --> Streaming: sendStreamingMessage()
    Streaming --> Idle: finishStreaming()
    Streaming --> Cancelled: cancelStreaming()
    Streaming --> Error: handleStreamError()

    Cancelled --> Idle: resetStreaming()
    Error --> Idle: resetStreaming()
    Error --> Streaming: リトライ

    state Idle {
        [*] --> Ready
        Ready: isStreaming = false
        Ready: streamingContent = ""
    }

    state Streaming {
        [*] --> Receiving
        Receiving: isStreaming = true
        Receiving --> Receiving: appendStreamChunk()
        Receiving: streamingContent += chunk
    }

    state Cancelled {
        [*] --> Partial
        Partial: 途中応答保存
        Partial: [中断]マーク付与
    }

    state Error {
        [*] --> ErrorState
        ErrorState: error = message
        ErrorState: streamingContent保持
        ErrorState: リトライ可能判定
    }
```

---

## 8. データフローサマリー

### 8.1 送信方向（Renderer → Main → Provider）

```
User Action
    │
    ▼
ChatInput.onSend()
    │
    ▼
useStreamingChat.sendStreamingMessage()
    │
    ▼
window.llmAPI.streamChat(request)
    │
    ▼ IPC invoke
ipcMain.handle("llm:stream-chat")
    │
    ▼
handleStreamChat()
    │
    ▼
LLMAdapterFactory.getAdapter()
    │
    ▼
adapter.streamChat(request, signal)
    │
    ▼ HTTP POST (SSE)
Provider API
```

### 8.2 受信方向（Provider → Main → Renderer）

```
Provider API (SSE)
    │
    ▼
adapter.streamChat() yield chunk
    │
    ▼
handleStreamChat() for await
    │
    ▼ IPC send
event.sender.send("llm:stream-chunk", chunk)
    │
    ▼
preload.safeOn() callback
    │
    ▼
useStreamingChat() handler
    │
    ▼
ChatSlice.appendStreamChunk()
    │
    ▼
React re-render
    │
    ▼
StreamingMessage UI更新
```

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-23 | 初版作成 |
