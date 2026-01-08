# API仕様 - チャット内LLMモデル切り替え機能

## メタ情報

| 項目   | 内容                     |
| ------ | ------------------------ |
| 機能名 | chat-multi-llm-switching |
| Phase  | 2                        |
| 作成日 | 2026-01-07               |
| スキル | api-client-patterns      |

---

## 1. LLMアダプターインターフェース

### 1.1 ILLMAdapter

各LLMプロバイダーを統一的に扱うための共通インターフェース。

```typescript
// packages/shared/src/interfaces/llm/llm-adapter.ts

export interface ILLMAdapter {
  /** プロバイダーID */
  readonly providerId: LLMProviderId;

  /** プロバイダー名（表示用） */
  readonly providerName: string;

  /**
   * 同期チャット送信
   * @param request - チャットリクエスト
   * @returns チャットレスポンス
   */
  chat(request: LLMChatRequest): Promise<LLMChatResponse>;

  /**
   * ストリーミングチャット送信
   * @param request - チャットリクエスト
   * @returns ストリームチャンクのAsyncIterable
   */
  chatStream(request: LLMChatRequest): AsyncIterable<LLMStreamChunk>;

  /**
   * ヘルスチェック
   * @returns 接続状態
   */
  healthCheck(): Promise<HealthCheckResult>;

  /**
   * 利用可能モデル一覧取得
   * @returns モデル一覧
   */
  getAvailableModels(): Promise<LLMModel[]>;
}
```

### 1.2 ILLMAdapterFactory

アダプターのファクトリインターフェース。

```typescript
// packages/shared/src/interfaces/llm/llm-adapter-factory.ts

export interface ILLMAdapterFactory {
  /**
   * アダプターを生成
   * @param providerId - プロバイダーID
   * @param config - 設定（APIキーなど）
   * @returns LLMアダプター
   */
  createAdapter(providerId: LLMProviderId, config: LLMConfig): ILLMAdapter;

  /**
   * サポートされているプロバイダー一覧を取得
   * @returns プロバイダーID一覧
   */
  getSupportedProviders(): LLMProviderId[];
}
```

---

## 2. データ型定義

### 2.1 プロバイダー関連型

```typescript
// packages/shared/src/types/llm/provider.ts

/** LLMプロバイダーID */
export type LLMProviderId = "openai" | "anthropic" | "google" | "xai";

/** LLMプロバイダー情報 */
export interface LLMProvider {
  id: LLMProviderId;
  name: string; // 表示名 (e.g., "OpenAI")
  icon?: string; // アイコンURL or パス
  isAvailable: boolean; // APIキー設定済みフラグ
  models: LLMModel[]; // 利用可能モデル一覧
}

/** LLMモデル情報 */
export interface LLMModel {
  id: string; // モデルID (e.g., "gpt-4o")
  name: string; // 表示名 (e.g., "GPT-4o")
  description?: string; // 説明文
  contextWindow?: number; // コンテキストウィンドウサイズ
  isDefault?: boolean; // デフォルトモデルフラグ
}

/** LLM設定 */
export interface LLMConfig {
  apiKey: string;
  baseUrl?: string; // カスタムエンドポイント（オプション）
  timeout?: number; // タイムアウト（デフォルト: 30000ms）
  maxRetries?: number; // 最大リトライ回数（デフォルト: 3）
}
```

### 2.2 リクエスト/レスポンス型

```typescript
// packages/shared/src/types/llm/request.ts

/** チャットリクエスト */
export interface LLMChatRequest {
  /** 会話履歴（コンテキスト） */
  messages: LLMMessage[];

  /** 使用するモデルID */
  modelId: string;

  /** システムプロンプト */
  systemPrompt?: string;

  /** 温度パラメータ（0.0-2.0） */
  temperature?: number;

  /** 最大トークン数 */
  maxTokens?: number;

  /** ストリーミング有効フラグ */
  stream?: boolean;
}

/** 会話メッセージ */
export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
```

```typescript
// packages/shared/src/types/llm/response.ts

/** チャットレスポンス */
export interface LLMChatResponse {
  /** 成功フラグ */
  success: boolean;

  /** レスポンスデータ */
  data?: {
    /** 生成されたメッセージ */
    message: string;

    /** 使用されたモデルID */
    modelId: string;

    /** 使用されたプロバイダーID */
    providerId: LLMProviderId;

    /** トークン使用量 */
    usage?: TokenUsage;

    /** 終了理由 */
    finishReason?: "stop" | "length" | "content_filter" | "tool_calls";
  };

  /** エラー情報 */
  error?: LLMError;
}

/** トークン使用量 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** ストリームチャンク */
export interface LLMStreamChunk {
  /** チャンクタイプ */
  type: "content" | "done" | "error";

  /** コンテンツ（type='content'の場合） */
  content?: string;

  /** 最終レスポンス（type='done'の場合） */
  response?: LLMChatResponse;

  /** エラー（type='error'の場合） */
  error?: LLMError;
}
```

### 2.3 エラー型

```typescript
// packages/shared/src/types/llm/error.ts

/** LLMエラー */
export interface LLMError {
  /** エラーコード */
  code: LLMErrorCode;

  /** エラーメッセージ */
  message: string;

  /** 元のエラー（デバッグ用） */
  originalError?: unknown;

  /** リトライ可能フラグ */
  retryable: boolean;

  /** 推奨待機時間（レート制限時） */
  retryAfter?: number;
}

/** エラーコード */
export type LLMErrorCode =
  | "API_KEY_MISSING" // APIキー未設定
  | "API_KEY_INVALID" // APIキー無効
  | "NETWORK_ERROR" // ネットワークエラー
  | "TIMEOUT" // タイムアウト
  | "RATE_LIMIT" // レート制限
  | "CONTEXT_LENGTH_EXCEEDED" // コンテキスト超過
  | "CONTENT_FILTER" // コンテンツフィルター
  | "MODEL_NOT_FOUND" // モデル不明
  | "SERVICE_UNAVAILABLE" // サービス停止
  | "UNKNOWN"; // 不明なエラー
```

### 2.4 ヘルスチェック型

```typescript
// packages/shared/src/types/llm/health.ts

/** ヘルスチェック結果 */
export interface HealthCheckResult {
  /** 接続状態 */
  status: "connected" | "disconnected" | "error";

  /** プロバイダーID */
  providerId: LLMProviderId;

  /** レイテンシ（ms） */
  latency?: number;

  /** エラーメッセージ */
  errorMessage?: string;

  /** チェック日時 */
  checkedAt: Date;
}
```

---

## 3. 各プロバイダーアダプター実装仕様

### 3.1 OpenAI Adapter

```typescript
// packages/shared/src/infrastructure/llm-adapters/openai-adapter.ts

export class OpenAIAdapter implements ILLMAdapter {
  readonly providerId = "openai" as const;
  readonly providerName = "OpenAI";

  constructor(private config: LLMConfig) {}

  async chat(request: LLMChatRequest): Promise<LLMChatResponse> {
    // OpenAI Chat Completions API呼び出し
    // エンドポイント: https://api.openai.com/v1/chat/completions
  }

  async *chatStream(request: LLMChatRequest): AsyncIterable<LLMStreamChunk> {
    // Server-Sent Events でストリーミング
  }

  async healthCheck(): Promise<HealthCheckResult> {
    // GET https://api.openai.com/v1/models でチェック
  }

  async getAvailableModels(): Promise<LLMModel[]> {
    return [
      { id: "gpt-4o", name: "GPT-4o", isDefault: true },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    ];
  }
}
```

**リクエスト変換**:

| 内部型フィールド | OpenAI APIフィールド       |
| ---------------- | -------------------------- |
| messages         | messages                   |
| modelId          | model                      |
| systemPrompt     | messages[0] (role: system) |
| temperature      | temperature                |
| maxTokens        | max_tokens                 |
| stream           | stream                     |

### 3.2 Anthropic Adapter

```typescript
// packages/shared/src/infrastructure/llm-adapters/anthropic-adapter.ts

export class AnthropicAdapter implements ILLMAdapter {
  readonly providerId = "anthropic" as const;
  readonly providerName = "Anthropic";

  constructor(private config: LLMConfig) {}

  // Anthropic Messages API呼び出し
  // エンドポイント: https://api.anthropic.com/v1/messages
}
```

**リクエスト変換**:

| 内部型フィールド | Anthropic APIフィールド |
| ---------------- | ----------------------- |
| messages         | messages（変換必要）    |
| modelId          | model                   |
| systemPrompt     | system                  |
| temperature      | temperature             |
| maxTokens        | max_tokens              |
| stream           | stream                  |

**注意点**:

- Anthropic APIは`system`を別フィールドで受け取る
- roleの`assistant`は変換不要だが、形式は若干異なる

### 3.3 Google AI Adapter

```typescript
// packages/shared/src/infrastructure/llm-adapters/google-adapter.ts

export class GoogleAIAdapter implements ILLMAdapter {
  readonly providerId = "google" as const;
  readonly providerName = "Google AI";

  constructor(private config: LLMConfig) {}

  // Google AI Gemini API呼び出し
  // エンドポイント: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
}
```

**リクエスト変換**:

| 内部型フィールド | Google AI APIフィールド          |
| ---------------- | -------------------------------- |
| messages         | contents（変換必要）             |
| modelId          | URL path parameter               |
| systemPrompt     | systemInstruction                |
| temperature      | generationConfig.temperature     |
| maxTokens        | generationConfig.maxOutputTokens |

### 3.4 xAI Adapter

```typescript
// packages/shared/src/infrastructure/llm-adapters/xai-adapter.ts

export class XAIAdapter implements ILLMAdapter {
  readonly providerId = "xai" as const;
  readonly providerName = "xAI";

  constructor(private config: LLMConfig) {}

  // xAI Grok API呼び出し（OpenAI互換）
  // エンドポイント: https://api.x.ai/v1/chat/completions
}
```

**注意点**:

- xAI APIはOpenAI互換のため、変換ロジックはOpenAIと同様

---

## 4. IPC API仕様

### 4.1 チャネル定義

| Channel             | Direction       | Request Type   | Response Type     |
| ------------------- | --------------- | -------------- | ----------------- |
| `llm:get-providers` | Renderer → Main | void           | LLMProvider[]     |
| `llm:chat`          | Renderer → Main | IPCChatRequest | void              |
| `llm:chat:response` | Main → Renderer | -              | LLMChatResponse   |
| `llm:chat:stream`   | Main → Renderer | -              | LLMStreamChunk    |
| `llm:health-check`  | Renderer → Main | LLMProviderId  | HealthCheckResult |
| `llm:cancel`        | Renderer → Main | void           | void              |

### 4.2 IPC型定義

```typescript
// apps/desktop/src/preload/types.ts

/** IPC チャットリクエスト */
export interface IPCChatRequest {
  /** 会話ID */
  conversationId: string;

  /** ユーザーメッセージ */
  message: string;

  /** 会話履歴 */
  history: LLMMessage[];

  /** 選択中のプロバイダーID */
  providerId: LLMProviderId;

  /** 選択中のモデルID */
  modelId: string;

  /** システムプロンプト */
  systemPrompt?: string;

  /** RAG有効フラグ */
  ragEnabled?: boolean;
}
```

### 4.3 Preload API

```typescript
// apps/desktop/src/preload/llm-api.ts

export interface LLMApi {
  /** プロバイダー一覧取得 */
  getProviders(): Promise<LLMProvider[]>;

  /** チャット送信 */
  sendChat(request: IPCChatRequest): Promise<void>;

  /** チャットキャンセル */
  cancelChat(): Promise<void>;

  /** ストリームチャンク受信登録 */
  onStreamChunk(callback: (chunk: LLMStreamChunk) => void): () => void;

  /** チャット完了受信登録 */
  onChatComplete(callback: (response: LLMChatResponse) => void): () => void;

  /** ヘルスチェック */
  checkHealth(providerId: LLMProviderId): Promise<HealthCheckResult>;
}

// window.llmApi として公開
declare global {
  interface Window {
    llmApi: LLMApi;
  }
}
```

---

## 5. エラーハンドリング仕様

### 5.1 エラー変換マッピング

| 外部APIエラー             | 内部エラーコード        | メッセージ例                     |
| ------------------------- | ----------------------- | -------------------------------- |
| 401 Unauthorized          | API_KEY_INVALID         | APIキーが無効です                |
| 403 Forbidden             | API_KEY_INVALID         | APIキーの権限が不足しています    |
| 404 Not Found             | MODEL_NOT_FOUND         | 指定されたモデルが見つかりません |
| 429 Too Many Requests     | RATE_LIMIT              | レート制限に達しました           |
| 500 Internal Server Error | SERVICE_UNAVAILABLE     | サービスが一時的に利用できません |
| 503 Service Unavailable   | SERVICE_UNAVAILABLE     | サービスが一時的に利用できません |
| Network Error             | NETWORK_ERROR           | ネットワーク接続に失敗しました   |
| Timeout                   | TIMEOUT                 | リクエストがタイムアウトしました |
| Context Length Exceeded   | CONTEXT_LENGTH_EXCEEDED | コンテキストの最大長を超えました |

### 5.2 リトライ戦略

```typescript
// packages/shared/src/infrastructure/llm-adapters/retry-strategy.ts

export interface RetryConfig {
  maxRetries: number; // デフォルト: 3
  initialDelay: number; // デフォルト: 1000ms
  maxDelay: number; // デフォルト: 30000ms
  backoffMultiplier: number; // デフォルト: 2
  retryableErrors: LLMErrorCode[];
}

// リトライ可能エラー
const RETRYABLE_ERRORS: LLMErrorCode[] = [
  "NETWORK_ERROR",
  "TIMEOUT",
  "RATE_LIMIT",
  "SERVICE_UNAVAILABLE",
];
```

---

## 6. テスト用モック仕様

### 6.1 MockLLMAdapter

```typescript
// packages/shared/src/__mocks__/llm-adapter.ts

export class MockLLMAdapter implements ILLMAdapter {
  readonly providerId = "mock" as LLMProviderId;
  readonly providerName = "Mock Provider";

  private responses: Map<string, LLMChatResponse> = new Map();

  /** モックレスポンスを設定 */
  setResponse(messagePattern: string, response: LLMChatResponse): void;

  /** エラーをシミュレート */
  simulateError(error: LLMError): void;

  /** レイテンシをシミュレート */
  setLatency(ms: number): void;
}
```

---

## 7. 関連ドキュメント

| ドキュメント       | パス                                         |
| ------------------ | -------------------------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     |
| 状態管理設計       | `outputs/phase-2/state-management-design.md` |
| スキーマ設計       | `outputs/phase-2/schema-design.md`           |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     |
