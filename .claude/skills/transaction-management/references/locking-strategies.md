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
  id: string;
  name: string;
  version: number; // バージョンカラム
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
        eq(workflows.version, workflow.version), // バージョンチェック
      ),
    );

  if (result.rowCount === 0) {
    throw new OptimisticLockError(
      "Workflow was modified by another transaction",
    );
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

1. BEGIN IMMEDIATE/EXCLUSIVEでデータベースをロック
2. 他のトランザクションは書き込みロック解放まで待機（IMMEDIATE）または全アクセス待機（EXCLUSIVE）
3. 処理完了後にロック解放

**実装パターン**:

```typescript
async function withdrawMoney(accountId: string, amount: number) {
  // SQLiteではBEGIN IMMEDIATEで書き込みロックを取得
  await db.run("BEGIN IMMEDIATE");

  try {
    const account = await db.get("SELECT * FROM accounts WHERE id = ?", [
      accountId,
    ]);

    if (account.balance < amount) {
      await db.run("ROLLBACK");
      throw new InsufficientFundsError();
    }

    await db.run("UPDATE accounts SET balance = ? WHERE id = ?", [
      account.balance - amount,
      accountId,
    ]);

    await db.run("COMMIT");
  } catch (error) {
    await db.run("ROLLBACK");
    throw error;
  }
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

| 項目         | 楽観的ロック    | 悲観的ロック              |
| ------------ | --------------- | ------------------------- |
| ロック取得   | なし            | BEGIN IMMEDIATE/EXCLUSIVE |
| 競合検出     | 更新時          | トランザクション開始時    |
| 待機         | なし            | あり                      |
| デッドロック | なし            | なし（単一DB）            |
| 競合時動作   | エラー/リトライ | 待機                      |
| 適用場面     | 低競合          | 高競合                    |

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
    │       └─ BEGIN IMMEDIATE で実装
    │
    └─ 混在
        └─ 通常は楽観的ロック + 特定操作のみ悲観的ロック
```

## ロック競合対策

### ロック競合について

**SQLiteの特性**:

- データベースレベルのロック（行ロックなし）
- デッドロックは基本的に発生しない（単一データベースファイル）
- SQLITE_BUSYエラーが発生する可能性がある

**SQLITE_BUSYエラー**:

```
トランザクションA: BEGIN IMMEDIATE（書き込みロック取得）
トランザクションB: BEGIN IMMEDIATE（ロック待機）
→ タイムアウト後、SQLITE_BUSYエラー
```

### 対策方法

#### 1. タイムアウトとリトライ設定

```typescript
// SQLiteのbusyタイムアウト設定
await db.run("PRAGMA busy_timeout = 5000"); // 5秒待機

// アプリケーションレベル
const maxRetries = 3;
for (let attempt = 0; attempt <= maxRetries; attempt++) {
  try {
    await db.run("BEGIN IMMEDIATE");
    // トランザクション処理...
    await db.run("COMMIT");
    break;
  } catch (error) {
    if (error.code === "SQLITE_BUSY" && attempt < maxRetries) {
      await sleep(Math.random() * 100); // ランダム遅延
      continue;
    }
    throw error;
  }
}
```

#### 2. リトライロジック

```typescript
async function withBusyRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (isBusyError(error) && attempt < maxRetries) {
        await sleep(Math.random() * 100); // ランダム遅延
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

function isBusyError(error: unknown): boolean {
  return (
    (error as any)?.code === "SQLITE_BUSY" ||
    (error as any)?.code === "SQLITE_LOCKED"
  );
}
```

## SQLiteのトランザクションモード

| モード          | ロック動作                     | 用途                       |
| --------------- | ------------------------------ | -------------------------- |
| BEGIN DEFERRED  | 最初のSELECTで共有ロック       | 読み取り中心（デフォルト） |
| BEGIN IMMEDIATE | 即座に予約ロックを取得         | 書き込み予定あり           |
| BEGIN EXCLUSIVE | 即座に排他ロックを取得         | 大量の書き込み             |
| WALモード       | 読み取りと書き込みの並行性向上 | 高パフォーマンス           |

### WALモードの設定

```sql
-- WAL（Write-Ahead Logging）モード有効化
PRAGMA journal_mode = WAL;

-- WALモードでは読み取りと書き込みがブロックしない
```

**WALモードのメリット**:

- 読み取りと書き込みがブロックしない
- パフォーマンス向上
- データの整合性保持

```typescript
// WALモード設定例
await db.run("PRAGMA journal_mode = WAL");
await db.run("PRAGMA busy_timeout = 5000");

// ジョブキューの実装例
async function pickNextJob() {
  return await withBusyRetry(async () => {
    await db.run("BEGIN IMMEDIATE");

    try {
      const job = await db.get(
        "SELECT * FROM jobs WHERE status = 'pending' LIMIT 1",
      );

      if (!job) {
        await db.run("ROLLBACK");
        return null;
      }

      await db.run("UPDATE jobs SET status = 'processing' WHERE id = ?", [
        job.id,
      ]);

      await db.run("COMMIT");
      return job;
    } catch (error) {
      await db.run("ROLLBACK");
      throw error;
    }
  });
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
- [ ] 悲観的ロックの場合、SQLITE_BUSY対策があるか？
- [ ] busyタイムアウトは適切に設定されているか？
- [ ] タイムアウトは設定されているか？
- [ ] リトライロジックは実装されているか？
