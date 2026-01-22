# Phase 1 - タスク2: スキーマ-エンティティ対応表

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 1                                 |
| タスク番号 | 2                                 |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## chat_sessions テーブル ⇔ ChatSession エンティティ

**DBスキーマパス**: `packages/shared/src/db/schema/chat-history.ts`
**エンティティパス**: `packages/shared/src/features/chat-history/domain/entities/ChatSession.ts`

### フィールド対応表

| DBカラム               | DBの型    | エンティティプロパティ | エンティティの型   | 型変換                        |
| ---------------------- | --------- | ---------------------- | ------------------ | ----------------------------- |
| `id`                   | `text`    | `_id`                  | `ChatSessionId`    | `string` ⇔ `ChatSessionId`    |
| `user_id`              | `text`    | `_userId`              | `UserId`           | `string` ⇔ `UserId`           |
| `title`                | `text`    | `_title`               | `ChatSessionTitle` | `string` ⇔ `ChatSessionTitle` |
| `created_at`           | `text`    | `_createdAt`           | `Date`             | `ISO 8601 string` ⇔ `Date`    |
| `updated_at`           | `text`    | `_updatedAt`           | `Date`             | `ISO 8601 string` ⇔ `Date`    |
| `message_count`        | `integer` | `_messageCount`        | `number`           | なし（同一型）                |
| `is_favorite`          | `integer` | `_isFavorite`          | `boolean`          | `0/1` ⇔ `false/true`          |
| `is_pinned`            | `integer` | `_isPinned`            | `boolean`          | `0/1` ⇔ `false/true`          |
| `pin_order`            | `integer` | `_pinOrder`            | `number \| null`   | なし（同一型）                |
| `last_message_preview` | `text`    | `_lastMessagePreview`  | `string \| null`   | なし（同一型）                |
| `metadata`             | `text`    | -                      | -                  | JSON文字列（将来拡張用）      |
| `deleted_at`           | `text`    | -                      | -                  | ソフトデリート用（将来対応）  |

### 型変換が必要な箇所

| 変換方向    | 対象カラム    | 変換内容                    |
| ----------- | ------------- | --------------------------- |
| DB → Domain | `is_favorite` | `integer (0/1)` → `boolean` |
| DB → Domain | `is_pinned`   | `integer (0/1)` → `boolean` |
| DB → Domain | `created_at`  | `ISO 8601 string` → `Date`  |
| DB → Domain | `updated_at`  | `ISO 8601 string` → `Date`  |
| Domain → DB | `isFavorite`  | `boolean` → `integer (0/1)` |
| Domain → DB | `isPinned`    | `boolean` → `integer (0/1)` |
| Domain → DB | `createdAt`   | `Date` → `ISO 8601 string`  |
| Domain → DB | `updatedAt`   | `Date` → `ISO 8601 string`  |

---

## chat_messages テーブル ⇔ ChatMessage エンティティ

**DBスキーマパス**: `packages/shared/src/db/schema/chat-history.ts`
**エンティティパス**: `packages/shared/src/features/chat-history/domain/entities/ChatMessage.ts`

### フィールド対応表

| DBカラム        | DBの型    | エンティティプロパティ | エンティティの型      | 型変換                        |
| --------------- | --------- | ---------------------- | --------------------- | ----------------------------- |
| `id`            | `text`    | `_id`                  | `ChatMessageId`       | `string` ⇔ `ChatMessageId`    |
| `session_id`    | `text`    | `_sessionId`           | `ChatSessionId`       | `string` ⇔ `ChatSessionId`    |
| `role`          | `text`    | `_role`                | `MessageRole`         | `string` ⇔ `MessageRole`      |
| `content`       | `text`    | `_content`             | `MessageContent`      | `string` ⇔ `MessageContent`   |
| `message_index` | `integer` | `_messageIndex`        | `number`              | なし（同一型）                |
| `timestamp`     | `text`    | `_timestamp`           | `Date`                | `ISO 8601 string` ⇔ `Date`    |
| `llm_provider`  | `text`    | (via `_llmMetadata`)   | `string \| null`      | LLMMetadata内プロパティ       |
| `llm_model`     | `text`    | (via `_llmMetadata`)   | `string \| null`      | LLMMetadata内プロパティ       |
| `llm_metadata`  | `text`    | `_llmMetadata`         | `LLMMetadata \| null` | `JSON string` ⇔ `LLMMetadata` |
| `attachments`   | `text`    | -                      | -                     | JSON配列（将来対応）          |
| `system_prompt` | `text`    | -                      | -                     | 将来対応                      |
| `metadata`      | `text`    | -                      | -                     | JSON文字列（将来拡張用）      |

### 型変換が必要な箇所

| 変換方向    | 対象カラム     | 変換内容                                  |
| ----------- | -------------- | ----------------------------------------- |
| DB → Domain | `timestamp`    | `ISO 8601 string` → `Date`                |
| DB → Domain | `llm_metadata` | `JSON string` → `LLMMetadata`オブジェクト |
| DB → Domain | `role`         | `string` → `MessageRole`                  |
| Domain → DB | `timestamp`    | `Date` → `ISO 8601 string`                |
| Domain → DB | `llmMetadata`  | `LLMMetadata` → `JSON string`             |
| Domain → DB | `role`         | `MessageRole` → `string`                  |

---

## LLMMetadata JSON構造

### DB格納形式（llm_metadata カラム）

```json
{
  "inputTokens": 150,
  "outputTokens": 200,
  "totalTokens": 350,
  "responseTime": 1500,
  "temperature": 0.7,
  "maxTokens": 4096
}
```

### ドメインエンティティ形式（LLMMetadata Value Object）

```typescript
{
  provider: string;        // llm_provider カラムより
  model: string;           // llm_model カラムより
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  } | null;
  responseTime: number | null;
  temperature: number | null;
  maxTokens: number | null;
}
```

---

## インデックス定義

### chat_sessions テーブル

| インデックス名                 | 対象カラム                      | 用途                   |
| ------------------------------ | ------------------------------- | ---------------------- |
| `idx_chat_sessions_user_id`    | `user_id`                       | ユーザーID検索最適化   |
| `idx_chat_sessions_created_at` | `created_at`                    | 日時ソート最適化       |
| `idx_chat_sessions_is_pinned`  | `user_id, is_pinned, pin_order` | ピン留めセッション取得 |
| `idx_chat_sessions_deleted_at` | `deleted_at`                    | ソフトデリート対応     |

### chat_messages テーブル

| インデックス名                        | 対象カラム                  | 用途                               |
| ------------------------------------- | --------------------------- | ---------------------------------- |
| `idx_chat_messages_session_id`        | `session_id`                | セッションID検索                   |
| `idx_chat_messages_timestamp`         | `timestamp`                 | 日時検索                           |
| `idx_chat_messages_role`              | `role`                      | ロール別フィルター                 |
| `idx_chat_messages_session_timestamp` | `session_id, timestamp`     | セッション内日時順取得             |
| `idx_chat_messages_session_message`   | `session_id, message_index` | メッセージ順序一意性保証（UNIQUE） |

---

## 完了確認

- [x] chatSessionsテーブルとChatSessionエンティティの全フィールド対応が整理されている
- [x] chatMessagesテーブルとChatMessageエンティティの全フィールド対応が整理されている
- [x] 型変換が必要な箇所が特定されている
- [x] インデックス定義が把握されている
