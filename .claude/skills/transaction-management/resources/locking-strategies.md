# ロック戦略

## ロックの必要性

並行アクセス時のデータ整合性を保証するため、適切なロック戦略が必要。
ロストアップデートやレースコンディションを防止する。

## ロック種類

### 楽観的ロック（Optimistic Locking）

**概念**: 競合は稀であると仮定し、更新時にのみ競合をチェック

**仕組み**:
1. データ読み取り時にバージョンを取得
2. 更新時にバージョンをチェック
3. バージョンが変わっていれば競合エラー

**実装パターン**:
```typescript
// バージョンカラムを使用
interface Workflow {
  id: string
  name: string
  version: number  // バージョンカラム
}

async function updateWorkflow(workflow: Workflow) {
  const result = await db
    .update(workflows)
    .set({
      name: workflow.name,
      version: workflow.version + 1,
    })
    .where(
      and(
        eq(workflows.id, workflow.id),
        eq(workflows.version, workflow.version)  // バージョンチェック
      )
    )

  if (result.rowCount === 0) {
    throw new OptimisticLockError('Workflow was modified by another transaction')
  }
}
```

**メリット**:
- ロック待ちがない
- スループットが高い
- デッドロックが発生しない

**デメリット**:
- 競合時にリトライが必要
- 高競合時に効率が低下

**適用場面**:
- 競合頻度が低い場合
- Webアプリケーションの一般的なCRUD
- 長時間のユーザー編集操作

### 悲観的ロック（Pessimistic Locking）

**概念**: 競合があると仮定し、操作前にロックを取得

**仕組み**:
1. SELECT FOR UPDATEでロック取得
2. 他のトランザクションはロック解放まで待機
3. 処理完了後にロック解放

**実装パターン**:
```typescript
async function withdrawMoney(accountId: string, amount: number) {
  await db.transaction(async (tx) => {
    // 排他ロック取得
    const [account] = await tx
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .for('update')  // SELECT FOR UPDATE

    if (account.balance < amount) {
      throw new InsufficientFundsError()
    }

    await tx
      .update(accounts)
      .set({ balance: account.balance - amount })
      .where(eq(accounts.id, accountId))
  })
}
```

**メリット**:
- 競合を確実に防止
- データの一貫性を強く保証
- リトライ不要

**デメリット**:
- ロック待ちによるスループット低下
- デッドロックのリスク
- タイムアウトの考慮が必要

**適用場面**:
- 競合頻度が高い場合
- 金融処理など厳密性が必要な場合
- 短いトランザクション

## ロック種類の比較

| 項目 | 楽観的ロック | 悲観的ロック |
|------|-------------|-------------|
| ロック取得 | なし | SELECT FOR UPDATE |
| 競合検出 | 更新時 | ロック取得時 |
| 待機 | なし | あり |
| デッドロック | なし | あり |
| 競合時動作 | エラー/リトライ | 待機 |
| 適用場面 | 低競合 | 高競合 |

## ロック戦略選択ガイド

```
競合頻度を評価
    │
    ├─ 低競合（同じデータへの同時アクセスが稀）
    │   └─ 楽観的ロック
    │       └─ バージョンカラムで実装
    │
    ├─ 高競合（同じデータへの同時アクセスが頻繁）
    │   └─ 悲観的ロック
    │       └─ SELECT FOR UPDATE で実装
    │
    └─ 混在
        └─ 通常は楽観的ロック + 特定操作のみ悲観的ロック
```

## デッドロック対策

### デッドロックとは

複数のトランザクションが互いにロック解放を待ち、永遠に進まない状態。

**例**:
```
トランザクションA: アカウント1をロック
トランザクションB: アカウント2をロック
トランザクションA: アカウント2のロックを待機 ←
トランザクションB: アカウント1のロックを待機 ← デッドロック！
```

### 対策方法

#### 1. ロック順序の統一

```typescript
async function transfer(from: string, to: string, amount: number) {
  // IDでソートして常に同じ順序でロック
  const [firstId, secondId] = [from, to].sort()

  await db.transaction(async (tx) => {
    // 常に小さいIDから先にロック
    await tx.select().from(accounts).where(eq(accounts.id, firstId)).for('update')
    await tx.select().from(accounts).where(eq(accounts.id, secondId)).for('update')

    // 更新処理...
  })
}
```

#### 2. タイムアウト設定

```sql
-- PostgreSQL
SET lock_timeout = '5s';
```

```typescript
// アプリケーションレベル
await db.transaction(
  async (tx) => { /* ... */ },
  { timeout: 5000 }
)
```

#### 3. リトライロジック

```typescript
async function withDeadlockRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (isDeadlockError(error) && attempt < maxRetries) {
        await sleep(Math.random() * 100)  // ランダム遅延
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

function isDeadlockError(error: unknown): boolean {
  return (error as any)?.code === '40P01'  // PostgreSQL deadlock
}
```

## PostgreSQLのロックモード

| ロックモード | 用途 | 競合 |
|-------------|------|------|
| FOR UPDATE | 排他更新 | 他のFOR UPDATEと競合 |
| FOR NO KEY UPDATE | 外部キーを変更しない更新 | FOR UPDATEと競合、FOR KEY SHAREとは競合しない |
| FOR SHARE | 共有読み取り | FOR UPDATEと競合 |
| FOR KEY SHARE | 外部キー参照 | FOR UPDATEと競合 |

### NOWAIT と SKIP LOCKED

```sql
-- ロック取得できなければ即座にエラー
SELECT * FROM accounts WHERE id = 1 FOR UPDATE NOWAIT;

-- ロックされている行をスキップ
SELECT * FROM jobs WHERE status = 'pending' FOR UPDATE SKIP LOCKED LIMIT 1;
```

**SKIP LOCKED の使用場面**:
- ジョブキュー
- ワーカープロセス
- 並列処理

```typescript
// ジョブキューの実装例
async function pickNextJob() {
  return await db.transaction(async (tx) => {
    const [job] = await tx
      .select()
      .from(jobs)
      .where(eq(jobs.status, 'pending'))
      .for('update', { skipLocked: true })
      .limit(1)

    if (!job) return null

    await tx.update(jobs).set({ status: 'processing' }).where(eq(jobs.id, job.id))
    return job
  })
}
```

## チェックリスト

### ロック戦略選択時

- [ ] 競合頻度は高いか低いか？
- [ ] トランザクションの長さは？
- [ ] パフォーマンス要件は？
- [ ] データの重要度は？

### 実装時

- [ ] 楽観的ロックの場合、バージョンカラムがあるか？
- [ ] 悲観的ロックの場合、デッドロック対策があるか？
- [ ] ロック順序は統一されているか？
- [ ] タイムアウトは設定されているか？
- [ ] リトライロジックは実装されているか？
