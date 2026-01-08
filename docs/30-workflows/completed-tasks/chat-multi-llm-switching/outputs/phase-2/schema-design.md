# スキーマ設計 - チャット内LLMモデル切り替え機能

## メタ情報

| 項目   | 内容                     |
| ------ | ------------------------ |
| 機能名 | chat-multi-llm-switching |
| Phase  | 2                        |
| 作成日 | 2026-01-07               |
| スキル | zod-validation           |

---

## 1. 概要

本ドキュメントでは、マルチLLM切り替え機能で使用するZodスキーマ定義を記述する。
スキーマは `packages/shared/src/types/llm/schemas/` に配置する。

---

## 2. プロバイダー関連スキーマ

### 2.1 LLMProviderId

```typescript
// packages/shared/src/types/llm/schemas/provider.ts

import { z } from "zod";

/** LLMプロバイダーID */
export const LLMProviderIdSchema = z.enum([
  "openai",
  "anthropic",
  "google",
  "xai",
]);

export type LLMProviderId = z.infer<typeof LLMProviderIdSchema>;
```

### 2.2 LLMModel

```typescript
/** LLMモデル */
export const LLMModelSchema = z.object({
  /** モデルID */
  id: z.string().min(1),

  /** 表示名 */
  name: z.string().min(1),

  /** 説明文 */
  description: z.string().optional(),

  /** コンテキストウィンドウサイズ */
  contextWindow: z.number().int().positive().optional(),

  /** デフォルトモデルフラグ */
  isDefault: z.boolean().default(false),
});

export type LLMModel = z.infer<typeof LLMModelSchema>;
```

### 2.3 LLMProvider

```typescript
/** LLMプロバイダー */
export const LLMProviderSchema = z.object({
  /** プロバイダーID */
  id: LLMProviderIdSchema,

  /** 表示名 */
  name: z.string().min(1),

  /** アイコンURL */
  icon: z.string().url().optional(),

  /** APIキー設定済みフラグ */
  isAvailable: z.boolean(),

  /** 利用可能モデル一覧 */
  models: z.array(LLMModelSchema).min(1),
});

export type LLMProvider = z.infer<typeof LLMProviderSchema>;
```

### 2.4 LLMConfig

```typescript
/** LLM設定 */
export const LLMConfigSchema = z.object({
  /** APIキー */
  apiKey: z.string().min(1),

  /** カスタムエンドポイント */
  baseUrl: z.string().url().optional(),

  /** タイムアウト（ms） */
  timeout: z.number().int().positive().default(30000),

  /** 最大リトライ回数 */
  maxRetries: z.number().int().min(0).max(10).default(3),
});

export type LLMConfig = z.infer<typeof LLMConfigSchema>;
```

---

## 3. リクエスト/レスポンススキーマ

### 3.1 LLMMessage

```typescript
// packages/shared/src/types/llm/schemas/message.ts

import { z } from "zod";

/** メッセージロール */
export const MessageRoleSchema = z.enum(["user", "assistant", "system"]);

/** LLMメッセージ */
export const LLMMessageSchema = z.object({
  /** ロール */
  role: MessageRoleSchema,

  /** 内容 */
  content: z.string(),
});

export type LLMMessage = z.infer<typeof LLMMessageSchema>;
```

### 3.2 LLMChatRequest

```typescript
// packages/shared/src/types/llm/schemas/request.ts

import { z } from "zod";
import { LLMMessageSchema } from "./message";

/** チャットリクエスト */
export const LLMChatRequestSchema = z.object({
  /** 会話履歴 */
  messages: z.array(LLMMessageSchema),

  /** モデルID */
  modelId: z.string().min(1),

  /** システムプロンプト */
  systemPrompt: z.string().optional(),

  /** 温度（0.0-2.0） */
  temperature: z.number().min(0).max(2).default(1.0),

  /** 最大トークン数 */
  maxTokens: z.number().int().positive().optional(),

  /** ストリーミング有効 */
  stream: z.boolean().default(false),
});

export type LLMChatRequest = z.infer<typeof LLMChatRequestSchema>;
```

### 3.3 LLMChatResponse

```typescript
// packages/shared/src/types/llm/schemas/response.ts

import { z } from "zod";
import { LLMProviderIdSchema } from "./provider";

/** トークン使用量 */
export const TokenUsageSchema = z.object({
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
});

export type TokenUsage = z.infer<typeof TokenUsageSchema>;

/** 終了理由 */
export const FinishReasonSchema = z.enum([
  "stop",
  "length",
  "content_filter",
  "tool_calls",
]);

/** レスポンスデータ */
export const LLMResponseDataSchema = z.object({
  /** 生成メッセージ */
  message: z.string(),

  /** モデルID */
  modelId: z.string(),

  /** プロバイダーID */
  providerId: LLMProviderIdSchema,

  /** トークン使用量 */
  usage: TokenUsageSchema.optional(),

  /** 終了理由 */
  finishReason: FinishReasonSchema.optional(),
});

/** チャットレスポンス */
export const LLMChatResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: LLMResponseDataSchema,
  }),
  z.object({
    success: z.literal(false),
    error: z.lazy(() => LLMErrorSchema),
  }),
]);

export type LLMChatResponse = z.infer<typeof LLMChatResponseSchema>;
```

### 3.4 LLMStreamChunk

```typescript
/** ストリームチャンク */
export const LLMStreamChunkSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("content"),
    content: z.string(),
  }),
  z.object({
    type: z.literal("done"),
    response: LLMChatResponseSchema,
  }),
  z.object({
    type: z.literal("error"),
    error: z.lazy(() => LLMErrorSchema),
  }),
]);

export type LLMStreamChunk = z.infer<typeof LLMStreamChunkSchema>;
```

---

## 4. エラースキーマ

### 4.1 LLMErrorCode

```typescript
// packages/shared/src/types/llm/schemas/error.ts

import { z } from "zod";

/** エラーコード */
export const LLMErrorCodeSchema = z.enum([
  "API_KEY_MISSING",
  "API_KEY_INVALID",
  "NETWORK_ERROR",
  "TIMEOUT",
  "RATE_LIMIT",
  "CONTEXT_LENGTH_EXCEEDED",
  "CONTENT_FILTER",
  "MODEL_NOT_FOUND",
  "SERVICE_UNAVAILABLE",
  "UNKNOWN",
]);

export type LLMErrorCode = z.infer<typeof LLMErrorCodeSchema>;
```

### 4.2 LLMError

```typescript
/** LLMエラー */
export const LLMErrorSchema = z.object({
  /** エラーコード */
  code: LLMErrorCodeSchema,

  /** エラーメッセージ */
  message: z.string(),

  /** 元のエラー */
  originalError: z.unknown().optional(),

  /** リトライ可能フラグ */
  retryable: z.boolean(),

  /** 推奨待機時間（秒） */
  retryAfter: z.number().int().positive().optional(),
});

export type LLMError = z.infer<typeof LLMErrorSchema>;
```

---

## 5. ヘルスチェックスキーマ

### 5.1 HealthCheckResult

```typescript
// packages/shared/src/types/llm/schemas/health.ts

import { z } from "zod";
import { LLMProviderIdSchema } from "./provider";

/** 接続状態 */
export const ConnectionStatusSchema = z.enum([
  "connected",
  "disconnected",
  "error",
]);

/** ヘルスチェック結果 */
export const HealthCheckResultSchema = z.object({
  /** 接続状態 */
  status: ConnectionStatusSchema,

  /** プロバイダーID */
  providerId: LLMProviderIdSchema,

  /** レイテンシ（ms） */
  latency: z.number().int().nonnegative().optional(),

  /** エラーメッセージ */
  errorMessage: z.string().optional(),

  /** チェック日時 */
  checkedAt: z.date(),
});

export type HealthCheckResult = z.infer<typeof HealthCheckResultSchema>;
```

---

## 6. IPC スキーマ

### 6.1 IPCChatRequest

```typescript
// packages/shared/src/types/llm/schemas/ipc.ts

import { z } from "zod";
import { LLMMessageSchema } from "./message";
import { LLMProviderIdSchema } from "./provider";

/** IPC チャットリクエスト */
export const IPCChatRequestSchema = z.object({
  /** 会話ID */
  conversationId: z.string().uuid(),

  /** ユーザーメッセージ */
  message: z.string().min(1),

  /** 会話履歴 */
  history: z.array(LLMMessageSchema),

  /** プロバイダーID */
  providerId: LLMProviderIdSchema,

  /** モデルID */
  modelId: z.string().min(1),

  /** システムプロンプト */
  systemPrompt: z.string().optional(),

  /** RAG有効フラグ */
  ragEnabled: z.boolean().default(false),
});

export type IPCChatRequest = z.infer<typeof IPCChatRequestSchema>;
```

---

## 7. 永続化スキーマ（SQLite）

### 7.1 ChatMessageWithLLM

```typescript
// packages/shared/src/types/llm/schemas/persistence.ts

import { z } from "zod";
import { LLMProviderIdSchema } from "./provider";

/** 永続化用メッセージ */
export const ChatMessageWithLLMSchema = z.object({
  /** メッセージID */
  id: z.string().uuid(),

  /** セッションID */
  sessionId: z.string().uuid(),

  /** ロール */
  role: z.enum(["user", "assistant"]),

  /** 内容 */
  content: z.string(),

  /** メッセージ順序 */
  messageIndex: z.number().int().nonnegative(),

  /** LLMモデルID（assistant時のみ） */
  llmModelId: z.string().nullable(),

  /** LLMプロバイダーID（assistant時のみ） */
  llmProvider: LLMProviderIdSchema.nullable(),

  /** LLMメタデータJSON */
  llmMetadata: z.record(z.unknown()).nullable(),

  /** 作成日時 */
  createdAt: z.date(),
});

export type ChatMessageWithLLM = z.infer<typeof ChatMessageWithLLMSchema>;
```

---

## 8. バリデーションユーティリティ

### 8.1 バリデーション関数

```typescript
// packages/shared/src/types/llm/schemas/validators.ts

import { z } from "zod";
import {
  LLMChatRequestSchema,
  LLMChatResponseSchema,
  IPCChatRequestSchema,
  LLMErrorSchema,
} from "./index";

/**
 * チャットリクエストをバリデート
 */
export function validateChatRequest(data: unknown): LLMChatRequest {
  return LLMChatRequestSchema.parse(data);
}

/**
 * チャットレスポンスをバリデート
 */
export function validateChatResponse(data: unknown): LLMChatResponse {
  return LLMChatResponseSchema.parse(data);
}

/**
 * IPCリクエストをバリデート
 */
export function validateIPCRequest(data: unknown): IPCChatRequest {
  return IPCChatRequestSchema.parse(data);
}

/**
 * エラーをバリデート
 */
export function validateError(data: unknown): LLMError {
  return LLMErrorSchema.parse(data);
}

/**
 * 安全なパース（エラー時はundefined）
 */
export function safeParseChatResponse(
  data: unknown,
): LLMChatResponse | undefined {
  const result = LLMChatResponseSchema.safeParse(data);
  return result.success ? result.data : undefined;
}
```

---

## 9. エクスポート

```typescript
// packages/shared/src/types/llm/schemas/index.ts

// プロバイダー
export * from "./provider";

// メッセージ
export * from "./message";

// リクエスト/レスポンス
export * from "./request";
export * from "./response";

// エラー
export * from "./error";

// ヘルスチェック
export * from "./health";

// IPC
export * from "./ipc";

// 永続化
export * from "./persistence";

// バリデーター
export * from "./validators";
```

---

## 10. 使用例

### 10.1 リクエストバリデーション

```typescript
import {
  validateIPCRequest,
  IPCChatRequest,
} from "@repo/shared/types/llm/schemas";

// IPCハンドラーでのバリデーション
ipcMain.handle("llm:chat", async (event, rawRequest: unknown) => {
  try {
    const request: IPCChatRequest = validateIPCRequest(rawRequest);
    // バリデーション成功、処理続行
    return await llmService.chat(request);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
          retryable: false,
        },
      };
    }
    throw error;
  }
});
```

### 10.2 レスポンスバリデーション

```typescript
import { safeParseChatResponse } from "@repo/shared/types/llm/schemas";

// 外部APIレスポンスのバリデーション
async function processApiResponse(rawResponse: unknown) {
  const response = safeParseChatResponse(rawResponse);
  if (!response) {
    return {
      success: false,
      error: {
        code: "UNKNOWN",
        message: "Invalid API response format",
        retryable: false,
      },
    };
  }
  return response;
}
```

---

## 11. 関連ドキュメント

| ドキュメント       | パス                                         |
| ------------------ | -------------------------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     |
| API仕様            | `outputs/phase-2/api-specification.md`       |
| 状態管理設計       | `outputs/phase-2/state-management-design.md` |
| UI設計             | `outputs/phase-2/ui-design.md`               |
