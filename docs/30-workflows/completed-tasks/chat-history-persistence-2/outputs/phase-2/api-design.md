# チャット履歴永続化機能 - API設計書

## 1. 概要

本ドキュメントはチャット履歴永続化機能のAPI設計を定義する。
Repository PatternとService Layerによる抽象化を採用している。

## 2. レイヤー構成

```
┌─────────────────────────────────────────┐
│              Service Layer              │
│         (ChatHistoryService)            │
├─────────────────────────────────────────┤
│            Repository Layer             │
│ (ChatSessionRepository, ChatMessageRepo)│
├─────────────────────────────────────────┤
│           Database (Drizzle ORM)        │
│              SQLite/Turso               │
└─────────────────────────────────────────┘
```

## 3. Service API

### 3.1 ChatHistoryService

ビジネスロジック層として、セッション管理、メッセージ保存、検索、エクスポート機能を提供。

#### 3.1.1 セッション管理

| メソッド                          | 説明                             | 機能要件       |
| --------------------------------- | -------------------------------- | -------------- |
| `createSession(userId, options?)` | 新規セッション作成               | FR-001         |
| `getSession(id)`                  | セッション取得                   | -              |
| `listSessions(userId)`            | セッション一覧取得               | FR-002         |
| `deleteSession(id)`               | セッション削除（ソフトデリート） | FR-003         |
| `updateSession(id, data)`         | セッション更新                   | FR-013, FR-014 |

#### 3.1.2 メッセージ管理

| メソッド                                            | 説明                       | 機能要件       |
| --------------------------------------------------- | -------------------------- | -------------- |
| `addUserMessage(sessionId, content)`                | ユーザーメッセージ追加     | FR-004         |
| `addAssistantMessage(sessionId, content, metadata)` | アシスタントメッセージ追加 | FR-005, FR-006 |
| `getMessages(sessionId)`                            | メッセージ一覧取得         | -              |

#### 3.1.3 検索・エクスポート

| メソッド                                | 説明                 | 機能要件 |
| --------------------------------------- | -------------------- | -------- |
| `searchSessions(userId, query)`         | セッション検索       | FR-007   |
| `exportToMarkdown(sessionId, options?)` | Markdownエクスポート | FR-010   |
| `exportToJson(sessionId, options?)`     | JSONエクスポート     | FR-011   |

## 4. Repository API

### 4.1 ChatSessionRepository

セッションのCRUD操作を提供。

```typescript
interface ChatSessionRepository {
  // 作成・更新
  save(session: ChatSession): Promise<void>;
  update(id: string, data: UpdateChatSession): Promise<boolean>;

  // 取得
  findById(id: string): Promise<ChatSession | null>;
  findByUserId(userId: string): Promise<ChatSession[]>;
  findPinned(userId: string): Promise<ChatSession[]>;

  // 検索
  search(query: ChatSessionSearchQuery): Promise<ChatSession[]>;

  // 削除
  delete(id: string): Promise<boolean>;

  // ユーティリティ
  count(userId: string): Promise<number>;
  exists(id: string): Promise<boolean>;
}
```

### 4.2 ChatMessageRepository

メッセージのCRUD操作を提供。

```typescript
interface ChatMessageRepository {
  // 作成・更新
  save(message: ChatMessage): Promise<void>;
  update(id: string, data: UpdateChatMessage): Promise<boolean>;

  // 取得
  findById(id: string): Promise<ChatMessage | null>;
  findBySessionId(
    sessionId: string,
    options?: FindMessagesOptions,
  ): Promise<ChatMessage[]>;
  findByRole(sessionId: string, role: MessageRole): Promise<ChatMessage[]>;

  // 削除
  delete(id: string): Promise<boolean>;

  // ユーティリティ
  count(sessionId: string): Promise<number>;
  exists(id: string): Promise<boolean>;
}
```

## 5. 型定義

### 5.1 ChatSession

```typescript
interface ChatSession {
  id: string; // UUID v4
  userId: string; // ユーザーID
  title: string; // タイトル（3〜100文字）
  createdAt: string; // 作成日時（ISO 8601）
  updatedAt: string; // 更新日時（ISO 8601）
  messageCount: number; // メッセージ数
  isFavorite: boolean; // お気に入りフラグ
  isPinned: boolean; // ピン留めフラグ
  pinOrder: number | null; // ピン留め順序（1〜10）
  lastMessagePreview: string | null; // 最終メッセージプレビュー
  metadata: Record<string, unknown>; // 拡張メタデータ
  deletedAt: string | null; // 削除日時
}
```

### 5.2 ChatMessage

```typescript
interface ChatMessage {
  id: string; // UUID v4
  sessionId: string; // 親セッションID
  role: MessageRole; // "user" | "assistant"
  content: string; // メッセージ本文
  messageIndex: number; // セッション内順序
  timestamp: string; // 送信日時（ISO 8601）
  llmProvider: string | null; // LLMプロバイダー名
  llmModel: string | null; // LLMモデル名
  llmMetadata: LlmMetadata | null; // LLMメタデータ
  attachments: Attachment[]; // 添付ファイル情報
  systemPrompt: string | null; // システムプロンプト
  metadata: Record<string, unknown>; // 拡張メタデータ
}
```

### 5.3 LlmMetadata

```typescript
interface LlmMetadata {
  provider: string; // プロバイダー名
  model: string; // モデル名
  tokenUsage?: {
    inputTokens: number; // 入力トークン数
    outputTokens: number; // 出力トークン数
  };
  responseTimeMs?: number; // 応答時間（ミリ秒）
}
```

### 5.4 検索クエリ

```typescript
interface ChatSessionSearchQuery {
  userId: string; // ユーザーID（必須）
  query?: string; // FTS5検索クエリ
  isFavorite?: boolean; // お気に入りフィルター
  isPinned?: boolean; // ピン留めフィルター
  limit?: number; // 取得件数制限
  offset?: number; // オフセット
}
```

## 6. エラーハンドリング

| エラー条件                         | 対応                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| セッションが見つからない           | `Error("セッションが見つかりません")`                    |
| ピン留め上限超過（10件）           | `Error("ピン留めは最大10件までです")`                    |
| LLMメタデータ未設定（assistant時） | `Error("role=assistantの場合、LLMメタデータが必須です")` |

## 7. 実装状況

| ファイル                                                            | ステータス |
| ------------------------------------------------------------------- | ---------- |
| `packages/shared/src/repositories/chat-session-repository.ts`       | 完了       |
| `packages/shared/src/repositories/chat-message-repository.ts`       | 完了       |
| `packages/shared/src/features/chat-history/chat-history-service.ts` | 完了       |
| `packages/shared/src/types/chat-session.ts`                         | 完了       |
| `packages/shared/src/types/chat-message.ts`                         | 完了       |
| `packages/shared/src/types/llm-metadata.ts`                         | 完了       |
