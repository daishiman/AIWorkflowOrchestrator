# チャット履歴テーブルスキーマ設計

**日付**: 2025-12-25
**タスク**: T-01-3 スキーマ詳細設計
**ステータス**: 完了

---

## 概要

チャット履歴永続化のための2つのテーブルスキーマを設計します：

1. **chat_sessions**: チャットセッション管理
2. **chat_messages**: チャットメッセージ管理

---

## テーブル定義

### 1. chat_sessions テーブル

#### 目的

ユーザーとAIアシスタント間の会話セッションを管理する最上位エンティティ。

#### カラム定義

| カラム名             | 型      | NULL     | デフォルト | 説明                                  |
| -------------------- | ------- | -------- | ---------- | ------------------------------------- |
| id                   | TEXT    | NOT NULL | -          | PRIMARY KEY (UUID v4)                 |
| user_id              | TEXT    | NOT NULL | -          | ユーザーID                            |
| title                | TEXT    | NOT NULL | -          | セッションタイトル (3-100文字)        |
| created_at           | TEXT    | NOT NULL | -          | 作成日時 (ISO 8601, UTC)              |
| updated_at           | TEXT    | NOT NULL | -          | 更新日時 (ISO 8601, UTC)              |
| message_count        | INTEGER | NOT NULL | 0          | メッセージ総数 (非正規化)             |
| is_favorite          | INTEGER | NOT NULL | 0          | お気に入りフラグ (0/1)                |
| is_pinned            | INTEGER | NOT NULL | 0          | ピン留めフラグ (0/1)                  |
| pin_order            | INTEGER | NULL     | -          | ピン順序 (1-10)                       |
| last_message_preview | TEXT    | NULL     | -          | 最終メッセージプレビュー (最大50文字) |
| metadata             | TEXT    | NOT NULL | '{}'       | 拡張メタデータ (JSON)                 |
| deleted_at           | TEXT    | NULL     | -          | 削除日時 (ソフトデリート)             |

#### インデックス

| インデックス名               | カラム                        | 用途                   |
| ---------------------------- | ----------------------------- | ---------------------- |
| idx_chat_sessions_user_id    | user_id                       | ユーザー別検索         |
| idx_chat_sessions_created_at | created_at                    | 日時順ソート           |
| idx_chat_sessions_is_pinned  | user_id, is_pinned, pin_order | ピン留めセッション取得 |
| idx_chat_sessions_deleted_at | deleted_at                    | ソフトデリート対応     |

#### Drizzle型定義

```typescript
export type ChatSessionRecord = typeof chatSessions.$inferSelect;
export type NewChatSessionRecord = typeof chatSessions.$inferInsert;
```

---

### 2. chat_messages テーブル

#### 目的

セッション内の個別の発言（ユーザーまたはアシスタント）を管理。

#### カラム定義

| カラム名      | 型      | NULL     | デフォルト | 説明                              |
| ------------- | ------- | -------- | ---------- | --------------------------------- |
| id            | TEXT    | NOT NULL | -          | PRIMARY KEY (UUID v4)             |
| session_id    | TEXT    | NOT NULL | -          | FOREIGN KEY → chat_sessions.id    |
| role          | TEXT    | NOT NULL | -          | メッセージロール (user/assistant) |
| content       | TEXT    | NOT NULL | -          | メッセージ本文 (1-100,000文字)    |
| message_index | INTEGER | NOT NULL | -          | セッション内順序 (0開始)          |
| timestamp     | TEXT    | NOT NULL | -          | 送信日時 (ISO 8601, UTC)          |
| llm_provider  | TEXT    | NULL     | -          | LLMプロバイダー名                 |
| llm_model     | TEXT    | NULL     | -          | LLMモデル名                       |
| llm_metadata  | TEXT    | NULL     | -          | LLMメタデータ (JSON)              |
| attachments   | TEXT    | NOT NULL | '[]'       | 添付ファイル (JSON配列)           |
| system_prompt | TEXT    | NULL     | -          | システムプロンプト                |
| metadata      | TEXT    | NOT NULL | '{}'       | 拡張メタデータ (JSON)             |

#### 外部キー制約

```sql
session_id REFERENCES chat_sessions(id) ON DELETE CASCADE
```

セッション削除時に関連する全メッセージを自動削除。

#### インデックス

| インデックス名                      | カラム                    | 種別   | 用途                   |
| ----------------------------------- | ------------------------- | ------ | ---------------------- |
| idx_chat_messages_session_id        | session_id                | 通常   | セッション別検索       |
| idx_chat_messages_timestamp         | timestamp                 | 通常   | 日時順ソート           |
| idx_chat_messages_role              | role                      | 通常   | ロール別フィルタ       |
| idx_chat_messages_session_timestamp | session_id, timestamp     | 複合   | カバリングインデックス |
| idx_chat_messages_session_message   | session_id, message_index | UNIQUE | 順序の一意性保証       |

#### Drizzle型定義

```typescript
export type ChatMessageRecord = typeof chatMessages.$inferSelect;
export type NewChatMessageRecord = typeof chatMessages.$inferInsert;
```

---

## ER図

```
┌─────────────────────┐
│   chat_sessions     │
├─────────────────────┤
│ PK id (TEXT)        │
│    user_id          │
│    title            │
│    created_at       │
│    updated_at       │
│    message_count    │
│    is_favorite      │
│    is_pinned        │
│    pin_order        │
│    last_message_... │
│    metadata         │
│    deleted_at       │
└─────────┬───────────┘
          │ 1
          │
          │ N
┌─────────▼───────────┐
│   chat_messages     │
├─────────────────────┤
│ PK id (TEXT)        │
│ FK session_id       │◄── ON DELETE CASCADE
│    role             │
│    content          │
│    message_index    │
│    timestamp        │
│    llm_provider     │
│    llm_model        │
│    llm_metadata     │
│    attachments      │
│    system_prompt    │
│    metadata         │
└─────────────────────┘
```

---

## リレーション定義

### Drizzle ORMリレーション

```typescript
// セッション → メッセージ (1:N)
export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

// メッセージ → セッション (N:1)
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));
```

---

## 正規化レベル

### 第3正規形 (3NF) 準拠

- 各テーブルは単一のエンティティを表現
- 非キー属性は主キーにのみ依存
- 推移的依存なし

### 意図的な非正規化

パフォーマンス最適化のため以下を非正規化：

1. **message_count** (chat_sessions)
   - メッセージ数のリアルタイム計算を回避
   - メッセージ追加/削除時に更新

2. **last_message_preview** (chat_sessions)
   - セッション一覧表示の高速化
   - 最新メッセージ追加時に更新

---

## JSON フィールド構造

### metadata (共通)

```typescript
interface SessionMetadata {
  // 将来の拡張用
  tags?: string[];
  customFields?: Record<string, unknown>;
}

interface MessageMetadata {
  // 将来の拡張用
  editedAt?: string;
  reactionCount?: number;
}
```

### llm_metadata

```typescript
interface LlmMetadata {
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  responseTime?: number; // ms
  temperature?: number;
  topP?: number;
  finishReason?: string;
}
```

### attachments

```typescript
interface Attachment {
  id: string;
  type: "file" | "image" | "code";
  name: string;
  size: number;
  mimeType: string;
  url?: string;
}
```

---

## SQLite特有の考慮事項

### 1. 日時の保存形式

SQLiteは日時型をネイティブサポートしないため、TEXT型でISO 8601形式を使用：

```
2025-12-25T10:30:00.000Z
```

### 2. ブーリアンの保存

SQLiteはBOOLEAN型をネイティブサポートしないため、INTEGER型を使用：

- 0: false
- 1: true

### 3. 外部キー制約の有効化

SQLiteでは外部キー制約がデフォルトで無効。接続時に有効化が必要：

```sql
PRAGMA foreign_keys = ON;
```

Drizzle ORMでは `better-sqlite3` 接続時に自動的に有効化される。

---

## 完了条件チェック

| 条件                                          | 状態 |
| --------------------------------------------- | ---- |
| chat_sessionsテーブルスキーマが設計されている | ✅   |
| chat_messagesテーブルスキーマが設計されている | ✅   |
| 外部キー制約が定義されている                  | ✅   |
| インデックス候補がリストアップされている      | ✅   |
| 型定義（Drizzle）が明記されている             | ✅   |

---

## 実装ファイル

**スキーマ定義**: `packages/shared/src/db/schema/chat-history.ts`

**エクスポート**: `packages/shared/src/db/schema/index.ts`

---

## 次のステップ

- T-01-4: インデックス戦略設計（既に定義済み）
- マイグレーション生成: `drizzle-kit generate`
- マイグレーション実行: `drizzle-kit push` または `runMigrations()`
