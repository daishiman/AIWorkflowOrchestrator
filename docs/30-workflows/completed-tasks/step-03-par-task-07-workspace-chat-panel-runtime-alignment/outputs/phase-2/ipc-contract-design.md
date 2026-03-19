# Phase 2: IPC 契約設計

## StreamChatRequest

```typescript
interface StreamChatRequest {
  modelId: string; // 必須。P62: null/undefined は VALIDATION_ERROR
  providerId: LLMProviderId; // 必須。P62: 省略不可
  temperature: number;
  stream: true;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}
```

### P42 3段バリデーション（handleStreamChat 先頭）

```typescript
// modelId
if (typeof request.modelId !== "string" || request.modelId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "modelId is required",
    retryable: false,
  };
}
// providerId
if (
  typeof request.providerId !== "string" ||
  request.providerId.trim() === ""
) {
  throw {
    code: "VALIDATION_ERROR",
    message: "providerId is required",
    retryable: false,
  };
}
```

## StreamChatResponse

```typescript
interface StreamChatResponse {
  requestId: string; // cancel 用の一意識別子
}
```

## StreamChunk (Main → Renderer イベント)

```typescript
interface StreamChunk {
  type: "content" | "error" | "done";
  content?: string; // type=content 時
  error?: StreamError; // type=error 時
}
```

## StreamError

```typescript
interface StreamError {
  code:
    | "VALIDATION_ERROR"
    | "API_KEY_MISSING"
    | "MODEL_NOT_FOUND"
    | "NETWORK_ERROR";
  message: string;
  retryable: boolean;
}
```

## CancelStreamRequest / Response

```typescript
interface CancelStreamRequest {
  requestId: string;
}

interface CancelStreamResponse {
  success: boolean;
}
```

## ConversationCreateRequest / Response

```typescript
interface ConversationCreateRequest {
  userId: string;
  title: string;
}

interface ConversationCreateResponse {
  success: boolean;
  data?: { id: string };
  error?: { message: string };
}
```

## ConversationAddMessageRequest / Response

```typescript
interface ConversationAddMessageRequest {
  sessionId: string;
  message: {
    role: "user" | "assistant";
    content: string;
    llmProvider?: string; // GAP-05 対策: assistant メッセージに使用 provider を記録
    llmModel?: string; // GAP-05 対策: assistant メッセージに使用 model を記録
  };
}

interface ConversationAddMessageResponse {
  success: boolean;
  error?: { message: string };
}
```

## エラーコード体系

| code             | 分類      | 発生条件                           | retryable | UI 表示方針                   |
| ---------------- | --------- | ---------------------------------- | --------- | ----------------------------- |
| VALIDATION_ERROR | fail-fast | modelId/providerId 未設定 or 空    | false     | GuidanceBlock                 |
| API_KEY_MISSING  | guidance  | API key 未設定                     | false     | GuidanceBlock + Settings 誘導 |
| MODEL_NOT_FOUND  | fail-fast | 指定 model が adapter で未サポート | false     | エラーメッセージ              |
| NETWORK_ERROR    | guidance  | 接続失敗 / タイムアウト            | true      | 再送信ボタン表示              |
