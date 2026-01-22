# Phase 2 - タスク2: DrizzleChatMessageRepository クラス設計

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 2                                 |
| タスク番号 | 2                                 |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## クラス構造

### 基本構造

```typescript
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { IChatMessageRepository } from "../../domain/repositories/IChatMessageRepository.js";
import type { ChatMessage } from "../../domain/entities/ChatMessage.js";
import type { ChatMessageId } from "../../domain/value-objects/ChatMessageId.js";
import type { ChatSessionId } from "../../domain/value-objects/ChatSessionId.js";
import { chatMessages } from "../../../../db/schema/chat-history.js";
import { ChatMessageMapper } from "./mappers/ChatMessageMapper.js";
import { eq, desc, count, asc } from "drizzle-orm";
import { DatabaseError } from "../../../../core/errors/InfrastructureError.js";

/**
 * Drizzle ORMを使用したチャットメッセージリポジトリ実装
 */
export class DrizzleChatMessageRepository implements IChatMessageRepository {
  constructor(private readonly db: LibSQLDatabase) {}
}
```

### 依存関係

| 依存                     | 用途                        |
| ------------------------ | --------------------------- |
| `LibSQLDatabase`         | Drizzle DB接続インスタンス  |
| `IChatMessageRepository` | 実装対象インターフェース    |
| `chatMessages`           | DBスキーマ定義              |
| `ChatMessageMapper`      | レコード ⇔ エンティティ変換 |
| `DatabaseError`          | エラーハンドリング          |

---

## メソッド実装方針

### findById

```typescript
async findById(id: ChatMessageId): Promise<ChatMessage | null> {
  try {
    const record = await this.db.query.chatMessages.findFirst({
      where: eq(chatMessages.id, id.value),
    });

    if (!record) {
      return null;
    }

    const result = ChatMessageMapper.toDomain(record);
    if (!result.ok) {
      throw new DatabaseError(`マッピングエラー: ${result.error.message}`);
    }
    return result.value;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError("メッセージの取得に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- `findFirst()` で単一レコード取得
- Mapperでドメインエンティティに変換
- マッピング失敗時は `DatabaseError` スロー

---

### findBySessionId

```typescript
async findBySessionId(
  sessionId: ChatSessionId,
  limit?: number,
  offset?: number,
): Promise<ChatMessage[]> {
  try {
    const records = await this.db.query.chatMessages.findMany({
      where: eq(chatMessages.sessionId, sessionId.value),
      limit: limit,
      offset: offset,
      orderBy: [asc(chatMessages.messageIndex)],
    });

    return records
      .map((record) => ChatMessageMapper.toDomain(record))
      .filter((result) => result.ok)
      .map((result) => result.value);
  } catch (error) {
    throw new DatabaseError("メッセージ一覧の取得に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- `messageIndex` 昇順ソートでメッセージ順序保証
- `limit`/`offset` オプションでページネーション対応
- マッピング失敗レコードはフィルター

---

### findLatestBySessionId

```typescript
async findLatestBySessionId(sessionId: ChatSessionId): Promise<ChatMessage | null> {
  try {
    const record = await this.db.query.chatMessages.findFirst({
      where: eq(chatMessages.sessionId, sessionId.value),
      orderBy: [desc(chatMessages.messageIndex)],
    });

    if (!record) {
      return null;
    }

    const result = ChatMessageMapper.toDomain(record);
    if (!result.ok) {
      throw new DatabaseError(`マッピングエラー: ${result.error.message}`);
    }
    return result.value;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError("最新メッセージの取得に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- `messageIndex` 降順ソート + `findFirst()` で最新取得
- プレビュー生成等で使用

---

### countBySessionId

```typescript
async countBySessionId(sessionId: ChatSessionId): Promise<number> {
  try {
    const result = await this.db
      .select({ count: count() })
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId.value));

    return result[0]?.count ?? 0;
  } catch (error) {
    throw new DatabaseError("メッセージ数のカウントに失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- `count()` 集約関数で件数取得
- messageIndex決定時に使用

---

### save

```typescript
async save(message: ChatMessage): Promise<void> {
  try {
    const record = ChatMessageMapper.toPersistence(message);

    await this.db
      .insert(chatMessages)
      .values(record)
      .onConflictDoUpdate({
        target: chatMessages.id,
        set: {
          sessionId: record.sessionId,
          role: record.role,
          content: record.content,
          messageIndex: record.messageIndex,
          timestamp: record.timestamp,
          llmProvider: record.llmProvider,
          llmModel: record.llmModel,
          llmMetadata: record.llmMetadata,
        },
      });
  } catch (error) {
    throw new DatabaseError("メッセージの保存に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- `onConflictDoUpdate()` でUpsert実装
- 全フィールドを更新対象に含める

---

### saveMany

```typescript
async saveMany(messages: ChatMessage[]): Promise<void> {
  if (messages.length === 0) {
    return;
  }

  try {
    const records = messages.map((message) =>
      ChatMessageMapper.toPersistence(message),
    );

    // トランザクション内でバッチ挿入
    await this.db.transaction(async (tx) => {
      for (const record of records) {
        await tx
          .insert(chatMessages)
          .values(record)
          .onConflictDoUpdate({
            target: chatMessages.id,
            set: {
              sessionId: record.sessionId,
              role: record.role,
              content: record.content,
              messageIndex: record.messageIndex,
              timestamp: record.timestamp,
              llmProvider: record.llmProvider,
              llmModel: record.llmModel,
              llmMetadata: record.llmMetadata,
            },
          });
      }
    });
  } catch (error) {
    throw new DatabaseError("メッセージの一括保存に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- **トランザクション必須** - 全件成功 or 全件ロールバック
- 空配列チェックで早期リターン
- ループ内で個別Upsert（Drizzle SQLiteの制限対応）

---

### delete

```typescript
async delete(id: ChatMessageId): Promise<void> {
  try {
    await this.db.delete(chatMessages).where(eq(chatMessages.id, id.value));
  } catch (error) {
    throw new DatabaseError("メッセージの削除に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- 単一メッセージの物理削除
- 存在しないIDでもエラーにしない（冪等性）

---

### deleteBySessionId

```typescript
async deleteBySessionId(sessionId: ChatSessionId): Promise<void> {
  try {
    await this.db
      .delete(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId.value));
  } catch (error) {
    throw new DatabaseError("セッションメッセージの削除に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- セッション内全メッセージを一括削除
- セッション削除前のクリーンアップで使用可能

---

## エラーハンドリング方針

| メソッド          | エラー種別       | 対応                               |
| ----------------- | ---------------- | ---------------------------------- |
| 全メソッド        | DB接続エラー     | `DatabaseError` スロー             |
| `findById`        | マッピングエラー | `DatabaseError` スロー             |
| `findBySessionId` | マッピングエラー | スキップ（フィルター）             |
| `save`            | 制約違反         | `DatabaseError` スロー             |
| `saveMany`        | 部分失敗         | 全件ロールバック + `DatabaseError` |

---

## トランザクション使用箇所

| メソッド            | トランザクション | 理由                      |
| ------------------- | ---------------- | ------------------------- |
| `save`              | 不要（単一操作） | 単一INSERT/UPDATEは原子的 |
| `saveMany`          | **必須**         | 複数操作の全件成功保証    |
| `delete`            | 不要（単一操作） | 単一DELETEは原子的        |
| `deleteBySessionId` | 推奨             | 大量削除の一貫性保証      |

---

## 完了確認

- [x] クラス構造が設計されている
- [x] 全8メソッドの実装方針が策定されている
- [x] Drizzle ORMのクエリパターンが定義されている
- [x] トランザクション使用箇所が明確化されている
- [x] エラーハンドリング方針が策定されている
