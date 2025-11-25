# クエリビルダーパターン

## 基本操作

### SELECT

```typescript
import { db } from '@/db'
import { workflows } from '@/db/schema'
import { eq, and, or, like, gt, lt, isNull, isNotNull, inArray } from 'drizzle-orm'

// 全件取得
const allWorkflows = await db.select().from(workflows)

// 特定カラムのみ取得
const summaries = await db
  .select({
    id: workflows.id,
    name: workflows.name,
    status: workflows.status,
  })
  .from(workflows)

// 条件付き取得
const activeWorkflows = await db
  .select()
  .from(workflows)
  .where(eq(workflows.status, 'ACTIVE'))

// 複数条件（AND）
const userActiveWorkflows = await db
  .select()
  .from(workflows)
  .where(
    and(
      eq(workflows.userId, userId),
      eq(workflows.status, 'ACTIVE')
    )
  )

// 複数条件（OR）
const draftOrActive = await db
  .select()
  .from(workflows)
  .where(
    or(
      eq(workflows.status, 'DRAFT'),
      eq(workflows.status, 'ACTIVE')
    )
  )
```

### INSERT

```typescript
// 単一レコード挿入
const [newWorkflow] = await db
  .insert(workflows)
  .values({
    name: 'My Workflow',
    status: 'DRAFT',
  })
  .returning()

// 複数レコード挿入
const newWorkflows = await db
  .insert(workflows)
  .values([
    { name: 'Workflow 1', status: 'DRAFT' },
    { name: 'Workflow 2', status: 'DRAFT' },
  ])
  .returning()

// ON CONFLICT（UPSERT）
await db
  .insert(workflows)
  .values({ id: existingId, name: 'Updated Name' })
  .onConflictDoUpdate({
    target: workflows.id,
    set: { name: 'Updated Name', updatedAt: new Date() },
  })

// ON CONFLICT DO NOTHING
await db
  .insert(workflows)
  .values({ name: 'Unique Name' })
  .onConflictDoNothing({ target: workflows.name })
```

### UPDATE

```typescript
// 条件付き更新
await db
  .update(workflows)
  .set({
    status: 'COMPLETED',
    updatedAt: new Date(),
  })
  .where(eq(workflows.id, workflowId))

// 既存値を使用した更新
await db
  .update(workflows)
  .set({
    retryCount: sql`${workflows.retryCount} + 1`,
  })
  .where(eq(workflows.id, workflowId))

// 更新結果を取得
const [updated] = await db
  .update(workflows)
  .set({ status: 'ACTIVE' })
  .where(eq(workflows.id, workflowId))
  .returning()
```

### DELETE

```typescript
// 条件付き削除
await db
  .delete(workflows)
  .where(eq(workflows.id, workflowId))

// 削除結果を取得
const [deleted] = await db
  .delete(workflows)
  .where(eq(workflows.id, workflowId))
  .returning()

// 複数条件での削除
await db
  .delete(workflows)
  .where(
    and(
      eq(workflows.status, 'ARCHIVED'),
      lt(workflows.updatedAt, oneYearAgo)
    )
  )
```

## 条件演算子

### 比較演算子

```typescript
import { eq, ne, gt, gte, lt, lte, between } from 'drizzle-orm'

// 等価・非等価
eq(workflows.status, 'ACTIVE')     // status = 'ACTIVE'
ne(workflows.status, 'ARCHIVED')   // status != 'ARCHIVED'

// 大小比較
gt(workflows.priority, 5)          // priority > 5
gte(workflows.priority, 5)         // priority >= 5
lt(workflows.priority, 10)         // priority < 10
lte(workflows.priority, 10)        // priority <= 10

// 範囲
between(workflows.priority, 1, 10) // priority BETWEEN 1 AND 10
```

### 文字列演算子

```typescript
import { like, ilike, notLike } from 'drizzle-orm'

// LIKE（大文字小文字区別）
like(workflows.name, '%test%')     // name LIKE '%test%'

// ILIKE（大文字小文字無視、PostgreSQL）
ilike(workflows.name, '%test%')    // name ILIKE '%test%'

// NOT LIKE
notLike(workflows.name, '%draft%')
```

### NULL演算子

```typescript
import { isNull, isNotNull } from 'drizzle-orm'

isNull(workflows.deletedAt)        // deleted_at IS NULL
isNotNull(workflows.description)   // description IS NOT NULL
```

### 配列演算子

```typescript
import { inArray, notInArray } from 'drizzle-orm'

// IN
inArray(workflows.status, ['DRAFT', 'ACTIVE'])

// NOT IN
notInArray(workflows.status, ['ARCHIVED', 'DELETED'])
```

## JOIN操作

### INNER JOIN

```typescript
const workflowsWithSteps = await db
  .select({
    workflow: workflows,
    step: workflowSteps,
  })
  .from(workflows)
  .innerJoin(
    workflowSteps,
    eq(workflows.id, workflowSteps.workflowId)
  )
```

### LEFT JOIN

```typescript
const workflowsWithOptionalSteps = await db
  .select({
    workflow: workflows,
    step: workflowSteps,
  })
  .from(workflows)
  .leftJoin(
    workflowSteps,
    eq(workflows.id, workflowSteps.workflowId)
  )
```

### 複数JOIN

```typescript
const fullWorkflows = await db
  .select({
    workflow: workflows,
    step: workflowSteps,
    user: users,
  })
  .from(workflows)
  .leftJoin(workflowSteps, eq(workflows.id, workflowSteps.workflowId))
  .innerJoin(users, eq(workflows.userId, users.id))
  .where(eq(workflows.status, 'ACTIVE'))
```

### リレーションを使用したクエリ

```typescript
// schema.tsでリレーション定義
export const workflowRelations = relations(workflows, ({ many, one }) => ({
  steps: many(workflowSteps),
  user: one(users, {
    fields: [workflows.userId],
    references: [users.id],
  }),
}))

// クエリでの使用
const workflowsWithRelations = await db.query.workflows.findMany({
  with: {
    steps: true,
    user: {
      columns: { id: true, name: true },
    },
  },
  where: eq(workflows.status, 'ACTIVE'),
})
```

## ソートとページネーション

### ORDER BY

```typescript
import { asc, desc } from 'drizzle-orm'

// 昇順
const sorted = await db
  .select()
  .from(workflows)
  .orderBy(asc(workflows.createdAt))

// 降順
const sortedDesc = await db
  .select()
  .from(workflows)
  .orderBy(desc(workflows.createdAt))

// 複数カラムでソート
const multiSorted = await db
  .select()
  .from(workflows)
  .orderBy(
    desc(workflows.priority),
    asc(workflows.name)
  )
```

### LIMIT / OFFSET

```typescript
// ページネーション
const page = 1
const pageSize = 20

const pagedWorkflows = await db
  .select()
  .from(workflows)
  .orderBy(desc(workflows.createdAt))
  .limit(pageSize)
  .offset((page - 1) * pageSize)
```

### カーソルベースページネーション

```typescript
// より効率的なページネーション
const getWorkflowsAfter = async (cursor: string | null, limit: number) => {
  const query = db
    .select()
    .from(workflows)
    .orderBy(desc(workflows.createdAt))
    .limit(limit + 1)  // 次ページ有無確認のため+1

  if (cursor) {
    query.where(lt(workflows.createdAt, new Date(cursor)))
  }

  const results = await query
  const hasNext = results.length > limit

  return {
    data: results.slice(0, limit),
    nextCursor: hasNext ? results[limit - 1].createdAt.toISOString() : null,
  }
}
```

## 集計クエリ

### COUNT

```typescript
import { count, countDistinct } from 'drizzle-orm'

// 総件数
const [{ total }] = await db
  .select({ total: count() })
  .from(workflows)

// 条件付きカウント
const [{ activeCount }] = await db
  .select({ activeCount: count() })
  .from(workflows)
  .where(eq(workflows.status, 'ACTIVE'))

// DISTINCT カウント
const [{ uniqueUsers }] = await db
  .select({ uniqueUsers: countDistinct(workflows.userId) })
  .from(workflows)
```

### SUM / AVG / MIN / MAX

```typescript
import { sum, avg, min, max } from 'drizzle-orm'

const [stats] = await db
  .select({
    totalPriority: sum(workflows.priority),
    avgPriority: avg(workflows.priority),
    minPriority: min(workflows.priority),
    maxPriority: max(workflows.priority),
  })
  .from(workflows)
```

### GROUP BY

```typescript
const statusCounts = await db
  .select({
    status: workflows.status,
    count: count(),
  })
  .from(workflows)
  .groupBy(workflows.status)

// HAVING
const popularStatuses = await db
  .select({
    status: workflows.status,
    count: count(),
  })
  .from(workflows)
  .groupBy(workflows.status)
  .having(gt(count(), 10))
```

## 高度なクエリ

### サブクエリ

```typescript
// スカラーサブクエリ
const workflowsWithStepCount = await db
  .select({
    id: workflows.id,
    name: workflows.name,
    stepCount: db
      .select({ count: count() })
      .from(workflowSteps)
      .where(eq(workflowSteps.workflowId, workflows.id)),
  })
  .from(workflows)

// EXISTS サブクエリ
const workflowsWithSteps = await db
  .select()
  .from(workflows)
  .where(
    exists(
      db.select().from(workflowSteps)
        .where(eq(workflowSteps.workflowId, workflows.id))
    )
  )
```

### CASE文

```typescript
const workflowsWithPriorityLabel = await db
  .select({
    id: workflows.id,
    name: workflows.name,
    priorityLabel: sql<string>`
      CASE
        WHEN ${workflows.priority} >= 8 THEN 'HIGH'
        WHEN ${workflows.priority} >= 5 THEN 'MEDIUM'
        ELSE 'LOW'
      END
    `,
  })
  .from(workflows)
```

### UNION

```typescript
const combinedResults = await db
  .select({ id: workflows.id, name: workflows.name })
  .from(workflows)
  .where(eq(workflows.status, 'ACTIVE'))
  .union(
    db.select({ id: workflows.id, name: workflows.name })
      .from(workflows)
      .where(eq(workflows.priority, 10))
  )
```

## Prepared Statements

```typescript
// 頻繁に実行するクエリを事前準備
const getWorkflowById = db
  .select()
  .from(workflows)
  .where(eq(workflows.id, sql.placeholder('id')))
  .prepare('get_workflow_by_id')

// 実行
const workflow = await getWorkflowById.execute({ id: workflowId })

// パラメータ付きprepared statement
const getWorkflowsByStatus = db
  .select()
  .from(workflows)
  .where(eq(workflows.status, sql.placeholder('status')))
  .limit(sql.placeholder('limit'))
  .prepare('get_workflows_by_status')

const activeWorkflows = await getWorkflowsByStatus.execute({
  status: 'ACTIVE',
  limit: 10,
})
```

## チェックリスト

### クエリ実装時

- [ ] 必要なカラムのみ選択しているか？
- [ ] 適切なインデックスが使用されているか？
- [ ] N+1問題は発生していないか？
- [ ] ページネーションが必要か？

### パフォーマンス

- [ ] 頻繁なクエリはprepareしているか？
- [ ] JOINは必要最小限か？
- [ ] 大量データの一括取得を避けているか？
