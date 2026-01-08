# 統合テストシナリオ - チャット内LLMモデル切り替え機能

## メタ情報

| 項目   | 内容                     |
| ------ | ------------------------ |
| 機能名 | chat-multi-llm-switching |
| Phase  | 4                        |
| 作成日 | 2026-01-07               |
| 対応AC | AC-017 〜 AC-020         |
| 作成者 | Claude (AI)              |

---

## 1. 統合テストカテゴリ

### 1.1 テスト範囲

| カテゴリ               | 範囲                         | 対応AC         |
| ---------------------- | ---------------------------- | -------------- |
| IPC通信統合            | Main ↔ Renderer 間の通信     | AC-017, AC-019 |
| プロバイダー統合       | LLMAdapter ↔ LLMService 連携 | AC-018         |
| 状態同期統合           | Store ↔ UI ↔ IPC 連携        | AC-017, AC-020 |
| エラーハンドリング統合 | エラー発生 → UI表示 → 回復   | AC-009〜AC-012 |

### 1.2 統合境界

```
┌──────────────────────────────────────────────────────────────────┐
│                        Renderer Process                          │
│  ┌────────────┐    ┌────────────┐    ┌────────────────────────┐ │
│  │ LLMSelector│───▶│ llmSlice   │───▶│ IPC Preload Bridge     │ │
│  │ Component  │◀───│ chatSlice  │◀───│ (contextBridge)        │ │
│  └────────────┘    └────────────┘    └──────────┬─────────────┘ │
│                                                  │               │
├──────────────────────────────────────────────────┼───────────────┤
│                        IPC Boundary              │               │
├──────────────────────────────────────────────────┼───────────────┤
│                                                  ▼               │
│                         Main Process                             │
│  ┌────────────────────────┐    ┌──────────────────────────────┐ │
│  │ IPC Handlers           │───▶│ LLMService                   │ │
│  │ (ipcMain.handle)       │◀───│ (LLMAdapterFactory)          │ │
│  └────────────────────────┘    └──────────────────────────────┘ │
│                                          │                       │
│                                          ▼                       │
│                               ┌──────────────────────────────┐  │
│                               │ LLM Adapters                 │  │
│                               │ (OpenAI, Anthropic, etc.)    │  │
│                               └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. IPC通信統合シナリオ

### IT-001: プロバイダー一覧取得フロー

**対応AC**: AC-017

**シナリオ**:

```gherkin
Scenario: アプリ起動時のプロバイダー一覧取得
  Given アプリケーションが起動している
  When Rendererプロセスが llm:getProviders を呼び出す
  Then Mainプロセスが利用可能なプロバイダー一覧を返す
  And Rendererの llmSlice.providers が更新される
  And LLMSelectorコンポーネントにプロバイダーが表示される
```

**検証ポイント**:

```typescript
// integration/ipc-providers.test.ts

describe('IT-001: プロバイダー一覧取得フロー', () => {
  it('should fetch providers and update store', async () => {
    // Arrange
    const mockProviders = [mockProviders.openai, mockProviders.anthropic];
    ipcMain.handle('llm:getProviders', () => mockProviders);

    // Act
    const result = await ipcRenderer.invoke('llm:getProviders');

    // Assert
    expect(result).toEqual(mockProviders);
    expect(llmStore.getState().providers).toEqual(mockProviders);
  });

  it('should display providers in LLMSelector', async () => {
    // Arrange & Act
    render(<LLMSelector />);
    await waitFor(() => {
      expect(screen.getByText('OpenAI')).toBeInTheDocument();
      expect(screen.getByText('Anthropic')).toBeInTheDocument();
    });
  });
});
```

---

### IT-002: ストリーミングチャットフロー

**対応AC**: AC-019

**シナリオ**:

```gherkin
Scenario: ストリーミングレスポンスの受信と表示
  Given ユーザーがメッセージを入力している
  And OpenAI GPT-4oが選択されている
  When ユーザーがメッセージを送信する
  Then Rendererが llm:streamChat を呼び出す
  And Mainがストリーミングレスポンスを開始する
  And llm:stream:{requestId} イベントでチャンクが送信される
  And chatSliceのstreamingMessageが逐次更新される
  And UIにリアルタイムでテキストが表示される
  And 完了時に isStreaming が false になる
```

**検証ポイント**:

```typescript
// integration/ipc-streaming.test.ts

describe('IT-002: ストリーミングチャットフロー', () => {
  it('should stream response and update UI in real-time', async () => {
    // Arrange
    const chunks = [
      { type: 'content', content: 'Hello', index: 0 },
      { type: 'content', content: ' world', index: 1 },
      { type: 'done', usage: { promptTokens: 5, completionTokens: 2, totalTokens: 7 } },
    ];

    // Act
    chatStore.actions.sendMessage('Test message');

    // Simulate streaming
    for (const chunk of chunks) {
      await emitIPCEvent(`llm:stream:${requestId}`, chunk);
      await tick();
    }

    // Assert
    const conversation = chatStore.getState().conversations[conversationId];
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    expect(lastMessage.content).toBe('Hello world');
    expect(chatStore.getState().isStreaming).toBe(false);
  });

  it('should display streaming indicator during response', async () => {
    // Arrange
    render(<ChatView />);

    // Act
    await userEvent.type(screen.getByRole('textbox'), 'Test message');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    // Assert - streaming indicator visible
    await waitFor(() => {
      expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument();
    });

    // Complete streaming
    await emitIPCEvent(`llm:stream:${requestId}`, { type: 'done' });

    // Assert - streaming indicator removed
    await waitFor(() => {
      expect(screen.queryByTestId('streaming-indicator')).not.toBeInTheDocument();
    });
  });
});
```

---

### IT-003: ストリームキャンセルフロー

**対応AC**: AC-019

**シナリオ**:

```gherkin
Scenario: ストリーミング中のキャンセル
  Given ストリーミングレスポンスを受信中
  When ユーザーがキャンセルボタンをクリックする
  Then Rendererが llm:cancelStream を呼び出す
  And Mainがストリーミングを停止する
  And chatSlice.isStreaming が false になる
  And 受信済みのテキストは保持される
```

**検証ポイント**:

```typescript
// integration/ipc-cancel-stream.test.ts

describe("IT-003: ストリームキャンセルフロー", () => {
  it("should cancel stream and preserve partial content", async () => {
    // Arrange
    chatStore.setState({
      isStreaming: true,
      streamingMessageId: "msg-1",
      conversations: {
        "conv-1": {
          messages: [
            { id: "msg-1", role: "assistant", content: "Partial content..." },
          ],
        },
      },
    });

    // Act
    await chatStore.actions.cancelStream("req-1");

    // Assert
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(
      "llm:cancelStream",
      "req-1",
    );
    expect(chatStore.getState().isStreaming).toBe(false);
    expect(
      chatStore.getState().conversations["conv-1"].messages[0].content,
    ).toBe("Partial content...");
  });
});
```

---

## 3. プロバイダー統合シナリオ

### IT-004: プロバイダー切り替えフロー

**対応AC**: AC-018

**シナリオ**:

```gherkin
Scenario: 会話中のプロバイダー切り替え
  Given OpenAI GPT-4oで会話中
  And 会話履歴に2つのメッセージがある
  When ユーザーがAnthropicのClaude Sonnet 4に切り替える
  Then llmSlice.selectedProviderId が 'anthropic' に更新される
  And llmSlice.selectedModelId が 'claude-sonnet-4-20250514' に更新される
  And 次のメッセージはAnthropicアダプターで処理される
  And メッセージにはAnthropicのLLM情報が付与される
```

**検証ポイント**:

```typescript
// integration/provider-switching.test.ts

describe('IT-004: プロバイダー切り替えフロー', () => {
  it('should switch provider and send message with new provider', async () => {
    // Arrange - Start with OpenAI
    llmStore.setState({
      selectedProviderId: 'openai',
      selectedModelId: 'gpt-4o',
    });

    // Act - Switch to Anthropic
    llmStore.actions.selectProvider('anthropic');

    // Assert - Provider changed
    expect(llmStore.getState().selectedProviderId).toBe('anthropic');
    expect(llmStore.getState().selectedModelId).toBe('claude-sonnet-4-20250514');

    // Act - Send message
    await chatStore.actions.sendMessage('Hello after switch');

    // Assert - Message uses new provider
    const lastRequest = mockIPCHandlers['llm:streamChat'].mock.calls[0][0];
    expect(lastRequest.providerId).toBe('anthropic');
    expect(lastRequest.modelId).toBe('claude-sonnet-4-20250514');
  });

  it('should display correct LLM info on each message', async () => {
    // Arrange
    const conversation = multiProviderConversationState.conversations['conv-multi'];

    // Act
    render(<ConversationView conversation={conversation} />);

    // Assert - Each message shows its LLM info
    const messages = screen.getAllByTestId('message-llm-badge');
    expect(messages[0]).toHaveTextContent('GPT-4o');
    expect(messages[2]).toHaveTextContent('Claude Sonnet 4');
    expect(messages[4]).toHaveTextContent('Gemini 2.0 Flash');
  });
});
```

---

### IT-005: モデル切り替えフロー

**対応AC**: AC-018

**シナリオ**:

```gherkin
Scenario: 同一プロバイダー内でのモデル切り替え
  Given OpenAI GPT-4oが選択されている
  When ユーザーがGPT-4o miniに切り替える
  Then llmSlice.selectedModelId が 'gpt-4o-mini' に更新される
  And selectedProviderIdは 'openai' のまま
  And 次のメッセージはGPT-4o miniで処理される
```

**検証ポイント**:

```typescript
// integration/model-switching.test.ts

describe("IT-005: モデル切り替えフロー", () => {
  it("should switch model within same provider", async () => {
    // Arrange
    llmStore.setState({
      selectedProviderId: "openai",
      selectedModelId: "gpt-4o",
    });

    // Act
    llmStore.actions.selectModel("gpt-4o-mini");

    // Assert
    expect(llmStore.getState().selectedProviderId).toBe("openai");
    expect(llmStore.getState().selectedModelId).toBe("gpt-4o-mini");

    // Send message and verify
    await chatStore.actions.sendMessage("Test");
    const request = mockIPCHandlers["llm:streamChat"].mock.calls[0][0];
    expect(request.modelId).toBe("gpt-4o-mini");
  });
});
```

---

## 4. 状態同期統合シナリオ

### IT-006: ヘルスチェック状態同期

**対応AC**: AC-020

**シナリオ**:

```gherkin
Scenario: ヘルスチェック結果のUI反映
  Given 4つのプロバイダーが設定されている
  When ヘルスチェックが実行される
  Then 各プロバイダーの healthStatus が更新される
  And LLMSelectorに健全性ステータスが表示される
  And 異常なプロバイダーは警告アイコンが表示される
```

**検証ポイント**:

```typescript
// integration/health-check-sync.test.ts

describe('IT-006: ヘルスチェック状態同期', () => {
  it('should sync health check results to UI', async () => {
    // Arrange
    const healthResults = {
      openai: { isHealthy: true, latency: 150 },
      anthropic: { isHealthy: false, error: 'Rate limit' },
      google: { isHealthy: true, latency: 200 },
      xai: { isHealthy: true, latency: 180 },
    };

    // Act
    await llmStore.actions.checkAllHealth();

    // Assert - Store updated
    Object.entries(healthResults).forEach(([providerId, expected]) => {
      const actual = llmStore.getState().healthStatus[providerId];
      expect(actual.isHealthy).toBe(expected.isHealthy);
    });

    // Assert - UI reflects status
    render(<LLMSelector />);
    expect(screen.getByTestId('provider-openai-status')).toHaveClass('healthy');
    expect(screen.getByTestId('provider-anthropic-status')).toHaveClass('unhealthy');
    expect(screen.getByTestId('provider-anthropic-warning')).toBeInTheDocument();
  });
});
```

---

### IT-007: 選択状態の永続化と復元

**対応AC**: AC-020

**シナリオ**:

```gherkin
Scenario: 選択状態の永続化
  Given OpenAI GPT-4oが選択されている
  When アプリケーションを再起動する
  Then 以前の選択状態が復元される
  And LLMSelectorにOpenAI GPT-4oが選択状態で表示される
```

**検証ポイント**:

```typescript
// integration/state-persistence.test.ts

describe("IT-007: 選択状態の永続化と復元", () => {
  it("should persist and restore selection state", async () => {
    // Arrange - Set selection
    llmStore.actions.selectProvider("anthropic");
    llmStore.actions.selectModel("claude-opus-4-20250514");

    // Act - Simulate app restart (read from storage)
    const persistedState = JSON.parse(
      localStorage.getItem("llm-state") || "{}",
    );

    // Assert - State persisted
    expect(persistedState.selectedProviderId).toBe("anthropic");
    expect(persistedState.selectedModelId).toBe("claude-opus-4-20250514");

    // Act - Create new store (restore)
    const newStore = createLLMStore();

    // Assert - State restored
    expect(newStore.getState().selectedProviderId).toBe("anthropic");
    expect(newStore.getState().selectedModelId).toBe("claude-opus-4-20250514");
  });
});
```

---

## 5. エラーハンドリング統合シナリオ

### IT-008: API キーエラーフロー

**対応AC**: AC-009

**シナリオ**:

```gherkin
Scenario: 無効なAPIキーでのエラーハンドリング
  Given OpenAIのAPIキーが無効
  When ユーザーがメッセージを送信する
  Then LLM_INVALID_API_KEY エラーが発生する
  And chatSliceにエラーが設定される
  And UIにエラーメッセージが表示される
  And 設定画面へのリンクが表示される
```

**検証ポイント**:

```typescript
// integration/error-handling.test.ts

describe('IT-008: APIキーエラーフロー', () => {
  it('should handle invalid API key error and show UI', async () => {
    // Arrange
    const error = {
      code: 'LLM_INVALID_API_KEY',
      message: 'Invalid API key provided',
    };
    mockAdapter.chat.mockRejectedValue(error);

    // Act
    render(<ChatView />);
    await userEvent.type(screen.getByRole('textbox'), 'Test');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid API key');
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    });
  });
});
```

---

### IT-009: レートリミットエラーとリトライ

**対応AC**: AC-010

**シナリオ**:

```gherkin
Scenario: レートリミットエラーと自動リトライ
  Given OpenAIのレートリミットに達している
  When ユーザーがメッセージを送信する
  Then LLM_RATE_LIMIT エラーが発生する
  And 自動的にリトライが開始される
  And UIにリトライ中の表示がされる
  And リトライ成功時にレスポンスが表示される
```

**検証ポイント**:

```typescript
// integration/retry-handling.test.ts

describe('IT-009: レートリミットエラーとリトライ', () => {
  it('should retry on rate limit and show retry indicator', async () => {
    // Arrange
    const rateLimitError = { code: 'LLM_RATE_LIMIT', retryAfter: 1 };
    mockAdapter.chat
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce({ content: 'Success after retry' });

    // Act
    render(<ChatView />);
    await userEvent.type(screen.getByRole('textbox'), 'Test');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    // Assert - Retry indicator shown
    await waitFor(() => {
      expect(screen.getByText(/retrying/i)).toBeInTheDocument();
    });

    // Wait for retry
    await waitFor(() => {
      expect(screen.queryByText(/retrying/i)).not.toBeInTheDocument();
      expect(screen.getByText('Success after retry')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
```

---

### IT-010: ネットワークエラーからの回復

**対応AC**: AC-011

**シナリオ**:

```gherkin
Scenario: ネットワークエラーからの回復
  Given ネットワーク接続が切断されている
  When ユーザーがメッセージを送信する
  Then LLM_NETWORK_ERROR エラーが発生する
  And UIにオフライン表示がされる
  And ネットワーク回復後に再送信ボタンが有効になる
  And 再送信で正常にレスポンスが取得できる
```

**検証ポイント**:

```typescript
// integration/network-recovery.test.ts

describe('IT-010: ネットワークエラーからの回復', () => {
  it('should recover from network error with retry', async () => {
    // Arrange
    const networkError = { code: 'LLM_NETWORK_ERROR', message: 'Network unavailable' };
    mockAdapter.chat
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce({ content: 'Response after recovery' });

    // Act
    render(<ChatView />);
    await userEvent.type(screen.getByRole('textbox'), 'Test');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    // Assert - Error shown
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    // Act - Retry
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    // Assert - Success
    await waitFor(() => {
      expect(screen.getByText('Response after recovery')).toBeInTheDocument();
    });
  });
});
```

---

## 6. E2Eシナリオ（将来の手動テスト用）

### E2E-001: 完全なチャットフロー

```gherkin
Scenario: マルチプロバイダーチャットセッション
  Given アプリケーションが起動している
  And OpenAI, Anthropic のAPIキーが設定済み

  When ユーザーが新しい会話を開始する
  And OpenAI GPT-4oで「Hello」と送信する
  Then GPT-4oからの応答が表示される
  And メッセージにOpenAIのバッジが表示される

  When ユーザーがAnthropicに切り替える
  And Claude Sonnet 4で「Continue the conversation」と送信する
  Then Claude Sonnet 4からの応答が表示される
  And メッセージにAnthropicのバッジが表示される

  When 会話履歴を確認する
  Then 各メッセージに正しいLLM情報が表示されている
```

### E2E-002: エラー回復フロー

```gherkin
Scenario: APIエラーからの回復
  Given OpenAIが選択されている
  And APIキーが期限切れ

  When ユーザーがメッセージを送信する
  Then エラーメッセージが表示される
  And 設定へのリンクが表示される

  When ユーザーが設定画面でAPIキーを更新する
  And チャット画面に戻る
  And 再度メッセージを送信する
  Then 正常にレスポンスが取得される
```

---

## 7. テスト実行設定

### 7.1 セットアップ

```typescript
// tests/integration/setup.ts

import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { createMockIPCHandlers, MockIPCEventEmitter } from "../mocks";
import { createTestLLMStore, createTestChatStore } from "../helpers";

let llmStore: ReturnType<typeof createTestLLMStore>;
let chatStore: ReturnType<typeof createTestChatStore>;
let mockIPCHandlers: ReturnType<typeof createMockIPCHandlers>;
let ipcEmitter: MockIPCEventEmitter;

beforeAll(() => {
  // グローバルモック設定
  mockIPCHandlers = createMockIPCHandlers();
  ipcEmitter = new MockIPCEventEmitter();

  // IPC invoke mock
  vi.mock("electron", () => ({
    ipcRenderer: {
      invoke: vi.fn((channel, ...args) => mockIPCHandlers[channel]?.(...args)),
      on: (channel: string, cb: Function) => ipcEmitter.on(channel, cb),
      off: (channel: string, cb: Function) => ipcEmitter.off(channel, cb),
    },
  }));
});

beforeEach(() => {
  llmStore = createTestLLMStore();
  chatStore = createTestChatStore();
  vi.clearAllMocks();
});

afterEach(() => {
  llmStore.reset();
  chatStore.reset();
  ipcEmitter.clear();
});

afterAll(() => {
  vi.restoreAllMocks();
});

export { llmStore, chatStore, mockIPCHandlers, ipcEmitter };
```

### 7.2 テスト実行コマンド

```bash
# 統合テストのみ実行
pnpm --filter @repo/desktop test:integration

# 特定シナリオ実行
pnpm --filter @repo/desktop test:integration --grep "IT-001"

# カバレッジ付き実行
pnpm --filter @repo/desktop test:integration --coverage
```

---

## 8. 完了条件チェックリスト

### 統合テスト観点（AC-017〜AC-020）

| AC     | シナリオ | 検証内容                       | 状態     |
| ------ | -------- | ------------------------------ | -------- |
| AC-017 | IT-001   | IPC経由でプロバイダー一覧取得  | 設計完了 |
| AC-017 | IT-002   | ストリーミングレスポンスの受信 | 設計完了 |
| AC-018 | IT-004   | プロバイダー切り替え時の連携   | 設計完了 |
| AC-018 | IT-005   | モデル切り替え時の連携         | 設計完了 |
| AC-019 | IT-002   | ストリーミング状態の同期       | 設計完了 |
| AC-019 | IT-003   | ストリームキャンセルの処理     | 設計完了 |
| AC-020 | IT-006   | ヘルスチェック状態の同期       | 設計完了 |
| AC-020 | IT-007   | 選択状態の永続化               | 設計完了 |

### エラーハンドリング観点（AC-009〜AC-012）

| AC     | シナリオ | 検証内容                     | 状態     |
| ------ | -------- | ---------------------------- | -------- |
| AC-009 | IT-008   | APIキーエラーのUI表示        | 設計完了 |
| AC-010 | IT-009   | レートリミットの自動リトライ | 設計完了 |
| AC-011 | IT-010   | ネットワークエラーからの回復 | 設計完了 |
| AC-012 | IT-008   | エラー時のフォールバック     | 設計完了 |

---

## 9. 関連ドキュメント

| ドキュメント     | パス                                     |
| ---------------- | ---------------------------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`  |
| テストデータ設計 | `outputs/phase-4/test-data-design.md`    |
| テストダブル設計 | `outputs/phase-4/test-doubles-design.md` |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md` |

---

## 10. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-07 | 初版作成 |
