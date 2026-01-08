# Phase 4: 統合テスト設計

## 文書情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| タスクID   | TASK-LLM-UI-IPC-ADAPTER-001 |
| Phase      | 4                           |
| 作成日     | 2026-01-09                  |
| 適用スキル | integration-testing         |

---

## 1. 統合テスト概要

### 1.1 テスト対象レイヤー

```
┌─────────────────────────────────────────────────────┐
│                 Renderer Process                     │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │ UI Components   │→→│ llmSlice (State)         │  │
│  │ (LLMSelector)   │  │ - providers              │  │
│  └────────┬────────┘  │ - selectedProviderId     │  │
│           │           │ - healthStatus           │  │
│           │           └───────────┬──────────────┘  │
│           └───────────────────────┼─────────────────│
├───────────────────────────────────┼─────────────────┤
│                 Preload API       │                  │
│  ┌────────────────────────────────┴─────────────────┐
│  │ window.electronAPI.llm.*                          │
│  │ - getProviders()                                  │
│  │ - checkHealth(providerId)                         │
│  │ - sendChat(request)                               │
│  │ - streamChat(request)                             │
│  └────────────────────────────────┬─────────────────┘
├───────────────────────────────────┼─────────────────┤
│                 Main Process      │                  │
│  ┌────────────────────────────────┴─────────────────┐
│  │ IPC Handlers                                      │
│  │ - handleGetProviders()                            │
│  │ - handleCheckHealth()                             │
│  │ - handleSendChat()                                │
│  │ - handleStreamChat()                              │
│  └────────────────────────────────┬─────────────────┘
│  ┌────────────────────────────────┴─────────────────┐
│  │ LLM Adapters                                      │
│  │ - OpenAIAdapter                                   │
│  │ - AnthropicAdapter                                │
│  │ - GoogleAdapter                                   │
│  │ - xAIAdapter                                      │
│  └────────────────────────────────┬─────────────────┘
└───────────────────────────────────┼─────────────────┘
                                    │
┌───────────────────────────────────┴─────────────────┐
│                 External APIs                        │
│  OpenAI / Anthropic / Google AI / xAI               │
└─────────────────────────────────────────────────────┘
```

### 1.2 統合テストスコープ

| レベル | 対象                            | テストファイル            |
| ------ | ------------------------------- | ------------------------- |
| L1     | UI ↔ State (llmSlice)           | `llm.sync.test.ts`        |
| L2     | State ↔ Preload API             | `llm.flow.test.ts`        |
| L3     | Preload ↔ IPC Handler           | `llm.integration.test.ts` |
| L4     | Handler ↔ Adapter               | `llm.integration.test.ts` |
| L5     | Adapter ↔ External API (mocked) | `llm.auth.test.ts`        |
| E2E    | 全レイヤー                      | `llm.e2e.test.ts`         |

---

## 2. 統合テストシナリオ

### 2.1 API接続テスト (`llm.integration.test.ts`)

```typescript
describe("LLM IPC Integration", () => {
  describe("llm:get-providers", () => {
    it("should return providers with correct isAvailable flags", async () => {
      // Given: SecureStorage has OpenAI key, no Anthropic key
      mockSecureStorage.getApiKey.mockImplementation((provider) => {
        return provider === "openai" ? "sk-test-key" : null;
      });

      // When: invoke llm:get-providers
      const providers = await ipcRenderer.invoke("llm:get-providers");

      // Then: OpenAI available, Anthropic not
      expect(providers.find((p) => p.id === "openai").isAvailable).toBe(true);
      expect(providers.find((p) => p.id === "anthropic").isAvailable).toBe(
        false,
      );
    });
  });

  describe("llm:check-health", () => {
    it("should return connected status for valid API key", async () => {
      // Given: Valid OpenAI API key
      mockFetch.mockResolvedValue({ ok: true, status: 200 });

      // When: check health for OpenAI
      const result = await ipcRenderer.invoke("llm:check-health", {
        providerId: "openai",
      });

      // Then: connected with latency
      expect(result.status).toBe("connected");
      expect(result.latency).toBeGreaterThan(0);
    });
  });

  describe("llm:send-chat", () => {
    it("should return response from adapter", async () => {
      // Given: Valid request
      const request = {
        providerId: "openai",
        modelId: "gpt-4o",
        messages: [{ role: "user", content: "Hello" }],
      };
      mockOpenAIResponse({ content: "Hi there!" });

      // When: send chat
      const response = await ipcRenderer.invoke("llm:send-chat", request);

      // Then: success with content
      expect(response.success).toBe(true);
      expect(response.data.content).toBe("Hi there!");
    });
  });
});
```

### 2.2 データフローテスト (`llm.flow.test.ts`)

```typescript
describe("LLM Data Flow", () => {
  describe("Provider Selection Flow", () => {
    it("should update state when provider is selected", async () => {
      // Given: Initial state with no selection
      const { result } = renderHook(() => useLLMStore());
      expect(result.current.selectedProviderId).toBeNull();

      // When: Select OpenAI provider
      act(() => {
        result.current.selectProvider("openai");
      });

      // Then: State updated
      expect(result.current.selectedProviderId).toBe("openai");
    });

    it("should reset model when provider changes", async () => {
      // Given: OpenAI selected with GPT-4 model
      const { result } = renderHook(() => useLLMStore());
      act(() => {
        result.current.selectProvider("openai");
        result.current.selectModel("gpt-4");
      });

      // When: Change to Anthropic
      act(() => {
        result.current.selectProvider("anthropic");
      });

      // Then: Model reset to Anthropic default
      expect(result.current.selectedModelId).toBe("claude-3-5-sonnet");
    });
  });

  describe("Chat Flow", () => {
    it("should flow: UI → State → IPC → Handler → Adapter → Response", async () => {
      // Given: Provider and model selected
      const store = createLLMStore();
      store.selectProvider("openai");
      store.selectModel("gpt-4o");

      // When: Send message through the flow
      mockOpenAIResponse({ content: "Test response" });
      const response = await store.sendChat([
        { role: "user", content: "Test message" },
      ]);

      // Then: Response flows back
      expect(response.success).toBe(true);
      expect(response.data.content).toBe("Test response");
    });
  });
});
```

### 2.3 エラーハンドリングテスト (`llm.error.test.ts`)

```typescript
describe("LLM Error Handling", () => {
  describe("API Key Errors", () => {
    it("should propagate API_KEY_INVALID error to UI", async () => {
      // Given: Invalid API key
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: "Invalid API key" } }),
      });

      // When: Send chat
      const response = await sendChat({
        /* valid request */
      });

      // Then: Error propagated with correct code
      expect(response.success).toBe(false);
      expect(response.error.code).toBe("API_KEY_INVALID");
      expect(response.error.retryable).toBe(false);
    });
  });

  describe("Rate Limit Errors", () => {
    it("should include retry timing in RATE_LIMIT error", async () => {
      // Given: Rate limited response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        headers: { "retry-after": "30" },
        json: () => Promise.resolve({ error: { message: "Rate limited" } }),
      });

      // When: Send chat
      const response = await sendChat({
        /* valid request */
      });

      // Then: Error with retry info
      expect(response.error.code).toBe("RATE_LIMIT");
      expect(response.error.retryable).toBe(true);
      expect(response.error.retryAfterMs).toBe(30000);
    });
  });

  describe("Network Errors", () => {
    it("should handle fetch failure as NETWORK_ERROR", async () => {
      // Given: Network failure
      mockFetch.mockRejectedValue(new Error("Failed to fetch"));

      // When: Send chat
      const response = await sendChat({
        /* valid request */
      });

      // Then: Network error
      expect(response.error.code).toBe("NETWORK_ERROR");
      expect(response.error.retryable).toBe(true);
    });
  });

  describe("Timeout Errors", () => {
    it("should timeout after 30 seconds", async () => {
      // Given: Slow response
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 35000)),
      );

      // When: Send chat
      const response = await sendChat({
        /* valid request */
      });

      // Then: Timeout error
      expect(response.error.code).toBe("TIMEOUT");
      expect(response.error.retryable).toBe(true);
    }, 40000);
  });
});
```

### 2.4 認証連携テスト (`llm.auth.test.ts`)

```typescript
describe("LLM Authentication", () => {
  describe("API Key Management", () => {
    it("should retrieve API key from SecureStorage", async () => {
      // Given: API key stored
      mockSecureStorage.getApiKey.mockResolvedValue("sk-test-key");

      // When: Create adapter
      const adapter = await LLMAdapterFactory.getAdapter("openai");

      // Then: Key retrieved
      expect(mockSecureStorage.getApiKey).toHaveBeenCalledWith("openai");
    });

    it("should not expose API key to Renderer Process", async () => {
      // Given: API key in storage
      mockSecureStorage.getApiKey.mockResolvedValue("sk-secret-key");

      // When: Get providers
      const providers = await ipcRenderer.invoke("llm:get-providers");

      // Then: No API keys in response
      providers.forEach((provider) => {
        expect(provider).not.toHaveProperty("apiKey");
        expect(JSON.stringify(provider)).not.toContain("sk-");
      });
    });
  });

  describe("API Key Validation", () => {
    it("should validate API key format before use", async () => {
      // Given: Invalid format key
      mockSecureStorage.getApiKey.mockResolvedValue("invalid-key");

      // When: Check health
      const result = await ipcRenderer.invoke("llm:check-health", {
        providerId: "openai",
      });

      // Then: Validation error (before API call)
      // Note: This depends on implementation - may make API call
    });
  });
});
```

### 2.5 状態同期テスト (`llm.sync.test.ts`)

```typescript
describe("LLM State Synchronization", () => {
  describe("Provider Selection Sync", () => {
    it("should sync provider selection across components", async () => {
      // Given: Multiple components using llmSlice
      const { result: selector1 } = renderHook(() =>
        useLLMStore((s) => s.selectedProviderId),
      );
      const { result: selector2 } = renderHook(() =>
        useLLMStore((s) => s.selectedProviderId),
      );

      // When: Update from one hook
      act(() => {
        useLLMStore.getState().selectProvider("anthropic");
      });

      // Then: Both hooks update
      expect(selector1.current).toBe("anthropic");
      expect(selector2.current).toBe("anthropic");
    });
  });

  describe("Health Status Sync", () => {
    it("should update health status reactively", async () => {
      // Given: UI subscribed to health status
      const { result } = renderHook(() =>
        useLLMStore((s) => s.healthStatus["openai"]),
      );

      // When: Health check completes
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      await act(async () => {
        await useLLMStore.getState().checkHealth("openai");
      });

      // Then: Status updated
      expect(result.current.status).toBe("connected");
    });
  });

  describe("Error State Sync", () => {
    it("should clear error on successful operation", async () => {
      // Given: Error state exists
      useLLMStore.setState({
        error: { code: "NETWORK_ERROR", message: "Failed" },
      });

      // When: Successful operation
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
      await act(async () => {
        await useLLMStore.getState().fetchProviders();
      });

      // Then: Error cleared
      expect(useLLMStore.getState().error).toBeNull();
    });
  });

  describe("Loading State Sync", () => {
    it("should set loading during async operations", async () => {
      // Given: Not loading initially
      expect(useLLMStore.getState().isLoading).toBe(false);

      // When: Start async operation
      const promise = useLLMStore.getState().fetchProviders();

      // Then: Loading during operation
      expect(useLLMStore.getState().isLoading).toBe(true);

      // After: Loading cleared
      await promise;
      expect(useLLMStore.getState().isLoading).toBe(false);
    });
  });
});
```

---

## 3. E2Eテストシナリオ

### 3.1 完全なチャットフロー

```typescript
describe('LLM E2E Flow', () => {
  it('should complete full chat flow from UI to response', async () => {
    // Given: App rendered, OpenAI configured
    render(<ChatPage />);
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /provider/i })).toBeInTheDocument();
    });

    // When: Select provider
    await userEvent.click(screen.getByRole('combobox', { name: /provider/i }));
    await userEvent.click(screen.getByText('OpenAI'));

    // And: Select model
    await userEvent.click(screen.getByRole('combobox', { name: /model/i }));
    await userEvent.click(screen.getByText('GPT-4o'));

    // And: Send message
    await userEvent.type(screen.getByRole('textbox'), 'Hello, world!');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    // Then: Response appears
    await waitFor(() => {
      expect(screen.getByText(/mock response/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('should switch providers mid-conversation', async () => {
    // Given: Chat with OpenAI started
    render(<ChatPage />);
    await selectProvider('OpenAI');
    await sendMessage('Hello from OpenAI');
    await waitForResponse();

    // When: Switch to Anthropic
    await selectProvider('Anthropic');
    await sendMessage('Hello from Anthropic');

    // Then: Both responses visible, using different adapters
    expect(screen.getByText(/openai response/i)).toBeInTheDocument();
    expect(screen.getByText(/anthropic response/i)).toBeInTheDocument();
  });
});
```

---

## 4. テストヘルパー・フィクスチャ

### 4.1 モックファクトリー

```typescript
// test/fixtures/llm.fixtures.ts

export const createMockProvider = (overrides = {}) => ({
  id: "openai",
  name: "OpenAI",
  isAvailable: true,
  models: [
    { id: "gpt-4o", name: "GPT-4o", isDefault: true },
    { id: "gpt-4", name: "GPT-4", isDefault: false },
  ],
  ...overrides,
});

export const createMockChatRequest = (overrides = {}) => ({
  providerId: "openai",
  modelId: "gpt-4o",
  messages: [{ role: "user", content: "Hello" }],
  temperature: 0.7,
  maxTokens: 1000,
  ...overrides,
});

export const createMockChatResponse = (overrides = {}) => ({
  success: true,
  data: {
    content: "Mock response",
    model: "gpt-4o",
    usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    finishReason: "stop",
  },
  ...overrides,
});

export const createMockHealthCheckResult = (overrides = {}) => ({
  status: "connected",
  latency: 150,
  checkedAt: new Date().toISOString(),
  ...overrides,
});
```

### 4.2 テストユーティリティ

```typescript
// test/utils/llm.utils.ts

export const mockOpenAIResponse = (content: string) => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () =>
      Promise.resolve({
        choices: [{ message: { content } }],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      }),
  });
};

export const mockAnthropicResponse = (text: string) => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () =>
      Promise.resolve({
        content: [{ text }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
  });
};

export const mockAPIError = (status: number, message: string) => {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve({ error: { message } }),
  });
};
```

---

## 5. テスト実行計画

### 5.1 実行順序

| 順序 | テストスイート           | 依存関係                 |
| ---- | ------------------------ | ------------------------ |
| 1    | ユニットテスト           | なし                     |
| 2    | API接続テスト            | ユニットテスト           |
| 3    | データフローテスト       | API接続テスト            |
| 4    | エラーハンドリングテスト | データフローテスト       |
| 5    | 認証連携テスト           | エラーハンドリングテスト |
| 6    | 状態同期テスト           | 認証連携テスト           |
| 7    | E2Eテスト                | 全統合テスト             |

### 5.2 実行コマンド

```bash
# ユニットテストのみ
pnpm --filter @repo/desktop test:unit

# 統合テストのみ
pnpm --filter @repo/desktop test:integration

# 全テスト
pnpm --filter @repo/desktop test

# カバレッジ付き
pnpm --filter @repo/desktop test:coverage
```

---

## 6. 統合テストカバレッジ目標

| 指標                         | 目標 | 備考                        |
| ---------------------------- | ---- | --------------------------- |
| APIエンドポイント            | 100% | 全IPC channel               |
| モジュール間インターフェース | 100% | State ↔ IPC ↔ Adapter       |
| 正常系シナリオ               | 100% | 全ハッピーパス              |
| 異常系シナリオ               | 80%+ | 主要エラーケース            |
| 外部連携ポイント             | 100% | 全プロバイダーAPI（モック） |

---

## 7. 次Phase（Phase 5）への引き継ぎ

### 7.1 実装優先順位

1. **ILLMAdapter インターフェース** - 全テストの基盤
2. **LLMAdapterFactory** - アダプター取得
3. **BaseLLMAdapter** - 共通処理
4. **各プロバイダーアダプター** - 外部API呼び出し
5. **IPCハンドラー** - Renderer連携
6. **UIコンポーネント** - ユーザーインターフェース

### 7.2 テスト実行確認ポイント

- [ ] Phase 4完了時: 全テスト失敗（Red）
- [ ] Phase 5完了時: 全テスト成功（Green）
- [ ] Phase 6完了時: カバレッジ目標達成
