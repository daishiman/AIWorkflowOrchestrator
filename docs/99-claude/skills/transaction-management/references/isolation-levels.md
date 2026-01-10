# 分離レベルガイド（SQLite版）

## 分離レベルとは

SQLiteでは、トランザクションモードによって並行実行されるトランザクションがどの程度互いの影響を受けるかを定義します。
SQLiteは**データベースレベルのロック**を使用し、PostgreSQLなどの行レベルロックとは異なるアプローチを取ります。

## SQLiteの特徴

### デフォルトの分離性

- SQLiteは本質的に**SERIALIZABLE**分離レベルを実装
- すべてのトランザクションは順番に実行されたかのように動作
- Dirty Read、Non-Repeatable Read、Phantom Readはすべて防止される

### データベースレベルロック

- **5段階のロックレベル**: UNLOCKED → SHARED → RESERVED → PENDING → EXCLUSIVE
- 複数の読み取りトランザクションが同時実行可能
- 書き込みトランザクションは排他的

## トランザクションモード

### DEFERRED（デフォルト）

**特徴**:

- トランザクション開始時にロックを取得しない
- 最初の読み取り操作でSHAREDロックを取得
- 最初の書き込み操作でRESERVEDロックを取得
- 読み取り優先

**発生する問題**: なし（SERIALIZABLE分離レベル）

**使用場面**:

- 一般的なCRUD操作
- 読み取りが多いアプリケーション
- Webアプリケーションの大半

**設定**:

```sql
BEGIN DEFERRED TRANSACTION;
-- または単に
BEGIN;
```

**TypeScript例**:

```typescript
// DEFERREDはデフォルト
await db.transaction(async (tx) => {
  const user = await tx.query.users.findFirst({
    where: eq(users.id, userId),
  });
  await tx
    .update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.id, userId));
});
```

### IMMEDIATE

**特徴**:

- トランザクション開始時に即座にRESERVEDロックを取得
- 他のトランザクションによる書き込みを防止
- 読み取りは他のトランザクションから可能
- 書き込み優先、早期ロック取得

**発生する問題**: なし（SERIALIZABLE分離レベル）

**使用場面**:

- 書き込みが予想される操作
- ロック競合を早期に検出したい場合
- 書き込みトランザクションの優先度が高い場合

**設定**:

```sql
BEGIN IMMEDIATE TRANSACTION;
```

**TypeScript例**:

```typescript
// Drizzle ORMでは明示的なSQLで指定
await db.transaction(async (tx) => {
  await tx.execute(sql`BEGIN IMMEDIATE`);

  const [product] = await tx
    .select()
    .from(products)
    .where(eq(products.id, productId));
  if (product.stock < quantity) {
    throw new InsufficientStockError();
  }
  await tx
    .update(products)
    .set({ stock: product.stock - quantity })
    .where(eq(products.id, productId));
});
```

### EXCLUSIVE

**特徴**:

- トランザクション開始時に即座にEXCLUSIVEロックを取得
- 他のすべてのトランザクション（読み取り含む）をブロック
- 最も厳格な分離
- データベース全体を独占

**発生する問題**: なし（SERIALIZABLE分離レベル）

**使用場面**:

- データベース構造の変更
- 一貫性チェック
- バックアップ操作
- **通常のアプリケーション処理では推奨されない**

**設定**:

```sql
BEGIN EXCLUSIVE TRANSACTION;
```

**TypeScript例**:

```typescript
// EXCLUSIVEは特殊な状況でのみ使用
await db.transaction(async (tx) => {
  await tx.execute(sql`BEGIN EXCLUSIVE`);

  // データベース全体の整合性チェック
  await performDatabaseIntegrityCheck(tx);
});
```

## トランザクションモード選択ガイド

### 選択フローチャート

```
要件を確認
    │
    ├─ データベース全体の独占が必要
    │   └─ EXCLUSIVE
    │       └─ 注意: すべてのアクセスをブロックする
    │
    ├─ 書き込みが確実に発生する
    │   └─ IMMEDIATE
    │       └─ 早期にRESERVEDロックを取得
    │
    └─ 読み取りが多い、または書き込みが不確実
        └─ DEFERRED（デフォルト）
            └─ 必要になってからロックを取得
```

### 比較表

| トランザクションモード | 初期ロック | 並行性 | ロック競合リスク | 推奨用途               |
| ---------------------- | ---------- | ------ | ---------------- | ---------------------- |
| DEFERRED               | なし       | 最高   | 低               | 一般CRUD（デフォルト） |
| IMMEDIATE              | RESERVED   | 中     | 中               | 書き込み確実           |
| EXCLUSIVE              | EXCLUSIVE  | 最低   | 高               | DB管理操作のみ         |

## WALモードによる並行性向上

### WAL（Write-Ahead Logging）モード

**概要**:

- 書き込みを別ファイル（WAL）に記録
- 読み取りと書き込みの並行実行が可能
- デフォルトのロールバックジャーナルより高速

**有効化**:

```sql
PRAGMA journal_mode=WAL;
```

**メリット**:

- 読み取りが書き込みをブロックしない
- 書き込みが読み取りをブロックしない（コミット時を除く）
- パフォーマンスの大幅な向上

**デメリット**:

- 複数ファイルの管理（main DB、WAL、SHM）
- ネットワークファイルシステムでは非推奨

**設定例**:

```typescript
// アプリケーション起動時に設定
await db.execute(sql`PRAGMA journal_mode=WAL`);
await db.execute(sql`PRAGMA busy_timeout=5000`); // 5秒のタイムアウト
```

## Busy Timeout（ビジータイムアウト）

### 概要

SQLiteでロックが取得できない場合、エラーを返す代わりに待機する時間を設定できます。

### 設定方法

```sql
PRAGMA busy_timeout=5000; -- 5秒待機
```

```typescript
// アプリケーション初期化時
await db.execute(sql`PRAGMA busy_timeout=5000`);

// トランザクション内で使用
await db.transaction(async (tx) => {
  // ロックが取れない場合、最大5秒待機
  await tx
    .update(accounts)
    .set({ balance: newBalance })
    .where(eq(accounts.id, accountId));
});
```

### 推奨設定

- Webアプリケーション: 3000-5000ms
- バッチ処理: 10000-30000ms
- リアルタイムアプリ: 1000-2000ms

## 実装パターン

### DEFERRED での実装

```typescript
// 通常の操作（デフォルト）
async function updateWorkflowStatus(id: string, status: string) {
  await db.transaction(async (tx) => {
    await tx.update(workflows).set({ status }).where(eq(workflows.id, id));
  });
}
```

### IMMEDIATE での実装

```typescript
// 書き込み確実な操作
async function reserveInventory(productId: string, quantity: number) {
  return await db.transaction(async (tx) => {
    // IMPROVEDロックを早期取得
    await tx.execute(sql`BEGIN IMMEDIATE`);

    const [product] = await tx
      .select()
      .from(products)
      .where(eq(products.id, productId));
    if (product.stock < quantity) {
      throw new InsufficientStockError();
    }
    await tx
      .update(products)
      .set({ stock: product.stock - quantity })
      .where(eq(products.id, productId));
    await tx.insert(reservations).values({ productId, quantity });
  });
}
```

### EXCLUSIVE での実装（稀）

```typescript
// データベース整合性チェック（管理操作）
async function performDatabaseMaintenance() {
  return await db.transaction(async (tx) => {
    await tx.execute(sql`BEGIN EXCLUSIVE`);

    // データベース全体の操作
    await tx.execute(sql`VACUUM`);
    await tx.execute(sql`ANALYZE`);
  });
}
```

## Busy状態のハンドリング

### リトライロジック付きトランザクション

```typescript
async function transactionWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (isBusyError(error) && attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 100); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

function isBusyError(error: unknown): boolean {
  return (error as any)?.code === "SQLITE_BUSY";
}
```

## チェックリスト

### トランザクションモード選択時

- [ ] 書き込みが確実に発生するか？（YES → IMMEDIATE）
- [ ] 読み取りが多いか？（YES → DEFERRED）
- [ ] データベース全体の独占が必要か？（YES → EXCLUSIVE、稀）
- [ ] WALモードが有効か？

### 実装時

- [ ] 適切なトランザクションモードが設定されているか？
- [ ] busy_timeoutが設定されているか？
- [ ] Busyエラーのリトライロジックがあるか？
- [ ] WALモードの有効化を検討したか？
