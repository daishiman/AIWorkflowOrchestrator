# Phase 2 - タスク3: Drizzle クエリパターン設計

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 2                                 |
| タスク番号 | 3                                 |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## インポート設定

```typescript
import { eq, and, or, like, desc, asc, count, sql } from "drizzle-orm";
import {
  chatSessions,
  chatMessages,
} from "../../../../db/schema/chat-history.js";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
```

---

## SELECT クエリパターン

### 1. 単一レコード取得（findFirst）

```typescript
// IDで単一レコード取得
const record = await this.db.query.chatSessions.findFirst({
  where: eq(chatSessions.id, id.value),
});

// 条件付き単一レコード取得（最新メッセージ）
const record = await this.db.query.chatMessages.findFirst({
  where: eq(chatMessages.sessionId, sessionId.value),
  orderBy: [desc(chatMessages.messageIndex)],
});
```

### 2. 複数レコード取得（findMany）

```typescript
// ページネーション付き取得
const records = await this.db.query.chatSessions.findMany({
  where: eq(chatSessions.userId, userId.value),
  limit: 20,
  offset: 0,
  orderBy: [desc(chatSessions.updatedAt)],
});

// 複合条件での取得
const records = await this.db.query.chatSessions.findMany({
  where: and(
    eq(chatSessions.userId, userId.value),
    eq(chatSessions.isPinned, 1),
  ),
  orderBy: [asc(chatSessions.pinOrder)],
});
```

### 3. 部分カラム取得（最適化）

```typescript
// 存在確認（IDのみ取得）
const record = await this.db.query.chatSessions.findFirst({
  where: eq(chatSessions.id, id.value),
  columns: { id: true },
});
```

### 4. 集約クエリ（COUNT）

```typescript
// レコード数カウント
const result = await this.db
  .select({ count: count() })
  .from(chatSessions)
  .where(
    and(eq(chatSessions.userId, userId.value), eq(chatSessions.isPinned, 1)),
  );

const totalCount = result[0]?.count ?? 0;
```

---

## INSERT クエリパターン

### 1. 単一レコード挿入

```typescript
await this.db.insert(chatSessions).values({
  id: record.id,
  userId: record.userId,
  title: record.title,
  messageCount: record.messageCount,
  isFavorite: record.isFavorite,
  isPinned: record.isPinned,
  pinOrder: record.pinOrder,
  lastMessagePreview: record.lastMessagePreview,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});
```

### 2. バッチ挿入

```typescript
// 複数レコードを一括挿入（トランザクション内）
await this.db.transaction(async (tx) => {
  for (const record of records) {
    await tx.insert(chatMessages).values(record);
  }
});
```

---

## UPDATE / UPSERT クエリパターン

### 1. Upsert（INSERT ON CONFLICT DO UPDATE）

```typescript
// セッションのUpsert
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
      // createdAt は更新しない（不変）
    },
  });
```

### 2. 条件付きUPDATE

```typescript
// 特定条件でのUPDATE
await this.db
  .update(chatSessions)
  .set({ updatedAt: new Date().toISOString() })
  .where(eq(chatSessions.id, id.value));
```

---

## DELETE クエリパターン

### 1. 単一レコード削除

```typescript
// IDで削除
await this.db.delete(chatSessions).where(eq(chatSessions.id, id.value));
```

### 2. 条件付き一括削除

```typescript
// セッションIDで関連メッセージを削除
await this.db
  .delete(chatMessages)
  .where(eq(chatMessages.sessionId, sessionId.value));
```

---

## 検索クエリパターン

### 1. LIKE 部分一致検索

```typescript
// タイトル検索（部分一致）
const records = await this.db.query.chatSessions.findMany({
  where: and(
    eq(chatSessions.userId, userId.value),
    like(chatSessions.title, `%${keyword}%`),
  ),
  limit: 20,
});
```

### 2. 動的条件構築

```typescript
// 検索条件を動的に構築
const conditions = [eq(chatSessions.userId, userId.value)];

if (keyword) {
  conditions.push(like(chatSessions.title, `%${keyword}%`));
}
if (isFavorite !== undefined) {
  conditions.push(eq(chatSessions.isFavorite, isFavorite ? 1 : 0));
}
if (isPinned !== undefined) {
  conditions.push(eq(chatSessions.isPinned, isPinned ? 1 : 0));
}

const records = await this.db.query.chatSessions.findMany({
  where: and(...conditions),
});
```

### 3. FTS5 全文検索（将来拡張）

```typescript
// FTS5仮想テーブルを使用した全文検索
// 注意: 現時点ではスコープ外（将来対応）
const ftsResults = await this.db.all(
  sql`SELECT rowid, * FROM chat_sessions_fts WHERE chat_sessions_fts MATCH ${keyword}`,
);
```

---

## トランザクションパターン

### 1. 基本トランザクション

```typescript
await this.db.transaction(async (tx) => {
  // 複数操作をトランザクション内で実行
  await tx.insert(chatMessages).values(record1);
  await tx.insert(chatMessages).values(record2);

  // エラー時は自動ロールバック
});
```

### 2. ネストトランザクション（非サポート）

```
注意: SQLite/libSQLはネストトランザクションをサポートしていない。
      必要に応じてセーブポイントを使用する。
```

---

## ソフトデリートパターン（将来対応）

```typescript
// ソフトデリート（deletedAtを設定）
await this.db
  .update(chatSessions)
  .set({ deletedAt: new Date().toISOString() })
  .where(eq(chatSessions.id, id.value));

// 有効レコードのみ取得
const records = await this.db.query.chatSessions.findMany({
  where: and(
    eq(chatSessions.userId, userId.value),
    sql`${chatSessions.deletedAt} IS NULL`,
  ),
});
```

---

## NULL チェックパターン

```typescript
// IS NULL条件
sql`${chatSessions.deletedAt} IS NULL`;

// IS NOT NULL条件
sql`${chatSessions.pinOrder} IS NOT NULL`;
```

---

## パフォーマンス考慮事項

| 考慮事項           | 対応方法                                 |
| ------------------ | ---------------------------------------- |
| N+1問題回避        | バッチ取得、リレーション指定での一括取得 |
| 不要カラム取得回避 | `columns` オプションで必要カラムのみ選択 |
| インデックス活用   | WHERE条件にインデックス付きカラムを使用  |
| ページネーション   | `limit`/`offset` の適切な使用            |

---

## 完了確認

- [x] SELECT クエリパターン（findFirst, findMany, count）が設計されている
- [x] INSERT クエリパターン（単一、バッチ）が設計されている
- [x] UPDATE / UPSERT クエリパターンが設計されている
- [x] DELETE クエリパターンが設計されている
- [x] 検索クエリパターン（LIKE、動的条件）が設計されている
- [x] トランザクションパターンが設計されている
- [x] FTS5全文検索パターン（将来対応）が設計されている
