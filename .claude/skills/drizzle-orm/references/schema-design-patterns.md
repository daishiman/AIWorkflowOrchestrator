# Drizzle ORM スキーマ設計パターン

## 概要

DrizzleORMを使用した型安全なスキーマ設計のパターンとベストプラクティス。

## 基本テーブル定義

### SQLite

```typescript
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});
```

### PostgreSQL

```typescript
import { pgTable, serial, varchar, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});
```

## リレーション定義

### One-to-Many

```typescript
import { relations } from "drizzle-orm";

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content"),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

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

### Many-to-Many

```typescript
export const postTags = sqliteTable("post_tags", {
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));
```

## 命名規則

| 対象         | 規則                         | 例                    |
| ------------ | ---------------------------- | --------------------- |
| テーブル名   | snake_case（複数形）         | `users`, `blog_posts` |
| カラム名     | snake_case                   | `created_at`          |
| 外部キー     | `{参照先}_id`                | `user_id`, `post_id`  |
| インデックス | `idx_{テーブル}_{カラム...}` | `idx_posts_user_id`   |
| 制約         | `{テーブル}_{種別}_{カラム}` | `users_unique_email`  |

## 型安全性のパターン

### Infer Types

```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// SELECTの結果型
type User = InferSelectModel<typeof users>;

// INSERTの入力型
type NewUser = InferInsertModel<typeof users>;
```

### カスタム型

```typescript
// JSON型カラム
import { text } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  config: text("config", { mode: "json" }).$type<{
    theme: string;
    notifications: boolean;
  }>(),
});
```

## インデックス定義

```typescript
import { index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    authorId: integer("author_id").notNull(),
    status: text("status").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    authorIdx: index("idx_posts_author").on(table.authorId),
    statusCreatedIdx: index("idx_posts_status_created").on(
      table.status,
      table.createdAt,
    ),
    titleUniqueIdx: uniqueIndex("unq_posts_title").on(table.title),
  }),
);
```

## チェックリスト

- [ ] 主キーが定義されている
- [ ] 外部キー制約が適切に設定されている
- [ ] NOT NULL制約が必要なカラムに設定されている
- [ ] 一意制約が重複を防ぐべきカラムに設定されている
- [ ] インデックスがクエリパターンに応じて設定されている
- [ ] タイムスタンプカラム（created_at, updated_at）が存在する
- [ ] 命名規則に従っている
