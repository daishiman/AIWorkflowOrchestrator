# Phase 4: 統合テスト設計書

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| タスクID   | UT-LLM-STREAM-001 |
| Phase      | 4                 |
| 作成日     | 2026-01-23        |
| ステータス | 完了              |

---

## 1. 統合テスト概要

### 1.1 目的

ストリーミング機能のエンドツーエンドフローを検証し、各コンポーネント間の連携が正しく動作することを確認する。

### 1.2 テストスコープ

```
┌─────────────────────────────────────────────────────────────────────┐
│                        統合テストスコープ                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Renderer Process                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ UI Component│←→│ Store/Slice │←→│ Preload API │                │
│  └─────────────┘  └─────────────┘  └──────┬──────┘                │
│                                           │                         │
│  ════════════════════════════════════════IPC════════════════════   │
│                                           │                         │
│  Main Process                             ▼                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ IPC Handler │←→│ Adapter     │←→│ Provider API│                │
│  │             │  │ Factory     │  │  (Mocked)   │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. テストシナリオ

### 2.1 API接続テスト（\*.integration.test.ts）

#### シナリオ: IPC→Adapter→Provider疎通

```typescript
// apps/desktop/src/main/handlers/__tests__/llm-stream.integration.test.ts

describe("LLM Streaming Integration", () => {
  describe("API接続テスト", () => {
    it("should establish connection: IPC → Adapter → Provider", async () => {
      // Given: MSWでプロバイダーAPIをモック
      server.use(
        http.post("https://api.openai.com/v1/chat/completions", () => {
          return createSSEResponse([{ delta: { content: "Hello" } }]);
        }),
      );

      // When: IPCハンドラー経由でストリーミング開始
      const mockEvent = createMockEvent();
      await handleStreamChat(mockEvent, {
        providerId: "openai",
        modelId: "gpt-4o",
        messages: [{ role: "user", content: "Hi" }],
        stream: true,
      });

      // Then: チャンクがIPCで送信される
      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-chunk",
        expect.objectContaining({ delta: expect.any(Object) }),
      );
    });

    it("should handle all 4 providers", async () => {
      const providers = ["openai", "anthropic", "google", "xai"];

      for (const providerId of providers) {
        const mockEvent = createMockEvent();
        await handleStreamChat(mockEvent, {
          providerId,
          modelId: getDefaultModel(providerId),
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        });

        expect(mockEvent.sender.send).toHaveBeenCalledWith(
          "llm:stream-chunk",
          expect.any(Object),
        );
      }
    });
  });
});
```

### 2.2 データフローテスト（\*.flow.test.ts）

#### シナリオ: チャンク送受信の往復

```typescript
// apps/desktop/src/renderer/__tests__/streaming-flow.test.ts

describe("Streaming Data Flow", () => {
  describe("チャンク送受信フロー", () => {
    it("should flow: User Input → IPC → Adapter → IPC → UI Update", async () => {
      // Given: モックプロバイダーとストア
      const { result } = renderHook(() => useStreamingChat());

      // When: ストリーミングメッセージ送信
      await act(async () => {
        await result.current.sendStreamingMessage({
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [{ role: "user", content: "Hello" }],
          stream: true,
        });
      });

      // Then: 状態が更新される
      expect(result.current.isStreaming).toBe(true);

      // When: チャンクイベントをシミュレート
      act(() => {
        emitStreamChunk({ requestId: currentRequestId, content: "Hi" });
      });

      // Then: コンテンツが蓄積される
      expect(result.current.streamingContent).toContain("Hi");
    });

    it("should accumulate chunks in correct order", async () => {
      const chunks = ["Hello", " ", "world", "!"];
      const { result } = renderHook(() => useStreamingChat());

      await act(async () => {
        await result.current.sendStreamingMessage(validRequest);
      });

      for (const chunk of chunks) {
        act(() => {
          emitStreamChunk({ requestId: currentRequestId, content: chunk });
        });
      }

      expect(result.current.streamingContent).toBe("Hello world!");
    });
  });
});
```

### 2.3 エラーハンドリングテスト（\*.error.test.ts）

#### シナリオ: ネットワーク切断、タイムアウト、APIエラー

```typescript
// apps/desktop/src/__tests__/streaming-error.integration.test.ts

describe("Streaming Error Handling", () => {
  describe("ネットワークエラー", () => {
    it("should handle network disconnection mid-stream", async () => {
      // Given: 途中で切断するモック
      server.use(
        http.post("https://api.openai.com/v1/chat/completions", () => {
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(
                encoder.encode(
                  'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
                ),
              );
              // 途中でエラー
              controller.error(new Error("Network disconnected"));
            },
          });
          return new HttpResponse(stream, {
            headers: { "Content-Type": "text/event-stream" },
          });
        }),
      );

      const mockEvent = createMockEvent();
      await handleStreamChat(mockEvent, validRequest);

      // Then: 途中コンテンツ付きでエラーイベント
      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-error",
        expect.objectContaining({
          code: "NETWORK_ERROR",
          partialContent: "Hello",
        }),
      );
    });
  });

  describe("タイムアウト", () => {
    it("should handle request timeout", async () => {
      // Given: タイムアウトするモック
      server.use(
        http.post("https://api.openai.com/v1/chat/completions", async () => {
          await delay(65000); // 65秒遅延
          return HttpResponse.json({});
        }),
      );

      vi.useFakeTimers();
      const mockEvent = createMockEvent();
      const promise = handleStreamChat(mockEvent, validRequest);

      vi.advanceTimersByTime(61000);
      await promise;
      vi.useRealTimers();

      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-error",
        expect.objectContaining({ code: "TIMEOUT" }),
      );
    });
  });

  describe("APIエラー", () => {
    it("should handle 401 Unauthorized", async () => {
      server.use(
        http.post("https://api.openai.com/v1/chat/completions", () => {
          return HttpResponse.json(
            { error: { message: "Invalid API key" } },
            { status: 401 },
          );
        }),
      );

      const mockEvent = createMockEvent();
      await handleStreamChat(mockEvent, validRequest);

      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-error",
        expect.objectContaining({ code: "API_KEY_INVALID" }),
      );
    });

    it("should handle 429 Rate Limit with retry-after", async () => {
      server.use(
        http.post("https://api.openai.com/v1/chat/completions", () => {
          return HttpResponse.json(
            { error: { message: "Rate limit exceeded" } },
            { status: 429, headers: { "Retry-After": "30" } },
          );
        }),
      );

      const mockEvent = createMockEvent();
      await handleStreamChat(mockEvent, validRequest);

      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-error",
        expect.objectContaining({
          code: "RATE_LIMIT",
          retryAfterMs: 30000,
        }),
      );
    });
  });
});
```

### 2.4 キャンセルテスト（\*.cancel.test.ts）

#### シナリオ: ストリーム中断、リソースクリーンアップ

```typescript
// apps/desktop/src/__tests__/streaming-cancel.integration.test.ts

describe("Streaming Cancel", () => {
  describe("ストリーム中断", () => {
    it("should cancel active stream via AbortController", async () => {
      // Given: 長いストリーミング
      let streamController: ReadableStreamDefaultController;
      server.use(
        http.post("https://api.openai.com/v1/chat/completions", () => {
          const stream = new ReadableStream({
            start(controller) {
              streamController = controller;
              controller.enqueue(
                encoder.encode(
                  'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
                ),
              );
            },
          });
          return new HttpResponse(stream, {
            headers: { "Content-Type": "text/event-stream" },
          });
        }),
      );

      const mockEvent = createMockEvent();
      const { requestId } = await handleStreamChat(mockEvent, validRequest);

      // When: キャンセル実行
      await handleStreamCancel(mockEvent, requestId);

      // Then: ストリームが中断される
      expect(activeStreams.has(requestId)).toBe(false);
    });

    it("should preserve partial content on cancel", async () => {
      // Given & When: 途中でキャンセル
      const { result } = renderHook(() => useStreamingChat());

      await act(async () => {
        await result.current.sendStreamingMessage(validRequest);
      });

      act(() => {
        emitStreamChunk({ requestId: currentRequestId, content: "Partial" });
      });

      await act(async () => {
        await result.current.cancelStream();
      });

      // Then: 途中コンテンツが保持される
      const lastMessage = result.current.messages.at(-1);
      expect(lastMessage?.content).toContain("Partial");
      expect(lastMessage?.content).toContain("[中断]");
    });
  });

  describe("リソースクリーンアップ", () => {
    it("should cleanup event listeners on unmount", () => {
      const { unmount } = renderHook(() => useStreamingChat());

      // Given: イベントリスナーが登録されている
      expect(window.llmAPI.onStreamChunk).toHaveBeenCalled();

      // When: アンマウント
      unmount();

      // Then: クリーンアップ関数が呼ばれる
      expect(cleanupFunctions).toHaveBeenCalled();
    });

    it("should cleanup AbortController on stream end", async () => {
      const mockEvent = createMockEvent();
      const { requestId } = await handleStreamChat(mockEvent, validRequest);

      // ストリーム完了後
      expect(activeStreams.has(requestId)).toBe(false);
    });
  });
});
```

### 2.5 状態同期テスト（\*.sync.test.ts）

#### シナリオ: isStreaming状態、UIリアルタイム更新

```typescript
// apps/desktop/src/renderer/__tests__/streaming-sync.test.ts

describe("Streaming State Sync", () => {
  describe("isStreaming状態同期", () => {
    it("should sync isStreaming state across components", async () => {
      // Given: チャットストア
      const { result: storeResult } = renderHook(() => useChatStore());
      const { result: hookResult } = renderHook(() => useStreamingChat());

      // When: ストリーミング開始
      await act(async () => {
        await hookResult.current.sendStreamingMessage(validRequest);
      });

      // Then: ストアの状態が同期される
      expect(storeResult.current.streaming.isStreaming).toBe(true);
      expect(hookResult.current.isStreaming).toBe(true);
    });

    it("should sync streamingContent with UI", () => {
      const { result } = renderHook(() => useStreamingChat());

      render(
        <StreamingMessage
          content={result.current.streamingContent}
          isStreaming={result.current.isStreaming}
        />
      );

      act(() => {
        emitStreamChunk({ requestId: currentRequestId, content: "Hello" });
      });

      // UIが更新される
      expect(screen.getByText(/Hello/)).toBeInTheDocument();
    });
  });

  describe("UIリアルタイム更新", () => {
    it("should update UI within 16ms per chunk", async () => {
      const chunks = Array(100)
        .fill(null)
        .map((_, i) => `chunk${i}`);

      const startTime = performance.now();

      for (const chunk of chunks) {
        act(() => {
          emitStreamChunk({ requestId: currentRequestId, content: chunk });
        });
      }

      const endTime = performance.now();
      const avgTimePerChunk = (endTime - startTime) / chunks.length;

      expect(avgTimePerChunk).toBeLessThan(16); // 60fps
    });
  });
});
```

---

## 3. テスト環境構成

### 3.1 モック構成

```typescript
// apps/desktop/src/test/mocks/streaming.ts

/**
 * SSEレスポンス生成ヘルパー
 */
export function createSSEResponse(chunks: StreamChunk[]): HttpResponse {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        const data = JSON.stringify({ choices: [{ delta: chunk.delta }] });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new HttpResponse(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

/**
 * IPCイベントシミュレーター
 */
export function emitStreamChunk(data: {
  requestId: string;
  content: string;
}): void {
  const listeners = getStreamChunkListeners();
  listeners.forEach((listener) =>
    listener({
      requestId: data.requestId,
      chunk: { type: "content", content: data.content },
      timestamp: Date.now(),
    }),
  );
}

export function emitStreamEnd(data: { requestId: string }): void {
  const listeners = getStreamEndListeners();
  listeners.forEach((listener) =>
    listener({
      requestId: data.requestId,
      response: { content: "", model: "gpt-4o" },
      durationMs: 1000,
    }),
  );
}

export function emitStreamError(data: {
  requestId: string;
  error: LLMError;
}): void {
  const listeners = getStreamErrorListeners();
  listeners.forEach((listener) =>
    listener({
      requestId: data.requestId,
      error: data.error,
    }),
  );
}
```

### 3.2 プロバイダー別MSWハンドラー

```typescript
// apps/desktop/src/test/mocks/handlers/streaming.ts

export const streamingHandlers = [
  // OpenAI
  http.post("https://api.openai.com/v1/chat/completions", ({ request }) =>
    handleOpenAIStream(request),
  ),

  // Anthropic
  http.post("https://api.anthropic.com/v1/messages", ({ request }) =>
    handleAnthropicStream(request),
  ),

  // Google
  http.post(
    "https://generativelanguage.googleapis.com/v1beta/models/:model:streamGenerateContent",
    ({ request }) => handleGoogleStream(request),
  ),

  // xAI
  http.post("https://api.x.ai/v1/chat/completions", ({ request }) =>
    handleXAIStream(request),
  ),
];

async function handleOpenAIStream(request: Request): Promise<HttpResponse> {
  const body = (await request.json()) as { stream?: boolean };

  if (body.stream) {
    return createSSEResponse([
      { delta: { content: "Hello" } },
      { delta: { content: " from" } },
      { delta: { content: " OpenAI" } },
    ]);
  }

  return HttpResponse.json({
    choices: [{ message: { content: "Hello from OpenAI" } }],
  });
}
```

---

## 4. テストファイル一覧

| ファイル                                                                  | シナリオ           | テスト数 |
| ------------------------------------------------------------------------- | ------------------ | -------- |
| `apps/desktop/src/main/handlers/__tests__/llm-stream.integration.test.ts` | API接続            | 5        |
| `apps/desktop/src/renderer/__tests__/streaming-flow.test.ts`              | データフロー       | 6        |
| `apps/desktop/src/__tests__/streaming-error.integration.test.ts`          | エラーハンドリング | 8        |
| `apps/desktop/src/__tests__/streaming-cancel.integration.test.ts`         | キャンセル         | 5        |
| `apps/desktop/src/renderer/__tests__/streaming-sync.test.ts`              | 状態同期           | 4        |

**統合テスト合計: 28件**

---

## 5. 実行コマンド

```bash
# 統合テストのみ実行
pnpm --filter @repo/desktop test --grep "integration"

# 特定シナリオのみ
pnpm --filter @repo/desktop test streaming-flow
pnpm --filter @repo/desktop test streaming-error
pnpm --filter @repo/desktop test streaming-cancel

# カバレッジ付き
pnpm --filter @repo/desktop test --coverage --grep "integration"
```

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-23 | 初版作成 |
