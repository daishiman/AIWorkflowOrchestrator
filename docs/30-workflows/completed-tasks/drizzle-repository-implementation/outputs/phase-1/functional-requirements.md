# Phase 1 - タスク4: 機能要件定義書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 1                                 |
| タスク番号 | 4                                 |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## DrizzleChatSessionRepository 機能要件

### FR-SESSION-001: IDによるセッション取得

| 項目     | 内容                                                              |
| -------- | ----------------------------------------------------------------- |
| メソッド | `findById(id: ChatSessionId): Promise<ChatSession \| null>`       |
| 機能概要 | 指定されたセッションIDでセッションを取得する                      |
| 入力     | `ChatSessionId` (UUID v4形式)                                     |
| 出力     | セッションが存在する場合は `ChatSession`、存在しない場合は `null` |
| DB操作   | `SELECT * FROM chat_sessions WHERE id = ? LIMIT 1`                |
| 備考     | Mapperで `ChatSessionRecord` → `ChatSession` に変換               |

### FR-SESSION-002: ユーザーIDによるセッション一覧取得

| 項目     | 内容                                                                                      |
| -------- | ----------------------------------------------------------------------------------------- |
| メソッド | `findByUserId(userId: UserId, limit?: number, offset?: number): Promise<ChatSession[]>`   |
| 機能概要 | 指定されたユーザーのセッション一覧を取得する                                              |
| 入力     | `UserId`, `limit` (デフォルト: 20), `offset` (デフォルト: 0)                              |
| 出力     | `ChatSession[]` (updatedAt降順)                                                           |
| DB操作   | `SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?` |
| 備考     | ページネーション対応。削除済み（deletedAt非null）は除外                                   |

### FR-SESSION-003: ピン留めセッション一覧取得

| 項目     | 内容                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| メソッド | `findPinned(userId: UserId): Promise<ChatSession[]>`                                     |
| 機能概要 | 指定されたユーザーのピン留めセッションを取得する                                         |
| 入力     | `UserId`                                                                                 |
| 出力     | `ChatSession[]` (pinOrder昇順)                                                           |
| DB操作   | `SELECT * FROM chat_sessions WHERE user_id = ? AND is_pinned = 1 ORDER BY pin_order ASC` |
| 備考     | 最大10件（ビジネスルール BR-SESSION-002）                                                |

### FR-SESSION-004: 条件検索

| 項目     | 内容                                                                  |
| -------- | --------------------------------------------------------------------- |
| メソッド | `search(criteria: ChatSessionSearchCriteria): Promise<ChatSession[]>` |
| 機能概要 | 指定された条件でセッションを検索する                                  |
| 入力     | `ChatSessionSearchCriteria` (userId必須、他オプション)                |
| 出力     | `ChatSession[]` (updatedAt降順)                                       |
| DB操作   | 動的WHERE句の構築（keyword, isFavorite, isPinned）                    |
| 備考     | キーワード検索はタイトルのLIKE部分一致                                |

**検索条件の詳細**:

- `keyword`: タイトルに対する部分一致検索 (`LIKE '%keyword%'`)
- `isFavorite`: true指定時 `is_favorite = 1`
- `isPinned`: true指定時 `is_pinned = 1`
- `limit`/`offset`: ページネーション

### FR-SESSION-005: セッション保存（Upsert）

| 項目     | 内容                                                |
| -------- | --------------------------------------------------- |
| メソッド | `save(session: ChatSession): Promise<void>`         |
| 機能概要 | セッションを作成または更新する                      |
| 入力     | `ChatSession` エンティティ                          |
| 出力     | なし（void）                                        |
| DB操作   | `INSERT ... ON CONFLICT(id) DO UPDATE`              |
| 備考     | Mapperで `ChatSession` → `ChatSessionRecord` に変換 |

### FR-SESSION-006: セッション削除

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| メソッド | `delete(id: ChatSessionId): Promise<void>`            |
| 機能概要 | セッションを削除する                                  |
| 入力     | `ChatSessionId`                                       |
| 出力     | なし（void）                                          |
| DB操作   | `DELETE FROM chat_sessions WHERE id = ?`              |
| 備考     | 関連メッセージは `ON DELETE CASCADE` で自動削除される |

### FR-SESSION-007: セッション存在確認

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| メソッド | `exists(id: ChatSessionId): Promise<boolean>`      |
| 機能概要 | セッションの存在を確認する                         |
| 入力     | `ChatSessionId`                                    |
| 出力     | 存在する場合 `true`、しない場合 `false`            |
| DB操作   | `SELECT 1 FROM chat_sessions WHERE id = ? LIMIT 1` |
| 備考     | フルレコード取得より効率的                         |

### FR-SESSION-008: ピン留めセッション数カウント

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| メソッド | `countPinned(userId: UserId): Promise<number>`                           |
| 機能概要 | ユーザーのピン留めセッション数を取得する                                 |
| 入力     | `UserId`                                                                 |
| 出力     | ピン留めセッション数（number）                                           |
| DB操作   | `SELECT COUNT(*) FROM chat_sessions WHERE user_id = ? AND is_pinned = 1` |
| 備考     | ピン留め上限（10件）チェック用                                           |

---

## DrizzleChatMessageRepository 機能要件

### FR-MESSAGE-001: IDによるメッセージ取得

| 項目     | 内容                                                              |
| -------- | ----------------------------------------------------------------- |
| メソッド | `findById(id: ChatMessageId): Promise<ChatMessage \| null>`       |
| 機能概要 | 指定されたメッセージIDでメッセージを取得する                      |
| 入力     | `ChatMessageId` (UUID v4形式)                                     |
| 出力     | メッセージが存在する場合は `ChatMessage`、存在しない場合は `null` |
| DB操作   | `SELECT * FROM chat_messages WHERE id = ? LIMIT 1`                |
| 備考     | Mapperで `ChatMessageRecord` → `ChatMessage` に変換               |

### FR-MESSAGE-002: セッションIDによるメッセージ一覧取得

| 項目     | 内容                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------- |
| メソッド | `findBySessionId(sessionId: ChatSessionId, limit?: number, offset?: number): Promise<ChatMessage[]>` |
| 機能概要 | 指定されたセッションのメッセージ一覧を取得する                                                       |
| 入力     | `ChatSessionId`, `limit` (オプション), `offset` (オプション)                                         |
| 出力     | `ChatMessage[]` (messageIndex昇順)                                                                   |
| DB操作   | `SELECT * FROM chat_messages WHERE session_id = ? ORDER BY message_index ASC LIMIT ? OFFSET ?`       |
| 備考     | メッセージ順序は `messageIndex` で保証                                                               |

### FR-MESSAGE-003: 最新メッセージ取得

| 項目     | 内容                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| メソッド | `findLatestBySessionId(sessionId: ChatSessionId): Promise<ChatMessage \| null>`        |
| 機能概要 | セッション内の最新メッセージを取得する                                                 |
| 入力     | `ChatSessionId`                                                                        |
| 出力     | 最新メッセージ（存在しない場合は `null`）                                              |
| DB操作   | `SELECT * FROM chat_messages WHERE session_id = ? ORDER BY message_index DESC LIMIT 1` |
| 備考     | プレビュー生成等で使用                                                                 |

### FR-MESSAGE-004: メッセージ数カウント

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| メソッド | `countBySessionId(sessionId: ChatSessionId): Promise<number>` |
| 機能概要 | セッション内のメッセージ数を取得する                          |
| 入力     | `ChatSessionId`                                               |
| 出力     | メッセージ数（number）                                        |
| DB操作   | `SELECT COUNT(*) FROM chat_messages WHERE session_id = ?`     |
| 備考     | messageIndex決定等で使用                                      |

### FR-MESSAGE-005: メッセージ保存（Upsert）

| 項目     | 内容                                                |
| -------- | --------------------------------------------------- |
| メソッド | `save(message: ChatMessage): Promise<void>`         |
| 機能概要 | メッセージを作成または更新する                      |
| 入力     | `ChatMessage` エンティティ                          |
| 出力     | なし（void）                                        |
| DB操作   | `INSERT ... ON CONFLICT(id) DO UPDATE`              |
| 備考     | Mapperで `ChatMessage` → `ChatMessageRecord` に変換 |

### FR-MESSAGE-006: 一括メッセージ保存

| 項目     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| メソッド | `saveMany(messages: ChatMessage[]): Promise<void>`      |
| 機能概要 | 複数のメッセージを一括で保存する                        |
| 入力     | `ChatMessage[]` 配列                                    |
| 出力     | なし（void）                                            |
| DB操作   | トランザクション内で複数INSERT                          |
| 備考     | **トランザクション必須** - 全件成功 or 全件ロールバック |

### FR-MESSAGE-007: メッセージ削除

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| メソッド | `delete(id: ChatMessageId): Promise<void>` |
| 機能概要 | メッセージを削除する                       |
| 入力     | `ChatMessageId`                            |
| 出力     | なし（void）                               |
| DB操作   | `DELETE FROM chat_messages WHERE id = ?`   |
| 備考     | 単一メッセージの削除                       |

### FR-MESSAGE-008: セッション全メッセージ削除

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| メソッド | `deleteBySessionId(sessionId: ChatSessionId): Promise<void>` |
| 機能概要 | セッション内の全メッセージを削除する                         |
| 入力     | `ChatSessionId`                                              |
| 出力     | なし（void）                                                 |
| DB操作   | `DELETE FROM chat_messages WHERE session_id = ?`             |
| 備考     | セッション削除時の事前クリーンアップ等で使用                 |

---

## DB接続要件

### DBR-001: Drizzle ORM接続

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| ORM      | Drizzle ORM                                |
| Database | SQLite (libSQL/Turso)                      |
| 接続方式 | `drizzle` インスタンスを依存注入で受け取る |
| 初期化   | アプリケーション起動時にDB接続を確立       |

### DBR-002: 接続インターフェース

```typescript
interface DrizzleDatabase {
  // Drizzle libSQL database instance
  readonly db: LibSQLDatabase;
}
```

---

## トランザクション要件

### TRX-001: 単一操作のトランザクション

| メソッド            | トランザクション要否 | 理由                      |
| ------------------- | -------------------- | ------------------------- |
| `save`              | 推奨                 | Upsert操作の原子性保証    |
| `delete`            | 推奨                 | 削除操作の一貫性保証      |
| `saveMany`          | **必須**             | 複数INSERT の全件成功保証 |
| `deleteBySessionId` | 推奨                 | 一括削除の一貫性保証      |

### TRX-002: トランザクション実装

```typescript
// saveManyのトランザクション例
async saveMany(messages: ChatMessage[]): Promise<void> {
  await this.db.transaction(async (tx) => {
    for (const message of messages) {
      const record = ChatMessageMapper.toPersistence(message);
      await tx.insert(chatMessages)
        .values(record)
        .onConflictDoUpdate({
          target: chatMessages.id,
          set: record,
        });
    }
  });
}
```

---

## 完了確認

- [x] IChatSessionRepository の全メソッド（8メソッド）の機能要件が定義されている
- [x] IChatMessageRepository の全メソッド（8メソッド）の機能要件が定義されている
- [x] キーワード検索要件が定義されている（FR-SESSION-004）
- [x] DB接続要件が定義されている
- [x] トランザクション要件が定義されている（save, delete, saveMany, deleteBySessionId）
