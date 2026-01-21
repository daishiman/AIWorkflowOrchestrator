# チャット履歴 Use Case API仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
> 更新日: 2026-01-19
> 関連タスク: ARCH-001 Clean Architecture Refactoring

---

## 概要

チャット履歴機能のApplication LayerはUse Caseパターンで実装されている。
各Use Caseは単一責務を持ち、Result型でエラーを返却する。

---

## Use Cases

### CreateChatSessionUseCase

新規チャットセッションを作成する。

#### インターフェース

```typescript
class CreateChatSessionUseCase {
  constructor(sessionRepository: IChatSessionRepository);

  execute(input: CreateChatSessionInput): Promise<Result<ChatSessionDTO, UseCaseError>>;
}
```

#### 入力

| パラメータ | 型     | 必須 | 説明                        |
| ---------- | ------ | ---- | --------------------------- |
| userId     | string | ✅   | ユーザーID（UUID形式）      |
| title      | string | -    | タイトル（3-255文字、省略時「新規チャット」） |

#### 出力

**成功時**: `Ok<ChatSessionDTO>`

```typescript
{
  id: string;
  userId: string;
  title: string;
  isPinned: boolean;
  isFavorite: boolean;
  pinOrder: number | null;
  messageCount: number;
  preview: string;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}
```

#### エラー

| コード          | 説明               | HTTP Status |
| --------------- | ------------------ | ----------- |
| INVALID_USER_ID | ユーザーIDが無効   | 400         |
| INVALID_TITLE   | タイトルが無効     | 400         |
| REPOSITORY_ERROR| 保存に失敗         | 500         |

#### 使用例

```typescript
const useCase = new CreateChatSessionUseCase(sessionRepository);

const result = await useCase.execute({
  userId: "550e8400-e29b-41d4-a716-446655440000",
  title: "プロジェクト相談",
});

if (result.isOk()) {
  console.log("Created session:", result.value.id);
} else {
  console.error("Error:", result.error.code, result.error.message);
}
```

---

### AddUserMessageUseCase

ユーザーメッセージをセッションに追加する。

#### インターフェース

```typescript
class AddUserMessageUseCase {
  constructor(
    sessionRepository: IChatSessionRepository,
    messageRepository: IChatMessageRepository,
  );

  execute(input: AddUserMessageInput): Promise<Result<ChatMessageDTO, UseCaseError>>;
}
```

#### 入力

| パラメータ | 型     | 必須 | 説明                     |
| ---------- | ------ | ---- | ------------------------ |
| sessionId  | string | ✅   | セッションID（UUID形式） |
| content    | string | ✅   | メッセージ内容（1-100000文字） |

#### 出力

**成功時**: `Ok<ChatMessageDTO>`

```typescript
{
  id: string;
  sessionId: string;
  role: "user";
  content: string;
  createdAt: string;  // ISO 8601
}
```

#### エラー

| コード             | 説明                   | HTTP Status |
| ------------------ | ---------------------- | ----------- |
| INVALID_SESSION_ID | セッションIDが無効     | 400         |
| SESSION_NOT_FOUND  | セッションが存在しない | 404         |
| INVALID_CONTENT    | メッセージ内容が無効   | 400         |
| REPOSITORY_ERROR   | 保存に失敗             | 500         |

#### 使用例

```typescript
const useCase = new AddUserMessageUseCase(sessionRepository, messageRepository);

const result = await useCase.execute({
  sessionId: "session-uuid",
  content: "Clean Architectureについて教えてください",
});

if (result.isOk()) {
  console.log("Added message:", result.value.id);
}
```

---

### AddAssistantMessageUseCase

アシスタント（AI）メッセージをセッションに追加する。

#### インターフェース

```typescript
class AddAssistantMessageUseCase {
  constructor(
    sessionRepository: IChatSessionRepository,
    messageRepository: IChatMessageRepository,
  );

  execute(input: AddAssistantMessageInput): Promise<Result<ChatMessageDTO, UseCaseError>>;
}
```

#### 入力

| パラメータ | 型     | 必須 | 説明                     |
| ---------- | ------ | ---- | ------------------------ |
| sessionId  | string | ✅   | セッションID（UUID形式） |
| content    | string | ✅   | メッセージ内容（1-100000文字） |

#### 出力

**成功時**: `Ok<ChatMessageDTO>`

```typescript
{
  id: string;
  sessionId: string;
  role: "assistant";
  content: string;
  createdAt: string;  // ISO 8601
}
```

#### エラー

| コード             | 説明                   | HTTP Status |
| ------------------ | ---------------------- | ----------- |
| INVALID_SESSION_ID | セッションIDが無効     | 400         |
| SESSION_NOT_FOUND  | セッションが存在しない | 404         |
| INVALID_CONTENT    | メッセージ内容が無効   | 400         |
| REPOSITORY_ERROR   | 保存に失敗             | 500         |

---

### TogglePinnedUseCase

セッションのピン留め状態をトグルする。

#### インターフェース

```typescript
class TogglePinnedUseCase {
  constructor(sessionRepository: IChatSessionRepository);

  execute(input: TogglePinnedInput): Promise<Result<ChatSessionDTO, UseCaseError>>;
}
```

#### 入力

| パラメータ | 型     | 必須 | 説明                     |
| ---------- | ------ | ---- | ------------------------ |
| sessionId  | string | ✅   | セッションID（UUID形式） |

#### 出力

**成功時**: `Ok<ChatSessionDTO>` - 更新後のセッション情報

#### エラー

| コード                | 説明                     | HTTP Status |
| --------------------- | ------------------------ | ----------- |
| INVALID_SESSION_ID    | セッションIDが無効       | 400         |
| SESSION_NOT_FOUND     | セッションが存在しない   | 404         |
| PINNED_LIMIT_EXCEEDED | ピン留め上限（10件）超過 | 400         |
| REPOSITORY_ERROR      | 保存に失敗               | 500         |

#### ビジネスルール

- ピン留めは最大10件まで（BR-SESSION-002）
- 11件目をピン留めしようとするとエラー

#### 使用例

```typescript
const useCase = new TogglePinnedUseCase(sessionRepository);

const result = await useCase.execute({
  sessionId: "session-uuid",
});

if (result.isErr() && result.error.code === "PINNED_LIMIT_EXCEEDED") {
  alert("ピン留めは10件までです。他のピン留めを解除してください。");
}
```

---

### SearchSessionsUseCase

セッションをキーワード検索する。

#### インターフェース

```typescript
class SearchSessionsUseCase {
  constructor(sessionRepository: IChatSessionRepository);

  execute(input: SearchSessionsInput): Promise<Result<SearchResultDTO, UseCaseError>>;
}
```

#### 入力

| パラメータ | 型     | 必須 | 説明                     |
| ---------- | ------ | ---- | ------------------------ |
| userId     | string | ✅   | ユーザーID（UUID形式）   |
| query      | string | ✅   | 検索クエリ               |
| limit      | number | -    | 取得件数（デフォルト20） |
| offset     | number | -    | オフセット（デフォルト0）|

#### 出力

**成功時**: `Ok<SearchResultDTO>`

```typescript
{
  sessions: ChatSessionDTO[];
  total: number;
  hasMore: boolean;
}
```

#### エラー

| コード          | 説明             | HTTP Status |
| --------------- | ---------------- | ----------- |
| INVALID_USER_ID | ユーザーIDが無効 | 400         |
| INVALID_QUERY   | 検索クエリが無効 | 400         |

---

## DTOs

### ChatSessionDTO

```typescript
interface ChatSessionDTO {
  id: string;
  userId: string;
  title: string;
  isPinned: boolean;
  isFavorite: boolean;
  pinOrder: number | null;
  messageCount: number;
  preview: string;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}
```

### ChatMessageDTO

```typescript
interface ChatMessageDTO {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;  // ISO 8601
}
```

### SearchResultDTO

```typescript
interface SearchResultDTO {
  sessions: ChatSessionDTO[];
  total: number;
  hasMore: boolean;
}
```

---

## リポジトリインターフェース

### IChatSessionRepository

```typescript
interface IChatSessionRepository {
  findById(id: ChatSessionId): Promise<ChatSession | null>;
  findByUserId(userId: UserId): Promise<ChatSession[]>;
  findPinnedByUserId(userId: UserId): Promise<ChatSession[]>;
  save(session: ChatSession): Promise<Result<void, RepositoryError>>;
  delete(id: ChatSessionId): Promise<Result<void, RepositoryError>>;
  search(query: SearchQuery): Promise<SearchResult>;
  countPinnedByUserId(userId: UserId): Promise<number>;
}
```

### IChatMessageRepository

```typescript
interface IChatMessageRepository {
  findById(id: ChatMessageId): Promise<ChatMessage | null>;
  findBySessionId(sessionId: ChatSessionId): Promise<ChatMessage[]>;
  save(message: ChatMessage): Promise<Result<void, RepositoryError>>;
  delete(id: ChatMessageId): Promise<Result<void, RepositoryError>>;
}
```

---

## エラーハンドリングパターン

### Result型の使用

```typescript
// Use Case実行
const result = await useCase.execute(input);

// パターン1: isOk/isErr
if (result.isOk()) {
  const data = result.value;
} else {
  const error = result.error;
}

// パターン2: match
result.match({
  ok: (data) => console.log("Success:", data),
  err: (error) => console.error("Error:", error.code),
});

// パターン3: map/mapErr
const dto = result
  .map((session) => toDTO(session))
  .mapErr((err) => new UseCaseError("TRANSFORM_ERROR", err.message));
```

### UseCaseError構造

```typescript
class UseCaseError extends AppError {
  readonly code: string;
  readonly statusCode: number;
  readonly data?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    statusCode = 400,
    data?: Record<string, unknown>,
  );
}
```

---

## 将来の拡張

### 未実装Use Cases（予定）

| Use Case               | 説明                   |
| ---------------------- | ---------------------- |
| UpdateSessionTitleUseCase | タイトル更新        |
| ToggleFavoriteUseCase  | お気に入りトグル       |
| DeleteSessionUseCase   | セッション削除         |
| ExportSessionUseCase   | Markdown/JSONエクスポート |
| GetSessionDetailUseCase| セッション詳細取得     |

---

## 関連ドキュメント

- [アーキテクチャ仕様](./architecture-chat-history.md) - 全体構成
- [インターフェース仕様](./interfaces-chat-history.md) - 型定義・DB仕様
- [実装ガイド](../../../docs/30-workflows/clean-architecture-refactoring/outputs/phase-12/implementation-guide.md) - 実装詳細
