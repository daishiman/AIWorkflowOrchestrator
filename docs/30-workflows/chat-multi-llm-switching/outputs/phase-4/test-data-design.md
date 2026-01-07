# テストデータ設計書 - チャット内LLMモデル切り替え機能

## メタ情報

| 項目   | 内容                     |
| ------ | ------------------------ |
| 機能名 | chat-multi-llm-switching |
| Phase  | 4                        |
| 作成日 | 2026-01-07               |
| スキル | test-data-management     |
| 作成者 | Claude (AI)              |

---

## 1. テストデータ要件

### 1.1 対象スキーマ一覧

| スキーマ          | 用途                   | テストカテゴリ        |
| ----------------- | ---------------------- | --------------------- |
| LLMProvider       | プロバイダー情報       | Unit / Integration    |
| LLMModel          | モデル情報             | Unit / Integration    |
| LLMConfig         | API設定                | Unit / Integration    |
| LLMChatRequest    | チャットリクエスト     | Unit / Integration    |
| LLMChatResponse   | チャットレスポンス     | Unit / Integration    |
| LLMStreamChunk    | ストリーミングチャンク | Unit / Integration    |
| LLMError          | エラー情報             | Unit / Error Handling |
| IPCChatRequest    | IPC通信リクエスト      | Integration           |
| ChatMessage       | チャットメッセージ     | Unit / Component      |
| HealthCheckResult | ヘルスチェック結果     | Unit / Integration    |

### 1.2 データ分離戦略

| 戦略                 | 適用範囲               | 理由                       |
| -------------------- | ---------------------- | -------------------------- |
| インメモリ分離       | Unit Test              | 外部依存なし、高速実行     |
| モック分離           | Integration Test (IPC) | Electron IPC のモック化    |
| スナップショット     | Component Test         | UIコンポーネントの視覚確認 |
| タイムスタンプ一意性 | 全テスト               | 並列実行時の衝突防止       |

---

## 2. フィクスチャ定義

### 2.1 LLMProvider フィクスチャ

```typescript
// packages/shared/src/test/fixtures/llm-provider.fixture.ts

import { LLMProvider, LLMProviderId } from "../types/llm";

/**
 * テスト用プロバイダーファクトリ
 */
export const createMockProvider = (
  overrides: Partial<LLMProvider> = {},
): LLMProvider => ({
  id: "openai" as LLMProviderId,
  name: "OpenAI",
  description: "OpenAI GPT Models",
  logoUrl: "/icons/openai.svg",
  isEnabled: true,
  models: [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      description: "Most capable model",
      contextWindow: 128000,
      isDefault: true,
    },
  ],
  ...overrides,
});

/**
 * 全プロバイダーフィクスチャ
 */
export const mockProviders: Record<LLMProviderId, LLMProvider> = {
  openai: createMockProvider({
    id: "openai",
    name: "OpenAI",
    models: [
      { id: "gpt-4o", name: "GPT-4o", contextWindow: 128000, isDefault: true },
      { id: "gpt-4o-mini", name: "GPT-4o mini", contextWindow: 128000 },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", contextWindow: 128000 },
    ],
  }),
  anthropic: createMockProvider({
    id: "anthropic",
    name: "Anthropic",
    logoUrl: "/icons/anthropic.svg",
    models: [
      {
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        contextWindow: 200000,
        isDefault: true,
      },
      {
        id: "claude-opus-4-20250514",
        name: "Claude Opus 4",
        contextWindow: 200000,
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        contextWindow: 200000,
      },
    ],
  }),
  google: createMockProvider({
    id: "google",
    name: "Google AI",
    logoUrl: "/icons/google.svg",
    models: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        contextWindow: 1000000,
        isDefault: true,
      },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", contextWindow: 2000000 },
    ],
  }),
  xai: createMockProvider({
    id: "xai",
    name: "xAI",
    logoUrl: "/icons/xai.svg",
    models: [
      { id: "grok-2", name: "Grok 2", contextWindow: 131072, isDefault: true },
      { id: "grok-2-mini", name: "Grok 2 mini", contextWindow: 131072 },
    ],
  }),
};

/**
 * 無効化プロバイダー（設定なし）
 */
export const disabledProvider = createMockProvider({
  id: "openai",
  isEnabled: false,
  models: [],
});
```

### 2.2 LLMConfig フィクスチャ

```typescript
// packages/shared/src/test/fixtures/llm-config.fixture.ts

import { LLMConfig, LLMProviderId } from "../types/llm";

/**
 * テスト用設定ファクトリ
 */
export const createMockConfig = (
  providerId: LLMProviderId,
  overrides: Partial<LLMConfig> = {},
): LLMConfig => ({
  providerId,
  apiKey: `test-${providerId}-api-key-${Date.now()}`,
  baseUrl: undefined,
  timeout: 30000,
  maxRetries: 3,
  ...overrides,
});

/**
 * 全プロバイダー設定
 */
export const mockConfigs: Record<LLMProviderId, LLMConfig> = {
  openai: createMockConfig("openai", {
    baseUrl: "https://api.openai.com/v1",
  }),
  anthropic: createMockConfig("anthropic", {
    baseUrl: "https://api.anthropic.com/v1",
  }),
  google: createMockConfig("google"),
  xai: createMockConfig("xai", {
    baseUrl: "https://api.x.ai/v1",
  }),
};

/**
 * 無効なAPI Key設定
 */
export const invalidApiKeyConfig = createMockConfig("openai", {
  apiKey: "invalid-key",
});

/**
 * タイムアウト設定（短時間）
 */
export const shortTimeoutConfig = createMockConfig("openai", {
  timeout: 100, // 100ms
  maxRetries: 0,
});
```

### 2.3 LLMChatRequest フィクスチャ

```typescript
// packages/shared/src/test/fixtures/llm-chat-request.fixture.ts

import { LLMChatRequest, ChatMessage } from "../types/llm";

/**
 * テスト用チャットリクエストファクトリ
 */
export const createMockChatRequest = (
  overrides: Partial<LLMChatRequest> = {},
): LLMChatRequest => ({
  providerId: "openai",
  modelId: "gpt-4o",
  messages: [{ role: "user", content: "Hello, how are you?" }],
  options: {
    temperature: 0.7,
    maxTokens: 1000,
  },
  ...overrides,
});

/**
 * 複数メッセージを含むリクエスト
 */
export const multiTurnChatRequest = createMockChatRequest({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is TypeScript?" },
    { role: "assistant", content: "TypeScript is a superset of JavaScript..." },
    { role: "user", content: "Can you give me an example?" },
  ],
});

/**
 * ストリーミングリクエスト
 */
export const streamingChatRequest = createMockChatRequest({
  options: {
    temperature: 0.7,
    maxTokens: 1000,
    stream: true,
  },
});

/**
 * 各プロバイダー用リクエスト
 */
export const providerSpecificRequests = {
  openai: createMockChatRequest({ providerId: "openai", modelId: "gpt-4o" }),
  anthropic: createMockChatRequest({
    providerId: "anthropic",
    modelId: "claude-sonnet-4-20250514",
  }),
  google: createMockChatRequest({
    providerId: "google",
    modelId: "gemini-2.0-flash",
  }),
  xai: createMockChatRequest({ providerId: "xai", modelId: "grok-2" }),
};

/**
 * 境界値テスト用リクエスト
 */
export const edgeCaseRequests = {
  emptyMessage: createMockChatRequest({
    messages: [{ role: "user", content: "" }],
  }),
  longMessage: createMockChatRequest({
    messages: [{ role: "user", content: "A".repeat(100000) }],
  }),
  specialCharacters: createMockChatRequest({
    messages: [
      {
        role: "user",
        content: '日本語テスト 🎉 <script>alert("xss")</script>',
      },
    ],
  }),
};
```

### 2.4 LLMChatResponse フィクスチャ

```typescript
// packages/shared/src/test/fixtures/llm-chat-response.fixture.ts

import { LLMChatResponse } from "../types/llm";

/**
 * テスト用チャットレスポンスファクトリ
 */
export const createMockChatResponse = (
  overrides: Partial<LLMChatResponse> = {},
): LLMChatResponse => ({
  id: `response-${Date.now()}`,
  providerId: "openai",
  modelId: "gpt-4o",
  content: "This is a test response from the AI.",
  usage: {
    promptTokens: 10,
    completionTokens: 20,
    totalTokens: 30,
  },
  finishReason: "stop",
  createdAt: Date.now(),
  ...overrides,
});

/**
 * 各プロバイダー用レスポンス
 */
export const providerResponses = {
  openai: createMockChatResponse({
    providerId: "openai",
    modelId: "gpt-4o",
    content: "Response from OpenAI GPT-4o",
  }),
  anthropic: createMockChatResponse({
    providerId: "anthropic",
    modelId: "claude-sonnet-4-20250514",
    content: "Response from Claude Sonnet 4",
  }),
  google: createMockChatResponse({
    providerId: "google",
    modelId: "gemini-2.0-flash",
    content: "Response from Gemini 2.0 Flash",
  }),
  xai: createMockChatResponse({
    providerId: "xai",
    modelId: "grok-2",
    content: "Response from Grok 2",
  }),
};

/**
 * 長いレスポンス（パフォーマンステスト用）
 */
export const longResponse = createMockChatResponse({
  content: "Long response content. ".repeat(1000),
  usage: {
    promptTokens: 100,
    completionTokens: 5000,
    totalTokens: 5100,
  },
});

/**
 * 途中停止レスポンス
 */
export const truncatedResponse = createMockChatResponse({
  content: "This response was truncated due to...",
  finishReason: "length",
});
```

### 2.5 LLMStreamChunk フィクスチャ

```typescript
// packages/shared/src/test/fixtures/llm-stream-chunk.fixture.ts

import { LLMStreamChunk } from "../types/llm";

/**
 * コンテンツチャンクファクトリ
 */
export const createContentChunk = (
  content: string,
  index: number = 0,
): LLMStreamChunk => ({
  type: "content",
  content,
  index,
});

/**
 * 完了チャンクファクトリ
 */
export const createDoneChunk = (usage?: {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}): LLMStreamChunk => ({
  type: "done",
  usage: usage || { promptTokens: 10, completionTokens: 50, totalTokens: 60 },
  finishReason: "stop",
});

/**
 * エラーチャンクファクトリ
 */
export const createErrorChunk = (
  code: string,
  message: string,
): LLMStreamChunk => ({
  type: "error",
  error: { code, message },
});

/**
 * ストリーミングシーケンス
 */
export const mockStreamSequence: LLMStreamChunk[] = [
  createContentChunk("Hello", 0),
  createContentChunk(", ", 1),
  createContentChunk("world", 2),
  createContentChunk("!", 3),
  createDoneChunk({ promptTokens: 5, completionTokens: 4, totalTokens: 9 }),
];

/**
 * エラーで終了するシーケンス
 */
export const errorStreamSequence: LLMStreamChunk[] = [
  createContentChunk("Processing...", 0),
  createErrorChunk("LLM_RATE_LIMIT", "Rate limit exceeded"),
];

/**
 * 長いストリーミングシーケンス
 */
export const longStreamSequence: LLMStreamChunk[] = [
  ...Array.from({ length: 100 }, (_, i) => createContentChunk(`chunk${i} `, i)),
  createDoneChunk({
    promptTokens: 10,
    completionTokens: 100,
    totalTokens: 110,
  }),
];
```

### 2.6 LLMError フィクスチャ

```typescript
// packages/shared/src/test/fixtures/llm-error.fixture.ts

import { LLMError, LLMErrorCode } from "../types/llm";

/**
 * テスト用エラーファクトリ
 */
export const createMockError = (
  code: LLMErrorCode,
  message: string,
  overrides: Partial<LLMError> = {},
): LLMError => ({
  code,
  message,
  providerId: "openai",
  timestamp: Date.now(),
  ...overrides,
});

/**
 * 全エラーコードのフィクスチャ
 */
export const mockErrors: Record<LLMErrorCode, LLMError> = {
  LLM_INVALID_API_KEY: createMockError(
    "LLM_INVALID_API_KEY",
    "Invalid API key provided",
  ),
  LLM_RATE_LIMIT: createMockError(
    "LLM_RATE_LIMIT",
    "Rate limit exceeded. Please try again later.",
    { retryAfter: 60 },
  ),
  LLM_CONTEXT_LENGTH_EXCEEDED: createMockError(
    "LLM_CONTEXT_LENGTH_EXCEEDED",
    "Maximum context length exceeded",
    { details: { maxTokens: 128000, requestedTokens: 150000 } },
  ),
  LLM_MODEL_NOT_FOUND: createMockError(
    "LLM_MODEL_NOT_FOUND",
    'Model "gpt-5" not found',
    { details: { requestedModel: "gpt-5" } },
  ),
  LLM_SERVICE_UNAVAILABLE: createMockError(
    "LLM_SERVICE_UNAVAILABLE",
    "Service temporarily unavailable",
  ),
  LLM_TIMEOUT: createMockError(
    "LLM_TIMEOUT",
    "Request timed out after 30000ms",
  ),
  LLM_NETWORK_ERROR: createMockError(
    "LLM_NETWORK_ERROR",
    "Network connection failed",
  ),
  LLM_PROVIDER_ERROR: createMockError(
    "LLM_PROVIDER_ERROR",
    "Internal provider error",
    { details: { statusCode: 500 } },
  ),
  LLM_CONTENT_FILTER: createMockError(
    "LLM_CONTENT_FILTER",
    "Content was filtered due to policy violation",
  ),
  LLM_UNKNOWN_ERROR: createMockError(
    "LLM_UNKNOWN_ERROR",
    "An unexpected error occurred",
  ),
};

/**
 * リトライ可能エラー
 */
export const retryableErrors: LLMError[] = [
  mockErrors.LLM_RATE_LIMIT,
  mockErrors.LLM_SERVICE_UNAVAILABLE,
  mockErrors.LLM_TIMEOUT,
  mockErrors.LLM_NETWORK_ERROR,
];

/**
 * 致命的エラー（リトライ不可）
 */
export const fatalErrors: LLMError[] = [
  mockErrors.LLM_INVALID_API_KEY,
  mockErrors.LLM_CONTEXT_LENGTH_EXCEEDED,
  mockErrors.LLM_MODEL_NOT_FOUND,
  mockErrors.LLM_CONTENT_FILTER,
];
```

### 2.7 IPCChatRequest フィクスチャ

```typescript
// apps/desktop/src/test/fixtures/ipc-chat-request.fixture.ts

import { IPCChatRequest, ConversationMessage } from "../types/ipc";

/**
 * テスト用IPC チャットリクエストファクトリ
 */
export const createMockIPCChatRequest = (
  overrides: Partial<IPCChatRequest> = {},
): IPCChatRequest => ({
  requestId: `req-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  conversationId: `conv-${Date.now()}`,
  providerId: "openai",
  modelId: "gpt-4o",
  messages: [
    {
      id: `msg-${Date.now()}`,
      role: "user",
      content: "Test message",
      timestamp: Date.now(),
    },
  ],
  options: {
    temperature: 0.7,
    maxTokens: 1000,
    stream: true,
  },
  ...overrides,
});

/**
 * 会話履歴付きリクエスト
 */
export const conversationWithHistory = createMockIPCChatRequest({
  messages: [
    {
      id: "msg-1",
      role: "system",
      content: "You are a helpful assistant.",
      timestamp: Date.now() - 60000,
    },
    {
      id: "msg-2",
      role: "user",
      content: "Hello!",
      timestamp: Date.now() - 30000,
      llmInfo: { providerId: "openai", modelId: "gpt-4o" },
    },
    {
      id: "msg-3",
      role: "assistant",
      content: "Hi! How can I help you today?",
      timestamp: Date.now() - 15000,
      llmInfo: { providerId: "openai", modelId: "gpt-4o" },
    },
    {
      id: "msg-4",
      role: "user",
      content: "Tell me about TypeScript.",
      timestamp: Date.now(),
      llmInfo: { providerId: "anthropic", modelId: "claude-sonnet-4-20250514" },
    },
  ],
  providerId: "anthropic",
  modelId: "claude-sonnet-4-20250514",
});

/**
 * プロバイダー切り替えシナリオ
 */
export const switchProviderScenarios = {
  openaiToAnthropic: createMockIPCChatRequest({
    providerId: "anthropic",
    modelId: "claude-sonnet-4-20250514",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Previous OpenAI message",
        timestamp: Date.now() - 10000,
        llmInfo: { providerId: "openai", modelId: "gpt-4o" },
      },
      {
        id: "msg-2",
        role: "assistant",
        content: "OpenAI response",
        timestamp: Date.now() - 5000,
        llmInfo: { providerId: "openai", modelId: "gpt-4o" },
      },
      {
        id: "msg-3",
        role: "user",
        content: "Now using Claude",
        timestamp: Date.now(),
        llmInfo: {
          providerId: "anthropic",
          modelId: "claude-sonnet-4-20250514",
        },
      },
    ],
  }),
  anthropicToGoogle: createMockIPCChatRequest({
    providerId: "google",
    modelId: "gemini-2.0-flash",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Previous Claude message",
        timestamp: Date.now() - 10000,
        llmInfo: {
          providerId: "anthropic",
          modelId: "claude-sonnet-4-20250514",
        },
      },
      {
        id: "msg-2",
        role: "assistant",
        content: "Claude response",
        timestamp: Date.now() - 5000,
        llmInfo: {
          providerId: "anthropic",
          modelId: "claude-sonnet-4-20250514",
        },
      },
      {
        id: "msg-3",
        role: "user",
        content: "Now using Gemini",
        timestamp: Date.now(),
        llmInfo: { providerId: "google", modelId: "gemini-2.0-flash" },
      },
    ],
  }),
};
```

### 2.8 HealthCheckResult フィクスチャ

```typescript
// packages/shared/src/test/fixtures/health-check.fixture.ts

import { HealthCheckResult, LLMProviderId } from "../types/llm";

/**
 * テスト用ヘルスチェック結果ファクトリ
 */
export const createMockHealthCheck = (
  providerId: LLMProviderId,
  isHealthy: boolean,
  overrides: Partial<HealthCheckResult> = {},
): HealthCheckResult => ({
  providerId,
  isHealthy,
  latency: isHealthy ? Math.floor(Math.random() * 500) + 100 : undefined,
  checkedAt: Date.now(),
  error: isHealthy ? undefined : "Connection failed",
  ...overrides,
});

/**
 * 全プロバイダー正常
 */
export const allHealthy: Record<LLMProviderId, HealthCheckResult> = {
  openai: createMockHealthCheck("openai", true, { latency: 150 }),
  anthropic: createMockHealthCheck("anthropic", true, { latency: 200 }),
  google: createMockHealthCheck("google", true, { latency: 180 }),
  xai: createMockHealthCheck("xai", true, { latency: 220 }),
};

/**
 * 一部異常
 */
export const partialHealthy: Record<LLMProviderId, HealthCheckResult> = {
  openai: createMockHealthCheck("openai", true, { latency: 150 }),
  anthropic: createMockHealthCheck("anthropic", false, { error: "Rate limit" }),
  google: createMockHealthCheck("google", true, { latency: 180 }),
  xai: createMockHealthCheck("xai", false, { error: "Service unavailable" }),
};

/**
 * 全プロバイダー異常
 */
export const allUnhealthy: Record<LLMProviderId, HealthCheckResult> = {
  openai: createMockHealthCheck("openai", false, { error: "Network error" }),
  anthropic: createMockHealthCheck("anthropic", false, {
    error: "API key invalid",
  }),
  google: createMockHealthCheck("google", false, { error: "Timeout" }),
  xai: createMockHealthCheck("xai", false, { error: "Service unavailable" }),
};
```

---

## 3. Zustand State フィクスチャ

### 3.1 LLMSlice 初期状態

```typescript
// apps/desktop/src/test/fixtures/llm-slice.fixture.ts

import { LLMState } from "../stores/llmSlice";
import { mockProviders, mockConfigs, allHealthy } from "./llm-fixtures";

/**
 * 初期状態
 */
export const initialLLMState: LLMState = {
  providers: [],
  selectedProviderId: null,
  selectedModelId: null,
  configs: {},
  healthStatus: {
    openai: null,
    anthropic: null,
    google: null,
    xai: null,
  },
  isLoading: false,
  error: null,
};

/**
 * プロバイダー読み込み完了状態
 */
export const loadedLLMState: LLMState = {
  providers: Object.values(mockProviders),
  selectedProviderId: "openai",
  selectedModelId: "gpt-4o",
  configs: mockConfigs,
  healthStatus: allHealthy,
  isLoading: false,
  error: null,
};

/**
 * ローディング中状態
 */
export const loadingLLMState: LLMState = {
  ...initialLLMState,
  isLoading: true,
};

/**
 * エラー状態
 */
export const errorLLMState: LLMState = {
  ...initialLLMState,
  error: {
    code: "LLM_NETWORK_ERROR",
    message: "Failed to load providers",
  },
};
```

### 3.2 ChatSlice 初期状態

```typescript
// apps/desktop/src/test/fixtures/chat-slice.fixture.ts

import { ChatState } from "../stores/chatSlice";

/**
 * 初期状態
 */
export const initialChatState: ChatState = {
  conversations: {},
  activeConversationId: null,
  isStreaming: false,
  streamingMessageId: null,
};

/**
 * アクティブ会話あり状態
 */
export const activeConversationState: ChatState = {
  conversations: {
    "conv-1": {
      id: "conv-1",
      title: "Test Conversation",
      messages: [
        {
          id: "msg-1",
          role: "user",
          content: "Hello!",
          timestamp: Date.now() - 60000,
          llmInfo: { providerId: "openai", modelId: "gpt-4o" },
        },
        {
          id: "msg-2",
          role: "assistant",
          content: "Hi! How can I help?",
          timestamp: Date.now() - 30000,
          llmInfo: { providerId: "openai", modelId: "gpt-4o" },
        },
      ],
      createdAt: Date.now() - 120000,
      updatedAt: Date.now() - 30000,
    },
  },
  activeConversationId: "conv-1",
  isStreaming: false,
  streamingMessageId: null,
};

/**
 * ストリーミング中状態
 */
export const streamingState: ChatState = {
  ...activeConversationState,
  isStreaming: true,
  streamingMessageId: "msg-3",
  conversations: {
    "conv-1": {
      ...activeConversationState.conversations["conv-1"],
      messages: [
        ...activeConversationState.conversations["conv-1"].messages,
        {
          id: "msg-3",
          role: "assistant",
          content: "Streaming response...",
          timestamp: Date.now(),
          llmInfo: {
            providerId: "anthropic",
            modelId: "claude-sonnet-4-20250514",
          },
          isStreaming: true,
        },
      ],
    },
  },
};

/**
 * マルチプロバイダー会話状態
 */
export const multiProviderConversationState: ChatState = {
  conversations: {
    "conv-multi": {
      id: "conv-multi",
      title: "Multi-Provider Chat",
      messages: [
        {
          id: "msg-1",
          role: "user",
          content: "Question for OpenAI",
          timestamp: Date.now() - 90000,
          llmInfo: { providerId: "openai", modelId: "gpt-4o" },
        },
        {
          id: "msg-2",
          role: "assistant",
          content: "Response from GPT-4o",
          timestamp: Date.now() - 80000,
          llmInfo: { providerId: "openai", modelId: "gpt-4o" },
        },
        {
          id: "msg-3",
          role: "user",
          content: "Question for Claude",
          timestamp: Date.now() - 60000,
          llmInfo: {
            providerId: "anthropic",
            modelId: "claude-sonnet-4-20250514",
          },
        },
        {
          id: "msg-4",
          role: "assistant",
          content: "Response from Claude Sonnet 4",
          timestamp: Date.now() - 50000,
          llmInfo: {
            providerId: "anthropic",
            modelId: "claude-sonnet-4-20250514",
          },
        },
        {
          id: "msg-5",
          role: "user",
          content: "Question for Gemini",
          timestamp: Date.now() - 30000,
          llmInfo: { providerId: "google", modelId: "gemini-2.0-flash" },
        },
        {
          id: "msg-6",
          role: "assistant",
          content: "Response from Gemini",
          timestamp: Date.now() - 20000,
          llmInfo: { providerId: "google", modelId: "gemini-2.0-flash" },
        },
      ],
      createdAt: Date.now() - 120000,
      updatedAt: Date.now() - 20000,
    },
  },
  activeConversationId: "conv-multi",
  isStreaming: false,
  streamingMessageId: null,
};
```

---

## 4. ユーティリティ関数

### 4.1 一意性生成ユーティリティ

```typescript
// packages/shared/src/test/utils/unique-generator.ts

/**
 * テスト用一意性生成ユーティリティ
 */
export const uniqueGen = {
  /**
   * 一意のID生成
   */
  id: (): string =>
    `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,

  /**
   * 一意のリクエストID生成
   */
  requestId: (): string =>
    `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,

  /**
   * 一意の会話ID生成
   */
  conversationId: (): string =>
    `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,

  /**
   * 一意のメッセージID生成
   */
  messageId: (): string =>
    `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,

  /**
   * テスト名に基づく一意の値生成
   */
  fromTestName: (testName: string, prefix: string = ""): string => {
    const sanitized = testName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
    return `${prefix}${sanitized}_${Date.now()}`;
  },
};
```

### 4.2 ストリーム生成ユーティリティ

```typescript
// packages/shared/src/test/utils/stream-generator.ts

import { LLMStreamChunk } from "../types/llm";
import {
  createContentChunk,
  createDoneChunk,
  createErrorChunk,
} from "../fixtures/llm-stream-chunk.fixture";

/**
 * AsyncIterableストリームを生成
 */
export async function* generateMockStream(
  content: string,
  chunkSize: number = 5,
  delayMs: number = 0,
): AsyncIterable<LLMStreamChunk> {
  const chunks = content.match(new RegExp(`.{1,${chunkSize}}`, "g")) || [];

  for (let i = 0; i < chunks.length; i++) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    yield createContentChunk(chunks[i], i);
  }

  yield createDoneChunk({
    promptTokens: 10,
    completionTokens: chunks.length * chunkSize,
    totalTokens: 10 + chunks.length * chunkSize,
  });
}

/**
 * エラーで終了するストリーム生成
 */
export async function* generateErrorStream(
  partialContent: string,
  errorCode: string,
  errorMessage: string,
): AsyncIterable<LLMStreamChunk> {
  yield createContentChunk(partialContent, 0);
  yield createErrorChunk(errorCode, errorMessage);
}
```

---

## 5. クリーンアップ戦略

### 5.1 テスト間分離

```typescript
// packages/shared/src/test/setup/test-isolation.ts

import { beforeEach, afterEach } from "vitest";

/**
 * Zustand store のリセット
 */
export const setupStoreReset = () => {
  beforeEach(() => {
    // Store を初期状態にリセット
  });

  afterEach(() => {
    // グローバル状態のクリア
  });
};

/**
 * モックのクリア
 */
export const setupMockClear = () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });
};
```

### 5.2 テスト実行順序

| 順序 | フェーズ   | 処理内容                       |
| ---- | ---------- | ------------------------------ |
| 1    | beforeAll  | グローバルモック設定           |
| 2    | beforeEach | Store 初期化、フィクスチャ生成 |
| 3    | test       | テスト実行                     |
| 4    | afterEach  | モッククリア、状態リセット     |
| 5    | afterAll   | グローバルクリーンアップ       |

---

## 6. 関連ドキュメント

| ドキュメント | パス                                         |
| ------------ | -------------------------------------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`      |
| スキーマ設計 | `outputs/phase-2/schema-design.md`           |
| API仕様      | `outputs/phase-2/api-specification.md`       |
| 状態管理設計 | `outputs/phase-2/state-management-design.md` |

---

## 7. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-07 | 初版作成 |
