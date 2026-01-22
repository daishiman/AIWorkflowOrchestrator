# Phase 2 - インターフェース整合性確認

## 確認日時

2026-01-22

---

## 1. Use Cases整合性確認

### 1.1 CreateChatSessionUseCase

| 項目              | packages/shared定義                                            | Context設計 | 整合性 |
| ----------------- | -------------------------------------------------------------- | ----------- | ------ |
| クラス名          | `CreateChatSessionUseCase`                                     | 同一        | ✅     |
| コンストラクタ    | `(sessionRepository: IChatSessionRepository)`                  | Factory経由 | ✅     |
| executeシグネチャ | `(input: CreateChatSessionInput) => Promise<Result<...>>`      | 同一        | ✅     |
| 入力型            | `{ userId: string, title?: string }`                           | 同一        | ✅     |
| 出力型            | `Result<{ session: ChatSessionDTO }, ChatHistoryUseCaseError>` | 同一        | ✅     |

### 1.2 AddUserMessageUseCase

| 項目              | packages/shared定義                                            | Context設計 | 整合性 |
| ----------------- | -------------------------------------------------------------- | ----------- | ------ |
| クラス名          | `AddUserMessageUseCase`                                        | 同一        | ✅     |
| コンストラクタ    | `(sessionRepo, messageRepo)`                                   | Factory経由 | ✅     |
| executeシグネチャ | `(input: AddUserMessageInput) => Promise<Result<...>>`         | 同一        | ✅     |
| 入力型            | `{ sessionId: string, content: string }`                       | 同一        | ✅     |
| 出力型            | `Result<{ message, updatedSession }, ChatHistoryUseCaseError>` | 同一        | ✅     |

### 1.3 AddAssistantMessageUseCase

| 項目              | packages/shared定義                                             | Context設計 | 整合性 |
| ----------------- | --------------------------------------------------------------- | ----------- | ------ |
| クラス名          | `AddAssistantMessageUseCase`                                    | 同一        | ✅     |
| コンストラクタ    | `(sessionRepo, messageRepo)`                                    | Factory経由 | ✅     |
| executeシグネチャ | `(input: AddAssistantMessageInput) => Promise<Result<...>>`     | 同一        | ✅     |
| 入力型            | `{ sessionId, content, llmModel?, llmProvider?, llmMetadata? }` | 同一        | ✅     |
| 出力型            | `Result<{ message, updatedSession }, ChatHistoryUseCaseError>`  | 同一        | ✅     |

### 1.4 TogglePinnedUseCase

| 項目              | packages/shared定義                                      | Context設計 | 整合性 |
| ----------------- | -------------------------------------------------------- | ----------- | ------ |
| クラス名          | `TogglePinnedUseCase`                                    | 同一        | ✅     |
| コンストラクタ    | `(sessionRepository: IChatSessionRepository)`            | Factory経由 | ✅     |
| executeシグネチャ | `(input: TogglePinnedInput) => Promise<Result<...>>`     | 同一        | ✅     |
| 入力型            | `{ sessionId: string }`                                  | 同一        | ✅     |
| 出力型            | `Result<{ session, isPinned }, ChatHistoryUseCaseError>` | 同一        | ✅     |

### 1.5 SearchSessionsUseCase

| 項目              | packages/shared定義                                             | Context設計 | 整合性 |
| ----------------- | --------------------------------------------------------------- | ----------- | ------ |
| クラス名          | `SearchSessionsUseCase`                                         | 同一        | ✅     |
| コンストラクタ    | `(sessionRepository: IChatSessionRepository)`                   | Factory経由 | ✅     |
| executeシグネチャ | `(input: SearchSessionsInput) => Promise<Result<...>>`          | 同一        | ✅     |
| 入力型            | `{ userId, keyword?, isFavorite?, isPinned?, limit?, offset? }` | 同一        | ✅     |
| 出力型            | `Result<{ sessions, total }, ChatHistoryUseCaseError>`          | 同一        | ✅     |

---

## 2. Repository Interface整合性確認

### 2.1 IChatSessionRepository

| メソッド     | シグネチャ                                              | Factory使用 | 整合性 |
| ------------ | ------------------------------------------------------- | ----------- | ------ |
| findById     | `(id: ChatSessionId) => Promise<ChatSession \| null>`   | ✅          | ✅     |
| findByUserId | `(userId: UserId, limit?, offset?) => Promise<...>`     | ✅          | ✅     |
| findPinned   | `(userId: UserId) => Promise<ChatSession[]>`            | ✅          | ✅     |
| search       | `(criteria: ChatSessionSearchCriteria) => Promise<...>` | ✅          | ✅     |
| save         | `(session: ChatSession) => Promise<void>`               | ✅          | ✅     |
| delete       | `(id: ChatSessionId) => Promise<void>`                  | ✅          | ✅     |
| exists       | `(id: ChatSessionId) => Promise<boolean>`               | ✅          | ✅     |
| countPinned  | `(userId: UserId) => Promise<number>`                   | ✅          | ✅     |

### 2.2 IChatMessageRepository

| メソッド              | シグネチャ                                            | Factory使用 | 整合性 |
| --------------------- | ----------------------------------------------------- | ----------- | ------ |
| findById              | `(id: ChatMessageId) => Promise<ChatMessage \| null>` | ✅          | ✅     |
| findBySessionId       | `(sessionId, limit?, offset?) => Promise<...>`        | ✅          | ✅     |
| findLatestBySessionId | `(sessionId) => Promise<ChatMessage \| null>`         | ✅          | ✅     |
| countBySessionId      | `(sessionId) => Promise<number>`                      | ✅          | ✅     |
| save                  | `(message: ChatMessage) => Promise<void>`             | ✅          | ✅     |
| saveMany              | `(messages: ChatMessage[]) => Promise<void>`          | ✅          | ✅     |
| delete                | `(id: ChatMessageId) => Promise<void>`                | ✅          | ✅     |
| deleteBySessionId     | `(sessionId) => Promise<void>`                        | ✅          | ✅     |

---

## 3. Result型整合性確認

### 3.1 Result型定義

```typescript
// packages/shared/src/core/Result.ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

### 3.2 Context設計での使用

| 項目     | 定義                      | 使用パターン   | 整合性 |
| -------- | ------------------------- | -------------- | ------ |
| 成功時   | `{ ok: true, value: T }`  | `result.value` | ✅     |
| 失敗時   | `{ ok: false, error: E }` | `result.error` | ✅     |
| 型ガード | `if (result.ok)`          | 設計通り       | ✅     |

---

## 4. DTO型整合性確認

### 4.1 ChatSessionDTO

```typescript
interface ChatSessionDTO {
  id: string;
  userId: string;
  title: string | null;
  lastMessagePreview: string | null;
  messageCount: number;
  isPinned: boolean;
  pinOrder: number | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**整合性**: ✅ MockProviderのモックデータと一致

### 4.2 ChatMessageDTO

```typescript
interface ChatMessageDTO {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  messageIndex: number;
  llmModel: string | null;
  llmProvider: string | null;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  } | null;
  createdAt: string;
}
```

**整合性**: ✅ MockProviderのモックデータと一致

---

## 5. エラー型整合性確認

### 5.1 ChatHistoryUseCaseError

```typescript
type ChatHistoryUseCaseError =
  | InvalidUserIdError
  | InvalidTitleError
  | InvalidSessionIdError
  | InvalidContentError
  | SessionNotFoundError
  | MaxPinnedSessionsError
  | RepositoryError;
```

### 5.2 エラーコード

| エラー                 | code                  | 整合性 |
| ---------------------- | --------------------- | ------ |
| InvalidUserIdError     | `INVALID_USER_ID`     | ✅     |
| InvalidTitleError      | `INVALID_TITLE`       | ✅     |
| InvalidSessionIdError  | `INVALID_SESSION_ID`  | ✅     |
| InvalidContentError    | `INVALID_CONTENT`     | ✅     |
| SessionNotFoundError   | `SESSION_NOT_FOUND`   | ✅     |
| MaxPinnedSessionsError | `MAX_PINNED_SESSIONS` | ✅     |
| RepositoryError        | `REPOSITORY_ERROR`    | ✅     |

---

## 6. Import/Export整合性確認

### 6.1 packages/sharedからのExport

```typescript
// packages/shared/src/features/chat-history/application/use-cases/index.ts
export { CreateChatSessionUseCase } from "./CreateChatSessionUseCase.js";
export { AddUserMessageUseCase } from "./AddUserMessageUseCase.js";
export { AddAssistantMessageUseCase } from "./AddAssistantMessageUseCase.js";
export { SearchSessionsUseCase } from "./SearchSessionsUseCase.js";
export { TogglePinnedUseCase } from "./TogglePinnedUseCase.js";
```

### 6.2 Context設計でのImport

```typescript
// apps/desktop/src/features/chat-history/hooks/useChatHistoryFactory.ts
import {
  CreateChatSessionUseCase,
  AddUserMessageUseCase,
  AddAssistantMessageUseCase,
  TogglePinnedUseCase,
  SearchSessionsUseCase,
  type IChatSessionRepository,
  type IChatMessageRepository,
} from "@repo/shared";
```

**整合性**: ✅ 全てのUse CasesとInterfaceが適切にexport/import可能

---

## 7. 総合評価

| カテゴリ             | 項目数 | 整合   | 不整合 |
| -------------------- | ------ | ------ | ------ |
| Use Cases            | 5      | 5      | 0      |
| Repository Interface | 2      | 2      | 0      |
| Result型             | 1      | 1      | 0      |
| DTO型                | 2      | 2      | 0      |
| エラー型             | 7      | 7      | 0      |
| Import/Export        | 7      | 7      | 0      |
| **合計**             | **24** | **24** | **0**  |

---

## 結論

**Phase 2 タスク5: 完了**

packages/sharedのUse Cases/Repository Interfaceとの整合性を確認した。
全24項目で整合性が確認され、Context設計との不整合は検出されなかった。
