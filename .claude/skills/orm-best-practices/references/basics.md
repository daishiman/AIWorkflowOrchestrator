# ORM Best Practices 基礎知識

> **相対パス**: `references/basics.md`
> **原典**: Designing Data-Intensive Applications, Drizzle ORM Documentation

---

## Drizzle ORMとは

TypeScript向けの型安全なORMで、SQLライクな構文とTypeScriptの型推論を組み合わせた開発体験を提供する。

**主な特徴**:

- **型安全性**: スキーマ定義から型が自動推論される
- **SQLライク構文**: 学習コストが低く、SQLに近い記述が可能
- **軽量**: バンドルサイズが小さく、起動が高速

---

## 基本的なスキーマ定義

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 型推論が自動的に生成される
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
```

---

## リレーション設定

### 1対多リレーション

```typescript
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

### 多対多リレーション

```typescript
// 中間テーブルを使用
export const usersToPosts = sqliteTable("users_to_posts", {
  userId: integer("user_id").references(() => users.id),
  postId: integer("post_id").references(() => posts.id),
});
```

---

## クエリビルダー基本

### 基本的なCRUD

```typescript
// Select
const allUsers = await db.select().from(users);

// Select with filter
const activeUsers = await db.select().from(users).where(eq(users.active, true));

// Insert
await db.insert(users).values({ name: "John", email: "john@example.com" });

// Update
await db.update(users).set({ name: "Jane" }).where(eq(users.id, 1));

// Delete
await db.delete(users).where(eq(users.id, 1));
```

---

## N+1問題と対策

### 問題のあるパターン

```typescript
// N+1問題: usersの数だけpostsクエリが実行される
const users = await db.select().from(usersTable);
for (const user of users) {
  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.authorId, user.id));
}
```

### 解決策: JOIN

```typescript
// 1回のクエリで取得
const usersWithPosts = await db
  .select()
  .from(usersTable)
  .leftJoin(postsTable, eq(usersTable.id, postsTable.authorId));
```

### 解決策: Relational Query

```typescript
// Drizzle ORMのリレーショナルクエリ
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true,
  },
});
```

---

## インデックス戦略

```typescript
// カラムにインデックスを追加
export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey(),
    authorId: integer("author_id").notNull(),
    title: text("title").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    authorIdIdx: index("author_id_idx").on(table.authorId),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  }),
);
```

---

## 関連リソース

- **スキーマ設計Task**: See `agents/design-schema.md`
- **クエリ実装Task**: See `agents/implement-queries.md`
- **検証Task**: See `agents/validate-optimize.md`
- **詳細パターン**: See `references/schema-definition.md`, `references/query-builder-patterns.md`
