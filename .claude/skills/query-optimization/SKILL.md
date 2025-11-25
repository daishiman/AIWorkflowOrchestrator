---
name: query-optimization
description: |
  クエリ実行計画の分析とパフォーマンス最適化による、データベースアクセスの効率化。
  N+1問題の解決、JOIN戦略、EXPLAIN ANALYZEの活用を提供。

  専門分野:
  - 実行計画分析: EXPLAIN ANALYZE、コスト見積もり、実行時間分析
  - N+1問題: 検出と解決パターン、Eager/Lazy Loading
  - JOIN戦略: Nested Loop、Hash Join、Merge Join の使い分け
  - Drizzle ORM: with()、クエリビルダー、生SQLの最適化

  使用タイミング:
  - クエリパフォーマンス問題の調査時
  - データ量増加に伴うスローダウン対応時
  - N+1問題の検出・解決時
  - 複雑なJOINクエリの最適化時

  Use proactively when investigating query performance issues,
  resolving N+1 problems, or optimizing complex JOIN queries.
version: 1.0.0
---

# Query Optimization Skill

## 参照コマンド

```bash
# 詳細リソース参照
cat .claude/skills/query-optimization/resources/explain-analyze-guide.md

# チェックリストテンプレート参照
cat .claude/skills/query-optimization/templates/query-optimization-checklist.md

# N+1問題検出スクリプト実行
node .claude/skills/query-optimization/scripts/detect-n-plus-one.mjs src/
```

## 概要

このスキルは、PostgreSQLクエリのパフォーマンス最適化に関する専門知識を提供します。
実行計画の分析に基づき、効率的なデータアクセスを実現します。

## EXPLAIN ANALYZE の活用

### 基本構文

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE user_id = 'uuid-here';
```

### 出力の読み方

```
Seq Scan on orders  (cost=0.00..15.00 rows=100 width=200) (actual time=0.010..0.150 loops=1)
  Filter: (user_id = 'uuid-here'::uuid)
  Rows Removed by Filter: 900
  Buffers: shared hit=10
Planning Time: 0.050 ms
Execution Time: 0.200 ms
```

| 項目 | 説明 |
|------|------|
| cost=0.00..15.00 | 開始コスト..総コスト（相対値） |
| rows=100 | 推定行数 |
| actual time | 実際の実行時間（ms） |
| Rows Removed | フィルタで除外された行数 |
| Buffers: shared hit | キャッシュヒット数 |

### 問題パターンの検出

#### パターン1: Seq Scan（シーケンシャルスキャン）

```sql
-- 問題: インデックスが使われていない
Seq Scan on orders  (cost=0.00..15000.00 rows=100 width=200)
  Filter: (status = 'pending')

-- 解決: インデックス追加
CREATE INDEX idx_orders_status ON orders(status);
```

#### パターン2: 大量の Rows Removed

```sql
-- 問題: 選択性が低い
Index Scan using idx_orders_status on orders  (actual rows=10)
  Rows Removed by Index Recheck: 9990

-- 解決: より選択性の高いインデックス、複合インデックス
CREATE INDEX idx_orders_status_date ON orders(status, created_at);
```

#### パターン3: Nested Loop の過剰使用

```sql
-- 問題: 大量データでのNested Loop
Nested Loop  (cost=0.00..1000000.00 rows=10000)
  -> Seq Scan on orders
  -> Index Scan on order_items

-- 解決: JOINヒント、インデックス最適化
SET enable_nestloop = off; -- 一時的にHash Joinを強制
```

## N+1問題の解決

### N+1問題とは

```typescript
// ❌ N+1問題: 1 + N クエリ
const orders = await db.select().from(ordersTable);
for (const order of orders) {
  // N回のクエリ
  const items = await db.select().from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));
}
```

### 解決パターン

#### パターン1: Eager Loading（with）

```typescript
// ✅ 1回のJOINクエリ
const ordersWithItems = await db.query.orders.findMany({
  with: {
    items: true, // リレーション自動JOIN
  },
});
```

#### パターン2: Manual JOIN

```typescript
// ✅ 明示的JOIN
const ordersWithItems = await db
  .select({
    order: orders,
    item: orderItems,
  })
  .from(orders)
  .leftJoin(orderItems, eq(orders.id, orderItems.orderId));
```

#### パターン3: IN クエリ（バッチ取得）

```typescript
// ✅ 2回のクエリで解決
const ordersList = await db.select().from(orders).where(eq(orders.userId, userId));
const orderIds = ordersList.map(o => o.id);

const itemsList = await db.select().from(orderItems)
  .where(inArray(orderItems.orderId, orderIds));

// アプリ側で結合
const ordersWithItems = ordersList.map(order => ({
  ...order,
  items: itemsList.filter(item => item.orderId === order.id),
}));
```

### N+1検出チェックリスト

- [ ] ループ内でDBクエリを実行していないか？
- [ ] リレーションデータを個別に取得していないか？
- [ ] `with` オプションを使用しているか？
- [ ] クエリログで同一パターンの連続クエリがないか？

## JOIN戦略

### JOINアルゴリズムの比較

| アルゴリズム | 特徴 | 最適ケース |
|-------------|------|-----------|
| Nested Loop | 小規模データ、インデックス利用 | 片方が小さい |
| Hash Join | 等価結合、メモリ内処理 | 中規模データ |
| Merge Join | ソート済みデータ | 大規模データ、範囲結合 |

### Drizzle ORMでのJOIN

```typescript
// LEFT JOIN
const result = await db
  .select()
  .from(orders)
  .leftJoin(users, eq(orders.userId, users.id));

// INNER JOIN
const result = await db
  .select()
  .from(orders)
  .innerJoin(users, eq(orders.userId, users.id));

// 複数テーブルJOIN
const result = await db
  .select()
  .from(orders)
  .leftJoin(users, eq(orders.userId, users.id))
  .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
  .leftJoin(products, eq(orderItems.productId, products.id));
```

### JOINパフォーマンス最適化

#### 1. 必要なカラムのみ選択

```typescript
// ❌ 全カラム取得
const result = await db.select().from(orders).leftJoin(users, eq(orders.userId, users.id));

// ✅ 必要なカラムのみ
const result = await db
  .select({
    orderId: orders.id,
    orderTotal: orders.total,
    userName: users.name,
  })
  .from(orders)
  .leftJoin(users, eq(orders.userId, users.id));
```

#### 2. WHERE句の最適化

```typescript
// ❌ JOIN後にフィルタ
const result = await db
  .select()
  .from(orders)
  .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
  .where(eq(orders.status, 'pending'));

// ✅ サブクエリで先にフィルタ
const pendingOrders = db
  .select()
  .from(orders)
  .where(eq(orders.status, 'pending'))
  .as('pending_orders');

const result = await db
  .select()
  .from(pendingOrders)
  .leftJoin(orderItems, eq(pendingOrders.id, orderItems.orderId));
```

## ページネーション最適化

### オフセットベース（避けるべき）

```typescript
// ❌ 大規模データで遅い
const result = await db
  .select()
  .from(orders)
  .orderBy(desc(orders.createdAt))
  .limit(20)
  .offset(10000); // 10000行スキップが重い
```

### カーソルベース（推奨）

```typescript
// ✅ スケーラブル
const result = await db
  .select()
  .from(orders)
  .where(lt(orders.createdAt, cursorDate)) // カーソル位置から
  .orderBy(desc(orders.createdAt))
  .limit(20);

// 次のカーソル
const nextCursor = result[result.length - 1]?.createdAt;
```

### Keyset Pagination

```typescript
// 複合キーでのカーソル
const result = await db
  .select()
  .from(orders)
  .where(
    or(
      lt(orders.createdAt, cursorDate),
      and(
        eq(orders.createdAt, cursorDate),
        gt(orders.id, cursorId) // 同一日時の場合はIDで
      )
    )
  )
  .orderBy(desc(orders.createdAt), asc(orders.id))
  .limit(20);
```

## 集計クエリの最適化

### COUNT最適化

```typescript
// ❌ 遅い（全行スキャン）
const count = await db.select({ count: sql`count(*)` }).from(orders);

// ✅ 条件付きCOUNTにインデックス活用
const count = await db
  .select({ count: sql`count(*)` })
  .from(orders)
  .where(eq(orders.status, 'pending')); // インデックス対象

// ✅ 概算カウント（大規模テーブル）
const estimate = await db.execute(sql`
  SELECT reltuples::bigint AS estimate
  FROM pg_class WHERE relname = 'orders'
`);
```

### GROUP BY最適化

```typescript
// インデックスの活用
const salesByCategory = await db
  .select({
    categoryId: products.categoryId,
    total: sql`sum(${orderItems.price} * ${orderItems.quantity})`,
  })
  .from(orderItems)
  .innerJoin(products, eq(orderItems.productId, products.id))
  .groupBy(products.categoryId);

// カバリングインデックス
// CREATE INDEX idx_products_category_price ON products(category_id) INCLUDE (price);
```

## JSONB クエリ最適化

### GINインデックス活用

```typescript
// ✅ @> 演算子でGINインデックス使用
const result = await db
  .select()
  .from(workflows)
  .where(sql`${workflows.inputPayload} @> '{"type": "batch"}'`);

// ❌ ->> 演算子はGINインデックス使用不可
const result = await db
  .select()
  .from(workflows)
  .where(sql`${workflows.inputPayload} ->> 'type' = 'batch'`);
```

### 式インデックスとの併用

```sql
-- 頻繁に検索する属性に式インデックス
CREATE INDEX idx_workflows_type ON workflows ((input_payload ->> 'type'));
```

```typescript
// 式インデックスが使われる
const result = await db
  .select()
  .from(workflows)
  .where(sql`${workflows.inputPayload} ->> 'type' = 'batch'`);
```

## パフォーマンス分析ワークフロー

### 1. 問題の特定

```sql
-- スロークエリログの確認
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### 2. 実行計画の分析

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
-- 問題のクエリ
```

### 3. 改善策の検討

| 問題 | 解決策 |
|------|--------|
| Seq Scan | インデックス追加 |
| Rows Removed 多い | インデックス最適化、条件見直し |
| Nested Loop 遅い | JOINアルゴリズム変更、インデックス |
| 大量メモリ使用 | LIMIT追加、バッチ処理 |

### 4. 改善効果の検証

```sql
-- Before/After比較
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
-- 改善後のクエリ
```

## 設計判断チェックリスト

### クエリ設計時

- [ ] N+1問題がないか確認したか？
- [ ] 必要なカラムのみ選択しているか？
- [ ] インデックスが活用されるWHERE句か？
- [ ] ページネーションはカーソルベースか？

### パフォーマンス問題発生時

- [ ] EXPLAIN ANALYZEで実行計画を確認したか？
- [ ] Seq Scanの原因を特定したか？
- [ ] インデックス追加の影響を評価したか？
- [ ] 改善効果を測定したか？

## 関連スキル

- `.claude/skills/indexing-strategies/SKILL.md` - インデックス設計
- `.claude/skills/jsonb-optimization/SKILL.md` - JSONB最適化
- `.claude/skills/transaction-management/SKILL.md` - トランザクション内最適化

## 参照リソース

詳細な情報は以下のリソースを参照:

```bash
# EXPLAIN ANALYZE完全ガイド
cat .claude/skills/query-optimization/resources/explain-analyze-guide.md

# クエリ最適化チェックリスト
cat .claude/skills/query-optimization/templates/query-optimization-checklist.md

# N+1問題検出スクリプト
node .claude/skills/query-optimization/scripts/detect-n-plus-one.mjs src/
```
