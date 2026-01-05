# ロールバックパターン

## ロールバックとは

トランザクションが失敗または中断された際に、データベースを操作前の状態に戻すこと。
ACID特性の原子性を実現する重要な機能。

## 基本ロールバックパターン

### 自動ロールバック

**概念**: 例外発生時にフレームワーク/ORMが自動でロールバック

**実装**:

```typescript
// Drizzle ORM の自動ロールバック
async function createWorkflow(data: WorkflowInput) {
  // トランザクション内で例外が発生すると自動ロールバック
  await db.transaction(async (tx) => {
    const [workflow] = await tx.insert(workflows).values(data).returning();

    if (!workflow) {
      throw new Error("Failed to create workflow"); // 自動ロールバック
    }

    await tx.insert(workflowHistory).values({
      workflowId: workflow.id,
      action: "CREATED",
    });

    // トランザクション終了時に自動コミット
  });
}
```

**メリット**:

- 明示的なロールバック呼び出しが不要
- 例外処理漏れを防止
- コードがシンプル

### 明示的ロールバック

**概念**: 条件に基づいて手動でロールバックを実行

**実装**:

```typescript
async function processOrder(orderId: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const order = await client.query("SELECT * FROM orders WHERE id = $1", [
      orderId,
    ]);

    if (order.rows[0].status === "CANCELLED") {
      await client.query("ROLLBACK"); // 明示的ロールバック
      return { success: false, reason: "Order already cancelled" };
    }

    await client.query("UPDATE orders SET status = $1 WHERE id = $2", [
      "PROCESSING",
      orderId,
    ]);
    await client.query("COMMIT");

    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK"); // エラー時も明示的ロールバック
    throw error;
  } finally {
    client.release();
  }
}
```

**使用場面**:

- ビジネスロジックに基づく条件付きロールバック
- 低レベルDBアクセス
- 細かい制御が必要な場合

## 高度なロールバックパターン

### セーブポイント

**概念**: トランザクション内に復帰ポイントを設定し、部分ロールバックを可能にする

**実装**:

```typescript
async function batchProcess(items: Item[]) {
  await db.transaction(async (tx) => {
    for (const item of items) {
      // セーブポイント設定
      await tx.execute(sql`SAVEPOINT item_${item.id}`);

      try {
        await processItem(tx, item);
      } catch (error) {
        // セーブポイントまでロールバック
        await tx.execute(sql`ROLLBACK TO SAVEPOINT item_${item.id}`);

        // エラーを記録して継続
        await tx.insert(processErrors).values({
          itemId: item.id,
          error: error.message,
        });
      }
    }

    // 成功した処理はコミットされる
  });
}
```

**使用場面**:

- バッチ処理で一部失敗を許容
- 部分的な処理継続が必要
- エラーをログに残しつつ処理を続行

### ネストトランザクション

**概念**: トランザクション内で別のトランザクションを開始（実際はセーブポイント）

**注意**: SQLiteはネストトランザクションを直接サポートしない。
セーブポイントで同様の効果を実現。

**実装**:

```typescript
async function nestedOperation(db: Database) {
  // 擬似ネストトランザクション（実際はセーブポイント）
  const savepoint = `nested_${Date.now()}`;
  await db.run(`SAVEPOINT ${savepoint}`);

  try {
    // ネスト内の操作
    await db.run("UPDATE accounts SET balance = ? WHERE id = ?", [
      newBalance,
      accountId,
    ]);
    await db.run(`RELEASE SAVEPOINT ${savepoint}`);
  } catch (error) {
    await db.run(`ROLLBACK TO SAVEPOINT ${savepoint}`);
    throw error;
  }
}
```

## 補償トランザクション（Saga）

### 概念

分散システムで使用するパターン。各操作に対して「取り消し操作（補償）」を定義し、
失敗時に逆順で補償を実行。

### 実装パターン

```typescript
interface SagaStep<T> {
  execute: (context: T) => Promise<void>;
  compensate: (context: T) => Promise<void>;
}

class Saga<T> {
  private steps: SagaStep<T>[] = [];
  private executedSteps: SagaStep<T>[] = [];

  addStep(step: SagaStep<T>): this {
    this.steps.push(step);
    return this;
  }

  async execute(context: T): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.execute(context);
        this.executedSteps.push(step);
      } catch (error) {
        await this.rollback(context);
        throw error;
      }
    }
  }

  private async rollback(context: T): Promise<void> {
    // 逆順で補償を実行
    for (const step of this.executedSteps.reverse()) {
      try {
        await step.compensate(context);
      } catch (compensateError) {
        // 補償失敗をログに記録
        console.error("Compensation failed:", compensateError);
      }
    }
  }
}
```

### 使用例

```typescript
const orderSaga = new Saga<OrderContext>()
  .addStep({
    execute: async (ctx) => {
      ctx.orderId = await createOrder(ctx.orderData)
    },
    compensate: async (ctx) => {
      await cancelOrder(ctx.orderId)
    },
  })
  .addStep({
    execute: async (ctx) => {
      await reserveInventory(ctx.orderId, ctx.items)
    },
    compensate: async (ctx) => {
      await releaseInventory(ctx.orderId, ctx.items)
    },
  })
  .addStep({
    execute: async (ctx) => {
      await processPayment(ctx.orderId, ctx.amount)
    },
    compensate: async (ctx) => {
      await refundPayment(ctx.orderId, ctx.amount)
    },
  })

// 実行
try {
  await orderSaga.execute({
    orderData: { ... },
    items: [...],
    amount: 1000,
  })
} catch (error) {
  // Sagaが自動的に補償を実行済み
  console.error('Order failed, compensations executed:', error)
}
```

### Sagaの使用場面

- マイクロサービス間の分散トランザクション
- 長時間トランザクション
- 外部サービス呼び出しを含む操作

## エラーハンドリングパターン

### 基本パターン

```typescript
async function safeTransaction<T>(
  operation: (tx: Transaction) => Promise<T>,
): Promise<Result<T, TransactionError>> {
  try {
    const result = await db.transaction(operation);
    return { success: true, data: result };
  } catch (error) {
    // 自動ロールバック済み
    return {
      success: false,
      error: categorizeError(error),
    };
  }
}

function categorizeError(error: unknown): TransactionError {
  const sqliteError = error as { code?: string; message?: string };

  switch (sqliteError.code) {
    case "SQLITE_CONSTRAINT":
      if (sqliteError.message?.includes("UNIQUE")) {
        return { type: "DUPLICATE", message: "Record already exists" };
      }
      if (sqliteError.message?.includes("FOREIGN KEY")) {
        return { type: "REFERENCE", message: "Referenced record not found" };
      }
      return { type: "CONSTRAINT", message: "Constraint violation" };
    case "SQLITE_BUSY":
      return {
        type: "BUSY",
        message: "Database is locked",
        retryable: true,
      };
    case "SQLITE_LOCKED":
      return {
        type: "LOCKED",
        message: "Table is locked",
        retryable: true,
      };
    default:
      return {
        type: "UNKNOWN",
        message: sqliteError.message || "Unknown error",
      };
  }
}
```

### リトライ付きトランザクション

```typescript
async function transactionWithRetry<T>(
  operation: (tx: Transaction) => Promise<T>,
  options: { maxRetries?: number; backoff?: number } = {},
): Promise<T> {
  const { maxRetries = 3, backoff = 100 } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await db.transaction(operation);
    } catch (error) {
      const categorized = categorizeError(error);

      if (!categorized.retryable || attempt >= maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = backoff * Math.pow(2, attempt) + Math.random() * 50;
      await sleep(delay);
    }
  }

  throw new Error("Max retries exceeded");
}
```

## ロールバック後の処理

### クリーンアップパターン

```typescript
async function operationWithCleanup() {
  const tempFiles: string[] = [];

  try {
    await db.transaction(async (tx) => {
      // ファイルを作成
      const filePath = await createTempFile();
      tempFiles.push(filePath);

      // DB操作
      await tx.insert(files).values({ path: filePath });

      // さらに処理...
    });
  } catch (error) {
    // トランザクション失敗時、作成したファイルを削除
    for (const file of tempFiles) {
      await fs.unlink(file).catch(() => {});
    }
    throw error;
  }
}
```

### 通知パターン

```typescript
async function operationWithNotification(data: OperationData) {
  let operationStarted = false

  try {
    await db.transaction(async (tx) => {
      operationStarted = true

      // 操作実行
      await tx.update(...)
    })

    // 成功通知（トランザクション外）
    await notifySuccess(data)
  } catch (error) {
    if (operationStarted) {
      // 失敗通知（トランザクション外）
      await notifyFailure(data, error)
    }
    throw error
  }
}
```

## チェックリスト

### 実装時

- [ ] 例外発生時にロールバックされるか？
- [ ] 明示的ロールバックが必要な条件があるか？
- [ ] セーブポイントが必要な場面があるか？
- [ ] 分散システムの場合、Sagaパターンを検討したか？

### エラーハンドリング

- [ ] エラーの種類を分類しているか？
- [ ] リトライ可能なエラーを識別しているか？
- [ ] リトライロジックが実装されているか？

### クリーンアップ

- [ ] トランザクション外リソースのクリーンアップがあるか？
- [ ] 通知/ログの処理が適切か？
