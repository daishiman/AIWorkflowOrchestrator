# 分離レベルガイド

## 分離レベルとは

並行実行されるトランザクションがどの程度互いの影響を受けるかを定義する設定。
高い分離レベルほど一貫性が高いが、並行性とパフォーマンスが低下する。

## 並行性の問題

### Dirty Read（ダーティリード）

**定義**: 他のトランザクションがまだコミットしていないデータを読み取る

**例**:
```
トランザクションA: UPDATE accounts SET balance = 0 WHERE id = 1
トランザクションB: SELECT balance FROM accounts WHERE id = 1  → 0 を読む
トランザクションA: ROLLBACK
→ トランザクションBは無効なデータ（0）を使用してしまう
```

### Non-Repeatable Read（非再現読み取り）

**定義**: 同一トランザクション内で同じクエリが異なる結果を返す

**例**:
```
トランザクションA: SELECT balance FROM accounts WHERE id = 1  → 100
トランザクションB: UPDATE accounts SET balance = 50 WHERE id = 1; COMMIT
トランザクションA: SELECT balance FROM accounts WHERE id = 1  → 50
→ 同じクエリなのに結果が異なる
```

### Phantom Read（ファントムリード）

**定義**: 同一トランザクション内で、検索条件に合う行数が変化する

**例**:
```
トランザクションA: SELECT * FROM orders WHERE user_id = 1  → 3件
トランザクションB: INSERT INTO orders (user_id, ...) VALUES (1, ...); COMMIT
トランザクションA: SELECT * FROM orders WHERE user_id = 1  → 4件
→ 「幽霊」のように新しい行が出現
```

## 分離レベル詳細

### READ UNCOMMITTED

**特徴**:
- 最も低い分離レベル
- 他のトランザクションの未コミットデータも読める
- ほとんど使用されない

**発生する問題**: Dirty Read, Non-Repeatable Read, Phantom Read

**使用場面**: ほぼなし（PostgreSQLでは READ COMMITTED と同じ動作）

### READ COMMITTED（推奨デフォルト）

**特徴**:
- PostgreSQLのデフォルト
- コミット済みデータのみ読める
- ほとんどのユースケースに適切

**発生する問題**: Non-Repeatable Read, Phantom Read

**使用場面**:
- 一般的なCRUD操作
- Webアプリケーションの大半
- パフォーマンスと一貫性のバランスが必要な場合

**設定**:
```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

### REPEATABLE READ

**特徴**:
- 同一トランザクション内での再読み込みが一貫
- PostgreSQLではスナップショット分離
- レポート生成に適切

**発生する問題**: Phantom Read（PostgreSQLでは防止）

**使用場面**:
- 複数回の読み取りで一貫性が必要な場合
- レポート生成
- 集計処理

**設定**:
```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

### SERIALIZABLE

**特徴**:
- 最も高い分離レベル
- トランザクションが順番に実行されたかのように動作
- シリアライゼーションエラーが発生する可能性

**発生する問題**: なし（すべて防止）

**使用場面**:
- 金融処理
- 厳密な整合性が必要な場合
- 在庫管理の重要な操作

**設定**:
```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

## 分離レベル選択ガイド

### 選択フローチャート

```
要件を確認
    │
    ├─ 金融処理や厳密な整合性が必要
    │   └─ SERIALIZABLE
    │       └─ 注意: シリアライゼーションエラー対策が必要
    │
    ├─ レポート生成、集計処理
    │   └─ REPEATABLE READ
    │       └─ 同一データの一貫した読み取りが保証
    │
    └─ 一般的なCRUD
        └─ READ COMMITTED（デフォルト）
            └─ バランスの取れた選択
```

### 比較表

| 分離レベル | 一貫性 | 並行性 | デッドロックリスク | 推奨用途 |
|-----------|--------|--------|------------------|---------|
| READ UNCOMMITTED | 最低 | 最高 | 低 | 使用しない |
| READ COMMITTED | 中 | 高 | 低 | 一般CRUD |
| REPEATABLE READ | 高 | 中 | 中 | レポート |
| SERIALIZABLE | 最高 | 低 | 高 | 金融処理 |

## 実装パターン

### READ COMMITTED での実装

```typescript
// 通常の操作（デフォルトの分離レベル）
async function updateWorkflowStatus(id: string, status: string) {
  await db.transaction(async (tx) => {
    await tx.update(workflows).set({ status }).where(eq(workflows.id, id))
  })
}
```

### REPEATABLE READ での実装

```typescript
// レポート生成（スナップショット一貫性が必要）
async function generateReport() {
  return await db.transaction(
    async (tx) => {
      const users = await tx.select().from(users)
      const orders = await tx.select().from(orders)
      // 両方のクエリが同じ時点のデータを参照
      return combineReport(users, orders)
    },
    { isolationLevel: 'repeatable read' }
  )
}
```

### SERIALIZABLE での実装

```typescript
// 在庫更新（厳密な整合性が必要）
async function reserveInventory(productId: string, quantity: number) {
  // リトライロジック付き
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.transaction(
        async (tx) => {
          const [product] = await tx.select().from(products).where(eq(products.id, productId))
          if (product.stock < quantity) {
            throw new InsufficientStockError()
          }
          await tx.update(products).set({ stock: product.stock - quantity }).where(eq(products.id, productId))
          await tx.insert(reservations).values({ productId, quantity })
        },
        { isolationLevel: 'serializable' }
      )
    } catch (error) {
      if (isSerializationError(error) && attempt < 2) {
        continue  // リトライ
      }
      throw error
    }
  }
}
```

## SERIALIZABLE使用時の注意

### シリアライゼーションエラー

**発生条件**: 並行トランザクションが競合し、シリアライズ可能な順序が見つからない

**対策**:
1. リトライロジックを実装
2. Exponential Backoffを使用
3. 最大リトライ回数を設定

```typescript
async function withSerializableRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (isSerializationError(error) && attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 100)  // Exponential backoff
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

function isSerializationError(error: unknown): boolean {
  return (error as any)?.code === '40001'  // PostgreSQL serialization failure
}
```

## チェックリスト

### 分離レベル選択時

- [ ] 必要な一貫性レベルは何か？
- [ ] 並行性の要求は何か？
- [ ] パフォーマンス要件を満たすか？
- [ ] エラーハンドリング（特にSERIALIZABLE）は考慮されているか？

### 実装時

- [ ] 適切な分離レベルが設定されているか？
- [ ] SERIALIZABLEの場合、リトライロジックがあるか？
- [ ] デッドロック対策があるか？
