# ACID特性の詳細

## 概要

ACIDは、データベーストランザクションの信頼性を保証する4つの特性。
これらの特性により、システム障害や並行アクセスがあってもデータの整合性が保たれる。

## Atomicity（原子性）

### 定義

トランザクション内のすべての操作は、完全に実行されるか、全く実行されないかのどちらか。
「部分的な成功」は存在しない。

### 重要性

- 部分更新によるデータ不整合を防止
- エラー時の安全な復旧を保証
- ビジネス操作の一貫性を確保

### 実現方法

**トランザクションの使用**:
```typescript
// 概念的な実装
async function transferMoney(from: string, to: string, amount: number) {
  await db.transaction(async (tx) => {
    await tx.update(accounts).set({ balance: sql`balance - ${amount}` }).where(eq(accounts.id, from))
    await tx.update(accounts).set({ balance: sql`balance + ${amount}` }).where(eq(accounts.id, to))
    // どちらかが失敗すれば両方ロールバック
  })
}
```

### チェックリスト

- [ ] 関連する操作がすべて同一トランザクション内か？
- [ ] エラー時に自動ロールバックされるか？
- [ ] 部分的な成功状態が発生しないか？

## Consistency（一貫性）

### 定義

トランザクションは、データベースを一つの有効な状態から別の有効な状態に遷移させる。
すべての制約（外部キー、一意制約、チェック制約）が常に満たされる。

### 重要性

- データの妥当性を保証
- ビジネスルールの自動適用
- 無効なデータの防止

### 実現方法

**データベース制約**:
```sql
-- 外部キー制約
ALTER TABLE orders ADD CONSTRAINT fk_user
FOREIGN KEY (user_id) REFERENCES users(id);

-- チェック制約
ALTER TABLE accounts ADD CONSTRAINT check_balance
CHECK (balance >= 0);

-- 一意制約
ALTER TABLE users ADD CONSTRAINT unique_email
UNIQUE (email);
```

**アプリケーションバリデーション**:
```typescript
// トランザクション前のバリデーション
if (account.balance < amount) {
  throw new InsufficientFundsError()
}
```

### チェックリスト

- [ ] 必要なデータベース制約が定義されているか？
- [ ] アプリケーションレベルのバリデーションがあるか？
- [ ] 制約違反時の処理が定義されているか？

## Isolation（分離性）

### 定義

並行実行されるトランザクションは互いに干渉しない。
各トランザクションは、他のトランザクションの途中状態を見ることなく実行される。

### 重要性

- 並行アクセスによる不整合を防止
- レースコンディションの回避
- 予測可能な動作の保証

### 分離レベル

| レベル | Dirty Read | Non-Repeatable Read | Phantom Read |
|--------|------------|---------------------|--------------|
| READ UNCOMMITTED | 発生 | 発生 | 発生 |
| READ COMMITTED | 防止 | 発生 | 発生 |
| REPEATABLE READ | 防止 | 防止 | 発生 |
| SERIALIZABLE | 防止 | 防止 | 防止 |

### チェックリスト

- [ ] 適切な分離レベルが選択されているか？
- [ ] 並行アクセスのシナリオが考慮されているか？
- [ ] 分離レベルとパフォーマンスのバランスは適切か？

## Durability（永続性）

### 定義

コミットされたトランザクションの結果は永続的に保存される。
システム障害（クラッシュ、停電）後も失われない。

### 重要性

- データ損失の防止
- システム復旧後の整合性
- 信頼性の保証

### 実現方法

**データベースレベル**:
- Write-Ahead Logging (WAL)
- チェックポイント
- レプリケーション

**アプリケーションレベル**:
- コミット確認後に次処理へ
- 同期書き込みの使用

### チェックリスト

- [ ] WALが有効になっているか？
- [ ] バックアップ戦略があるか？
- [ ] レプリケーションが設定されているか？

## トランザクション設計のベストプラクティス

### 境界の設定

```typescript
// 良い例: ビジネス操作単位
async function completeOrder(orderId: string) {
  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: 'COMPLETED' }).where(eq(orders.id, orderId))
    await tx.insert(orderHistory).values({ orderId, action: 'COMPLETED', ... })
    await tx.update(inventory).set({ ... }).where(...)
  })
}

// 悪い例: 無関係な操作を含む
async function badExample() {
  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: 'COMPLETED' }).where(...)
    await tx.insert(analytics).values({ ... })  // 分析データは別でよい
    await sendEmail(...)  // 外部呼び出しは含めない
  })
}
```

### エラーハンドリング

```typescript
async function safeTransaction() {
  try {
    await db.transaction(async (tx) => {
      // 操作...
    })
    // コミット成功後の処理
    await sendNotification()
  } catch (error) {
    // 自動ロールバック済み
    logger.error('Transaction failed', error)
    throw error
  }
}
```

## アンチパターン

### 1. 長時間トランザクション

```typescript
// ❌ 避けるべき
await db.transaction(async (tx) => {
  const data = await fetchExternalApi()  // 長時間
  await tx.insert(...)
})

// ✅ 推奨
const data = await fetchExternalApi()  // トランザクション外
await db.transaction(async (tx) => {
  await tx.insert(...)  // 短時間
})
```

### 2. 不要なネスト

```typescript
// ❌ 避けるべき
await db.transaction(async (tx1) => {
  await tx1.transaction(async (tx2) => {  // 不要なネスト
    await tx2.insert(...)
  })
})

// ✅ 推奨
await db.transaction(async (tx) => {
  await tx.insert(...)
})
```

### 3. 例外の握りつぶし

```typescript
// ❌ 避けるべき
await db.transaction(async (tx) => {
  try {
    await tx.update(...)
  } catch (e) {
    // 例外を握りつぶすとコミットされる可能性
    console.log(e)
  }
})

// ✅ 推奨
await db.transaction(async (tx) => {
  try {
    await tx.update(...)
  } catch (e) {
    throw e  // 再スローしてロールバック
  }
})
```
