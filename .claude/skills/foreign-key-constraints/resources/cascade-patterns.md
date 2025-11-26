# CASCADE動作パターン詳細リファレンス

## 概要

このドキュメントでは、PostgreSQLの外部キー制約におけるCASCADE動作パターンを
詳細に解説します。各パターンの特性、適用場面、実装例を提供します。

---

## 1. ON DELETE CASCADE

### 1.1 動作概要

親レコード削除時に、参照している子レコードも自動的に削除されます。

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```

### 1.2 適用パターン

#### パターンA: 所有関係（Composition）

親が子を「所有」している関係。親の存在が子の存在理由。

**例**:
- ユーザー → セッション
- 注文 → 注文明細
- 投稿 → 投稿画像

```typescript
// Drizzle ORM
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});
```

#### パターンB: ライフサイクル依存

子のライフサイクルが親に完全依存する関係。

**例**:
- ワークフロー → ワークフローステップ
- フォーム → フォームフィールド
- プロジェクト → プロジェクト設定

```typescript
export const workflowSteps = pgTable('workflow_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id')
    .notNull()
    .references(() => workflows.id, { onDelete: 'cascade' }),
  stepOrder: integer('step_order').notNull(),
  action: varchar('action', { length: 100 }).notNull(),
});
```

### 1.3 注意点と対策

#### 連鎖削除の深さ

```
users → orders → order_items → item_logs
              ↘ order_events

すべてCASCADE設定の場合、1ユーザー削除で数千レコード削除の可能性
```

**対策**:
1. 削除前に影響範囲を確認するクエリを実行
2. バッチ処理で分割削除
3. 深い階層ではソフトデリートを検討

#### パフォーマンス影響

```sql
-- 影響範囲の事前確認
WITH RECURSIVE affected AS (
  SELECT 'users' AS table_name, id FROM users WHERE id = $1
  UNION ALL
  SELECT 'orders', o.id FROM orders o
  JOIN affected a ON a.table_name = 'users' AND o.user_id = a.id
  UNION ALL
  SELECT 'order_items', oi.id FROM order_items oi
  JOIN affected a ON a.table_name = 'orders' AND oi.order_id = a.id
)
SELECT table_name, COUNT(*) FROM affected GROUP BY table_name;
```

### 1.4 アンチパターン

**避けるべき**: 監査証跡が必要なテーブルへのCASCADE

```typescript
// ❌ 監査ログが消えてしまう
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' }), // 危険！
  action: varchar('action', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ✅ SET NULLまたはRESTRICTを使用
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## 2. ON DELETE SET NULL

### 2.1 動作概要

親レコード削除時に、子レコードの外部キーをNULLに設定します。

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL
);
```

### 2.2 適用パターン

#### パターンA: オプショナル関連

関連が必須ではなく、親削除後も子が独立して意味を持つ。

**例**:
- 商品 → カテゴリ（未分類として継続）
- タスク → 担当者（未割当として継続）
- 記事 → 執筆者（匿名として継続）

```typescript
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  categoryId: uuid('category_id')
    .references(() => categories.id, { onDelete: 'set null' }),
  // categoryIdはNULL許可（必須ではない）
});
```

#### パターンB: 履歴保持

削除された親への参照を「不明」として記録したい場合。

```typescript
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id')
    .references(() => users.id, { onDelete: 'set null' }),
  // 投稿削除 → コメント削除、ユーザー削除 → 匿名コメントとして保持
  content: text('content').notNull(),
});
```

### 2.3 アプリケーション側の対応

SET NULLを使用する場合、アプリケーション側でNULLケースを処理する必要があります。

```typescript
// Repository
async getProductWithCategory(productId: string) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: { category: true },
  });

  return {
    ...product,
    // NULLの場合のフォールバック
    categoryName: product.category?.name ?? '未分類',
  };
}

// 型定義
type ProductWithCategory = {
  id: string;
  name: string;
  category: Category | null;  // NULLの可能性を型で表現
};
```

### 2.4 SET NULL使用時の必須条件

```typescript
// ❌ NOT NULLカラムにSET NULLは使用不可
categoryId: uuid('category_id')
  .notNull()  // これがあるとSET NULLは機能しない
  .references(() => categories.id, { onDelete: 'set null' })

// ✅ NULL許可である必要がある
categoryId: uuid('category_id')
  .references(() => categories.id, { onDelete: 'set null' })
```

---

## 3. ON DELETE RESTRICT

### 3.1 動作概要

子レコードが存在する場合、親レコードの削除を禁止します。
これはPostgreSQLのデフォルト動作です。

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);
```

### 3.2 適用パターン

#### パターンA: 明示的削除フロー

削除前にビジネスロジックでの処理が必要な場合。

**例**:
- 顧客削除前に注文履歴のアーカイブ
- プロジェクト削除前にファイルのバックアップ
- ユーザー削除前に資産の移管

```typescript
// Service層での明示的処理
class UserService {
  async deleteUser(userId: string) {
    // 1. 関連データの確認
    const orders = await this.orderRepo.findByUserId(userId);
    if (orders.length > 0) {
      // 2. アーカイブ処理
      await this.archiveService.archiveOrders(orders);
      // 3. 関連レコードの削除
      await this.orderRepo.deleteByUserId(userId);
    }

    // 4. ユーザー削除（RESTRICTが解除されている）
    await this.userRepo.delete(userId);
  }
}
```

#### パターンB: ソフトデリート統合

物理削除を禁止し、論理削除のみを許可したい場合。

```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  deletedAt: timestamp('deleted_at'),  // ソフトデリート用
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  deletedAt: timestamp('deleted_at'),
});

// ソフトデリート実装
class UserService {
  async softDeleteUser(userId: string) {
    const now = new Date();

    await db.transaction(async (tx) => {
      // 関連レコードをソフトデリート
      await tx.update(orders)
        .set({ deletedAt: now })
        .where(and(eq(orders.userId, userId), isNull(orders.deletedAt)));

      // ユーザーをソフトデリート
      await tx.update(users)
        .set({ deletedAt: now })
        .where(eq(users.id, userId));
    });
  }
}
```

### 3.3 RESTRICTの利点

1. **データ整合性の保護**: 誤削除の防止
2. **明示的なフロー**: ビジネスロジックでの制御が可能
3. **監査証跡の保持**: 履歴データの保護
4. **ソフトデリートとの相性**: 物理削除を防止

---

## 4. ON DELETE NO ACTION

### 4.1 動作概要

RESTRICTと類似していますが、チェックのタイミングが異なります。
- RESTRICT: 即座にチェック
- NO ACTION: トランザクション終了時にチェック

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE NO ACTION
);
```

### 4.2 適用パターン

#### パターン: 遅延制約（DEFERRABLE）

トランザクション内で一時的に制約違反を許容したい場合。

```sql
-- 遅延可能な外部キー制約
ALTER TABLE orders
ADD CONSTRAINT fk_orders_users
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE NO ACTION
DEFERRABLE INITIALLY DEFERRED;

-- トランザクション内での使用
BEGIN;
-- 一時的に制約違反（ユーザー削除後にオーダーを別ユーザーに移管）
DELETE FROM users WHERE id = 'old-user-id';
UPDATE orders SET user_id = 'new-user-id' WHERE user_id = 'old-user-id';
COMMIT;  -- ここで制約チェック
```

### 4.3 RESTRICTとの違い

| 特性 | RESTRICT | NO ACTION |
|------|----------|-----------|
| チェックタイミング | 即座 | トランザクション終了時 |
| DEFERRABLE対応 | 不可 | 可能 |
| 一時的違反 | 不可 | 可能（DEFERRABLE時） |
| デフォルト動作 | PostgreSQLの真のデフォルト | SQL標準 |

---

## 5. ON DELETE SET DEFAULT

### 5.1 動作概要

親レコード削除時に、子レコードの外部キーをデフォルト値に設定します。

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  category_id UUID DEFAULT 'default-category-uuid'
    REFERENCES categories(id) ON DELETE SET DEFAULT
);
```

### 5.2 適用パターン

#### パターン: フォールバックカテゴリ

削除された親の代わりに特定のデフォルトエンティティを参照。

```typescript
// デフォルトカテゴリを事前に作成
const DEFAULT_CATEGORY_ID = '00000000-0000-0000-0000-000000000001';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  categoryId: uuid('category_id')
    .default(DEFAULT_CATEGORY_ID)
    .references(() => categories.id, { onDelete: 'set default' }),
});
```

### 5.3 使用上の注意

1. **デフォルト値が有効な参照先である必要がある**
2. **デフォルト先のエンティティは削除できない**
3. **ビジネスロジックでのフォールバック処理の方が柔軟**

**推奨**: SET DEFAULTよりも、アプリケーション側でフォールバック処理を実装することが多い。

---

## 6. ON UPDATE CASCADE

### 6.1 動作概要

親レコードの主キー更新時に、子レコードの外部キーも自動更新。

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE
);
```

### 6.2 適用パターン

#### 推奨事項

**主キーの更新は一般的に推奨されません**。

代替案:
1. **UUIDを使用**: 変更不要の永続的識別子
2. **サロゲートキー**: 自然キーとは別の技術的ID
3. **論理キーの分離**: 変更可能な値は別カラムに

```typescript
// ✅ 推奨: UUIDで主キー更新不要
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),  // 不変
  email: varchar('email', { length: 255 }).notNull().unique(),  // 変更可能
});

// ON UPDATE CASCADEは保険として設定
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',  // 万が一の更新に備える
    }),
});
```

---

## 7. CASCADE組み合わせパターン

### 7.1 標準的な組み合わせ

| ユースケース | ON DELETE | ON UPDATE | 説明 |
|-------------|-----------|-----------|------|
| 所有関係 | CASCADE | CASCADE | 完全な依存関係 |
| オプショナル参照 | SET NULL | CASCADE | 関連はオプショナル |
| 重要データ | RESTRICT | CASCADE | 削除は明示的に |
| 監査ログ | SET NULL | CASCADE | 履歴を保持 |
| マスターデータ参照 | RESTRICT | CASCADE | マスター保護 |

### 7.2 Drizzle ORM での定義例

```typescript
// 所有関係（強い依存）
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
});

// オプショナル参照
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  assigneeId: uuid('assignee_id')
    .references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
});

// 重要データ（ソフトデリート想定）
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
});
```

---

## 8. パフォーマンス考慮事項

### 8.1 CASCADE削除の影響

大量の子レコードがある場合、CASCADE削除はパフォーマンスに影響します。

**対策**:
1. バッチ削除
2. 削除前の子レコード数確認
3. オフピーク時の実行

```typescript
// 大量削除の安全な実装
async function safeDeleteUser(userId: string) {
  // 1. 影響範囲の確認
  const orderCount = await db.select({ count: count() })
    .from(orders)
    .where(eq(orders.userId, userId));

  if (orderCount[0].count > 1000) {
    // 2. バッチ削除
    const batchSize = 100;
    let deleted = 0;

    while (deleted < orderCount[0].count) {
      await db.delete(orderItems)
        .where(
          inArray(
            orderItems.orderId,
            db.select({ id: orders.id })
              .from(orders)
              .where(eq(orders.userId, userId))
              .limit(batchSize)
          )
        );

      await db.delete(orders)
        .where(eq(orders.userId, userId))
        .limit(batchSize);

      deleted += batchSize;
    }
  }

  // 3. ユーザー削除
  await db.delete(users).where(eq(users.id, userId));
}
```

### 8.2 インデックスの重要性

外部キーカラムにはインデックスが必須です。

```typescript
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
}, (table) => ({
  // 外部キーインデックス（パフォーマンスのため必須）
  userIdIdx: index('idx_orders_user_id').on(table.userId),
}));
```

---

## まとめ

### 選択フローチャート

```
削除時の子レコード処理は？
│
├─ 子も不要 → ON DELETE CASCADE
│   └─ 例: セッション、一時データ、注文明細
│
├─ 子を保持、関連を解除 → ON DELETE SET NULL
│   └─ 例: 未分類商品、匿名コメント
│   └─ 条件: 外部キーがNULL許可
│
├─ 子を保持、削除を禁止 → ON DELETE RESTRICT
│   └─ 例: ソフトデリート、監査要件
│   └─ アプリケーション側で明示的処理
│
├─ デフォルト値に設定 → ON DELETE SET DEFAULT
│   └─ 例: フォールバックカテゴリ（稀に使用）
│
└─ 遅延チェック → ON DELETE NO ACTION + DEFERRABLE
    └─ 例: 複雑なトランザクション内での一時的違反
```
