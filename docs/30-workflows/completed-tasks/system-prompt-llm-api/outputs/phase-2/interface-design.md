# インターフェース設計書 - システムプロンプトのLLM API統合

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| タスクID   | TASK-CHAT-SYSPROMPT-LLM-001 |
| Phase      | 2                           |
| 作成日     | 2026-01-23                  |
| ステータス | 完了                        |

---

## 1. 既存インターフェース（変更なし）

### 1.1 AIChatRequest

```typescript
// apps/desktop/src/preload/types.ts（既存）
export interface AIChatRequest {
  /** ユーザーメッセージ */
  message: string;
  /** システムプロンプト（オプション） */
  systemPrompt?: string;
  /** RAG機能有効化フラグ */
  ragEnabled: boolean;
  /** 会話ID（既存会話の続きの場合） */
  conversationId?: string;
}
```

### 1.2 AIChatResponse

```typescript
// apps/desktop/src/preload/types.ts（既存）
export interface AIChatResponse {
  /** 成功/失敗フラグ */
  success: boolean;
  /** 成功時のデータ */
  data?: {
    /** AI応答メッセージ */
    message: string;
    /** 会話ID */
    conversationId: string;
    /** RAG参照元（オプション） */
    ragSources?: string[];
  };
  /** 失敗時のエラーメッセージ */
  error?: string;
}
```

---

## 2. 新規インターフェース

### 2.1 buildMessages関数

```typescript
// apps/desktop/src/main/utils/buildMessages.ts（新規）

import type { LLMMessage } from "@repo/shared/types/llm/schemas";

/**
 * ユーザーメッセージとシステムプロンプトからLLMメッセージ配列を構築
 *
 * @param userMessage - ユーザーの入力メッセージ
 * @param systemPrompt - システムプロンプト（オプション）
 * @returns LLMメッセージ配列
 *
 * @example
 * // システムプロンプトあり
 * buildMessages("こんにちは", "あなたは親切なアシスタントです")
 * // => [
 * //   { role: "system", content: "あなたは親切なアシスタントです" },
 * //   { role: "user", content: "こんにちは" }
 * // ]
 *
 * @example
 * // システムプロンプトなし
 * buildMessages("こんにちは")
 * // => [{ role: "user", content: "こんにちは" }]
 */
export function buildMessages(
  userMessage: string,
  systemPrompt?: string,
): LLMMessage[] {
  const messages: LLMMessage[] = [];

  // システムプロンプトがある場合、先頭に追加
  if (systemPrompt && systemPrompt.trim().length > 0) {
    messages.push({
      role: "system",
      content: systemPrompt.trim(),
    });
  }

  // ユーザーメッセージを追加
  messages.push({
    role: "user",
    content: userMessage,
  });

  return messages;
}
```

### 2.2 LLMMessage型（既存・参照）

```typescript
// @repo/shared/types/llm/schemas（既存）
export interface LLMMessage {
  /** メッセージロール */
  role: "system" | "user" | "assistant";
  /** メッセージ内容 */
  content: string;
}
```

---

## 3. 内部インターフェース

### 3.1 aiHandlers内部型

```typescript
// aiHandlers.ts内部で使用

/**
 * LLM呼び出しに必要な設定
 */
interface LLMCallConfig {
  /** プロバイダーID */
  providerId: LLMProviderId;
  /** モデルID */
  modelId: string;
}

/**
 * プロバイダー/モデル設定取得結果
 */
interface ProviderModelConfig {
  /** プロバイダーID */
  providerId: LLMProviderId;
  /** モデルID */
  modelId: string;
  /** APIキーが設定されているか */
  hasApiKey: boolean;
}
```

### 3.2 エラー変換インターフェース

```typescript
/**
 * LLMErrorからAIChatResponseのerror文字列への変換
 */
function convertLLMErrorToMessage(error: LLMError): string {
  const errorMessages: Record<LLMErrorCode, string> = {
    API_KEY_MISSING:
      "APIキーが設定されていません。設定画面でAPIキーを登録してください。",
    API_KEY_INVALID: "APIキーが無効です。正しいAPIキーを設定してください。",
    NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください。",
    TIMEOUT: "リクエストがタイムアウトしました。再度お試しください。",
    RATE_LIMIT:
      "APIのレート制限に達しました。しばらく待ってから再度お試しください。",
    CONTEXT_LENGTH_EXCEEDED:
      "メッセージが長すぎます。短くして再度お試しください。",
    CONTENT_FILTER: "コンテンツフィルターによりブロックされました。",
    MODEL_NOT_FOUND: "指定されたモデルが見つかりません。",
    SERVICE_UNAVAILABLE:
      "サービスが一時的に利用できません。しばらく待ってから再度お試しください。",
    UNKNOWN: "エラーが発生しました。",
  };

  return errorMessages[error.code] ?? error.message;
}
```

---

## 4. IPC契約

### 4.1 AI_CHATチャンネル

| 項目         | 値                                     |
| ------------ | -------------------------------------- |
| チャンネル名 | `IPC_CHANNELS.AI_CHAT`                 |
| メソッド     | `invoke`                               |
| 入力型       | `AIChatRequest`                        |
| 出力型       | `Promise<AIChatResponse>`              |
| エラー処理   | 例外はキャッチしてAIChatResponseで返却 |

### 4.2 契約（変更なし）

```typescript
// 既存の契約を維持
// Renderer側のコード変更は不要

// Renderer Process
const response = await window.api.aiChat({
  message: "こんにちは",
  systemPrompt: "あなたは親切なアシスタントです",
  ragEnabled: false,
});

if (response.success) {
  console.log(response.data.message);
} else {
  console.error(response.error);
}
```

---

## 5. 型安全性

### 5.1 型変換フロー

```typescript
// 1. AIChatRequest（入力）
//    ↓
// 2. LLMChatRequestInput（アダプター用に変換）
//    ↓
// 3. AdapterChatResponse（アダプターからの戻り値）
//    ↓
// 4. AIChatResponse（出力）

// 変換処理
function createLLMRequest(
  request: AIChatRequest,
  config: LLMCallConfig,
): LLMChatRequestInput {
  return {
    messages: buildMessages(request.message, request.systemPrompt),
    modelId: config.modelId,
    providerId: config.providerId,
    // デフォルト値
    temperature: undefined, // アダプターのデフォルトを使用
    maxTokens: undefined, // アダプターのデフォルトを使用
    stream: false,
  };
}

function createAIChatResponse(
  adapterResponse: AdapterChatResponse,
  conversationId: string,
  ragEnabled: boolean,
): AIChatResponse {
  return {
    success: true,
    data: {
      message: adapterResponse.content,
      conversationId,
      ragSources: ragEnabled ? [] : undefined, // RAG未実装
    },
  };
}
```

### 5.2 Zodバリデーション（オプション）

```typescript
// 必要に応じてランタイムバリデーションを追加可能
import { z } from "zod";

const AIChatRequestSchema = z.object({
  message: z.string().min(1),
  systemPrompt: z.string().optional(),
  ragEnabled: z.boolean(),
  conversationId: z.string().optional(),
});

// ハンドラー内で使用
const validatedRequest = AIChatRequestSchema.parse(request);
```

---

## 6. エラー型

### 6.1 LLMError（既存・参照）

```typescript
// @repo/shared/types/llm/schemas
export interface LLMError {
  /** エラーコード */
  code: LLMErrorCode;
  /** エラーメッセージ */
  message: string;
  /** リトライ可能か */
  retryable: boolean;
  /** リトライまでの待機時間（ミリ秒） */
  retryAfterMs?: number;
}

export type LLMErrorCode =
  | "API_KEY_MISSING"
  | "API_KEY_INVALID"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "CONTEXT_LENGTH_EXCEEDED"
  | "CONTENT_FILTER"
  | "MODEL_NOT_FOUND"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";
```

---

## 更新履歴

| 日付       | 版  | 変更内容 | 作成者 |
| ---------- | --- | -------- | ------ |
| 2026-01-23 | 1.0 | 初版作成 | Claude |
