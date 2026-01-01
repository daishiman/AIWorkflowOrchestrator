# Drizzle ORM クエリパターン

## 概要

DrizzleORMを使用した型安全なクエリ構築のパターン集。

## 基本クエリ

### SELECT

```typescript
import { eq, and, or, like, gt, gte, lt, lte, inArray } from "drizzle-orm";

// 全件取得
const allUsers = await db.select().from(users);

// 条件付き取得
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.status, "active"));

// 複合条件
const filteredUsers = await db
  .select()
  .from(users)
  .where(and(eq(users.status, "active"), gt(users.age, 18)));

// OR条件
const users = await db
  .select()
  .from(users)
  .where(or(eq(users.role, "admin"), eq(users.role, "moderator")));

// LIKE検索
const searchResults = await db
  .select()
  .from(users)
  .where(like(users.name, "%John%"));

// IN句
const selectedUsers = await db
  .select()
  .from(users)
  .where(inArray(users.id, [1, 2, 3]));
```

### INSERT

```typescript
// 単一挿入
const result = await db.insert(users).values({
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date(),
});

// 複数挿入
await db.insert(users).values([
  { name: "John", email: "john@example.com", createdAt: new Date() },
  { name: "Jane", email: "jane@example.com", createdAt: new Date() },
]);

// 挿入して返却
const newUser = await db
  .insert(users)
  .values({ name: "John", email: "john@example.com", createdAt: new Date() })
  .returning();
```

### UPDATE

```typescript
// 条件付き更新
await db.update(users).set({ status: "inactive" }).where(eq(users.id, 1));

// 更新して返却
const updated = await db
  .update(users)
  .set({ name: "New Name" })
  .where(eq(users.id, 1))
  .returning();
```

### DELETE

```typescript
// 条件付き削除
await db.delete(users).where(eq(users.id, 1));

// 全削除（注意）
await db.delete(users);
```

## リレーショナルクエリ

### With節を使用したJOIN

```typescript
// 1対多のリレーションを取得
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true,
  },
});

// ネストしたリレーション
const postsWithAuthorAndComments = await db.query.posts.findMany({
  with: {
    author: true,
    comments: {
      with: {
        author: true,
      },
    },
  },
});
```

### 明示的JOIN

```typescript
// INNER JOIN
const result = await db
  .select({
    post: posts,
    author: users,
  })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id));

// LEFT JOIN
const result = await db
  .select({
    user: users,
    post: posts,
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId));
```

## 集計クエリ

```typescript
import { count, sum, avg, min, max } from "drizzle-orm";

// カウント
const [{ total }] = await db
  .select({ total: count() })
  .from(users)
  .where(eq(users.status, "active"));

// グループ化と集計
const stats = await db
  .select({
    status: users.status,
    count: count(),
  })
  .from(users)
  .groupBy(users.status);
```

## ページネーション

```typescript
// オフセットベース
const pageSize = 10;
const page = 1;
const paginatedUsers = await db
  .select()
  .from(users)
  .limit(pageSize)
  .offset((page - 1) * pageSize)
  .orderBy(users.createdAt);

// カーソルベース（推奨）
const lastId = 100;
const cursorPaginated = await db
  .select()
  .from(users)
  .where(gt(users.id, lastId))
  .limit(10)
  .orderBy(users.id);
```

## トランザクション

```typescript
await db.transaction(async (tx) => {
  const [user] = await tx
    .insert(users)
    .values({ name: "John", email: "john@example.com", createdAt: new Date() })
    .returning();

  await tx.insert(profiles).values({
    userId: user.id,
    bio: "Hello World",
  });
});

// ネストしたトランザクション（セーブポイント）
await db.transaction(async (tx) => {
  await tx.insert(users).values({ ... });

  await tx.transaction(async (tx2) => {
    // セーブポイントが作成される
    await tx2.insert(posts).values({ ... });
  });
});
```

## パフォーマンス最適化

### 必要なカラムのみ選択

```typescript
// NG: 全カラム
const users = await db.select().from(users);

// OK: 必要なカラムのみ
const users = await db
  .select({
    id: users.id,
    name: users.name,
  })
  .from(users);
```

### プリペアドステートメント

```typescript
import { placeholder } from "drizzle-orm";

const prepared = db
  .select()
  .from(users)
  .where(eq(users.id, placeholder("id")))
  .prepare();

// 実行時にパラメータを渡す
const user = await prepared.execute({ id: 1 });
```

## チェックリスト

- [ ] 必要なカラムのみSELECTしている
- [ ] 適切なインデックスが存在する
- [ ] N+1問題を避けている
- [ ] トランザクションが必要な操作を適切に囲んでいる
- [ ] ページネーションを実装している（大量データ対応）
