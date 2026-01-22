# Phase 2 - タスク1: DrizzleChatSessionRepository クラス設計

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 2                                 |
| タスク番号 | 1                                 |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## クラス構造

### 基本構造

```typescript
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type {
  IChatSessionRepository,
  ChatSessionSearchCriteria,
} from "../../domain/repositories/IChatSessionRepository.js";
import type { ChatSession } from "../../domain/entities/ChatSession.js";
import type { ChatSessionId } from "../../domain/value-objects/ChatSessionId.js";
import type { UserId } from "../../domain/value-objects/UserId.js";
import { chatSessions } from "../../../../db/schema/chat-history.js";
import { ChatSessionMapper } from "./mappers/ChatSessionMapper.js";
import { eq, and, like, desc, count, sql } from "drizzle-orm";
import { DatabaseError } from "../../../../core/errors/InfrastructureError.js";

/**
 * Drizzle ORMを使用したチャットセッションリポジトリ実装
 */
export class DrizzleChatSessionRepository implements IChatSessionRepository {
  constructor(private readonly db: LibSQLDatabase) {}
}
```

### 依存関係

| 依存                     | 用途                        |
| ------------------------ | --------------------------- |
| `LibSQLDatabase`         | Drizzle DB接続インスタンス  |
| `IChatSessionRepository` | 実装対象インターフェース    |
| `chatSessions`           | DBスキーマ定義              |
| `ChatSessionMapper`      | レコード ⇔ エンティティ変換 |
| `DatabaseError`          | エラーハンドリング          |

---

## メソッド実装方針

### findById

```typescript
async findById(id: ChatSessionId): Promise<ChatSession | null> {
  try {
    const record = await this.db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, id.value),
    });

    if (!record) {
      return null;
    }

    const result = ChatSessionMapper.toDomain(record);
    if (!result.ok) {
      throw new DatabaseError(`マッピングエラー: ${result.error.message}`);
    }
    return result.value;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError("セッションの取得に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- `db.query.chatSessions.findFirst()` で単一レコード取得
- `eq()` 関数で条件指定
- Mapperでドメインエンティティに変換
- エラー時は `DatabaseError` をスロー

---

### findByUserId

```typescript
async findByUserId(
  userId: UserId,
  limit: number = 20,
  offset: number = 0,
): Promise<ChatSession[]> {
  try {
    const records = await this.db.query.chatSessions.findMany({
      where: and(
        eq(chatSessions.userId, userId.value),
        sql`${chatSessions.deletedAt} IS NULL`,
      ),
      limit,
      offset,
      orderBy: [desc(chatSessions.updatedAt)],
    });

    return records
      .map((record) => ChatSessionMapper.toDomain(record))
      .filter((result) => result.ok)
      .map((result) => result.value);
  } catch (error) {
    throw new DatabaseError("セッション一覧の取得に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- `findMany()` でページネーション対応
- `orderBy: [desc(chatSessions.updatedAt)]` で更新日時降順
- `deletedAt IS NULL` でソフトデリート除外
- マッピング失敗レコードは除外（フィルター）

---

### findPinned

```typescript
async findPinned(userId: UserId): Promise<ChatSession[]> {
  try {
    const records = await this.db.query.chatSessions.findMany({
      where: and(
        eq(chatSessions.userId, userId.value),
        eq(chatSessions.isPinned, 1),
        sql`${chatSessions.deletedAt} IS NULL`,
      ),
      orderBy: [chatSessions.pinOrder],
    });

    return records
      .map((record) => ChatSessionMapper.toDomain(record))
      .filter((result) => result.ok)
      .map((result) => result.value);
  } catch (error) {
    throw new DatabaseError("ピン留めセッションの取得に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- `is_pinned = 1` でピン留めセッションのみ取得
- `pinOrder` 昇順ソート
- 最大10件（ビジネスルール）

---

### search

```typescript
async search(criteria: ChatSessionSearchCriteria): Promise<ChatSession[]> {
  try {
    const conditions = [
      eq(chatSessions.userId, criteria.userId.value),
      sql`${chatSessions.deletedAt} IS NULL`,
    ];

    // キーワード検索
    if (criteria.keyword) {
      conditions.push(like(chatSessions.title, `%${criteria.keyword}%`));
    }

    // お気に入りフィルター
    if (criteria.isFavorite !== undefined) {
      conditions.push(eq(chatSessions.isFavorite, criteria.isFavorite ? 1 : 0));
    }

    // ピン留めフィルター
    if (criteria.isPinned !== undefined) {
      conditions.push(eq(chatSessions.isPinned, criteria.isPinned ? 1 : 0));
    }

    const records = await this.db.query.chatSessions.findMany({
      where: and(...conditions),
      limit: criteria.limit ?? 20,
      offset: criteria.offset ?? 0,
      orderBy: [desc(chatSessions.updatedAt)],
    });

    return records
      .map((record) => ChatSessionMapper.toDomain(record))
      .filter((result) => result.ok)
      .map((result) => result.value);
  } catch (error) {
    throw new DatabaseError("セッション検索に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- 動的条件配列を構築し `and()` で結合
- `like()` でタイトル部分一致検索
- オプション条件は `undefined` チェックで動的追加

---

### save

```typescript
async save(session: ChatSession): Promise<void> {
  try {
    const record = ChatSessionMapper.toPersistence(session);

    await this.db
      .insert(chatSessions)
      .values(record)
      .onConflictDoUpdate({
        target: chatSessions.id,
        set: {
          userId: record.userId,
          title: record.title,
          messageCount: record.messageCount,
          isFavorite: record.isFavorite,
          isPinned: record.isPinned,
          pinOrder: record.pinOrder,
          lastMessagePreview: record.lastMessagePreview,
          updatedAt: record.updatedAt,
        },
      });
  } catch (error) {
    throw new DatabaseError("セッションの保存に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- `onConflictDoUpdate()` でUpsert実装
- `target: chatSessions.id` で主キー競合時に更新
- `createdAt` は更新対象外（不変）

---

### delete

```typescript
async delete(id: ChatSessionId): Promise<void> {
  try {
    await this.db.delete(chatSessions).where(eq(chatSessions.id, id.value));
  } catch (error) {
    throw new DatabaseError("セッションの削除に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- 物理削除（将来的にソフトデリートに変更可能）
- 関連メッセージは `ON DELETE CASCADE` で自動削除

---

### exists

```typescript
async exists(id: ChatSessionId): Promise<boolean> {
  try {
    const record = await this.db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, id.value),
      columns: { id: true },
    });

    return record !== undefined;
  } catch (error) {
    throw new DatabaseError("セッション存在確認に失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- `columns: { id: true }` で最小限のカラムのみ取得
- `undefined` チェックで存在判定

---

### countPinned

```typescript
async countPinned(userId: UserId): Promise<number> {
  try {
    const result = await this.db
      .select({ count: count() })
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.userId, userId.value),
          eq(chatSessions.isPinned, 1),
          sql`${chatSessions.deletedAt} IS NULL`,
        ),
      );

    return result[0]?.count ?? 0;
  } catch (error) {
    throw new DatabaseError("ピン留め数のカウントに失敗しました", error as Error);
  }
}
```

**設計ポイント**:

- `count()` 集約関数で件数取得
- `result[0]?.count ?? 0` でnull安全に取得

---

## エラーハンドリング方針

| メソッド       | エラー種別       | 対応                                 |
| -------------- | ---------------- | ------------------------------------ |
| 全メソッド     | DB接続エラー     | `DatabaseError` スロー               |
| `findById`     | マッピングエラー | `DatabaseError` スロー（内部エラー） |
| `findByUserId` | マッピングエラー | スキップ（フィルター）               |
| `save`         | 制約違反         | `DatabaseError` スロー               |

---

## 完了確認

- [x] クラス構造が設計されている
- [x] 全8メソッドの実装方針が策定されている
- [x] Drizzle ORMのクエリパターンが定義されている
- [x] エラーハンドリング方針が策定されている
