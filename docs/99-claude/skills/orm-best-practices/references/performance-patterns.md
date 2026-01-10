# パフォーマンスパターン

## 接続プール管理

### libSQL/Turso接続設定

```typescript
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

// HTTP接続（サーバーレス向け）
const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client);
```

### ローカルSQLite接続

```typescript
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

// ローカルSQLiteファイル
const sqlite = new Database("./sqlite.db");
export const db = drizzle(sqlite);
```

### 接続設定の推奨

| 環境           | 推奨方法                  | 備考             |
| -------------- | ------------------------- | ---------------- |
| 開発           | better-sqlite3            | ローカルファイル |
| サーバーレス   | libSQL HTTP               | エッジ対応       |
| 本番（小規模） | libSQL                    | Turso推奨        |
| 本番（大規模） | libSQL + レプリケーション | 読み取り分散     |

## N+1問題の解消

### 問題パターン

```typescript
// ❌ N+1問題
const workflows = await db.select().from(workflows);
for (const workflow of workflows) {
  // N回のクエリが発生
  workflow.steps = await db
    .select()
    .from(workflowSteps)
    .where(eq(workflowSteps.workflowId, workflow.id));
}
```

### 解決策1: JOINを使用

```typescript
// ✅ 1回のクエリ
const results = await db
  .select()
  .from(workflows)
  .leftJoin(workflowSteps, eq(workflows.id, workflowSteps.workflowId))
  .where(eq(workflows.status, "ACTIVE"));

// 結果を整形
const workflowMap = new Map<number, WorkflowWithSteps>();
for (const row of results) {
  if (!workflowMap.has(row.workflows.id)) {
    workflowMap.set(row.workflows.id, {
      ...row.workflows,
      steps: [],
    });
  }
  if (row.workflow_steps) {
    workflowMap.get(row.workflows.id)!.steps.push(row.workflow_steps);
  }
}
```

### 解決策2: リレーションクエリ

```typescript
// ✅ Drizzleが最適化
const workflowsWithSteps = await db.query.workflows.findMany({
  where: eq(workflows.status, "ACTIVE"),
  with: {
    steps: true,
  },
});
```

### 解決策3: バッチフェッチ

```typescript
// ✅ 2回のクエリで済む
const workflows = await db.select().from(workflows).where(...);
const workflowIds = workflows.map((w) => w.id);

const allSteps = await db
  .select()
  .from(workflowSteps)
  .where(inArray(workflowSteps.workflowId, workflowIds));

const stepMap = Map.groupBy(allSteps, (s) => s.workflowId);
workflows.forEach((w) => (w.steps = stepMap.get(w.id) ?? []));
```

## 選択的カラム取得

### 必要なカラムのみ

```typescript
// ❌ すべてのカラム
const workflows = await db.select().from(workflows);

// ✅ 必要なカラムのみ
const summaries = await db
  .select({
    id: workflows.id,
    name: workflows.name,
    status: workflows.status,
  })
  .from(workflows);
```

### 大きなカラムの除外

```typescript
// JSONやTEXTなど大きなカラムを除外
const lightWorkflows = await db
  .select({
    id: workflows.id,
    name: workflows.name,
    status: workflows.status,
    // inputPayload, outputPayloadは除外
  })
  .from(workflows);
```

### リレーションクエリでの選択

```typescript
const workflowsWithUser = await db.query.workflows.findMany({
  columns: {
    id: true,
    name: true,
    status: true,
  },
  with: {
    user: {
      columns: {
        id: true,
        name: true,
        // email, passwordHashは除外
      },
    },
  },
});
```

## バッチ操作

### 一括挿入

```typescript
// ❌ 個別挿入
for (const step of steps) {
  await db.insert(workflowSteps).values(step);
}

// ✅ 一括挿入
await db.insert(workflowSteps).values(steps);
```

### チャンク処理

```typescript
// 大量データは分割して処理
async function batchInsert<T>(
  table: SQLiteTable,
  records: T[],
  chunkSize = 1000,
): Promise<void> {
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    await db.insert(table).values(chunk);
  }
}
```

### 一括更新

```typescript
// CASE文を使用した一括更新
const updates = [
  { id: 1, status: "COMPLETED" },
  { id: 2, status: "FAILED" },
  { id: 3, status: "COMPLETED" },
];

await db.run(sql`
  UPDATE ${workflows}
  SET status = CASE id
    ${sql.join(
      updates.map((u) => sql`WHEN ${u.id} THEN ${u.status}`),
      sql` `,
    )}
  END
  WHERE id IN (${sql.join(
    updates.map((u) => u.id),
    sql`, `,
  )})
`);
```

## Prepared Statements

### 頻繁なクエリの最適化

```typescript
// Prepared Statement作成
const getWorkflowById = db
  .select()
  .from(workflows)
  .where(eq(workflows.id, sql.placeholder("id")))
  .prepare();

const getWorkflowsByStatus = db
  .select()
  .from(workflows)
  .where(eq(workflows.status, sql.placeholder("status")))
  .limit(sql.placeholder("limit"))
  .offset(sql.placeholder("offset"))
  .prepare();

// 使用
const workflow = await getWorkflowById.execute({ id: workflowId });
const activeWorkflows = await getWorkflowsByStatus.execute({
  status: "ACTIVE",
  limit: 20,
  offset: 0,
});
```

### Prepared Statementの利点

| 利点                    | 説明                            |
| ----------------------- | ------------------------------- |
| クエリ解析の省略        | 2回目以降は解析済みプランを使用 |
| SQLインジェクション防止 | パラメータは安全にエスケープ    |
| 型安全性                | パラメータ型がチェックされる    |

## インデックス活用

### クエリに合わせたインデックス

```typescript
// よく使うクエリパターン
const activeWorkflows = await db
  .select()
  .from(workflows)
  .where(and(eq(workflows.userId, userId), eq(workflows.status, "ACTIVE")))
  .orderBy(desc(workflows.createdAt));

// 対応するインデックス
export const workflows = sqliteTable(
  "workflows",
  {
    // ...columns
  },
  (table) => ({
    userStatusIdx: index("workflows_user_status_idx").on(
      table.userId,
      table.status,
    ),
    createdAtIdx: index("workflows_created_at_idx").on(table.createdAt),
  }),
);
```

### 部分インデックス

```typescript
// アクティブなレコードのみインデックス
export const workflows = sqliteTable(
  "workflows",
  {
    // ...columns
  },
  (table) => ({
    activeIdx: index("workflows_active_idx")
      .on(table.userId)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);
```

### カバリングインデックス

```typescript
// クエリのすべてのカラムを含むインデックス
// インデックスオンリースキャンが可能
export const workflows = sqliteTable(
  "workflows",
  {
    // ...columns
  },
  (table) => ({
    listIdx: index("workflows_list_idx").on(
      table.status,
      table.createdAt,
      table.id,
      table.name,
    ),
  }),
);
```

## クエリ監視

### クエリログの有効化

```typescript
import { drizzle } from "drizzle-orm/libsql";

const db = drizzle(client, {
  logger: {
    logQuery: (query, params) => {
      console.log("Query:", query);
      console.log("Params:", params);
    },
  },
});
```

### 実行時間の計測

```typescript
// クエリ実行時間を計測するミドルウェア
async function measureQuery<T>(
  name: string,
  queryFn: () => Promise<T>,
): Promise<T> {
  const start = performance.now();
  try {
    return await queryFn();
  } finally {
    const duration = performance.now() - start;
    console.log(`Query [${name}]: ${duration.toFixed(2)}ms`);

    if (duration > 100) {
      console.warn(`Slow query detected: ${name}`);
    }
  }
}

// 使用
const workflows = await measureQuery("getActiveWorkflows", () =>
  db.select().from(workflows).where(eq(workflows.status, "ACTIVE")),
);
```

### クエリ数の監視

```typescript
class QueryCounter {
  private count = 0;

  increment() {
    this.count++;
  }

  get() {
    return this.count;
  }

  reset() {
    this.count = 0;
  }
}

// リクエストごとにカウント
export function createQueryCounterMiddleware() {
  return async (ctx: Context, next: Next) => {
    const counter = new QueryCounter();
    ctx.queryCounter = counter;

    await next();

    const queryCount = counter.get();
    if (queryCount > 10) {
      console.warn(`High query count: ${queryCount} queries in single request`);
    }
  };
}
```

## キャッシング戦略

### 結果キャッシュ

```typescript
import { LRUCache } from "lru-cache";

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5分
});

async function getCachedWorkflow(id: number): Promise<Workflow | null> {
  const cacheKey = `workflow:${id}`;

  // キャッシュチェック
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // DBから取得
  const workflow = await db.query.workflows.findFirst({
    where: eq(workflows.id, id),
  });

  // キャッシュに保存
  if (workflow) {
    cache.set(cacheKey, workflow);
  }

  return workflow;
}

// キャッシュ無効化
function invalidateWorkflowCache(id: number) {
  cache.delete(`workflow:${id}`);
}
```

### クエリキャッシュ

```typescript
// 頻繁に実行されるクエリの結果をキャッシュ
async function getActiveWorkflowCount(): Promise<number> {
  const cacheKey = "active_workflow_count";
  const cached = cache.get(cacheKey);

  if (cached !== undefined) {
    return cached;
  }

  const [{ count }] = await db
    .select({ count: count() })
    .from(workflows)
    .where(eq(workflows.status, "ACTIVE"));

  cache.set(cacheKey, count, { ttl: 1000 * 60 }); // 1分
  return count;
}
```

## チェックリスト

### 接続管理

- [ ] 環境に適した接続方法を使用しているか？
- [ ] ローカル開発ではbetter-sqlite3を使用しているか？
- [ ] サーバーレスではlibSQL HTTPを使用しているか？

### クエリ最適化

- [ ] N+1問題は解消されているか？
- [ ] 必要なカラムのみ取得しているか？
- [ ] 頻繁なクエリはprepareしているか？
- [ ] バッチ操作を活用しているか？

### 監視

- [ ] クエリログは有効か？
- [ ] 実行時間を計測しているか？
- [ ] スロークエリを検出しているか？
