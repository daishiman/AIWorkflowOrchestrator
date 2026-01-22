# Phase 2 - Context型設計

## 確認日時

2026-01-22

---

## 1. ChatHistoryContextValue型設計

### 1.1 型定義

```typescript
import type { Result } from "@repo/shared";
import type {
  CreateChatSessionUseCase,
  AddUserMessageUseCase,
  AddAssistantMessageUseCase,
  TogglePinnedUseCase,
  SearchSessionsUseCase,
} from "@repo/shared";

/**
 * ChatHistory Context値の型定義
 *
 * 5種のUse Casesインスタンスと状態を保持する
 */
export interface ChatHistoryContextValue {
  // Use Cases
  createSession: CreateChatSessionUseCase;
  addUserMessage: AddUserMessageUseCase;
  addAssistantMessage: AddAssistantMessageUseCase;
  togglePinned: TogglePinnedUseCase;
  searchSessions: SearchSessionsUseCase;

  // State
  isReady: boolean;
}
```

### 1.2 設計根拠

| 項目          | 設計方針                                   |
| ------------- | ------------------------------------------ |
| Use Cases保持 | インスタンス参照を保持（メソッドではなく） |
| isReadyフラグ | DB接続完了を示すフラグ                     |
| 型安全性      | 全Use Casesを明示的に型定義                |

---

## 2. Context作成

### 2.1 Context定義

```typescript
import { createContext } from "react";

/**
 * ChatHistoryContext
 *
 * 初期値はnullとし、Provider外使用時の検出に使用
 */
export const ChatHistoryContext = createContext<ChatHistoryContextValue | null>(
  null,
);

ChatHistoryContext.displayName = "ChatHistoryContext";
```

### 2.2 設計根拠

| 項目         | 設計方針                         |
| ------------ | -------------------------------- | ----- |
| 初期値       | `null` - Provider外使用検出用    |
| displayName  | DevTools表示用（デバッグ容易性） |
| 型パラメータ | `ChatHistoryContextValue         | null` |

---

## 3. Provider外使用検出

### 3.1 Hook側での検出ロジック

```typescript
export function useChatHistory(): ChatHistoryContextValue {
  const context = useContext(ChatHistoryContext);

  if (context === null) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }

  return context;
}
```

### 3.2 エラーメッセージ

- 日本語: 使用しない（コードベースは英語統一）
- メッセージ: `"useChatHistory must be used within a ChatHistoryProvider"`
- 型: `Error`

---

## 4. Use Cases型の詳細

### 4.1 CreateChatSessionUseCase

```typescript
class CreateChatSessionUseCase {
  execute(
    input: CreateChatSessionInput,
  ): Promise<Result<CreateChatSessionOutput, ChatHistoryUseCaseError>>;
}

interface CreateChatSessionInput {
  userId: string;
  title?: string;
}

interface CreateChatSessionOutput {
  session: ChatSessionDTO;
}
```

### 4.2 AddUserMessageUseCase

```typescript
class AddUserMessageUseCase {
  execute(
    input: AddUserMessageInput,
  ): Promise<Result<AddUserMessageOutput, ChatHistoryUseCaseError>>;
}

interface AddUserMessageInput {
  sessionId: string;
  content: string;
}

interface AddUserMessageOutput {
  message: ChatMessageDTO;
  updatedSession: {
    lastMessagePreview: string;
    messageCount: number;
    updatedAt: string;
  };
}
```

### 4.3 AddAssistantMessageUseCase

```typescript
class AddAssistantMessageUseCase {
  execute(
    input: AddAssistantMessageInput,
  ): Promise<Result<AddAssistantMessageOutput, ChatHistoryUseCaseError>>;
}

interface AddAssistantMessageInput {
  sessionId: string;
  content: string;
  llmModel?: string;
  llmProvider?: string;
  llmMetadata?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    responseTime?: number;
    temperature?: number;
    maxTokens?: number;
  };
}
```

### 4.4 TogglePinnedUseCase

```typescript
class TogglePinnedUseCase {
  execute(
    input: TogglePinnedInput,
  ): Promise<Result<TogglePinnedOutput, ChatHistoryUseCaseError>>;
}

interface TogglePinnedInput {
  sessionId: string;
}

interface TogglePinnedOutput {
  session: ChatSessionDTO;
  isPinned: boolean;
}
```

### 4.5 SearchSessionsUseCase

```typescript
class SearchSessionsUseCase {
  execute(
    input: SearchSessionsInput,
  ): Promise<Result<SearchSessionsOutput, ChatHistoryUseCaseError>>;
}

interface SearchSessionsInput {
  userId: string;
  keyword?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  limit?: number;
  offset?: number;
}

interface SearchSessionsOutput {
  sessions: ChatSessionDTO[];
  total: number;
}
```

---

## 5. Result型パターン

Use Casesは全て`Result<T, E>`パターンを使用:

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

### 使用例

```typescript
const result = await createSession.execute({ userId: "user-1" });

if (result.ok) {
  // 成功時: result.value.session
  console.log(result.value.session);
} else {
  // 失敗時: result.error
  console.error(result.error.message);
}
```

---

## 結論

**Phase 2 タスク1: 完了**

ChatHistoryContextValueの型定義とContext作成方針が設計された。
