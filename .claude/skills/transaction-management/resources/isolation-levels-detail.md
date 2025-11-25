# PostgreSQL 分離レベル詳細リファレンス

## 概要

PostgreSQLの4つの分離レベルの詳細な動作と、各レベルで発生する/防止される現象について解説します。

---

## 分離レベル比較表

| 分離レベル | Dirty Read | Non-repeatable Read | Phantom Read | Serialization Anomaly |
|-----------|------------|---------------------|--------------|----------------------|
| READ UNCOMMITTED* | 防止 | 可能 | 可能 | 可能 |
| READ COMMITTED | 防止 | 可能 | 可能 | 可能 |
| REPEATABLE READ | 防止 | 防止 | 防止 | 可能 |
| SERIALIZABLE | 防止 | 防止 | 防止 | 防止 |

*PostgreSQLではREAD UNCOMMITTEDはREAD COMMITTEDと同じ動作

---

## 1. READ COMMITTED（デフォルト）

### 動作

- 各ステートメント実行時に、その時点でコミットされたデータのみを参照
- 同一トランザクション内でも、ステートメントごとに異なる結果が得られる可能性

### 発生する現象

#### Non-repeatable Read（反復不能読み取り）

```sql
-- トランザクション A
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- 結果: 1000

-- トランザクション B（この間に実行）
UPDATE accounts SET balance = 500 WHERE id = 1;
COMMIT;

-- トランザクション A（続き）
SELECT balance FROM accounts WHERE id = 1;  -- 結果: 500（変わった！）
COMMIT;
```

#### Phantom Read（ファントムリード）

```sql
-- トランザクション A
BEGIN;
SELECT COUNT(*) FROM orders WHERE status = 'pending';  -- 結果: 10

-- トランザクション B（この間に実行）
INSERT INTO orders (status) VALUES ('pending');
COMMIT;

-- トランザクション A（続き）
SELECT COUNT(*) FROM orders WHERE status = 'pending';  -- 結果: 11（増えた！）
COMMIT;
```

### 使用場面

- 一般的なCRUD操作
- 厳密な一貫性が不要な読み取り
- 短時間のトランザクション

### Drizzle ORM例

```typescript
// READ COMMITTEDはデフォルト
await db.transaction(async (tx) => {
  const user = await tx.query.users.findFirst({
    where: eq(users.id, userId),
  });
  // 他のトランザクションがuserを更新する可能性がある
  await tx.update(users).set({ lastLogin: new Date() }).where(eq(users.id, userId));
});
```

---

## 2. REPEATABLE READ

### 動作

- トランザクション開始時点のスナップショットを使用
- 同一トランザクション内では常に同じデータが見える
- 更新競合時はエラー（シリアライゼーション失敗）

### 防止される現象

```sql
-- トランザクション A
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT balance FROM accounts WHERE id = 1;  -- 結果: 1000

-- トランザクション B（この間に実行）
UPDATE accounts SET balance = 500 WHERE id = 1;
COMMIT;

-- トランザクション A（続き）
SELECT balance FROM accounts WHERE id = 1;  -- 結果: 1000（変わらない！）
COMMIT;
```

### シリアライゼーション失敗

```sql
-- トランザクション A
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT * FROM accounts WHERE id = 1;  -- balance: 1000
UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- トランザクション B（Aより先にコミット）
UPDATE accounts SET balance = balance + 200 WHERE id = 1;
COMMIT;

-- トランザクション A（続き）
COMMIT;  -- ERROR: could not serialize access due to concurrent update
```

### 使用場面

- レポート生成（一貫したスナップショット）
- 複数クエリで一貫性が必要な読み取り
- バッチ処理

### Drizzle ORM例

```typescript
await db.transaction(async (tx) => {
  // トランザクション開始時点のスナップショット
}, { isolationLevel: 'repeatable read' });
```

---

## 3. SERIALIZABLE

### 動作

- 完全な直列化を保証
- 同時実行トランザクションが順番に実行されたかのように振る舞う
- SSI（Serializable Snapshot Isolation）により実装

### 防止される現象

#### Serialization Anomaly（直列化異常）

```sql
-- 例: 会計残高の合計が常に一定であるべき制約

-- トランザクション A（口座1から口座2へ100円送金）
BEGIN ISOLATION LEVEL SERIALIZABLE;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- トランザクション B（同時に口座2から口座1へ50円送金）
BEGIN ISOLATION LEVEL SERIALIZABLE;
UPDATE accounts SET balance = balance - 50 WHERE id = 2;
UPDATE accounts SET balance = balance + 50 WHERE id = 1;
COMMIT;

-- SERIALIZABLEでは、一方がシリアライゼーション失敗でロールバック
-- 合計残高の整合性が保たれる
```

### 使用場面

- 金融取引
- 在庫管理（競合が多い場合）
- 厳密な整合性が必要なビジネスロジック

### Drizzle ORM例

```typescript
async function transferFunds(fromId: string, toId: string, amount: number) {
  return await withRetry(async () => {
    return await db.transaction(async (tx) => {
      const [from] = await tx.select().from(accounts).where(eq(accounts.id, fromId));

      if (from.balance < amount) {
        throw new Error('Insufficient funds');
      }

      await tx.update(accounts).set({ balance: sql`balance - ${amount}` }).where(eq(accounts.id, fromId));
      await tx.update(accounts).set({ balance: sql`balance + ${amount}` }).where(eq(accounts.id, toId));

      return { success: true };
    }, { isolationLevel: 'serializable' });
  }, 3); // リトライ3回
}
```

---

## 分離レベル選択フローチャート

```
トランザクション要件は？
│
├─ 読み取り専用、一貫性不要
│   └─ READ COMMITTED
│
├─ 読み取り専用、スナップショット一貫性が必要
│   └─ REPEATABLE READ
│   └─ 例: レポート生成、バッチ読み取り
│
├─ 更新あり、競合少ない
│   └─ READ COMMITTED + 楽観的ロック
│   └─ 例: 一般的なCRUD
│
├─ 更新あり、競合多い
│   ├─ 整合性最優先
│   │   └─ SERIALIZABLE + リトライ
│   │   └─ 例: 金融取引
│   │
│   └─ パフォーマンス優先
│       └─ READ COMMITTED + 悲観的ロック（SELECT FOR UPDATE）
│       └─ 例: 在庫管理
│
└─ 複雑な制約（複数テーブル間の整合性）
    └─ SERIALIZABLE
    └─ 例: 会計システム
```

---

## パフォーマンス影響

| 分離レベル | オーバーヘッド | ロック競合 | リトライ頻度 |
|-----------|---------------|-----------|-------------|
| READ COMMITTED | 低 | 低 | 低 |
| REPEATABLE READ | 中 | 中 | 中 |
| SERIALIZABLE | 高 | 高 | 高 |

### SERIALIZABLE使用時の注意

```typescript
// リトライが必須
async function withRetry<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (isSerializationError(error) && i < maxRetries - 1) {
        await delay(Math.pow(2, i) * 100); // 指数バックオフ
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

function isSerializationError(error: unknown): boolean {
  return error instanceof Error &&
    error.message.includes('could not serialize access');
}
```

---

## ベストプラクティス

1. **デフォルトはREAD COMMITTED**: 多くのケースで十分
2. **レポート生成にはREPEATABLE READ**: 一貫したスナップショット
3. **SERIALIZABLEは慎重に**: リトライロジック必須
4. **楽観的ロックと組み合わせ**: 低分離レベルでも整合性確保
5. **トランザクション時間を最小化**: 競合とデッドロックを減らす
