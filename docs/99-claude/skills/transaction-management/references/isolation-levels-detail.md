# SQLite トランザクションモード詳細リファレンス

## 概要

SQLiteのトランザクションモードの詳細な動作と、各モードで発生する/防止される現象について解説します。

---

## トランザクションモード比較表

| トランザクションモード | Dirty Read | Non-repeatable Read | Phantom Read | ロック取得タイミング   |
| ---------------------- | ---------- | ------------------- | ------------ | ---------------------- |
| BEGIN DEFERRED         | 防止       | 可能                | 可能         | 最初のSELECT時         |
| BEGIN IMMEDIATE        | 防止       | 防止                | 防止         | トランザクション開始時 |
| BEGIN EXCLUSIVE        | 防止       | 防止                | 防止         | トランザクション開始時 |

**注意**: SQLiteは常にシリアライズ可能な動作を保証します。

---

## 1. BEGIN DEFERRED（デフォルト）

### 動作

- トランザクション開始時はロックを取得しない
- 最初のSELECT時に共有ロック取得
- 最初のINSERT/UPDATE/DELETE時に予約ロックから排他ロックへアップグレード
- 他のトランザクションの影響を受ける可能性がある

### 発生する現象

#### Non-repeatable Read（反復不能読み取り）

```sql
-- トランザクション A
BEGIN; -- DEFERRED
SELECT balance FROM accounts WHERE id = 1;  -- 結果: 1000

-- トランザクション B（この間に実行）
BEGIN IMMEDIATE;
UPDATE accounts SET balance = 500 WHERE id = 1;
COMMIT;

-- トランザクション A（続き）
SELECT balance FROM accounts WHERE id = 1;  -- 結果: 500（変わった！）
COMMIT;
```

### 使用場面

- 読み取り専用トランザクション
- 書き込みの可能性が低い場合
- 軽量なトランザクション

### TypeScript例

```typescript
// BEGIN DEFERREDはデフォルト
async function getWorkflow(id: string) {
  await db.run("BEGIN"); // デフォルトでDEFERRED

  try {
    const workflow = await db.get("SELECT * FROM workflows WHERE id = ?", [id]);
    await db.run("COMMIT");
    return workflow;
  } catch (error) {
    await db.run("ROLLBACK");
    throw error;
  }
}
```

---

## 2. BEGIN IMMEDIATE

### 動作

- トランザクション開始時に予約ロックを取得
- 他の書き込みトランザクションをブロック
- 読み取りトランザクションは継続可能
- 書き込み時に排他ロックへアップグレード

### 防止される現象

```sql
-- トランザクション A
BEGIN IMMEDIATE;
SELECT balance FROM accounts WHERE id = 1;  -- 結果: 1000

-- トランザクション B（この間に実行を試みる）
BEGIN IMMEDIATE; -- SQLITE_BUSYエラーで待機

-- トランザクション A（続き）
UPDATE accounts SET balance = 500 WHERE id = 1;
SELECT balance FROM accounts WHERE id = 1;  -- 結果: 500（一貫性保持）
COMMIT;

-- トランザクション B（Aのコミット後に実行可能）
-- ...
```

### 使用場面

- 書き込みを含むトランザクション（推奨）
- 一貫性が重要な操作
- 書き込み競合を早期に検出したい場合

### TypeScript例

```typescript
async function updateWorkflow(id: string, data: Partial<Workflow>) {
  await db.run("BEGIN IMMEDIATE"); // 予約ロック取得

  try {
    const workflow = await db.get("SELECT * FROM workflows WHERE id = ?", [id]);

    if (!workflow) {
      await db.run("ROLLBACK");
      throw new Error("Workflow not found");
    }

    await db.run("UPDATE workflows SET name = ?, updated_at = ? WHERE id = ?", [
      data.name,
      new Date(),
      id,
    ]);

    await db.run("COMMIT");
  } catch (error) {
    await db.run("ROLLBACK");
    throw error;
  }
}
```

---

## 3. BEGIN EXCLUSIVE

### 動作

- トランザクション開始時に排他ロックを取得
- すべての読み取り・書き込みトランザクションをブロック
- 最も厳格なロックモード
- 大量の書き込み処理に適している

### 使用場面

- 大量データの一括更新
- データベースメンテナンス
- スキーマ変更
- バックアップ処理

### TypeScript例

```typescript
async function batchImport(records: Record[]) {
  await db.run("BEGIN EXCLUSIVE"); // 排他ロック取得

  try {
    for (const record of records) {
      await db.run(
        "INSERT INTO workflows (id, name, created_at) VALUES (?, ?, ?)",
        [record.id, record.name, new Date()],
      );
    }

    await db.run("COMMIT");
  } catch (error) {
    await db.run("ROLLBACK");
    throw error;
  }
}
```

---

## WALモード（Write-Ahead Logging）

### 概要

WALモードはSQLiteのジャーナルモードの一つで、並行性を大幅に向上させます。

### 動作

- 書き込みは別ファイル（WALファイル）に記録
- 読み取りと書き込みがブロックしない
- 読み取りトランザクションは一貫したスナップショットを参照

### 設定

```sql
PRAGMA journal_mode = WAL;
```

### メリット

- 読み取りと書き込みの並行性向上
- 読み取りトランザクションが書き込みをブロックしない
- パフォーマンス向上

### デメリット

- 複数ファイルの管理が必要（DB、WAL、SHM）
- ネットワークファイルシステムでは使用不可

### TypeScript例

```typescript
async function enableWAL(db: Database) {
  await db.run("PRAGMA journal_mode = WAL");
  await db.run("PRAGMA busy_timeout = 5000");

  console.log("WAL mode enabled");
}

// WALモードでの並行処理
async function concurrentOperations() {
  // 読み取りと書き込みが同時に実行可能
  const readPromise = db.get("SELECT COUNT(*) FROM workflows");
  const writePromise = db.run(
    "INSERT INTO workflows (id, name) VALUES (?, ?)",
    [uuid(), "New Workflow"],
  );

  const [readResult, writeResult] = await Promise.all([
    readPromise,
    writePromise,
  ]);
}
```

---

## トランザクションモード選択フローチャート

```
トランザクション要件は？
│
├─ 読み取りのみ
│   └─ BEGIN DEFERRED
│   └─ 例: レポート生成、データ参照
│
├─ 書き込みあり、競合少ない
│   └─ BEGIN IMMEDIATE（推奨）
│   └─ 例: 一般的なCRUD操作
│
├─ 書き込みあり、競合多い
│   └─ BEGIN IMMEDIATE + リトライロジック
│   └─ 例: 高負荷アプリケーション
│
├─ 大量の書き込み
│   └─ BEGIN EXCLUSIVE
│   └─ 例: バッチ処理、データインポート
│
└─ 高い並行性が必要
    └─ WALモード + BEGIN IMMEDIATE
    └─ 例: マルチユーザーアプリケーション
```

---

## SQLITE_BUSY対策

### 問題

複数のトランザクションが同時に書き込みを試みるとSQLITE_BUSYエラーが発生します。

### 対策

#### 1. busy_timeout設定

```sql
PRAGMA busy_timeout = 5000; -- 5秒待機
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
      if (
        ((error as any)?.code === "SQLITE_BUSY" ||
          (error as any)?.code === "SQLITE_LOCKED") &&
        attempt < maxRetries
      ) {
        await sleep(Math.pow(2, attempt) * 100 + Math.random() * 50);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}
```

---

## ベストプラクティス

1. **書き込み時はBEGIN IMMEDIATE**: 競合を早期に検出
2. **WALモード有効化**: 並行性が重要な場合
3. **busy_timeout設定**: SQLITE_BUSYエラーを軽減
4. **リトライロジック実装**: 高負荷時の信頼性向上
5. **トランザクション時間を最小化**: ロック時間を短くする
6. **適切なインデックス**: クエリパフォーマンスを向上

---

## パフォーマンス影響

| モード          | 読み取り並行性 | 書き込み並行性 | 適用場面       |
| --------------- | -------------- | -------------- | -------------- |
| BEGIN DEFERRED  | 高             | 低             | 読み取り専用   |
| BEGIN IMMEDIATE | 高             | 低             | 通常の書き込み |
| BEGIN EXCLUSIVE | なし           | なし           | 大量書き込み   |
| WAL + IMMEDIATE | 非常に高       | 中             | 高並行性アプリ |

---

## 実践例：ワークフロー管理システム

```typescript
// WALモード初期化
await db.run("PRAGMA journal_mode = WAL");
await db.run("PRAGMA busy_timeout = 5000");

// 読み取り専用操作
async function listWorkflows() {
  // DEFERREDで十分
  await db.run("BEGIN");
  try {
    const workflows = await db.all("SELECT * FROM workflows");
    await db.run("COMMIT");
    return workflows;
  } catch (error) {
    await db.run("ROLLBACK");
    throw error;
  }
}

// 書き込み操作（推奨パターン）
async function createWorkflow(data: WorkflowInput) {
  return await withBusyRetry(async () => {
    await db.run("BEGIN IMMEDIATE");

    try {
      const result = await db.run(
        "INSERT INTO workflows (id, name, created_at) VALUES (?, ?, ?)",
        [uuid(), data.name, new Date()],
      );

      await db.run("COMMIT");
      return result;
    } catch (error) {
      await db.run("ROLLBACK");
      throw error;
    }
  });
}

// 大量データインポート
async function bulkImport(workflows: WorkflowInput[]) {
  await db.run("BEGIN EXCLUSIVE");

  try {
    for (const workflow of workflows) {
      await db.run(
        "INSERT INTO workflows (id, name, created_at) VALUES (?, ?, ?)",
        [uuid(), workflow.name, new Date()],
      );
    }

    await db.run("COMMIT");
  } catch (error) {
    await db.run("ROLLBACK");
    throw error;
  }
}
```
