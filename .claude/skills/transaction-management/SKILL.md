---
name: transaction-management
description: |
  ACID特性とトランザクション境界の適切な設計による、データ整合性の保証。
  分離レベル選択、デッドロック回避、Drizzle ORMトランザクションAPIの効果的活用を提供。

  専門分野:
  - ACID特性: Atomicity、Consistency、Isolation、Durability の保証
  - 分離レベル: READ COMMITTED、REPEATABLE READ、SERIALIZABLE の選択
  - ロック戦略: 楽観的ロック vs 悲観的ロック、デッドロック回避
  - Drizzle ORM: db.transaction() API、ネストトランザクション

  使用タイミング:
  - 複数テーブル更新時のデータ整合性設計
  - 同時実行制御の設計時
  - デッドロック問題の調査・解決時
  - パフォーマンスとの整合性トレードオフ判断時

  Use proactively when designing multi-table updates, handling concurrent access,
  or resolving deadlock issues in database operations.
version: 1.0.0
---

# Transaction Management Skill

## 参照コマンド

```bash
# 詳細リソース参照
cat .claude/skills/transaction-management/resources/isolation-levels-detail.md

# チェックリストテンプレート参照
cat .claude/skills/transaction-management/templates/transaction-design-checklist.md

# 問題検出スクリプト実行
node .claude/skills/transaction-management/scripts/detect-long-transactions.mjs --code src/
```

## 概要

このスキルは、データベーストランザクションの設計と実装に関する専門知識を提供します。
ACID特性の理解に基づき、データ整合性とパフォーマンスのバランスを実現します。

## ACID特性の理解

### Atomicity（原子性）

トランザクション内の操作はすべて成功するか、すべて失敗するか。

```typescript
// Drizzle ORM
await db.transaction(async (tx) => {
  // すべて成功するか、すべてロールバック
  await tx.insert(orders).values({ userId, total });
  await tx.update(inventory).set({ stock: sql`stock - 1` }).where(eq(inventory.productId, productId));
  await tx.insert(orderHistory).values({ orderId, action: 'created' });
});
```

### Consistency（一貫性）

トランザクション完了後、データベースは有効な状態を維持。

**実現方法**:
- 制約（外部キー、CHECK、UNIQUE）
- トリガー
- アプリケーション層バリデーション

### Isolation（分離性）

同時実行トランザクションが互いに干渉しない。

### Durability（永続性）

コミットされたトランザクションは永続化される。

## 分離レベルの選択

### PostgreSQL分離レベル

| 分離レベル | Dirty Read | Non-repeatable Read | Phantom Read | 使用場面 |
|-----------|------------|---------------------|--------------|----------|
| READ UNCOMMITTED | N/A | 可能 | 可能 | PostgreSQLでは未サポート |
| READ COMMITTED | 防止 | 可能 | 可能 | デフォルト、一般的な操作 |
| REPEATABLE READ | 防止 | 防止 | 防止* | 一貫性が必要なレポート |
| SERIALIZABLE | 防止 | 防止 | 防止 | 金融取引、厳密な整合性 |

*PostgreSQLではREPEATABLE READでPhantom Readも防止

### 選択フローチャート

```
データ整合性要件は？
├─ 読み取り専用、最新データ不要
│   └─ READ COMMITTED（デフォルト）
│
├─ 読み取り中にデータが変わると問題
│   └─ REPEATABLE READ
│   └─ 例: レポート生成、集計処理
│
├─ 厳密な直列化が必要
│   └─ SERIALIZABLE
│   └─ 例: 金融取引、在庫管理（競合時）
│
└─ パフォーマンス優先、一時的不整合許容
    └─ READ COMMITTED + アプリ層での補償
```

### Drizzle ORMでの分離レベル設定

```typescript
import { sql } from 'drizzle-orm';

// REPEATABLE READ
await db.transaction(async (tx) => {
  await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ`);
  // トランザクション処理
}, { isolationLevel: 'repeatable read' });

// SERIALIZABLE
await db.transaction(async (tx) => {
  // 厳密な整合性が必要な処理
}, { isolationLevel: 'serializable' });
```

## ロック戦略

### 楽観的ロック（Optimistic Locking）

競合が少ない場合に推奨。バージョン番号で検出。

```typescript
// スキーマ定義
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  stock: integer('stock').notNull().default(0),
  version: integer('version').notNull().default(1), // バージョン番号
});

// 更新処理
async function updateStock(productId: string, newStock: number, expectedVersion: number) {
  const result = await db.update(products)
    .set({
      stock: newStock,
      version: sql`${products.version} + 1`,
    })
    .where(and(
      eq(products.id, productId),
      eq(products.version, expectedVersion) // 楽観的ロック
    ))
    .returning();

  if (result.length === 0) {
    throw new OptimisticLockError('データが他のユーザーに更新されました');
  }
  return result[0];
}
```

### 悲観的ロック（Pessimistic Locking）

競合が多い場合、または整合性が最優先の場合。

```typescript
// SELECT FOR UPDATE
await db.transaction(async (tx) => {
  // 行をロック
  const [product] = await tx.execute(
    sql`SELECT * FROM products WHERE id = ${productId} FOR UPDATE`
  );

  // ロック中に安全に更新
  await tx.update(products)
    .set({ stock: product.stock - 1 })
    .where(eq(products.id, productId));
});

// SELECT FOR UPDATE NOWAIT（即座にエラー）
await tx.execute(
  sql`SELECT * FROM products WHERE id = ${productId} FOR UPDATE NOWAIT`
);

// SELECT FOR UPDATE SKIP LOCKED（ロック行をスキップ）
await tx.execute(
  sql`SELECT * FROM products WHERE status = 'pending' FOR UPDATE SKIP LOCKED LIMIT 10`
);
```

### ロック戦略の選択

| 要因 | 楽観的ロック | 悲観的ロック |
|------|-------------|-------------|
| 競合頻度 | 低い | 高い |
| トランザクション時間 | 長い | 短い |
| リトライコスト | 低い | 高い |
| スケーラビリティ | 高い | 低い |
| 実装複雑度 | 中 | 低 |

## デッドロック回避

### デッドロックの原因

```
トランザクションA: テーブル1 → テーブル2
トランザクションB: テーブル2 → テーブル1
```

### 回避パターン

#### パターン1: 一貫したロック順序

```typescript
// ❌ デッドロックの可能性
async function transferA(fromId: string, toId: string, amount: number) {
  await db.transaction(async (tx) => {
    await tx.update(accounts).set({ balance: sql`balance - ${amount}` }).where(eq(accounts.id, fromId));
    await tx.update(accounts).set({ balance: sql`balance + ${amount}` }).where(eq(accounts.id, toId));
  });
}

// ✅ 常に小さいIDから順にロック
async function transferSafe(fromId: string, toId: string, amount: number) {
  const [first, second] = fromId < toId ? [fromId, toId] : [toId, fromId];
  const [firstAmount, secondAmount] = fromId < toId ? [-amount, amount] : [amount, -amount];

  await db.transaction(async (tx) => {
    await tx.update(accounts).set({ balance: sql`balance + ${firstAmount}` }).where(eq(accounts.id, first));
    await tx.update(accounts).set({ balance: sql`balance + ${secondAmount}` }).where(eq(accounts.id, second));
  });
}
```

#### パターン2: トランザクション時間の最小化

```typescript
// ❌ 長いトランザクション
await db.transaction(async (tx) => {
  const data = await fetchExternalAPI(); // 外部API呼び出し
  await tx.insert(records).values(data);
});

// ✅ 外部呼び出しはトランザクション外
const data = await fetchExternalAPI();
await db.transaction(async (tx) => {
  await tx.insert(records).values(data);
});
```

#### パターン3: タイムアウト設定

```typescript
// ステートメントタイムアウト
await db.execute(sql`SET statement_timeout = '5000'`); // 5秒

// ロックタイムアウト
await db.execute(sql`SET lock_timeout = '3000'`); // 3秒
```

## トランザクション境界の設計

### Repository層でのカプセル化

```typescript
class OrderRepository {
  // 単一操作（暗黙のトランザクション）
  async findById(id: string): Promise<Order | null> {
    return await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
  }

  // 複数操作（明示的トランザクション）
  async createWithItems(order: NewOrder, items: NewOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(orders).values(order).returning();

      const itemsWithOrderId = items.map(item => ({
        ...item,
        orderId: created.id,
      }));
      await tx.insert(orderItems).values(itemsWithOrderId);

      return created;
    });
  }
}
```

### Service層でのトランザクション管理

```typescript
class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private inventoryRepo: InventoryRepository,
    private db: Database
  ) {}

  async placeOrder(userId: string, items: CartItem[]): Promise<Order> {
    return await this.db.transaction(async (tx) => {
      // 1. 在庫確認と予約
      for (const item of items) {
        await this.inventoryRepo.reserveStock(tx, item.productId, item.quantity);
      }

      // 2. 注文作成
      const order = await this.orderRepo.create(tx, { userId, items });

      // 3. 決済処理（外部APIは別トランザクション）
      // 注: 外部APIエラー時は補償トランザクションで対応

      return order;
    });
  }
}
```

## エラーハンドリング

### リトライパターン

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (isRetryableError(error) && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // 指数バックオフ
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // PostgreSQLのシリアライゼーション失敗
    return error.message.includes('could not serialize access') ||
           error.message.includes('deadlock detected');
  }
  return false;
}
```

### 補償トランザクション（Saga パターン）

```typescript
class OrderSaga {
  async execute(order: OrderRequest): Promise<void> {
    const steps: SagaStep[] = [];

    try {
      // ステップ1: 在庫予約
      await this.inventoryService.reserve(order.items);
      steps.push({ name: 'inventory', compensate: () => this.inventoryService.release(order.items) });

      // ステップ2: 決済
      const paymentId = await this.paymentService.charge(order.total);
      steps.push({ name: 'payment', compensate: () => this.paymentService.refund(paymentId) });

      // ステップ3: 注文確定
      await this.orderService.confirm(order);

    } catch (error) {
      // 補償トランザクション実行（逆順）
      for (const step of steps.reverse()) {
        await step.compensate();
      }
      throw error;
    }
  }
}
```

## 設計判断チェックリスト

### トランザクション設計時

- [ ] トランザクション境界が明確に定義されているか？
- [ ] 分離レベルが要件に適切か？
- [ ] 長時間トランザクションがないか？
- [ ] 外部API呼び出しがトランザクション外か？

### ロック戦略選択時

- [ ] 競合頻度が評価されているか？
- [ ] 楽観的/悲観的ロックの選択理由が明確か？
- [ ] デッドロック回避策があるか？
- [ ] タイムアウト設定が適切か？

### エラーハンドリング

- [ ] リトライ戦略が実装されているか？
- [ ] 補償トランザクションが必要な場合、設計されているか？
- [ ] エラーログが十分か？

## 関連スキル

- `.claude/skills/database-normalization/SKILL.md` - データ整合性の基盤
- `.claude/skills/foreign-key-constraints/SKILL.md` - 参照整合性との連携
- `.claude/skills/query-optimization/SKILL.md` - トランザクション内クエリ最適化

## 参照リソース

詳細な情報は以下のリソースを参照:

```bash
# 分離レベル詳細リファレンス
cat .claude/skills/transaction-management/resources/isolation-levels-detail.md

# トランザクション設計チェックリスト
cat .claude/skills/transaction-management/templates/transaction-design-checklist.md

# 長時間トランザクション検出スクリプト
node .claude/skills/transaction-management/scripts/detect-long-transactions.mjs --code src/
```
