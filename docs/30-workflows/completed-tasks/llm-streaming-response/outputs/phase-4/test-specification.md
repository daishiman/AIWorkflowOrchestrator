# Phase 4: テスト仕様書

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| タスクID   | UT-LLM-STREAM-001 |
| Phase      | 4                 |
| 作成日     | 2026-01-23        |
| ステータス | 完了              |

---

## 1. テスト方針

### 1.1 TDD原則

本フェーズはTDD（Test Driven Development）のRed状態を目指す。

- すべてのテストは実装前に作成
- テストは失敗状態（Red）で完了
- 受け入れ基準（AC）ごとにテストを作成

### 1.2 テストレベル

| レベル         | 対象                  | ツール                   |
| -------------- | --------------------- | ------------------------ |
| ユニット       | Adapter、Slice、Hooks | Vitest                   |
| コンポーネント | UI Components         | Vitest + Testing Library |
| 統合           | IPC通信、データフロー | Vitest + MSW             |

### 1.3 テストカバレッジ目標

| カテゴリ       | 目標カバレッジ |
| -------------- | -------------- |
| ブランチ       | 80%以上        |
| ステートメント | 85%以上        |
| 関数           | 90%以上        |

---

## 2. テスト対象コンポーネント

### 2.1 Main Process層

| コンポーネント     | ファイル                                                 | テスト内容                  |
| ------------------ | -------------------------------------------------------- | --------------------------- |
| handleStreamChat   | `apps/desktop/src/main/handlers/llm.ts`                  | IPCストリーミングハンドラー |
| handleStreamCancel | `apps/desktop/src/main/handlers/llm.ts`                  | キャンセルハンドラー        |
| BaseLLMAdapter     | `apps/desktop/src/main/adapters/llm/BaseLLMAdapter.ts`   | ストリーミング共通処理      |
| OpenAIAdapter      | `apps/desktop/src/main/adapters/llm/OpenAIAdapter.ts`    | OpenAI SSE処理              |
| AnthropicAdapter   | `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` | Anthropic SSE処理           |
| GoogleAdapter      | `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`    | Google SSE処理              |
| xAIAdapter         | `apps/desktop/src/main/adapters/llm/xAIAdapter.ts`       | xAI SSE処理                 |

### 2.2 Renderer Process層

| コンポーネント   | ファイル                                                     | テスト内容             |
| ---------------- | ------------------------------------------------------------ | ---------------------- |
| StreamingMessage | `apps/desktop/src/renderer/components/chat/StreamingMessage` | ストリーミング表示     |
| ChatSlice        | `apps/desktop/src/renderer/store/slices/chatSlice.ts`        | 状態管理               |
| useStreamingChat | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`        | イベント購読・状態同期 |

---

## 3. テスト環境設定

### 3.1 Vitest設定

```typescript
// vitest.config.ts (関連部分)
export default defineConfig({
  test: {
    environment: "node", // Main Processテスト用
    environmentMatchGlobs: [
      ["**/renderer/**", "jsdom"], // Rendererテスト用
    ],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/node_modules/**", "**/test/**"],
    },
  },
});
```

### 3.2 MSWセットアップ

```typescript
// src/test/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

// src/test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  // OpenAI ストリーミングモック
  http.post("https://api.openai.com/v1/chat/completions", ({ request }) => {
    const body = await request.json();
    if (body.stream) {
      return createSSEResponse([
        { delta: { content: "Hello" } },
        { delta: { content: " world" } },
      ]);
    }
    return HttpResponse.json({
      /* ... */
    });
  }),
  // 他プロバイダーも同様
];
```

### 3.3 IPC モック

```typescript
// src/test/mocks/ipc.ts
export const createMockEvent = () => ({
  sender: {
    send: vi.fn(),
    isDestroyed: () => false,
  },
});

export const createMockAbortController = () => ({
  signal: { aborted: false },
  abort: vi.fn(),
});
```

---

## 4. テスト設計パターン

### 4.1 ストリーミングテストパターン

```typescript
// パターン: AsyncGenerator のテスト
describe("streamChat", () => {
  it("should yield chunks from SSE stream", async () => {
    // Given: SSEレスポンスをモック
    server.use(
      http.post("/api/completions", () => createSSEResponse(mockChunks)),
    );

    // When: ストリーミング実行
    const chunks: StreamChunk[] = [];
    for await (const chunk of adapter.streamChat(request)) {
      chunks.push(chunk);
    }

    // Then: チャンクを検証
    expect(chunks).toHaveLength(expectedLength);
  });
});
```

### 4.2 IPCイベントテストパターン

```typescript
// パターン: IPC send/on のテスト
describe("handleStreamChat", () => {
  it("should emit chunk events", async () => {
    // Given: モックイベント
    const mockEvent = createMockEvent();

    // When: ハンドラー実行
    await handleStreamChat(mockEvent, request);

    // Then: イベント発火を検証
    expect(mockEvent.sender.send).toHaveBeenCalledWith(
      "llm:stream-chunk",
      expect.objectContaining({ delta: expect.any(Object) }),
    );
  });
});
```

### 4.3 キャンセルテストパターン

```typescript
// パターン: AbortController のテスト
describe("cancelStream", () => {
  it("should abort active stream", async () => {
    // Given: アクティブなストリーム
    const abortController = new AbortController();
    activeStreams.set(requestId, { abortController });

    // When: キャンセル実行
    await handleStreamCancel(event, requestId);

    // Then: abort が呼ばれる
    expect(abortController.signal.aborted).toBe(true);
  });
});
```

### 4.4 UIコンポーネントテストパターン

```typescript
// パターン: ストリーミング状態のテスト
describe('StreamingMessage', () => {
  it('should show cursor when streaming', () => {
    // Given: ストリーミング中
    render(<StreamingMessage content="Hello" isStreaming={true} />);

    // Then: カーソルが表示される
    expect(screen.getByLabelText('入力中')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button clicked', async () => {
    // Given: キャンセルコールバック
    const onCancel = vi.fn();
    render(
      <StreamingMessage
        content="Hello"
        isStreaming={true}
        onCancel={onCancel}
      />
    );

    // When: キャンセルボタンをクリック
    await userEvent.click(screen.getByRole('button', { name: /停止/i }));

    // Then: コールバックが呼ばれる
    expect(onCancel).toHaveBeenCalled();
  });
});
```

---

## 5. 境界値テスト

### 5.1 入力境界値

| 項目         | 境界値          | テスト内容                 |
| ------------ | --------------- | -------------------------- |
| メッセージ長 | 0文字           | 空文字列でのストリーミング |
| メッセージ長 | 100,000文字     | 長文でのストリーミング     |
| チャンク数   | 1チャンク       | 最小チャンク数             |
| チャンク数   | 10,000チャンク  | 大量チャンク処理           |
| 特殊文字     | Unicode、絵文字 | 文字エンコーディング       |
| マルチバイト | 日本語、中国語  | マルチバイト文字処理       |

### 5.2 タイミング境界値

| 項目         | 境界値   | テスト内容       |
| ------------ | -------- | ---------------- |
| レイテンシ   | 0ms      | 即時応答         |
| レイテンシ   | 60,000ms | タイムアウト直前 |
| チャンク間隔 | 0ms      | 連続チャンク     |
| チャンク間隔 | 30,000ms | 遅延チャンク     |

---

## 6. エラーシナリオテスト

### 6.1 ネットワークエラー

| シナリオ           | 期待動作                      |
| ------------------ | ----------------------------- |
| 接続失敗           | NETWORK_ERRORイベント発火     |
| ストリーム途中切断 | 途中応答保持 + エラーイベント |
| DNS解決失敗        | NETWORK_ERRORイベント発火     |

### 6.2 APIエラー

| シナリオ                | 期待動作                          |
| ----------------------- | --------------------------------- |
| 401 Unauthorized        | API_KEY_INVALIDイベント発火       |
| 429 Too Many Requests   | RATE_LIMITイベント + retryAfterMs |
| 500 Server Error        | SERVICE_UNAVAILABLEイベント発火   |
| 503 Service Unavailable | SERVICE_UNAVAILABLEイベント発火   |

### 6.3 コンテンツエラー

| シナリオ             | 期待動作                            |
| -------------------- | ----------------------------------- |
| コンテンツフィルター | CONTENT_FILTERイベント発火          |
| コンテキスト超過     | CONTEXT_LENGTH_EXCEEDEDイベント発火 |
| 不正JSON             | パースエラー処理                    |

---

## 7. テストファイル構成

```
apps/desktop/src/
├── main/
│   ├── adapters/llm/__tests__/
│   │   └── streaming.test.ts          # Adapterストリーミングテスト
│   └── handlers/__tests__/
│       └── llm-stream.test.ts          # IPCハンドラーテスト
├── renderer/
│   ├── components/chat/__tests__/
│   │   └── StreamingMessage.test.tsx   # UIコンポーネントテスト
│   ├── store/slices/__tests__/
│   │   └── chatSlice.streaming.test.ts # Sliceストリーミングテスト
│   └── hooks/__tests__/
│       └── useStreamingChat.test.ts    # Hookテスト
└── test/
    ├── mocks/
    │   ├── server.ts                   # MSWサーバー
    │   ├── handlers.ts                 # APIハンドラー
    │   └── ipc.ts                      # IPCモック
    └── fixtures/
        └── streaming.ts                # テストフィクスチャ
```

---

## 8. テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# ストリーミング関連テストのみ
pnpm --filter @repo/desktop test streaming

# カバレッジ付き
pnpm --filter @repo/desktop test --coverage

# ウォッチモード
pnpm --filter @repo/desktop test --watch
```

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-23 | 初版作成 |
