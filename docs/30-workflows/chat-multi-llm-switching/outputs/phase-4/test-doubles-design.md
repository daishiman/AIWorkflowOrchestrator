# テストダブル設計書 - チャット内LLMモデル切り替え機能

## メタ情報

| 項目   | 内容                     |
| ------ | ------------------------ |
| 機能名 | chat-multi-llm-switching |
| Phase  | 4                        |
| 作成日 | 2026-01-07               |
| スキル | test-doubles             |
| 作成者 | Claude (AI)              |

---

## 1. テストダブル選定マトリクス

### 1.1 依存関係とダブル種類

| 依存関係           | ダブル種類 | 理由                            | 検証方法      |
| ------------------ | ---------- | ------------------------------- | ------------- |
| ILLMAdapter        | Mock/Fake  | API呼び出しの検証＋状態テスト   | 振る舞い/状態 |
| ILLMAdapterFactory | Mock       | アダプター生成の検証            | 振る舞い      |
| IPC Main Handler   | Mock       | IPC通信の検証                   | 振る舞い      |
| IPC Preload Bridge | Stub       | Renderer側の入力制御            | 状態          |
| LLM Provider API   | Stub       | 外部APIレスポンスのシミュレート | 状態          |
| Zustand llmSlice   | Spy/Fake   | 状態変更の追跡                  | 振る舞い/状態 |
| Zustand chatSlice  | Spy/Fake   | 状態変更の追跡                  | 振る舞い/状態 |
| localStorage       | Fake       | 永続化のインメモリテスト        | 状態          |

### 1.2 選定根拠

```
[ILLMAdapter]
  └─ Q1: 呼び出される？ → Yes
     └─ Q2: 戻り値制御？ → Yes
        └─ Q2a: 複雑なロジック？
           ├─ ストリーミング → Yes → 【Fake】
           └─ 単純なリクエスト → No → 【Mock/Stub】

[IPC通信]
  └─ Q1: 呼び出される？ → Yes
     └─ Q3: 呼び出し検証？ → Yes
        └─ Q3a: 厳密な検証？ → Yes → 【Mock】

[Zustand Store]
  └─ Q1: 呼び出される？ → Yes
     └─ Q2: 戻り値制御？ → Yes
        └─ Q2a: 複雑なロジック？ → Yes → 【Fake】
```

---

## 2. ILLMAdapter テストダブル

### 2.1 MockLLMAdapter（Unit Test用）

```typescript
// packages/shared/src/test/mocks/mock-llm-adapter.ts

import { vi } from "vitest";
import type {
  ILLMAdapter,
  LLMChatRequest,
  LLMChatResponse,
  LLMStreamChunk,
  HealthCheckResult,
  LLMModel,
  LLMProviderId,
} from "../../types/llm";

/**
 * MockLLMAdapter - 振る舞い検証用
 */
export const createMockLLMAdapter = (
  providerId: LLMProviderId = "openai",
): ILLMAdapter & { _mocks: ReturnType<typeof vi.fn>[] } => {
  const chatMock = vi.fn<[LLMChatRequest], Promise<LLMChatResponse>>();
  const chatStreamMock = vi.fn<
    [LLMChatRequest],
    AsyncIterable<LLMStreamChunk>
  >();
  const healthCheckMock = vi.fn<[], Promise<HealthCheckResult>>();
  const getAvailableModelsMock = vi.fn<[], Promise<LLMModel[]>>();

  return {
    providerId,

    chat: chatMock.mockResolvedValue({
      id: `response-${Date.now()}`,
      providerId,
      modelId: "gpt-4o",
      content: "Mock response",
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      finishReason: "stop",
      createdAt: Date.now(),
    }),

    chatStream: chatStreamMock.mockImplementation(async function* () {
      yield { type: "content", content: "Mock ", index: 0 };
      yield { type: "content", content: "stream", index: 1 };
      yield {
        type: "done",
        usage: { promptTokens: 5, completionTokens: 2, totalTokens: 7 },
        finishReason: "stop",
      };
    }),

    healthCheck: healthCheckMock.mockResolvedValue({
      providerId,
      isHealthy: true,
      latency: 150,
      checkedAt: Date.now(),
    }),

    getAvailableModels: getAvailableModelsMock.mockResolvedValue([
      { id: "gpt-4o", name: "GPT-4o", contextWindow: 128000, isDefault: true },
      { id: "gpt-4o-mini", name: "GPT-4o mini", contextWindow: 128000 },
    ]),

    // テスト用ヘルパー
    _mocks: [chatMock, chatStreamMock, healthCheckMock, getAvailableModelsMock],
  };
};

/**
 * エラーを返すMockAdapter
 */
export const createErrorMockAdapter = (
  providerId: LLMProviderId,
  errorCode: string,
  errorMessage: string,
): ILLMAdapter => {
  const error = {
    code: errorCode,
    message: errorMessage,
    providerId,
    timestamp: Date.now(),
  };

  return {
    providerId,
    chat: vi.fn().mockRejectedValue(error),
    chatStream: vi.fn().mockImplementation(async function* () {
      yield {
        type: "error",
        error: { code: errorCode, message: errorMessage },
      };
    }),
    healthCheck: vi.fn().mockResolvedValue({
      providerId,
      isHealthy: false,
      error: errorMessage,
      checkedAt: Date.now(),
    }),
    getAvailableModels: vi.fn().mockRejectedValue(error),
  };
};
```

### 2.2 FakeLLMAdapter（Integration Test用）

```typescript
// packages/shared/src/test/fakes/fake-llm-adapter.ts

import type {
  ILLMAdapter,
  LLMChatRequest,
  LLMChatResponse,
  LLMStreamChunk,
  HealthCheckResult,
  LLMModel,
  LLMProviderId,
} from "../../types/llm";

/**
 * FakeLLMAdapter - 状態検証・統合テスト用
 */
export class FakeLLMAdapter implements ILLMAdapter {
  public readonly providerId: LLMProviderId;

  // 内部状態（テストで検証可能）
  private _callHistory: Array<{
    method: string;
    args: unknown[];
    timestamp: number;
  }> = [];
  private _responses: Map<string, LLMChatResponse> = new Map();
  private _streamResponses: Map<string, string> = new Map();
  private _isHealthy: boolean = true;
  private _latency: number = 100;
  private _models: LLMModel[] = [];

  constructor(providerId: LLMProviderId) {
    this.providerId = providerId;
    this._initializeDefaults();
  }

  private _initializeDefaults(): void {
    this._models = [
      {
        id: `${this.providerId}-model-1`,
        name: "Default Model",
        contextWindow: 100000,
        isDefault: true,
      },
    ];
  }

  // ILLMAdapter実装
  async chat(request: LLMChatRequest): Promise<LLMChatResponse> {
    this._recordCall("chat", [request]);
    await this._simulateLatency();

    const customResponse = this._responses.get(request.modelId);
    if (customResponse) {
      return customResponse;
    }

    return {
      id: `fake-response-${Date.now()}`,
      providerId: this.providerId,
      modelId: request.modelId,
      content: `Fake response from ${this.providerId} for: ${request.messages[request.messages.length - 1]?.content}`,
      usage: { promptTokens: 10, completionTokens: 50, totalTokens: 60 },
      finishReason: "stop",
      createdAt: Date.now(),
    };
  }

  async *chatStream(request: LLMChatRequest): AsyncIterable<LLMStreamChunk> {
    this._recordCall("chatStream", [request]);

    const customContent =
      this._streamResponses.get(request.modelId) || "Fake streaming response";
    const words = customContent.split(" ");

    for (let i = 0; i < words.length; i++) {
      await this._simulateLatency(10);
      yield {
        type: "content",
        content: words[i] + (i < words.length - 1 ? " " : ""),
        index: i,
      };
    }

    yield {
      type: "done",
      usage: {
        promptTokens: 10,
        completionTokens: words.length,
        totalTokens: 10 + words.length,
      },
      finishReason: "stop",
    };
  }

  async healthCheck(): Promise<HealthCheckResult> {
    this._recordCall("healthCheck", []);
    await this._simulateLatency();

    return {
      providerId: this.providerId,
      isHealthy: this._isHealthy,
      latency: this._isHealthy ? this._latency : undefined,
      error: this._isHealthy ? undefined : "Simulated unhealthy state",
      checkedAt: Date.now(),
    };
  }

  async getAvailableModels(): Promise<LLMModel[]> {
    this._recordCall("getAvailableModels", []);
    await this._simulateLatency();
    return [...this._models];
  }

  // テストヘルパーメソッド
  setHealthy(isHealthy: boolean): void {
    this._isHealthy = isHealthy;
  }

  setLatency(ms: number): void {
    this._latency = ms;
  }

  setModels(models: LLMModel[]): void {
    this._models = models;
  }

  setResponse(modelId: string, response: LLMChatResponse): void {
    this._responses.set(modelId, response);
  }

  setStreamResponse(modelId: string, content: string): void {
    this._streamResponses.set(modelId, content);
  }

  getCallHistory(): Array<{
    method: string;
    args: unknown[];
    timestamp: number;
  }> {
    return [...this._callHistory];
  }

  getCallCount(method?: string): number {
    if (method) {
      return this._callHistory.filter((c) => c.method === method).length;
    }
    return this._callHistory.length;
  }

  clearHistory(): void {
    this._callHistory = [];
  }

  reset(): void {
    this._callHistory = [];
    this._responses.clear();
    this._streamResponses.clear();
    this._isHealthy = true;
    this._latency = 100;
    this._initializeDefaults();
  }

  private _recordCall(method: string, args: unknown[]): void {
    this._callHistory.push({ method, args, timestamp: Date.now() });
  }

  private async _simulateLatency(ms?: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms || this._latency));
  }
}
```

---

## 3. ILLMAdapterFactory テストダブル

### 3.1 MockLLMAdapterFactory

```typescript
// packages/shared/src/test/mocks/mock-llm-adapter-factory.ts

import { vi } from "vitest";
import type {
  ILLMAdapterFactory,
  ILLMAdapter,
  LLMConfig,
  LLMProviderId,
} from "../../types/llm";
import {
  createMockLLMAdapter,
  createErrorMockAdapter,
} from "./mock-llm-adapter";

/**
 * MockLLMAdapterFactory
 */
export const createMockAdapterFactory = (): ILLMAdapterFactory & {
  _adapters: Map<LLMProviderId, ILLMAdapter>;
  _createMock: ReturnType<typeof vi.fn>;
  _getSupportedProvidersMock: ReturnType<typeof vi.fn>;
} => {
  const adapters = new Map<LLMProviderId, ILLMAdapter>();

  // デフォルトアダプターを設定
  const defaultProviders: LLMProviderId[] = [
    "openai",
    "anthropic",
    "google",
    "xai",
  ];
  defaultProviders.forEach((id) => {
    adapters.set(id, createMockLLMAdapter(id));
  });

  const createMock = vi.fn<[LLMProviderId, LLMConfig], ILLMAdapter>();
  const getSupportedProvidersMock = vi.fn<[], LLMProviderId[]>();

  return {
    create: createMock.mockImplementation(
      (providerId: LLMProviderId, _config: LLMConfig) => {
        const adapter = adapters.get(providerId);
        if (!adapter) {
          throw new Error(`Unsupported provider: ${providerId}`);
        }
        return adapter;
      },
    ),

    getSupportedProviders:
      getSupportedProvidersMock.mockReturnValue(defaultProviders),

    // テストヘルパー
    _adapters: adapters,
    _createMock: createMock,
    _getSupportedProvidersMock: getSupportedProvidersMock,
  };
};

/**
 * エラーを返すFactory
 */
export const createErrorAdapterFactory = (
  errorProviderId: LLMProviderId,
  errorCode: string,
  errorMessage: string,
): ILLMAdapterFactory => {
  const factory = createMockAdapterFactory();
  factory._adapters.set(
    errorProviderId,
    createErrorMockAdapter(errorProviderId, errorCode, errorMessage),
  );
  return factory;
};
```

---

## 4. IPC通信 テストダブル

### 4.1 Mock IPC Main Handler

```typescript
// apps/desktop/src/test/mocks/mock-ipc-handlers.ts

import { vi } from "vitest";
import type { IPCChatRequest, IPCStreamChunk } from "../../types/ipc";
import type { LLMProvider, HealthCheckResult } from "@repo/shared";

/**
 * IPC Main Process Handler Mocks
 */
export const createMockIPCHandlers = () => {
  return {
    "llm:getProviders": vi
      .fn<[], Promise<LLMProvider[]>>()
      .mockResolvedValue([]),
    "llm:getModels": vi
      .fn<[string], Promise<{ models: any[] }>>()
      .mockResolvedValue({ models: [] }),
    "llm:sendChat": vi.fn<[IPCChatRequest], Promise<any>>().mockResolvedValue({
      id: "response-1",
      content: "Mock IPC response",
    }),
    "llm:streamChat": vi.fn<[IPCChatRequest], void>(),
    "llm:cancelStream": vi
      .fn<[string], Promise<void>>()
      .mockResolvedValue(undefined),
    "llm:healthCheck": vi
      .fn<[string], Promise<HealthCheckResult>>()
      .mockResolvedValue({
        providerId: "openai",
        isHealthy: true,
        latency: 100,
        checkedAt: Date.now(),
      }),
  };
};

/**
 * IPC Event Emitter Mock（ストリーミング用）
 */
export class MockIPCEventEmitter {
  private listeners: Map<string, Set<(event: any, data: any) => void>> =
    new Map();

  on(channel: string, callback: (event: any, data: any) => void): void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);
  }

  off(channel: string, callback: (event: any, data: any) => void): void {
    this.listeners.get(channel)?.delete(callback);
  }

  // テスト用: イベントを発火
  emit(channel: string, data: any): void {
    this.listeners.get(channel)?.forEach((cb) => cb({}, data));
  }

  // テスト用: ストリーミングシーケンスを発火
  async emitStreamSequence(
    requestId: string,
    chunks: IPCStreamChunk[],
    delayMs: number = 10,
  ): Promise<void> {
    for (const chunk of chunks) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      this.emit(`llm:stream:${requestId}`, chunk);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
```

### 4.2 Stub IPC Preload Bridge（Renderer側）

```typescript
// apps/desktop/src/test/stubs/stub-ipc-preload.ts

import { vi } from "vitest";
import type { LLMApi } from "../../preload/llm-api";
import {
  mockProviders,
  allHealthy,
  createMockChatResponse,
} from "@repo/shared/test/fixtures";

/**
 * Stub LLM API for Renderer Process
 */
export const createStubLLMApi = (): LLMApi => {
  return {
    getProviders: vi.fn().mockResolvedValue(Object.values(mockProviders)),

    getModels: vi.fn().mockImplementation(async (providerId: string) => {
      const provider = mockProviders[providerId as keyof typeof mockProviders];
      return provider?.models || [];
    }),

    sendChat: vi.fn().mockImplementation(async (request) => {
      return createMockChatResponse({
        providerId: request.providerId,
        modelId: request.modelId,
      });
    }),

    streamChat: vi
      .fn()
      .mockImplementation((request, onChunk, onDone, onError) => {
        // 非同期でストリームをシミュレート
        setTimeout(() => {
          onChunk({ type: "content", content: "Streaming ", index: 0 });
        }, 10);
        setTimeout(() => {
          onChunk({ type: "content", content: "response", index: 1 });
        }, 20);
        setTimeout(() => {
          onDone({
            type: "done",
            usage: { promptTokens: 5, completionTokens: 2, totalTokens: 7 },
            finishReason: "stop",
          });
        }, 30);

        // クリーンアップ関数を返す
        return () => {};
      }),

    cancelStream: vi.fn().mockResolvedValue(undefined),

    healthCheck: vi.fn().mockImplementation(async (providerId: string) => {
      return (
        allHealthy[providerId as keyof typeof allHealthy] || {
          providerId,
          isHealthy: false,
          error: "Provider not found",
          checkedAt: Date.now(),
        }
      );
    }),
  };
};

/**
 * エラーを返すStub
 */
export const createErrorStubLLMApi = (
  errorCode: string,
  errorMessage: string,
): LLMApi => {
  const error = { code: errorCode, message: errorMessage };

  return {
    getProviders: vi.fn().mockRejectedValue(error),
    getModels: vi.fn().mockRejectedValue(error),
    sendChat: vi.fn().mockRejectedValue(error),
    streamChat: vi
      .fn()
      .mockImplementation((_request, _onChunk, _onDone, onError) => {
        setTimeout(() => onError(error), 10);
        return () => {};
      }),
    cancelStream: vi.fn().mockRejectedValue(error),
    healthCheck: vi.fn().mockResolvedValue({
      providerId: "unknown",
      isHealthy: false,
      error: errorMessage,
      checkedAt: Date.now(),
    }),
  };
};
```

---

## 5. Zustand Store テストダブル

### 5.1 LLMSlice テストヘルパー

```typescript
// apps/desktop/src/test/helpers/llm-slice-test-helper.ts

import { vi } from "vitest";
import { create } from "zustand";
import type { LLMState, LLMActions } from "../../stores/llmSlice";
import {
  initialLLMState,
  loadedLLMState,
  mockProviders,
  mockConfigs,
  allHealthy,
} from "../fixtures";

/**
 * テスト用LLMStore作成
 */
export const createTestLLMStore = (initialState: Partial<LLMState> = {}) => {
  const state: LLMState = {
    ...initialLLMState,
    ...initialState,
  };

  // アクションをSpyでラップ
  const actions: LLMActions = {
    loadProviders: vi.fn().mockImplementation(async () => {
      store.setState({
        providers: Object.values(mockProviders),
        isLoading: false,
      });
    }),
    selectProvider: vi.fn().mockImplementation((providerId) => {
      const provider = mockProviders[providerId as keyof typeof mockProviders];
      if (provider) {
        const defaultModel =
          provider.models.find((m) => m.isDefault) || provider.models[0];
        store.setState({
          selectedProviderId: providerId,
          selectedModelId: defaultModel?.id || null,
        });
      }
    }),
    selectModel: vi.fn().mockImplementation((modelId) => {
      store.setState({ selectedModelId: modelId });
    }),
    updateConfig: vi.fn().mockImplementation((providerId, config) => {
      store.setState((state) => ({
        configs: { ...state.configs, [providerId]: config },
      }));
    }),
    checkHealth: vi.fn().mockImplementation(async (providerId) => {
      const result = allHealthy[providerId as keyof typeof allHealthy];
      store.setState((state) => ({
        healthStatus: { ...state.healthStatus, [providerId]: result },
      }));
      return result;
    }),
    checkAllHealth: vi.fn().mockImplementation(async () => {
      store.setState({ healthStatus: allHealthy });
    }),
    setError: vi.fn().mockImplementation((error) => {
      store.setState({ error, isLoading: false });
    }),
    clearError: vi.fn().mockImplementation(() => {
      store.setState({ error: null });
    }),
  };

  const store = create<LLMState & LLMActions>()(() => ({
    ...state,
    ...actions,
  }));

  return {
    store,
    actions,
    getState: () => store.getState(),
    setState: store.setState,
    reset: () => store.setState({ ...initialLLMState, ...actions }),
  };
};

/**
 * 読み込み済み状態のStore
 */
export const createLoadedLLMStore = () => {
  return createTestLLMStore(loadedLLMState);
};
```

### 5.2 ChatSlice テストヘルパー

```typescript
// apps/desktop/src/test/helpers/chat-slice-test-helper.ts

import { vi } from "vitest";
import { create } from "zustand";
import type { ChatState, ChatActions } from "../../stores/chatSlice";
import {
  initialChatState,
  activeConversationState,
  streamingState,
  multiProviderConversationState,
} from "../fixtures";

/**
 * テスト用ChatStore作成
 */
export const createTestChatStore = (initialState: Partial<ChatState> = {}) => {
  const state: ChatState = {
    ...initialChatState,
    ...initialState,
  };

  const actions: ChatActions = {
    createConversation: vi.fn().mockImplementation(() => {
      const id = `conv-${Date.now()}`;
      store.setState((state) => ({
        conversations: {
          ...state.conversations,
          [id]: {
            id,
            title: "New Conversation",
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
        activeConversationId: id,
      }));
      return id;
    }),

    setActiveConversation: vi.fn().mockImplementation((id) => {
      store.setState({ activeConversationId: id });
    }),

    addMessage: vi.fn().mockImplementation((conversationId, message) => {
      store.setState((state) => {
        const conversation = state.conversations[conversationId];
        if (!conversation) return state;
        return {
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...conversation,
              messages: [...conversation.messages, message],
              updatedAt: Date.now(),
            },
          },
        };
      });
    }),

    updateMessage: vi
      .fn()
      .mockImplementation((conversationId, messageId, updates) => {
        store.setState((state) => {
          const conversation = state.conversations[conversationId];
          if (!conversation) return state;
          return {
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...conversation,
                messages: conversation.messages.map((m) =>
                  m.id === messageId ? { ...m, ...updates } : m,
                ),
                updatedAt: Date.now(),
              },
            },
          };
        });
      }),

    appendToStreamingMessage: vi
      .fn()
      .mockImplementation((conversationId, messageId, content) => {
        store.setState((state) => {
          const conversation = state.conversations[conversationId];
          if (!conversation) return state;
          return {
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...conversation,
                messages: conversation.messages.map((m) =>
                  m.id === messageId
                    ? { ...m, content: m.content + content }
                    : m,
                ),
              },
            },
          };
        });
      }),

    setStreaming: vi.fn().mockImplementation((isStreaming, messageId) => {
      store.setState({
        isStreaming,
        streamingMessageId: isStreaming ? messageId : null,
      });
    }),

    deleteConversation: vi.fn().mockImplementation((id) => {
      store.setState((state) => {
        const { [id]: _, ...rest } = state.conversations;
        return {
          conversations: rest,
          activeConversationId:
            state.activeConversationId === id
              ? null
              : state.activeConversationId,
        };
      });
    }),

    clearConversations: vi.fn().mockImplementation(() => {
      store.setState({
        conversations: {},
        activeConversationId: null,
        isStreaming: false,
        streamingMessageId: null,
      });
    }),
  };

  const store = create<ChatState & ChatActions>()(() => ({
    ...state,
    ...actions,
  }));

  return {
    store,
    actions,
    getState: () => store.getState(),
    setState: store.setState,
    reset: () => store.setState({ ...initialChatState, ...actions }),
  };
};

/**
 * 会話中状態のStore
 */
export const createActiveConversationStore = () => {
  return createTestChatStore(activeConversationState);
};

/**
 * ストリーミング中状態のStore
 */
export const createStreamingStore = () => {
  return createTestChatStore(streamingState);
};

/**
 * マルチプロバイダー会話のStore
 */
export const createMultiProviderStore = () => {
  return createTestChatStore(multiProviderConversationState);
};
```

### 5.3 FakeLocalStorage

```typescript
// packages/shared/src/test/fakes/fake-local-storage.ts

/**
 * FakeLocalStorage - 永続化テスト用
 */
export class FakeLocalStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  // テストヘルパー
  getAll(): Record<string, string> {
    return Object.fromEntries(this.store);
  }

  seed(data: Record<string, string>): void {
    Object.entries(data).forEach(([key, value]) => {
      this.store.set(key, value);
    });
  }
}
```

---

## 6. コンポーネントテスト用ダブル

### 6.1 React Testing Library用Provider

```typescript
// apps/desktop/src/test/helpers/test-providers.tsx

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { createTestLLMStore, createTestChatStore } from './store-helpers';

interface TestProvidersProps {
  children: React.ReactNode;
  llmState?: Partial<LLMState>;
  chatState?: Partial<ChatState>;
}

/**
 * テスト用Providerラッパー
 */
export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  llmState = {},
  chatState = {},
}) => {
  const llmStore = createTestLLMStore(llmState);
  const chatStore = createTestChatStore(chatState);

  return (
    <LLMStoreContext.Provider value={llmStore.store}>
      <ChatStoreContext.Provider value={chatStore.store}>
        {children}
      </ChatStoreContext.Provider>
    </LLMStoreContext.Provider>
  );
};

/**
 * カスタムrender関数
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    llmState?: Partial<LLMState>;
    chatState?: Partial<ChatState>;
  }
) => {
  const { llmState, chatState, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders llmState={llmState} chatState={chatState}>
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  });
};
```

---

## 7. テストダブル使用例

### 7.1 Unit Test: LLMService

```typescript
// packages/shared/src/services/__tests__/llm-service.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { LLMService } from "../llm-service";
import {
  createMockAdapterFactory,
  createMockLLMAdapter,
} from "../../test/mocks";
import { createMockChatRequest } from "../../test/fixtures";

describe("LLMService", () => {
  let service: LLMService;
  let mockFactory: ReturnType<typeof createMockAdapterFactory>;
  let mockAdapter: ReturnType<typeof createMockLLMAdapter>;

  beforeEach(() => {
    mockFactory = createMockAdapterFactory();
    mockAdapter = createMockLLMAdapter("openai");
    mockFactory._adapters.set("openai", mockAdapter);
    service = new LLMService(mockFactory);
    vi.clearAllMocks();
  });

  describe("chat", () => {
    it("should call adapter with correct request", async () => {
      const request = createMockChatRequest();

      await service.chat(request);

      expect(mockAdapter.chat).toHaveBeenCalledWith(request);
      expect(mockAdapter.chat).toHaveBeenCalledTimes(1);
    });

    it("should return adapter response", async () => {
      const request = createMockChatRequest();
      const expectedResponse = { content: "Test response" };
      (mockAdapter.chat as any).mockResolvedValue(expectedResponse);

      const result = await service.chat(request);

      expect(result).toBe(expectedResponse);
    });
  });
});
```

### 7.2 Integration Test: IPC通信

```typescript
// apps/desktop/src/main/__tests__/ipc-handlers.integration.test.ts

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FakeLLMAdapter } from "@repo/shared/test/fakes";
import { MockIPCEventEmitter } from "../../test/mocks";

describe("IPC Chat Handler Integration", () => {
  let fakeAdapter: FakeLLMAdapter;
  let ipcEmitter: MockIPCEventEmitter;

  beforeEach(() => {
    fakeAdapter = new FakeLLMAdapter("openai");
    ipcEmitter = new MockIPCEventEmitter();
  });

  afterEach(() => {
    fakeAdapter.reset();
    ipcEmitter.clear();
  });

  it("should stream response through IPC", async () => {
    fakeAdapter.setStreamResponse("gpt-4o", "Hello from streaming test");
    const receivedChunks: any[] = [];

    ipcEmitter.on("llm:stream:req-1", (_, chunk) => {
      receivedChunks.push(chunk);
    });

    // ストリーム開始
    for await (const chunk of fakeAdapter.chatStream({
      providerId: "openai",
      modelId: "gpt-4o",
      messages: [{ role: "user", content: "Test" }],
    })) {
      ipcEmitter.emit("llm:stream:req-1", chunk);
    }

    expect(receivedChunks.length).toBeGreaterThan(1);
    expect(receivedChunks[receivedChunks.length - 1].type).toBe("done");
  });
});
```

---

## 8. チェックリスト

### 8.1 テストダブル設計時

- [x] 各依存関係の役割を分析した
- [x] 適切なダブル種類を選定した
- [x] 検証方法（状態/振る舞い）を決定した
- [x] テストヘルパーメソッドを設計した

### 8.2 実装時

- [ ] Mock/Stub/Fake の実装が完了
- [ ] テスト用Providerの実装が完了
- [ ] 使用例がドキュメント化されている
- [ ] リセット/クリーンアップが確実に行われる

### 8.3 レビュー時

- [ ] 過度なモッキングがないか確認
- [ ] 実装詳細への依存がないか確認
- [ ] テストの意図が明確か確認

---

## 9. 関連ドキュメント

| ドキュメント     | パス                                         |
| ---------------- | -------------------------------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`      |
| テストデータ設計 | `outputs/phase-4/test-data-design.md`        |
| API仕様          | `outputs/phase-2/api-specification.md`       |
| 状態管理設計     | `outputs/phase-2/state-management-design.md` |

---

## 10. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-07 | 初版作成 |
